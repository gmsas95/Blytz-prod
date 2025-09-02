import React, {createContext, useContext, useCallback} from 'react';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from '../services/firebase/firebase';

export interface Auction {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  currency: string;
  status: 'live' | 'upcoming' | 'ended';
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime: FirebaseFirestoreTypes.Timestamp;
  imageUrls: string[];
  sellerName: string;
  thumbnailUrl: string;
  sellerAvatar?: string;
  tags: string[];
  bids?: Bid[];
}

export interface Bid {
  id: string;
  userName: string;
  amount: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

interface AuctionContextType {
  getAuctionById: (auctionId: string) => Promise<Auction | null>;
  placeBid: (
    auctionId: string,
    amount: number,
    userId: string,
  ) => Promise<void>;
  watchAuction: (
    auctionId: string,
    callback: (auction: Auction) => void,
    onError: (error: Error) => void,
  ) => () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const getAuctionById = useCallback(async (auctionId: string) => {
    try {
      const auctionDoc = await firestore()
        .collection('auctions')
        .doc(auctionId)
        .get();
      if (auctionDoc.exists()) {
        return {id: auctionDoc.id, ...auctionDoc.data()} as Auction;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting auction by ID:', error);
      throw error;
    }
  }, []);

  const placeBid = useCallback(
    async (auctionId: string, amount: number, userId: string) => {
      try {
        const placeBidFunction = httpsCallable(functions, 'placeBid');
        const result = await placeBidFunction({
          auctionId,
          amount,
          userId,
        });
        
        const data = result.data as { success: boolean; error?: string };
        if (!data.success) {
          throw new Error(data.error || 'Failed to place bid');
        }
        
        console.log(
          `Bid of ${amount} placed on auction ${auctionId} by ${userId}`,
        );
      } catch (error) {
        console.error('Error placing bid:', error);
        throw error;
      }
    },
    [],
  );

  const watchAuction = useCallback(
    (
      auctionId: string,
      callback: (auction: Auction) => void,
      onError: (error: Error) => void,
    ) => {
      const auctionRef = database().ref(`auctions/${auctionId}`);
      const onValueChange = auctionRef.on(
        'value',
        snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Assuming the RTDB structure for auction matches the Firestore one for simplicity
            // In a real app, you might need to transform the data
            callback({id: snapshot.key!, ...data} as Auction);
          } else {
            onError(new Error('Auction not found in Realtime Database'));
          }
        },
        error => {
          onError(error as Error);
        },
      );
      return () => auctionRef.off('value', onValueChange);
    },
    [],
  );

  const value = {
    getAuctionById,
    placeBid,
    watchAuction,
  };

  return (
    <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
