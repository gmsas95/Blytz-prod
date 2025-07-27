import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LiveStreamStackParamList} from '../types/navigation';
import {Ionicons} from '@expo/vector-icons';
import LiveStreamViewerScreen from '../screens/LiveStream/viewer/LiveStreamViewerScreen';
import {theme} from '../config/theme';

const Tab = createBottomTabNavigator<LiveStreamStackParamList>();

export const LiveStreamTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color}) => {
          let iconName;

          if (route.name === 'LiveStreamViewer') {
            iconName = focused ? 'videocam' : 'videocam-outline';
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
      <Tab.Screen name="LiveStreamViewer" component={LiveStreamViewerScreen} />
    </Tab.Navigator>
  );
};
