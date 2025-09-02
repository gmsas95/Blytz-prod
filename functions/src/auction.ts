import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

const firestore = admin.firestore();

export const startAuction = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { auctionId } = request.data;
  const sellerId = request.auth.uid;

  try {
    const auctionRef = firestore.collection('auctions').doc(auctionId);
    const auctionDoc = await auctionRef.get();

    if (!auctionDoc.exists) {
      throw new HttpsError('not-found', 'Auction not found.');
    }

    const auctionData = auctionDoc.data();
    if (auctionData?.sellerId !== sellerId) {
      throw new HttpsError('permission-denied', 'You are not the owner of this auction.');
    }

    await auctionRef.update({
      status: 'live',
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logger.error('Error starting auction:', error);
    throw new HttpsError('internal', 'Failed to start auction');
  }
});

export const endAuction = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { auctionId } = request.data;
  const sellerId = request.auth.uid;

  try {
    const auctionRef = firestore.collection('auctions').doc(auctionId);
    const auctionDoc = await auctionRef.get();

    if (!auctionDoc.exists) {
      throw new HttpsError('not-found', 'Auction not found.');
    }

    const auctionData = auctionDoc.data();
    if (auctionData?.sellerId !== sellerId) {
      throw new HttpsError('permission-denied', 'You are not the owner of this auction.');
    }

    await auctionRef.update({
      status: 'ended',
      endedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const winnerId = auctionData?.lastBidderId;
    const finalPrice = auctionData?.currentPrice;

    if (winnerId) {
      logger.info(`Winner for auction ${auctionId}: ${winnerId} with price ${finalPrice}`);

      const order = {
        userId: winnerId,
        productId: auctionData?.productId,
        quantity: 1,
        totalPrice: finalPrice,
        status: 'pending',
        shippingAddress: {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await firestore.collection('orders').add(order);

      const message = {
        notification: {
          title: 'You won an auction!',
          body: `Congratulations! You won the auction for ${auctionData?.title} for ${finalPrice}`,
        },
        topic: `user_${winnerId}`,
      };

      await admin.messaging().send(message);
    } else {
      logger.info(`Auction ${auctionId} ended with no bids.`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error ending auction:', error);
    throw new HttpsError('internal', 'Failed to end auction');
  }
});
