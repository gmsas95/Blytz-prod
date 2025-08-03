const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config - update with your actual config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo data
const demoData = {
  users: [
    {
      uid: 'seller_1',
      email: 'vintagevibes@demo.com',
      displayName: 'Vintage Vibes',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567890',
      role: 'seller',
      isVerified: true,
      rating: 4.8,
      totalSales: 2847,
      followers: 15234,
      following: 89,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      uid: 'seller_2',
      email: 'techdeals@demo.com',
      displayName: 'Tech Deals',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567891',
      role: 'seller',
      isVerified: true,
      rating: 4.9,
      totalSales: 5639,
      followers: 28471,
      following: 156,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      uid: 'seller_3',
      email: 'artisan@demo.com',
      displayName: 'Artisan Crafts',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567892',
      role: 'seller',
      isVerified: true,
      rating: 4.7,
      totalSales: 1234,
      followers: 8923,
      following: 234,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      uid: 'seller_4',
      email: 'bookworm@demo.com',
      displayName: 'Bookworm Finds',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567893',
      role: 'seller',
      isVerified: true,
      rating: 4.9,
      totalSales: 892,
      followers: 5672,
      following: 123,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      uid: 'seller_5',
      email: 'sports@demo.com',
      displayName: 'Sports Memorabilia',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567894',
      role: 'seller',
      isVerified: true,
      rating: 4.8,
      totalSales: 2156,
      followers: 18472,
      following: 198,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      uid: 'seller_6',
      email: 'homedecor@demo.com',
      displayName: 'Home Decor Pro',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567895',
      role: 'seller',
      isVerified: true,
      rating: 4.6,
      totalSales: 1423,
      followers: 11234,
      following: 167,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  sellers: [
    {
      id: 'seller_1',
      userId: 'seller_1',
      businessName: 'Vintage Vibes Emporium',
      businessDescription: 'Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor.',
      businessLogo: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop',
      businessCategory: 'Vintage & Collectibles',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Vintage Vibes LLC',
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        routingNumber: '****5678'
      },
      taxId: '12-3456789',
      totalSales: 2847,
      rating: 4.8,
      followers: 15234,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'seller_2',
      userId: 'seller_2',
      businessName: 'Tech Deals Hub',
      businessDescription: 'Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified.',
      businessLogo: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
      businessCategory: 'Electronics & Gaming',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Tech Deals Inc',
        bankName: 'Bank of America',
        accountNumber: '****5678',
        routingNumber: '****9012'
      },
      taxId: '98-7654321',
      totalSales: 5639,
      rating: 4.9,
      followers: 28471,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'seller_3',
      userId: 'seller_3',
      businessName: 'Artisan Craft Studio',
      businessDescription: 'Handcrafted jewelry and accessories made with love. Each piece is unique and tells a story.',
      businessLogo: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
      businessCategory: 'Handmade & Artisan',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Artisan Crafts Co',
        bankName: 'Wells Fargo',
        accountNumber: '****3456',
        routingNumber: '****7890'
      },
      taxId: '34-5678901',
      totalSales: 1234,
      rating: 4.7,
      followers: 8923,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'seller_4',
      userId: 'seller_4',
      businessName: 'Bookworm Finds',
      businessDescription: 'Rare and collectible books, first editions, and literary treasures from around the world.',
      businessLogo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop',
      businessCategory: 'Books & Literature',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Bookworm Finds LLC',
        bankName: 'Citibank',
        accountNumber: '****7890',
        routingNumber: '****1234'
      },
      taxId: '56-7890123',
      totalSales: 892,
      rating: 4.9,
      followers: 5672,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'seller_5',
      userId: 'seller_5',
      businessName: 'Sports Memorabilia Central',
      businessDescription: 'Authentic signed sports memorabilia, trading cards, and collectibles. Certificate of authenticity included.',
      businessLogo: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=200&h=200&fit=crop',
      businessCategory: 'Sports & Memorabilia',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Sports Central Inc',
        bankName: 'Chase Bank',
        accountNumber: '****2345',
        routingNumber: '****4321'
      },
      taxId: '78-9012345',
      totalSales: 2156,
      rating: 4.8,
      followers: 18472,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'seller_6',
      userId: 'seller_6',
      businessName: 'Vintage Home Decor',
      businessDescription: 'Curated vintage home decor and furniture. Transform your space with timeless pieces.',
      businessLogo: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop',
      businessCategory: 'Home & Garden',
      verificationStatus: 'verified',
      bankAccount: {
        accountHolderName: 'Vintage Home LLC',
        bankName: 'Bank of America',
        accountNumber: '****6789',
        routingNumber: '****5678'
      },
      taxId: '90-1234567',
      totalSales: 1423,
      rating: 4.6,
      followers: 11234,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  products: [
    // Vintage Vibes Products
    {
      id: 'prod_1',
      name: 'Vintage 70s Leather Jacket',
      description: 'Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches.',
      price: 85.0,
      startingPrice: 45.0,
      currentPrice: 67.5,
      sellerId: 'seller_1',
      category: 'Vintage Clothing',
      images: [
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop'
      ],
      condition: 'excellent',
      brand: 'Harley Davidson',
      size: 'L',
      color: 'Brown',
      material: 'Genuine Leather',
      tags: ['vintage', 'leather', 'motorcycle', '70s'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'prod_2',
      name: 'Vintage Gucci Handbag',
      description: 'Classic Gucci bamboo handle handbag from the 1980s. Authentic with serial number.',
      price: 120.0,
      startingPrice: 75.0,
      currentPrice: 95.0,
      sellerId: 'seller_1',
      category: 'Vintage Accessories',
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1590739241834-04c8a4597819?w=400&h=400&fit=crop'
      ],
      condition: 'very_good',
      brand: 'Gucci',
      color: 'Brown',
      material: 'Leather',
      tags: ['vintage', 'gucci', 'handbag', 'luxury'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    // Add more products...
  ],

  liveStreams: [
    {
      id: 'stream_1',
      title: 'Authentic 70s Collection',
      sellerId: 'seller_1',
      sellerName: 'Vintage Vibes',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      startTime: serverTimestamp(),
      status: 'live',
      productIds: ['prod_1', 'prod_2'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      viewers: 1847,
      category: 'Vintage',
      currentBid: 45.0,
      productCount: 2,
      playbackUrl: 'https://d23dyx6b8k.mp4/live/stream1.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'stream_2',
      title: 'Gaming Gear Auction',
      sellerId: 'seller_2',
      sellerName: 'Tech Deals',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: serverTimestamp(),
      status: 'live',
      productIds: ['prod_3', 'prod_4'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 3264,
      category: 'Electronics',
      currentBid: 127.5,
      productCount: 2,
      playbackUrl: 'https://d23dyx6b8k.mp4/live/stream2.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  featuredStreams: [
    {
      id: 'featured_1',
      streamId: 'stream_1',
      title: 'Vintage Designer Collection',
      sellerName: 'Vintage Vibes',
      viewers: 2847,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      category: 'Fashion',
      priority: 1,
      createdAt: serverTimestamp()
    },
    {
      id: 'featured_2',
      streamId: 'stream_2',
      title: 'Rare Sneaker Drop',
      sellerName: 'Tech Deals',
      viewers: 5639,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      category: 'Sneakers',
      priority: 2,
      createdAt: serverTimestamp()
    }
  ],

  auctions: [
    {
      id: 'auction_1',
      productId: 'prod_1',
      sellerId: 'seller_1',
      title: 'Vintage 70s Leather Jacket',
      description: 'Authentic 1970s brown leather motorcycle jacket',
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
      startTime: serverTimestamp(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'active',
      totalBids: 8,
      viewers: 1847,
      images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop'],
      category: 'Vintage Clothing',
      tags: ['vintage', 'leather', 'motorcycle'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ]
};

async function populateComprehensiveDemoData() {
  try {
    console.log('🚀 Starting comprehensive demo data population...');

    // Add users
    console.log('👥 Adding users...');
    for (const user of demoData.users) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, user);
      console.log(`✅ Added user: ${user.displayName}`);
    }

    // Add sellers
    console.log('🏪 Adding sellers...');
    for (const seller of demoData.sellers) {
      const sellerRef = doc(db, 'sellers', seller.id);
      await setDoc(sellerRef, seller);
      console.log(`✅ Added seller: ${seller.businessName}`);
    }

    // Add products
    console.log('📦 Adding products...');
    for (const product of demoData.products) {
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, product);
      console.log(`✅ Added product: ${product.name}`);
    }

    // Add live streams
    console.log('📺 Adding live streams...');
    for (const stream of demoData.liveStreams) {
      const streamRef = doc(db, 'liveStreams', stream.id);
      await setDoc(streamRef, stream);
      console.log(`✅ Added stream: ${stream.title}`);
    }

    // Add featured streams
    console.log('⭐ Adding featured streams...');
    for (const featured of demoData.featuredStreams) {
      const featuredRef = doc(db, 'featuredStreams', featured.id);
      await setDoc(featuredRef, featured);
      console.log(`✅ Added featured: ${featured.title}`);
    }

    // Add auctions
    console.log('🏛️ Adding auctions...');
    for (const auction of demoData.auctions) {
      const auctionRef = doc(db, 'auctions', auction.id);
      await setDoc(auctionRef, auction);
      console.log(`✅ Added auction: ${auction.title}`);
    }

    console.log('🎉 All comprehensive demo data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating demo data:', error);
  }
}

// Run the population
populateComprehensiveDemoData();