import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const LiveStreamHostScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Live Stream Host Screen</Text>
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
    fontSize: 20,
  },
});

export default LiveStreamHostScreen;
