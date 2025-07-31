export const FIUU_CONFIG = {
  merchantId: process.env.EXPO_PUBLIC_FIUU_MERCHANT_ID || 'your-merchant-id',
  merchantKey: process.env.EXPO_PUBLIC_FIUU_MERCHANT_KEY || 'your-merchant-key',
  verifyKey: process.env.EXPO_PUBLIC_FIUU_VERIFY_KEY || 'your-verify-key',
  
  // API URLs
  sandboxUrl: 'https://sandbox.fiuu.com/RMS/API/DirectPay',
  productionUrl: 'https://pay.fiuu.com/RMS/API/DirectPay',
  sandboxQueryUrl: 'https://sandbox.fiuu.com/RMS/API/QRPay/query',
  productionQueryUrl: 'https://pay.fiuu.com/RMS/API/QRPay/query',
  sandboxRefundUrl: 'https://sandbox.fiuu.com/RMS/API/refundAPI',
  productionRefundUrl: 'https://pay.fiuu.com/RMS/API/refundAPI',
  
  // Webhook configuration
  webhookUrl: 'https://your-app-url.com/api/fiuu-webhook',
  returnUrl: 'https://blytz.app/payment/success',
  callbackUrl: 'https://blytz.app/payment/callback',
  
  // Payment channels
  channels: {
    creditCard: 'credit',
    debitCard: 'debit',
    onlineBanking: 'fpx',
    eWallet: 'ewallet',
  },
  
  // Status codes
  statusCodes: {
    success: '00',
    pending: '11',
    failed: '22',
    cancelled: '33',
  },
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  
  // Get base URL based on environment
  getBaseUrl() {
    return this.isProduction ? this.productionUrl : this.sandboxUrl;
  },
  
  // Get query URL based on environment
  getQueryUrl() {
    return this.isProduction ? this.productionQueryUrl : this.sandboxQueryUrl;
  },
  
  // Get refund URL based on environment
  getRefundUrl() {
    return this.isProduction ? this.productionRefundUrl : this.sandboxRefundUrl;
  },
};