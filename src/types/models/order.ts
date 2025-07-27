import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {ShippingAddress} from './shippingAddress';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export const orderConverter = {
  toFirestore: (order: Order): FirebaseFirestoreTypes.DocumentData => {
    const {id, ...data} = order; // eslint-disable-line @typescript-eslint/no-unused-vars
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Order => {
    const data = snapshot.data();
    const order = data as Order;
    order.id = snapshot.id;
    return order;
  },
};
