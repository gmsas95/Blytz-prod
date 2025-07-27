'use client';
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {getCurrencySymbol} from '../config/constants';
import LiveBadge from './LiveBadge';

interface Auction {
  id: string;
  title: string;
  thumbnailUrl: string;
  status: 'upcoming' | 'live' | 'ended';
  currentPrice: number;
  currency: string;
  sellerName: string;
  startTime?: FirebaseFirestoreTypes.Timestamp;
}

interface AuctionCardProps {
  auction: Auction;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function AuctionCard({
  auction,
  onPress,
  style,
}: AuctionCardProps) {
  const getRelativeTime = (
    timestamp: FirebaseFirestoreTypes.Timestamp | undefined,
  ): string => {
    if (!timestamp) return '';

    const now = new Date();
    const auctionDate = timestamp.toDate();
    const diffTime = auctionDate.getTime() - now.getTime();

    if (diffTime < 0) {
      return auctionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes <= 0) return 'Starts now';
        return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'tomorrow';
    } else if (diffDays < 7) {
      return `in ${diffDays} days`;
    } else {
      return auctionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <TouchableOpacity
      className="rounded-lg overflow-hidden mb-4 shadow-md bg-card"
      style={style}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`View details for auction ${auction.title}`}>
      <View className="relative w-full h-36">
        <Image
          source={{
            uri: auction.thumbnailUrl || 'https://via.placeholder.com/150',
          }}
          className="w-full h-full"
          resizeMode="cover"
          accessibilityLabel={`Image for ${auction.title}`}
        />

        {auction.status === 'live' && (
          <LiveBadge className="absolute top-2 left-2" />
        )}

        {auction.status === 'upcoming' && auction.startTime && (
          <View className="absolute bottom-2 left-2 px-2 py-1 rounded-sm bg-card o-90">
            <Text className="text-xs font-semibold text-text o-70">
              Starts {getRelativeTime(auction.startTime)}
            </Text>
          </View>
        )}

        {auction.status === 'ended' && (
          <View className="absolute inset-0 justify-center items-center bg-black/60">
            <Text className="text-sm font-semibold text-white">
              Auction ended
            </Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          className="text-sm font-semibold mb-2 leading-5 min-h-10 text-text"
          numberOfLines={2}>
          {auction.title}
        </Text>

        <View className="flex-col">
          <Text className="text-base font-bold mb-1 text-primary">
            {getCurrencySymbol(auction.currency)}
            {auction.currentPrice.toLocaleString()}
          </Text>

          <Text className="text-xs text-text o-70" numberOfLines={1}>
            by {auction.sellerName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
