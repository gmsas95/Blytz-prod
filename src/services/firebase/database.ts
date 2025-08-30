import { database } from './firebase';
import { ref, onValue, off, push, set, query, limitToLast, orderByChild, runTransaction, get } from 'firebase/database';

// Auction-related database operations
export const getAuctionRef = (auctionId: string) => ref(database, `auctions/${auctionId}`);
export const getBidsRef = (auctionId: string) => ref(database, `auctions/${auctionId}/bids`);
export const getRateLimitRef = (userId: string) => ref(database, `rateLimits/${userId}`);

// Real-time listeners
export const listenToAuction = (auctionId: string, callback: (data: any) => void) => {
  const auctionRef = getAuctionRef(auctionId);
  return onValue(auctionRef, callback);
};

export const listenToBids = (auctionId: string, callback: (data: any) => void) => {
  const bidsRef = getBidsRef(auctionId);
  const bidsQuery = query(bidsRef, orderByChild('timestamp'), limitToLast(50));
  return onValue(bidsQuery, callback);
};

// Bid operations
export const placeBid = async (auctionId: string, bidData: any) => {
  const bidsRef = getBidsRef(auctionId);
  const newBidRef = push(bidsRef);
  await set(newBidRef, bidData);
  return newBidRef.key;
};

export const updateAuctionPrice = async (auctionId: string, newPrice: number, userId: string) => {
  const auctionRef = getAuctionRef(auctionId);
  await runTransaction(auctionRef, (currentData) => {
    if (currentData && newPrice > currentData.currentPrice) {
      currentData.currentPrice = newPrice;
      currentData.lastBidderId = userId;
      currentData.lastBidTime = Date.now();
      return currentData;
    }
    return null;
  });
};

// Rate limiting
export const setRateLimit = async (userId: string, cooldownTime: number) => {
  const rateLimitRef = getRateLimitRef(userId);
  await set(rateLimitRef, {
    cooldownUntil: Date.now() + cooldownTime,
    lastBidAt: Date.now()
  });
};

export const getRateLimit = async (userId: string) => {
  const rateLimitRef = getRateLimitRef(userId);
  const snapshot = await get(rateLimitRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// Cleanup listeners
export const removeListener = (listener: any) => {
  off(listener);
};