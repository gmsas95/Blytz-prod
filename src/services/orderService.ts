import { firestore } from '../config/firebase.config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { Order, OrderItem, ShippingAddress, ShippingMethod } from '../types/models';

export class OrderService {
  private static ordersRef = collection(firestore, 'orders');
  private static orderItemsRef = collection(firestore, 'orderItems');

  static async createOrder(orderData: {
    userId: string;
    items: Array<{
      productId: string;
      title: string;
      price: number;
      quantity: number;
      image?: string;
      sellerId: string;
    }>;
    shippingAddress: ShippingAddress;
    shippingMethod: {
      id: string;
      name: string;
      price: number;
      estimatedDays: string;
    };
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<Order> {
    try {
      // Create order document
      const orderDoc = {
        userId: orderData.userId,
        orderNumber: this.generateOrderNumber(),
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        shippingMethod: orderData.shippingMethod,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
        notes: orderData.notes || '',
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      };

      const docRef = await addDoc(this.ordersRef, orderDoc);

      // Create individual order items for tracking
      const orderItems = orderData.items.map(item => ({
        orderId: docRef.id,
        productId: item.productId,
        sellerId: item.sellerId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        status: 'pending',
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      }));

      // Batch write order items
      for (const item of orderItems) {
        await addDoc(this.orderItemsRef, item);
      }

      // Create the complete order object
      const newOrder: Order = {
        id: docRef.id,
        orderNumber: orderDoc.orderNumber,
        userId: orderData.userId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        shippingMethod: orderData.shippingMethod,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
        notes: orderData.notes || '',
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
      };

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(this.ordersRef, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          metadata: {
            createdAt: data.metadata.createdAt,
            updatedAt: data.metadata.updatedAt,
          }
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  static async getUserOrders(userId: string, limitCount = 50): Promise<Order[]> {
    try {
      const q = query(
        this.ordersRef,
        where('userId', '==', userId),
        orderBy('metadata.createdAt', 'desc'),
        limit(limitCount as any)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        metadata: {
          createdAt: doc.data().metadata.createdAt,
          updatedAt: doc.data().metadata.updatedAt,
        }
      } as Order));
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error('Failed to get user orders');
    }
  }

  static async getSellerOrders(sellerId: string, limitCount = 50): Promise<Order[]> {
    try {
      // Get order items for this seller
      const itemsQuery = query(
        this.orderItemsRef,
        where('sellerId', '==', sellerId),
        orderBy('metadata.createdAt', 'desc'),
        limit(limitCount as any)
      );

      const itemsSnapshot = await getDocs(itemsQuery);
      const orderIds = [...new Set(itemsSnapshot.docs.map(doc => doc.data().orderId))];

      // Get full orders
      const orders: Order[] = [];
      for (const orderId of orderIds) {
        const order = await this.getOrder(orderId);
        if (order) orders.push(order);
      }

      return orders;
    } catch (error) {
      console.error('Error getting seller orders:', error);
      throw new Error('Failed to get seller orders');
    }
  }

  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        'metadata.updatedAt': serverTimestamp(),
      };

      const docRef = doc(this.ordersRef, orderId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  static async updatePaymentStatus(orderId: string, paymentData: {
    fiuuTransactionId: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: string;
    paidAt?: any;
  }): Promise<void> {
    try {
      await this.updateOrder(orderId, {
        fiuuTransactionId: paymentData.fiuuTransactionId,
        paymentStatus: paymentData.paymentStatus,
        paymentMethod: paymentData.paymentMethod,
        paidAt: paymentData.paidAt,
        ...(paymentData.paymentStatus === 'completed' ? { status: 'confirmed' } : {}),
        ...(paymentData.paymentStatus === 'failed' ? { status: 'payment_failed' } : {})
      });

      // Update order items status
      if (paymentData.paymentStatus === 'completed') {
        const itemsQuery = query(
          this.orderItemsRef,
          where('orderId', '==', orderId)
        );
        
        const itemsSnapshot = await getDocs(itemsQuery);
        for (const itemDoc of itemsSnapshot.docs) {
          await updateDoc(itemDoc.ref, {
            status: 'confirmed',
            'metadata.updatedAt': serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  static async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Only allow cancellation for pending or payment_failed orders
      if (!['pending', 'payment_failed', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }

      // Restore inventory for cancelled orders
      if (order.status === 'confirmed') {
        for (const item of order.items) {
          // Restore inventory via ProductService
          const { ProductService } = await import('./productService');
          await ProductService.updateInventory(item.productId, item.quantity);
        }
      }

      await this.updateOrder(orderId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp() as any,
      });

      // Update order items
      const itemsQuery = query(
        this.orderItemsRef,
        where('orderId', '==', orderId)
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      for (const itemDoc of itemsSnapshot.docs) {
        await updateDoc(itemDoc.ref, {
          status: 'cancelled',
          'metadata.updatedAt': serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      await this.updateOrder(orderId, {
        status,
        ...(status === 'shipped' ? { shippedAt: serverTimestamp() as any } : {}),
        ...(status === 'delivered' ? { deliveredAt: serverTimestamp() as any } : {})
      });

      // Update order items
      const itemsQuery = query(
        this.orderItemsRef,
        where('orderId', '==', orderId)
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      for (const itemDoc of itemsSnapshot.docs) {
        await updateDoc(itemDoc.ref, {
          status,
          'metadata.updatedAt': serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  static async getOrderByTransactionId(transactionId: string): Promise<Order | null> {
    try {
      const q = query(
        this.ordersRef,
        where('fiuuTransactionId', '==', transactionId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          metadata: {
            createdAt: doc.data().metadata.createdAt,
            updatedAt: doc.data().metadata.updatedAt,
          }
        } as Order;
      }

      return null;
    } catch (error) {
      console.error('Error getting order by transaction ID:', error);
      throw new Error('Failed to get order by transaction ID');
    }
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BLYTZ${timestamp}${random}`;
  }

  static async getOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
  }> {
    try {
      const q = query(
        this.ordersRef,
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => doc.data() as Order);

      return {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw new Error('Failed to get order stats');
    }
  }
}