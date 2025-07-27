import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../config/theme';

interface BidPriceProps {
  currentBid?: number;
}

export default function BidPrice({currentBid}: BidPriceProps) {
  if (!currentBid) {
    return null;
  }

  return (
    <View style={styles.currentBidOverlay}>
      <Text style={styles.currentBidText}>
        ${currentBid.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  currentBidOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  currentBidText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    fontFamily: 'Inter',
  },
});
