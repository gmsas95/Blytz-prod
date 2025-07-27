import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {theme} from '../../config/theme';

interface ViewerCountProps {
  viewers: number;
}

export default function ViewerCount({viewers}: ViewerCountProps) {
  return (
    <Text style={styles.viewerCount}>
      {viewers.toLocaleString()}
    </Text>
  );
}

const styles = StyleSheet.create({
  viewerCount: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.onPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    fontFamily: 'Inter',
  },
});
