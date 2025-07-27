import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {theme} from '../../config/theme';

interface SellerInfoProps {
  avatar: string;
  title: string;
  seller: string;
}

export default function SellerInfo({avatar, title, seller}: SellerInfoProps) {
  return (
    <View style={styles.sellerInfo}>
      <Image source={{uri: avatar}} style={styles.sellerAvatar} />
      <View style={styles.sellerDetails}>
        <Text style={styles.streamTitle}>{title}</Text>
        <Text style={styles.sellerName}>{seller}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  sellerDetails: {
    flex: 1,
  },
  streamTitle: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    color: theme.colors.onBackground,
    fontFamily: 'Inter',
  },
  sellerName: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.secondary,
    marginTop: 2, // Keep as 2px since it's very small spacing
    fontFamily: 'Inter',
  },
});
