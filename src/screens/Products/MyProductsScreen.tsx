import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase.config';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';

import { Product } from '../../types/models/product';

const MyProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(firestore, 'products'),
        where('sellerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <ProductCard
        product={{
          ...item,
          sellerName: user?.displayName || 'Your Store',
          sellerAvatar: user?.photoURL,
        }}
        compact={true}
        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-800">My Products</Text>
          <TouchableOpacity
            className="bg-purple-500 p-2 rounded-lg"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg p-8 items-center">
          <Ionicons name="cube" size={64} color="#ccc" />
          <Text className="text-gray-500 mt-4">No products yet</Text>
          <TouchableOpacity
            className="bg-purple-500 px-4 py-2 rounded-lg mt-4"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text className="text-white font-medium">Add Your First Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">
          My Products ({products.length})
        </Text>
        <TouchableOpacity
          className="bg-purple-500 p-2 rounded-lg"
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = {
  productCard: {
    marginBottom: 8,
  },
};

export default MyProductsScreen;