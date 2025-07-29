import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FiuuPaymentService } from '../../services/fiuuPayment';

interface FiuuPaymentButtonProps {
  amount: number;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export const FiuuPaymentButton: React.FC<FiuuPaymentButtonProps> = ({
  amount,
  orderId,
  description,
  customerEmail,
  customerName,
  customerPhone,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const paymentData = {
        amount: amount * 100, // Convert to cents
        orderId,
        description,
        customerEmail,
        customerName,
        customerPhone,
        returnUrl: 'https://blytzapp.com/payment/success',
        callbackUrl: 'https://blytzapp.com/payment/callback',
      };

      const response = await FiuuPaymentService.createPayment(paymentData);

      if (response.status === 'success') {
        // Redirect to Fiuu payment page
        if (response.redirectUrl) {
          // In real app, use WebView or Linking
          Alert.alert(
            'Payment Initiated',
            'You will be redirected to Fiuu payment page',
            [{ text: 'OK', onPress: () => onPaymentSuccess(response.transactionId) }]
          );
        }
      } else {
        onPaymentError(response.error || 'Payment failed');
      }
    } catch (error) {
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePayment}
      disabled={loading}
      className="bg-blue-600 p-4 rounded-lg items-center justify-center"
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white font-semibold text-lg">
          Pay RM {amount.toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );
};