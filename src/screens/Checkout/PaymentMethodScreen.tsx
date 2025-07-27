import React from 'react';
import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';

export default function PaymentMethodScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between py-4 px-4 border-b border-border mt-4">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="text" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Payment Methods</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-text">
          Payment Methods Screen Content
        </Text>
      </View>
    </SafeAreaView>
  );
}
