import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const LiveChatComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>User123: Is this available in size L?</Text>
      <Text style={styles.message}>Seller: Yes, it is!</Text>
      <Text style={styles.message}>Bidder456: $50</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  message: {
    color: 'white',
    fontSize: 14,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
});

export default LiveChatComponent;
