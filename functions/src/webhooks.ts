import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Send webhook notification to admin when new seller application is submitted
 * This can be configured to send to Slack, Discord, or email service
 */
export const notifyAdminNewApplication = onDocumentCreated(
  'sellerApplications/{applicationId}',
  async (event) => {
    try {
      const application = event.data?.data();
      const applicationId = event.params?.applicationId;

      if (!application || !applicationId) return null;

      // Get user details
      const userDoc = await db.collection('users').doc(application.userId).get();
      const userData = userDoc.data();

      const notification = {
        type: 'new_seller_application',
        applicationId,
        userId: application.userId,
        userEmail: userData?.email || 'Unknown',
        businessName: application.businessName,
        businessType: application.businessType,
        submittedAt: application.submittedAt?.toDate?.()?.toISOString(),
        status: application.status,
        // Firebase Console URL for easy access
        reviewUrl: `https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/firestore/data/~2FsellerApplications~2F${applicationId}`,
      };

      // Log the notification (in production, integrate with actual webhook service)
      console.log('🔔 NEW SELLER APPLICATION:', JSON.stringify(notification, null, 2));

      // Store notification for admin access
      await db.collection('adminNotifications').add({
        ...notification,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      // TODO: Add actual webhook integration here
      // Example: Send to Slack webhook
      // await sendSlackNotification(notification);
      
      return null;
    } catch (error) {
      console.error('Error in notifyAdminNewApplication:', error);
      return null;
    }
  });

/**
 * Send webhook notification when application status changes
 */
export const notifyAdminStatusChange = functions.firestore
  .document('sellerApplications/{applicationId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const applicationId = context.params.applicationId;

      // Only notify on status change
      if (before.status === after.status) {
        return null;
      }

      const notification = {
        type: 'seller_application_status_changed',
        applicationId,
        userId: after.userId,
        businessName: after.businessName,
        oldStatus: before.status,
        newStatus: after.status,
        reviewedAt: after.reviewedAt?.toDate().toISOString(),
        notes: after.notes || '',
      };

      console.log('🔔 APPLICATION STATUS CHANGE:', JSON.stringify(notification, null, 2));

      // Store notification
      await db.collection('adminNotifications').add({
        ...notification,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      return null;
    } catch (error) {
      console.error('Error in notifyAdminStatusChange:', error);
      return null;
    }
  });

/**
 * Example Slack webhook integration (uncomment and configure)
 */
/*
async function sendSlackNotification(notification: any) {
  const webhookUrl = functions.config().slack?.webhook_url;
  if (!webhookUrl) return;

  const message = {
    text: 'New Seller Application',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New Seller Application*\n*Business:* ${notification.businessName}\n*Type:* ${notification.businessType}\n*Email:* ${notification.userEmail}\n*Submitted:* ${notification.submittedAt}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Review Application'
            },
            url: notification.reviewUrl,
            style: 'primary'
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}
*/