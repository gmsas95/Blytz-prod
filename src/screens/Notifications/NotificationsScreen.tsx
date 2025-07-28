import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types/models/notification';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Notifications'
>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [user, loadNotifications]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('@react-native-firebase/firestore');
      const db = getFirestore();
      
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notificationData: Notification[] = [];
      
      snapshot.forEach((doc) => {
        notificationData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Notification);
      });
      
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { getFirestore, doc, updateDoc } = await import('@react-native-firebase/firestore');
      const db = getFirestore();
      
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: new Date(),
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { getFirestore, doc, writeBatch } = await import('@react-native-firebase/firestore');
      const db = getFirestore();
      
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      unreadNotifications.forEach(notif => {
        const notifRef = doc(db, 'notifications', notif.id);
        batch.update(notifRef, {
          isRead: true,
          readAt: new Date(),
        });
      });
      
      await batch.commit();
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return 'flash';
      case 'order':
        return 'bag-check';
      case 'stream':
        return 'videocam';
      case 'seller':
        return 'storefront';
      case 'system':
        return 'notifications-circle';
      case 'payment':
        return 'card';
      case 'shipping':
        return 'cube';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid':
        return { bg: '#8B5CF6', text: '#8B5CF6' };
      case 'order':
        return { bg: '#3B82F6', text: '#3B82F6' };
      case 'stream':
        return { bg: '#EF4444', text: '#EF4444' };
      case 'seller':
        return { bg: '#10B981', text: '#10B981' };
      case 'system':
        return { bg: '#6B7280', text: '#6B7280' };
      case 'payment':
        return { bg: '#F59E0B', text: '#F59E0B' };
      case 'shipping':
        return { bg: '#06B6D4', text: '#06B6D4' };
      default:
        return { bg: '#6B7280', text: '#6B7280' };
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'bid':
        return 'New Bid';
      case 'order':
        return 'Order Update';
      case 'stream':
        return 'Live Stream';
      case 'seller':
        return 'Seller Update';
      case 'system':
        return 'System Alert';
      case 'payment':
        return 'Payment';
      case 'shipping':
        return 'Shipping';
      default:
        return 'Notification';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleNotificationPress = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification type and data
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen as string, notification.data.params);
    } else {
      switch (notification.type) {
        case 'order':
          if (notification.data?.orderId) {
            navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: notification.data.orderId } });
          }
          break;
        case 'bid':
          if (notification.data?.streamId) {
            navigation.navigate('LiveStream', { screen: 'Viewer', params: { streamId: notification.data.streamId } });
          }
          break;
        case 'stream':
          if (notification.data?.streamId) {
            navigation.navigate('LiveStream', { screen: 'Viewer', params: { streamId: notification.data.streamId } });
          }
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="mt-4 text-gray-600">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        className="px-6 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-white">Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={markAllAsRead}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Text className="text-white font-medium text-sm">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Pills */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-full mr-2 ${
              filter === 'all' 
                ? 'bg-white shadow-lg' 
                : 'bg-white/20 backdrop-blur-sm'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text className={`text-center font-semibold ${
              filter === 'all' ? 'text-purple-600' : 'text-white'
            }`}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-full ${
              filter === 'unread' 
                ? 'bg-white shadow-lg' 
                : 'bg-white/20 backdrop-blur-sm'
            }`}
            onPress={() => setFilter('unread')}
          >
            <Text className={`text-center font-semibold ${
              filter === 'unread' ? 'text-purple-600' : 'text-white'
            }`}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="notifications-off" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 text-xl font-semibold mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
            <Text className="text-gray-500 text-center text-sm leading-relaxed">
              {filter === 'unread' 
                ? 'You\'re all caught up! New notifications will appear here.' 
                : 'We\'ll keep you updated with important alerts and activity.'}
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {filteredNotifications.map((notification) => {
              const colors = getNotificationColor(notification.type);
              const title = getNotificationTitle(notification.type);
              
              return (
                <TouchableOpacity
                  key={notification.id}
                  className={`bg-white rounded-2xl mb-3 shadow-sm border-l-4 ${
                    !notification.isRead 
                      ? 'border-purple-500 shadow-lg' 
                      : 'border-transparent shadow-sm'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: !notification.isRead ? 0.1 : 0.05,
                    shadowRadius: 8,
                    elevation: !notification.isRead ? 8 : 2,
                  }}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View className="flex-row p-4">
                    {/* Icon */}
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${colors.bg}15` }}
                    >
                      <View
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={20}
                          color="#fff"
                        />
                      </View>
                    </View>
                    
                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                          <Text 
                            className="font-bold text-gray-900 mr-2"
                            style={{ color: colors.text }}
                          >
                            {title}
                          </Text>
                          {!notification.isRead && (
                            <View className="w-2 h-2 bg-purple-500 rounded-full" />
                          )}
                        </View>
                        <Text className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </Text>
                      </View>
                      
                      <Text className="text-sm text-gray-700 leading-relaxed mb-2">
                        {notification.title}
                      </Text>
                      
                      {notification.body && (
                        <Text className="text-sm text-gray-600 leading-relaxed">
                          {notification.body}
                        </Text>
                      )}
                      
                      {notification.data?.amount && (
                        <View className="bg-purple-50 rounded-lg px-3 py-2 mt-2">
                          <Text className="text-purple-700 text-sm font-semibold">
                            RM {notification.data.amount.toFixed(2)}
                          </Text>
                        </View>
                      )}
                      
                      {notification.data?.orderId && (
                        <Text className="text-xs text-purple-600 mt-2 font-medium">
                          Order #{notification.data.orderId.slice(-6).toUpperCase()}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;