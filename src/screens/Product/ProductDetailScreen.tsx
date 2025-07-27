import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {useAuction, Auction, Bid} from '../../context/AuctionContext';
import {getCurrencySymbol} from '../../config/constants';
import LiveBadge from '../../components/LiveBadge';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

const {width} = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();
  const {getAuctionById} = useAuction();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {auctionId} = route.params as {auctionId: string};

  useEffect(() => {
    const loadAuction = async () => {
      try {
        setLoading(true);
        const auctionData = await getAuctionById(auctionId);

        if (!auctionData) {
          Alert.alert('Error', 'Auction not found');
          navigation.goBack();
          return;
        }

        setAuction(auctionData);
      } catch (error) {
        console.error('Error loading auction:', error);
        Alert.alert('Error', 'Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };

    loadAuction();
  }, [auctionId, getAuctionById, navigation]);

  const auctionStatus = auction?.status;
  const auctionStartTime = auction?.startTime;
  const auctionEndTime = auction?.endTime;

  useFocusEffect(
    useCallback(() => {
      const startTimer = () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        let targetTime: Date | null = null;
        let endedText = '';
        let runningTextPrefix = '';

        if (auctionStatus === 'live' && auctionEndTime) {
          targetTime = auctionEndTime.toDate();
          endedText = 'Auction ended';
          runningTextPrefix = 'Ends in: ';
        } else if (auctionStatus === 'upcoming' && auctionStartTime) {
          targetTime = auctionStartTime.toDate();
          endedText = 'Auction started';
          runningTextPrefix = 'Starts in: ';
        } else {
          setRemainingTime(auctionStatus === 'ended' ? 'Auction ended' : '');
          return;
        }

        const updateRemainingTime = () => {
          if (!targetTime) {
            setRemainingTime('Invalid time');
            return;
          }

          const now = new Date();
          const diffMs = targetTime.getTime() - now.getTime();

          if (diffMs <= 0) {
            setRemainingTime(endedText);
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return;
          }

          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHrs = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const diffMins = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60),
          );
          const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

          let timeString = '';
          if (diffDays > 0) {
            timeString += `${diffDays}d `;
          }
          timeString += `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;

          setRemainingTime(runningTextPrefix + timeString);
        };

        updateRemainingTime();
        timerIntervalRef.current = setInterval(updateRemainingTime, 1000);
      };

      startTimer();

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }, [auctionStatus, auctionStartTime, auctionEndTime]),
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveImageIndex(currentIndex);
  };

  const formatDate = (
    timestamp: FirebaseFirestoreTypes.Timestamp | number,
  ): string => {
    if (!timestamp) return '';

    let date: Date;
    if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp instanceof FirebaseFirestoreTypes.Timestamp) {
      date = timestamp.toDate();
    } else {
      // This case should ideally not be reached if types are correct
      date = new Date(timestamp as number); // Fallback, though timestamp should be Timestamp or number
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (!auction) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Auction data not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}>
      <View className="relative w-full" style={{height: width * 0.8}}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {auction.imageUrls.map((imageUrl: string, index: number) => (
            <Image
              key={index}
              source={{uri: imageUrl}}
              className="w-screen h-full"
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View className="absolute bottom-4 flex-row self-center">
          {auction.imageUrls.map((_: string, index: number) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeImageIndex ? 'bg-primary' : 'bg-white/50'
              }`}
            />
          ))}
        </View>

        {auction.status === 'live' && (
          <LiveBadge className="absolute top-4 left-4" />
        )}

        {auction.status === 'upcoming' && (
          <View className="absolute top-4 left-4 bg-yellow-500 p-2 rounded-md">
            <Text className="text-white text-xs font-bold">Upcoming</Text>
          </View>
        )}

        {auction.status === 'ended' && (
          <View className="absolute top-4 left-4 bg-red-700 p-2 rounded-md">
            <Text className="text-white text-xs font-bold">Ended</Text>
          </View>
        )}
      </View>

      <View className="p-4 mb-2 bg-card">
        <Text className="text-xl font-bold text-text mb-2">
          {auction.title}
        </Text>

        {(auctionStatus === 'live' || auctionStatus === 'upcoming') &&
        remainingTime ? (
          <Text
            className={`text-base font-semibold mb-3 text-center ${auctionStatus === 'live' ? 'text-primary' : 'text-yellow-500'}`}>
            {remainingTime}
          </Text>
        ) : null}

        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-xs mb-1 text-text o-70">Current Bid</Text>
            <Text className="text-2xl font-bold text-primary">
              {getCurrencySymbol(auction.currency)}
              {auction.currentPrice.toLocaleString()}
            </Text>
          </View>

          <View>
            <Text className="text-xs mb-1 text-text o-70">Starting Price</Text>
            <Text className="text-lg font-semibold text-text">
              {getCurrencySymbol(auction.currency)}
              {auction.startingPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap">
          {auction.tags.map((tag: string, index: number) => (
            <View
              key={index}
              className="px-3 py-1.5 rounded-full mr-2 mb-2 bg-background">
              <Text className="text-xs text-text o-70">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-4 mb-2 bg-card">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: auction.sellerAvatar || 'https://via.placeholder.com/50',
            }}
            className="w-12 h-12 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="font-semibold text-base text-text">
              {auction.sellerName}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FFBF00" />
              <Text className="ml-1 text-xs text-text o-70">
                4.8 (152 reviews)
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="px-3 py-2 rounded-lg border border-border"
            onPress={() =>
              Alert.alert('Seller', `View ${auction.sellerName}'s profile`)
            }>
            <Text className="font-semibold text-xs text-primary">
              View Seller
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-4 mb-2 bg-card">
        <Text className="text-lg font-semibold text-text mb-2">
          Description
        </Text>
        <Text className="text-sm leading-5 text-text o-70">
          {auction.description}
        </Text>
      </View>

      <View className="p-4 mb-2 bg-card">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs mb-1 text-text o-70">Start Time</Text>
            <Text className="text-sm font-medium text-text">
              {formatDate(auction.startTime)}
            </Text>
          </View>
          <View className="w-px h-10 bg-gray-300 mx-4" />
          <View className="flex-1">
            <Text className="text-xs mb-1 text-text o-70">End Time</Text>
            <Text className="text-sm font-medium text-text">
              {formatDate(auction.endTime)}
            </Text>
          </View>
        </View>
      </View>

      {auction.bids && auction.bids.length > 0 && (
        <View className="p-4 mb-2 bg-card">
          <Text className="text-lg font-semibold text-text mb-2">
            Bid History
          </Text>
          <FlatList
            data={auction.bids.slice(0, 5)}
            keyExtractor={(item: Bid) => item.id}
            scrollEnabled={false}
            renderItem={({item}: {item: Bid}) => (
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <View className="flex-1">
                  <Text className="font-medium text-sm text-text mb-1">
                    {item.userName}
                  </Text>
                  <Text className="text-xs text-text o-70">
                    {formatDate(item.timestamp)}
                  </Text>
                </View>
                <Text className="font-semibold text-base text-primary">
                  {getCurrencySymbol(auction.currency)}
                  {item.amount.toLocaleString()}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {auction.status === 'live' && (
        <TouchableOpacity
          className="flex-row items-center justify-center mx-4 py-3.5 rounded-lg mb-2 bg-primary"
          onPress={() =>
            navigation.navigate('LiveStreamViewer', {auctionId: auction.id})
          }>
          <Ionicons name="videocam" size={20} color="#fff" className="mr-2" />
          <Text className="text-white font-semibold text-base">
            Join Live Auction
          </Text>
        </TouchableOpacity>
      )}

      {auction.status === 'upcoming' && (
        <View className="flex-row px-4 mb-4">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg border border-primary mr-2"
            onPress={() => Alert.alert('Reminder', 'Auction reminder set')}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#FF385C"
              className="mr-2"
            />
            <Text className="font-semibold text-sm text-primary">
              Set Reminder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-lg bg-card ml-2"
            onPress={() => Alert.alert('Share', 'Share this auction')}>
            <Ionicons
              name="share-outline"
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="font-semibold text-sm text-text">Share</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
