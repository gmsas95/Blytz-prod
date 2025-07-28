import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellerStackParamList } from '../../navigation/SellerNavigator';

type MyProductsScreenNavigationProp = NativeStackNavigationProp<
  SellerStackParamList,
  'SellerTabs'
>;


const MyProductsScreen = () => {
  const navigation = useNavigation<MyProductsScreenNavigationProp>();
  

  return (
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
};

export default MyProductsScreen;
