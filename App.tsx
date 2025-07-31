import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './src/context/ThemeProvider';
import {AuthProvider} from './src/context/AuthContext';
import {AuctionProvider} from './src/context/AuctionContext';
import {CartProvider} from './src/context/CartContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import React, {useEffect} from 'react';
import {LogBox, AppRegistry, Platform, StyleSheet} from 'react-native';
import blytzPerformance from './src/services/blytzPerformance';
import './src/config/i18n';

// Ignore specific warnings from Firebase if needed
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  '[react-native-gesture-handler]',
  'expo-app-loading is deprecated',
  // Add any other warning patterns you want to ignore
]);

// Make sure to register the app with Metro BEFORE exporting
// This is crucial for proper bundling and component registration
const BlytzApp = () => {
  useEffect(() => {
    if (__DEV__) {
      blytzPerformance.init();
      console.log(`Running Blytz App in development mode on ${Platform.OS}`);
    }

    // Request notification permissions and listen for messages
    // requestUserPermission();
    // listenForMessages();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AuctionProvider>
              <CartProvider>
                <NavigationContainer>
                  <>
                    <RootNavigator />
                    <StatusBar style="auto" />
                  </>
                </NavigationContainer>
              </CartProvider>
            </AuctionProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent('main', () => BlytzApp);

export default BlytzApp;
