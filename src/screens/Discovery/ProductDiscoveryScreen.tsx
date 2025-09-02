import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { productService } from '../../services/firebase/products';
import { Product } from '../../types/models/product';
import { auctionsService } from '../../services/firebase/auctions';

interface AuctionProduct extends Product {
  auctionDetails: {
    startingPrice: number;
    reservePrice?: number;
    currentBid?: number;
    endTime: Date;
    bidIncrement: number;
    status: 'live' | 'upcoming' | 'ended';
  };
  sellerName: string;
  sellerAvatar?: string;
}

type NavigationProp = NativeStackNavigationProp<{
  ProductDetail: { productId: string };
  LiveStreamViewer: { streamId: string };
}>;

const auctionStatuses = [
  { id: 'live', name: 'Live', icon: 'flash-outline' },
  { id: 'upcoming', name: 'Upcoming', icon: 'time-outline' },
  { id: 'ended', name: 'Ended', icon: 'checkmark-done-outline' },
];

const categories = [
  { id: 'all', name: 'All', icon: 'apps-outline' },
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline' },
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait-outline' },
  { id: 'collectibles', name: 'Collectibles', icon: 'trophy-outline' },
  { id: 'art', name: 'Art', icon: 'color-palette-outline' },
  { id: 'sports', name: 'Sports', icon: 'basketball-outline' },
];

export default function ProductDiscoveryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedStatus, setSelectedStatus] = useState('live');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AuctionProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AuctionProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load auction products
  const loadAuctionProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const products = await auctionsService.getAuctionProducts();
      setProducts(products);
    } catch (err) {
      setError('Failed to load auction products. Please try again.');
      console.error('Error loading auction products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time auction updates
  useEffect(() => {
    const unsubscribe = auctionsService.subscribeToAuctionProducts((products) => {
      setProducts(products);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadAuctionProducts();
  }, [loadAuctionProducts]);

  // Filter products based on status and category
  useEffect(() => {
    let filtered = products;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => 
        product.auctionDetails.status === selectedStatus
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [selectedStatus, selectedCategory, products]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAuctionProducts();
    } catch (err) {
      setError('Failed to refresh products.');
    } finally {
      setRefreshing(false);
    }
  }, [loadAuctionProducts]);

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const renderProductCard = ({ item }: { item: AuctionProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productOverlay}>
        <View style={styles.statusIndicator}>
          <View 
            style={[
              styles.statusDot,
              { 
                backgroundColor: 
                  item.auctionDetails.status === 'live' ? '#ff0000' :
                  item.auctionDetails.status === 'upcoming' ? '#ffa500' : '#808080'
              }
            ]} 
          />
          <Text style={styles.statusText}>
            {item.auctionDetails.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productSeller}>{item.sellerName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currentBid}>
            ${item.auctionDetails.currentBid || item.auctionDetails.startingPrice}
          </Text>
          {item.auctionDetails.status === 'live' && (
            <Text style={styles.timeRemaining}>
              {formatTimeRemaining(item.auctionDetails.endTime)}
            </Text>
          )}
        </View>
        <Text style={styles.bidInfo}>
          {item.auctionDetails.bidIncrement} min increment
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = ({ item }: { item: typeof auctionStatuses[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedStatus === item.id && styles.selectedFilterButton,
      ]}
      onPress={() => setSelectedStatus(item.id)}>
      <Ionicons
        name={item.icon as keyof typeof Ionicons.glyphMap}
        size={16}
        color={selectedStatus === item.id ? '#fff' : theme.colors.secondary}
      />
      <Text
        style={[
          styles.filterText,
          selectedStatus === item.id && styles.selectedFilterText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryFilter = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item.id)}>
      <Ionicons
        name={item.icon as keyof typeof Ionicons.glyphMap}
        size={20}
        color={selectedCategory === item.id ? '#fff' : theme.colors.secondary}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAuctionProducts}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="compass" size={28} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Discover Products</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Status Filter */}
        <View style={styles.section}>
          <FlatList
            data={auctionStatuses}
            renderItem={renderStatusFilter}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            renderItem={renderCategoryFilter}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Products Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Auctions
            </Text>
            <Text style={styles.resultsCount}>
              {filteredProducts.length} products
            </Text>
          </View>
          
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productGrid}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={theme.colors.secondary} />
              <Text style={styles.emptyText}>
                No {selectedStatus} products in this category
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  resultsCount: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  selectedFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginLeft: 4,
  },
  selectedFilterText: {
    color: '#fff',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productGrid: {
    paddingHorizontal: 16,
  },
  productCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  productOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  productSeller: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  currentBid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  timeRemaining: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
  bidInfo: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});