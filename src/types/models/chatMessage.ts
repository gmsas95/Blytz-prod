import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface ChatMessage {
  id: string;
  livestreamId: string;
  userId: string;
  userName: string; // Denormalized for easy display
  userAvatar?: string; // Denormalized for easy display
  text: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export const chatMessageConverter = {
  toFirestore: (
    message: ChatMessage,
  ): FirebaseFirestoreTypes.DocumentData => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = message;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): ChatMessage => {
    const data = snapshot.data();
    const message = data as ChatMessage;
    message.id = snapshot.id;
    return message;
  },
};
