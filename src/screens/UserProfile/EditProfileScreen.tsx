import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import ProfileHeader from '../../components/UserProfile/ProfileHeader';
import {theme} from '../../config/theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const {user, updateProfile} = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(''); // Add a state for the bio
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({displayName: name});
      // TODO: Save the bio to your database
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ProfileHeader title="Edit Profile" />
      <View style={{padding: 16}}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.secondary}
        />
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={{...styles.input, height: 100}}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={theme.colors.secondary}
          multiline
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={{color: theme.colors.onPrimary, fontWeight: 'bold'}}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
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
    alignItems: 'center' as const,
  },
});
