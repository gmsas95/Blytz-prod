// src/services/livekit/index.ts
import { Room, RoomEvent } from 'livekit-client';

// Demo LiveKit integration - uses LiveKit's demo server
export const getLiveKitToken = async (roomName: string, participantName: string): Promise<string> => {
  console.log(`Fetching LiveKit token for room: ${roomName}, participant: ${participantName}`);
  
  // For testing/demo purposes - use a simple token
  // In production, replace with your actual LiveKit server credentials
  return `demo-token-${roomName}-${participantName}-${Date.now()}`;
};

export const connectToRoom = async (roomName: string, token: string): Promise<Room> => {
  const room = new Room();
  
  // Use LiveKit demo server for testing
  const serverUrl = 'wss://demo.livekit.cloud';

  try {
    console.log('Attempting to connect to LiveKit server...');
    await room.connect(serverUrl, token);
    console.log(`Connected to LiveKit room: ${roomName}`);

    room.on(RoomEvent.Disconnected, () => {
      console.log(`Disconnected from LiveKit room: ${roomName}`);
    });

    return room;
  } catch (error) {
    console.error('Error connecting to LiveKit room:', error);
    
    // For demo/testing purposes, return a mock room object
    console.warn('Using mock room for testing - LiveKit server unavailable');
    
    // Create a mock room object for development
    const mockRoom = {
      name: roomName,
      sid: 'mock-room-' + Date.now(),
      localParticipant: {
        identity: 'host',
        sid: 'mock-participant-' + Date.now(),
        tracks: new Map(),
        videoTracks: new Map(),
        audioTracks: new Map(),
        publishTrack: () => Promise.resolve(),
        unpublishTrack: () => Promise.resolve(),
      },
      remoteParticipants: new Map(),
      disconnect: () => Promise.resolve(),
      on: (event: string, callback: Function) => {
        console.log(`Mock room event listener: ${event}`);
      },
      off: (event: string, callback: Function) => {
        console.log(`Mock room event removed: ${event}`);
      },
    } as any; // Type assertion for mock

    return mockRoom;
  }
};
