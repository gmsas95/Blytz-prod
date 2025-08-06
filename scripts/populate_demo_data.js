// Quick demo data population script for Blytz
// Run with: node populate_demo_data.js
// Requires: npm install firebase-admin

const admin = require('firebase-admin');

// Check if service account key exists
const fs = require('fs');
const path = require('path');

// Try to find service account key
let serviceAccountPath = null;
const possiblePaths = [
  './serviceAccountKey.json',
  '../serviceAccountKey.json',
  '../../serviceAccountKey.json'
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

if (!serviceAccountPath) {
  console.log('❌ serviceAccountKey.json not found');
  console.log('📋 To create demo data:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as serviceAccountKey.json in this directory');
  console.log('4. Run: npm install firebase-admin');
  console.log('5. Run: node populate_demo_data.js');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Demo data
const demoData = {
  users: {
    "seller_vintage_001": {
      uid: "seller_vintage_001",
      email: "vintage@demo.com",
      displayName: "Vintage Vibes",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      phoneNumber: "+1234567890",
      emailVerified: true,
      role: "seller",
      isVerified: true,
      rating: 4.8,
      totalSales: 2847,
      followers: 15234,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "seller_tech_001": {
      uid: "seller_tech_001",
      email: "tech@demo.com",
      displayName: "Tech Deals Hub",
      photoURL: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      phoneNumber: "+1234567891",
      emailVerified: true,
      role: "seller",
      isVerified: true,
      rating: 4.9,
      totalSales: 5639,
      followers: 28471,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "seller_artisan_001": {
      uid: "seller_artisan_001",
      email: "artisan@demo.com",
      displayName: "Artisan Crafts",
      photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      phoneNumber: "+1234567892",
      emailVerified: true,
      role: "seller",
      isVerified: true,
      rating: 4.7,
      totalSales: 1234,
      followers: 8923,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    }
  },
  sellers: {
    "seller_vintage_001": {
      id: "seller_vintage_001",
      userId: "seller_vintage_001",
      businessName: "Vintage Vibes Emporium",
      businessDescription: "Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor.",
      businessLogo: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop",
      businessCategory: "Vintage & Collectibles",
      verificationStatus: "verified",
      totalSales: 2847,
      rating: 4.8,
      followers: 15234,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "seller_tech_001": {
      id: "seller_tech_001",
      userId: "seller_tech_001",
      businessName: "Tech Deals Hub",
      businessDescription: "Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified.",
      businessLogo: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
      businessCategory: "Electronics & Gaming",
      verificationStatus: "verified",
      totalSales: 5639,
      rating: 4.9,
      followers: 28471,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "seller_artisan_001": {
      id: "seller_artisan_001",
      userId: "seller_artisan_001",
      businessName: "Artisan Craft Studio",
      businessDescription: "Handcrafted jewelry and accessories made with love. Each piece is unique and tells a story.",
      businessLogo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",
      businessCategory: "Handmade & Artisan",
      verificationStatus: "verified",
      totalSales: 1234,
      rating: 4.7,
      followers: 8923,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    }
  },
  products: {
    "prod_vintage_001": {
      id: "prod_vintage_001",
      name: "Vintage 70s Leather Jacket",
      description: "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.",
      price: 85.0,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
      sellerId: "seller_vintage_001",
      category: "Vintage Clothing",
      images: [
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop"
      ],
      condition: "excellent",
      brand: "Harley Davidson",
      size: "L",
      color: "Brown",
      material: "Genuine Leather",
      tags: ["vintage", "leather", "motorcycle", "70s", "biker"],
      isActive: true,
      auctionEndTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T02:00:00.000Z")),
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "prod_vintage_002": {
      id: "prod_vintage_002",
      name: "Vintage Gucci Bamboo Handbag",
      description: "Classic Gucci bamboo handle handbag from the 1980s. Authentic with serial number and dust bag.",
      price: 120.0,
      startingPrice: 75.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: "seller_vintage_001",
      category: "Vintage Accessories",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1590739241834-04c8a4597819?w=400&h=400&fit=crop"
      ],
      condition: "very_good",
      brand: "Gucci",
      color: "Brown",
      material: "Leather",
      tags: ["vintage", "gucci", "handbag", "luxury", "bamboo"],
      isActive: true,
      auctionEndTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T03:00:00.000Z")),
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "prod_tech_001": {
      id: "prod_tech_001",
      name: "Razer Gaming Headset RGB",
      description: "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.",
      price: 89.99,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 75.0,
      sellerId: "seller_tech_001",
      category: "Electronics",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"
      ],
      condition: "new",
      brand: "Razer",
      color: "Black",
      tags: ["gaming", "headset", "rgb", "surround", "razer"],
      isActive: true,
      auctionEndTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T01:30:00.000Z")),
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "prod_tech_002": {
      id: "prod_tech_002",
      name: "Corsair RGB Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard with blue switches and programmable keys. Perfect for gaming and typing.",
      price: 129.99,
      startingPrice: 65.0,
      currentPrice: 95.0,
      reservePrice: 110.0,
      sellerId: "seller_tech_001",
      category: "Electronics",
      images: [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop"
      ],
      condition: "new",
      brand: "Corsair",
      color: "Black",
      tags: ["gaming", "keyboard", "mechanical", "rgb", "corsair"],
      isActive: true,
      auctionEndTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T02:30:00.000Z")),
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    }
  },
  liveStreams: {
    "stream_001": {
      id: "stream_001",
      title: "🔥 Vintage Designer Collection LIVE",
      sellerId: "seller_vintage_001",
      sellerName: "Vintage Vibes",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      startTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      status: "live",
      productIds: ["prod_vintage_001", "prod_vintage_002"],
      thumbnailUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
      viewers: 1847,
      category: "Vintage Fashion",
      currentBid: 67.5,
      productCount: 2,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8",
      isFeatured: true,
      duration: 0,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "stream_002": {
      id: "stream_002",
      title: "🎮 Gaming Gear Auction LIVE",
      sellerId: "seller_tech_001",
      sellerName: "Tech Deals Hub",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      startTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      status: "live",
      productIds: ["prod_tech_001", "prod_tech_002"],
      thumbnailUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      viewers: 3264,
      category: "Electronics",
      currentBid: 95.0,
      productCount: 2,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
      isFeatured: true,
      duration: 0,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "stream_003": {
      id: "stream_003",
      title: "💎 Handmade Jewelry Showcase",
      sellerId: "seller_artisan_001",
      sellerName: "Artisan Crafts",
      sellerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      startTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      status: "live",
      productIds: ["prod_vintage_001"],
      thumbnailUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
      viewers: 892,
      category: "Handmade",
      currentBid: 28.0,
      productCount: 1,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.Y7d7TkuqZ9dR.m3u8",
      isFeatured: false,
      duration: 0,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    }
  },
  featuredStreams: {
    "featured_001": {
      id: "featured_001",
      streamId: "stream_001",
      title: "🔥 Vintage Designer Collection",
      sellerName: "Vintage Vibes",
      viewers: 2847,
      thumbnailUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
      category: "Fashion",
      priority: 1,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "featured_002": {
      id: "featured_002",
      streamId: "stream_002",
      title: "🎮 Gaming Gear Live",
      sellerName: "Tech Deals Hub",
      viewers: 5639,
      thumbnailUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      category: "Electronics",
      priority: 2,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    },
    "featured_003": {
      id: "featured_003",
      streamId: "stream_003",
      title: "💎 Handmade Treasures",
      sellerName: "Artisan Crafts",
      viewers: 892,
      thumbnailUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
      category: "Handmade",
      priority: 3,
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01"))
    }
  }
};

async function populateDemoData() {
  console.log('🚀 Populating Firestore with demo data...');
  
  try {
    // Create all collections and documents
    for (const [collectionName, documents] of Object.entries(demoData)) {
      console.log(`📁 Creating ${Object.keys(documents).length} documents in ${collectionName}...`);
      
      const batch = db.batch();
      
      for (const [docId, data] of Object.entries(documents)) {
        const docRef = db.collection(collectionName).doc(docId);
        batch.set(docRef, data);
      }
      
      await batch.commit();
      console.log(`✅ ${collectionName} populated successfully`);
    }
    
    console.log('🎉 All demo data populated successfully!');
    console.log('🚀 Now restart your Expo app - the HomeScreen should load streams!');
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the population
populateDemoData();