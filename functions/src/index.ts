import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

admin.initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://blytz-e9935-default-rtdb.asia-southeast1.firebasedatabase.app'
});

// Import bidding functions
export * from './bidding';
// Import seller onboarding functions
export * from './sellerOnboarding';
// Import seller functions
export * from './seller';
// Import webhook functions
export * from './webhooks';
export * from './livestream';
export * from './admin';
export * from './auction';
export * from './order';
export * from './fiuu';

// Firestore references
const firestore = admin.firestore();






