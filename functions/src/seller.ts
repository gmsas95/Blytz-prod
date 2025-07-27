import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';

const firestore = admin.firestore();

interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountHolder: string;
}

interface BusinessAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface CreateSellerProfileData {
  businessName: string;
  businessType: string;
  taxId: string;
  bankAccount: BankAccount;
  businessAddress: BusinessAddress;
  phoneNumber: string;
  email: string;
  businessDescription?: string;
}

interface UpdateSellerVerificationData {
  sellerId: string;
  isVerified: boolean;
  verificationNotes?: string;
}

interface UploadBusinessDocumentsData {
  documents: {
    type: string;
    data: string; // base64 encoded
    contentType: string;
  }[];
}

/**
 * Creates a new seller profile when a user registers as a seller
 */
export const createSellerProfile = functions.https.onCall(async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
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
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
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
    throw new functions.https.HttpsError('internal', 'Failed to create seller profile');
  }
});

/**
 * Updates seller verification status
 */
export const updateSellerVerification = functions.https.onCall(async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { sellerId, isVerified, verificationNotes } = request.data;
  
  // Only admins can verify sellers (implement admin check)
  // For now, we'll allow self-verification during development

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
    throw new functions.https.HttpsError('internal', 'Failed to update verification');
  }
});

/**
 * Gets seller dashboard data
 */
export const getSellerDashboard = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    // Get seller profile
    const sellerDoc = await firestore.collection('sellers').doc(userId).get();
    if (!sellerDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Seller profile not found');
    }

    const sellerData = sellerDoc.data();

    // Get seller's streams stats
    const streamsSnapshot = await firestore
      .collection('streams')
      .where('sellerId', '==', userId)
      .get();

    const totalStreams = streamsSnapshot.size;
    const activeStreams = streamsSnapshot.docs.filter(
      (doc) => doc.data().status === 'live'
    ).length;

    // Get seller's products
    const productsSnapshot = await firestore
      .collection('products')
      .where('sellerId', '==', userId)
      .get();

    const totalProducts = productsSnapshot.size;
    const soldProducts = productsSnapshot.docs.filter(
      (doc) => doc.data().status === 'sold'
    ).length;

    // Get seller's orders
    const ordersSnapshot = await firestore
      .collection('orders')
      .where('sellerId', '==', userId)
      .get();

    const totalOrders = ordersSnapshot.size;
    const pendingOrders = ordersSnapshot.docs.filter(
      (doc) => doc.data().status === 'pending'
    ).length;

    // Calculate revenue
    let totalRevenue = 0;
    ordersSnapshot.forEach(doc => {
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
    throw new functions.https.HttpsError('internal', 'Failed to get dashboard data');
  }
});

/**
 * Uploads business documents for verification
 */
export const uploadBusinessDocuments = functions.https.onCall(async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { documents } = request.data;

  try {
    const uploadPromises = documents.map(async (doc) => {
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
    throw new functions.https.HttpsError('internal', 'Failed to upload documents');
  }
});

/**
 * Updates seller profile
 */
export const updateSellerProfile = functions.https.onCall(async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const updates = request.data;

  try {
    // Remove sensitive fields that shouldn't be updated directly
    delete (updates as any).userId;
    delete (updates as any).createdAt;
    delete (updates as any).totalSales;
    delete (updates as any).totalRevenue;
    delete (updates as any).rating;
    delete (updates as any).reviewCount;

    (updates as any).updatedAt = FieldValue.serverTimestamp();

    await firestore.collection('sellers').doc(userId).update(updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update profile');
  }
});
