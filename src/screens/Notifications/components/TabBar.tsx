import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../../../config/theme';

interface TabBarProps {
  activeTab: 'all' | 'unread';
  onTabChange: (tab: 'all' | 'unread') => void;
  counts: {
    all: number;
    unread: number;
  };
}

const TabBar: React.FC<TabBarProps> = memo(({ activeTab, onTabChange, counts }) => {
  const { width } = useWindowDimensions();
  const indicatorPosition = useSharedValue(activeTab === 'all' ? 0 : 1);

  React.useEffect(() => {
    indicatorPosition.value = withSpring(activeTab === 'all' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          indicatorPosition.value,
          [0, 1],
          [0, width / 2 - 32]
        ),
      },
    ],
  }));

  const handleTabPress = (tab: 'all' | 'unread') => {
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, styles.leftTab]}
          onPress={() => handleTabPress('all')}
          activeOpacity={0.9}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText
            ]}>
              All
            </Text>
            <View style={[
              styles.badge,
              activeTab === 'all' ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.badgeText,
                activeTab === 'all' && styles.activeBadgeText
              ]}>
                {counts.all}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, styles.rightTab]}
          onPress={() => handleTabPress('unread')}
          activeOpacity={0.9}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              activeTab === 'unread' && styles.activeTabText
            ]}>
              Unread
            </Text>
            <View style={[
              styles.badge,
              activeTab === 'unread' ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.badgeText,
                activeTab === 'unread' && styles.activeBadgeText
              ]}>
                {counts.unread}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.indicator,
            indicatorStyle,
          ]}
        />
      </View>
    </View>
  );
});

TabBar.displayName = 'TabBar';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  leftTab: {
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
  },
  rightTab: {
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  activeTabText: {
    color: theme.colors.primary[600],
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: theme.colors.primary[100],
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeBadgeText: {
    color: theme.colors.primary[600],
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 21,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 8,
  },
});

export default TabBar;