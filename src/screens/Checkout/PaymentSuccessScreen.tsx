import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {FiuuPaymentService} from '../../services/fiuuPayment';

interface PaymentSuccessRouteParams {
  orderId: string;
  transactionId?: string;
  status?: string;
}

interface OrderDetails {
  orderId: string;
  totalPrice: number;
}

export default function PaymentSuccessScreen() {
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const {orderId, transactionId, status} = route.params as PaymentSuccessRouteParams;

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        // const orderData = await getOrderByOrderId(orderId);
        // setOrder(orderData);
        
        // Verify payment status with Fiuu
        if (transactionId) {
          const paymentStatus = await FiuuPaymentService.getPaymentStatus(transactionId);
          console.log('Payment status:', paymentStatus);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, transactionId]);

  const handleViewOrders = () => {
    navigation.navigate('UserProfile', {screen: 'MyOrders'});
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  const isSuccess = status === '00' || !status;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {isSuccess ? (
          <>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>
              Your order has been confirmed and payment has been processed.
            </Text>
            
            {order && (
              <View style={styles.orderCard}>
                <Text style={styles.orderTitle}>Order Details</Text>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Order ID:</Text>
                  <Text style={styles.orderValue}>{order.orderId}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Total Amount:</Text>
                  <Text style={styles.orderValue}>RM {order.totalPrice}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Status:</Text>
                  <Text style={[styles.orderValue, styles.statusPaid]}>Paid</Text>
                </View>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrders}>
                <Text style={styles.primaryButtonText}>View Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
                <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={80} color="#F44336" />
            </View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.subtitle}>
              Your payment could not be processed. Please try again.
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  orderCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666666',
  },
  orderValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  statusPaid: {
    color: '#4CAF50',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF385C',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});