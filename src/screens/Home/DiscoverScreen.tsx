import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {Auction} from '../../context/AuctionContext';
import AuctionCard from '../../components/AuctionCard';

interface Category {
  id: string;
  name: string;
}

const numColumns = 2;
const columnWrapperPaddingHorizontal = 16;
const itemSpacing = 16;

const screenWidth = Dimensions.get('window').width;
const availableWidthForRowItems =
  screenWidth - columnWrapperPaddingHorizontal * 2;
const cardWidth = Math.floor(
  (availableWidthForRowItems - itemSpacing * (numColumns - 1)) / numColumns,
);
const cardHeight = cardWidth * (16 / 9);

export default function DiscoverScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Auction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryResults, setCategoryResults] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allAuctions: Auction[] = []; // Assuming allAuctions will be of type Auction[]
  const CATEGORIES: Category[] = [
    {id: 'collectibles', name: 'Collectibles'},
    {id: 'electronics', name: 'Electronics'},
    {id: 'fashion', name: 'Fashion'},
  ];

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length > 2) {
      setSearching(true);
      setIsLoading(true);

      try {
        // Mock search results
        setSearchResults([]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearching(false);
      setSearchResults([]);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    if (selectedCategory === category.id) {
      setSelectedCategory(null);
      setCategoryResults([]);
      return;
    }

    setSelectedCategory(category.id);
    setIsLoading(true);

    try {
      // Mock category results
      setCategoryResults([]);
    } catch (error) {
      console.error('Category fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuctionPress = (auction: Auction) => {
    navigation.navigate('AuctionDetail', {auctionId: auction.id});
  };

  const displayedAuctions: Auction[] = searching
    ? searchResults
    : selectedCategory
      ? categoryResults
      : allAuctions;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center p-3 mx-8 my-2 rounded-lg bg-card border border-border">
        <Ionicons name="search" size={20} color="white" className="mr-2" />
        <TextInput
          className="flex-1 text-base text-text p-0"
          placeholder="Search auctions..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          accessibilityLabel="Search auctions input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch('')}
            accessibilityLabel="Clear search input">
            <Ionicons name="close-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View className="px-4 mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item: Category) => item.id}
          renderItem={({item}: {item: Category}) => (
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory === item.id ? 'bg-primary border-primary' : 'border-border'}`}
              onPress={() => handleCategorySelect(item)}
              accessibilityLabel={`Filter by category ${item.name}`}
              accessibilityState={{selected: selectedCategory === item.id}}>
              <Text
                className={`text-sm font-medium ${selectedCategory === item.id ? 'text-white' : 'text-text'}`}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View className="flex-row justify-between items-center mb-4 px-4">
        <Text className="text-lg font-bold text-text">
          {searching
            ? `Search results for "${searchQuery}"`
            : selectedCategory
              ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Auctions`
              : 'All Auctions'}
        </Text>
        <Text className="text-sm text-text o-70">
          {displayedAuctions.length} item
          {displayedAuctions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : (
        <FlatList
          data={displayedAuctions}
          keyExtractor={(item: Auction) => item.id}
          renderItem={({item}: {item: Auction}) => (
            <AuctionCard
              auction={item}
              onPress={() => handleAuctionPress(item)}
              style={{
                width: cardWidth,
                height: cardHeight,
                margin: itemSpacing / 2,
              }}
            />
          )}
          numColumns={numColumns}
          contentContainerStyle={
            displayedAuctions.length === 0
              ? {flexGrow: 1, justifyContent: 'center', alignItems: 'center'}
              : {paddingBottom: 16}
          }
          ListEmptyComponent={
            <View className="items-center justify-center p-8">
              <Ionicons name="search-outline" size={48} color="#999" />
              <Text className="mt-4 text-base text-center text-text">
                {searching
                  ? 'No results found. Try different keywords.'
                  : selectedCategory
                    ? 'No auctions in this category yet.'
                    : 'No auctions available at the moment.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
