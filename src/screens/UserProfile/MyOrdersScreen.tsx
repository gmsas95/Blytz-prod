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

interface OrderItem {
  id: string;
  item: string;
  price: string;
  date: string;
  image: string;
}

const mockOrders: OrderItem[] = [
  {
    id: '1',
    item: 'Vintage T-Shirt',
    price: '25.00',
    date: '2023-10-26',
    image: 'https://via.placeholder.com/150?text=Order+1',
  },
  {
    id: '2',
    item: 'Rare Comic Book',
    price: '150.00',
    date: '2023-10-24',
    image: 'https://via.placeholder.com/150?text=Order+2',
  },
  {
    id: '3',
    item: 'Signed Poster',
    price: '75.00',
    date: '2023-10-22',
    image: 'https://via.placeholder.com/150?text=Order+3',
  },
];

export default function MyOrdersScreen() {
  const renderOrderItem = ({item}: {item: OrderItem}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <View style={{flex: 1}}>
        <Text style={styles.itemTitle}>{item.item}</Text>
        <Text style={styles.itemSubtitle}>${item.price}</Text>
      </View>
      <Text style={styles.itemSubtitle}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ProfileHeader title="My Orders" />
      <FlatList
        data={mockOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16}}
      />
    </SafeAreaView>
  );
}

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
