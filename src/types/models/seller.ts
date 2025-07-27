export interface SellerRegistrationData {
  email: string;
  password: string;
  confirmPassword?: string;
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  taxId: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  businessDescription?: string;
  businessLogo?: string;
}

export interface SellerProfile {
  userId: string;
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  taxId: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  businessDescription?: string;
  businessLogo?: string;
  businessDocuments?: Array<{
    type: 'businessRegistration' | 'taxCertificate' | 'bankStatement';
    fileName: string;
    uploadedAt: Date;
  }>;
  isVerified: boolean;
  verificationStatus: 'pending' | 'under-review' | 'verified' | 'rejected';
  verificationNotes?: string;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerDashboardData {
  seller: SellerProfile;
  stats: {
    totalStreams: number;
    activeStreams: number;
    totalProducts: number;
    soldProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  };
}