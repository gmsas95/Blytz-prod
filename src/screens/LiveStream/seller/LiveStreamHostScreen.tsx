import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLiveStream } from '../../../hooks/useLiveStream';
import { Participant } from 'livekit-client';

const LiveStreamHostScreen = () => {
  // Replace with actual room and participant names
  const roomName = 'test-room';
  const participantName = 'test-participant';

  const { isConnected, participants } = useLiveStream(roomName, participantName);

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantContainer}>
      <Text style={styles.participantText}>{item.identity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Stream Host Screen</Text>
      {isConnected ? (
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.sid}
        />
      ) : (
        <Text style={styles.text}>Connecting to stream...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
  },
  participantContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  participantText: {
    fontSize: 16,
  },
});

export default LiveStreamHostScreen;

