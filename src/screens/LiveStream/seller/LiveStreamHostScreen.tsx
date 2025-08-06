import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLiveStream } from '../../../hooks/useLiveStream';
import { Participant, Track } from 'livekit-client';
import { VideoView } from '@livekit/react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useCreateStream } from '../../../hooks/useCreateStream';

interface LiveStreamHostScreenProps {
  route?: {
    params?: {
      streamId?: string;
      title?: string;
      description?: string;
    };
  };
}

const LiveStreamHostScreen: React.FC<LiveStreamHostScreenProps> = ({ route }) => {
  const [roomName, setRoomName] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('front');
  
  const { user } = useAuth();
  const { createStream } = useCreateStream();
  const { isConnected, participants, room, connectToRoom, disconnectFromRoom } = useLiveStream();
  
  const { requestCameraPermission, requestMicrophonePermission } = useCreateStream();

  useEffect(() => {
    requestPermissions();
    if (route?.params?.streamId) {
      setRoomName(route.params.streamId);
    } else {
      const newRoomName = `stream_${user?.uid}_${Date.now()}`;
      setRoomName(newRoomName);
    }
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraStatus = await requestCameraPermission();
      const micStatus = await requestMicrophonePermission();
      
      if (cameraStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required to start streaming.',
          [{ text: 'OK', onPress: () => console.log('Permissions needed') }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handleStartStream = async () => {
    try {
      if (!roomName || !user) {
        Alert.alert('Error', 'Unable to start stream. Please try again.');
        return;
      }

      const result = await createStream({
        title: route?.params?.title || 'Live Stream',
        description: route?.params?.description || '',
        category: 'General',
      });

      if (result.success) {
        await connectToRoom(roomName, user.displayName || user.email || 'Host');
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      Alert.alert('Error', 'Failed to start stream. Please try again.');
    }
  };

  const handleEndStream = async () => {
    try {
      await disconnectFromRoom();
      setIsStreaming(false);
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  const toggleMute = () => {
    console.log('Toggle mute functionality');
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    console.log('Toggle camera functionality');
    setIsCameraOff(!isCameraOff);
  };

  const switchCamera = () => {
    console.log('Switch camera functionality');
    setSelectedCamera(selectedCamera === 'front' ? 'back' : 'front');
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantContainer}>
      <Text style={styles.participantText}>{item.identity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {isConnected && room ? (
          <View style={styles.videoView} />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={64} color="#ccc" />
            <Text style={styles.placeholderText}>Camera Preview</Text>
          </View>
        )}
      </View>

      {/* Stream Info */}
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle}>
          {route?.params?.title || 'Live Stream'}
        </Text>
        <Text style={styles.viewerCount}>
          {participants.length} viewers
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isStreaming ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartStream}>
            <Ionicons name="radio" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start Stream</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.activeControl]} 
              onPress={toggleMute}
            >
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isCameraOff && styles.activeControl]} 
              onPress={toggleCamera}
            >
              <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={handleEndStream}>
              <Ionicons name="stop-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Participants */}
      {isConnected && participants.length > 0 && (
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsTitle}>Viewers ({participants.length})</Text>
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.sid}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoView: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  placeholderText: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 16,
  },
  streamInfo: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  streamTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewerCount: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeControl: {
    backgroundColor: '#FF385C',
  },
  endButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  participantsContainer: {
    padding: 16,
    maxHeight: 100,
  },
  participantsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  participantContainer: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  participantText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default LiveStreamHostScreen;

