import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'stream' | 'bid' | 'order';
  isRead: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp;
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
