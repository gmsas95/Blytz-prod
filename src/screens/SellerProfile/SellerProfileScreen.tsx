import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { SellerProfile } from '../../types/models/seller';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellerStackParamList } from '../../navigation/SellerNavigator';
import { uploadToStorage } from '../../services/firebase/storage';

type SellerProfileScreenNavigationProp = NativeStackNavigationProp<
  SellerStackParamList,
  'SellerProfile'
>;

const SellerProfileScreen = () => {
  const navigation = useNavigation<SellerProfileScreenNavigationProp>();
  const { user, sellerProfile, refreshSellerProfile } = useAuth();
  
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SellerProfile>>({
    businessName: '',
    businessDescription: '',
    phoneNumber: '',
    businessAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia',
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      website: '',
    },
  });
  
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (sellerProfile) {
      setFormData({
        businessName: sellerProfile.businessName,
        businessDescription: sellerProfile.businessDescription,
        phoneNumber: sellerProfile.phoneNumber,
        businessAddress: sellerProfile.businessAddress,
        socialMedia: sellerProfile.socialMedia || {
          facebook: '',
          instagram: '',
          website: '',
        },
      });
      setLogoUri(sellerProfile.businessLogo || null);
    }
  }, [sellerProfile]);

  const handleInputChange = (field: keyof SellerProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof SellerProfile['businessAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: { ...(prev.businessAddress || {}), [field]: value },
    }));
  };

  const handleSocialMediaChange = (field: keyof SellerProfile['socialMedia'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...(prev.socialMedia || {}), [field]: value },
    }));
  };

  const selectLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingLogo(true);
        const uri = result.assets[0].uri;
        setLogoUri(uri);
        
        // Upload to Firebase Storage
        const uploadedUrl = await uploadToStorage(uri, `seller-logos/${user?.uid}`, 'business-logo');
        setLogoUri(uploadedUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo. Please try again.');
      console.error('Logo upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { getFirestore, doc, updateDoc } = await import('@react-native-firebase/firestore');
      const db = getFirestore();
      
      const updateData = {
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        phoneNumber: formData.phoneNumber,
        businessAddress: formData.businessAddress,
        socialMedia: formData.socialMedia,
        businessLogo: logoUri,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'sellers', user.uid), updateData);
      await refreshSellerProfile();
      
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (sellerProfile) {
      setFormData({
        businessName: sellerProfile.businessName,
        businessDescription: sellerProfile.businessDescription,
        phoneNumber: sellerProfile.phoneNumber,
        businessAddress: sellerProfile.businessAddress,
        socialMedia: sellerProfile.socialMedia || {
          facebook: '',
          instagram: '',
          website: '',
        },
      });
      setLogoUri(sellerProfile.businessLogo || null);
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF385C" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Seller Profile</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Ionicons name={editMode ? "close" : "create-outline"} size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Business Logo */}
        <View className="items-center mb-6">
          <TouchableOpacity 
            onPress={selectLogo} 
            disabled={!editMode}
            className="relative"
          >
            <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-2 border-gray-300">
              {logoUri ? (
                <Image source={{ uri: logoUri }} className="w-full h-full rounded-full" />
              ) : (
                <Ionicons name="business" size={48} color="#666" />
              )}
            </View>
            {editMode && (
              <View className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-2">
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}
            {uploadingLogo && (
              <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text className="mt-2 text-sm text-gray-600">
            {editMode ? 'Tap to change logo' : 'Business Logo'}
          </Text>
        </View>

        {/* Business Information */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Business Information</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Business Name</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.businessName}
                  onChangeText={(text) => handleInputChange('businessName', text)}
                  placeholder="Enter business name"
                />
              ) : (
                <Text className="text-lg text-gray-800">{formData.businessName}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Business Description</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white h-20"
                  value={formData.businessDescription}
                  onChangeText={(text) => handleInputChange('businessDescription', text)}
                  placeholder="Describe your business"
                  multiline
                />
              ) : (
                <Text className="text-gray-800">
                  {formData.businessDescription || 'No description provided'}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Phone Number</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-gray-800">{formData.phoneNumber}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Business Address */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Business Address</Text>
          
          {editMode ? (
            <View className="space-y-3">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.businessAddress?.addressLine1}
                onChangeText={(text) => handleAddressChange('addressLine1', text)}
                placeholder="Address Line 1"
              />
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                value={formData.businessAddress?.addressLine2}
                onChangeText={(text) => handleAddressChange('addressLine2', text)}
                placeholder="Address Line 2 (Optional)"
              />
              <View className="flex-row space-x-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.businessAddress?.city}
                  onChangeText={(text) => handleAddressChange('city', text)}
                  placeholder="City"
                />
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.businessAddress?.state}
                  onChangeText={(text) => handleAddressChange('state', text)}
                  placeholder="State"
                />
              </View>
              <View className="flex-row space-x-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.businessAddress?.postalCode}
                  onChangeText={(text) => handleAddressChange('postalCode', text)}
                  placeholder="Postal Code"
                  keyboardType="number-pad"
                />
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.businessAddress?.country}
                  onChangeText={(text) => handleAddressChange('country', text)}
                  placeholder="Country"
                />
              </View>
            </View>
          ) : (
            <View className="space-y-2">
              <Text className="text-gray-800">{formData.businessAddress?.addressLine1}</Text>
              {formData.businessAddress?.addressLine2 && (
                <Text className="text-gray-800">{formData.businessAddress?.addressLine2}</Text>
              )}
              <Text className="text-gray-800">
                {formData.businessAddress?.city}, {formData.businessAddress?.state}
              </Text>
              <Text className="text-gray-800">
                {formData.businessAddress?.postalCode}, {formData.businessAddress?.country}
              </Text>
            </View>
          )}
        </View>

        {/* Social Media */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Social Media & Website</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Facebook</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.socialMedia?.facebook}
                  onChangeText={(text) => handleSocialMediaChange('facebook', text)}
                  placeholder="facebook.com/yourbusiness"
                />
              ) : (
                <Text className="text-gray-800">
                  {formData.socialMedia?.facebook || 'Not provided'}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Instagram</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.socialMedia?.instagram}
                  onChangeText={(text) => handleSocialMediaChange('instagram', text)}
                  placeholder="@yourbusiness"
                />
              ) : (
                <Text className="text-gray-800">
                  {formData.socialMedia?.instagram || 'Not provided'}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Website</Text>
              {editMode ? (
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                  value={formData.socialMedia?.website}
                  onChangeText={(text) => handleSocialMediaChange('website', text)}
                  placeholder="www.yourbusiness.com"
                />
              ) : (
                <Text className="text-gray-800">
                  {formData.socialMedia?.website || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Verification Status */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Verification Status</Text>
          <View className={`rounded-lg p-3 flex-row items-center ${
            sellerProfile?.isVerified ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <Ionicons
              name={sellerProfile?.isVerified ? "checkmark-circle" : "time"}
              size={20}
              color={sellerProfile?.isVerified ? '#10B981' : '#F59E0B'}
            />
            <Text className={`ml-2 font-medium ${
              sellerProfile?.isVerified ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {sellerProfile?.isVerified ? 'Verified Seller' : `Status: ${sellerProfile?.verificationStatus}`}
            </Text>
          </View>
          {!sellerProfile?.isVerified && (
            <Text className="text-sm text-gray-600 mt-2">
              Your account is being reviewed. You&apos;ll be notified once verified.
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {editMode && (
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg p-4 mr-2"
              onPress={handleCancel}
            >
              <Text className="text-gray-800 text-center font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-purple-500 rounded-lg p-4 ml-2"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SellerProfileScreen;