import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {AuthNavigator} from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {SellerNavigator} from './SellerNavigator';

const RootStack = createNativeStackNavigator();

export const RootNavigator = () => {
  const {user, isSeller} = useAuth();

  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        isSeller ? (
          <RootStack.Screen name="Seller" component={SellerNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};
