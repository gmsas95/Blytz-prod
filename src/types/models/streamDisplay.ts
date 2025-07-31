import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface StreamDisplay {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime?: FirebaseFirestoreTypes.Timestamp;
  status: 'scheduled' | 'live' | 'ended';
  productIds: string[];
  playbackUrl?: string;
  thumbnailUrl: string;
  viewers: number;
  category: string;
  currentBid?: number;
  productCount: number;
  isFeatured?: boolean;
}

export interface FeaturedStream {
  id: string;
  streamId: string;
  title: string;
  sellerName: string;
  viewers: number;
  thumbnailUrl: string;
  category: string;
  priority: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export const streamDisplayConverter = {
  toFirestore: (stream: StreamDisplay): FirebaseFirestoreTypes.DocumentData => {
    const {id, ...data} = stream;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): StreamDisplay => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
    } as StreamDisplay;
  },
};

export const featuredStreamConverter = {
  toFirestore: (featured: FeaturedStream): FirebaseFirestoreTypes.DocumentData => {
    const {id, ...data} = featured;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): FeaturedStream => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
    } as FeaturedStream;
  },
};