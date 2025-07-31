import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase.config';
import { Ionicons } from '@expo/vector-icons';

const AddProductScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [],
  });

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const product = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sellerId: user?.uid,
        sellerName: user?.displayName || 'Anonymous',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      await addDoc(collection(firestore, 'products'), product);
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
      console.error('Error adding product:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Add Product</Text>
        </View>

        <ScrollView className="space-y-4">
          <View>
            <Text className="text-sm font-medium mb-2">Product Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Description *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white h-24"
              placeholder="Describe your product..."
              multiline
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Price *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Stock *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Available quantity"
              keyboardType="number-pad"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Category *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="e.g., Electronics, Fashion, Home"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
          </View>

          <TouchableOpacity
            className="bg-purple-500 p-4 rounded-lg mt-6"
            onPress={handleAddProduct}
          >
            <Text className="text-white text-center font-bold">Add Product</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default AddProductScreen;