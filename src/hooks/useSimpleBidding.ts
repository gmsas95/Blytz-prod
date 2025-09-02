import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/firebase/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase/firebase';

export interface Bid {
  id: string;
  userId: string;
  amount: number;
  timestamp: number;
}

export interface Auction {
  currentPrice: number;
  startingPrice: number;
  status: string;
  endTime: number;
  productId: string;
  sellerId: string;
}

export const useSimpleBidding = (auctionId: string) => {
  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);

  // Real-time auction updates
  useEffect(() => {
    if (!auctionId) return;

    const auctionRef = ref(database, `auctions/${auctionId}`);
    const bidsRef = ref(database, `auctions/${auctionId}/bids`);

    const unsubscribeAuction = onValue(auctionRef, (snapshot) => {
      if (snapshot.exists()) {
        setAuction(snapshot.val());
      }
      setLoading(false);
    });

    const unsubscribeBids = onValue(bidsRef, (snapshot) => {
      if (snapshot.exists()) {
        const bidsData = snapshot.val();
        const bidsArray = Object.entries(bidsData || {}).map(([id, bid]: [string, any]) => ({
          id,
          userId: bid.userId,
          amount: bid.amount,
          timestamp: bid.timestamp
        })).sort((a, b) => b.timestamp - a.timestamp);
        setBids(bidsArray);
      }
    });

    return () => {
      unsubscribeAuction();
      unsubscribeBids();
    };
  }, [auctionId]);

  // Place bid using Cloud Function (reliable)
  const placeBid = async (amount: number) => {
    if (!user?.uid || !auction) return { success: false, error: 'Not authenticated' };

    setPlacingBid(true);
    try {
      const placeBidFunction = httpsCallable(functions, 'placeBid');
      const result = await placeBidFunction({ auctionId, amount });
      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to place bid' };
    } finally {
      setPlacingBid(false);
    }
  };

  // Quick bid via RTDB (fallback)
  const placeBidDirect = async (amount: number) => {
    if (!user?.uid || !auction) return { success: false, error: 'Not authenticated' };

    setPlacingBid(true);
    try {
      if (amount <= auction.currentPrice) {
        return { success: false, error: 'Bid must be higher' };
      }

      const bidsRef = ref(database, `auctions/${auctionId}/bids`);
      const newBid = {
        userId: user.uid,
        amount,
        timestamp: Date.now()
      };

      await push(bidsRef, newBid);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setPlacingBid(false);
    }
  };

  const getMinimumBid = () => {
    return auction ? auction.currentPrice + 0.01 : 0;
  };

  const isUserWinning = () => {
    if (!user?.uid || !bids.length) return false;
    return bids[0]?.userId === user.uid;
  };

  return {
    auction,
    bids,
    loading,
    placingBid,
    placeBid,
    placeBidDirect,
    getMinimumBid,
    isUserWinning
  };
};