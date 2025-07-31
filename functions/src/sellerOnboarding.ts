import {onCall} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface SellerApplicationData {
  userId: string;
  businessName: string;
  businessType: 'individual' | 'company';
  email: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: admin.firestore.Timestamp;
  reviewedAt?: admin.firestore.Timestamp;
  reviewedBy?: string;
  notes?: string;
}

/**
 * Submit seller application
 * Creates a new seller application with pending status
 */
export const submitSellerApplication = onCall(async (request) => {
  try {
    // Verify authentication
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    const userId = request.auth.uid;
    const {
      businessName,
      businessType,
      email,
      phoneNumber,
      bankName,
      accountNumber
    } = request.data;

    // Validate required fields
    if (!businessName || !businessType || !email || !phoneNumber || !bankName || !accountNumber) {
      throw new Error('Missing required fields');
    }

    // Check if user already has a pending application
    const existingApplication = await db
      .collection('sellerApplications')
      .where('userId', '==', userId)
      .where('status', 'in', ['pending', 'approved'])
      .limit(1)
      .get();

    if (!existingApplication.empty) {
      const existingDoc = existingApplication.docs[0];
      if (existingDoc.data().status === 'pending') {
        throw new Error('You already have a pending application');
      } else if (existingDoc.data().status === 'approved') {
        throw new Error('You are already an approved seller');
      }
    }

    // Create seller application
    const applicationData: SellerApplicationData = {
      userId,
      businessName: businessName.trim(),
      businessType,
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      bankName,
      accountNumber: accountNumber.trim(),
      status: 'pending',
      submittedAt: admin.firestore.Timestamp.now(),
    };

    const applicationRef = await db.collection('sellerApplications').add(applicationData);

    // Update user document to track application
    await db.collection('users').doc(userId).update({
      sellerApplicationId: applicationRef.id,
      sellerApplicationStatus: 'pending',
      sellerApplicationSubmittedAt: admin.firestore.Timestamp.now(),
    });

    // Send notification to admin (webhook or email)
    await sendAdminNotification(applicationRef.id, applicationData);

    return { 
      success: true, 
      applicationId: applicationRef.id,
      message: 'Seller application submitted successfully. You will be notified within 24-48 hours.'
    };
  } catch (error) {
    console.error('Error submitting seller application:', error);
    throw error;
  }
});

/**
 * Review seller application (for admin use)
 * Approves or rejects a seller application
 */
export const reviewSellerApplication = onCall(async (request) => {
  try {
    // Verify admin authentication
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    // Check if user has admin role
    const userRecord = await admin.auth().getUser(request.auth.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (!customClaims.admin) {
      throw new Error('Admin access required');
    }

    const { applicationId, status, notes } = request.data;

    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }

    const applicationRef = db.collection('sellerApplications').doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      throw new Error('Application not found');
    }

    const applicationData = applicationDoc.data() as SellerApplicationData;

    // Update application status
    await applicationRef.update({
      status,
      notes: notes || '',
      reviewedAt: admin.firestore.Timestamp.now(),
      reviewedBy: request.auth.uid,
    });

    // Update user document
    await db.collection('users').doc(applicationData.userId).update({
      sellerApplicationStatus: status,
      sellerApplicationReviewedAt: admin.firestore.Timestamp.now(),
    });

    // If approved, create seller profile and set custom claims
    if (status === 'approved') {
      await approveSeller(applicationData);
    }

    // Send notification to user
    await sendUserNotification(applicationData.userId, status, notes);

    return { 
      success: true, 
      message: `Application ${status} successfully` 
    };
  } catch (error) {
    console.error('Error reviewing seller application:', error);
    throw error;
  }
});

/**
 * Get seller applications for admin review
 */
export const getSellerApplications = onCall(async (request) => {
  try {
    // Verify admin authentication
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    // Check if user has admin role
    const userRecord = await admin.auth().getUser(request.auth.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (!customClaims.admin) {
      throw new Error('Admin access required');
    }

    const { status, limit = 50 } = request.data;
    let query = db.collection('sellerApplications').orderBy('submittedAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(limit).get();
    
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, applications };
  } catch (error) {
    console.error('Error getting seller applications:', error);
    throw error;
  }
});

/**
 * Helper function to approve a seller
 */
async function approveSeller(applicationData: SellerApplicationData) {
  const { userId, businessName, businessType, email, phoneNumber, bankName, accountNumber } = applicationData;

  // Create seller profile
  const sellerProfile = {
    userId,
    businessName,
    businessType,
    email,
    phoneNumber,
    bankAccount: {
      accountNumber,
      bankName,
      accountHolder: businessName,
    },
    isVerified: true,
    verificationStatus: 'verified',
    totalSales: 0,
    totalRevenue: 0,
    rating: 0,
    reviewCount: 0,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await db.collection('sellers').doc(userId).set(sellerProfile);

  // Set custom claims
  await admin.auth().setCustomUserClaims(userId, { seller: true });
}

/**
 * Send admin notification for new applications
 */
async function sendAdminNotification(applicationId: string, applicationData: SellerApplicationData) {
  try {
    // Store notification in Firestore for admin access
    await db.collection('adminNotifications').add({
      type: 'new_seller_application',
      applicationId,
      userId: applicationData.userId,
      businessName: applicationData.businessName,
      businessType: applicationData.businessType,
      submittedAt: admin.firestore.Timestamp.now(),
      status: 'unread',
    });

    // TODO: Integrate with webhook service (Slack/Discord/Email)
    console.log(`🔔 NEW SELLER APPLICATION: ${applicationId} - ${applicationData.businessName}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

/**
 * Send user notification about application status
 */
async function sendUserNotification(userId: string, status: string, notes?: string) {
  try {
    await db.collection('notifications').add({
      userId,
      type: 'seller_application_status',
      title: status === 'approved' ? 'Seller Application Approved!' : 'Seller Application Update',
      message: status === 'approved' 
        ? 'Congratulations! Your seller application has been approved. You can now start selling on Blytz.'
        : `Your seller application has been ${status}. ${notes || ''}`,
      status: 'unread',
      createdAt: admin.firestore.Timestamp.now(),
    });
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
}