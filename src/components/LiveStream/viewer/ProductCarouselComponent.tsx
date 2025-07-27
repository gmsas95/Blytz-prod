import React from 'react';
import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';

const ProductCarouselComponent = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.productCard}>
        <Image
          source={{uri: 'https://via.placeholder.com/100'}}
          style={styles.productImage}
        />
        <Text style={styles.productName}>Vintage Tee</Text>
        <Text style={styles.productPrice}>$45.00</Text>
      </View>
      <View style={styles.productCard}>
        <Image
          source={{uri: 'https://via.placeholder.com/100'}}
          style={styles.productImage}
        />
        <Text style={styles.productName}>Rare Sneakers</Text>
        <Text style={styles.productPrice}>$250.00</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    width: 120,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginBottom: 4,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  productPrice: {
    color: '#888',
    fontSize: 12,
  },
});

export default ProductCarouselComponent;
