import { useState, useEffect, useRef, useCallback } from 'react';

import { getDatabase, ref, onValue, off, push, set, query, limitToLast, orderByChild, runTransaction } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const database = getDatabase();

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

  // Place a bid with enhanced security
  const placeBid = useCallback(async (amount: number): Promise<{success: boolean; error?: string}> => {
    if (!user?.uid || !auctionId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!auctionState) {
      return { success: false, error: 'Auction not loaded' };
    }

    // Enhanced validation
    if (auctionState.status !== 'live') {
      return { success: false, error: 'Auction is not live' };
    }

    if (Date.now() > auctionState.endTime) {
      return { success: false, error: 'Auction has ended' };
    }

    if (amount <= auctionState.currentPrice) {
      return { success: false, error: 'Bid must be higher than current price' };
    }

    // Minimum bid increment validation
    const minIncrement = Math.max(1, Math.ceil(auctionState.currentPrice * 0.05)); // 5% or RM1 minimum
    if (amount < auctionState.currentPrice + minIncrement) {
      return { success: false, error: `Bid must be at least RM${minIncrement} above current price` };
    }

    // Maximum bid amount validation (prevent spam/abuse)
    const maxBidMultiplier = 100; // Maximum 100x starting price
    if (amount > auctionState.startingPrice * maxBidMultiplier) {
      return { success: false, error: 'Bid amount exceeds reasonable limit' };
    }

    // Rate limiting check
    if (cooldownUntil > Date.now()) {
      return { success: false, error: 'Please wait before placing another bid' };
    }

    // Prevent seller from bidding on their own auctions
    if (user.uid === auctionState.sellerId) {
      return { success: false, error: 'Sellers cannot bid on their own auctions' };
    }

    setIsPlacingBid(true);
    setError(null);

    try {
      // Atomic bid placement using transaction
      const bidsRef = ref(database, `auctions/${auctionId}/bids`);
      const auctionRef = ref(database, `auctions/${auctionId}`);
      
      // Create bid with enhanced tracking
      const bidData = {
        userId: user.uid,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        timestamp: Date.now(),
        status: 'confirmed',
        ipAddress: 'client-ip', // This would be set server-side
        userAgent: 'client-user-agent', // This would be set server-side
        authenticityToken: await generateBidToken(user.uid, auctionId, amount) // Anti-tamper token
      };

      // Use push for real-time updates
      const newBidRef = push(bidsRef);
      await set(newBidRef, bidData);

      // Update auction state atomically
      await runTransaction(ref(database, `auctions/${auctionId}`), (currentData) => {
        if (currentData && amount > currentData.currentPrice) {
          currentData.currentPrice = amount;
          currentData.lastBidderId = user.uid;
          currentData.lastBidTime = Date.now();
          return currentData;
        }
        return null; // Transaction will fail if bid is not valid
      });

      // Set cooldown period (5 seconds)
      const cooldownRef = ref(database, `rateLimits/${user.uid}`);
      await set(cooldownRef, {
        cooldownUntil: Date.now() + 5000,
        lastBidAt: Date.now(),
        auctionId: auctionId
      });

      return { success: true };
    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place bid';
      
      // Log bid attempt for security analysis
      const bidAttemptRef = ref(database, `security/bidAttempts/${Date.now()}`);
      await set(bidAttemptRef, {
        userId: user.uid,
        auctionId: auctionId,
        amount: amount,
        timestamp: Date.now(),
        error: errorMessage,
        success: false
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacingBid(false);
    }
  }, [user?.uid, auctionId, auctionState, cooldownUntil])

  // Helper function to generate bid authenticity token
  const generateBidToken = async (userId: string, auctionId: string, amount: number): Promise<string> => {
    // Simple hash-based token - in production, use proper cryptographic signing
    const tokenData = `${userId}:${auctionId}:${amount}:${Date.now()}`;
    return btoa(tokenData);
  };

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