import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../config/theme';

export default function LiveBadge() {
  return (
    <View style={styles.liveIndicator}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.onPrimary,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.onPrimary,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
});
