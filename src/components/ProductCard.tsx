import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ViewStyle, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../config/theme';
import { Product } from '../types/models/product';
import { useCart } from '../context/CartContext';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with 16px padding and 8px gaps

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
  showSeller?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showSeller = false,
  compact = false,
  style,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addToCart, isInCart } = useCart();
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.inventory.quantity <= 0;

  const getTimeRemaining = () => {
    if (!product.isAuction || !product.auctionDetails?.endTime) return '';
    const now = new Date();
    const end = new Date(product.auctionDetails.endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    
    addToCart(product, 1);
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ProductDetail', { productId: product.id });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer, style]}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* Image Section */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <Image
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          style={[styles.image, compact && styles.compactImage, isOutOfStock && styles.outOfStockImage]}
          resizeMode="cover"
        />
        
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}

        {product.isAuction && (
          <View style={styles.auctionBadge}>
            <Ionicons name="hammer" size={12} color="#fff" />
            <Text style={styles.auctionText}>Live</Text>
          </View>
        )}

        {product.inventory.quantity <= 5 && product.inventory.quantity > 0 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>{product.inventory.quantity} left</Text>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryTextBadge}>{product.category}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={[styles.content, compact && styles.compactContent]}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, compact && styles.compactName]} numberOfLines={2}>
            {product.title}
          </Text>
          
          {product.isAuction && (
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={12} color={theme.colors.error} />
              <Text style={styles.timerText}>{getTimeRemaining()}</Text>
            </View>
          )}
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={[styles.price, compact && styles.compactPrice]}>
            RM{product.price.toFixed(2)}
          </Text>
          
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              RM{product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        {showSeller && (
          <View style={styles.sellerRow}>
            <Image
              source={{ uri: 'https://via.placeholder.com/20' }}
              style={styles.sellerAvatar}
            />
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.sellerId}
            </Text>
          </View>
        )}

        {!compact && (
          <View style={styles.footerRow}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryTextSmall}>{product.category}</Text>
            </View>
            
            <View style={styles.stockInfo}>
              <Ionicons name="cube-outline" size={14} color={theme.colors.secondary} />
              <Text style={styles.stockText}>{product.inventory.quantity} in stock</Text>
            </View>
          </View>
        )}

        {!compact && (
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              isInCart(product.id) && styles.inCartButton
            ]} 
            onPress={handleAddToCart}
          >
            <Ionicons 
              name={isInCart(product.id) ? 'checkmark-circle' : 'cart-outline'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.addToCartText}>
              {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  compactImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  outOfStockImage: {
    opacity: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  auctionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auctionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -15 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTextBadge: {
    color: '#fff',
    fontSize: 11,
  },
  content: {
    padding: 12,
  },
  compactContent: {
    flex: 1,
    padding: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    flex: 1,
  },
  compactName: {
    fontSize: 12,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 4,
  },
  compactPrice: {
    fontSize: 14,
  },
  originalPrice: {
    fontSize: 12,
    color: theme.colors.secondary,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  sellerName: {
    fontSize: 11,
    color: theme.colors.secondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTextSmall: {
    fontSize: 11,
    color: theme.colors.secondary,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stockText: {
    fontSize: 11,
    color: theme.colors.secondary,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
    marginTop: 4,
  },
  inCartButton: {
    backgroundColor: '#28a745',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  timerText: {
    fontSize: 10,
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default ProductCard;