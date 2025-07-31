import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ProductService } from '../../services/productService';
import { FiuuPaymentService } from '../../services/fiuuPayment';
import { OrderService } from '../../services/orderService';
import { Product, ShippingAddress } from '../../types/models';
import { getShippingRates } from '../../services/logistics/shipping';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface RouteParams {
  fromCart?: boolean;
  productId?: string;
  quantity?: number;
}

type RootStackParamList = {
  ProductCheckout: RouteParams;
  ShippingAddress: { returnToCheckout: boolean };
  PaymentSuccess: { orderId: string; amount: number };
  Cart: undefined;
  ProductDetail: { productId: string };
};

export default function ProductCheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useAuth();
  const { state: cartState, clearCart } = useCart();
  
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      
      // Determine items to checkout
      let items: CartItem[] = [];
      const { fromCart, productId, quantity } = route.params as RouteParams;

      if (fromCart && cartState.items.length > 0) {
        items = cartState.items;
      } else if (productId) {
        const product = await ProductService.getProduct(productId);
        if (product) {
          items = [{
            product,
            quantity: quantity || 1
          }];
        }
      }

      if (items.length === 0) {
        Alert.alert('Error', 'No items to checkout');
        navigation.goBack();
        return;
      }

      setCheckoutItems(items);

      // Load default shipping address
      if (user?.shippingAddresses && user.shippingAddresses.length > 0) {
        const defaultAddress = user.shippingAddresses.find(addr => addr.isDefault) || 
                              user.shippingAddresses[0];
        setSelectedAddress(defaultAddress);
        
        // Load shipping options
        const totalWeight = items.reduce((sum, item) => 
          sum + (item.product.shipping.weight * item.quantity), 0);
        
        const options = await getShippingRates('MY', defaultAddress.country, totalWeight);
        setShippingOptions(options);
        setSelectedShipping(options[0] || null);
      }

      calculateTotals(items);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      Alert.alert('Error', 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    const shipping = selectedShipping?.price || 0;
    const tax = Math.round(subtotal * 0.06 * 100) / 100; // 6% tax
    const total = subtotal + shipping + tax;

    setCheckoutData({
      items,
      subtotal,
      shipping,
      tax,
      total,
    });
  };

  useEffect(() => {
    calculateTotals(checkoutItems);
  }, [selectedShipping, checkoutItems]);

  const handleAddressSelect = () => {
    navigation.navigate('ShippingAddress', { returnToCheckout: true });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    if (!selectedShipping) {
      Alert.alert('Error', 'Please select a shipping option');
      return;
    }

    // Check inventory for all items
    for (const item of checkoutItems) {
      if (item.product.inventory.quantity < item.quantity) {
        Alert.alert('Error', `Insufficient inventory for ${item.product.title}`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Create order in Firestore
      const order = await OrderService.createOrder({
        userId: user!.uid,
        items: checkoutItems.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
          sellerId: item.product.sellerId,
        })),
        shippingAddress: selectedAddress,
        shippingMethod: selectedShipping,
        subtotal: checkoutData.subtotal,
        shipping: checkoutData.shipping,
        tax: checkoutData.tax,
        total: checkoutData.total,
        paymentMethod: 'fiuu',
      });

      // Reserve inventory temporarily
      for (const item of checkoutItems) {
        await ProductService.updateInventory(
          item.product.id,
          -item.quantity
        );
      }

      // Initiate Fiuu payment
      const paymentRequest = {
        amount: checkoutData.total,
        orderId: order.id,
        description: `Order #${order.id.slice(-8)} - ${checkoutItems.length} item(s)`,
        customerEmail: user?.email || '',
        customerName: user?.displayName || user?.email?.split('@')[0] || '',
        customerPhone: selectedAddress.phoneNumber || '',
        returnUrl: 'https://blytz.app/payment/success',
        callbackUrl: 'https://blytz.app/payment/callback',
      };

      const paymentResponse = await FiuuPaymentService.initiateSecurePayment(paymentRequest);

      if (paymentResponse.status === '00' && paymentResponse.redirectUrl) {
        // Store order ID for payment callback
        await OrderService.updateOrder(order.id, {
          fiuuTransactionId: paymentResponse.transactionId,
          paymentStatus: 'initiated',
        });

        // Redirect to Fiuu payment page
        await Linking.openURL(paymentResponse.redirectUrl);
      } else {
        // Restore inventory on payment failure
        for (const item of checkoutItems) {
          await ProductService.updateInventory(
            item.product.id,
            item.quantity
          );
        }
        
        await OrderService.updateOrder(order.id, {
          status: 'payment_failed',
          paymentStatus: 'failed',
        });
        
        Alert.alert('Payment Error', paymentResponse.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderItem = (item: CartItem) => (
    <View key={item.product.id} className="flex-row mb-4 pb-4 border-b border-gray-200">
      <Image
        source={{ uri: item.product.images[0] || 'https://via.placeholder.com/80' }}
        className="w-20 h-20 rounded-lg mr-3"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={2}>
          {item.product.title}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Quantity: {item.quantity}
        </Text>
        <Text className="text-base font-bold text-primary">
          RM{(item.product.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Items Summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Items ({checkoutItems.length})
          </Text>
          {checkoutItems.map(renderItem)}
        </View>

        {/* Shipping Address */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Shipping Address
          </Text>
          {selectedAddress ? (
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3"
              onPress={handleAddressSelect}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-gray-800">
                  {selectedAddress.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
              <Text className="text-sm text-gray-600 leading-5">
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                {', '}
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                {'\n'}
                {selectedAddress.country}
                {'\n'}
                {selectedAddress.phoneNumber}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center p-3 border-2 border-dashed border-gray-300 rounded-lg justify-center"
              onPress={handleAddressSelect}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FF385C" />
              <Text className="ml-2 text-base text-primary font-bold">
                Add Shipping Address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Method */}
        {shippingOptions.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Shipping Method
            </Text>
            {shippingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center border rounded-lg p-3 mb-2 ${
                  selectedShipping?.id === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300'
                }`}
                onPress={() => setSelectedShipping(option)}
              >
                <Ionicons
                  name={
                    selectedShipping?.id === option.id
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={selectedShipping?.id === option.id ? '#FF385C' : '#666'}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-gray-800">
                    {option.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {option.estimatedDays}
                  </Text>
                </View>
                <Text className="text-base font-bold text-gray-800">
                  RM{option.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Payment Method */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Payment Method
          </Text>
          <View className="flex-row items-center border border-primary rounded-lg p-3 bg-primary/5">
            <Ionicons name="card-outline" size={24} color="#FF385C" />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold text-gray-800">
                Fiuu Payment Gateway
              </Text>
              <Text className="text-sm text-gray-600">
                Secure online payment
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Subtotal</Text>
            <Text className="text-sm font-bold text-gray-800">
              RM{checkoutData.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Shipping</Text>
            <Text className="text-sm font-bold text-gray-800">
              RM{checkoutData.shipping.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Tax (6%)</Text>
            <Text className="text-sm font-bold text-gray-800">
              RM{checkoutData.tax.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
            <Text className="text-base font-bold text-gray-800">Total</Text>
            <Text className="text-base font-bold text-primary">
              RM{checkoutData.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-5 mb-8"
          onPress={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress || !selectedShipping}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-bold">
              Place Order (RM{checkoutData.total.toFixed(2)})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}