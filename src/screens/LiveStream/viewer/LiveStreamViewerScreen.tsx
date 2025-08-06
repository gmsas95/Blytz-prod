import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useLiveStream } from '../../../hooks/useLiveStream';
import { theme } from '../../../config/theme';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
import LiveStreamItem from '../../../components/LiveStream/viewer/LiveStreamItem';
import { Participant } from 'livekit-client';
import { useAuth } from '../../../context/AuthContext';
import { useRoute } from '@react-navigation/native';

const LiveStreamViewerScreen = () => {
  const { isConnected, participants, connectToRoom, disconnectFromRoom } = useLiveStream();
  const [isConnecting, setIsConnecting] = useState(true);
  const { user } = useAuth();
  const route = useRoute();
  
  const streamId = (route.params as any)?.streamId || 'test-stream';

  useEffect(() => {
    const connectToStream = async () => {
      if (!user) return;
      
      try {
        setIsConnecting(true);
        await connectToRoom(streamId, user.displayName || user.email || 'Viewer');
      } catch (error) {
        console.error('Error connecting to stream:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToStream();

    return () => {
      disconnectFromRoom();
    };
  }, [streamId, user]);

  if (isConnecting) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.infoText}>Connecting to Stream...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!isConnected) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>Unable to connect to stream.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (participants.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>Waiting for host to join...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <FlatList
      data={participants}
      renderItem={({ item }) => <LiveStreamItem item={item} isActive={true} />}
      keyExtractor={(item) => item.sid}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#000' }}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  infoText: {
    marginTop: theme.spacing.md,
    color: theme.colors.secondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
  }
});

export default LiveStreamViewerScreen;