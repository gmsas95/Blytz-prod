'use client';

import React from 'react';
import {View, Text} from 'react-native';

/**
 * LiveBadge Component
 *
 * A reusable badge component to indicate a live auction/stream status
 *
 * @param {Object} props - Component props
 * @param {Object} props.style - Additional style for the badge container
 */
interface LiveBadgeProps {
  className?: string;
}

export default function LiveBadge({className}: LiveBadgeProps) {
  return (
    <View
      className={`flex-row items-center bg-red-500 px-2 py-1 rounded-md ${className}`}>
      <View className="w-2 h-2 rounded-full bg-white mr-1" />
      <Text className="text-white text-xs font-bold">LIVE</Text>
    </View>
  );
}
