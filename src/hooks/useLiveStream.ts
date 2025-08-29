// src/hooks/useLiveStream.ts
import { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, Participant } from 'livekit-client';
import { getLiveKitToken, connectToRoom as connectToLiveKitRoom } from '../services/livekit';

export const useLiveStream = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const connectToRoom = useCallback(async (roomName: string, participantName: string): Promise<Room> => {
    try {
      // Prevent duplicate connections
      if (room && room.name === roomName) {
        console.log('Already connected to room:', roomName);
        return room;
      }

      // Disconnect from existing room if any
      if (room) {
        await room.disconnect();
      }

      const token = await getLiveKitToken(roomName, participantName);
      const roomInstance: Room = await connectToLiveKitRoom(roomName, token);

      setRoom(roomInstance);
      setIsConnected(true);

      const updateParticipants = () => {
        const allParticipants: Participant[] = [
          roomInstance.localParticipant, 
          ...Array.from(roomInstance.remoteParticipants.values())
        ];
        setParticipants(allParticipants);
      };

      roomInstance.on(RoomEvent.ParticipantConnected, updateParticipants);
      roomInstance.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      roomInstance.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setParticipants([]);
        setRoom(null);
      });

      updateParticipants();
      return roomInstance;

    } catch (error) {
      console.error("Error connecting to LiveKit room:", error);
      throw error;
    }
  }, [room]);

  const disconnectFromRoom = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return { 
    room, 
    isConnected, 
    participants, 
    connectToRoom, 
    disconnectFromRoom 
  };
};