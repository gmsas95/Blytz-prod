import React, { useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { theme } from '../../../config/theme';
import BiddingComponent from './BiddingComponent';
import ScreenWrapper from '../../shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from '@react-native-firebase/firestore';
import { LiveStream } from '../../../types/models';

const { height } = Dimensions.get('window');

const LiveStreamItem = ({ item, isActive }: { item: LiveStream; isActive: boolean }) => {
  const videoRef = useRef<Video>(null);

  const handlePlaceBid = (amount: number) => {
    console.log(`Placing bid for: $${amount} on stream ${item.id}`);
    // Alert is commented out to improve UX during scrolling
    // Alert.alert('Bid Placed!', `You have successfully bid $${amount}.`);
  };

  const handleSetBidLimit = () => {
    console.log('Setting bid limit');
    // Alert.alert('Set Bid Limit', 'This will open a modal to set your max bid.');
  };

  return (
    <View style={styles.container}>
      {item.playbackUrl && (
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: item.playbackUrl }}
          resizeMode={ResizeMode.COVER}
          onError={(e) => console.error('Video Error:', e)}
          isLooping
          shouldPlay={isActive}
        />
      )}
      <ScreenWrapper style={styles.overlayContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: 'https://i.pravatar.cc/40' }} style={styles.avatar} />
            <View>
              <Text style={styles.username}>{item.sellerId}</Text>
              <Text style={styles.rating}>⭐️ 4.9</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.viewerCount}>
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.viewerCountText}>2.3k</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Side Toolbar */}
        <View style={styles.sideToolbar}>
          <TouchableOpacity style={styles.sideToolbarButton}>
            <Ionicons name="card-outline" size={30} color="#fff" />
            <Text style={styles.sideToolbarText}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideToolbarButton}>
            <Ionicons name="share-outline" size={30} color="#fff" />
            <Text style={styles.sideToolbarText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideToolbarButton}>
            <Ionicons name="storefront-outline" size={30} color="#fff" />
            <Text style={styles.sideToolbarText}>Store</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.chatContainer}>
            {/* Chat messages would go here */}
            <Text style={styles.chatMessage}><Text style={{fontWeight: 'bold'}}>Hotspurs:</Text> love this!</Text>
            <Text style={styles.chatMessage}><Text style={{fontWeight: 'bold'}}>Moneymain:</Text> gotta get this!!</Text>
          </View>
          <View style={styles.productInfoContainer}>
            <View>
              <Text style={styles.productName}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeMore}>See more ⌄</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$104</Text>
              <Text style={styles.timer}>02:00</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Say Something..."
              placeholderTextColor="#999"
            />
            <BiddingComponent
              latestBid={{ id: '1', auctionId: '1', userId: '1', amount: 104, timestamp: Timestamp.now() }}
              onPlaceBid={handlePlaceBid}
              onSetBidLimit={handleSetBidLimit}
            />
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
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
  sideToolbar: {
    position: 'absolute',
    right: 16,
    top: '40%',
    alignItems: 'center',
  },
  sideToolbarButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sideToolbarText: {
    color: '#fff',
    marginTop: 4,
  },
  footer: {
    justifyContent: 'flex-end',
  },
  chatContainer: {
    marginBottom: 16,
  },
  chatMessage: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMore: {
    color: '#ccc',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timer: {
    color: '#ccc',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 8,
  },
});

export default LiveStreamItem;