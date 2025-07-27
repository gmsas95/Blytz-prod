import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NotificationsScreen} from '../screens/Notifications';

const Stack = createNativeStackNavigator();

export const NotificationsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
