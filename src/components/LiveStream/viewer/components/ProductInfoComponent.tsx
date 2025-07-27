import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProductInfoComponentProps {
  productName: string;
  price: string;
  timer: string;
  onSeeMorePress?: () => void;
}

const ProductInfoComponent: React.FC<ProductInfoComponentProps> = ({
  productName,
  price,
  timer,
  onSeeMorePress,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.productName}>{productName}</Text>
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeMore}>See more ⌄</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.timer}>{timer}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMore: {
    color: '#ccc',
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
  },
});

export default ProductInfoComponent;
