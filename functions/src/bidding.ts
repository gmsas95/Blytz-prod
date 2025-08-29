import * as admin from 'firebase-admin';
// import {onValueCreated} from 'firebase-functions/v2/database';
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
      
      // Apply cooldown
      rateLimit.cooldownUntil = now + (RATE_LIMIT_CONFIG.cooldownPeriod * 60);
      await rateLimitRef.set(rateLimit);
      
      return {allowed: false, cooldown: RATE_LIMIT_CONFIG.cooldownPeriod * 60};
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

// Process new bid with comprehensive validation
// export const processNewBid = onValueCreated(
//   {ref: 'auctions/{auctionId}/bids/{bidId}', region: 'asia-southeast1'},
//   async event => {
//     const bid = event.data.val();
//     const {auctionId, bidId} = event.params;

//     logger.info(`Processing bid ${bidId} for auction ${auctionId}`, {bid});

//     try {
//       // Get auction data
//       const auctionDoc = await firestore.collection('auctions').doc(auctionId).get();
//       if (!auctionDoc.exists) {
//         logger.error(`Auction ${auctionId} not found`);
//         await event.data.ref.remove();
//         return;
//       }

//       const auctionData = auctionDoc.data();
//       if (!auctionData) {
//         logger.error(`Auction data missing for ${auctionId}`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Check if auction is active
//       if (auctionData.status !== 'live') {
//         logger.warn(`Auction ${auctionId} is not live`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Check if auction hasn't ended
//       const now = Date.now();
//       const endTime = auctionData.endTime?.toMillis() || 0;
//       if (now > endTime - BID_VALIDATION.timeoutBuffer) {
//         logger.warn(`Auction ${auctionId} has ended or is ending`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Validate bid amount
//       const validation = validateBidAmount(bid.amount, auctionData.currentPrice, auctionData.startingPrice);
//       if (!validation.valid) {
//         logger.warn(`Invalid bid amount: ${validation.reason}`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Check rate limiting
//       const rateLimit = await checkRateLimit(bid.userId);
//       if (!rateLimit.allowed) {
//         logger.warn(`Rate limit exceeded for user ${bid.userId}`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Check fraud detection
//       const fraudCheck = await checkForFraud(bid.userId, bid.amount, auctionId);
//       if (!fraudCheck.allowed) {
//         logger.warn(`Fraud check failed for user ${bid.userId}: ${fraudCheck.reason}`);
//         await event.data.ref.remove();
//         return;
//       }

//       // Update auction with new bid
//       const batch = firestore.batch();
      
//       // Update auction document
//       batch.update(auctionDoc.ref, {
//         currentPrice: bid.amount,
//         lastBidderId: bid.userId,
//         lastBidTime: FieldValue.serverTimestamp(),
//         bidCount: FieldValue.increment(1),
//         updatedAt: FieldValue.serverTimestamp()
//       });

//       // Add to bid history
//       const bidHistoryRef = firestore.collection('auctions').doc(auctionId).collection('bidHistory').doc(bidId);
//       batch.set(bidHistoryRef, {
//         ...bid,
//         status: 'confirmed',
//         processedAt: FieldValue.serverTimestamp()
//       });

//       // Update user statistics
//       const userProfileRef = firestore.collection('userProfiles').doc(bid.userId);
//       batch.update(userProfileRef, {
//         totalBids: FieldValue.increment(1),
//         lastBidAt: FieldValue.serverTimestamp(),
//         updatedAt: FieldValue.serverTimestamp()
//       });

//       await batch.commit();

//       // Move bid from pending to confirmed in Realtime Database
//       if (event.data.ref.parent) {
//         await event.data.ref.parent.child(bidId).update({
//           status: 'confirmed',
//           confirmedAt: now
//         });
//       }

//       // Update Realtime Database current price for real-time updates
//       await db.ref(`auctions/${auctionId}`).update({
//         currentPrice: bid.amount,
//         lastBidderId: bid.userId,
//         lastBidTime: now
//       });

//       // Check for anti-sniping
//       if (auctionData.antiSnipingEnabled) {
//         const timeRemaining = endTime - now;
//         const antiSnipingExtension = 60000; // 1 minute extension
        
//         if (timeRemaining < antiSnipingExtension) {
//           const newEndTime = new Date(now + antiSnipingExtension);
//           await auctionDoc.ref.update({
//             endTime: admin.firestore.Timestamp.fromDate(newEndTime),
//             extendedByAntiSniping: true,
//             extensionCount: (auctionData.extensionCount || 0) + 1
//           });
          
//           logger.info(`Auction ${auctionId} extended by anti-sniping rule`);
//         }
//       }

//       logger.info(`Successfully processed bid ${bidId} for auction ${auctionId}`);

//     } catch (error) {
//       logger.error(`Error processing bid ${bidId}:`, error);
//       // Attempt to clean up failed bid
//       try {
//         await event.data.ref.remove();
//       } catch (cleanupError) {
//         logger.error('Error cleaning up failed bid:', cleanupError);
//       }
//     }
//   }
// );

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
      // Get auction data
      const auctionDoc = await firestore.collection('auctions').doc(auctionId).get();
      if (!auctionDoc.exists) {
        throw new HttpsError('not-found', 'Auction not found');
      }

      const auctionData = auctionDoc.data();
      if (!auctionData || auctionData.status !== 'live') {
        throw new HttpsError('failed-precondition', 'Auction is not live');
      }

      // Validate bid amount
      const validation = validateBidAmount(amount, auctionData.currentPrice, auctionData.startingPrice);
      if (!validation.valid) {
        throw new HttpsError('invalid-argument', validation.reason || 'Invalid bid amount');
      }

      // Check rate limiting
      const rateLimit = await checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded', {cooldown: rateLimit.cooldown});
      }

      // Check fraud detection
      const fraudCheck = await checkForFraud(userId, amount, auctionId);
      if (!fraudCheck.allowed) {
        throw new HttpsError('permission-denied', fraudCheck.reason || 'Fraud check failed');
      }

      // Create bid in Realtime Database
      const bidId = db.ref(`auctions/${auctionId}/bids`).push().key;
      const bidData = {
        userId,
        amount,
        timestamp: Date.now(),
        status: 'pending'
      };

      await db.ref(`auctions/${auctionId}/bids/${bidId}`).set(bidData);

      return {
        success: true,
        bidId,
        message: 'Bid placed successfully',
        currentPrice: auctionData.currentPrice
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      logger.error('Error placing bid:', error);
      throw new HttpsError('internal', 'Failed to place bid');
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