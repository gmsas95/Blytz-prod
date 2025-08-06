
import * as functions from "firebase-functions";
import { AccessToken } from "livekit-server-sdk";

// TODO: Set these as environment variables in your Firebase project
// firebase functions:config:set livekit.api_key="YOUR_API_KEY"
// firebase functions:config:set livekit.api_secret="YOUR_API_SECRET"
const livekitApiKey = functions.config().livekit.api_key;
const livekitApiSecret = functions.config().livekit.api_secret;

interface GenerateTokenData {
  roomName: string;
}

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
