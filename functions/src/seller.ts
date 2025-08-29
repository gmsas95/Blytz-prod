import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const firestore = admin.firestore();

interface Stream {
  status: string;
}

interface Product {
  status: string;
}

interface Order {
  status: string;
  totalPrice: number;
}

interface DocumentUpload {
  type: string;
  data: string;
  contentType: string;
}

/**
 * Creates a new seller profile when a user registers as a seller
 */
export const createSellerProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const {
    businessName,
    businessType,
    taxId,
    bankAccount,
    businessAddress,
    phoneNumber,
    email,
    businessDescription,
  } = request.data;

  // Validate required fields
  if (!businessName || !taxId || !bankAccount || !businessAddress) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Create seller document
    const sellerData = {
      userId,
      businessName,
      businessType: businessType || 'individual',
      taxId,
      bankAccount: {
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        accountHolder: bankAccount.accountHolder,
      },
      businessAddress,
      phoneNumber,
      email,
      businessDescription: businessDescription || '',
      isVerified: false,
      verificationStatus: 'pending',
      totalSales: 0,
      totalRevenue: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await firestore.collection('sellers').doc(userId).set(sellerData);

    // Set custom claims for seller role
    await admin.auth().setCustomUserClaims(userId, { seller: true });

    return { success: true, sellerId: userId };
  } catch (error) {
    console.error('Error creating seller profile:', error);
    throw new HttpsError('internal', 'Failed to create seller profile');
  }
});

/**
 * Updates seller verification status
 */
export const updateSellerVerification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { sellerId, isVerified, verificationNotes } = request.data;
  
  // TODO: Add admin check here

  try {
    await firestore.collection('sellers').doc(sellerId).update({
      isVerified,
      verificationStatus: isVerified ? 'verified' : 'rejected',
      verificationNotes: verificationNotes || '',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating seller verification:', error);
    throw new HttpsError('internal', 'Failed to update verification');
  }
});

/**
 * Gets seller dashboard data
 */
export const getSellerDashboard = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    // Get seller profile
    const sellerDoc = await firestore.collection('sellers').doc(userId).get();
    if (!sellerDoc.exists) {
      throw new HttpsError('not-found', 'Seller profile not found');
    }

    const sellerData = sellerDoc.data();

    // Get seller's streams stats
    const streamsSnapshot = await firestore
      .collection('streams')
      .where('sellerId', '==', userId)
      .get();

    const totalStreams = streamsSnapshot.size;
    const activeStreams = streamsSnapshot.docs.filter(
      (doc) => (doc.data() as Stream).status === 'live'
    ).length;

    // Get seller's products
    const productsSnapshot = await firestore
      .collection('products')
      .where('sellerId', '==', userId)
      .get();

    const totalProducts = productsSnapshot.size;
    const soldProducts = productsSnapshot.docs.filter(
      (doc) => (doc.data() as Product).status === 'sold'
    ).length;

    // Get seller's orders
    const ordersSnapshot = await firestore
      .collection('orders')
      .where('sellerId', '==', userId)
      .get();

    const totalOrders = ordersSnapshot.size;
    const pendingOrders = ordersSnapshot.docs.filter(
      (doc) => (doc.data() as Order).status === 'pending'
    ).length;

    // Calculate revenue
    let totalRevenue = 0;
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.status === 'completed') {
        totalRevenue += order.totalPrice || 0;
      }
    });

    return {
      seller: sellerData,
      stats: {
        totalStreams,
        activeStreams,
        totalProducts,
        soldProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
    };
  } catch (error) {
    console.error('Error getting seller dashboard:', error);
    throw new HttpsError('internal', 'Failed to get dashboard data');
  }
});

/**
 * Uploads business documents for verification
 */
export const uploadBusinessDocuments = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { documents } = request.data;

  try {
    const uploadPromises = documents.map(async (doc: DocumentUpload) => {
      const fileName = `business-documents/${userId}/${doc.type}_${Date.now()}`;
      
      // Upload to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(fileName);
      await file.save(Buffer.from(doc.data, 'base64'), {
        metadata: {
          contentType: doc.contentType,
        },
      });

      return {
        type: doc.type,
        fileName,
        uploadedAt: FieldValue.serverTimestamp(),
      };
    });

    const uploadedDocs = await Promise.all(uploadPromises);

    await firestore.collection('sellers').doc(userId).update({
      businessDocuments: uploadedDocs,
      verificationStatus: 'under-review',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, documents: uploadedDocs };
  } catch (error) {
    console.error('Error uploading business documents:', error);
    throw new HttpsError('internal', 'Failed to upload documents');
  }
});


/**
 * Updates seller profile
 */
export const updateSellerProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const updates: any = request.data;

  try {
    updates.updatedAt = FieldValue.serverTimestamp();

    await firestore.collection('sellers').doc(userId).update(updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw new HttpsError('internal', 'Failed to update profile');
  }
});

/**
 * Toggles seller live mode status
 */
export const toggleSellerLiveMode = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { isLive } = request.data;

  if (typeof isLive !== 'boolean') {
    throw new HttpsError('invalid-argument', 'isLive must be a boolean value');
  }

  try {
    // Check if user is a seller
    const sellerDoc = await firestore.collection('sellers').doc(userId).get();
    if (!sellerDoc.exists) {
      throw new HttpsError('not-found', 'Seller profile not found');
    }

    const sellerData = sellerDoc.data();
    if (!sellerData?.isVerified) {
      throw new HttpsError('failed-precondition', 'Seller must be verified to go live');
    }

    // Update seller live mode
    await firestore.collection('sellers').doc(userId).update({
      isLive,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update custom claims if needed
    if (isLive) {
      await admin.auth().setCustomUserClaims(userId, { seller: true, isLive: true });
    } else {
      await admin.auth().setCustomUserClaims(userId, { seller: true, isLive: false });
    }

    console.info(`Seller ${userId} live mode toggled to: ${isLive}`);

    return { 
      success: true, 
      isLive, 
      message: isLive ? 'You are now live! Switch to seller mode on your mobile app.' : 'You are now offline. Switching to viewer mode.'
    };
  } catch (error) {
    console.error('Error toggling seller live mode:', error);
    throw new HttpsError('internal', 'Failed to toggle seller live mode');
  }
});

/**
 * Gets current seller live mode status
 */
export const getSellerLiveStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    const sellerDoc = await firestore.collection('sellers').doc(userId).get();
    if (!sellerDoc.exists) {
      throw new HttpsError('not-found', 'Seller profile not found');
    }

    const sellerData = sellerDoc.data();
    return {
      isLive: sellerData?.isLive || false,
      isVerified: sellerData?.isVerified || false,
      businessName: sellerData?.businessName || '',
    };
  } catch (error) {
    console.error('Error getting seller live status:', error);
    throw new HttpsError('internal', 'Failed to get seller live status');
  }
});