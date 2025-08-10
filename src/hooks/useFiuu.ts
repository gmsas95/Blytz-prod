// src/hooks/useFiuu.ts
import { useState } from 'react';
export interface FiuuPaymentDetails {
  amount: string;
  orderId: string;
  username: string;
  email: string;
  mobile: string;
  description: string;
}

export const useFiuu = () => {
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const makePayment = async (paymentDetails: FiuuPaymentDetails) => {
    setIsLoading(true);
    try {
      const result = await startFiuuPayment(paymentDetails);
      setPaymentResult(result);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return { makePayment, paymentResult, error, isLoading };
};
