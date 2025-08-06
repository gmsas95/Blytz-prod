// Demo data seeder with environment loading
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Use environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Config Loaded:');
console.log('   Project ID:', firebaseConfig.projectId);
console.log('   Auth Domain:', firebaseConfig.authDomain);

if (!firebaseConfig.projectId) {
  console.error('❌ Missing Firebase configuration. Please check your .env file');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Comprehensive demo data
const demoData = {
  liveStreams: [
    {
      id: 'stream_001',
      title: '🔥 Vintage Designer Collection LIVE',
      sellerId: 'seller_vintage_001',
      sellerName: 'Vintage Vibes',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_vintage_001', 'prod_vintage_002', 'prod_vintage_003'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      viewers: 1847,
      category: 'Vintage Fashion',
      currentBid: 45.0,
      productCount: 3,
      playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'stream_002',
      title: '🎮 Gaming Gear Auction LIVE',
      sellerId: 'seller_tech_001',
      sellerName: 'Tech Deals Hub',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_tech_001', 'prod_tech_002', 'prod_tech_003'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 3264,
      category: 'Electronics',
      currentBid: 127.5,
      productCount: 3,
      playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'stream_003',
      title: '💎 Handmade Jewelry Showcase',
      sellerId: 'seller_artisan_001',
      sellerName: 'Artisan Crafts',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_jewelry_001', 'prod_jewelry_002'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      viewers: 892,
      category: 'Handmade',
      currentBid: 28.0,
      productCount: 2,
      playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.Y7d7TkuqZ9dR.m3u8',
      isFeatured: false,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  featuredStreams: [
    {
      id: 'featured_001',
      streamId: 'stream_001',
      title: '🔥 Vintage Designer Collection',
      sellerName: 'Vintage Vibes',
      viewers: 2847,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      category: 'Fashion',
      priority: 1,
      createdAt: new Date()
    },
    {
      id: 'featured_002',
      streamId: 'stream_002',
      title: '🎮 Gaming Gear Live',
      sellerName: 'Tech Deals Hub',
      viewers: 5639,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      category: 'Electronics',
      priority: 2,
      createdAt: new Date()
    },
    {
      id: 'featured_003',
      streamId: 'stream_003',
      title: '💎 Handmade Treasures',
      sellerName: 'Artisan Crafts',
      viewers: 892,
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      category: 'Handmade',
      priority: 3,
      createdAt: new Date()
    }
  ],

  products: [
    // Vintage Products
    {
      id: 'prod_vintage_001',
      name: 'Vintage 70s Leather Jacket',
      description: 'Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.',
      price: 85.0,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
      sellerId: 'seller_vintage_001',
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
      tags: ['vintage', 'leather', 'motorcycle', '70s', 'biker'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_vintage_002',
      name: 'Vintage Gucci Bamboo Handbag',
      description: 'Classic Gucci bamboo handle handbag from the 1980s. Authentic with serial number and dust bag.',
      price: 120.0,
      startingPrice: 75.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: 'seller_vintage_001',
      category: 'Vintage Accessories',
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1590739241834-04c8a4597819?w=400&h=400&fit=crop'
      ],
      condition: 'very_good',
      brand: 'Gucci',
      color: 'Brown',
      material: 'Leather',
      tags: ['vintage', 'gucci', 'handbag', 'luxury', 'bamboo'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_vintage_003',
      name: 'Vintage 60s Silk Scarf',
      description: 'Beautiful silk scarf with psychedelic patterns from the 1960s. Rare collectible piece.',
      price: 35.0,
      startingPrice: 15.0,
      currentPrice: 28.0,
      reservePrice: 30.0,
      sellerId: 'seller_vintage_001',
      category: 'Vintage Accessories',
      images: [
        'https://images.unsplash.com/photo-1601370552761-d129028bd833?w=400&h=400&fit=crop'
      ],
      condition: 'good',
      brand: 'Hermès',
      color: 'Multi-color',
      material: 'Silk',
      tags: ['vintage', 'scarf', 'silk', '60s', 'psychedelic'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Tech Products
    {
      id: 'prod_tech_001',
      name: 'Razer Gaming Headset RGB',
      description: 'Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.',
      price: 89.99,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 75.0,
      sellerId: 'seller_tech_001',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Razer',
      color: 'Black',
      tags: ['gaming', 'headset', 'rgb', 'surround', 'razer'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_tech_002',
      name: 'Corsair RGB Mechanical Keyboard',
      description: 'RGB mechanical gaming keyboard with blue switches and programmable keys. Perfect for gaming and typing.',
      price: 129.99,
      startingPrice: 65.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: 'seller_tech_001',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Corsair',
      color: 'Black',
      tags: ['gaming', 'keyboard', 'mechanical', 'rgb', 'corsair'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_tech_003',
      name: 'Logitech Wireless Gaming Mouse',
      description: 'High-precision wireless gaming mouse with 20,000 DPI sensor and customizable RGB lighting.',
      price: 79.99,
      startingPrice: 40.0,
      currentPrice: 62.5,
      reservePrice: 70.0,
      sellerId: 'seller_tech_001',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Logitech',
      color: 'Black',
      tags: ['gaming', 'mouse', 'wireless', 'precision', 'logitech'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  users: [
    {
      uid: 'seller_vintage_001',
      email: 'vintage@demo.com',
      displayName: 'Vintage Vibes',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567890',
      emailVerified: true,
      role: 'seller',
      isVerified: true,
      rating: 4.8,
      totalSales: 2847,
      followers: 15234,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: 'seller_tech_001',
      email: 'tech@demo.com',
      displayName: 'Tech Deals Hub',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567891',
      emailVerified: true,
      role: 'seller',
      isVerified: true,
      rating: 4.9,
      totalSales: 5639,
      followers: 28471,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: 'seller_artisan_001',
      email: 'artisan@demo.com',
      displayName: 'Artisan Crafts',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567892',
      emailVerified: true,
      role: 'seller',
      isVerified: true,
      rating: 4.7,
      totalSales: 1234,
      followers: 8923,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  sellers: [
    {
      id: 'seller_vintage_001',
      userId: 'seller_vintage_001',
      businessName: 'Vintage Vibes Emporium',
      businessDescription: 'Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor.',
      businessLogo: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop',
      businessCategory: 'Vintage & Collectibles',
      verificationStatus: 'verified',
      totalSales: 2847,
      rating: 4.8,
      followers: 15234,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'seller_tech_001',
      userId: 'seller_tech_001',
      businessName: 'Tech Deals Hub',
      businessDescription: 'Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified.',
      businessLogo: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
      businessCategory: 'Electronics & Gaming',
      verificationStatus: 'verified',
      totalSales: 5639,
      rating: 4.9,
      followers: 28471,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'seller_artisan_001',
      userId: 'seller_artisan_001',
      businessName: 'Artisan Craft Studio',
      businessDescription: 'Handcrafted jewelry and accessories made with love. Each piece is unique and tells a story.',
      businessLogo: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
      businessCategory: 'Handmade & Artisan',
      verificationStatus: 'verified',
      totalSales: 1234,
      rating: 4.7,
      followers: 8923,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

async function seedDemoData() {
  console.log('🚀 Starting comprehensive demo data seeding...');
  console.log('📊 Data to be seeded:');
  console.log(`   • ${demoData.liveStreams.length} live streams`);
  console.log(`   • ${demoData.featuredStreams.length} featured streams`);
  console.log(`   • ${demoData.products.length} products`);
  console.log(`   • ${demoData.users.length} users`);
  console.log(`   • ${demoData.sellers.length} sellers`);

  try {
    // Seed collections in order to avoid dependency issues
    const collections = [
      { name: 'users', data: demoData.users },
      { name: 'sellers', data: demoData.sellers },
      { name: 'products', data: demoData.products },
      { name: 'liveStreams', data: demoData.liveStreams },
      { name: 'featuredStreams', data: demoData.featuredStreams }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const collection of collections) {
      console.log(`\n📦 Seeding ${collection.name}...`);
      
      for (const item of collection.data) {
        try {
          const docRef = doc(db, collection.name, item.id);
          await setDoc(docRef, item);
          console.log(`   ✅ ${collection.name}/${item.id}`);
          successCount++;
        } catch (error) {
          console.error(`   ❌ ${collection.name}/${item.id}: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n🎉 Demo data seeding completed!`);
    console.log(`   ✅ Success: ${successCount} documents`);
    console.log(`   ❌ Errors: ${errorCount} documents`);
    
    console.log('\n📱 You can now test the app with:');
    console.log('   • Live streams: stream_001, stream_002, stream_003');
    console.log('   • Featured content: featured_001, featured_002, featured_003');
    console.log('   • Products: prod_vintage_001-003, prod_tech_001-003');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify Firebase config in .env');
    console.log('   3. Ensure Firestore is enabled in Firebase Console');
    console.log('   4. Check Firestore rules allow writes');
  }
}

// Run the seeder
seedDemoData();