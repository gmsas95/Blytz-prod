import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChatSection from './ChatSection';
import ProductInfo from './ProductInfo';
import ActionRow from './ActionRow';
import { ChatMessage, Bid } from '../../../../../types/models';

interface FooterOverlayProps {
  // Chat section props
  messages: ChatMessage[];
  maxVisibleMessages?: number;
  
  // Product info props
  productName: string;
  currentPrice: number;
  timeRemaining?: string;
  onSeeMorePress: () => void;
  
  // Action row props
  latestBid: Bid | null;
  onPlaceBid: (amount: number) => void;
  onSetBidLimit: () => void;
  onSendMessage: (message: string) => void;
  chatPlaceholder?: string;
}

const FooterOverlay: React.FC<FooterOverlayProps> = ({
  // Chat section props
  messages,
  maxVisibleMessages,
  
  // Product info props
  productName,
  currentPrice,
  timeRemaining,
  onSeeMorePress,
  
  // Action row props
  latestBid,
  onPlaceBid,
  onSetBidLimit,
  onSendMessage,
  chatPlaceholder,
}) => {
  return (
    <View style={styles.footer}>
      <ChatSection
        messages={messages}
        maxVisibleMessages={maxVisibleMessages}
      />
      <ProductInfo
        productName={productName}
        currentPrice={currentPrice}
        timeRemaining={timeRemaining}
        onSeeMorePress={onSeeMorePress}
      />
      <ActionRow
        latestBid={latestBid}
        onPlaceBid={onPlaceBid}
        onSetBidLimit={onSetBidLimit}
        onSendMessage={onSendMessage}
        chatPlaceholder={chatPlaceholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    justifyContent: 'flex-end',
  },
});

export default FooterOverlay;
