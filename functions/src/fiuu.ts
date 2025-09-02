import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import * as crypto from 'crypto';

const firestore = admin.firestore();

function generateFiuuSignature(data: Record<string, any>, verifyKey: string): string {
  const sortedParams = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  
  return crypto.createHmac('sha256', verifyKey).update(sortedParams).digest('hex');
}

export const fiuuWebhook = onRequest(
  { 
    cors: true,
    region: 'asia-southeast1',
    secrets: ["FIUU_VERIFY_KEY", "FIUU_TRUSTED_IPS"]
  },
  async (req, res) => {
    try {
      const payload = req.body;
      logger.info('Fiuu webhook received:', { orderid: payload.orderid, status: payload.status });

      const clientIP = (req.headers['x-forwarded-for'] as string) || (req.headers['x-real-ip'] as string) || req.connection.remoteAddress;
      const trustedIPs = process.env.FIUU_TRUSTED_IPS?.split(',') || [];
      
      if (trustedIPs.length > 0 && !trustedIPs.some((ip: string) => clientIP?.includes(ip.trim()))) {
        logger.error('Webhook from untrusted IP', { clientIP, trustedIPs });
        res.status(403).send('Forbidden');
        return;
      }

      const rateLimitKey = `webhook_rate_${clientIP}`;
      const rateLimitRef = firestore.collection('rate_limits').doc(rateLimitKey);
      const rateLimitDoc = await rateLimitRef.get();
      
      if (rateLimitDoc.exists) {
        const lastRequest = rateLimitDoc.data()?.lastRequest?.toMillis() || 0;
        const now = Date.now();
        if (now - lastRequest < 5000) { // 5 seconds between requests
          logger.error('Rate limit exceeded', { clientIP });
          res.status(429).send('Too many requests');
          return;
        }
      }
      
      await rateLimitRef.set({ lastRequest: FieldValue.serverTimestamp() });
      
      const webhookTimestamp = payload.timestamp;
      if (webhookTimestamp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDiff = Math.abs(currentTime - parseInt(webhookTimestamp));
        if (timeDiff > 300) { // 5 minutes tolerance
          logger.error('Webhook timestamp too old, possible replay attack', { 
            webhookTimestamp, 
            currentTime, 
            timeDiff,
            clientIP 
          });
          res.status(400).send('Invalid timestamp');
          return;
        }
      }

      const webhookNonce = payload.nonce || payload.orderid + '_' + webhookTimestamp;
      const nonceRef = firestore.collection('webhook_nonces').doc(webhookNonce);
      const nonceDoc = await nonceRef.get();
      
      if (nonceDoc.exists) {
        logger.error('Duplicate webhook nonce', { nonce: webhookNonce });
        res.status(200).send('Already processed');
        return;
      }
      
      await nonceRef.set({ 
        processedAt: FieldValue.serverTimestamp(),
        clientIP: clientIP,
        orderId: payload.orderid
      });

      const verifyKey = process.env.FIUU_VERIFY_KEY || '';
      if (!verifyKey) {
        logger.error('FIUU_VERIFY_KEY not configured');
        res.status(500).send('Server configuration error');
        return;
      }

      const receivedSignature = payload.signature;
      const calculatedSignature = generateFiuuSignature(payload, verifyKey);

      if (!receivedSignature || receivedSignature !== calculatedSignature) {
        logger.error('Invalid webhook signature', { 
          received: receivedSignature, 
          calculated: calculatedSignature,
          clientIP 
        });
        res.status(401).send('Unauthorized');
        return;
      }

      const requiredFields = ['orderid', 'status', 'amount', 'currency'];
      for (const field of requiredFields) {
        if (!payload[field]) {
          logger.error(`Missing required field: ${field}`);
          res.status(400).send(`Missing field: ${field}`);
          return;
        }
      }

      const {
        orderid,
        txn_id,
        status,
        amount,
        currency,
        error_code,
        error_desc,
        channel,
        payment_method,
        fpx_transaction_id,
        buyer_name,
        buyer_email,
        buyer_phone
      } = payload;

      const ordersSnapshot = await firestore
        .collection('orders')
        .where('orderId', '==', orderid)
        .limit(1)
        .get();

      if (ordersSnapshot.empty) {
        logger.error(`Order not found: ${orderid}`);
        res.status(404).send('Order not found');
        return;
      }

      const orderDoc = ordersSnapshot.docs[0];
      const orderData = orderDoc.data();

      if (!orderData) {
        logger.error(`Order data not found for order: ${orderid}`);
        res.status(404).send('Order data not found');
        return;
      }

      const paymentRecord = {
        orderId: orderid,
        transactionId: txn_id,
        status: status,
        amount: parseFloat(amount),
        currency: currency,
        paymentMethod: payment_method,
        channel: channel,
        fpxTransactionId: fpx_transaction_id,
        buyerInfo: {
          name: buyer_name,
          email: buyer_email,
          phone: buyer_phone
        },
        errorCode: error_code,
        errorDescription: error_desc,
        processedAt: FieldValue.serverTimestamp(),
        webhookData: payload
      };

      await firestore.collection('payments').add(paymentRecord);

      let newOrderStatus = orderData.status;
      switch (status) {
        case '00': // Success
          newOrderStatus = 'paid';
          break;
        case '11': // Pending
          newOrderStatus = 'pending_payment';
          break;
        case '22': // Failed
          newOrderStatus = 'payment_failed';
          break;
        case '33': // Cancelled
          newOrderStatus = 'cancelled';
          break;
        default:
          newOrderStatus = 'payment_error';
      }

      await orderDoc.ref.update({
        status: newOrderStatus,
        paymentStatus: status,
        transactionId: txn_id,
        paymentMethod: payment_method,
        updatedAt: FieldValue.serverTimestamp()
      });

      if (status === '00') {
        const buyerMessage = {
          notification: {
            title: 'Payment Successful',
            body: `Your payment of ${currency} ${amount} for order ${orderid} has been processed successfully.`,
          },
          topic: `user_${orderData.userId}`,
        };
        await admin.messaging().send(buyerMessage);

        const sellerMessage = {
          notification: {
            title: 'New Order Paid',
            body: `Order ${orderid} has been paid. Please prepare for shipment.`,
          },
          topic: `seller_${orderData.sellerId}`,
        };
        await admin.messaging().send(sellerMessage);
      } else if (status === '22' || status === '33') {
        const buyerMessage = {
          notification: {
            title: 'Payment Failed',
            body: `Your payment for order ${orderid} failed. Please try again.`,
          },
          topic: `user_${orderData.userId}`,
        };
        await admin.messaging().send(buyerMessage);
      }

      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error processing Fiuu webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

export const processRefund = onRequest(
  {
    cors: true,
    region: 'asia-southeast1',
  },
  async (req, res) => {
    try {
      const {orderId, amount, reason} = req.body;
      
      if (!orderId || !amount) {
        res.status(400).json({error: 'Missing required fields'});
        return;
      }

      const orderDoc = await firestore.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({error: 'Order not found'});
        return;
      }

      const orderData = orderDoc.data();
      
      if (!orderData || !['paid', 'shipped'].includes(orderData.status)) {
        res.status(400).json({error: 'Order not eligible for refund'});
        return;
      }

      const refundRecord = {
        orderId,
        amount,
        reason,
        status: 'pending',
        requestedAt: FieldValue.serverTimestamp(),
        processedAt: null,
        refundTransactionId: null
      };

      const refundDoc = await firestore.collection('refunds').add(refundRecord);

      await orderDoc.ref.update({
        status: 'refund_requested',
        refundRequest: {
          amount,
          reason,
          requestedAt: FieldValue.serverTimestamp()
        },
        updatedAt: FieldValue.serverTimestamp()
      });

      const sellerMessage = {
        notification: {
          title: 'Refund Request',
          body: `Refund requested for order ${orderId} - ${reason}`,
        },
        topic: `seller_${orderData.sellerId}`,
      };
      await admin.messaging().send(sellerMessage);

      res.json({success: true, refundId: refundDoc.id});
    } catch (error) {
      logger.error('Error processing refund:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
);

export const approveRefund = onRequest(
  {
    cors: true,
    region: 'asia-southeast1',
  },
  async (req, res) => {
    try {
      const {refundId, approved} = req.body;
      
      if (!refundId) {
        res.status(400).json({error: 'Missing refund ID'});
        return;
      }

      const refundDoc = await firestore.collection('refunds').doc(refundId).get();
      if (!refundDoc.exists) {
        res.status(404).json({error: 'Refund not found'});
        return;
      }

      const refundData = refundDoc.data();

      if (!refundData) {
        res.status(404).json({error: 'Refund data not found'});
        return;
      }
      
      if (approved) {
        await refundDoc.ref.update({
          status: 'approved',
          processedAt: FieldValue.serverTimestamp()
        });

        await firestore.collection('orders').doc(refundData.orderId).update({
          status: 'refunded',
          updatedAt: FieldValue.serverTimestamp()
        });

        const orderDoc = await firestore.collection('orders').doc(refundData.orderId).get();
        const orderData = orderDoc.data();

        if (!orderData) {
          logger.error(`Order data not found for order: ${refundData.orderId}`);
          res.status(404).send('Order data not found');
          return;
        }
        
        const buyerMessage = {
          notification: {
            title: 'Refund Approved',
            body: `Your refund for order ${refundData.orderId} has been approved.`,
          },
          topic: `user_${orderData.userId}`,
        };
        await admin.messaging().send(buyerMessage);
      } else {
        await refundDoc.ref.update({
          status: 'rejected',
          processedAt: FieldValue.serverTimestamp()
        });

        if (refundData) {
          await firestore.collection('orders').doc(refundData.orderId).update({
            status: 'paid',
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }

      res.json({success: true});
    } catch (error) {
      logger.error('Error approving refund:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
);
