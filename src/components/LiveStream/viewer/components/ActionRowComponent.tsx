import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import BiddingComponent from '../BiddingComponent';

import { Bid } from '../../../../types/models';

interface ActionRowComponentProps {
  chatInputPlaceholder?: string;
  onChatInputChange?: (text: string) => void;
  latestBid: Bid;
  onPlaceBid: (amount: number) => void;
  onSetBidLimit: () => void;
}

const ActionRowComponent: React.FC<ActionRowComponentProps> = ({
  chatInputPlaceholder = "Say Something...",
  onChatInputChange,
  latestBid,
  onPlaceBid,
  onSetBidLimit,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.chatInput}
        placeholder={chatInputPlaceholder}
        placeholderTextColor="#999"
        onChangeText={onChatInputChange}
      />
      <BiddingComponent
        latestBid={latestBid}
        onPlaceBid={onPlaceBid}
        onSetBidLimit={onSetBidLimit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default ActionRowComponent;
