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
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  shippingAddresses?: ShippingAddress[];
  paymentMethods?: PaymentMethod[];
  refreshToken?: string; // Added for Firebase User compatibility
  tenantId?: string; // Added for Firebase User compatibility

  // Placeholder methods for now
  addShippingAddress?: (address: ShippingAddress) => Promise<void>;
  updateShippingAddress?: (address: ShippingAddress) => Promise<void>;
  deleteShippingAddress?: (addressId: string) => Promise<void>;
  getUpdatedUser?: () => Promise<User>;
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
