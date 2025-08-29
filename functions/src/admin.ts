import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sets a user's role (admin, seller, etc.) and updates their custom claims and Firestore document.
 * This is an admin-only function.
 */
export const setUserRole = onCall(async (request) => {
  // 1. Authentication and Admin Check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const adminUid = request.auth.uid;
  const { uid: targetUid, role } = request.data;

  if (!targetUid || !role) {
    throw new HttpsError("invalid-argument", "The function must be called with a 'uid' and 'role'.");
  }

  try {
    // Verify that the caller is an admin
    const adminUserRecord = await admin.auth().getUser(adminUid);
    const customClaims = adminUserRecord.customClaims || {};
    if (customClaims.admin !== true) {
      throw new HttpsError("permission-denied", "Only admins can set user roles.");
    }

    logger.info(`Admin ${adminUid} is setting role '${role}' for user ${targetUid}`);

    // 2. Set Custom Claims
    const newClaims = {
      admin: role === "admin",
      seller: role === "seller",
    };
    await admin.auth().setCustomUserClaims(targetUid, newClaims);

    // 3. Update Firestore User Document
    const userRef = db.collection("users").doc(targetUid);
    await userRef.update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Successfully set role for ${targetUid} to '${role}'.`);

    return {
      success: true,
      message: `Role '${role}' has been set for user ${targetUid}.`,
    };
  } catch (error) {
    logger.error(`Error setting user role for ${targetUid}:`, error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "An unexpected error occurred while setting the user role.");
  }
});