import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {HomeNavigator} from './HomeNavigator';
import LiveStreamViewerScreen from '../screens/LiveStream/viewer/LiveStreamViewerScreen';
import {UserProfileNavigator} from './UserProfileNavigator';
import {theme} from '../config/theme';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LiveStream') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={22}
              color={color}
            />
          );
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.onSurface + '20', // Add some opacity
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.primary + '80', // 50% opacity
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.caption.fontWeight as '400',
          letterSpacing: theme.typography.caption.letterSpacing,
          color: theme.colors.primary,
        },
      })}>
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="LiveStream" component={LiveStreamViewerScreen} />
      <Tab.Screen name="Profile" component={UserProfileNavigator} />
    </Tab.Navigator>
  );
};
