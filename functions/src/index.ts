import * as admin from 'firebase-admin';
import {
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import {onValueCreated} from 'firebase-functions/v2/database';
import {onRequest} from 'firebase-functions/v2/https';
import {FieldValue} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';
import * as crypto from 'crypto';

admin.initializeApp();

// Import bidding functions
export * from './bidding';
// Import seller onboarding functions
export * from './sellerOnboarding';
// Import seller functions
export * from './seller';
// Import webhook functions
export * from './webhooks';
export * from './livestream';

// Firestore references
const firestore = admin.firestore();

// 1. onAuctionStart: Triggered when an auction starts (e.g., status changes to 'live-auction')
export const onAuctionStart = onDocumentUpdated(
  'auctions/{auctionId}',
  async event => {
    const auctionBefore = event.data?.before.data();
    const auctionAfter = event.data?.after.data();
    const auctionId = event.params.auctionId;

    if (!auctionBefore || !auctionAfter) {
      logger.warn(`No data for auction ${auctionId} in onAuctionStart.`);
      return;
    }

    // Check if auction status changed to 'live-auction'
    if (
      auctionBefore.status !== 'live-auction' &&
      auctionAfter.status === 'live-auction'
    ) {
      logger.info(`Auction ${auctionId} started!`, auctionAfter);

      const endTime = auctionAfter.endTime.toDate();
      const now = new Date();
      const duration = endTime.getTime() - now.getTime();

      if (duration > 0) {
        // Schedule a Cloud Task or Pub/Sub message to end the auction
        // For simplicity, we'll use a delayed Firestore update for now.
        // In a real app, use Cloud Tasks for reliable scheduling.
        setTimeout(async () => {
          await firestore.collection('auctions').doc(auctionId).update({
            status: 'ended',
            // You might want to add a 'winner' field here based on the last bid
          });
          logger.info(`Auction ${auctionId} ended by scheduled task.`);
        }, duration);
      } else {
        logger.warn(
          `Auction ${auctionId} started with an end time in the past.`,
        );
        await firestore.collection('auctions').doc(auctionId).update({
          status: 'ended',
        });
      }
    }
  },
);

// 2. onNewBid: Triggered when a new bid is placed in Realtime Database
export const onNewBid = onValueCreated(
  {ref: 'auctions/{auctionId}/bids/{bidId}', region: 'asia-southeast1'},
  async event => {
    const bid = event.data.val();
    const {auctionId, bidId} = event.params;

    logger.info(`Processing bid ${bidId} for auction ${auctionId}...`, {bid});

    const auctionRef = firestore.collection('auctions').doc(auctionId);

    try {
      const auctionDoc = await auctionRef.get();

      if (!auctionDoc.exists) {
        logger.error(
          `Auction ${auctionId} not found for bid ${bidId}. Deleting invalid bid.`,
        );
        await event.data.ref.remove();
        return;
      }

      const auctionData = auctionDoc.data();

      if (!auctionData) {
        logger.error(
          `Auction data for ${auctionId} not found. Deleting invalid bid.`,
        );
        await event.data.ref.remove();
        return;
      }

      if (auctionData.status !== 'live-auction') {
        logger.warn(
          `Bid ${bidId} received for non-live auction ${auctionId}. Deleting bid.`,
        );
        await event.data.ref.remove();
        return;
      }

      if (bid.amount <= auctionData.currentPrice) {
        logger.warn(
          `Bid ${bidId} amount (${bid.amount}) is not higher than current price (${auctionData.currentPrice}). Deleting bid.`,
        );
        await event.data.ref.remove();
        return;
      }

      await auctionRef.update({
        currentPrice: bid.amount,
        lastBidderId: bid.userId,
        lastBidTime: FieldValue.serverTimestamp(),
      });

      logger.info(
        `Successfully updated auction ${auctionId} with new bid ${bidId}.`,
      );

      if (auctionData.antiSnipingEnabled && auctionData.endTime) {
        const endTime = auctionData.endTime.toDate();
        const now = new Date();
        const timeRemaining = endTime.getTime() - now.getTime();
        const antiSnipingExtensionMs = 10 * 1000; // 10 seconds

        if (timeRemaining < antiSnipingExtensionMs) {
          const newEndTime = new Date(now.getTime() + antiSnipingExtensionMs);
          await auctionRef.update({
            endTime: admin.firestore.Timestamp.fromDate(newEndTime),
          });
          logger.info(
            `Auction ${auctionId} extended by anti-sniping rule. New end time: ${newEndTime.toISOString()}`,
          );
        }
      }

      // TODO: Notify previous high bidder
    } catch (error) {
      logger.error(
        `Error processing bid ${bidId} for auction ${auctionId}:`,
        error,
      );
      // Attempt to delete the bid to prevent reprocessing
      await event.data.ref.remove();
    }
  },
);

// 3. onAuctionEnd: Triggered when an auction ends (e.g., status changes to 'ended')
export const onAuctionEnd = onDocumentUpdated(
  'auctions/{auctionId}',
  async event => {
    const auctionBefore = event.data?.before.data();
    const auctionAfter = event.data?.after.data();
    const auctionId = event.params.auctionId;

    if (!auctionBefore || !auctionAfter) {
      logger.warn(`No data for auction ${auctionId} in onAuctionEnd.`);
      return;
    }

    // Check if auction status changed to 'ended'
    if (auctionBefore.status !== 'ended' && auctionAfter.status === 'ended') {
      logger.info(`Auction ${auctionId} has officially ended!`, auctionAfter);

      const winnerId = auctionAfter.lastBidderId;
      const finalPrice = auctionAfter.currentPrice;

      if (winnerId) {
        logger.info(
          `Winner for auction ${auctionId}: ${winnerId} with price ${finalPrice}`,
        );

        // Create an order for the winner
        const order = {
          userId: winnerId,
          productId: auctionAfter.productId, // Assuming productId is on the auction doc
          quantity: 1,
          totalPrice: finalPrice,
          status: 'pending', // Or 'paid' if payment is handled differently
          shippingAddress: {}, // TODO: Get winner's default shipping address
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        await firestore.collection('orders').add(order);

        // Notify winner
        const message = {
          notification: {
            title: 'You won an auction!',
            body: `Congratulations! You won the auction for ${auctionAfter.title} for ${finalPrice}`,
          },
          topic: `user_${winnerId}`,
        };

        await admin.messaging().send(message);

        // TODO: Notify seller (using FCM)
      } else {
        logger.info(`Auction ${auctionId} ended with no bids.`);
        // TODO: Notify seller that item was not sold
      }
    }
  },
);

// 4. onBuyNow: Triggered when a product is bought directly (e.g., status changes to 'sold-buy-now')
export const onBuyNow = onDocumentUpdated(
  'products/{productId}',
  async event => {
    const productBefore = event.data?.before.data();
    const productAfter = event.data?.after.data();
    const productId = event.params.productId;

    if (!productBefore || !productAfter) {
      logger.warn(`No data for product ${productId} in onBuyNow.`);
      return;
    }

    // Check if product status changed to 'sold-buy-now'
    if (
      productBefore.status !== 'sold-buy-now' &&
      productAfter.status === 'sold-buy-now'
    ) {
      logger.info(`Product ${productId} bought via Buy Now!`, productAfter);

      const buyerId = productAfter.buyerId; // Assuming buyerId is set on the product
      const finalPrice = productAfter.fixedPrice; // Assuming fixedPrice is used for buy now

      if (buyerId) {
        logger.info(
          `Buyer for product ${productId}: ${buyerId} with price ${finalPrice}`,
        );

        // Create an order for the buyer
        const order = {
          userId: buyerId,
          productId: productId,
          quantity: 1,
          totalPrice: finalPrice,
          status: 'pending', // Or 'paid' if payment is handled differently
          shippingAddress: {}, // TODO: Get buyer's default shipping address
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        await firestore.collection('orders').add(order);

        // Notify buyer
        const message = {
          notification: {
            title: 'Purchase confirmation',
            body: `You successfully purchased ${productAfter.title} for ${finalPrice}`,
          },
          topic: `user_${buyerId}`,
        };

        await admin.messaging().send(message);

        // TODO: Notify seller (using FCM)
      } else {
        logger.error(
          `Product ${productId} sold via Buy Now but no buyerId found.`,
        );
      }
    }
  },
);

// FIUU PAYMENT INTEGRATION FUNCTIONS

// Helper function to generate Fiuu signature using HMAC-SHA256
function generateFiuuSignature(data: Record<string, any>, verifyKey: string): string {
  const sortedParams = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  
  return crypto.createHmac('sha256', verifyKey).update(sortedParams).digest('hex');
}

// Fiuu Payment Webhook Handler
export const fiuuWebhook = onRequest(
  {
    cors: true,
    region: 'asia-southeast1',
  },
  async (req, res) => {
    try {
      const payload = req.body;
      logger.info('Fiuu webhook received:', { orderid: payload.orderid, status: payload.status });

      // Security validations
      // 1. IP validation - only allow from trusted Fiuu IPs
      const clientIP = (req.headers['x-forwarded-for'] as string) || (req.headers['x-real-ip'] as string) || req.connection.remoteAddress;
      const trustedIPs = process.env.FIUU_TRUSTED_IPS?.split(',') || [];
      
      if (trustedIPs.length > 0 && !trustedIPs.some((ip: string) => clientIP?.includes(ip.trim()))) {
        logger.error('Webhook from untrusted IP', { clientIP, trustedIPs });
        res.status(403).send('Forbidden');
        return;
      }

      // 2. Rate limiting - check for recent requests from same IP
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
      
      // 3. Timestamp validation - prevent replay attacks
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

      // 4. Nonce validation - prevent duplicate processing
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

      // 3. Verify webhook signature with HMAC-SHA256
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

      // 4. Input validation
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

      // Update order with payment status
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

      // Create payment record
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

      // Save payment record
      await firestore.collection('payments').add(paymentRecord);

      // Update order status based on payment status
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

      // Send notifications
      if (status === '00') {
        // Payment successful
        const buyerMessage = {
          notification: {
            title: 'Payment Successful',
            body: `Your payment of ${currency} ${amount} for order ${orderid} has been processed successfully.`,
          },
          topic: `user_${orderData.userId}`,
        };
        await admin.messaging().send(buyerMessage);

        // Notify seller
        const sellerMessage = {
          notification: {
            title: 'New Order Paid',
            body: `Order ${orderid} has been paid. Please prepare for shipment.`,
          },
          topic: `seller_${orderData.sellerId}`,
        };
        await admin.messaging().send(sellerMessage);
      } else if (status === '22' || status === '33') {
        // Payment failed or cancelled
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

// Refund processing function
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

      // Get order details
      const orderDoc = await firestore.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({error: 'Order not found'});
        return;
      }

      const orderData = orderDoc.data();
      
      // Check if order is eligible for refund
      if (!orderData || !['paid', 'shipped'].includes(orderData.status)) {
        res.status(400).json({error: 'Order not eligible for refund'});
        return;
      }

      // Create refund record
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

      // Update order status
      await orderDoc.ref.update({
        status: 'refund_requested',
        refundRequest: {
          amount,
          reason,
          requestedAt: FieldValue.serverTimestamp()
        },
        updatedAt: FieldValue.serverTimestamp()
      });

      // Notify seller
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

// Process refund approval
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
        // Process actual refund via Fiuu API
        // This would integrate with Fiuu's refund API
        await refundDoc.ref.update({
          status: 'approved',
          processedAt: FieldValue.serverTimestamp()
        });

        // Update order status
        await firestore.collection('orders').doc(refundData.orderId).update({
          status: 'refunded',
          updatedAt: FieldValue.serverTimestamp()
        });

        // Notify buyer
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

        // Update order status back to original
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
