import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProductDetailScreen, ProductListScreen} from '../screens/Product';

const Stack = createNativeStackNavigator();

export const ProductNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
    </Stack.Navigator>
  );
};
