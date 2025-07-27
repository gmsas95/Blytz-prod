import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string; // UID of the seller
  stock: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export const productConverter = {
  toFirestore: (product: Product): FirebaseFirestoreTypes.DocumentData => {
    return {...product};
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Product => {
    const data = snapshot.data() as Product;
    data.id = snapshot.id;
    return data;
  },
};
