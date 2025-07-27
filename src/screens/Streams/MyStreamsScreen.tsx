import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { SellerStackParamList, SellerTabParamList } from '../../navigation/SellerNavigator';

type MyStreamsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<SellerTabParamList, 'Streams'>,
  NativeStackNavigationProp<SellerStackParamList>
>;

const MyStreamsScreen = () => {
  const navigation = useNavigation<MyStreamsScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-800">My Streams</Text>
          <TouchableOpacity
            className="bg-purple-500 p-2 rounded-lg"
            onPress={() => navigation.navigate('CreateStream')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg p-8 items-center">
          <Ionicons name="radio" size={64} color="#ccc" />
          <Text className="text-gray-500 mt-4">No streams yet</Text>
          <TouchableOpacity
            className="bg-purple-500 px-4 py-2 rounded-lg mt-4"
            onPress={() => navigation.navigate('CreateStream')}
          >
            <Text className="text-white font-medium">Start Your First Stream</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MyStreamsScreen;
