import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';

import icon from '../../../assets/icon.png';

export default function LoginScreen() {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const {loginWithEmail} = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        t('login.loginErrorTitle'),
        t('login.error.missingEmailOrPassword'),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithEmail(email, password);
    } catch (error: unknown) {
      let errorMessage = t('login.error.generic');
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as {code: string; message: string};
        switch (firebaseError.code) {
          case 'auth/invalid-credential':
            errorMessage = t('login.error.invalidCredential');
            break;
          case 'auth/user-not-found':
            errorMessage = t('login.error.userNotFound');
            break;
          case 'auth/wrong-password':
            errorMessage = t('login.error.wrongPassword');
            break;
          case 'auth/invalid-email':
            errorMessage = t('login.error.invalidEmail');
            break;
          case 'auth/too-many-requests':
            errorMessage = t('login.error.tooManyRequests');
            break;
          default:
            errorMessage = firebaseError.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert(t('login.loginFailedTitle'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={icon as ImageSourcePropType} // Using a local asset
              style={styles.logo}
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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

          <View style={styles.inputContainerWithForgot}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword' as never)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup' as never)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles: {
  flexContainer: ViewStyle;
  container: ViewStyle;
  contentContainer: ViewStyle;
  headerContainer: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  inputContainer: ViewStyle;
  inputContainerWithForgot: ViewStyle;
  inputLabel: TextStyle;
  inputWrapper: ViewStyle;
  input: TextStyle;
  forgotPasswordButton: ViewStyle;
  forgotPasswordText: TextStyle;
  signInButton: ViewStyle;
  signInButtonText: TextStyle;
  signupContainer: ViewStyle;
  signupText: TextStyle;
  signupLink: TextStyle;
} = StyleSheet.create({
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
    marginBottom: 48, // space-6
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16, // space-2
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
  inputContainerWithForgot: {
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8, // space-1
    minHeight: 44, // minimum touch target
    justifyContent: 'center',
  },
  forgotPasswordText: {
    fontSize: theme.typography.subtitle2.fontSize,
    color: theme.colors.primary,
    fontFamily: 'Inter',
  },
  signInButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 56, // Larger than minimum touch target for better UX
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // space-2
  },
  signInButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as '600',
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32, // space-4
  },
  signupText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontFamily: 'Inter',
  },
  signupLink: {
    color: theme.colors.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    fontFamily: 'Inter',
  },
});
