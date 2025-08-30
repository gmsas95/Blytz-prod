import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '../../../config/theme';
import { Bid } from '../../../types/models';
import { calculateNextBidAmount } from '../../../utils/bidding';

interface BiddingComponentProps {
  latestBid: Bid | null;
  onPlaceBid: (newAmount: number) => void;
  onSetBidLimit: () => void;
}

const BiddingComponent: React.FC<BiddingComponentProps> = ({
  latestBid,
  onPlaceBid,
  onSetBidLimit,
}) => {
  const currentBid = latestBid?.amount ?? 0;
  const nextBidAmount = calculateNextBidAmount(currentBid, 5);

  const handlePlaceBid = () => {
    onPlaceBid(nextBidAmount);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.customButton} onPress={onSetBidLimit}>
        <Text style={styles.customButtonText}>Custom</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
        <Text style={styles.bidButtonText}>Bid ${nextBidAmount.toFixed(0)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  customButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bidButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexGrow: 1,
  },
  bidButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BiddingComponent;