// src/hooks/useLiveStream.ts
import { useState, useEffect } from 'react';
import { Room, RoomEvent, LocalParticipant, RemoteParticipant, Participant } from 'livekit-client';
import { getLiveKitToken, connectToRoom } from '../services/livekit';

export const useLiveStream = (roomName: string, participantName: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const setupAndConnect = async () => {
      try {
        const token = await getLiveKitToken(roomName, participantName);
        const roomInstance = await connectToRoom(roomName, token);

        setRoom(roomInstance);
        setIsConnected(true);

        const updateParticipants = () => {
          // TODO: Fix this any cast
          const allParticipants = [(roomInstance as any).localParticipant, ...Array.from((roomInstance as any).participants.values())] as Participant[];
          setParticipants(allParticipants);
        };

        roomInstance.on(RoomEvent.ParticipantConnected, updateParticipants);
        roomInstance.on(RoomEvent.ParticipantDisconnected, updateParticipants);
        roomInstance.on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          setParticipants([]);
        });

        updateParticipants();

      } catch (error) {
        console.error("Error setting up LiveKit room:", error);
      }
    };

    if (roomName && participantName) {
      setupAndConnect();
    }

    return () => {
      room?.disconnect();
    };
  }, [roomName, participantName, room]);

  return { room, isConnected, participants };
};