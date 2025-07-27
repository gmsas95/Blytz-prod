import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../config/theme';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...theme.layout.screenPadding,
    backgroundColor: theme.colors.background,
  },
});

export default ScreenWrapper;
