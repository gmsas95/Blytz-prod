const FIUU_CONFIG = {
  merchantId: process.env.FIUU_MERCHANT_ID,
  merchantKey: process.env.FIUU_MERCHANT_KEY,
  verifyKey: process.env.FIUU_VERIFY_KEY,
  sandboxUrl: 'https://sandbox.fiuu.com/RMS/API/DirectPay',
  productionUrl: 'https://pay.fiuu.com/RMS/API/DirectPay',
  sandboxQueryUrl: 'https://sandbox.fiuu.com/RMS/API/QRPay/query',
  productionQueryUrl: 'https://pay.fiuu.com/RMS/API/QRPay/query',
  sandboxRefundUrl: 'https://sandbox.fiuu.com/RMS/API/refundAPI',
  productionRefundUrl: 'https://pay.fiuu.com/RMS/API/refundAPI',
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

interface PaymentStatus {
  status: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt?: string;
  error?: string;
}

interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

interface RefundResponse {
  status: string;
  refundId: string;
  amount: number;
  error?: string;
}

import * as crypto from 'crypto';

export class FiuuPaymentService {
  private static generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private static generateSignature(params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .filter(key => key !== 'signature' && params[key] !== undefined && params[key] !== '')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return this.generateHash(sortedParams + FIUU_CONFIG.verifyKey);
  }

  static async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        amount: request.amount.toFixed(2),
        orderid: request.orderId,
        bill_desc: request.description,
        bill_email: request.customerEmail,
        bill_name: request.customerName,
        bill_mobile: request.customerPhone,
        returnurl: request.returnUrl,
        callbackurl: request.callbackUrl,
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${request.amount.toFixed(2)}${request.orderId}${FIUU_CONFIG.verifyKey}`)
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
      const err = error as Error;
      return {
        status: 'error',
        transactionId: '',
        redirectUrl: '',
        error: err.message,
      };
    }
  }

  static async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      // Input validation
      if (!transactionId || transactionId.trim() === '') {
        console.error('Invalid transaction ID provided');
        return false;
      }

      // Rate limiting check
      const rateLimitKey = `payment_verify_${transactionId}`;
      const lastVerify = this.rateLimitCache.get(rateLimitKey);
      if (lastVerify && Date.now() - lastVerify < 5000) {
        console.warn('Rate limit exceeded for payment verification');
        return false;
      }
      this.rateLimitCache.set(rateLimitKey, Date.now());

      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        transaction_id: transactionId.trim(),
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${transactionId.trim()}${FIUU_CONFIG.verifyKey}`)
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${FIUU_CONFIG.sandboxUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Blytz/1.0',
          'X-Request-ID': `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return false;
      }

      const result = await response.json();
      
      // Validate response structure
      if (!result || typeof result.status !== 'string') {
        console.error('Invalid response format from payment gateway');
        return false;
      }

      return result.status === '00';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  static async getPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    try {
      // Input validation
      if (!transactionId || transactionId.trim() === '') {
        console.error('Invalid transaction ID provided');
        return null;
      }

      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        transaction_id: transactionId.trim(),
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${transactionId.trim()}${FIUU_CONFIG.verifyKey}`)
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${FIUU_CONFIG.sandboxQueryUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Blytz/1.0',
          'X-Request-ID': `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (result.status === '00') {
        return {
          status: result.status,
          transactionId: result.transaction_id,
          amount: parseFloat(result.amount),
          currency: result.currency,
          paymentMethod: result.pay_method,
          paidAt: result.tranID,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Payment status check failed:', error);
      return null;
    }
  }

  // Rate limiting cache for payment operations
  private static rateLimitCache = new Map<string, number>();

  // Security validation for payment amounts
  static validatePaymentAmount(amount: number): boolean {
    const minAmount = 0.01; // Minimum 1 cent
    const maxAmount = 10000; // Maximum RM10,000 per transaction
    
    if (isNaN(amount) || amount < minAmount || amount > maxAmount) {
      return false;
    }
    
    // Ensure amount has exactly 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;
    return Math.abs(amount - roundedAmount) < 0.001;
  }

  // Enhanced fraud detection
  static detectSuspiciousPayment(orderData: any): boolean {
    // Basic fraud detection rules
    const suspiciousPatterns = [
      orderData.amount > 1000, // High value transactions
      orderData.quantity > 10, // Bulk purchases
      orderData.email?.includes('tempmail'), // Temporary email
      orderData.phone?.length < 10, // Invalid phone
    ];
    
    return suspiciousPatterns.some(pattern => pattern);
  }

  // Secure payment initiation with validation
  static async initiateSecurePayment(orderData: {
    amount: number;
    orderId: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    description: string;
    returnUrl?: string;
    callbackUrl?: string;
  }): Promise<PaymentResponse> {
    try {
      // Validate input
      if (!this.validatePaymentAmount(orderData.amount)) {
        throw new Error('Invalid payment amount');
      }

      if (!orderData.orderId || !orderData.customerEmail) {
        throw new Error('Missing required payment data');
      }

      // Fraud detection
      if (this.detectSuspiciousPayment(orderData)) {
        throw new Error('Payment request flagged for review');
      }

      // Rate limiting for payment initiation
      const rateLimitKey = `payment_init_${orderData.customerEmail}`;
      const lastInit = this.rateLimitCache.get(rateLimitKey);
      if (lastInit && Date.now() - lastInit < 30000) { // 30 seconds
        throw new Error('Too many payment attempts');
      }
      this.rateLimitCache.set(rateLimitKey, Date.now());

      // Proceed with normal payment flow
      const paymentRequest: PaymentRequest = {
        amount: orderData.amount,
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        description: orderData.description,
        returnUrl: orderData.returnUrl || `${window.location.origin}/payment/success`,
        callbackUrl: orderData.callbackUrl || `${window.location.origin}/payment/callback`
      };
      
      return await this.createPayment(paymentRequest);
    } catch (error) {
      console.error('Secure payment initiation failed:', error);
      return {
        status: 'error',
        transactionId: '',
        redirectUrl: '',
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  static async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const payload = {
        merchant_id: FIUU_CONFIG.merchantId,
        transaction_id: request.transactionId,
        refund_amount: request.amount.toFixed(2),
        refund_ref: request.reason,
        vcode: this.generateHash(`${FIUU_CONFIG.merchantId}${request.transactionId}${request.amount.toFixed(2)}${FIUU_CONFIG.verifyKey}`)
      };

      const response = await fetch(FIUU_CONFIG.sandboxRefundUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      return {
        status: result.status,
        refundId: result.refund_id || '',
        amount: request.amount,
        error: result.error_desc,
      };
    } catch (error) {
      const err = error as Error;
      return {
        status: 'error',
        refundId: '',
        amount: 0,
        error: err.message,
      };
    }
  }

  static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp}${random}`;
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static getBaseUrl(): string {
    return this.isProduction() ? FIUU_CONFIG.productionUrl : FIUU_CONFIG.sandboxUrl;
  }
}