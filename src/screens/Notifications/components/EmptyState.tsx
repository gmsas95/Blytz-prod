import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../../../config/theme';

interface EmptyStateProps {
  filter: 'all' | 'unread';
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = memo(({ filter, onRefresh }) => {
  const { width } = useWindowDimensions();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // Animate the bell icon
  React.useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withSpring(-10, { damping: 2, stiffness: 100 }),
        withSpring(10, { damping: 2, stiffness: 100 }),
        withSpring(0, { damping: 2, stiffness: 100 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
      onRefresh();
    });
  };

  const getEmptyStateConfig = () => {
    switch (filter) {
      case 'unread':
        return {
          icon: 'check-all',
          title: 'All caught up!',
          message: 'You\'ve read all your notifications. We\'ll let you know when there\'s something new.',
          gradient: ['#10B981', '#059669'],
        };
      default:
        return {
          icon: 'bell-off-outline',
          title: 'No notifications yet',
          message: 'We\'ll notify you about important updates, orders, and activities.',
          gradient: ['#8B5CF6', '#7C3AED'],
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={config.gradient as any}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name={config.icon as any}
            size={width > 400 ? 64 : 48}
            color="white"
          />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.refreshGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color="white"
            style={styles.refreshIcon}
          />
          <Text style={styles.refreshText}>Refresh</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  refreshButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  refreshGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  refreshIcon: {
    marginRight: theme.spacing.xs,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;