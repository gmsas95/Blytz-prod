import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SellerRegistrationData } from '../../types/models';
import { theme } from '../../config/theme';

const SellerSignupScreen = () => {
  const navigation = useNavigation();
  const { registerAsSeller } = useAuth();

  // Create refs for all input fields
  const businessNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const taxIdRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const addressLine1Ref = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const postalCodeRef = useRef<TextInput>(null);
  const bankNameRef = useRef<TextInput>(null);
  const accountNumberRef = useRef<TextInput>(null);
  const accountHolderRef = useRef<TextInput>(null);

  const [formData, setFormData] = useState<SellerRegistrationData>({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    taxId: '',
    phoneNumber: '',
    bankAccount: {
      accountNumber: '',
      bankName: '',
      accountHolder: '',
    },
    businessAddress: {
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia',
    },
    businessType: 'individual',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof SellerRegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof SellerRegistrationData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { 
        ...(prev[parent] as Record<string, string> || {}), 
        [field]: value 
      }
    }));
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      Alert.alert('Required', 'Business name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Required', 'Email is required');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Required', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.taxId.trim()) {
      Alert.alert('Required', 'Tax ID/SSM number is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Required', 'Phone number is required');
      return false;
    }
    if (!formData.bankAccount.accountNumber.trim()) {
      Alert.alert('Required', 'Bank account number is required');
      return false;
    }
    if (!formData.bankAccount.bankName.trim()) {
      Alert.alert('Required', 'Bank name is required');
      return false;
    }
    if (!formData.businessAddress.addressLine1.trim()) {
      Alert.alert('Required', 'Business address is required');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerAsSeller(formData);
      Alert.alert(
        'Welcome to Blytz!',
        'Your seller account has been created successfully. Start selling with live streams!',
        [{ text: 'Get Started', onPress: () => navigation.navigate('SellerTabs' as never) }]
      );
    } catch (error: unknown) {
      const err = error as Error;
      Alert.alert('Registration Error', err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  icon?: keyof typeof Ionicons.glyphMap;
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}

const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default', 
    icon,
    onSubmitEditing,
    inputRef
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={theme.colors.secondary} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType="next"
          onSubmitEditing={onSubmitEditing}
          ref={inputRef}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="storefront-outline" size={48} color={theme.colors.primary} />
          <Text style={styles.title}>Become a Seller</Text>
          <Text style={styles.subtitle}>Start your live selling journey</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Business Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Account</Text>
            
            <InputField
              label="Business Name"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChangeText={(text) => handleInputChange('businessName', text)}
              onSubmitEditing={() => emailRef.current?.focus()}
              inputRef={businessNameRef}
              icon="business-outline"
            />
            
            <InputField
              label="Email Address"
              placeholder="you@business.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              onSubmitEditing={() => passwordRef.current?.focus()}
              inputRef={emailRef}
              keyboardType="email-address"
              icon="mail-outline"
            />
            
            <InputField
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              inputRef={passwordRef}
              secureTextEntry
              icon="lock-closed-outline"
            />
            
            <InputField
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword || ''}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              onSubmitEditing={() => taxIdRef.current?.focus()}
              inputRef={confirmPasswordRef}
              secureTextEntry
              icon="lock-closed-outline"
            />
          </View>

          {/* Business Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Details</Text>
            
            <InputField
              label="Tax ID / SSM Number"
              placeholder="12345678-X"
              value={formData.taxId}
              onChangeText={(text) => handleInputChange('taxId', text)}
              onSubmitEditing={() => phoneNumberRef.current?.focus()}
              inputRef={taxIdRef}
              icon="card-outline"
            />
            
            <InputField
              label="Phone Number"
              placeholder="+60 123 456 7890"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              onSubmitEditing={() => addressLine1Ref.current?.focus()}
              inputRef={phoneNumberRef}
              keyboardType="phone-pad"
              icon="call-outline"
            />
            
            <InputField
              label="Business Address"
              placeholder="Street address"
              value={formData.businessAddress.addressLine1}
              onChangeText={(text) => handleNestedChange('businessAddress', 'addressLine1', text)}
              onSubmitEditing={() => cityRef.current?.focus()}
              inputRef={addressLine1Ref}
              icon="location-outline"
            />
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="City"
                  placeholder="City"
                  value={formData.businessAddress.city}
                  onChangeText={(text) => handleNestedChange('businessAddress', 'city', text)}
                  onSubmitEditing={() => stateRef.current?.focus()}
                  inputRef={cityRef}
                  icon="business-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="State"
                  placeholder="State"
                  value={formData.businessAddress.state}
                  onChangeText={(text) => handleNestedChange('businessAddress', 'state', text)}
                  onSubmitEditing={() => postalCodeRef.current?.focus()}
                  inputRef={stateRef}
                  icon="business-outline"
                />
              </View>
            </View>
            
            <InputField
              label="Postal Code"
              placeholder="12345"
              value={formData.businessAddress.postalCode}
              onChangeText={(text) => handleNestedChange('businessAddress', 'postalCode', text)}
              onSubmitEditing={() => bankNameRef.current?.focus()}
              inputRef={postalCodeRef}
              keyboardType="number-pad"
              icon="location-outline"
            />
          </View>

          {/* Banking Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking Details</Text>
            
            <InputField
              label="Bank Name"
              placeholder="Maybank, CIMB, RHB, etc."
              value={formData.bankAccount.bankName}
              onChangeText={(text) => handleNestedChange('bankAccount', 'bankName', text)}
              onSubmitEditing={() => accountNumberRef.current?.focus()}
              inputRef={bankNameRef}
              icon="business-outline"
            />
            
            <InputField
              label="Account Number"
              placeholder="1234567890"
              value={formData.bankAccount.accountNumber}
              onChangeText={(text) => handleNestedChange('bankAccount', 'accountNumber', text)}
              onSubmitEditing={() => accountHolderRef.current?.focus()}
              inputRef={accountNumberRef}
              keyboardType="number-pad"
              icon="keypad-outline"
            />
            
            <InputField
              label="Account Holder Name"
              placeholder="Name as per bank records"
              value={formData.bankAccount.accountHolder}
              onChangeText={(text) => handleNestedChange('bankAccount', 'accountHolder', text)}
              onSubmitEditing={() => handleRegister()}
              inputRef={accountHolderRef}
              icon="person-outline"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>REGISTER AS SELLER</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.onBackground,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.subtitle1,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    left: theme.spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    fontFamily: 'Inter',
    fontSize: 16,
    minHeight: 48,
    width: '100%',
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.secondary,
    opacity: 0.6,
  },
    buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 1.25,
    textTransform: 'uppercase' as const,
  } as TextStyle,
  linkButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  linkText: {
    ...theme.typography.body1,
    color: theme.colors.primary,
  } as TextStyle,
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    ...theme.typography.body2,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
});

export default SellerSignupScreen;