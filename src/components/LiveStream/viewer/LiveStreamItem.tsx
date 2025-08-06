import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Participant } from 'livekit-client';

const LiveStreamItem = ({ item, isActive }: { item: Participant; isActive: boolean }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{item.identity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
  },
});

export default LiveStreamItem;
