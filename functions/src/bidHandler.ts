import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { redis } from './services/redis';

admin.initializeApp();

export const placeBid = functions.onCall(
  { region: 'asia-southeast1', cors: true },
  async (request) => {
    const { auctionId, amount } = request.data;
    const userId = request.auth?.uid;
    
    if (!userId) {
      throw new functions.HttpsError('unauthenticated', 'User not authenticated');
    }
    
    if (!auctionId || typeof amount !== 'number' || amount <= 0) {
      throw new functions.HttpsError('invalid-argument', 'Invalid bid data');
    }
    
    // Check rate limiting
    const canBid = await redis.canUserBid(userId, auctionId);
    if (!canBid) {
      throw new functions.HttpsError('resource-exhausted', 'Too many bids - wait 5 seconds');
    }
    
    // Register bid atomically
    const bidData = { userId, amount, timestamp: Date.now() };
    const success = await redis.registerBid(auctionId, bidData);
    
    if (!success) {
      throw new functions.HttpsError('failed-precondition', 'Outbid by another user');
    }
    
    // Persist to Firestore
    await admin.firestore().collection('auctions').doc(auctionId)
      .update({ 
        currentBid: bidData,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true, bid: bidData };
  }
);