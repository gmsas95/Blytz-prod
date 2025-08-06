
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellerStackParamList } from '../../navigation/SellerNavigator';
import { useState, useCallback } from 'react';

type SellerProfileScreenNavigationProp = NativeStackNavigationProp<
  SellerStackParamList,
  'SellerTabs'
>;

const SellerProfileScreen = () => {
  const navigation = useNavigation<SellerProfileScreenNavigationProp>();
  const { user, sellerProfile, logout, refreshSellerProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSellerProfile();
    setRefreshing(false);
  }, [refreshSellerProfile]);

  if (!sellerProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <View className="flex-row items-center">
        {icon && <Ionicons name={icon} size={20} color="#6B7280" className="mr-3" />}
        <Text className="text-sm text-gray-600">{label}</Text>
      </View>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );

  const ActionButton = ({ title, icon, onPress, color = "#3B82F6" }: { 
    title: string; 
    icon: keyof typeof Ionicons.glyphMap; 
    onPress: () => void; 
    color?: string;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between mb-3"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3`} style={{ backgroundColor: `${color}20` }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text className="text-gray-800 font-medium">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Profile Header */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <View className="items-center">
            <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="storefront" size={48} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {sellerProfile.businessName}
            </Text>
            <Text className="text-gray-500 mt-1">
              {user?.email}
            </Text>
          </View>

          {/* Verification Status */}
          <View className="mt-6">
            <View className={`rounded-xl p-4 flex-row items-center justify-center ${
              sellerProfile.isVerified ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <Ionicons
                name={sellerProfile.isVerified ? 'checkmark-circle' : 'time'}
                size={24}
                color={sellerProfile.isVerified ? '#10B981' : '#F59E0B'}
              />
              <Text className={`ml-2 font-semibold text-base ${
                sellerProfile.isVerified ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {sellerProfile.isVerified ? 'Verified Seller' : `Status: ${sellerProfile.verificationStatus}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Business Information */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Business Information</Text>
          
          <InfoRow label="Business Type" value={sellerProfile.businessType} icon="business" />
          <InfoRow label="Tax ID/SSM Number" value={sellerProfile.taxId} icon="document-text" />
          <InfoRow label="Phone Number" value={sellerProfile.phoneNumber} icon="call" />
          <InfoRow label="Business Address" value={`${sellerProfile.businessAddress.addressLine1}, ${sellerProfile.businessAddress.city}`} icon="location" />
          
          {sellerProfile.businessDescription && (
            <View className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600 mb-1">Business Description</Text>
              <Text className="text-gray-800 font-medium">{sellerProfile.businessDescription}</Text>
            </View>
          )}
        </View>

        {/* Banking Information */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Banking Information</Text>
          
          <InfoRow label="Bank Name" value={sellerProfile.bankAccount.bankName} icon="card" />
          <InfoRow label="Account Number" value={sellerProfile.bankAccount.accountNumber} icon="key" />
          <InfoRow label="Account Holder" value={sellerProfile.bankAccount.accountHolder} icon="person" />
        </View>

        {/* Performance Stats */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Performance</Text>
          
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-blue-600">{sellerProfile.totalSales}</Text>
              </View>
              <Text className="text-sm text-gray-600">Sales</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-green-600">RM{sellerProfile.totalRevenue.toFixed(0)}</Text>
              </View>
              <Text className="text-sm text-gray-600">Revenue</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-yellow-600">{sellerProfile.rating}</Text>
              </View>
              <Text className="text-sm text-gray-600">Rating</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Actions</Text>
          
          <ActionButton
            title="Edit Profile"
            icon="create-outline"
            onPress={() => navigation.navigate('EditSellerProfile')}
            color="#8B5CF6"
          />
          
          <ActionButton
            title="Business Documents"
            icon="document-text-outline"
            onPress={() => navigation.navigate('BusinessDocuments')}
            color="#3B82F6"
          />
          
          <ActionButton
            title="Verification Settings"
            icon="settings-outline"
            onPress={() => navigation.navigate('BusinessDocuments')}
            color="#10B981"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-50 rounded-xl p-4 shadow-sm flex-row items-center justify-center mb-8"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="ml-3 text-red-600 font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SellerProfileScreen;
