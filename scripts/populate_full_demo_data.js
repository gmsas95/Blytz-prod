const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// Demo data
const demoData = {
  users: [
    {
      uid: 'seller_1',
      email: 'vintagevibes@demo.com',
      displayName: 'Vintage Vibes',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567890',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'seller_2',
      email: 'techdeals@demo.com',
      displayName: 'Tech Deals',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567891',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'seller_3',
      email: 'artisan@demo.com',
      displayName: 'Artisan Crafts',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567892',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'seller_4',
      email: 'bookworm@demo.com',
      displayName: 'Bookworm Finds',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567893',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'seller_5',
      email: 'sports@demo.com',
      displayName: 'Sports Memorabilia',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567894',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'seller_6',
      email: 'homedecor@demo.com',
      displayName: 'Home Decor Pro',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567895',
      emailVerified: true,
      customClaims: { seller: true }
    },
    {
      uid: 'user_1',
      email: 'bidder1@demo.com',
      displayName: 'Sarah Johnson',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567801',
      emailVerified: true
    },
    {
      uid: 'user_2',
      email: 'bidder2@demo.com',
      displayName: 'Mike Chen',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567802',
      emailVerified: true
    },
    {
      uid: 'user_3',
      email: 'bidder3@demo.com',
      displayName: 'Emma Wilson',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567803',
      emailVerified: true
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
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date()
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
      reservePrice: 80.0,
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
      auctionEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Tech Deals Products
    {
      id: 'prod_3',
      name: 'Gaming Headset RGB',
      description: 'Professional gaming headset with 7.1 surround sound and RGB lighting.',
      price: 89.99,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 75.0,
      sellerId: 'seller_2',
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
      id: 'prod_4',
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical gaming keyboard with blue switches and programmable keys.',
      price: 129.99,
      startingPrice: 65.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: 'seller_2',
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
    }
  ],

  liveStreams: [
    {
      id: 'stream_1',
      title: 'Authentic 70s Collection',
      sellerId: 'seller_1',
      sellerName: 'Vintage Vibes',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_1', 'prod_2'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      viewers: 1847,
      category: 'Vintage',
      currentBid: 67.5,
      productCount: 2,
      playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'stream_2',
      title: 'Gaming Gear Auction',
      sellerId: 'seller_2',
      sellerName: 'Tech Deals',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(),
      status: 'live',
      productIds: ['prod_3', 'prod_4'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 3264,
      category: 'Electronics',
      currentBid: 95.0,
      productCount: 2,
      playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8',
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'stream_3',
      title: 'Coming Soon: Tech Showcase',
      sellerId: 'seller_2',
      sellerName: 'Tech Deals',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      status: 'scheduled',
      productIds: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 156,
      category: 'Electronics',
      currentBid: 0,
      productCount: 0,
      playbackUrl: '',
      isFeatured: false,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date()
    },
    {
      id: 'featured_2',
      streamId: 'stream_2',
      title: 'Gaming Gear Live',
      sellerName: 'Tech Deals',
      viewers: 5639,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      category: 'Electronics',
      priority: 2,
      createdAt: new Date()
    }
  ],

  auctions: [
    {
      id: 'auction_1',
      productId: 'prod_1',
      sellerId: 'seller_1',
      title: 'Vintage 70s Leather Jacket',
      description: 'Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches.',
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'active',
      totalBids: 8,
      viewers: 1847,
      images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop'],
      category: 'Vintage Clothing',
      tags: ['vintage', 'leather', 'motorcycle'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'auction_2',
      productId: 'prod_2',
      sellerId: 'seller_1',
      title: 'Vintage Gucci Handbag',
      description: 'Classic Gucci bamboo handle handbag from the 1980s.',
      startingPrice: 75.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'active',
      totalBids: 12,
      viewers: 1847,
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'],
      category: 'Vintage Accessories',
      tags: ['vintage', 'gucci', 'handbag'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  bids: [
    {
      id: 'bid_1',
      auctionId: 'auction_1',
      userId: 'user_1',
      amount: 50.0,
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'bid_2',
      auctionId: 'auction_1',
      userId: 'user_2',
      amount: 55.0,
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: 'bid_3',
      auctionId: 'auction_1',
      userId: 'user_3',
      amount: 67.5,
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    }
  ],

  chatMessages: [
    {
      id: 'chat_1',
      auctionId: 'auction_1',
      userId: 'user_1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=50&h=50&fit=crop&crop=face',
      text: 'Love this jacket! Is it original 70s?',
      createdAt: new Date(Date.now() - 20 * 60 * 1000)
    },
    {
      id: 'chat_2',
      auctionId: 'auction_1',
      userId: 'seller_1',
      userName: 'Vintage Vibes',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
      text: 'Yes! Authentic 1970s Harley Davidson. All original patches included.',
      createdAt: new Date(Date.now() - 19 * 60 * 1000)
    }
  ]
};

async function createUsers() {
  console.log('👥 Creating users...');
  for (const user of demoData.users) {
    try {
      await auth.createUser(user);
      if (user.customClaims) {
        await auth.setCustomUserClaims(user.uid, user.customClaims);
      }
      console.log(`✅ Created user: ${user.displayName}`);
    } catch (error) {
      console.log(`⚠️ User ${user.email} might already exist:`, error.message);
    }
  }
}

async function populateFirestore() {
  console.log('🔥 Populating Firestore...');

  const collections = [
    { name: 'users', data: demoData.users },
    { name: 'sellers', data: demoData.sellers },
    { name: 'products', data: demoData.products },
    { name: 'liveStreams', data: demoData.liveStreams },
    { name: 'featuredStreams', data: demoData.featuredStreams },
    { name: 'auctions', data: demoData.auctions }
  ];

  for (const collection of collections) {
    console.log(`📦 Adding ${collection.name}...`);
    for (const item of collection.data) {
      const ref = db.collection(collection.name).doc(item.id);
      await ref.set(item);
      console.log(`✅ Added ${collection.name}/${item.id}`);
    }
  }

  // Add bids as subcollection
  console.log('💰 Adding bids...');
  for (const bid of demoData.bids) {
    const ref = db.collection('auctions').doc(bid.auctionId).collection('bids').doc(bid.id);
    await ref.set(bid);
    console.log(`✅ Added bid: ${bid.id}`);
  }

  // Add chat messages as subcollection
  console.log('💬 Adding chat messages...');
  for (const message of demoData.chatMessages) {
    const ref = db.collection('auctions').doc(message.auctionId).collection('chatMessages').doc(message.id);
    await ref.set(message);
    console.log(`✅ Added chat: ${message.id}`);
  }
}

async function populateFullDemoData() {
  try {
    console.log('🚀 Starting full demo data population...');
    
    await createUsers();
    await populateFirestore();
    
    console.log('🎉 All demo data populated successfully!');
    console.log('📱 You can now test the app with:');
    console.log('   - Live streams: stream_1, stream_2');
    console.log('   - Products: prod_1, prod_2, prod_3, prod_4');
    console.log('   - Auctions: auction_1, auction_2');
    
  } catch (error) {
    console.error('❌ Error populating demo data:', error);
  }
}

// Run the population
populateFullDemoData();