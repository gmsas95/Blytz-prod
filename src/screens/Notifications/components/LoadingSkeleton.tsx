import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../../../config/theme';

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonItem: React.FC<{ index: number }> = memo(({ index }) => {
  const opacity = useSharedValue(0.3);
  const translateX = useSharedValue(-100);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(100, { duration: 1500 }),
        withTiming(-100, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={styles.container}>
      <View style={styles.skeletonContainer}>
        <Animated.View style={[styles.skeleton, styles.avatar, animatedStyle]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
        <View style={styles.content}>
          <Animated.View style={[styles.skeleton, styles.title, animatedStyle]}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </Animated.View>
          <Animated.View style={[styles.skeleton, styles.subtitle, animatedStyle]}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </Animated.View>
          <Animated.View style={[styles.skeleton, styles.line, animatedStyle]}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
});

SkeletonItem.displayName = 'SkeletonItem';

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(({ count = 5 }) => {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} index={index} />
      ))}
    </View>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: theme.spacing.md,
  },
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skeleton: {
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    height: 18,
    width: '60%',
    borderRadius: 9,
    marginBottom: 8,
  },
  subtitle: {
    height: 14,
    width: '40%',
    borderRadius: 7,
    marginBottom: 8,
  },
  line: {
    height: 12,
    width: '80%',
    borderRadius: 6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default LoadingSkeleton;