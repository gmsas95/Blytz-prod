import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EditSellerProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit Seller Profile Screen</Text>
      <Text style={styles.text}>(Placeholder)</Text>
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
    fontSize: 18,
  },
});

export default EditSellerProfileScreen;
