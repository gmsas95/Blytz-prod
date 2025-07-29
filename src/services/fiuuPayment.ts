import { FIUU_MERCHANT_ID, FIUU_MERCHANT_KEY, FIUU_VERIFY_KEY } from '@env';

const FIUU_CONFIG = {
  merchantId: FIUU_MERCHANT_ID,
  merchantKey: FIUU_MERCHANT_KEY,
  verifyKey: FIUU_VERIFY_KEY,
  sandboxUrl: 'https://sandbox.fiuu.com/RMS/API/DirectPay',
  productionUrl: 'https://pay.fiuu.com/RMS/API/DirectPay',
};

interface PaymentRequest {
  amount: number;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  callbackUrl: string;
}

interface PaymentResponse {
  status: string;
  transactionId: string;
  redirectUrl: string;
  error?: string;
}

export class FiuuPaymentService {
  private static generateHash(data: string): string {
    // Implement Fiuu hash generation
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        amount: request.amount,
        orderid: request.orderId,
        bill_desc: request.description,
        bill_email: request.customerEmail,
        bill_name: request.customerName,
        bill_mobile: request.customerPhone,
        returnurl: request.returnUrl,
        callbackurl: request.callbackUrl,
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${request.amount}${request.orderId}${FIUU_CONFIG.verifyKey}`)
      };

      const response = await fetch(FIUU_CONFIG.sandboxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      return {
        status: result.status,
        transactionId: result.transaction_id,
        redirectUrl: result.url,
        error: result.error_desc,
      };
    } catch (error) {
      return {
        status: 'error',
        transactionId: '',
        redirectUrl: '',
        error: error.message,
      };
    }
  }

  static async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        transaction_id: transactionId,
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${transactionId}${FIUU_CONFIG.verifyKey}`)
      };

      const response = await fetch(`${FIUU_CONFIG.sandboxUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result.status === '00';
    } catch (error) {
      return false;
    }
  }
}