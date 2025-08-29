// src/services/livekit/index.ts
// Fallback implementation for Expo compatibility
// In production, use actual LiveKit with proper WebRTC setup

export const getLiveKitToken = async (roomName: string, participantName: string): Promise<string> => {
  console.log(`🔑 Demo token for: ${roomName} - ${participantName}`);
  return `demo-token-${roomName}-${participantName}`;
};

export const connectToRoom = async (roomName: string, token: string): Promise<any> => {
  console.log(`📡 Demo connection to: ${roomName}`);
  
  // Mock implementation for testing without WebRTC
  const mockRoom = {
    name: roomName,
    sid: `mock-${Date.now()}`,
    localParticipant: {
      identity: 'demo-host',
      sid: `demo-participant-${Date.now()}`,
      tracks: new Map(),
      videoTracks: new Map(),
      audioTracks: new Map(),
      publishTrack: () => Promise.resolve(),
      unpublishTrack: () => Promise.resolve(),
    },
    remoteParticipants: new Map(),
    disconnect: () => Promise.resolve(),
    on: (event: string, callback: Function) => {
      console.log(`📡 Mock event: ${event}`);
    },
    off: (event: string, callback: Function) => {
      console.log(`📡 Mock event removed: ${event}`);
    },
  };

  return mockRoom;
};

// For actual LiveKit integration (when ready)
// Uncomment and use this instead:
/*
import { Room, RoomEvent } from 'livekit-client';

export const getLiveKitToken = async (roomName: string, participantName: string): Promise<string> => {
  // Your actual token generation logic here
  return `token-${roomName}-${participantName}`;
};

export const connectToRoom = async (roomName: string, token: string): Promise<Room> => {
  const room = new Room();
  await room.connect('wss://your-livekit-server.com', token);
  return room;
};
*/
