
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellerStackParamList } from '../../navigation/SellerNavigator';

type SellerProfileScreenNavigationProp = NativeStackNavigationProp<
  SellerStackParamList,
  'SellerTabs'
>;

const SellerProfileScreen = () => {
  const navigation = useNavigation<SellerProfileScreenNavigationProp>();
  const { user, sellerProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!sellerProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Header */}
        <View className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <View className="items-center">
            <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {sellerProfile.businessName}
            </Text>
            <Text className="text-gray-600">
              {user?.email}
            </Text>
          </View>

          {/* Verification Status */}
          <View className="mt-4">
            <View className={`rounded-lg p-3 flex-row items-center justify-center ${
              sellerProfile.isVerified ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <Ionicons
                name={sellerProfile.isVerified ? 'checkmark-circle' : 'time'}
                size={20}
                color={sellerProfile.isVerified ? '#10B981' : '#F59E0B'}
              />
              <Text className={`ml-2 font-medium ${
                sellerProfile.isVerified ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {sellerProfile.isVerified ? 'Verified Seller' : `Status: ${sellerProfile.verificationStatus}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Business Information */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Business Information</Text>
          
          <View className="space-y-3">
            <View>
              <Text className="text-sm text-gray-600">Business Type</Text>
              <Text className="text-gray-800 font-medium capitalize">
                {sellerProfile.businessType}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600">Tax ID/SSM Number</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.taxId}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600">Phone Number</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.phoneNumber}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600">Business Address</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.businessAddress.addressLine1}
                {sellerProfile.businessAddress.addressLine2 && `, ${sellerProfile.businessAddress.addressLine2}`}
              </Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.businessAddress.city}, {sellerProfile.businessAddress.state}
              </Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.businessAddress.postalCode}, {sellerProfile.businessAddress.country}
              </Text>
            </View>

            {sellerProfile.businessDescription && (
              <View>
                <Text className="text-sm text-gray-600">Business Description</Text>
                <Text className="text-gray-800 font-medium">
                  {sellerProfile.businessDescription}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Banking Information */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Banking Information</Text>
          
          <View className="space-y-3">
            <View>
              <Text className="text-sm text-gray-600">Bank Name</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.bankAccount.bankName}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600">Account Number</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.bankAccount.accountNumber}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600">Account Holder</Text>
              <Text className="text-gray-800 font-medium">
                {sellerProfile.bankAccount.accountHolder}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Stats */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Performance</Text>
          
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-600">Total Sales</Text>
              <Text className="text-xl font-bold text-gray-800">
                {sellerProfile.totalSales}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-600">Total Revenue</Text>
              <Text className="text-xl font-bold text-green-600">
                RM{sellerProfile.totalRevenue.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-600">Rating</Text>
              <Text className="text-xl font-bold text-yellow-600">
                {sellerProfile.rating}/5
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-white rounded-lg p-4 shadow-sm flex-row items-center justify-between"
            onPress={() => navigation.navigate('EditSellerProfile')}
          >
            <View className="flex-row items-center">
              <Ionicons name="create" size={20} color="#3B82F6" />
              <Text className="ml-3 text-gray-800 font-medium">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-lg p-4 shadow-sm flex-row items-center justify-between"
            onPress={() => navigation.navigate('BusinessDocuments')}
          >
            <View className="flex-row items-center">
              <Ionicons name="document" size={20} color="#3B82F6" />
              <Text className="ml-3 text-gray-800 font-medium">Business Documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-50 rounded-lg p-4 shadow-sm flex-row items-center justify-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text className="ml-3 text-red-600 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SellerProfileScreen;
