import { collection, query, where, orderBy, limit, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import { Product } from '../../types/models/product';

export interface AuctionProduct extends Product {
  auctionDetails: {
    startingPrice: number;
    reservePrice?: number;
    currentBid?: number;
    endTime: Date;
    bidIncrement: number;
    status: 'live' | 'upcoming' | 'ended';
  };
  sellerName: string;
  sellerAvatar?: string;
}

export const auctionsService = {
  async getAuctionProducts(): Promise<AuctionProduct[]> {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('auctionDetails', '!=', null),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          auctionDetails: {
            ...data.auctionDetails,
            endTime: data.auctionDetails.endTime.toDate(),
          },
          createdAt: data.createdAt.toDate(),
        } as AuctionProduct;
      });
    } catch (error) {
      console.error('Error fetching auction products:', error);
      return [];
    }
  },

  subscribeToAuctionProducts(callback: (products: AuctionProduct[]) => void) {
    const q = query(
      collection(firestore, 'products'),
      where('auctionDetails', '!=', null),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          auctionDetails: {
            ...data.auctionDetails,
            endTime: data.auctionDetails.endTime.toDate(),
          },
          createdAt: data.createdAt.toDate(),
        } as AuctionProduct;
      });
      callback(products);
    }, (error) => {
      console.error('Error in auction products subscription:', error);
      callback([]);
    });
  },

  async getProductsByStatus(status: 'live' | 'upcoming' | 'ended'): Promise<AuctionProduct[]> {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('auctionDetails.status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          auctionDetails: {
            ...data.auctionDetails,
            endTime: data.auctionDetails.endTime.toDate(),
          },
          createdAt: data.createdAt.toDate(),
        } as AuctionProduct;
      });
    } catch (error) {
      console.error(`Error fetching ${status} products:`, error);
      return [];
    }
  },

  async getProductsByCategory(category: string): Promise<AuctionProduct[]> {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('auctionDetails', '!=', null),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          auctionDetails: {
            ...data.auctionDetails,
            endTime: data.auctionDetails.endTime.toDate(),
          },
          createdAt: data.createdAt.toDate(),
        } as AuctionProduct;
      });
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      return [];
    }
  },

  async getFeaturedAuctions(): Promise<AuctionProduct[]> {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('auctionDetails', '!=', null),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          auctionDetails: {
            ...data.auctionDetails,
            endTime: data.auctionDetails.endTime.toDate(),
          },
          createdAt: data.createdAt.toDate(),
        } as AuctionProduct;
      });
    } catch (error) {
      console.error('Error fetching featured auctions:', error);
      return [];
    }
  }
};