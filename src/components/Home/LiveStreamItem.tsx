import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { theme } from '../../config/theme';
import LiveBadge from './LiveBadge';
import ViewerCount from './ViewerCount';
import BidPrice from './BidPrice';
import SellerInfo from './SellerInfo';
import ViewerStats from './ViewerStats';

const { width } = Dimensions.get('window');

interface LiveStreamItemProps {
  id: string;
  seller: string;
  title: string;
  viewers: number;
  image: string;
  avatar: string;
  category: string;
  isActive?: boolean;
  currentBid?: number;
  productCount: number;
  onPress: () => void;
}

export default function LiveStreamItem({
  seller,
  title,
  viewers,
  image,
  avatar,
  isActive = false,
  currentBid,
  productCount,
  onPress,
}: LiveStreamItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: image }}
          style={styles.video}
          shouldPlay={isActive}
          resizeMode={ResizeMode.COVER}
          isLooping
        />
        <View style={styles.overlayContainer}>
          <LiveBadge />
          <ViewerCount viewers={viewers} />
          <BidPrice currentBid={currentBid} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <SellerInfo avatar={avatar} title={title} seller={seller} />
        <ViewerStats viewers={viewers} productCount={productCount} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2,
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 200,
  },
  overlayContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  infoContainer: {
    paddingTop: theme.spacing.sm + theme.spacing.xs, // 12px equivalent
  },
});
