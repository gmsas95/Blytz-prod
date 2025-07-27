import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import ProfileHeader from '../../components/UserProfile/ProfileHeader';
import {theme} from '../../config/theme';

interface BidItem {
  id: string;
  item: string;
  amount: string;
  status: string;
  image: string;
}

const mockBids: BidItem[] = [
  {
    id: '1',
    item: 'Vintage Camera',
    amount: '55.00',
    status: 'Outbid',
    image: 'https://via.placeholder.com/150?text=Bid+1',
  },
  {
    id: '2',
    item: 'Limited Edition Print',
    amount: '250.00',
    status: 'Winning',
    image: 'https://via.placeholder.com/150?text=Bid+2',
  },
  {
    id: '3',
    item: 'Antique Vase',
    amount: '120.00',
    status: 'Outbid',
    image: 'https://via.placeholder.com/150?text=Bid+3',
  },
];

export const MyBidsScreen = () => {
  const renderBidItem = ({item}: {item: BidItem}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <View style={{flex: 1}}>
        <Text style={styles.itemTitle}>{item.item}</Text>
        <Text style={styles.itemSubtitle}>${item.amount}</Text>
      </View>
      <Text
        style={{
          ...styles.itemSubtitle,
          color:
            item.status === 'Winning'
              ? theme.colors.primary
              : theme.colors.error,
        }}>
        {item.status}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ProfileHeader title="My Bids" />
      <FlatList
        data={mockBids}
        renderItem={renderBidItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: theme.colors.onSurface,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
});
