import {useTranslation} from 'react-i18next';
import {useState} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';

export default function SignupScreen() {
  const {t} = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const {registerWithEmail} = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(
        t('signup.signupErrorTitle'),
        t('signup.error.missingFields'),
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        t('signup.signupErrorTitle'),
        t('signup.error.passwordsDoNotMatch'),
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('signup.signupErrorTitle'), t('signup.error.weakPassword'));
      return;
    }

    try {
      setIsSubmitting(true);
      await registerWithEmail(email, password, name);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t('signup.error.generic');
      Alert.alert(t('signup.signupFailedTitle'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your journey with Blytz</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.secondary}
                value={name}
                onChangeText={setName}
              />
            </View>
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={theme.colors.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.inputContainerLast}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.secondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.signUpButtonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32, // space-4
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight as '600',
    color: theme.colors.onBackground,
    letterSpacing: theme.typography.h4.letterSpacing,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight as '400',
    color: theme.colors.secondary,
    marginTop: 8, // space-1
    letterSpacing: theme.typography.body1.letterSpacing,
    fontFamily: 'Inter',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16, // space-2
  },
  inputContainerLast: {
    width: '100%',
    marginBottom: 24, // space-3
  },
  inputLabel: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
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
  signUpButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 56, // Larger than minimum touch target for better UX
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // space-2
  },
  signUpButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as '600',
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32, // space-4
  },
  loginText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontFamily: 'Inter',
  },
  loginLink: {
    color: theme.colors.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    fontFamily: 'Inter',
  },
});
