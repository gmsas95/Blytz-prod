import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProductInfoProps {
  productName: string;
  currentPrice: number;
  timeRemaining?: string;
  onSeeMorePress: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  productName,
  currentPrice,
  timeRemaining,
  onSeeMorePress,
}) => {
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(0)}`;
  };

  const formatTime = (time?: string): string => {
    if (!time) return '--:--';
    return time;
  };

  return (
    <View style={styles.productInfoContainer}>
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={1}>
          {productName}
        </Text>
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeMore}>See more ⌄</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(currentPrice)}</Text>
        <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  productDetails: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMore: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timer: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
});

export default ProductInfo;
