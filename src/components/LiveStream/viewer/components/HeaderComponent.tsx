import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../config/theme';

interface HeaderComponentProps {
  sellerId: string;
  avatar?: string;
  rating?: number;
  viewerCount?: string;
  onFollowPress?: () => void;
  onMenuPress?: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  sellerId,
  avatar = 'https://i.pravatar.cc/40',
  rating = 4.9,
  viewerCount = '2.3k',
  onFollowPress,
  onMenuPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.username}>{sellerId}</Text>
          <Text style={styles.rating}>⭐️ {rating}</Text>
        </View>
        <TouchableOpacity style={styles.followButton} onPress={onFollowPress}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.viewerCount}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.viewerCountText}>{viewerCount}</Text>
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

export default HeaderComponent;
