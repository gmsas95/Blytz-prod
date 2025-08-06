# Seller Onboarding System - MVP Implementation

This document outlines the complete seller onboarding system with human verification workflow for the Blytz live auction app.

## Overview

The seller onboarding system implements a streamlined verification process that:
1. Collects seller application data through the mobile app
2. Stores applications with "pending" status for human review
3. Notifies admins via Firebase Console and optional webhooks
4. Allows manual approval/rejection through simple Cloud Functions
5. Automatically creates seller profiles and sends notifications

## Architecture

### 1. Frontend (Mobile App)
- **SellerOnboardingScreen.tsx**: Multi-step onboarding form
- **AuthContext.tsx**: Updated to use Cloud Functions for application submission

### 2. Backend (Cloud Functions)
- **submitSellerApplication**: Handles application submission with validation
- **reviewSellerApplication**: Admin function for approval/rejection
- **Webhook notifications**: Automatic notifications for new applications

### 3. Database Schema

#### sellerApplications Collection
```typescript
{
  userId: string,              // Firebase Auth UID
  businessName: string,
  businessType: 'individual' | 'company',
  email: string,
  phoneNumber: string,
  bankName: string,
  accountNumber: string,
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: Timestamp,
  reviewedAt?: Timestamp,
  reviewedBy?: string,
  notes?: string
}
```

#### users Collection Updates
```typescript
{
  sellerApplicationId: string,        // Reference to application
  sellerApplicationStatus: 'pending' | 'approved' | 'rejected',
  sellerApplicationSubmittedAt: Timestamp,
  sellerApplicationReviewedAt?: Timestamp
}
```

#### sellers Collection (Created after approval)
```typescript
{
  userId: string,
  businessName: string,
  businessType: string,
  email: string,
  phoneNumber: string,
  bankAccount: {
    accountNumber: string,
    bankName: string,
    accountHolder: string
  },
  isVerified: boolean,
  verificationStatus: 'verified',
  totalSales: 0,
  totalRevenue: 0,
  rating: 0,
  reviewCount: 0,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Setup Instructions

### 1. Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy seller onboarding functions
firebase deploy --only functions:submitSellerApplication,functions:reviewSellerApplication,functions:getSellerApplications

# Deploy webhook functions
firebase deploy --only functions:notifyAdminNewApplication,functions:notifyAdminStatusChange
```

### 2. Configure Firebase Authentication

Set up custom claims for admin users:

```javascript
// Run this in Firebase Console Functions tab to create an admin user
const admin = require('firebase-admin');
admin.initializeApp();

// Set admin claim for a user
admin.auth().setCustomUserClaims('USER_UID_HERE', { admin: true });
```

### 3. Configure Webhooks (Optional)

For Slack/Discord notifications:

```javascript
// Add webhook URL to Firebase environment
firebase functions:config:set slack.webhook_url="YOUR_SLACK_WEBHOOK_URL"
```

## Admin Review Process

### Method 1: Firebase Console (Recommended for MVP)

1. **View Applications**
   - Go to Firebase Console > Firestore Database
   - Navigate to `sellerApplications` collection
   - Filter by `status: "pending"`

2. **Review Applications**
   - Click on each application to view details
   - Note the `applicationId` from the document ID

3. **Approve/Reject via Cloud Function**
   - Go to Firebase Console > Functions
   - Use the `reviewSellerApplication` function
   - Test with parameters:
     ```json
     {
       "applicationId": "YOUR_APPLICATION_ID",
       "status": "approved",
       "notes": "Welcome to Blytz!"
     }
     ```

### Method 2: Admin Script

Use the provided admin script in `/admin-tools/review-seller-applications.js`:

```javascript
// Get pending applications
const { getPendingApplications } = require('./admin-tools/review-seller-applications');
await getPendingApplications();

// Review specific application
const { reviewApplication } = require('./admin-tools/review-seller-applications');
await reviewApplication('APPLICATION_ID', 'approved', 'Welcome message');
```

## Usage Flow

### 1. Seller Application Submission
```typescript
// In the mobile app
const application = {
  businessName: "My Store",
  businessType: "individual",
  email: "seller@example.com",
  phoneNumber: "+60123456789",
  bankName: "Maybank",
  accountNumber: "1234567890"
};

const result = await applyForSeller(application);
// Returns: { success: true, applicationId, message }
```

### 2. Admin Review
- Admin receives notification (via Firebase Console or webhook)
- Reviews application details
- Uses Cloud Function to approve/reject
- User receives automatic notification

### 3. Post-Approval
- Seller profile is automatically created
- User gets seller role in Firebase Auth
- Seller can start creating auctions

## Security Features

### Application Validation
- Duplicate application prevention
- Email format validation
- Phone number format validation
- Bank account number validation

### Admin Security
- Admin role verification via custom claims
- Rate limiting on review functions
- Audit trail with reviewer ID and timestamps

### Data Protection
- Bank account numbers are encrypted in transit
- No sensitive data in client-side logs
- Proper Firestore security rules

## Firestore Security Rules

Add these rules to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Seller applications
    match /sellerApplications/{applicationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Admin notifications
    match /adminNotifications/{notificationId} {
      allow read: if request.auth != null && 
        request.auth.token.admin == true;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Seller profiles
    match /sellers/{userId} {
      allow read: if true;
      allow create: if request.auth != null && 
        request.auth.token.admin == true;
      allow update: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Testing

### 1. Submit Test Application
```bash
# Use Firebase Emulator Suite
firebase emulators:start

# Or test in production (recommended for final testing)
firebase functions:shell
```

### 2. Test Admin Review
```javascript
// In Firebase Functions shell
reviewSellerApplication({
  applicationId: "test-app-id",
  status: "approved",
  notes: "Test approval"
});
```

### 3. Verify Notifications
- Check Firebase Console > Authentication for custom claims
- Check Firestore for seller profile creation
- Check notifications collection for user notifications

## Monitoring

### Cloud Logging
- All application submissions are logged
- Admin reviews are tracked with reviewer ID
- Error handling with detailed error messages

### Metrics to Track
- Application submission rate
- Approval/rejection rates
- Average review time
- User satisfaction scores

## Future Enhancements

### Phase 2 (Post-MVP)
- Admin dashboard web interface
- Bulk review capabilities
- Automated background checks
- Seller onboarding analytics
- Document upload functionality

### Phase 3
- Machine learning for fraud detection
- Automated approval for trusted sellers
- Advanced seller verification tiers
- Integration with external verification services

## Troubleshooting

### Common Issues

1. **"Function not found" error**
   - Ensure functions are deployed: `firebase deploy --only functions`
   - Check function names match exactly

2. **Permission denied errors**
   - Verify user has admin custom claims
   - Check Firestore security rules

3. **Application stuck in pending**
   - Check Cloud Function logs for errors
   - Verify webhook notifications are working

4. **Bank account validation fails**
   - Ensure account number meets regex requirements
   - Check bank name is in allowed list

## Support

For technical issues or questions:
1. Check Cloud Function logs in Firebase Console
2. Review Firestore data directly in Console
3. Test functions locally with Firebase Emulator Suite
4. Contact development team with specific error messages