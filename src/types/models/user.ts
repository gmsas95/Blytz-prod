import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {ShippingAddress} from '../auth';

export interface PaymentMethod {
  id: string;
  type: string;
  isDefault?: boolean;
  brand?: string;
  last4?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  shippingAddresses?: ShippingAddress[];
  paymentMethods?: PaymentMethod[];
}

export const userConverter = {
  toFirestore: (user: User): FirebaseFirestoreTypes.DocumentData => {
    return {...user};
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): User => {
    const data = snapshot.data() as User;
    data.uid = snapshot.id;
    return data;
  },
};
