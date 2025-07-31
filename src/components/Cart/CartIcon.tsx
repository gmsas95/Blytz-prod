import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { theme } from '../../config/theme';

interface CartIconProps {
  size?: number;
  color?: string;
  showBadge?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({
  size = 24,
  color = theme.colors.onBackground,
  showBadge = true,
}) => {
  const navigation = useNavigation();
  const { state } = useCart();

  const handlePress = () => {
    navigation.navigate('Cart' as never);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name="cart-outline" size={size} color={color} />
      {showBadge && state.itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
});