// This service will handle all interactions with the LiveKit streaming service.
import { LiveStream } from '../types/models';

/**
 * Fetches the LiveKit room configuration and tokens for streaming.
 * This service abstracts the LiveKit SDK integration for consistent streaming across the app.
 *
 * @param livestream - The livestream document from Firestore.
 * @returns A promise that resolves to streaming configuration.
 */
const getLiveKitConfig = async (
  livestream: LiveStream,
): Promise<{
  roomName: string;
  token: string;
  wsUrl: string;
} | null> => {
  console.log(`Fetching LiveKit config for stream: ${livestream.id}`);

  if (!livestream.id) {
    return null;
  }

  // In production, this would call a Firebase Cloud Function to generate a secure token
  // For now, return mock configuration for development
  return {
    roomName: livestream.id,
    token: `dev-token-${livestream.id}`,
    wsUrl: process.env.EXPO_PUBLIC_LIVEKIT_WS_URL || 'ws://localhost:7880'
  };
};

export const streamingService = {
  getLiveKitConfig,
};