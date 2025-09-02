import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions, database } from '../services/firebase/firebase';

interface Bid {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed';
}

interface AuctionState {
  currentPrice: number;
  startingPrice: number;
  status: 'live' | 'ended' | 'pending';
  endTime: number;
  sellerId: string;
  productId: string;
  lastBidderId: string;
  lastBidTime: number;
  bidCount: number;
}

export const useLiveBidding = (auctionId: string) => {
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionState | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    setIsLoading(true);

    // Listen to auction state
    const auctionRef = ref(database, `auctions/${auctionId}`);
    const bidsRef = ref(database, `auctions/${auctionId}/bids`);

    const unsubscribeAuction = onValue(auctionRef, (snapshot) => {
      if (snapshot.exists()) {
        setAuction(snapshot.val());
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading auction:', error);
      setError('Failed to load auction');
      setIsLoading(false);
    });

    const unsubscribeBids = onValue(bidsRef, (snapshot) => {
      if (snapshot.exists()) {
        const bidsData = snapshot.val();
        const bidsArray = Object.entries(bidsData || {})
          .map(([id, bid]: [string, any]) => ({
            id,
            userId: bid.userId,
            userName: bid.userName || 'Anonymous',
            userAvatar: bid.userAvatar || '',
            amount: bid.amount,
            timestamp: bid.timestamp,
            status: bid.status || 'confirmed'
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setBids(bidsArray);
      }
    }, (error) => {
      console.error('Error loading bids:', error);
    });

    return () => {
      off(auctionRef, 'value', unsubscribeAuction);
      off(bidsRef, 'value', unsubscribeBids);
    };
  }, [auctionId]);

  const placeBid = async (amount: number) => {
    if (!user?.uid) {
      return { success: false, error: 'Please log in to place bids' };
    }

    if (!auction || auction.status !== 'live') {
      return { success: false, error: 'Auction is not live' };
    }

    if (amount <= auction.currentPrice) {
      return { success: false, error: 'Bid must be higher than current price' };
    }

    setIsPlacingBid(true);
    setError(null);

    try {
      const placeBidFunction = httpsCallable(functions, 'placeBid');
      const result = await placeBidFunction({
        auctionId,
        amount: Math.round(amount * 100) / 100,
      });

      if (result.data.success) {
        return { success: true, message: 'Bid placed successfully!' };
      } else {
        return { success: false, error: result.data.error || 'Failed to place bid' };
      }
    } catch (error: any) {
      console.error('Bid placement error:', error);
      return { success: false, error: error.message || 'Failed to place bid' };
    } finally {
      setIsPlacingBid(false);
    }
  };

  const getMinimumBid = () => {
    return auction ? Math.max(auction.currentPrice + 0.01, 0.01) : 0.01;
  };

  const isUserWinning = () => {
    if (!user?.uid || !bids.length) return false;
    return bids[0]?.userId === user.uid;
  };

  const getTimeRemaining = () => {
    if (!auction) return 0;
    return Math.max(0, auction.endTime - Date.now());
  };

  return {
    auction,
    bids,
    isLoading,
    isPlacingBid,
    error,
    placeBid,
    getMinimumBid,
    isUserWinning,
    getTimeRemaining,
    refresh: () => {
      setIsLoading(true);
      setError(null);
    }
  };
};