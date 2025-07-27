import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';

interface ViewerStatsProps {
  viewers: number;
  productCount: number;
}

export default function ViewerStats({viewers, productCount}: ViewerStatsProps) {
  return (
    <View style={styles.streamStats}>
      <View style={styles.statItem}>
        <Ionicons
          name="eye-outline"
          size={12}
          color={theme.colors.secondary}
        />
        <Text style={styles.statText}>{viewers.toLocaleString()}</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons
          name="bag-outline"
          size={12}
          color={theme.colors.secondary}
        />
        <Text style={styles.statText}>{productCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  streamStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm + theme.spacing.xs, // 12px equivalent
  },
  statText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.secondary,
    marginLeft: theme.spacing.xs,
    fontFamily: 'Inter',
  },
});
