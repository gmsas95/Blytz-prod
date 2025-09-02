import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { AccessToken } from "livekit-server-sdk";
import { FieldValue } from "firebase-admin/firestore";

// Use environment variables for LiveKit credentials in 2nd Gen functions
const livekitApiKey = process.env.LIVEKIT_API_KEY || 'demo-key';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'demo-secret';

export const generateLiveKitToken = onCall({ region: 'asia-southeast1' }, async (request) => {
  // Ensure the user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const roomName = request.data.roomName;
  const participantName = request.auth.uid; // Use Firebase UID as participant name

  if (!roomName) {
    throw new HttpsError(
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

export const createStream = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { title, description, category, scheduledAt, products, thumbnailUrl } = request.data;
  const sellerId = request.auth.uid;

  if (!title || !category) {
    throw new HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "category" arguments.'
    );
  }

  try {
    // Check if user is a verified seller
    const sellerDoc = await admin.firestore().collection('sellers').doc(sellerId).get();
    if (!sellerDoc.exists) {
      throw new HttpsError(
        "failed-precondition",
        "User must be a verified seller to create streams."
      );
    }

    const sellerData = sellerDoc.data();
    if (!sellerData?.isVerified) {
      throw new HttpsError(
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
    throw new HttpsError('internal', 'Failed to create stream');
  }
});

export const startStream = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { streamId } = request.data;
  const sellerId = request.auth.uid;

  try {
    const streamRef = admin.firestore().collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();

    if (!streamDoc.exists) {
      throw new HttpsError("not-found", "Stream not found.");
    }

    const streamData = streamDoc.data();
    if (streamData?.sellerId !== sellerId) {
      throw new HttpsError(
        "permission-denied",
        "You are not the owner of this stream."
      );
    }

    await streamRef.update({
      status: 'live',
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting stream:', error);
    throw new HttpsError('internal', 'Failed to start stream');
  }
});

export const endStream = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { streamId } = request.data;
  const sellerId = request.auth.uid;

  try {
    const streamRef = admin.firestore().collection('streams').doc(streamId);
    const streamDoc = await streamRef.get();

    if (!streamDoc.exists) {
      throw new HttpsError("not-found", "Stream not found.");
    }

    const streamData = streamDoc.data();
    if (streamData?.sellerId !== sellerId) {
      throw new HttpsError(
        "permission-denied",
        "You are not the owner of this stream."
      );
    }

    await streamRef.update({
      status: 'ended',
      endedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error ending stream:', error);
    throw new HttpsError('internal', 'Failed to end stream');
  }
});