import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ProfileHeader from '../../components/UserProfile/ProfileHeader';
import {theme} from '../../config/theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ProfileHeader title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{padding: 16}}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile' as never)}>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ChangePassword' as never)}>
              <Text style={styles.menuItemText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.section}>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.onPrimary}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 8,
    marginTop: 16,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
});
