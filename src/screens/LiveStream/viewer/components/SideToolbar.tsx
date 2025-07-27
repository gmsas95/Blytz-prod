import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SideToolbarProps {
  onPayPress: () => void;
  onSharePress: () => void;
  onStorePress: () => void;
}

interface ToolbarButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  iconName,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.sideToolbarButton} onPress={onPress}>
    <Ionicons name={iconName} size={30} color="#fff" />
    <Text style={styles.sideToolbarText}>{label}</Text>
  </TouchableOpacity>
);

const SideToolbar: React.FC<SideToolbarProps> = ({
  onPayPress,
  onSharePress,
  onStorePress,
}) => {
  return (
    <View style={styles.sideToolbar}>
      <ToolbarButton
        iconName="card-outline"
        label="Pay"
        onPress={onPayPress}
      />
      <ToolbarButton
        iconName="share-outline"
        label="Share"
        onPress={onSharePress}
      />
      <ToolbarButton
        iconName="storefront-outline"
        label="Store"
        onPress={onStorePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sideToolbar: {
    position: 'absolute',
    right: 16,
    top: '40%',
    alignItems: 'center',
  },
  sideToolbarButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sideToolbarText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
});

export default SideToolbar;
