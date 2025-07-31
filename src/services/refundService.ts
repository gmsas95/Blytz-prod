import { Timestamp } from 'firebase/firestore';
import { collection, doc, getDoc, getDocs, query, where, limit, addDoc, updateDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import {FiuuPaymentService} from './fiuuPayment';

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  userId: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
  message?: string;
}

export interface RefundStatus {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  refundTransactionId?: string;
  failureReason?: string;
  processedBy?: string;
}

export class RefundService {
  /**
   * Request a refund for an order
   */
  static async requestRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Validate order exists and belongs to user
      const orderDoc = await getDoc(doc(firestore, 'orders', request.orderId));
      if (!orderDoc.exists) {
        return { success: false, error: 'Order not found' };
      }

      const orderData = orderDoc.data();
      if (orderData?.userId !== request.userId) {
        return { success: false, error: 'Unauthorized access to order' };
      }

      // Check if order is eligible for refund
      const eligibleStatuses = ['paid', 'shipped', 'delivered'];
      if (!eligibleStatuses.includes(orderData?.status)) {
        return { success: false, error: 'Order is not eligible for refund' };
      }

      // Check if refund amount is valid
      if (request.amount <= 0 || request.amount > orderData?.totalPrice) {
        return { success: false, error: 'Invalid refund amount' };
      }

      // Check for existing refund requests
      const existingRefund = await getDocs(query(
        collection(firestore, 'refunds'),
        where('orderId', '==', request.orderId),
        where('status', 'in', ['pending', 'approved', 'processing']),
        limit(1)
      ));

      if (!existingRefund.empty) {
        return { success: false, error: 'Refund request already exists for this order' };
      }

      // Create refund request
      const refundData = {
        orderId: request.orderId,
        amount: request.amount,
        reason: request.reason,
        status: 'pending',
        requestedAt: new Date(),
        userId: request.userId,
        sellerId: orderData?.sellerId,
      };

      const refundRef = await addDoc(collection(firestore, 'refunds'), refundData);

      // Update order status
      await updateDoc(doc(firestore, 'orders', request.orderId), {
        status: 'refund_requested',
        refundRequest: {
          amount: request.amount,
          reason: request.reason,
          requestedAt: new Date(),
        },
        updatedAt: new Date(),
      });

      // Send notification to seller
      await this.notifySeller(orderData?.sellerId, request.orderId, request.amount, request.reason);

      return {
        success: true,
        refundId: refundRef.id,
        message: 'Refund request submitted successfully',
      };
    } catch (error) {
      console.error('Error requesting refund:', error);
      return { success: false, error: 'Failed to process refund request' };
    }
  }

  /**
   * Process refund approval/rejection by seller
   */
  static async processRefund(
    refundId: string,
    approved: boolean,
    processedBy: string,
    notes?: string
  ): Promise<RefundResponse> {
    try {
      const refundDoc = await getDoc(doc(firestore, 'refunds', refundId));
      if (!refundDoc.exists) {
        return { success: false, error: 'Refund request not found' };
      }

      const refundData = refundDoc.data();
      if (refundData?.status !== 'pending') {
        return { success: false, error: 'Refund request already processed' };
      }

      if (approved) {
        // Get payment details to get transaction ID
        const orderDoc = await getDoc(doc(firestore, 'orders', refundData.orderId));
        const orderData = orderDoc.data();

        if (!orderData?.transactionId) {
          return { success: false, error: 'Transaction ID not found' };
        }

        // Update refund status to processing
        await updateDoc(doc(firestore, 'refunds', refundId), {
          status: 'processing',
          processedAt: new Date(),
          processedBy,
          notes,
        });

        // Process actual refund via Fiuu
        const refundResult = await FiuuPaymentService.processRefund({
          transactionId: orderData.transactionId,
          amount: refundData.amount,
          reason: refundData.reason,
        });

        if (refundResult.status === '00') {
          // Update refund status to completed
          await updateDoc(doc(firestore, 'refunds', refundId), {
            status: 'completed',
            refundTransactionId: refundResult.refundId,
            processedAt: new Date(),
          });

          // Update order status
          await updateDoc(doc(firestore, 'orders', refundData.orderId), {
            status: 'refunded',
            updatedAt: new Date(),
          });

          // Send notification to user
          await this.notifyUser(refundData.userId, refundData.orderId, refundData.amount, 'approved');

          return {
            success: true,
            refundId: refundResult.refundId,
            message: 'Refund processed successfully',
          };
        } else {
          // Update refund status to failed
          await updateDoc(doc(firestore, 'refunds', refundId), {
            status: 'failed',
            failureReason: refundResult.error,
            processedAt: new Date(),
          });

          return {
            success: false,
            error: refundResult.error || 'Refund processing failed',
          };
        }
      } else {
        // Reject refund
        await updateDoc(doc(firestore, 'refunds', refundId), {
          status: 'rejected',
          processedAt: new Date(),
          processedBy,
          notes,
        });

        // Update order status back to original
        await updateDoc(doc(firestore, 'orders', refundData.orderId), {
          status: 'paid',
          updatedAt: new Date(),
        });

        // Send notification to user
        await this.notifyUser(refundData.userId, refundData.orderId, refundData.amount, 'rejected', notes);

        return {
          success: true,
          message: 'Refund request rejected',
        };
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }

  /**
   * Get refund requests for a seller
   */
  static async getSellerRefundRequests(
    sellerId: string,
    status?: string
  ): Promise<RefundStatus[]> {
    try {
      let q = query(
        collection(firestore, 'refunds'),
        where('sellerId', '==', sellerId),
        orderBy('requestedAt', 'desc')
      );

      if (status) {
        q = query(
          collection(firestore, 'refunds'),
          where('sellerId', '==', sellerId),
          where('status', '==', status),
          orderBy('requestedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate() || undefined,
      })) as RefundStatus[];
    } catch (error) {
      console.error('Error getting seller refund requests:', error);
      return [];
    }
  }

  /**
   * Get refund requests for a user
   */
  static async getUserRefundRequests(userId: string): Promise<RefundStatus[]> {
    try {
      const snapshot = await getDocs(query(
        collection(firestore, 'refunds'),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      ));

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate() || undefined,
      })) as RefundStatus[];
    } catch (error) {
      console.error('Error getting user refund requests:', error);
      return [];
    }
  }

  /**
   * Get refund details by ID
   */
  static async getRefundDetails(refundId: string): Promise<RefundStatus | null> {
    try {
      const refundDoc = await getDoc(doc(firestore, 'refunds', refundId));
      if (!refundDoc.exists()) return null;

      return {
        id: refundDoc.id,
        ...refundDoc.data(),
        requestedAt: refundDoc.data()?.requestedAt?.toDate() || new Date(),
        processedAt: refundDoc.data()?.processedAt?.toDate() || undefined,
      } as RefundStatus;
    } catch (error) {
      console.error('Error getting refund details:', error);
      return null;
    }
  }

  /**
   * Cancel a refund request (only if pending)
   */
  static async cancelRefundRequest(refundId: string, userId: string): Promise<RefundResponse> {
    try {
      const refundDoc = await getDoc(doc(firestore, 'refunds', refundId));
      if (!refundDoc.exists) {
        return { success: false, error: 'Refund request not found' };
      }

      const refundData = refundDoc.data();
      if (refundData?.userId !== userId) {
        return { success: false, error: 'Unauthorized access' };
      }

      if (refundData?.status !== 'pending') {
        return { success: false, error: 'Refund request cannot be cancelled' };
      }

      // Update refund status to cancelled
      await updateDoc(doc(firestore, 'refunds', refundId), {
        status: 'cancelled',
        processedAt: new Date(),
      });

      // Update order status back to original
      await updateDoc(doc(firestore, 'orders', refundData.orderId), {
        status: 'paid',
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: 'Refund request cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling refund request:', error);
      return { success: false, error: 'Failed to cancel refund request' };
    }
  }

  /**
   * Subscribe to refund status changes
   */
  static subscribeToRefundStatus(
    refundId: string,
    callback: (refund: RefundStatus | null) => void
  ): () => void {
    return onSnapshot(
      doc(firestore, 'refunds', refundId),
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data(),
            requestedAt: doc.data()?.requestedAt?.toDate() || new Date(),
            processedAt: doc.data()?.processedAt?.toDate() || undefined,
          } as RefundStatus);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to refund status:', error);
        callback(null);
      }
    );
  }

  /**
   * Private helper methods
   */
  private static async notifySeller(
    sellerId: string,
    orderId: string,
    amount: number,
    reason: string
  ) {
    try {
      // This would integrate with your notification service
      console.log(`Notifying seller ${sellerId} about refund request for order ${orderId}`);
    } catch (error) {
      console.error('Error notifying seller:', error);
    }
  }

  private static async notifyUser(
    userId: string,
    orderId: string,
    amount: number,
    action: 'approved' | 'rejected',
    notes?: string
  ) {
    try {
      // This would integrate with your notification service
      console.log(`Notifying user ${userId} about refund ${action} for order ${orderId}`);
    } catch (error) {
      console.error('Error notifying user:', error);
    }
  }
}