import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface SellerApplication {
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  taxId: string;
  phoneNumber: string;
  businessDescription: string;
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  documents: {
    businessLicense?: string;
    taxDocument?: string;
    bankStatement?: string;
  };
}

const BANK_OPTIONS = [
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'AmBank',
  'UOB Bank',
  'OCBC Bank',
  'Standard Chartered',
  'HSBC Bank',
];

const SellerOnboardingScreen = () => {
  const navigation = useNavigation();
  const { user, applyForSeller } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const [application, setApplication] = useState<SellerApplication>({
    businessName: '',
    businessType: 'individual',
    taxId: '',
    phoneNumber: '',
    businessDescription: '',
    businessAddress: {
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia',
    },
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    },
    documents: {},
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const fadeIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleInputChange = (field: keyof SellerApplication, value: string) => {
    setApplication(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddressChange = (field: keyof SellerApplication['businessAddress'], value: string) => {
    setApplication(prev => ({
      ...prev,
      businessAddress: { ...prev.businessAddress, [field]: value },
    }));
    setFormErrors(prev => ({ ...prev, [`address.${field}`]: '' }));
  };

  const handleBankChange = (field: keyof SellerApplication['bankAccount'], value: string) => {
    setApplication(prev => ({
      ...prev,
      bankAccount: { ...prev.bankAccount, [field]: value },
    }));
    setFormErrors(prev => ({ ...prev, [`bank.${field}`]: '' }));
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!application.businessName.trim()) errors.businessName = 'Business name is required';
        if (!application.taxId.trim()) errors.taxId = 'Tax ID/SSM number is required';
        if (!application.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
        if (!/^\+?\d{10,}$/.test(application.phoneNumber)) errors.phoneNumber = 'Valid phone number required';
        break;
      case 2:
        if (!application.businessAddress.addressLine1.trim()) errors['address.addressLine1'] = 'Address is required';
        if (!application.businessAddress.city.trim()) errors['address.city'] = 'City is required';
        if (!application.businessAddress.state.trim()) errors['address.state'] = 'State is required';
        if (!application.businessAddress.postalCode.trim()) errors['address.postalCode'] = 'Postal code is required';
        break;
      case 3:
        if (!application.bankAccount.bankName.trim()) errors['bank.bankName'] = 'Bank name is required';
        if (!application.bankAccount.accountNumber.trim()) errors['bank.accountNumber'] = 'Account number is required';
        if (!application.bankAccount.accountHolder.trim()) errors['bank.accountHolder'] = 'Account holder name is required';
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      fadeIn();
    } else if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      fadeIn();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      fadeIn();
    }
  };

  const submitApplication = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await applyForSeller(application);
      setCurrentStep(5);
      fadeIn();
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const WelcomeStep = () => (
    <LinearGradient
      colors={[theme.colors.primary, '#FF6B6B', '#FFA500']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center px-6">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="items-center mb-8">
              <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-6">
                <Ionicons name="storefront-outline" size={64} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white mb-4 text-center">
                Become a Seller
              </Text>
              <Text className="text-xl text-white/90 text-center mb-8">
                Join thousands of sellers and start earning today
              </Text>
            </View>

            <View className="space-y-4 mb-8">
              {[
                { icon: 'trending-up', text: 'Reach millions of buyers' },
                { icon: 'shield-checkmark', text: 'Secure payments & protection' },
                { icon: 'rocket', text: 'Easy setup & fast approval' },
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center space-x-3">
                  <Ionicons name={feature.icon as any} size={24} color="white" />
                  <Text className="text-white text-lg">{feature.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        <View className="px-6 pb-8">
          <TouchableOpacity
            className="bg-white rounded-full py-4 px-8 items-center shadow-lg"
            onPress={handleNext}
          >
            <Text className="text-lg font-bold" style={{ color: theme.colors.primary }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const BusinessInfoStep = () => (
    <View className="flex-1 px-6 pt-6">
      <Text className="text-3xl font-bold mb-2" style={{ color: theme.colors.onBackground }}>
        Business Information
      </Text>
      <Text className="text-gray-600 mb-8">Tell us about your business</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="space-y-6">
          {/* Business Name */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Business Name *
            </Text>
            <View className="relative">
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  formErrors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your business name"
                placeholderTextColor="#9CA3AF"
                value={application.businessName}
                onChangeText={(text) => handleInputChange('businessName', text)}
              />
              <FontAwesome5 name="building" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
            {formErrors.businessName && (
              <Text className="text-red-500 text-sm mt-1">{formErrors.businessName}</Text>
            )}
          </View>

          {/* Business Type */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Business Type
            </Text>
            <View className="space-y-3">
              {[
                { type: 'individual', label: 'Individual', icon: 'user' },
                { type: 'company', label: 'Company', icon: 'building' },
                { type: 'partnership', label: 'Partnership', icon: 'users' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    application.businessType === item.type
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300'
                  }`}
                  onPress={() => handleInputChange('businessType', item.type as any)}
                >
                  <FontAwesome5
                    name={item.icon as any}
                    size={20}
                    color={application.businessType === item.type ? theme.colors.primary : '#9CA3AF'}
                  />
                  <Text className="ml-3 text-base font-medium">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tax ID */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Tax ID/SSM Number *
            </Text>
            <View className="relative">
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  formErrors.taxId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tax ID or SSM registration number"
                placeholderTextColor="#9CA3AF"
                value={application.taxId}
                onChangeText={(text) => handleInputChange('taxId', text)}
              />
              <FontAwesome5 name="id-card" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
            {formErrors.taxId && (
              <Text className="text-red-500 text-sm mt-1">{formErrors.taxId}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Phone Number *
            </Text>
            <View className="relative">
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+60 123 456 7890"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={application.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
              />
              <FontAwesome5 name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
            {formErrors.phoneNumber && (
              <Text className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</Text>
            )}
          </View>

          {/* Business Description */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Business Description
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base h-24"
                placeholder="Tell us about your business..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={application.businessDescription}
                onChangeText={(text) => handleInputChange('businessDescription', text)}
              />
              <Entypo name="text-document" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const AddressStep = () => (
    <View className="flex-1 px-6 pt-6">
      <Text className="text-3xl font-bold mb-2" style={{ color: theme.colors.onBackground }}>
        Business Address
      </Text>
      <Text className="text-gray-600 mb-8">Where is your business located?</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="space-y-6">
          {/* Address Line 1 */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Address Line 1 *
            </Text>
            <View className="relative">
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  formErrors['address.addressLine1'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Street address"
                placeholderTextColor="#9CA3AF"
                value={application.businessAddress.addressLine1}
                onChangeText={(text) => handleAddressChange('addressLine1', text)}
              />
              <FontAwesome5 name="map-marker-alt" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
            {formErrors['address.addressLine1'] && (
              <Text className="text-red-500 text-sm mt-1">{formErrors['address.addressLine1']}</Text>
            )}
          </View>

          {/* Address Line 2 */}
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
              Address Line 2 (Optional)
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base"
                placeholder="Apartment, suite, unit, etc."
                placeholderTextColor="#9CA3AF"
                value={application.businessAddress.addressLine2 || ''}
                onChangeText={(text) => handleAddressChange('addressLine2', text)}
              />
              <FontAwesome5 name="building" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
          </View>

          {/* City & State */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                City *
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-4 text-base ${
                    formErrors['address.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  value={application.businessAddress.city}
                  onChangeText={(text) => handleAddressChange('city', text)}
                />
                <FontAwesome5 name="city" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
              {formErrors['address.city'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['address.city']}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                State *
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-4 text-base ${
                    formErrors['address.state'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  value={application.businessAddress.state}
                  onChangeText={(text) => handleAddressChange('state', text)}
                />
                <FontAwesome5 name="map" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
              {formErrors['address.state'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['address.state']}</Text>
              )}
            </View>
          </View>

          {/* Postal Code & Country */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                Postal Code *
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-4 text-base ${
                    formErrors['address.postalCode'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={application.businessAddress.postalCode}
                  onChangeText={(text) => handleAddressChange('postalCode', text)}
                />
                <FontAwesome5 name="envelope" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
              {formErrors['address.postalCode'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['address.postalCode']}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                Country *
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-gray-100"
                  value="Malaysia"
                  editable={false}
                />
                <FontAwesome5 name="flag" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const BankingStep = () => {
    const filteredBanks = BANK_OPTIONS.filter(bank =>
      bank.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-bold mb-2" style={{ color: theme.colors.onBackground }}>
          Banking Information
        </Text>
        <Text className="text-gray-600 mb-8">Where should we send your earnings?</Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-6">
            {/* Bank Name */}
            <View>
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                Bank Name *
              </Text>
              <TouchableOpacity
                className={`border rounded-xl p-4 flex-row justify-between items-center ${
                  formErrors['bank.bankName'] ? 'border-red-500' : 'border-gray-300'
                }`}
                onPress={() => setShowBankDropdown(!showBankDropdown)}
              >
                <Text className={application.bankAccount.bankName ? 'text-base' : 'text-gray-500'}>
                  {application.bankAccount.bankName || 'Select your bank'}
                </Text>
                <FontAwesome5 name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              
              {showBankDropdown && (
                <View className="border border-gray-300 rounded-xl mt-2 bg-white">
                  <TextInput
                    className="border-b border-gray-300 p-3"
                    placeholder="Search banks..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <ScrollView className="max-h-40" showsVerticalScrollIndicator={false}>
                    {filteredBanks.map((bank) => (
                      <TouchableOpacity
                        key={bank}
                        className="p-3 border-b border-gray-100"
                        onPress={() => {
                          handleBankChange('bankName', bank);
                          setShowBankDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        <Text className="text-base">{bank}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {formErrors['bank.bankName'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['bank.bankName']}</Text>
              )}
            </View>

            {/* Account Number */}
            <View>
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                Account Number *
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-4 text-base ${
                    formErrors['bank.accountNumber'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234567890"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={application.bankAccount.accountNumber}
                  onChangeText={(text) => handleBankChange('accountNumber', text)}
                />
                <FontAwesome5 name="credit-card" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
              {formErrors['bank.accountNumber'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['bank.accountNumber']}</Text>
              )}
            </View>

            {/* Account Holder Name */}
            <View>
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.onBackground }}>
                Account Holder Name *
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-4 text-base ${
                    formErrors['bank.accountHolder'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Name as per bank account"
                  placeholderTextColor="#9CA3AF"
                  value={application.bankAccount.accountHolder}
                  onChangeText={(text) => handleBankChange('accountHolder', text)}
                />
                <FontAwesome5 name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
              </View>
              {formErrors['bank.accountHolder'] && (
                <Text className="text-red-500 text-sm mt-1">{formErrors['bank.accountHolder']}</Text>
              )}
            </View>

            {/* Info Card */}
            <View className="bg-blue-50 p-4 rounded-xl flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-blue-800 font-semibold mb-1">Payment Information</Text>
                <Text className="text-blue-700 text-sm">
                  This account will be used to receive all your sales earnings. Make sure the details are correct.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const ReviewStep = () => (
    <View className="flex-1 px-6 pt-6">
      <Text className="text-3xl font-bold mb-2" style={{ color: theme.colors.onBackground }}>
        Review Your Information
      </Text>
      <Text className="text-gray-600 mb-8">Please review before submitting</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="space-y-6">
          {/* Business Info */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-bold mb-3">Business Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Business Name:</Text>
                <Text className="font-medium">{application.businessName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Business Type:</Text>
                <Text className="font-medium capitalize">{application.businessType}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Tax ID:</Text>
                <Text className="font-medium">{application.taxId}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Phone:</Text>
                <Text className="font-medium">{application.phoneNumber}</Text>
              </View>
            </View>
          </View>

          {/* Address */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-bold mb-3">Business Address</Text>
            <View className="space-y-2">
              <Text className="font-medium">{application.businessAddress.addressLine1}</Text>
              {application.businessAddress.addressLine2 && (
                <Text className="font-medium">{application.businessAddress.addressLine2}</Text>
              )}
              <Text className="font-medium">
                {application.businessAddress.city}, {application.businessAddress.state}
              </Text>
              <Text className="font-medium">
                {application.businessAddress.postalCode}, {application.businessAddress.country}
              </Text>
            </View>
          </View>

          {/* Banking */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-bold mb-3">Banking Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Bank:</Text>
                <Text className="font-medium">{application.bankAccount.bankName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Account Holder:</Text>
                <Text className="font-medium">{application.bankAccount.accountHolder}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Account Number:</Text>
                <Text className="font-medium">••••{application.bankAccount.accountNumber.slice(-4)}</Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <View className="bg-gray-50 p-4 rounded-xl">
            <Text className="text-sm text-gray-700">
              By submitting this application, you agree to our terms of service and seller policies.
              Your information will be reviewed within 24-48 hours.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const SuccessStep = () => (
    <LinearGradient
      colors={['#10B981', '#059669']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="white" />
          </View>
          <Text className="text-4xl font-bold text-white mb-4 text-center">
            Application Submitted!
          </Text>
          <Text className="text-xl text-white/90 text-center mb-8">
            Your seller application has been submitted successfully. We'll review it within 24-48 hours.
          </Text>
          
          <View className="bg-white/10 p-4 rounded-xl mb-8">
            <Text className="text-white text-center">
              You'll receive an email notification once your application is approved.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-white rounded-full py-4 px-8 items-center shadow-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-lg font-bold" style={{ color: '#10B981' }}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <BusinessInfoStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <BankingStep />;
      case 4:
        return <ReviewStep />;
      case 5:
        return <SuccessStep />;
      default:
        return null;
    }
  };

  const renderProgress = () => {
    if (currentStep === 0 || currentStep === 5) return null;
    
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.primary }}>
            {Math.round(progress)}% Complete
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            className="h-full rounded-full"
            style={{ backgroundColor: theme.colors.primary, width: `${progress}%` }}
          />
        </View>
      </View>
    );
  };

  const renderNavigation = () => {
    if (currentStep === 0 || currentStep === 5) return null;

    return (
      <View className="flex-row justify-between items-center px-6 py-4 border-t border-gray-200">
        <TouchableOpacity
          className={`py-3 px-6 rounded-full ${
            currentStep === 1
              ? 'bg-gray-100'
              : 'bg-gray-200'
          }`}
          onPress={handlePrevious}
          disabled={currentStep === 1}
        >
          <Text className={`font-semibold ${currentStep === 1 ? 'text-gray-400' : 'text-gray-700'}`}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-purple-500 py-3 px-8 rounded-full shadow-lg"
          onPress={currentStep === 4 ? submitApplication : handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {currentStep === 4 ? 'Submit Application' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (currentStep === 0 || currentStep === 5) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        {renderStep()}
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View className="h-32" style={{ backgroundColor: theme.colors.primary }}>
        <SafeAreaView className="flex-1 justify-center">
          <View className="flex-row items-center px-6">
            <TouchableOpacity onPress={() => {
              if (currentStep === 1) {
                setCurrentStep(0);
              } else {
                handlePrevious();
              }
            }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Seller Onboarding</Text>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {renderProgress()}
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }],
            flex: 1 
          }}
        >
          {renderStep()}
        </Animated.View>
      </KeyboardAvoidingView>

      {renderNavigation()}
    </View>
  );
};

const styles = StyleSheet.create({
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
});

export default SellerOnboardingScreen;