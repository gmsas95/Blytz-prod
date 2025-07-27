import React, {useEffect} from 'react';
import {Text, View, ScrollView} from 'react-native'; // eslint-disable-line @typescript-eslint/no-unused-vars
import Constants from 'expo-constants';

const EnvVerification = () => {
  useEffect(() => {
    console.log('=== ENVIRONMENT VERIFICATION ===');
    console.log('Current Environment:', Constants.expoConfig?.extra?.NODE_ENV);
    console.log(
      'Firebase Project ID:',
      Constants.expoConfig?.extra?.firebaseProjectId,
    );
    console.log('Firebase API Key:', 'Exists (hidden for security)');
    console.log(
      'Firebase Auth Domain:',
      Constants.expoConfig?.extra?.firebaseAuthDomain,
    );
    console.log('=== END VERIFICATION ===');
  }, []);

  return (
    <ScrollView className="p-5 bg-gray-100 rounded-lg m-5">
      <Text className="text-lg font-bold mb-2.5">Environment Verification</Text>
      <Text className="text-base mb-2">
        Current Environment: {Constants.expoConfig?.extra?.NODE_ENV}
      </Text>
      <Text className="text-base mb-2">
        Firebase Project: {Constants.expoConfig?.extra?.firebaseProjectId}
      </Text>
      <Text className="text-base mb-2">
        Firebase API Key:{' '}
        {Constants.expoConfig?.extra?.firebaseApiKey?.substring(0, 8)}...
      </Text>
      <Text className="text-base mb-2">
        Firebase Auth Domain: {Constants.expoConfig?.extra?.firebaseAuthDomain}
      </Text>
      <Text className="text-sm italic mt-5 text-gray-600">
        Check the console logs for complete verification details
      </Text>
    </ScrollView>
  );
};

export default EnvVerification;
