import React, { memo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Notification } from '../../../types/models/notification';
import { theme } from '../../../config/theme';

interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  isBulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (notificationId: string) => void;
}

const formatDistanceToNow = (date: any) => {
  try {
    let validDate: Date;
    
    if (!date) {
      validDate = new Date();
    } else if (typeof date === 'object' && typeof date.toDate === 'function') {
      // Handle Firebase Timestamp
      validDate = date.toDate();
    } else if (date instanceof Date) {
      validDate = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      validDate = new Date(date);
    } else {
      validDate = new Date();
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - validDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'now';
  }
};

const getNotificationStyle = (type: string) => {
  const safeType = typeof type === 'string' ? type : 'system';
  switch (safeType) {
    case 'bid':
      return {
        icon: 'lightning-bolt',
        color: theme.colors.primary,
        bgColor: theme.colors.primary,
        title: 'New Bid',
      };
    case 'order':
      return {
        icon: 'package-variant-closed',
        color: theme.colors.secondary,
        bgColor: theme.colors.secondary,
        title: 'Order Update',
      };
    case 'stream':
      return {
        icon: 'broadcast',
        color: theme.colors.error,
        bgColor: theme.colors.error,
        title: 'Live Stream',
      };
    case 'seller':
      return {
        icon: 'store-outline',
        color: theme.colors.primary,
        bgColor: theme.colors.primary,
        title: 'Seller Update',
      };
    case 'system':
      return {
        icon: 'bell-badge-outline',
        color: theme.colors.onSurface,
        bgColor: theme.colors.surface,
        title: 'System Alert',
      };
    case 'payment':
      return {
        icon: 'credit-card-outline',
        color: theme.colors.secondary,
        bgColor: theme.colors.secondary,
        title: 'Payment',
      };
    case 'shipping':
      return {
        icon: 'truck-delivery-outline',
        color: theme.colors.secondary,
        bgColor: theme.colors.secondary,
        title: 'Shipping',
      };
    default:
      return {
        icon: 'bell-outline',
        color: theme.colors.onSurface,
        bgColor: theme.colors.surface,
        title: 'Notification',
      };
  }
};

const NotificationCard: React.FC<NotificationCardProps> = memo(({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  isBulkMode = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isBulkMode) {
      onToggleSelection?.(notification.id);
    } else {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 200 }, () => {
        scale.value = withSpring(1);
        onPress(notification);
        swipeableRef.current?.close();
      });
    }
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.readButton]}
        onPress={() => {
          onMarkAsRead(notification.id);
          swipeableRef.current?.close();
        }}
      >
        <MaterialCommunityIcons name="check-all" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          onDelete(notification.id);
          swipeableRef.current?.close();
        }}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.actionButton, styles.markButton]}
      onPress={() => {
        onMarkAsRead(notification.id);
        swipeableRef.current?.close();
      }}
    >
      <MaterialCommunityIcons name="check" size={24} color="white" />
    </TouchableOpacity>
  );

  const style = getNotificationStyle(notification?.type || 'system');
  const createdAt = notification?.createdAt;

  return (
    <Animated.View style={animatedStyle}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        leftThreshold={80}
        rightThreshold={80}
        friction={2}
        overshootRight={false}
        overshootLeft={false}
      >
        <TouchableOpacity
          style={[
            styles.container,
            !notification.isRead && styles.unreadContainer,
            isSelected && styles.selectedContainer,
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.content}>
            {/* Avatar/Icon Section */}
            <View style={styles.avatarSection}>
              {notification?.imageUrl ? (
                <Image
                  source={{ uri: notification.imageUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Error loading notification image:', error);
                  }}
                />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
                  <MaterialCommunityIcons
                    name={style.icon as any}
                    size={24}
                    color={style.color}
                  />
                </View>
              )}
              
              {!notification?.isRead && !isBulkMode && (
                <View style={styles.unreadBadge} />
              )}

              {isBulkMode && (
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected
                ]}>
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={16} color="white" />
                  )}
                </View>
              )}
            </View>

            {/* Content Section */}
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={[
                  styles.title,
                  !notification?.isRead && styles.unreadTitle
                ]} numberOfLines={1}>
                  {notification?.title || 'Notification'}
                </Text>
                <Text style={styles.time}>
                  {formatDistanceToNow(createdAt)}
                </Text>
              </View>

              <Text style={styles.body} numberOfLines={2}>
                {notification?.body || 'You have a new notification'}
              </Text>

              {notification?.data?.amount != null && (
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>
                    RM {Number(notification.data.amount).toFixed(2)}
                  </Text>
                </View>
              )}

              {notification?.data?.orderId && (
                <Text style={styles.orderId}>
                  Order #{String(notification.data.orderId).slice(-6).toUpperCase()}
                </Text>
              )}

              {notification?.priority === 'high' && (
                <View style={styles.priorityContainer}>
                  <View style={styles.priorityDot} />
                  <Text style={styles.priorityText}>Urgent</Text>
                </View>
              )}
            </View>

            {/* Action Indicator */}
            {!isBulkMode && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurface}
                style={styles.chevron}
              />
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
});

NotificationCard.displayName = 'NotificationCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadContainer: {
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedContainer: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: 'white',
  },
  checkbox: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.onSurface,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginLeft: 8,
  },
  body: {
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
    marginBottom: 4,
  },
  amountContainer: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  orderId: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButton: {
    width: 72,
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  readButton: {
    backgroundColor: theme.colors.secondary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  markButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 16,
  },
});

export default NotificationCard;