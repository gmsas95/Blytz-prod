import { Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  inventory: {
    quantity: number;
    sku?: string;
    lowStockThreshold?: number;
  };
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shippingClass: string;
  };
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isAuction: boolean;
  auctionDetails?: {
    startingPrice: number;
    reservePrice?: number;
    currentBid?: number;
    endTime?: Date;
    bidIncrement: number;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    viewCount: number;
    favoriteCount: number;
    soldCount: number;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  options: Record<string, string>;
  price: number;
  inventory: number;
  sku?: string;
  images?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BulkUploadTemplate {
  fields: string[];
  requiredFields: string[];
  sampleData: Record<string, any>;
}

export interface BulkUploadRow {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  sku?: string;
  quantity?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  shippingClass?: string;
  tags?: string;
  images?: string;
  name?: string;
  lowStockThreshold?: string;
  specifications?: string;
}

export interface BulkUploadResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

export const productConverter = {
  toFirestore: (product: Product): DocumentData => {
    return {
      ...product,
      metadata: {
        ...product.metadata,
        createdAt: product.metadata.createdAt,
        updatedAt: product.metadata.updatedAt,
      }
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
  ): Product => {
    const data = snapshot.data() as Product;
    return {
      ...data,
      id: snapshot.id,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt,
        updatedAt: data.metadata.updatedAt,
      }
    };
  },
};
