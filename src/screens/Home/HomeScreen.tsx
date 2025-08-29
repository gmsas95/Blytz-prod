import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LiveStreamItem} from '../../components/Home';
import {streamsService} from '../../services/firebase/streams';
import {StreamDisplay, FeaturedStream} from '../../types/models/streamDisplay';

type AuthStackParamList = {
  LiveStreamViewer: {streamId: string};
};

type HomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;


const categories = [
  {id: 'all', name: 'All', icon: 'apps-outline'},
  {id: 'fashion', name: 'Fashion', icon: 'shirt-outline'},
  {id: 'electronics', name: 'Tech', icon: 'phone-portrait-outline'},
  {id: 'collectibles', name: 'Collectibles', icon: 'trophy-outline'},
  {id: 'art', name: 'Art', icon: 'color-palette-outline'},
  {id: 'sports', name: 'Sports', icon: 'basketball-outline'},
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<StreamDisplay[]>([]);
  const [featuredStreams, setFeaturedStreams] = useState<FeaturedStream[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<StreamDisplay[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [streams, featured] = await Promise.all([
        streamsService.getLiveStreams(),
        streamsService.getFeaturedStreams()
      ]);

      setLiveStreams(streams);
      setFeaturedStreams(featured);
      setFilteredStreams(streams);
    } catch (err) {
      setError('Failed to load streams. Please try again.');
      console.error('Error loading streams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeLive = streamsService.subscribeToLiveStreams((streams) => {
      setLiveStreams(streams);
    });

    const unsubscribeFeatured = streamsService.subscribeToFeaturedStreams((featured) => {
      setFeaturedStreams(featured);
    });

    return () => {
      unsubscribeLive();
      unsubscribeFeatured();
    };
  }, []); // Empty dependency array - only set up listeners once

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredStreams(liveStreams);
    } else {
      setFilteredStreams(
        liveStreams.filter(stream =>
          stream.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  }, [selectedCategory, liveStreams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      setError('Failed to refresh streams.');
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const renderFeaturedStream = ({
    item,
  }: {
    item: FeaturedStream;
  }) => (
    <TouchableOpacity
      style={styles.featuredStreamCard}
      onPress={() =>
        navigation.navigate('LiveStreamViewer', {streamId: item.streamId})
      }>
      <Image source={{uri: item.thumbnailUrl}} style={styles.featuredStreamImage} />
      <View style={styles.featuredStreamOverlay}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>{item.viewers.toLocaleString()}</Text>
      </View>
      <View style={styles.featuredStreamInfo}>
        <Text style={styles.featuredStreamTitle}>{item.title}</Text>
        <Text style={styles.featuredStreamSeller}>{item.sellerName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLiveStream = ({item}: {item: StreamDisplay}) => (
    <LiveStreamItem
      id={item.id}
      title={item.title}
      seller={item.sellerName}
      avatar={item.sellerAvatar}
      viewers={item.viewers}
      image={item.thumbnailUrl}
      category={item.category}
      isActive={true}
      currentBid={item.currentBid}
      productCount={item.productCount}
      onPress={() => navigation.navigate('LiveStreamViewer', {streamId: item.id})}
    />
  );

  const renderCategory = ({item}: {item: (typeof categories)[0]}) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item.id)}>
      <Ionicons
        name={item.icon as keyof typeof Ionicons.glyphMap}
        size={20}
        color={
          selectedCategory === item.id
            ? theme.colors.onPrimary
            : theme.colors.secondary
        }
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flash" size={28} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Blytz</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons
              name="search-outline"
              size={24}
              color={theme.colors.onBackground}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.onBackground}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Featured Streams */}
        {featuredStreams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Live Auctions</Text>
            <FlatList
              data={featuredStreams}
              renderItem={renderFeaturedStream}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Live Streams Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredStreams.length > 0 ? (
            <FlatList
              data={filteredStreams}
              renderItem={renderLiveStream}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.liveStreamGrid}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-off-outline" size={48} color={theme.colors.secondary} />
              <Text style={styles.emptyText}>No live streams in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + theme.spacing.xs, // 12px equivalent
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight as '500',
    color: theme.colors.onBackground,
    marginLeft: theme.spacing.sm,
    fontFamily: 'Inter',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight as '500',
    color: theme.colors.onBackground,
    fontFamily: 'Inter',
  },
  seeAllText: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    color: theme.colors.primary,
    fontFamily: 'Inter',
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredStreamCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  featuredStreamImage: {
    width: '100%',
    height: 160,
  },
  featuredStreamOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.onPrimary,
    marginRight: 4,
  },
  liveText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.onPrimary,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  viewerCount: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as '400',
    color: theme.colors.onPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'Inter',
  },
  featuredStreamInfo: {
    padding: 12,
  },
  featuredStreamTitle: {
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.subtitle1.fontWeight as '500',
    color: theme.colors.onSurface,
    fontFamily: 'Inter',
  },
  featuredStreamSeller: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight as '400',
    color: theme.colors.secondary,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    minHeight: 40,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight as '500',
    color: theme.colors.secondary,
    marginLeft: 6,
    fontFamily: 'Inter',
  },
  selectedCategoryText: {
    color: theme.colors.onPrimary,
  },
  liveStreamGrid: {
    paddingHorizontal: 16,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as '500',
    fontFamily: 'Inter',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.secondary,
    marginTop: 8,
    fontFamily: 'Inter',
  },
});
