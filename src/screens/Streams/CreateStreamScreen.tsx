import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CreateStreamScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    privacy: 'public',
    products: [],
  });

  const handleCreateStream = () => {
    Alert.alert('Coming Soon', 'Stream creation will be implemented in Week 2');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Start Live Stream</Text>
        </View>

        <ScrollView className="space-y-4">
          <View>
            <Text className="text-sm font-medium mb-2">Stream Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Give your stream a catchy title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white h-24"
              placeholder="Tell viewers what your stream is about..."
              multiline
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Privacy</Text>
            <View className="flex-row space-x-4">
              {['public', 'private'].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 p-3 rounded-lg border ${
                    formData.privacy === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300'
                  }`}
                  onPress={() => setFormData({ ...formData, privacy: option })}
                >
                  <Text className="text-center capitalize">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium mb-2">Select Products</Text>
            <View className="bg-white rounded-lg p-4 border border-gray-300">
              <Text className="text-gray-500 text-center">
                Select products to showcase in your stream
              </Text>
              <TouchableOpacity className="mt-2 bg-purple-100 p-2 rounded-lg">
                <Text className="text-purple-600 text-center">Choose Products</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-purple-500 p-4 rounded-lg mt-6"
            onPress={handleCreateStream}
          >
            <Text className="text-white text-center font-bold">Start Stream</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default CreateStreamScreen;