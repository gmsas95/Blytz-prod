import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase/firebase';

interface BidSliderProps {
  auctionId: string;
  currentPrice: number;
  onBidPlaced?: () => void;
}

export const BidSlider: React.FC<BidSliderProps> = ({ auctionId, currentPrice, onBidPlaced }) => {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState(currentPrice + 0.01);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    setBidAmount(currentPrice + 0.01);
  }, [currentPrice]);

  const placeBid = async (amount: number) => {
    if (!user?.uid) {
      alert('Please log in to place bids');
      return;
    }

    setIsPlacingBid(true);
    try {
      const placeBidFunction = httpsCallable(functions, 'placeBid');
      const result = await placeBidFunction({
        auctionId,
        amount: Math.round(amount * 100) / 100,
      });
      
      if (result.data.success) {
        onBidPlaced?.();
        alert('Bid placed successfully!');
      } else {
        alert(result.data.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Bid error:', error);
      alert('Failed to place bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleQuickBid = async (increment: number) => {
    const newAmount = currentPrice + increment;
    await placeBid(newAmount);
  };

  const handleCustomBid = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= currentPrice) {
      alert('Please enter a valid amount higher than current price');
      return;
    }
    await placeBid(amount);
    setCustomAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Your Bid</Text>
      <Text style={styles.currentPrice}>Current: ${currentPrice.toFixed(2)}</Text>
      
      <View style={styles.quickBids}>
        <TouchableOpacity 
          style={[styles.quickBidButton, isPlacingBid && styles.disabled]} 
          onPress={() => handleQuickBid(0.50)}
          disabled={isPlacingBid}
        >
          <Text style={styles.quickBidText}>+ $0.50</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickBidButton, isPlacingBid && styles.disabled]} 
          onPress={() => handleQuickBid(1.00)}
          disabled={isPlacingBid}
        >
          <Text style={styles.quickBidText}>+ $1.00</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickBidButton, isPlacingBid && styles.disabled]} 
          onPress={() => handleQuickBid(5.00)}
          disabled={isPlacingBid}
        >
          <Text style={styles.quickBidText}>+ $5.00</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customBid}>
        <TextInput
          style={styles.input}
          placeholder="Enter custom amount"
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="decimal-pad"
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={[styles.customBidButton, isPlacingBid && styles.disabled]} 
          onPress={handleCustomBid}
          disabled={isPlacingBid || !customAmount}
        >
          <Text style={styles.buttonText}>{isPlacingBid ? 'Placing...' : 'Place Bid'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.nextBid}>Next minimum: ${(currentPrice + 0.01).toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  currentPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  quickBids: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickBidButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
  },
  quickBidText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customBid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  customBidButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextBid: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BidSlider;