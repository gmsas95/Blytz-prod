import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface LiveStream {
  id: string;
  title: string;
  sellerId: string;
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime?: FirebaseFirestoreTypes.Timestamp;
  status: 'scheduled' | 'live' | 'ended';
  productIds: string[];
  playbackUrl?: string; // URL provided by LiveKit
}

export const liveStreamConverter = {
  toFirestore: (
    liveStream: LiveStream,
  ): FirebaseFirestoreTypes.DocumentData => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, ...data} = liveStream;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): LiveStream => {
    const data = snapshot.data();
    const liveStream = data as LiveStream;
    liveStream.id = snapshot.id;
    return liveStream;
  },
};
