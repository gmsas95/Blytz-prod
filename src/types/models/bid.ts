import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export const bidConverter = {
  toFirestore: (bid: Bid): FirebaseFirestoreTypes.DocumentData => {
    return {
      auctionId: bid.auctionId,
      userId: bid.userId,
      amount: bid.amount,
      timestamp: bid.timestamp,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Bid => {
    const data = snapshot.data();
    const bid = data as Bid;
    bid.id = snapshot.id;
    return bid;
  },
};
