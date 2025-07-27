import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SellerDashboardScreen from '../screens/Seller/SellerDashboardScreen';
import CreateStreamScreen from '../screens/Streams/CreateStreamScreen';
import AddProductScreen from '../screens/Products/AddProductScreen';
import MyProductsScreen from '../screens/Products/MyProductsScreen';
import MyStreamsScreen from '../screens/Streams/MyStreamsScreen';
import SellerOrdersScreen from '../screens/Orders/SellerOrdersScreen';
import SellerProfileScreen from '../screens/Seller/SellerProfileScreen';
import EditSellerProfileScreen from '../screens/Seller/EditSellerProfileScreen';
import BusinessDocumentsScreen from '../screens/Seller/BusinessDocumentsScreen';
import { NavigatorScreenParams } from '@react-navigation/native';

export type SellerTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Streams: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type SellerStackParamList = {
  SellerTabs: NavigatorScreenParams<SellerTabParamList>;
  CreateStream: undefined;
  AddProduct: undefined;
  EditSellerProfile: undefined;
  BusinessDocuments: undefined;
};

const Tab = createBottomTabNavigator<SellerTabParamList>();
const Stack = createNativeStackNavigator<SellerStackParamList>();

const SellerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Streams') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={SellerDashboardScreen} />
      <Tab.Screen name="Products" component={MyProductsScreen} />
      <Tab.Screen name="Streams" component={MyStreamsScreen} />
      <Tab.Screen name="Orders" component={SellerOrdersScreen} />
      <Tab.Screen name="Profile" component={SellerProfileScreen} />
    </Tab.Navigator>
  );
};

export const SellerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerTabs" component={SellerTabNavigator} />
      <Stack.Screen name="CreateStream" component={CreateStreamScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="EditSellerProfile" component={EditSellerProfileScreen} />
      <Stack.Screen name="BusinessDocuments" component={BusinessDocumentsScreen} />
    </Stack.Navigator>
  );
};