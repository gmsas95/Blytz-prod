import firestore from '@react-native-firebase/firestore';
import {
  userConverter,
  liveStreamConverter,
  bidConverter,
  productConverter,
  orderConverter,
  notificationConverter,
} from '../../types/models';

export const firebaseFirestore = {
  ...firestore(),
  converters: {
    user: userConverter,
    liveStream: liveStreamConverter,
    bid: bidConverter,
    product: productConverter,
    order: orderConverter,
    notification: notificationConverter,
  },
};
