import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../../context/AuthContext';
import {theme} from '../../config/theme';

export default function MyProfileScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {user, logout, loading: isLoading} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBids: 0,
    totalWins: 0,
    totalOrders: 0,
    totalSpent: 0,
  });

  // Mock stats - in real app, this would come from Firebase/API
  useEffect(() => {
    // Simulate loading user stats
    const loadStats = async () => {
      // This would normally fetch from your backend
      setStats({
        totalBids: 24,
        totalWins: 8,
        totalOrders: 12,
        totalSpent: 450.75,
      });
    };
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - reload user data and stats
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'orders',
      title: 'Order History',
      icon: 'receipt-outline',
      screen: 'MyOrders',
      color: theme.colors.primary,
      badge: stats.totalOrders > 0 ? stats.totalOrders.toString() : undefined,
    },
    {
      id: 'bids',
      title: 'My Bids',
      icon: 'hammer-outline',
      screen: 'MyBids',
      color: theme.colors.primary,
      badge: stats.totalBids > 0 ? stats.totalBids.toString() : undefined,
    },
    {
      id: 'wins',
      title: 'My Wins',
      icon: 'trophy-outline',
      screen: 'MyWins',
      color: theme.colors.primary,
      badge: stats.totalWins > 0 ? stats.totalWins.toString() : undefined,
    },
    {
      id: 'followed',
      title: 'Followed Sellers',
      icon: 'heart-outline',
      screen: 'FollowedSellers',
      color: theme.colors.primary,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      screen: 'Settings',
      color: theme.colors.primary,
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      screen: 'HelpSupport',
      color: theme.colors.primary,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Debug logging to help identify issues
  console.log('MyProfileScreen - User data:', {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  });

  const displayName = user.displayName || 'User';
  const userEmail = user.email || '';
  const userPhoto =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF385C&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons
            name="create-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <Image source={{uri: userPhoto}} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.colors.onPrimary}
              />
            </View>
          </View>

          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          {user.phoneNumber && (
            <View style={styles.phoneContainer}>
              <Ionicons
                name="call-outline"
                size={16}
                color={theme.colors.secondary}
              />
              <Text style={styles.phoneNumber}>{user.phoneNumber}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalBids}</Text>
            <Text style={styles.statLabel}>Bids</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalWins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              ${stats.totalSpent.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.secondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Blytz v1.0.0</Text>
          <Text style={styles.appSubtitle}>Live Auction Platform</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.secondary,
    fontFamily: 'Inter',
  },
  errorText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as '600',
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight as '500',
    color: theme.colors.onBackground,
    fontFamily: 'Inter',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  userName: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight as '600',
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  userEmail: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.secondary,
    marginLeft: 6,
    fontFamily: 'Inter',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h5.fontWeight as '500',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondary,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.background,
    marginHorizontal: 8,
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight as '400',
    color: theme.colors.onSurface,
    flex: 1,
    fontFamily: 'Inter',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    fontFamily: 'Inter',
  },
  logoutSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight as '400',
    color: theme.colors.error,
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondary,
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  appSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondary,
    fontFamily: 'Inter',
  },
});
