import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Payment {
  id: string;
  orderId: string;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  channel: string;
  fpxTransactionId?: string;
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  errorCode?: string;
  errorDescription?: string;
  processedAt: FirebaseFirestoreTypes.Timestamp;
  webhookData: any;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  requestedAt: FirebaseFirestoreTypes.Timestamp;
  processedAt?: FirebaseFirestoreTypes.Timestamp;
  refundTransactionId?: string;
}

export const paymentConverter = {
  toFirestore: (payment: Payment): FirebaseFirestoreTypes.DocumentData => {
    const {id, ...data} = payment;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Payment => {
    const data = snapshot.data();
    const payment = data as Payment;
    payment.id = snapshot.id;
    return payment;
  },
};

export const refundConverter = {
  toFirestore: (refund: Refund): FirebaseFirestoreTypes.DocumentData => {
    const {id, ...data} = refund;
    return data;
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Refund => {
    const data = snapshot.data();
    const refund = data as Refund;
    refund.id = snapshot.id;
    return refund;
  },
};