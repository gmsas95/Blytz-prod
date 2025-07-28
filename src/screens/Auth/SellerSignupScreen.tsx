import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SellerRegistrationData } from '../../types/models/seller';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SellerSignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SellerSignup'
>;

const SellerSignupScreen = () => {
  const navigation = useNavigation<SellerSignupScreenNavigationProp>();
  const { registerAsSeller } = useAuth();

  const [formData, setFormData] = useState<Partial<SellerRegistrationData>>({
    businessName: '',
    businessType: 'individual',
    taxId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    businessDescription: '',
    bankAccount: {
      accountNumber: '',
      bankName: '',
      accountHolder: '',
    },
    businessAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia',
    },
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof SellerRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankAccountChange = (field: keyof SellerRegistrationData['bankAccount'], value: string) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: { ...(prev.bankAccount || { accountNumber: '', bankName: '', accountHolder: '' }), [field]: value },
    }));
  };

  const handleBusinessAddressChange = (field: keyof SellerRegistrationData['businessAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: { ...(prev.businessAddress || { addressLine1: '', city: '', state: '', postalCode: '', country: '' }), [field]: value },
    }));
  };

  const validateStep1 = () => {
    if (!formData.businessName?.trim()) {
      Alert.alert('Error', 'Business name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.password?.trim()) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.taxId?.trim()) {
      Alert.alert('Error', 'Tax ID/SSM number is required');
      return false;
    }
    if (!formData.phoneNumber?.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!formData.businessAddress?.addressLine1?.trim()) {
      Alert.alert('Error', 'Business address is required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.bankAccount?.accountNumber?.trim()) {
      Alert.alert('Error', 'Bank account number is required');
      return false;
    }
    if (!formData.bankAccount?.bankName?.trim()) {
      Alert.alert('Error', 'Bank name is required');
      return false;
    }
    if (!formData.bankAccount?.accountHolder?.trim()) {
      Alert.alert('Error', 'Account holder name is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const sellerData: SellerRegistrationData = {
        email: formData.email!,
        password: formData.password!,
        businessName: formData.businessName!,
        businessType: formData.businessType!,
        taxId: formData.taxId!,
        phoneNumber: formData.phoneNumber!,
        businessDescription: formData.businessDescription,
        bankAccount: formData.bankAccount!,
        businessAddress: formData.businessAddress!,
      };

      await registerAsSeller(sellerData);
      Alert.alert(
        'Success',
        'Seller account created successfully! Please wait for verification.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: unknown) {
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View className="space-y-4">
      <Text className="text-xl font-bold mb-4">Business Information</Text>
      
      <View>
        <Text className="text-sm font-medium mb-2">Business Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Enter your business name"
          value={formData.businessName}
          onChangeText={(text) => handleInputChange('businessName', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Business Type</Text>
        <View className="flex-row space-x-4">
          {['individual', 'company', 'partnership'].map((type) => (
            <TouchableOpacity
              key={type}
              className={`flex-1 p-3 rounded-lg border ${
                formData.businessType === type
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300'
              }`}
              onPress={() => handleInputChange('businessType', type as 'individual' | 'company' | 'partnership')}
            >
              <Text className="text-center capitalize">{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Email Address *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="your@email.com"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Password *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="At least 6 characters"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Confirm Password *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Confirm your password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="space-y-4">
      <Text className="text-xl font-bold mb-4">Business Details</Text>
      
      <View>
        <Text className="text-sm font-medium mb-2">Tax ID/SSM Number *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Tax ID or SSM registration number"
          value={formData.taxId}
          onChangeText={(text) => handleInputChange('taxId', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Phone Number *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="+60 123 456 7890"
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(text) => handleInputChange('phoneNumber', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Business Address *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-2"
          placeholder="Address Line 1"
          value={formData.businessAddress?.addressLine1}
          onChangeText={(text) => handleBusinessAddressChange('addressLine1', text)}
        />
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-2"
          placeholder="Address Line 2 (Optional)"
          value={formData.businessAddress?.addressLine2}
          onChangeText={(text) => handleBusinessAddressChange('addressLine2', text)}
        />
        <View className="flex-row space-x-2">
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="City"
              value={formData.businessAddress?.city}
              onChangeText={(text) => handleBusinessAddressChange('city', text)}
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="State"
              value={formData.businessAddress?.state}
              onChangeText={(text) => handleBusinessAddressChange('state', text)}
            />
          </View>
        </View>
        <View className="flex-row space-x-2 mt-2">
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Postal Code"
              value={formData.businessAddress?.postalCode}
              onChangeText={(text) => handleBusinessAddressChange('postalCode', text)}
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Country"
              value={formData.businessAddress?.country}
              onChangeText={(text) => handleBusinessAddressChange('country', text)}
            />
          </View>
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Business Description</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white h-20"
          placeholder="Tell us about your business..."
          multiline
          value={formData.businessDescription}
          onChangeText={(text) => handleInputChange('businessDescription', text)}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="space-y-4">
      <Text className="text-xl font-bold mb-4">Banking Information</Text>
      
      <View>
        <Text className="text-sm font-medium mb-2">Bank Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Maybank, CIMB, Public Bank, etc."
          value={formData.bankAccount?.bankName}
          onChangeText={(text) => handleBankAccountChange('bankName', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Account Number *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="1234567890"
          keyboardType="number-pad"
          value={formData.bankAccount?.accountNumber}
          onChangeText={(text) => handleBankAccountChange('accountNumber', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium mb-2">Account Holder Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Name as per bank account"
          value={formData.bankAccount?.accountHolder}
          onChangeText={(text) => handleBankAccountChange('accountHolder', text)}
        />
      </View>

      <View className="bg-yellow-50 p-4 rounded-lg">
        <Text className="text-sm text-yellow-800">
          <Ionicons name="information-circle" size={16} color="#92400e" />
          This account will be used for receiving payments from your sales.
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Seller Registration</Text>
        </View>

        {/* Progress indicator */}
        <View className="flex-row justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <View key={step} className="flex-1 items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step === currentStep
                    ? 'bg-purple-500'
                    : step < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <Text className="text-white font-bold">{step}</Text>
              </View>
              <Text className="text-xs mt-1">{
                step === 1 ? 'Business' : step === 2 ? 'Details' : 'Banking'
              }</Text>
            </View>
          ))}
        </View>

        {/* Step content */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </View>

        {/* Navigation buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="px-6 py-3 border border-gray-300 rounded-lg"
            onPress={handlePrevious}
            disabled={currentStep === 1}
          >
            <Text className="text-gray-700">Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-3 bg-purple-500 rounded-lg"
            onPress={currentStep === 3 ? handleRegister : handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">{currentStep === 3 ? 'Register' : 'Next'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 items-center">
          <Text className="text-gray-600">Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-purple-500 font-bold">Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SellerSignupScreen;
