import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeNavigator } from './HomeNavigator';
import { UserProfileNavigator } from './UserProfileNavigator';
import { NotificationsNavigator } from './NotificationsNavigator';
import { LiveStreamTabNavigator } from './LiveStreamTabNavigator';
import { SellerNavigator } from './SellerNavigator';
import { CartNavigator } from './CartNavigator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { CartIcon } from '../components/Cart/CartIcon';

const Tab = createBottomTabNavigator();

const MainNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isSeller } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Cart') {
            return <CartIcon size={size} color={color} />;
          } else if (route.name === 'Live') {
            iconName = focused ? 'videocam' : 'videocam-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Seller') {
            iconName = focused ? 'storefront' : 'storefront-outline';
            return (
              <MaterialCommunityIcons name={iconName} size={size} color={color} />
            );
          }
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onBackground,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Cart" component={CartNavigator} />
      <Tab.Screen name="Live" component={LiveStreamTabNavigator} />
      {isSeller && <Tab.Screen name="Seller" component={SellerNavigator} />}
      <Tab.Screen name="Notifications" component={NotificationsNavigator} />
      <Tab.Screen name="Profile" component={UserProfileNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
