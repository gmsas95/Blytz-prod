import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

const firestore = admin.firestore();

export const buyNow = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { productId } = request.data;
  const buyerId = request.auth.uid;

  try {
    const productRef = firestore.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new HttpsError('not-found', 'Product not found.');
    }

    const productData = productDoc.data();
    if (productData?.status !== 'available') {
      throw new HttpsError('failed-precondition', 'Product is not available for purchase.');
    }

    await productRef.update({
      status: 'sold',
      buyerId: buyerId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const finalPrice = productData?.fixedPrice;

    const order = {
      userId: buyerId,
      productId: productId,
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
        title: 'Purchase confirmation',
        body: `You successfully purchased ${productData?.title} for ${finalPrice}`,
      },
      topic: `user_${buyerId}`,
    };

    await admin.messaging().send(message);

    return { success: true };
  } catch (error) {
    logger.error('Error buying now:', error);
    throw new HttpsError('internal', 'Failed to buy now');
  }
});
