import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  ShippingAddressScreen,
  PaymentMethodScreen,
  OrderSummaryScreen,
  OrderConfirmationScreen,
} from '../screens/Checkout';

const Stack = createNativeStackNavigator();

export const CheckoutNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
    </Stack.Navigator>
  );
};
