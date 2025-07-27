import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SideToolbarComponentProps {
  onPayPress?: () => void;
  onSharePress?: () => void;
  onStorePress?: () => void;
}

const SideToolbarComponent: React.FC<SideToolbarComponentProps> = ({
  onPayPress,
  onSharePress,
  onStorePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPayPress}>
        <Ionicons name="card-outline" size={30} color="#fff" />
        <Text style={styles.text}>Pay</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSharePress}>
        <Ionicons name="share-outline" size={30} color="#fff" />
        <Text style={styles.text}>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onStorePress}>
        <Ionicons name="storefront-outline" size={30} color="#fff" />
        <Text style={styles.text}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: '40%',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    marginTop: 4,
  },
});

export default SideToolbarComponent;

