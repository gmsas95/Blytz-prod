import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  MyProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  MyOrdersScreen,
  MyBidsScreen,
  MyWinsScreen,
} from '../screens/UserProfile';
import {FollowedSellersScreen} from '../screens/SellerProfile/FollowedSellersScreen';
import {HelpSupportScreen} from '../screens/Other/HelpSupportScreen';
import ChangePasswordScreen from '../screens/UserProfile/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export const UserProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="MyBids" component={MyBidsScreen} />
      <Stack.Screen name="MyWins" component={MyWinsScreen} />
      <Stack.Screen
        name="FollowedSellers"
        component={FollowedSellersScreen}
      />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
    </Stack.Navigator>
  );
};
