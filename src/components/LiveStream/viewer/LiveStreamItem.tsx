import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Participant } from 'livekit-client';

const { height: screenHeight } = Dimensions.get('window');

const LiveStreamItem = ({ item, isActive }: { item: Participant; isActive: boolean }) => {
  return (
    <View style={styles.container}>
      <View style={styles.videoView} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: screenHeight,
    backgroundColor: '#000',
  },
  videoView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
  },
});

export default LiveStreamItem;
