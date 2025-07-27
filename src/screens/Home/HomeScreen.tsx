import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {theme} from '../../config/theme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LiveStreamItem} from '../../components/Home';

type AuthStackParamList = {
  LiveStreamViewer: {streamId: string};
};

type HomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Mock data for featured streams
const featuredStreams = [
  {
    id: '1',
    title: 'Vintage Designer Collection',
    seller: 'LuxuryFinds',
    viewers: 2847,
    image: 'https://via.placeholder.com/300x180?text=Featured+Stream+1',
    category: 'Fashion',
    isLive: true,
  },
  {
    id: '2',
    title: 'Rare Sneaker Drop',
    seller: 'SneakerKing',
    viewers: 5639,
    image: 'https://via.placeholder.com/300x180?text=Featured+Stream+2',
    category: 'Sneakers',
    isLive: true,
  },
  {
    id: '3',
    title: 'Comic Book Auction',
    seller: 'ComicCollector',
    viewers: 1234,
    image: 'https://via.placeholder.com/300x180?text=Featured+Stream+3',
    category: 'Collectibles',
    isLive: true,
  },
];

// Mock data for live streams
interface LiveStreamItem {
  id: string;
  seller: string;
  title: string;
  viewers: number;
  image: string;
  avatar: string;
  category: string;
  isLive: boolean;
  currentBid?: number;
  productCount: number;
}

const liveStreams: LiveStreamItem[] = [
  {
    id: '1',
    seller: 'VintageVibes',
    title: 'Authentic 70s Collection',
    viewers: 1847,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+1',
    avatar: 'https://via.placeholder.com/40?text=V',
    category: 'Vintage',
    isLive: true,
    currentBid: 45.0,
    productCount: 8,
  },
  {
    id: '2',
    seller: 'TechDeals',
    title: 'Gaming Gear Auction',
    viewers: 3264,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+2',
    avatar: 'https://via.placeholder.com/40?text=T',
    category: 'Electronics',
    isLive: true,
    currentBid: 127.5,
    productCount: 12,
  },
  {
    id: '3',
    seller: 'ArtisanCrafts',
    title: 'Handmade Jewelry Show',
    viewers: 892,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+3',
    avatar: 'https://via.placeholder.com/40?text=A',
    category: 'Jewelry',
    isLive: true,
    currentBid: 28.0,
    productCount: 15,
  },
  {
    id: '4',
    seller: 'BookwormFinds',
    title: 'Rare Book Collection',
    viewers: 567,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+4',
    avatar: 'https://via.placeholder.com/40?text=B',
    category: 'Books',
    isLive: true,
    currentBid: 89.99,
    productCount: 6,
  },
  {
    id: '5',
    seller: 'SportsMemorabilia',
    title: 'Signed Sports Cards',
    viewers: 2156,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+5',
    avatar: 'https://via.placeholder.com/40?text=S',
    category: 'Sports',
    isLive: true,
    currentBid: 199.0,
    productCount: 9,
  },
  {
    id: '6',
    seller: 'HomeDecorPro',
    title: 'Vintage Home Decor',
    viewers: 1423,
    image: 'https://via.placeholder.com/180x240?text=Live+Stream+6',
    avatar: 'https://via.placeholder.com/40?text=H',
    category: 'Home',
    isLive: true,
    currentBid: 67.5,
    productCount: 11,
  },
];

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
  const [filteredStreams, setFilteredStreams] = useState(liveStreams);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredStreams(liveStreams);
    } else {
      setFilteredStreams(
        liveStreams.filter(
          stream =>
            stream.category.toLowerCase() === selectedCategory.toLowerCase(),
        ),
      );
    }
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderFeaturedStream = ({
    item,
  }: {
    item: (typeof featuredStreams)[0];
  }) => (
    <TouchableOpacity
      style={styles.featuredStreamCard}
      onPress={() =>
        navigation.navigate('LiveStreamViewer', {streamId: item.id})
      }>
      <Image source={{uri: item.image}} style={styles.featuredStreamImage} />
      <View style={styles.featuredStreamOverlay}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>{item.viewers.toLocaleString()}</Text>
      </View>
      <View style={styles.featuredStreamInfo}>
        <Text style={styles.featuredStreamTitle}>{item.title}</Text>
        <Text style={styles.featuredStreamSeller}>{item.seller}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLiveStream = ({item}: {item: LiveStreamItem}) => (
    <LiveStreamItem
      {...item}
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
          <FlatList
            data={filteredStreams}
            renderItem={renderLiveStream}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.liveStreamGrid}
          />
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
});
