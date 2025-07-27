import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const BidOverlayComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.currentBid}>Current Bid: $55.00</Text>
      <TouchableOpacity style={styles.bidButton}>
        <Text style={styles.bidButtonText}>Place Bid</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentBid: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bidButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  bidButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BidOverlayComponent;
