import Constants from 'expo-constants'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface Extra {
  firebaseApiKey: string;
  firebaseAuthDomain?: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firebaseMeasurementId?: string;
  curlecApiKey?: string;
  logisticsApiKey?: string;
}

export const env: Extra = {
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  curlecApiKey: process.env.EXPO_PUBLIC_CURLEC_API_KEY || '',
  logisticsApiKey: process.env.EXPO_PUBLIC_LOGISTICS_API_KEY || '',
};
