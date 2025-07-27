import {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../../context/AuthContext';
import {useAuction} from '../../context/AuctionContext';
import {CURRENCY_SYMBOLS} from '../../config/constants';
import {getShippingRates} from '../../services/logistics/shipping';
import type {ShippingAddress} from '../../types/auth';
import {User} from '../../types/models/user';

interface Auction {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  currency: string;
  status: 'live' | 'upcoming' | 'ended';
  startTime: {toDate: () => Date} | Date;
  endTime: {toDate: () => Date} | Date;
  imageUrls: string[];
  sellerName: string;
  sellerAvatar?: string;
  tags: string[];
  bids?: Bid[];
  thumbnailUrl: string;
}

interface Bid {
  id: string;
  userName: string;
  amount: number;
  timestamp: {toDate: () => Date} | Date;
}

interface PaymentMethod {
  id: string;
  type: string;
  isDefault?: boolean;
  brand?: string;
  last4?: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface CheckoutScreenRouteParams {
  auctionId: string;
}

export default function CheckoutScreen() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const route = useRoute();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {user} = useAuth();
  const {getAuctionById} = useAuction();

  const {auctionId} = route.params as CheckoutScreenRouteParams;

  useEffect(() => {
    const loadCheckoutData = async () => {
      if (!auctionId || !user) {
        navigation.goBack();
        return;
      }

      setIsLoading(true);

      try {
        // Load auction
        const auctionData = await getAuctionById(auctionId);

        if (!auctionData) {
          Alert.alert('Error', 'Auction not found');
          navigation.goBack();
          return;
        }

        setAuction(auctionData);

        // Set default address if available
        if (
          (user as User).shippingAddresses &&
          (user as User).shippingAddresses!.length > 0
        ) {
          const defaultAddress =
            (user as User).shippingAddresses!.find(addr => addr.isDefault) ||
            (user as User).shippingAddresses![0];
          setSelectedAddress(defaultAddress);

          // Load shipping options
          const options = await getShippingRates(
            'MY', // Origin country (example)
            defaultAddress.country, // Destination country
            1, // Weight (example)
          );

          setShippingOptions(options);
          setSelectedShipping(options[0]);
        }

        // Set default payment method if available
        if (
          (user as User).paymentMethods &&
          (user as User).paymentMethods!.length > 0
        ) {
          const defaultMethod =
            (user as User).paymentMethods!.find(method => method.isDefault) ||
            (user as User).paymentMethods![0];
          setSelectedPaymentMethod(defaultMethod);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckoutData();

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    };
  }, [auctionId, user, getAuctionById, navigation]);

  const handleAddressSelect = () => {
    navigation.navigate('ShippingAddress', {returnToCheckout: true});
  };

  const handlePaymentSelect = () => {
    navigation.navigate('PaymentMethods', {returnToCheckout: true});
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!selectedShipping) {
      Alert.alert('Error', 'Please select a shipping option');
      return;
    }

    setIsProcessing(true);

    // Clear any previous timeout just in case
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Simulate order processing
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Order Placed', 'Your order has been successfully placed!', [
        {
          text: 'View Orders',
          onPress: () => navigation.navigate('MyOrders'),
        },
        {
          text: 'Continue Shopping',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
      processingTimeoutRef.current = null; // Clear ref after execution
    }, 2000);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (!auction || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Unable to load checkout</Text>
      </View>
    );
  }

  const currencySymbol =
    CURRENCY_SYMBOLS[auction.currency as keyof typeof CURRENCY_SYMBOLS] || '';
  const subtotal = auction.currentPrice;
  const shipping = selectedShipping ? selectedShipping.price : 0;
  const tax = Math.round(subtotal * 0.06 * 100) / 100; // Example: 6% tax
  const total = subtotal + shipping + tax;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="mb-5 bg-card rounded-lg p-4 border border-border">
          <Text className="text-lg font-bold text-text mb-3">Item</Text>
          <View className="flex-row mb-4">
            <Image
              source={{uri: auction.thumbnailUrl}}
              className="w-20 h-20 rounded-lg mr-3"
            />
            <View className="flex-1">
              <Text className="text-base font-bold text-text mb-1">
                {auction.title}
              </Text>
              <Text className="text-base text-primary font-bold">
                {currencySymbol}
                {auction.currentPrice}
              </Text>
              <Text className="text-sm text-text o-70">
                Sold by: {auction.sellerName}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 bg-card rounded-lg p-4 border border-border">
          <Text className="text-lg font-bold text-text mb-3">
            Shipping Address
          </Text>
          {selectedAddress ? (
            <TouchableOpacity
              className="border border-border rounded-lg p-3 mb-3"
              onPress={handleAddressSelect}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-text">
                  {selectedAddress.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="text" />
              </View>
              <Text className="text-sm text-text leading-5">
                {selectedAddress.addressLine1},{' '}
                {selectedAddress.addressLine2
                  ? `${selectedAddress.addressLine2}, `
                  : ''}
                {selectedAddress.city}, {selectedAddress.state}{' '}
                {selectedAddress.postalCode}
                {'\n'}
                {selectedAddress.country}
                {'\n'}
                {selectedAddress.phoneNumber}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center p-3 border border-dashed border-border rounded-lg justify-center"
              onPress={handleAddressSelect}>
              <Ionicons name="add-circle-outline" size={20} color="#FF385C" />
              <Text className="ml-2 text-base text-primary font-bold">
                Add Shipping Address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-5 bg-card rounded-lg p-4 border border-border">
          <Text className="text-lg font-bold text-text mb-3">
            Payment Method
          </Text>
          {selectedPaymentMethod ? (
            <TouchableOpacity
              className="flex-row items-center border border-border rounded-lg p-3 mb-3"
              onPress={handlePaymentSelect}>
              <Ionicons
                name={
                  selectedPaymentMethod.type === 'stripe'
                    ? 'card'
                    : 'cash-outline'
                }
                size={24}
                color="#FF385C"
                className="mr-3"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-text">
                  {selectedPaymentMethod.type === 'stripe'
                    ? 'Credit Card'
                    : 'Curlec'}
                </Text>
                {selectedPaymentMethod.last4 && (
                  <Text className="text-sm text-text o-70">
                    {selectedPaymentMethod.brand} ••••{' '}
                    {selectedPaymentMethod.last4}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="text" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center p-3 border border-dashed border-border rounded-lg justify-center"
              onPress={handlePaymentSelect}>
              <Ionicons name="add-circle-outline" size={20} color="#FF385C" />
              <Text className="ml-2 text-base text-primary font-bold">
                Add Payment Method
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-5 bg-card rounded-lg p-4 border border-border">
          <Text className="text-lg font-bold text-text mb-3">
            Shipping Method
          </Text>
          {shippingOptions.map((option: ShippingOption) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center border rounded-lg p-3 mb-2 ${selectedShipping?.id === option.id ? 'border-primary bg-primary/10' : 'border-border'}`}
              onPress={() => setSelectedShipping(option)}>
              <Ionicons
                name={
                  selectedShipping?.id === option.id
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={24}
                color={selectedShipping?.id === option.id ? '#FF385C' : 'text'}
              />
              <View className="flex-1 ml-2">
                <Text className="text-base font-bold text-text">
                  {option.name}
                </Text>
                <Text className="text-sm text-text o-70">
                  {option.estimatedDays}
                </Text>
              </View>
              <Text className="text-base font-bold text-text">
                {currencySymbol}
                {option.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-5 bg-card rounded-lg p-4 border border-border">
          <Text className="text-lg font-bold text-text mb-3">
            Order Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text">Subtotal</Text>
            <Text className="text-sm font-bold text-text">
              {currencySymbol}
              {subtotal}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text">Shipping</Text>
            <Text className="text-sm font-bold text-text">
              {currencySymbol}
              {shipping}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text">Tax</Text>
            <Text className="text-sm font-bold text-text">
              {currencySymbol}
              {tax}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
            <Text className="text-base font-bold text-text">Total</Text>
            <Text className="text-base font-bold text-primary">
              {currencySymbol}
              {total}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-5 mb-8"
          onPress={handlePlaceOrder}
          disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-bold">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
