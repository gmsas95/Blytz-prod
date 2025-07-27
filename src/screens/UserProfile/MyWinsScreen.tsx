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

interface WinItem {
  id: string;
  item: string;
  price: string;
  date: string;
  image: string;
}

const mockWins: WinItem[] = [
  {
    id: '1',
    item: 'Signed Baseball',
    price: '350.00',
    date: '2023-10-25',
    image: 'https://via.placeholder.com/150?text=Win+1',
  },
  {
    id: '2',
    item: 'First Edition Book',
    price: '500.00',
    date: '2023-10-23',
    image: 'https://via.placeholder.com/150?text=Win+2',
  },
  {
    id: '3',
    item: 'Vintage Watch',
    price: '850.00',
    date: '2023-10-21',
    image: 'https://via.placeholder.com/150?text=Win+3',
  },
];

export const MyWinsScreen = () => {
  const renderWinItem = ({item}: {item: WinItem}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <View style={{flex: 1}}>
        <Text style={styles.itemTitle}>{item.item}</Text>
        <Text style={styles.itemSubtitle}>Won for ${item.price}</Text>
      </View>
      <Text style={styles.itemSubtitle}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ProfileHeader title="My Wins" />
      <FlatList
        data={mockWins}
        renderItem={renderWinItem}
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
