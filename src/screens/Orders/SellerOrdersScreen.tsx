import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SellerOrdersScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('all');

  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Orders</Text>

        {/* Tab Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row space-x-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`px-4 py-2 rounded-full ${
                  selectedTab === tab.key
                    ? 'bg-purple-500'
                    : 'bg-gray-200'
                }`}
                onPress={() => setSelectedTab(tab.key)}
              >
                <Text
                  className={`font-medium ${
                    selectedTab === tab.key
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Orders List */}
        <View className="bg-white rounded-lg p-8 items-center">
          <Ionicons name="list" size={64} color="#ccc" />
          <Text className="text-gray-500 mt-4">No orders yet</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Orders will appear here when customers make purchases
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SellerOrdersScreen;