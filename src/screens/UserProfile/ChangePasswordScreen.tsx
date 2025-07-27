import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {theme} from '../../config/theme';
import ProfileHeader from '../../components/UserProfile/ProfileHeader';
import { EmailAuthProvider } from '@react-native-firebase/auth';

interface FirebaseError extends Error {
  code?: string;
}

export default function ChangePasswordScreen() {
  const {user, reauthenticate, updatePassword} = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        await reauthenticate(credential);
        await updatePassword(newPassword);

        Alert.alert('Success', 'Your password has been changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } catch (error) {
        const firebaseError = error as FirebaseError;
        let errorMessage = 'Failed to change password. Please try again.';
        // Corrected: Check for the actual error code returned by re-authentication
        if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'The current password you entered is incorrect.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many attempts. Please try again later.';
        } else if (firebaseError.code === 'auth/requires-recent-login') {
          errorMessage = 'Please sign in again to change your password.';
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader title="Change Password" />
      <View style={styles.content}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your current password"
          placeholderTextColor={theme.colors.secondary}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your new password"
          placeholderTextColor={theme.colors.secondary}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your new password"
          placeholderTextColor={theme.colors.secondary}
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});
