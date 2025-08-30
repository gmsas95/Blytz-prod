import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, Animated, PanResponder, Alert } from 'react-native';
import { useLiveStream } from '../../../hooks/useLiveStream';
import { theme } from '../../../config/theme';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
import LiveStreamItem from '../../../components/LiveStream/viewer/LiveStreamItem';
import { useAuth } from '../../../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { validateBidAmount, calculateNextBidAmount } from '../../../utils/bidding';
import { getDatabase, ref, push, serverTimestamp, onValue } from 'firebase/database';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface Product {
  id: string;
  title: string;
  price: number;
  type: 'auction' | 'sale';
  startingPrice?: number;
  currentBid?: number;
  timeRemaining?: string;
}

interface SlidingButtonProps {
  productType: 'auction' | 'sale';
  onAction: () => void;
  disabled?: boolean;
}

const SlidingButton: React.FC<SlidingButtonProps> = ({ productType, onAction, disabled = false }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const buttonWidth = 120; // Ultra compact for 28px height
  const sliderWidth = 28; // Ultra compact for 28px height
  const maxSlideDistance = buttonWidth - sliderWidth;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setIsSliding(true);
      },
      onPanResponderMove: (event, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.dx, maxSlideDistance));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (event, gestureState) => {
        setIsSliding(false);
        
        if (gestureState.dx > maxSlideDistance * 0.8) {
          // Completed slide
          Animated.spring(translateX, {
            toValue: maxSlideDistance,
            useNativeDriver: true,
            speed: 20,
          }).start(() => {
            setHasCompleted(true);
            onAction();
            
            // Reset after action - immediate reset for rapid bidding
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
            }).start(() => {
              setHasCompleted(false);
            });
          });
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
          }).start();
        }
      },
    })
  ).current;

  const isAuction = productType === 'auction';
  const buttonText = isAuction ? 'Slide' : 'Slide';
  const buttonColor = isAuction ? theme.colors.primary : '#4CAF50';

  return (
    <View style={[styles.slidingButtonContainer, { opacity: disabled ? 0.5 : 1 }]}>
      <View style={[styles.slidingButtonSmall, { backgroundColor: buttonColor }]}>
        <Text style={styles.slidingButtonTextSmall}>{buttonText}</Text>
        <Animated.View
          style={[
            styles.slidingThumbSmall,
            {
              transform: [{ translateX }],
              backgroundColor: disabled ? '#ccc' : '#fff',
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.slidingThumbTextSmall}>→</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const LiveStreamViewerScreen = () => {
  const { isConnected, participants, connectToRoom, disconnectFromRoom } = useLiveStream();
  const [isConnecting, setIsConnecting] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'User123', message: 'Is this available in size L?', timestamp: new Date() },
    { id: '2', user: 'Seller', message: 'Yes, it is! All sizes available.', timestamp: new Date() },
    { id: '3', user: 'Bidder456', message: '$50', timestamp: new Date() },
    { id: '4', user: 'User789', message: 'Love this design! 🔥', timestamp: new Date() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [customBid, setCustomBid] = useState('');
  const [product, setProduct] = useState<Product>({
    id: '1',
    title: 'Vintage Designer T-Shirt',
    price: 45.00,
    type: 'auction',
    startingPrice: 30.00,
    currentBid: 30.00,
    timeRemaining: '2:34 remaining',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { user } = useAuth();
  const route = useRoute();
  const chatRef = useRef<FlatList>(null);
  
  const streamId = (route.params as any)?.streamId || 'test-stream';

  useEffect(() => {
    const connectToStream = async () => {
      if (!user) return;
      
      try {
        setIsConnecting(true);
        await connectToRoom(streamId, user.displayName || user.email || 'Viewer');
      } catch (error) {
        console.error('Error connecting to stream:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToStream();

    // Listen for real-time bid updates from Firestore via Cloud Functions
    // Cloud Functions will update Firestore, we'll listen to Firestore directly
    const firestore = getFirestore();
    const auctionRef = doc(firestore, 'auctions', streamId);
    
    const unsubscribeAuction = onSnapshot(auctionRef, (doc) => {
      if (doc.exists()) {
        const auctionData = doc.data();
        setProduct(prev => ({
          ...prev,
          currentBid: auctionData.currentPrice || prev.startingPrice || 0,
          // Add other auction fields as needed
        }));
      }
    });
    
    // Also listen to Realtime Database for immediate bid feedback
    const database = getDatabase();
    const bidsRef = ref(database, `auctions/${streamId}/bids`);
    
    const unsubscribeBids = onValue(bidsRef, (snapshot) => {
      const bids = snapshot.val();
      if (bids) {
        const bidArray = Object.values(bids) as any[];
        const latestBid = bidArray.sort((a, b) => b.timestamp - a.timestamp)[0];
        if (latestBid) {
          // Update display temporarily while Cloud Functions process
          setProduct(prev => ({
            ...prev,
            currentBid: Math.max(latestBid.amount, prev.currentBid || 0),
          }));
        }
      }
    });

    return () => {
      disconnectFromRoom();
      unsubscribeAuction();
      unsubscribeBids();
    };
  }, [streamId, user?.uid]);

  useEffect(() => {
    // Auto-scroll to latest message
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user: user?.displayName || 'Viewer',
        message: chatInput.trim(),
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  const handlePlaceBid = async (amount: number) => {
    if (!user) return;
    
    setErrorMessage('');
    
    const currentHighestBid = product.currentBid || product.startingPrice || 0;
    const validation = validateBidAmount(amount, currentHighestBid, 5);
    
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Invalid bid');
      Alert.alert('Invalid Bid', validation.errorMessage || 'Invalid bid amount');
      return;
    }
    
    try {
      const database = getDatabase();
      const bidsRef = ref(database, `auctions/${streamId}/bids`);
      
      await push(bidsRef, {
        amount: amount,
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: serverTimestamp()
      });
      
      // Let Cloud Functions handle price updates via Firestore
      // Remove client-side price setting to prevent conflicts
      
      const bidMessage: ChatMessage = {
        id: Date.now().toString(),
        user: user?.displayName || 'Bidder',
        message: `$${amount}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, bidMessage]);
    } catch (error) {
      setErrorMessage('Failed to place bid. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!user) return;
    
    console.log('Buy now clicked:', product.price);
    
    try {
      const database = getDatabase();
      const purchasesRef = ref(database, `auctions/${streamId}/purchases`);
      
      await push(purchasesRef, {
        amount: product.price,
        userId: user.uid,
        userName: user.displayName || user.email,
        type: 'buy_now',
        timestamp: serverTimestamp()
      });
      
      // Add purchase message to chat
      const purchaseMessage: ChatMessage = {
        id: Date.now().toString(),
        user: user?.displayName || 'Buyer',
        message: `Purchased for $${product.price}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, purchaseMessage]);
    } catch (error) {
      console.error('Error processing purchase:', error);
      setErrorMessage('Failed to process purchase. Please try again.');
    }
  };

  const handleSetCustomBid = async () => {
    const bidAmount = parseFloat(customBid);
    const currentHighestBid = product.currentBid || product.startingPrice || 0;
    const validation = validateBidAmount(bidAmount, currentHighestBid, 5);
    
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Invalid bid');
      Alert.alert('Invalid Bid', validation.errorMessage || 'Invalid bid amount');
      return;
    }
    
    await handlePlaceBid(bidAmount);
    setCustomBid('');
  };

  const handleProductAction = () => {
    if (product.type === 'auction') {
      const currentHighestBid = product.currentBid || product.startingPrice || 0;
      const nextBid = calculateNextBidAmount(currentHighestBid, 5);
      
      // Always bid the next increment when using slider
      handlePlaceBid(nextBid);
    } else {
      handleBuyNow();
    }
  };

  const toggleProductType = () => {
    setProduct(prev => ({
      ...prev,
      type: prev.type === 'auction' ? 'sale' : 'auction',
    }));
  };

  if (isConnecting) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.infoText}>Connecting to Stream...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!isConnected) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>Unable to connect to stream.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (participants.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>Waiting for host to join...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Main Video Area */}
        <View style={styles.videoContainer}>
          <LiveStreamItem item={participants[0]} isActive={true} />
        </View>

        {/* Bottom Layout - Fixed with proper keyboard handling */}
        <View style={styles.bottomContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.keyboardAvoidingContainer}
          >
            {/* Scrollable Chatbox */}
            <View style={styles.chatContainer}>
              <FlatList
                ref={chatRef}
                data={chatMessages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.chatMessage}>
                    <Text style={styles.chatUser}>{item.user}:</Text>
                    <Text style={styles.chatText}>{item.message}</Text>
                  </View>
                )}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              />
            </View>

            {/* Product Card */}
            <View style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <View style={styles.productImage} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                <Text style={styles.productPrice}>
                  ${product.type === 'auction' ? product.currentBid : product.price}
                </Text>
                <Text style={styles.productTimer}>⏰ {product.timeRemaining}</Text>
              </View>
              {/* Demo toggle for testing - remove in production */}
              <TouchableOpacity onPress={toggleProductType} style={styles.typeToggle}>
                <Text style={styles.typeToggleText}>
                  {product.type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chat Input Container - Fixed 28px height */}
            <View style={styles.chatInputContainerFixed}>
              <TextInput
                style={styles.chatInputFixed}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.secondary}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButtonFixed} onPress={handleSendMessage}>
                <Text style={styles.sendButtonTextFixed}>Send</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Action Area - Now only contains bidding controls */}
            <View style={styles.actionArea}>
              {/* Bid Control Area - Split Layout */}
              <View style={styles.bidControlArea}>
                {/* Left Box: Custom Bid Input */}
                <View style={styles.bidInputContainer}>
                  <TextInput
                    style={styles.bidInput}
                    placeholder={`Min $${calculateNextBidAmount(product.currentBid || product.startingPrice || 0, 5)}`}
                    placeholderTextColor={theme.colors.secondary}
                    value={customBid}
                    onChangeText={(text) => {
                      setCustomBid(text);
                      setErrorMessage(''); // Clear error when user starts typing
                    }}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.setButton} onPress={handleSetCustomBid}>
                    <Text style={styles.setButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Right Box: Sliding Action Button */}
                <View style={styles.slidingButtonWrapper}>
                  <SlidingButton 
                    productType={product.type}
                    onAction={handleProductAction}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  infoText: {
    marginTop: theme.spacing.md,
    color: theme.colors.secondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  bottomContainer: {
    height: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chatContent: {
    paddingVertical: 8,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  chatUser: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  chatText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productPrice: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productTimer: {
    color: theme.colors.secondary,
    fontSize: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  bidButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // New styles for keyboard handling and sliding button
  keyboardAvoidingContainer: {
    flex: 1,
  },
  actionArea: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  slidingButtonWrapper: {
    height: 28,
    justifyContent: 'center',
  },
  
  // Sliding button styles - Ultra compact 28px height
  slidingButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidingButton: {
    width: 280,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slidingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  slidingThumb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  slidingThumbText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // Ultra compact sliding button styles - 28px height
  slidingButtonSmall: {
    width: 120,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slidingButtonTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  slidingThumbSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  slidingThumbTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // Product type toggle (for demo)
  typeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  typeToggleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Error message styles
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  
  // Bid control area styles - Ultra compact 28px height
  bidControlArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 28,
  },
  bidInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 0,
    color: '#fff',
    fontSize: 11,
    marginRight: 4,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  setButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 0,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
    lineHeight: 12,
  },

  // Fixed chat input container styles - 28px height
  chatInputContainerFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
    height: 28,
  },
  chatInputFixed: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#fff',
    fontSize: 12,
    height: 28,
  },
  sendButtonFixed: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonTextFixed: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 11,
  },
});

export default LiveStreamViewerScreen;