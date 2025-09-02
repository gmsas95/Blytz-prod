import * as admin from 'firebase-admin';
import {onCreate} from 'firebase-functions/v2/database';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {FieldValue} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

const db = admin.database();
const firestore = admin.firestore();

// Anti-fraud configuration for fast-paced live auctions
const RATE_LIMIT_CONFIG = {
  maxBidsPerMinute: 60,        // 1 bid per second for active bidding
  maxBidsPerHour: 300,         // ~5 bids per minute sustained
  maxBidsPerDay: 2000,         // Allow for multiple auction participation
  cooldownPeriod: 500,        // 0.5 seconds between bids for rapid response
  suspiciousThreshold: 5000,  // Increased for high-volume legitimate users
};

const BID_VALIDATION = {
  minBidIncrement: 0.01, // minimum increment
  maxBidMultiplier: 100, // max 100x starting price
  timeoutBuffer: 5000, // 5 second buffer for processing
};

interface BidData {
  timestamp: number;
}

// Rate limiting helper
async function checkRateLimit(userId: string): Promise<{allowed: boolean; cooldown?: number}> {
  const now = Date.now();
  const rateLimitRef = db.ref(`rateLimits/${userId}`);
  
  try {
    const snapshot = await rateLimitRef.get();
    const rateLimit = snapshot.val() || {
      lastBidTime: 0,
      bidCount: 0,
      hourlyCount: 0,
      dailyCount: 0,
      cooldownUntil: 0
    };

    // Check cooldown
    if (now < rateLimit.cooldownUntil) {
      return {allowed: false, cooldown: rateLimit.cooldownUntil - now};
    }

    // Reset counters based on time windows
    const lastBidTime = rateLimit.lastBidTime;
    const timeSinceLastBid = now - lastBidTime;

    if (timeSinceLastBid > 60000) { // 1 minute
      rateLimit.bidCount = 0;
    }
    if (timeSinceLastBid > 3600000) { // 1 hour
      rateLimit.hourlyCount = 0;
    }
    if (timeSinceLastBid > 86400000) { // 1 day
      rateLimit.dailyCount = 0;
    }

    // Check limits
    if (rateLimit.bidCount >= RATE_LIMIT_CONFIG.maxBidsPerMinute ||
        rateLimit.hourlyCount >= RATE_LIMIT_CONFIG.maxBidsPerHour ||
        rateLimit.dailyCount >= RATE_LIMIT_CONFIG.maxBidsPerDay) {
      
      // Apply cooldown - cooldownPeriod is already in milliseconds
      rateLimit.cooldownUntil = now + RATE_LIMIT_CONFIG.cooldownPeriod;
      await rateLimitRef.set(rateLimit);
      
      return {allowed: false, cooldown: RATE_LIMIT_CONFIG.cooldownPeriod};
    }

    // Update counters
    rateLimit.lastBidTime = now;
    rateLimit.bidCount++;
    rateLimit.hourlyCount++;
    rateLimit.dailyCount++;

    // Check for suspicious activity
    if (rateLimit.dailyCount > RATE_LIMIT_CONFIG.suspiciousThreshold) {
      await db.ref(`fraudDetection/${userId}`).set({
        suspiciousActivity: true,
        lastCheck: now,
        bidCount: rateLimit.dailyCount
      });
    }

    await rateLimitRef.set(rateLimit);
    return {allowed: true};

  } catch (error) {
    logger.error('Error checking rate limit:', error);
    return {allowed: true}; // Allow if rate limit check fails
  }
}

// Fraud detection helper
async function checkForFraud(userId: string, bidAmount: number, auctionId: string): Promise<{allowed: boolean; reason?: string}> {
  try {
    // Check user profile
    const userProfile = await firestore.collection('userProfiles').doc(userId).get();
    if (!userProfile.exists) {
      return {allowed: false, reason: 'User profile not found'};
    }

    const userData = userProfile.data();
    if (userData?.isBanned) {
      return {allowed: false, reason: 'User is banned'};
    }
    if (userData?.isActive === false) {
      return {allowed: false, reason: 'User account is inactive'};
    }

    // Check fraud detection flags
    const fraudSnapshot = await db.ref(`fraudDetection/${userId}`).get();
    const fraudData = fraudSnapshot.val();
    if (fraudData?.suspiciousActivity) {
      return {allowed: false, reason: 'Account under review for suspicious activity'};
    }

    // Check for rapid bidding patterns
    const recentBidsRef = db.ref(`auctions/${auctionId}/bids`).orderByChild('userId').equalTo(userId);
    const recentBidsSnapshot = await recentBidsRef.limitToLast(5).get();
    
    if (recentBidsSnapshot.exists()) {
      const bids = recentBidsSnapshot.val();
      const bidTimes = Object.values(bids).map((bid: any) => (bid as BidData).timestamp);
      
      if (bidTimes.length >= 3) {
        const timeDiffs = [];
        for (let i = 1; i < bidTimes.length; i++) {
          timeDiffs.push(bidTimes[i] - bidTimes[i-1]);
        }
        
        const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        if (avgTimeDiff < 1000) { // Less than 1 second between bids
          return {allowed: false, reason: 'Rapid bidding detected'};
        }
      }
    }

    // Check bid amount anomalies
    if (bidAmount > userData?.maxBidLimit || 0) {
      return {allowed: false, reason: 'Bid exceeds user limit'};
    }

    return {allowed: true};

  } catch (error) {
    logger.error('Error checking fraud:', error);
    return {allowed: true}; // Allow if fraud check fails
  }
}

// Validate bid amount
function validateBidAmount(amount: number, currentPrice: number, startingPrice: number): {valid: boolean; reason?: string} {
  if (!amount || amount <= 0) {
    return {valid: false, reason: 'Invalid bid amount'};
  }

  if (amount < currentPrice + BID_VALIDATION.minBidIncrement) {
    return {valid: false, reason: 'Bid must be higher than current price'};
  }

  if (amount > startingPrice * BID_VALIDATION.maxBidMultiplier) {
    return {valid: false, reason: 'Bid amount too high'};
  }

  return {valid: true};
}



// Place bid callable function for client-side usage
export const placeBid = onCall(
  {region: 'asia-southeast1', cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const {auctionId, amount} = request.data;
    const userId = request.auth.uid;

    if (!auctionId || !amount) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    if (amount <= 0) {
      throw new HttpsError('invalid-argument', 'Invalid bid amount');
    }

    try {
      const auctionRef = firestore.collection('auctions').doc(auctionId);

      // Use RTDB transaction for atomic bid processing
      const bidId = db.ref(`auctions/${auctionId}/bids`).push().key;
      const bidData = {
        userId,
        amount,
        timestamp: Date.now(),
        status: 'confirmed'
      };

      // Atomic RTDB transaction for real-time bidding
      await db.ref(`auctions/${auctionId}`).transaction((currentData) => {
        if (!currentData) {
          return null; // Auction doesn't exist
        }

        const auctionData = currentData;
        if (auctionData.status !== 'live') {
          return null; // Auction not live
        }

        const currentPrice = auctionData.currentPrice || auctionData.startingPrice || 0;
        if (amount <= currentPrice) {
          return null; // Bid not higher than current
        }

        // Update auction data atomically
        auctionData.currentPrice = amount;
        auctionData.lastBidderId = userId;
        auctionData.lastBidTime = Date.now();
        auctionData.bidCount = (auctionData.bidCount || 0) + 1;
        auctionData.updatedAt = Date.now();

        return auctionData;
      });

      // Add bid to RTDB
      await db.ref(`auctions/${auctionId}/bids/${bidId}`).set(bidData);

      // Firestore updates (non-critical, can be async)
      try {
        await firestore.runTransaction(async (transaction) => {
          const auctionDoc = await transaction.get(auctionRef);
          if (!auctionDoc.exists) {
            return;
          }

          const auctionData = auctionDoc.data();
          if (!auctionData || auctionData.status !== 'live') {
            return;
          }

          transaction.update(auctionRef, {
            currentPrice: amount,
            lastBidderId: userId,
            lastBidTime: FieldValue.serverTimestamp(),
            bidCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp()
          });

          const bidHistoryRef = firestore.collection('auctions').doc(auctionId).collection('bidHistory').doc(bidId!);
          transaction.set(bidHistoryRef, bidData);

          const userProfileRef = firestore.collection('userProfiles').doc(userId);
          transaction.update(userProfileRef, {
            totalBids: FieldValue.increment(1),
            lastBidAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
        });
      } catch (firestoreError) {
        // Log Firestore error but don't fail the bid - RTDB is the source of truth
        logger.warn('Firestore update failed, but RTDB bid succeeded:', firestoreError);
      }

    return { success: true, message: 'Bid placed successfully' };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      logger.error('Error placing bid:', error);
      throw new HttpsError('internal', 'Failed to place bid');
  }
);

// Real-time Database bid processing for live auctions - Deployed version
export const processRealtimeBid = onCreate(
  {
    region: 'asia-southeast1',
    ref: 'auctions/{auctionId}/bids/{bidId}',
  },
  async (event) => {
    const auctionId = event.params.auctionId;
    const bidId = event.params.bidId;
    const bidData = event.data.val();
    
    try {
      logger.info(`Processing realtime bid for auction ${auctionId}: ${bidId}`, bidData);
      
      if (!bidData || !bidData.userId || !bidData.amount) {
        logger.error('Invalid bid data structure', bidData);
        return;
      }

      // Update Realtime Database auction state for real-time updates
      const auctionRef = db.ref(`auctions/${auctionId}`);
      const auctionSnapshot = await auctionRef.once('value');
      const auctionData = auctionSnapshot.val();
      
      if (!auctionData) {
        logger.error(`Auction ${auctionId} not found`);
        return;
      }

      // Validate bid amount
      const currentPrice = auctionData.currentPrice || auctionData.startingPrice || 0;
      if (bidData.amount <= currentPrice) {
        logger.warn(`Bid amount ${bidData.amount} not higher than current ${currentPrice}`);
        return;
      }

      // Use RTDB transaction for atomic bid processing
      await auctionRef.transaction((currentData) => {
        if (!currentData) {
          return null; // Auction doesn't exist
        }

        const auctionData = currentData;
        const currentPrice = auctionData.currentPrice || auctionData.startingPrice || 0;
        
        if (bidData.amount <= currentPrice) {
          return null; // Bid not higher than current
        }

        // Update auction data atomically
        auctionData.currentPrice = bidData.amount;
        auctionData.lastBidderId = bidData.userId;
        auctionData.lastBidTime = admin.database.ServerValue.TIMESTAMP;
        auctionData.bidCount = (auctionData.bidCount || 0) + 1;

        return auctionData;
      });

      // Also update Firestore for persistence and checkout
      const firestoreAuctionRef = firestore.collection('auctions').doc(auctionId);
      await firestoreAuctionRef.update({
        currentPrice: bidData.amount,
        lastBidderId: bidData.userId,
        lastBidTime: FieldValue.serverTimestamp(),
        bidCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Store bid in Firestore for audit trail
      const firestoreBidRef = firestore.collection('auctions').doc(auctionId).collection('bids').doc(bidId);
      await firestoreBidRef.set({
        ...bidData,
        timestamp: FieldValue.serverTimestamp()
      });

      logger.info(`Successfully processed realtime bid: ${bidData.amount} by ${bidData.userId}`);

    } catch (error) {
      logger.error('Error processing realtime bid:', error);
    }
  }
);

// Finalize auction when it ends - Deployed version
export const finalizeAuction = onCreate(
  {
    region: 'asia-southeast1',
    ref: 'auctions/{auctionId}/status',
  },
  async (event) => {
    const auctionId = event.params.auctionId;
    const status = event.data.val();
    
    if (status === 'ended') {
      try {
        const auctionRef = db.ref(`auctions/${auctionId}`);
        const auctionSnapshot = await auctionRef.once('value');
        const auctionData = auctionSnapshot.val();
        
        if (!auctionData || !auctionData.lastBidderId) {
          logger.info(`Auction ${auctionId} ended with no winner`);
          return;
        }

        // Get final bid details
        const bidsRef = db.ref(`auctions/${auctionId}/bids`);
        const bidsSnapshot = await bidsRef.orderByChild('timestamp').limitToLast(1).once('value');
        const finalBid = Object.values(bidsSnapshot.val() || {})[0] || {};

        // Update Firestore with final winner and price
        const firestoreAuctionRef = firestore.collection('auctions').doc(auctionId);
        await firestoreAuctionRef.update({
          status: 'ended',
          winnerId: auctionData.lastBidderId,
          finalPrice: auctionData.currentPrice,
          endedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });

        // Create order for winner
        const orderData = {
          auctionId,
          userId: auctionData.lastBidderId,
          amount: auctionData.currentPrice,
          status: 'pending_payment',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

        const orderRef = firestore.collection('orders').doc();
        await orderRef.set(orderData);

        logger.info(`Auction ${auctionId} finalized - Winner: ${auctionData.lastBidderId}, Price: ${auctionData.currentPrice}, Order ID: ${orderRef.id}`);

      } catch (error) {
        logger.error('Error finalizing auction:', error);
      }
    }
  }
);

// Get auction state for real-time updates
export const getAuctionState = onCall(
  {region: 'asia-southeast1', cors: true},
  async (request) => {
    const {auctionId} = request.data;

    if (!auctionId) {
      throw new HttpsError('invalid-argument', 'Missing auction ID');
    }

    try {
      const auctionSnapshot = await db.ref(`auctions/${auctionId}`).get();
      if (!auctionSnapshot.exists()) {
        throw new HttpsError('not-found', 'Auction not found');
      }

      const auctionData = auctionSnapshot.val();
      
      // Get recent bids
      const bidsSnapshot = await db.ref(`auctions/${auctionId}/bids`).limitToLast(10).get();
      const recentBids = bidsSnapshot.val() || {};

      return {
        currentPrice: auctionData.currentPrice,
        lastBidderId: auctionData.lastBidderId,
        lastBidTime: auctionData.lastBidTime,
        status: auctionData.status,
        endTime: auctionData.endTime,
        recentBids: Object.values(recentBids).slice(-5)
      };

    } catch (error) {
      logger.error('Error getting auction state:', error);
      throw new HttpsError('internal', 'Failed to get auction state');
    }
  }
);

// Admin function to ban user
export const banUser = onCall(
  {region: 'asia-southeast1', cors: true},
  async (request) => {
    if (!request.auth?.token?.admin) {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const {userId, reason} = request.data;

    if (!userId) {
      throw new HttpsError('invalid-argument', 'Missing user ID');
    }

    try {
      await firestore.collection('userProfiles').doc(userId).update({
        isBanned: true,
        banReason: reason,
        bannedAt: FieldValue.serverTimestamp(),
        bannedBy: request.auth.uid
      });

      // Update fraud detection
      await db.ref(`fraudDetection/${userId}`).set({
        isBanned: true,
        reason,
        bannedAt: Date.now()
      });

      return {success: true, message: 'User banned successfully'};

    } catch (error) {
      logger.error('Error banning user:', error);
      throw new HttpsError('internal', 'Failed to ban user');
    }
  }
);