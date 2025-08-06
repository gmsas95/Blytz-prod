// Simple demo data seeder for Firebase
const admin = require('firebase-admin');

// Initialize Firebase Admin (make sure you have firebase-admin-key.json)
try {
  const serviceAccount = require('./firebase-admin-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ firebase-admin-key.json not found. Please create it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

// Demo data structure
const demoData = {
  liveStreams: [
    {
      id: 'live_1',
      title: 'Vintage Designer Collection',
      sellerId: 'demo_seller_1',
      sellerName: 'Vintage Vibes',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_1', 'prod_2', 'prod_3'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      viewers: 1847,
      category: 'Fashion',
      currentBid: 45.0,
      productCount: 3,
      playbackUrl: 'https://d6dls1du0mnyv.cloudfront.net/out/v1/1e5a2b2d4e4c4b5f8e7c9f8e7c9f8e7c/index.m3u8',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'live_2',
      title: 'Gaming Gear Live Auction',
      sellerId: 'demo_seller_2',
      sellerName: 'Tech Deals',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_4', 'prod_5', 'prod_6'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 3264,
      category: 'Electronics',
      currentBid: 127.5,
      productCount: 3,
      playbackUrl: 'https://d6dls1du0mnyv.cloudfront.net/out/v1/2f5a3c4d5e6f7a8b9c0d1e2f3a4b5c6d/index.m3u8',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'live_3',
      title: 'Handmade Jewelry Showcase',
      sellerId: 'demo_seller_3',
      sellerName: 'Artisan Crafts',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_7', 'prod_8'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      viewers: 892,
      category: 'Jewelry',
      currentBid: 28.0,
      productCount: 2,
      playbackUrl: 'https://d6dls1du0mnyv.cloudfront.net/out/v1/3g6b4d5e7f8a9c0b1d2e3f4a5b6c7d8e/index.m3u8',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  featuredStreams: [
    {
      id: 'featured_1',
      streamId: 'live_1',
      title: 'Vintage Designer Collection',
      sellerName: 'Vintage Vibes',
      viewers: 2847,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      category: 'Fashion',
      priority: 1,
      createdAt: new Date()
    },
    {
      id: 'featured_2',
      streamId: 'live_2',
      title: 'Gaming Gear Live',
      sellerName: 'Tech Deals',
      viewers: 5639,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      category: 'Electronics',
      priority: 2,
      createdAt: new Date()
    },
    {
      id: 'featured_3',
      streamId: 'live_3',
      title: 'Handmade Jewelry',
      sellerName: 'Artisan Crafts',
      viewers: 892,
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      category: 'Jewelry',
      priority: 3,
      createdAt: new Date()
    }
  ],

  products: [
    {
      id: 'prod_1',
      name: 'Vintage 70s Leather Jacket',
      description: 'Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches.',
      price: 85.0,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
      sellerId: 'demo_seller_1',
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
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_2',
      name: 'Vintage Gucci Handbag',
      description: 'Classic Gucci bamboo handle handbag from the 1980s. Authentic with serial number.',
      price: 120.0,
      startingPrice: 75.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: 'demo_seller_1',
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
      auctionEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_3',
      name: 'Vintage 60s Silk Scarf',
      description: 'Beautiful silk scarf with psychedelic patterns from the 1960s.',
      price: 35.0,
      startingPrice: 15.0,
      currentPrice: 28.0,
      reservePrice: 30.0,
      sellerId: 'demo_seller_1',
      category: 'Vintage Accessories',
      images: [
        'https://images.unsplash.com/photo-1601370552761-d129028bd833?w=400&h=400&fit=crop'
      ],
      condition: 'good',
      brand: 'Hermès',
      color: 'Multi-color',
      material: 'Silk',
      tags: ['vintage', 'scarf', 'silk', '60s'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_4',
      name: 'Gaming Headset RGB',
      description: 'Professional gaming headset with 7.1 surround sound and RGB lighting.',
      price: 89.99,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 75.0,
      sellerId: 'demo_seller_2',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Razer',
      color: 'Black',
      tags: ['gaming', 'headset', 'rgb', 'surround'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_5',
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical gaming keyboard with blue switches and programmable keys.',
      price: 129.99,
      startingPrice: 65.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: 'demo_seller_2',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Corsair',
      color: 'Black',
      tags: ['gaming', 'keyboard', 'mechanical', 'rgb'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod_6',
      name: 'Wireless Gaming Mouse',
      description: 'High-precision wireless gaming mouse with 20,000 DPI sensor.',
      price: 79.99,
      startingPrice: 40.0,
      currentPrice: 62.5,
      reservePrice: 70.0,
      sellerId: 'demo_seller_2',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'
      ],
      condition: 'new',
      brand: 'Logitech',
      color: 'Black',
      tags: ['gaming', 'mouse', 'wireless', 'precision'],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  users: [
    {
      uid: 'demo_seller_1',
      email: 'vintage@demo.com',
      displayName: 'Vintage Vibes',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567890',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: 'demo_seller_2',
      email: 'tech@demo.com',
      displayName: 'Tech Deals',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567891',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: 'demo_seller_3',
      email: 'artisan@demo.com',
      displayName: 'Artisan Crafts',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567892',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  sellers: [
    {
      id: 'demo_seller_1',
      userId: 'demo_seller_1',
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
      id: 'demo_seller_2',
      userId: 'demo_seller_2',
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
      id: 'demo_seller_3',
      userId: 'demo_seller_3',
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
  console.log('🌱 Seeding demo data...');

  try {
    // Add live streams
    console.log('📺 Adding live streams...');
    for (const stream of demoData.liveStreams) {
      await db.collection('liveStreams').doc(stream.id).set(stream);
      console.log(`✅ Added: ${stream.title}`);
    }

    // Add featured streams
    console.log('⭐ Adding featured streams...');
    for (const featured of demoData.featuredStreams) {
      await db.collection('featuredStreams').doc(featured.id).set(featured);
      console.log(`✅ Added featured: ${featured.title}`);
    }

    // Add products
    console.log('📦 Adding products...');
    for (const product of demoData.products) {
      await db.collection('products').doc(product.id).set(product);
      console.log(`✅ Added product: ${product.name}`);
    }

    // Add users
    console.log('👤 Adding users...');
    for (const user of demoData.users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`✅ Added user: ${user.displayName}`);
    }

    // Add sellers
    console.log('🏪 Adding sellers...');
    for (const seller of demoData.sellers) {
      await db.collection('sellers').doc(seller.id).set(seller);
      console.log(`✅ Added seller: ${seller.businessName}`);
    }

    console.log('🎉 Demo data seeded successfully!');
    console.log('\n📱 Test the app with these live streams:');
    console.log('   - live_1: Vintage Designer Collection');
    console.log('   - live_2: Gaming Gear Live Auction');
    console.log('   - live_3: Handmade Jewelry Showcase');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }
}

// Run the seeder
seedDemoData();