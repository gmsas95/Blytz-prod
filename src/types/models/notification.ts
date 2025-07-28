import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'bid' | 'order' | 'stream' | 'seller' | 'system' | 'payment' | 'shipping';
  isRead: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  readAt?: FirebaseFirestoreTypes.Timestamp;
  data?: {
    streamId?: string;
    orderId?: string;
    bidId?: string;
    sellerId?: string;
    productId?: string;
    amount?: number;
    screen?: string;
    params?: Record<string, unknown>;
  };
  priority: 'low' | 'medium' | 'high';
  imageUrl?: string;
  actionUrl?: string;
}

export const notificationConverter = {
  toFirestore: (
    notification: Notification,
  ): FirebaseFirestoreTypes.DocumentData => {
    return {...notification};
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Notification => {
    const data = snapshot.data() as Notification;
    data.id = snapshot.id;
    return data;
  },
};