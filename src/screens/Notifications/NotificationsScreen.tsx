import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types/models/notification';
import { theme } from '../../config/theme';
import NotificationsErrorBoundary from './ErrorBoundary';

// Components
import NotificationCard from './components/NotificationCard';
import EmptyState from './components/EmptyState';
import LoadingSkeleton from './components/LoadingSkeleton';
import TabBar from './components/TabBar';
import SearchBar from './components/SearchBar';

// Firebase
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../../config/firebase.config';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';

interface RootStackParamList {
  UserProfile: { screen: string; params?: { orderId: string } };
  LiveStream: { screen: string; params?: { streamId: string } };
  [key: string]: any; // Allow for other dynamic screens
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // Load notifications from Firestore
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    try {
      const q = query(
        collection(firestore, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const notificationData: Notification[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data && typeof data === 'object') {
              try {
                // Safely handle timestamp conversion
                const createdAt = data.createdAt || { toDate: () => new Date() };
                const readAt = data.readAt || undefined;
                
                notificationData.push({
                  id: doc.id,
                  userId: data.userId || user.uid,
                  title: data.title || 'Notification',
                  body: data.body || 'You have a new notification',
                  type: data.type || 'system',
                  isRead: Boolean(data.isRead),
                  createdAt: createdAt,
                  readAt: readAt,
                  data: data.data || {},
                  priority: data.priority || 'medium',
                  imageUrl: data.imageUrl || undefined,
                  actionUrl: data.actionUrl || undefined,
                } as Notification);
              } catch (error) {
                console.error('Error processing notification:', error, data);
              }
            }
          });
          setNotifications(notificationData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading notifications:', error);
          setNotifications([]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  // Filter notifications based on search and tab
  const applyFilters = useCallback(() => {
    if (!Array.isArray(notifications)) {
      setFilteredNotifications([]);
      return;
    }

    let filtered = [...notifications];

    // Apply tab filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => n && !n.isRead);
    }

    // Apply search filter
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        if (!n || typeof n !== 'object') return false;
        
        const title = n.title || '';
        const body = n.body || '';
        const orderId = n.data?.orderId || '';
        
        return title.toLowerCase().includes(query) ||
               body.toLowerCase().includes(query) ||
               orderId.toString().toLowerCase().includes(query);
      });
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchQuery]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Setup listener
  React.useEffect(() => {
    loadNotifications();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadNotifications]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(firestore, 'notifications', notificationId), {
        isRead: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (!Array.isArray(notifications)) return;
      
      const unreadNotifications = notifications.filter(n => n && !n.isRead);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(firestore);
      unreadNotifications.forEach((notif) => {
        if (notif?.id) {
          const notifRef = doc(firestore, 'notifications', notif.id);
          batch.update(notifRef, {
            isRead: true,
            readAt: new Date(),
          });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      setDeleting(prev => new Set(prev).add(notificationId));
      await deleteDoc(doc(firestore, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification. Please try again.');
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Bulk delete
  const deleteSelectedNotifications = async () => {
    if (!selectedNotifications || selectedNotifications.size === 0) return;

    try {
      const batch = writeBatch(firestore);
      selectedNotifications.forEach(id => {
        if (id && typeof id === 'string') {
          const notifRef = doc(firestore, 'notifications', id);
          batch.delete(notifRef);
        }
      });

      await batch.commit();
      setSelectedNotifications(new Set());
      setIsBulkMode(false);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
      Alert.alert('Error', 'Failed to delete notifications. Please try again.');
    }
  };

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification?.id) return;
    
    await markAsRead(notification.id);

    try {
      if (notification.data?.screen) {
        navigation.navigate(notification.data.screen, notification.data.params || {});
      } else {
        switch (notification.type) {
          case 'order':
            if (notification.data?.orderId) {
              navigation.navigate('UserProfile', {
                screen: 'MyOrders',
                params: { orderId: notification.data.orderId },
              });
            }
            break;
          case 'bid':
          case 'stream':
            if (notification.data?.streamId) {
              navigation.navigate('LiveStream', {
                screen: 'LiveStreamViewer',
                params: { streamId: notification.data.streamId },
              });
            }
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };

  // Handle bulk mode
  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // Memoized counts
  const counts = useMemo(() => {
    if (!Array.isArray(notifications)) {
      return { all: 0, unread: 0 };
    }
    
    const validNotifications = notifications.filter(n => n && typeof n === 'object');
    return {
      all: validNotifications.length,
      unread: validNotifications.filter(n => !n.isRead).length,
    };
  }, [notifications]);

  // Render functions
  const renderNotification = ({ item }: { item: unknown }) => {
    const notification = item as Notification;
    return (
      <NotificationCard
        notification={notification}
        onPress={() => handleNotificationPress(notification)}
        onMarkAsRead={() => markAsRead(notification.id)}
        onDelete={() => deleteNotification(notification.id)}
        isBulkMode={isBulkMode}
        isSelected={selectedNotifications.has(notification.id)}
        onToggleSelection={() => toggleSelection(notification.id)}
      />
    );
  };

  const renderHeader = () => (
    <Animated.View style={[
      styles.headerContainer,
      {
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslateY }],
      }
    ]}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {counts.unread > 0 ? `${counts.unread} unread` : 'All caught up!'}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              {isBulkMode ? (
                <View style={styles.bulkActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={deleteSelectedNotifications}
                    disabled={selectedNotifications.size === 0}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={24}
                      color={selectedNotifications.size > 0 ? 'white' : 'rgba(255,255,255,0.5)'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleBulkMode}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.headerActions}>
                  {counts.unread > 0 && (
                    <TouchableOpacity
                      style={styles.markAllButton}
                      onPress={markAllAsRead}
                    >
                      <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.bulkModeButton}
                    onPress={toggleBulkMode}
                  >
                    <MaterialCommunityIcons
                      name="checkbox-multiple-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search notifications..."
          />

          <TabBar
            activeTab={filter}
            onTabChange={setFilter}
            counts={counts}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const keyExtractor = (item: unknown) => (item as Notification).id;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.loadingHeader}
        >
          <View style={styles.loadingHeaderContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.loadingIndicator}>
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
            </View>
          </View>
        </LinearGradient>
        <LoadingSkeleton count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      <AnimatedFlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredNotifications.length === 0 && styles.emptyContainer
        ]}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {filteredNotifications.length === 0 && !loading && (
        <EmptyState filter={filter} onRefresh={onRefresh} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  markAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bulkModeButton: {
    padding: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.md,
  },
  loadingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  separator: {
    height: 0,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 25,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


const NotificationsScreenWithErrorBoundary: React.FC = () => {
  return (
    <NotificationsErrorBoundary>
      <NotificationsScreen />
    </NotificationsErrorBoundary>
  );
};

export default NotificationsScreenWithErrorBoundary;