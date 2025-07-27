import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  SellerProfileScreen,
  FollowedSellersScreen,
  SellerDashboardScreen,
} from '../screens/SellerProfile';

const Stack = createNativeStackNavigator();

export const SellerProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
      <Stack.Screen name="FollowedSellers" component={FollowedSellersScreen} />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
    </Stack.Navigator>
  );
};
