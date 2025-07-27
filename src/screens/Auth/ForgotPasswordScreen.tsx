import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';
import {useAuth} from '../../context/AuthContext'; // Import useAuth

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

interface FirebaseError extends Error {
  code?: string;
}

function ForgotPasswordScreen({navigation}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const {sendPasswordResetEmail, loading} = useAuth(); // Use loading state from context

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(email);
      Alert.alert(
        'Password Reset',
        `A password reset link has been sent to ${email}. Please check your inbox.`,
      );
      navigation.navigate('Login');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onBackground}
          />
        </TouchableOpacity>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.resetButtonText}>SEND RESET LINK</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40, // space-5
    paddingHorizontal: 16, // space-2
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    minHeight: 44, // minimum touch target
    minWidth: 44, // minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48, // space-6
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '600',
    color: theme.colors.onBackground,
    letterSpacing: theme.typography.h4.letterSpacing,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '400',
    color: theme.colors.secondary,
    marginTop: 8, // space-1
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: theme.typography.body1.letterSpacing,
    fontFamily: 'Inter',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16, // space-2
  },
  inputLabel: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: '500',
    color: theme.colors.secondary,
    marginBottom: 8, // space-1
    letterSpacing: theme.typography.subtitle2.letterSpacing,
    fontFamily: 'Inter',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16, // space-2
    minHeight: 44, // minimum touch target
  },
  input: {
    flex: 1,
    marginLeft: 12,
    height: 44, // minimum touch target
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.onSurface,
    fontFamily: 'Inter',
  },
  resetButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 56, // Larger than minimum touch target for better UX
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24, // space-3
  },
  resetButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: '600',
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
});

export default ForgotPasswordScreen;