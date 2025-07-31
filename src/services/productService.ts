import { firestore } from '../config/firebase.config';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import { Product, ProductCategory, BulkUploadResult, BulkUploadTemplate, BulkUploadRow } from '../types/models/product';
import { storage } from '../config/firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { XMLParser } from 'fast-xml-parser';
import Papa from 'papaparse';

export class ProductService {
  private static productsRef = collection(firestore, 'products');
  private static categoriesRef = collection(firestore, 'categories');

  // Single product creation
  static async createProduct(productData: Omit<Product, 'id' | 'metadata'>): Promise<Product> {
    try {
      const timestamp = Timestamp.now();
      const productWithMetadata = {
        ...productData,
        metadata: {
          createdAt: timestamp,
          updatedAt: timestamp,
          viewCount: 0,
          favoriteCount: 0,
          soldCount: 0,
        }
      };

      const docRef = await addDoc(this.productsRef, productWithMetadata);
      
      return {
        ...productData,
        id: docRef.id,
        metadata: {
          createdAt: timestamp,
          updatedAt: timestamp,
          viewCount: 0,
          favoriteCount: 0,
          soldCount: 0,
        }
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Get products with pagination
  static async getProducts({
    sellerId,
    category,
    status = 'active',
    limit: pageLimit = 20,
    lastDoc = null,
    searchTerm = ''
  }: {
    sellerId?: string;
    category?: string;
    status?: string;
    limit?: number;
    lastDoc?: any;
    searchTerm?: string;
  } = {}): Promise<{ products: Product[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(this.productsRef, where('status', '==', status));

      if (sellerId) {
        q = query(q, where('sellerId', '==', sellerId));
      }

      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (searchTerm) {
        // For search, we'll use a separate search function with full-text search
        return this.searchProducts(searchTerm, { sellerId, category, limit: pageLimit });
      }

      q = query(q, orderBy('metadata.createdAt', 'desc'), limit(pageLimit));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageLimit
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to get products');
    }
  }

  // Get single product
  static async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.productsRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Product;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(this.productsRef, id);
      await updateDoc(docRef, {
        ...updates,
        'metadata.updatedAt': Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.productsRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Upload product images
  static async uploadProductImages(
    files: File[], 
    productId: string
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${productId}_${Date.now()}_${index}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `products/${productId}/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload product images');
    }
  }

  // Delete product image
  static async deleteProductImage(productId: string, imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete product image');
    }
  }

  // Bulk upload from XML
  static async bulkUploadFromXML(
    xmlContent: string, 
    sellerId: string
  ): Promise<BulkUploadResult> {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      
      const xmlData = parser.parse(xmlContent);
      const products = Array.isArray(xmlData.products?.product) 
        ? xmlData.products.product 
        : [xmlData.products?.product].filter(Boolean);

      const results: BulkUploadResult = {
        success: true,
        productsAdded: 0,
        productsUpdated: 0,
        errors: [],
        warnings: []
      };

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        try {
          await this.createProduct({
            sellerId,
            title: product.title || product.name || '',
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            images: Array.isArray(product.images?.image) 
              ? product.images.image 
              : [product.images?.image].filter(Boolean),
            category: product.category || 'general',
            tags: Array.isArray(product.tags?.tag) 
              ? product.tags.tag 
              : [product.tags?.tag].filter(Boolean),
            inventory: {
              quantity: parseInt(product.quantity) || 0,
              sku: product.sku || '',
              lowStockThreshold: parseInt(product.lowStockThreshold) || 5
            },
            specifications: product.specifications || {},
            shipping: {
              weight: parseFloat(product.weight) || 0,
              dimensions: {
                length: parseFloat(product.length) || 0,
                width: parseFloat(product.width) || 0,
                height: parseFloat(product.height) || 0
              },
              shippingClass: product.shippingClass || 'standard'
            },
            status: 'active',
            isAuction: false,
            variants: product.variants?.variant?.map((v: any) => ({
              id: v.id || Math.random().toString(36).substr(2, 9),
              name: v.name || '',
              options: v.options || {},
              price: parseFloat(v.price) || 0,
              inventory: parseInt(v.quantity) || 0,
              sku: v.sku || '',
              images: Array.isArray(v.images?.image) 
                ? v.images.image 
                : [v.images?.image].filter(Boolean)
            })) || []
          });
          results.productsAdded++;
        } catch (error: any) {
          results.errors.push({
            row: i + 1,
            field: 'general',
            message: error.message,
            value: product
          });
        }
      }

      return results;
    } catch (error: any) {
      return {
        success: false,
        productsAdded: 0,
        productsUpdated: 0,
        errors: [{
          row: 0,
          field: 'xml',
          message: error.message,
          value: xmlContent
        }],
        warnings: []
      };
    }
  }

  // Bulk upload from CSV
  static async bulkUploadFromCSV(
    csvContent: string, 
    sellerId: string
  ): Promise<BulkUploadResult> {
    return new Promise((resolve) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const uploadResult: BulkUploadResult = {
            success: true,
            productsAdded: 0,
            productsUpdated: 0,
            errors: [],
            warnings: []
          };

          const data = results.data as unknown as BulkUploadRow[];
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
              await this.createProduct({
                sellerId,
                title: row.title || row.name || '',
                description: row.description || '',
                price: parseFloat(row.price || '0') || 0,
                images: row.images ? row.images.split(',').map((img: string) => img.trim()) : [],
                category: row.category || 'general',
                tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
                inventory: {
                  quantity: parseInt(row.quantity || '0') || 0,
                  sku: row.sku || '',
                  lowStockThreshold: parseInt(row.lowStockThreshold || '5') || 5
                },
                specifications: {},
                shipping: {
                  weight: parseFloat(row.weight || '0') || 0,
                  dimensions: {
                    length: parseFloat(row.length || '0') || 0,
                    width: parseFloat(row.width || '0') || 0,
                    height: parseFloat(row.height || '0') || 0
                  },
                  shippingClass: row.shippingClass || 'standard'
                },
                status: 'active',
                isAuction: false,
                variants: []
              });
              uploadResult.productsAdded++;
            } catch (error: any) {
              uploadResult.errors.push({
                row: i + 2, // +2 for header and 0-based index
                field: 'csv',
                message: error.message,
                value: row
              });
            }
          }

          resolve(uploadResult);
        },
        error: (error: any) => {
          resolve({
            success: false,
            productsAdded: 0,
            productsUpdated: 0,
            errors: [{
              row: 0,
              field: 'csv',
              message: error.message,
              value: csvContent
            }],
            warnings: []
          });
        }
      });
    });
  }

  // Get product categories
  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const q = query(this.categoriesRef, orderBy('sortOrder', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProductCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  // Search products
  static async searchProducts(
    searchTerm: string, 
    options: {
      sellerId?: string;
      category?: string;
      limit?: number;
    } = {}
  ): Promise<{ products: Product[]; lastDoc: any; hasMore: boolean }> {
    try {
      // Simple text search - in production, use Algolia or similar
      let q = query(
        this.productsRef,
        where('status', '==', 'active'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(options.limit || 20)
      );

      if (options.sellerId) {
        q = query(q, where('sellerId', '==', options.sellerId));
      }

      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === (options.limit || 20)
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Update inventory
  static async updateInventory(productId: string, quantityChange: number): Promise<void> {
    try {
      const product = await this.getProduct(productId);
      if (!product) throw new Error('Product not found');

      const newQuantity = product.inventory.quantity + quantityChange;
      
      await this.updateProduct(productId, {
        inventory: {
          ...product.inventory,
          quantity: Math.max(0, newQuantity)
        },
        status: newQuantity <= 0 ? 'out_of_stock' : product.status
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error('Failed to update inventory');
    }
  }

  // Get bulk upload template
  static getBulkUploadTemplate(): BulkUploadTemplate {
    return {
      fields: [
        'title', 'description', 'price', 'originalPrice', 'category', 'subcategory',
        'tags', 'quantity', 'sku', 'lowStockThreshold', 'weight', 'length', 'width', 
        'height', 'shippingClass', 'images', 'specifications'
      ],
      requiredFields: ['title', 'description', 'price', 'category', 'quantity'],
      sampleData: {
        title: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 299.99,
        originalPrice: 399.99,
        category: "Electronics",
        subcategory: "Audio",
        tags: "wireless, headphones, bluetooth, noise-cancelling",
        quantity: 50,
        sku: "WH-001",
        lowStockThreshold: 5,
        weight: 0.5,
        length: 20,
        width: 15,
        height: 8,
        shippingClass: "standard",
        images: "https://example.com/image1.jpg,https://example.com/image2.jpg"
      }
    };
  }
}