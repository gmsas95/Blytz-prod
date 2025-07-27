import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen, DiscoverScreen} from '../screens/Home';
import {LiveStreamViewerScreen} from '../screens/LiveStream/viewer';

const Stack = createNativeStackNavigator();

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen
        name="LiveStreamViewer"
        component={LiveStreamViewerScreen}
      />
    </Stack.Navigator>
  );
};
