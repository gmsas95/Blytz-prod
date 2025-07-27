import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({provider, onPress}) => {
  const isGoogle = provider === 'google';
  const iconName = isGoogle ? 'logo-google' : 'logo-apple';
  const buttonText = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      accessible={true}
      accessibilityLabel={buttonText}
      accessibilityRole="button">
      <View style={styles.content}>
        <Ionicons
          name={iconName}
          size={20}
          color={theme.colors.onSurface}
          style={styles.icon}
        />
        <Text style={styles.text}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    height: 56, // Larger than minimum touch target for better UX
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // space-2
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    fontFamily: 'Inter',
  },
});

export default SocialButton;
