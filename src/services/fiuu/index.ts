// src/services/fiuu/index.ts
import { NativeModules } from 'react-native';

const { MOLPayReactPackage } = NativeModules;

export interface FiuuPaymentDetails {
  amount: string;
  orderId: string;
  username: string;
  email: string;
  mobile: string;
  description: string;
}

export const startFiuuPayment = (paymentDetails: FiuuPaymentDetails) => {
  return new Promise((resolve, reject) => {
    try {
      MOLPayReactPackage.startPayment(paymentDetails, (response: any) => {
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  });
};
