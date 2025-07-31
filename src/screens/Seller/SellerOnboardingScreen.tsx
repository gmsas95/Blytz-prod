import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../config/theme';

interface SellerApplication {
  businessName: string;
  businessType: 'individual' | 'company';
  email: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
}

const BANK_OPTIONS = [
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'UOB Bank',
  'OCBC Bank',
];

export default function SellerOnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<SellerApplication>({
    businessName: '',
    businessType: 'individual',
    email: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
  });
  const [errors, setErrors] = useState<Partial<SellerApplication>>({});
  const navigation = useNavigation();
  const { applyForSeller } = useAuth();

  const validateForm = () => {
    const newErrors: Partial<SellerApplication> = {};
    
    if (!application.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!application.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!application.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?60\d{9,10}$|^\d{9,11}$/.test(application.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Malaysian phone number';
    }
    
    if (!application.bankName) {
      newErrors.bankName = 'Please select a bank';
    }
    
    if (!application.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10,16}$/.test(application.accountNumber)) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await applyForSeller(application);
      Alert.alert(
        'Success!', 
        result.message || 'Your seller application has been submitted. We\'ll review it within 24-48 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <View style={styles.slideContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="store" size={80} color={theme.colors.primary} />
            </View>
            <Text style={styles.slideTitle}>Become a Seller</Text>
            <Text style={styles.slideSubtitle}>
              Join thousands of successful sellers and start earning from your products today
            </Text>
            <View style={styles.benefitsList}>
              {[
                { icon: 'money-bill-wave', text: 'Keep 92% of your sales' },
                { icon: 'users', text: 'Reach millions of buyers' },
                { icon: 'shield-alt', text: 'Secure payments & protection' },
                { icon: 'rocket', text: 'Get approved in 24-48 hours' },
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <FontAwesome5 name={benefit.icon} size={20} color={theme.colors.primary} />
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 1:
        return (
          <View style={styles.slideContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="clipboard-check" size={80} color={theme.colors.primary} />
            </View>
            <Text style={styles.slideTitle}>What You'll Need</Text>
            <Text style={styles.slideSubtitle}>Get ready with these simple requirements
            </Text>
            <View style={styles.requirementsList}>
              {[
                { title: 'Business Details', desc: 'Your business name and type', icon: 'building' },
                { title: 'Contact Info', desc: 'Email and phone number', icon: 'envelope' },
                { title: 'Bank Account', desc: 'For receiving payments', icon: 'credit-card' },
                { title: 'SSM Registration', desc: 'Optional for faster approval', icon: 'id-card' },
              ].map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.reqIcon}>
                    <FontAwesome5 name={req.icon} size={24} color="white" />
                  </View>
                  <View style={styles.reqContent}>
                    <Text style={styles.reqTitle}>{req.title}</Text>
                    <Text style={styles.reqDesc}>{req.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="user-edit" size={60} color={theme.colors.primary} />
            </View>
            <Text style={styles.slideTitle}>Complete Your Profile</Text>
            <Text style={styles.slideSubtitle}>Fill in your details to get started
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business-outline" size={20} color={theme.colors.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your business name"
                    placeholderTextColor={theme.colors.secondary}
                    value={application.businessName}
                    onChangeText={(text) => {
                      setApplication({ ...application, businessName: text });
                      setErrors({ ...errors, businessName: undefined });
                    }}
                  />
                </View>
                {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Type *</Text>
                <View style={styles.typeSelector}>
                  {['individual', 'company'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        application.businessType === type && styles.typeButtonActive
                      ]}
                      onPress={() => setApplication({ ...application, businessType: type as any })}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        application.businessType === type && styles.typeButtonTextActive
                      ]}>
                        {type === 'individual' ? 'Individual' : 'Company'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.secondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={application.email}
                    onChangeText={(text) => {
                      setApplication({ ...application, email: text });
                      setErrors({ ...errors, email: undefined });
                    }}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="+60 12-345 6789"
                    placeholderTextColor={theme.colors.secondary}
                    keyboardType="phone-pad"
                    value={application.phoneNumber}
                    onChangeText={(text) => {
                      setApplication({ ...application, phoneNumber: text });
                      setErrors({ ...errors, phoneNumber: undefined });
                    }}
                  />
                </View>
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank *</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, errors.bankName && styles.inputError]}
                  onPress={() => {
                    Alert.alert(
                      "Select Bank",
                      "",
                      [...BANK_OPTIONS, 'Cancel'].map(bank => ({
                        text: bank,
                        onPress: () => {
                          if (bank !== 'Cancel') {
                            setApplication({ ...application, bankName: bank });
                            setErrors({ ...errors, bankName: undefined });
                          }
                        }
                      }))
                    );
                  }}
                >
                  <Ionicons name="card-outline" size={20} color={theme.colors.secondary} />
                  <Text style={[
                    styles.input,
                    !application.bankName && { color: theme.colors.secondary }
                  ]}>
                    {application.bankName || "Select your bank"}
                  </Text>
                </TouchableOpacity>
                {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={theme.colors.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="1234567890"
                    placeholderTextColor={theme.colors.secondary}
                    keyboardType="number-pad"
                    value={application.accountNumber}
                    onChangeText={(text) => {
                      setApplication({ ...application, accountNumber: text });
                      setErrors({ ...errors, accountNumber: undefined });
                    }}
                  />
                </View>
                {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Seller Onboarding</Text>
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentSlide === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>

          {renderSlide()}

          <View style={styles.navigationContainer}>
            <View style={styles.buttonsContainer}>
              {currentSlide > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setCurrentSlide(currentSlide - 1)}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentSlide < 2 ? (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => setCurrentSlide(currentSlide + 1)}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, loading && styles.loadingButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flexContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 18,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  benefitText: {
    fontSize: 16,
    color: theme.colors.onBackground,
    marginLeft: 16,
  },
  requirementsList: {
    width: '100%',
    marginBottom: 32,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reqContent: {
    flex: 1,
  },
  reqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginBottom: 4,
  },
  reqDesc: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  form: {
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    height: 48,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  inputError: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flex: 1,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    marginRight: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: theme.colors.onBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingButton: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: 4,
  },
});