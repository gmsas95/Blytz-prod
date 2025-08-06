// src/services/livekit/index.ts
import { Room, RoomEvent } from 'livekit-client';

// This will be replaced with a call to your backend to get a token
export const getLiveKitToken = async (roomName: string, participantName: string): Promise<string> => {
  // For now, returning a dummy token.
  // In a real application, you would make a network request to your server.
  console.log(`Fetching LiveKit token for room: ${roomName}, participant: ${participantName}`);
  // This is a placeholder and will not work with a real LiveKit server.
  // You need to replace this with a call to your backend to generate a valid token.
  const response = await fetch(`https://your-token-endpoint.com/get-token?roomName=${roomName}&participantName=${participantName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch LiveKit token');
  }
  const data = await response.json();
  return data.token;
};

export const connectToRoom = async (roomName: string, token: string): Promise<Room> => {
  const room = new Room();
  const serverUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;

  if (!serverUrl) {
    throw new Error('LiveKit server URL is not defined in environment variables.');
  }

  await room.connect(serverUrl, token);
  console.log(`Connected to LiveKit room: ${roomName}`);

  room.on(RoomEvent.Disconnected, () => {
    console.log(`Disconnected from LiveKit room: ${roomName}`);
  });

  return room;
};
