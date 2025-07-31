/**
 * Admin Tool: Review Seller Applications
 * 
 * This script can be run in the Firebase Console or locally to review seller applications
 * Usage: Copy the reviewApplication function and run it in Firebase Console Functions tab
 */

const admin = require('firebase-admin');

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Review a seller application (run this in Firebase Console)
 * @param {string} applicationId - The application document ID
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} notes - Optional notes for the applicant
 */
async function reviewApplication(applicationId, status, notes = '') {
  try {
    // Get the application
    const applicationRef = db.collection('sellerApplications').doc(applicationId);
    const applicationDoc = await applicationRef.get();
    
    if (!applicationDoc.exists) {
      console.error('Application not found:', applicationId);
      return;
    }
    
    const applicationData = applicationDoc.data();
    
    // Update application status
    await applicationRef.update({
      status,
      notes,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: 'admin',
    });
    
    // Update user document
    await db.collection('users').doc(applicationData.userId).update({
      sellerApplicationStatus: status,
      sellerApplicationReviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // If approved, create seller profile
    if (status === 'approved') {
      await approveSeller(applicationData);
    }
    
    // Send notification to user
    await sendUserNotification(applicationData.userId, status, notes);
    
    console.log(`Application ${status} successfully:`, applicationId);
    
  } catch (error) {
    console.error('Error reviewing application:', error);
  }
}

/**
 * Approve a seller and create their profile
 */
async function approveSeller(applicationData) {
  const { userId, businessName, businessType, email, phoneNumber, bankName, accountNumber } = applicationData;
  
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('sellers').doc(userId).set(sellerProfile);
  
  // Set custom claims
  await admin.auth().setCustomUserClaims(userId, { seller: true });
  
  console.log('Seller profile created for user:', userId);
}

/**
 * Send notification to user about application status
 */
async function sendUserNotification(userId, status, notes = '') {
  const notification = {
    userId,
    type: 'seller_application_status',
    title: status === 'approved' ? 'Seller Application Approved!' : 'Seller Application Update',
    message: status === 'approved' 
      ? 'Congratulations! Your seller application has been approved. You can now start selling on Blytz.'
      : `Your seller application has been ${status}. ${notes}`,
    status: 'unread',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('notifications').add(notification);
  console.log('Notification sent to user:', userId);
}

/**
 * Get pending applications for review
 */
async function getPendingApplications() {
  try {
    const snapshot = await db.collection('sellerApplications')
      .where('status', '==', 'pending')
      .orderBy('submittedAt', 'desc')
      .get();
    
    const applications = [];
    snapshot.forEach(doc => {
      applications.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate().toISOString(),
      });
    });
    
    console.log('Pending applications:');
    applications.forEach(app => {
      console.log(`- ${app.id}: ${app.businessName} (${app.email}) - ${app.submittedAt}`);
    });
    
    return applications;
  } catch (error) {
    console.error('Error getting pending applications:', error);
    return [];
  }
}

// Export for use in Firebase Console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    reviewApplication,
    getPendingApplications,
    approveSeller,
    sendUserNotification
  };
}

// Usage instructions for Firebase Console:
/*
1. Go to Firebase Console > Firestore Database
2. Find sellerApplications collection
3. Copy the document ID of the application to review
4. Go to Functions > Functions tab
5. Run the following code:

// To approve an application:
const { reviewApplication } = require('./admin-tools/review-seller-applications');
await reviewApplication('APPLICATION_ID_HERE', 'approved', 'Welcome to Blytz!');

// To reject an application:
const { reviewApplication } = require('./admin-tools/review-seller-applications');
await reviewApplication('APPLICATION_ID_HERE', 'rejected', 'Please provide additional business documentation.');

// To see pending applications:
const { getPendingApplications } = require('./admin-tools/review-seller-applications');
await getPendingApplications();
*/