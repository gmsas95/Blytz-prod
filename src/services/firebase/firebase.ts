import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../../config/firebase';

// Initialize Firebase app with explicit configuration
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const firestore = getFirestore(app);
const database = getDatabase(app, FIREBASE_CONFIG.databaseURL);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, firestore, database, storage, functions };
