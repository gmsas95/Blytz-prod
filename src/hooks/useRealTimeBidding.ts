import { useState, useEffect, useRef, useCallback } from 'react';

import { ref, onValue, off, query, limitToLast, orderByChild, push, set, runTransaction } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/firebase/firebase';

export interface Bid {
  id: string;
  userId: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
  userName?: string;
  userAvatar?: string;
}

export interface AuctionState {
  currentPrice: number;
  lastBidderId: string;
  lastBidTime: number;
  status: string;
  endTime: number;
  startingPrice: number;
  productId: string;
  sellerId: string;
}

export interface UseRealTimeBiddingProps {
  auctionId: string;
  onBidUpdate?: (bid: Bid) => void;
  onPriceUpdate?: (price: number) => void;
  onAuctionEnd?: () => void;
}

export const useRealTimeBidding = ({ 
  auctionId, 
  onBidUpdate, 
  onPriceUpdate, 
  onAuctionEnd 
}: UseRealTimeBiddingProps) => {
  const { user } = useAuth();
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  
  const listenersRef = useRef<Array<() => void>>([]);
  const lastUpdateRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to auction state changes
  const subscribeToAuctionState = useCallback(() => {
    if (!auctionId) return;

    const auctionRef = ref(database, `auctions/${auctionId}`);
    
    const unsubscribe = onValue(auctionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newState: AuctionState = {
          currentPrice: data.currentPrice || data.startingPrice || 0,
          lastBidderId: data.lastBidderId || '',
          lastBidTime: data.lastBidTime || 0,
          status: data.status || 'pending',
          endTime: data.endTime || 0,
          startingPrice: data.startingPrice || 0,
          productId: data.productId || '',
          sellerId: data.sellerId || ''
        };

        setAuctionState(newState);
        onPriceUpdate?.(newState.currentPrice);

        // Check if auction ended
        if (data.status === 'ended') {
          onAuctionEnd?.();
        }
      }
    }, (error) => {
      console.error('Error listening to auction state:', error);
      setError('Failed to connect to auction');
    });

    listenersRef.current.push(() => off(auctionRef, 'value', unsubscribe));
  }, [auctionId, onPriceUpdate, onAuctionEnd]);

  // Subscribe to bid updates with performance optimization
  const subscribeToBids = useCallback(() => {
    if (!auctionId) return;

    const bidsRef = ref(database, `auctions/${auctionId}/bids`);
    const bidsQuery = query(bidsRef, orderByChild('timestamp'), limitToLast(50));

    const unsubscribe = onValue(bidsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const bidsData = snapshot.val();
        const bidsArray: Bid[] = Object.entries(bidsData || {})
          .map(([id, bid]: [string, any]) => ({
            id,
            userId: bid.userId,
            amount: bid.amount,
            timestamp: bid.timestamp,
            status: bid.status || 'pending'
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        // Throttle updates to reduce re-renders
        const now = Date.now();
        if (now - lastUpdateRef.current > 100) { // 100ms throttle
          setBids(bidsArray);
          lastUpdateRef.current = now;

          // Notify about latest bid
          if (bidsArray.length > 0) {
            onBidUpdate?.(bidsArray[0]);
          }
        } else {
          // Debounce rapid updates
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setBids(bidsArray);
            if (bidsArray.length > 0) {
              onBidUpdate?.(bidsArray[0]);
            }
          }, 100);
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to bids:', error);
      setError('Failed to load bids');
      setIsLoading(false);
    });

    listenersRef.current.push(() => off(bidsQuery, 'value', unsubscribe));
  }, [auctionId, onBidUpdate]);

  // Subscribe to rate limiting info
  const subscribeToRateLimit = useCallback(() => {
    if (!user?.uid) return;

    const rateLimitRef = ref(database, `rateLimits/${user.uid}`);
    
    const unsubscribe = onValue(rateLimitRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.cooldownUntil > Date.now()) {
          setCooldownUntil(data.cooldownUntil);
        } else {
          setCooldownUntil(0);
        }
      }
    });

    listenersRef.current.push(() => off(rateLimitRef, 'value', unsubscribe));
  }, [user?.uid]);

  // Place a bid using Realtime Database for real-time processing
  const placeBid = useCallback(async (amount: number): Promise<{success: boolean; error?: string}> => {
    if (!user?.uid || !auctionId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!auctionState) {
      return { success: false, error: 'Auction not loaded' };
    }

    // Validate bid amount
    const minBid = getNextMinimumBid();
    if (amount < minBid) {
      return { success: false, error: `Bid must be at least $${minBid.toFixed(2)}` };
    }

    // Check cooldown
    if (cooldownUntil > Date.now()) {
      const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
      return { success: false, error: `Please wait ${remaining}s before bidding` };
    }

    setIsPlacingBid(true);
    setError(null);

    try {
      // Use Realtime Database for immediate bid processing
      const bidsRef = ref(database, `auctions/${auctionId}/bids`);
      const newBid = {
        userId: user.uid,
        amount: Math.round(amount * 100) / 100,
        timestamp: Date.now(),
        status: 'pending'
      };

      await push(bidsRef, newBid);
      
      return { success: true, message: 'Bid placed successfully' };
    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place bid';
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacingBid(false);
    }
  }, [user?.uid, auctionId, auctionState, cooldownUntil, getNextMinimumBid]);


  // Initialize subscriptions
  useEffect(() => {
    if (!auctionId) return;

    setIsLoading(true);
    setError(null);

    // Clear existing listeners
    listenersRef.current.forEach(unsubscribe => unsubscribe());
    listenersRef.current = [];

    // Start new subscriptions
    subscribeToAuctionState();
    subscribeToBids();
    subscribeToRateLimit();

    return () => {
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [auctionId, subscribeToAuctionState, subscribeToBids, subscribeToRateLimit]);

  // Calculate bid increment
  const getNextMinimumBid = useCallback(() => {
    if (!auctionState) return 0;
    return Math.ceil((auctionState.currentPrice + 0.01) * 100) / 100;
  }, [auctionState]);

  // Get user's last bid
  const getUserLastBid = useCallback(() => {
    if (!user?.uid) return null;
    return bids.find(bid => bid.userId === user.uid);
  }, [bids, user?.uid]);

  // Check if user is winning
  const isUserWinning = useCallback(() => {
    if (!user?.uid || !auctionState) return false;
    return auctionState.lastBidderId === user.uid;
  }, [auctionState, user?.uid]);

  // Countdown timer
  const getTimeRemaining = useCallback(() => {
    if (!auctionState) return 0;
    return Math.max(0, auctionState.endTime - Date.now());
  }, [auctionState]);

  return {
    auctionState,
    bids,
    isLoading,
    error,
    isPlacingBid,
    cooldownUntil,
    placeBid,
    getNextMinimumBid,
    getUserLastBid,
    isUserWinning,
    getTimeRemaining,
    refresh: () => {
      setIsLoading(true);
      subscribeToAuctionState();
      subscribeToBids();
    }
  };
};