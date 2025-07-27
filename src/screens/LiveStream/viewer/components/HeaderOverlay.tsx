import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../config/theme';

interface SellerInfo {
  id: string;
  displayName?: string;
  photoURL?: string;
  rating?: number;
}

interface HeaderOverlayProps {
  sellerInfo: SellerInfo;
  viewerCount: number;
  isFollowing?: boolean;
  onFollowPress: () => void;
  onMenuPress: () => void;
}

const HeaderOverlay: React.FC<HeaderOverlayProps> = ({
  sellerInfo,
  viewerCount,
  isFollowing = false,
  onFollowPress,
  onMenuPress,
}) => {
  const formatViewerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={{
            uri: sellerInfo.photoURL || 'https://i.pravatar.cc/40',
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.username}>
            {sellerInfo.displayName || sellerInfo.id}
          </Text>
          {sellerInfo.rating && (
            <Text style={styles.rating}>⭐️ {sellerInfo.rating.toFixed(1)}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.followButton} onPress={onFollowPress}>
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.viewerCount}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.viewerCountText}>
            {formatViewerCount(viewerCount)}
          </Text>
        </View>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rating: {
    color: '#ccc',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  followButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  viewerCountText: {
    color: '#fff',
    marginLeft: 4,
  },
});

export default HeaderOverlay;
