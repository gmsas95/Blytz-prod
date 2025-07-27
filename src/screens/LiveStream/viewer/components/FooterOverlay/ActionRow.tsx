import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import BiddingComponent from '../../../../../components/LiveStream/viewer/BiddingComponent';
import { Bid } from '../../../../../types/models';

interface ActionRowProps {
  latestBid: Bid | null;
  onPlaceBid: (amount: number) => void;
  onSetBidLimit: () => void;
  onSendMessage: (message: string) => void;
  chatPlaceholder?: string;
}

const ActionRow: React.FC<ActionRowProps> = ({
  latestBid,
  onPlaceBid,
  onSetBidLimit,
  onSendMessage,
  chatPlaceholder = 'Say Something...',
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  return (
    <View style={styles.actionRow}>
      <TextInput
        style={styles.chatInput}
        placeholder={chatPlaceholder}
        placeholderTextColor="#999"
        value={chatInput}
        onChangeText={setChatInput}
        onSubmitEditing={handleSendMessage}
        returnKeyType="send"
        multiline={false}
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
  actionRow: {
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
    fontSize: 16,
  },
});

export default ActionRow;
