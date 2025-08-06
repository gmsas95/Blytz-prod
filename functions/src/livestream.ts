
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { AccessToken } from "livekit-server-sdk";
import { FieldValue } from "firebase-admin/firestore";

// Demo LiveKit credentials for testing
const livekitApiKey = functions.config().livekit?.api_key || 'demo-key';
const livekitApiSecret = functions.config().livekit?.api_secret || 'demo-secret';


export const generateLiveKitToken = functions.https.onCall(async (request) => {
  // Ensure the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const roomName = request.data.roomName;
  const participantName = request.auth.uid; // Use Firebase UID as participant name

  if (!roomName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with a "roomName" argument.'
    );
  }

  const at = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: participantName,
  });

  at.addGrant({ roomJoin: true, room: roomName });

  return {
    token: at.toJwt(),
  };
});


export const createStream = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { title, description, category, scheduledAt, products, thumbnailUrl } = request.data;
  const sellerId = request.auth.uid;

  if (!title || !category) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "category" arguments.'
    );
  }

  try {
    // Check if user is a verified seller
    const sellerDoc = await admin.firestore().collection('sellers').doc(sellerId).get();
    if (!sellerDoc.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "User must be a verified seller to create streams."
      );
    }

    const sellerData = sellerDoc.data();
    if (!sellerData?.isVerified) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Seller must be verified to create streams."
      );
    }

    // Generate unique stream ID
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create stream document
    const streamData = {
      id: streamId,
      sellerId,
      title,
      description: description || '',
      category,
      status: scheduledAt ? 'scheduled' : 'ready',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      startedAt: null,
      endedAt: null,
      products: products || [],
      thumbnailUrl: thumbnailUrl || '',
      playbackUrl: '',
      viewers: 0,
      maxViewers: 0,
      revenue: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('streams').doc(streamId).set(streamData);

    return {
      success: true,
      streamId,
      stream: streamData,
    };
  } catch (error) {
    console.error('Error creating stream:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create stream');
  }
});
