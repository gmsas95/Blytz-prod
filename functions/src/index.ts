import * as admin from 'firebase-admin';
import {
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import {onValueCreated} from 'firebase-functions/v2/database';
import {FieldValue} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

admin.initializeApp();

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
