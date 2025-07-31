import { DocumentData, QueryDocumentSnapshot, Timestamp, SnapshotOptions } from 'firebase/firestore';

export interface ShippingAddress {
  id?: string;
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded';
  paymentStatus: 'pending' | 'initiated' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  fiuuTransactionId?: string;
  transactionId?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  paidAt?: Timestamp;
  refundRequest?: {
    amount: number;
    reason: string;
    requestedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export const orderConverter = {
  toFirestore: (order: Order): DocumentData => {
    const { id, ...data } = order;
    return data;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Order => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      metadata: {
        createdAt: data.metadata.createdAt,
        updatedAt: data.metadata.updatedAt,
      }
    } as Order;
  },
};
