// Quick Firebase Admin SDK script to populate demo data
// This assumes you have a service account key

const admin = require('firebase-admin');
const fs = require('fs');

// Simple demo data for livestreams collection
const demoData = {
  livestreams: {
    "stream_001": {
      id: "stream_001",
      title: "🔥 Vintage Designer Collection LIVE",
      sellerId: "seller_vintage_001",
      sellerName: "Vintage Vibes",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      startTime: new Date(),
      status: "live",
      productIds: ["prod_vintage_001"],
      thumbnailUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
      viewers: 1847,
      category: "Vintage Fashion",
      currentBid: 67.5,
      productCount: 1,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8",
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "stream_002": {
      id: "stream_002",
      title: "🎮 Gaming Gear Auction LIVE",
      sellerId: "seller_tech_001",
      sellerName: "Tech Deals Hub",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      startTime: new Date(),
      status: "live",
      productIds: ["prod_tech_001"],
      thumbnailUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      viewers: 3264,
      category: "Electronics",
      currentBid: 95,
      productCount: 1,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
      isFeatured: true,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
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
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  products: {
    "prod_vintage_001": {
      id: "prod_vintage_001",
      name: "Vintage 70s Leather Jacket",
      description: "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.",
      price: 85,
      startingPrice: 45,
      currentPrice: 67.5,
      reservePrice: 80,
      sellerId: "seller_vintage_001",
      category: "Vintage Clothing",
      images: ["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop", "https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop"],
      condition: "excellent",
      brand: "Harley Davidson",
      size: "L",
      color: "Brown",
      material: "Genuine Leather",
      tags: ["vintage", "leather", "motorcycle", "70s", "biker"],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "prod_tech_001": {
      id: "prod_tech_001",
      name: "Razer Gaming Headset RGB",
      description: "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.",
      price: 89.99,
      startingPrice: 45,
      currentPrice: 67.5,
      reservePrice: 75,
      sellerId: "seller_tech_001",
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"],
      condition: "new",
      brand: "Razer",
      color: "Black",
      tags: ["gaming", "headset", "rgb", "surround", "razer"],
      isActive: true,
      auctionEndTime: new Date(Date.now() + 90 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
};

console.log('🔥 Creating demo data for livestreams...');

// Check if service account exists
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.log('❌ No service account found. Creating manual scripts...');
  
  // Create manual Firebase Console instructions
  const instructions = `
# Manual Firebase Console Data Population

## Quick Steps:
1. Go to https://console.firebase.google.com/project/blytz-e9935/firestore/data
2. Click "Start collection" for each collection below

## Collections to create:

### 1. users collection
Collection: users
Document ID: seller_vintage_001
{
  "uid": "seller_vintage_001",
  "email": "vintage@demo.com",
  "displayName": "Vintage Vibes",
  "photoURL": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  "phoneNumber": "+1234567890",
  "emailVerified": true,
  "role": "seller",
  "isVerified": true,
  "rating": 4.8,
  "totalSales": 2847,
  "followers": 15234,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}

Document ID: seller_tech_001
{
  "uid": "seller_tech_001",
  "email": "tech@demo.com",
  "displayName": "Tech Deals Hub",
  "photoURL": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
  "phoneNumber": "+1234567891",
  "emailVerified": true,
  "role": "seller",
  "isVerified": true,
  "rating": 4.9,
  "totalSales": 5639,
  "followers": 28471,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}

### 2. livestreams collection
Collection: livestreams
Document ID: stream_001
{
  "id": "stream_001",
  "title": "🔥 Vintage Designer Collection LIVE",
  "sellerId": "seller_vintage_001",
  "sellerName": "Vintage Vibes",
  "sellerAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  "startTime": 1704067200000,
  "status": "live",
  "productIds": ["prod_vintage_001"],
  "thumbnailUrl": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
  "viewers": 1847,
  "category": "Vintage Fashion",
  "currentBid": 67.5,
  "productCount": 1,
  "playbackUrl": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8",
  "isFeatured": true,
  "duration": 0,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}

Document ID: stream_002
{
  "id": "stream_002",
  "title": "🎮 Gaming Gear Auction LIVE",
  "sellerId": "seller_tech_001",
  "sellerName": "Tech Deals Hub",
  "sellerAvatar": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
  "startTime": 1704067200000,
  "status": "live",
  "productIds": ["prod_tech_001"],
  "thumbnailUrl": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
  "viewers": 3264,
  "category": "Electronics",
  "currentBid": 95,
  "productCount": 1,
  "playbackUrl": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
  "isFeatured": true,
  "duration": 0,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}

After creating these documents, restart your app and the HomeScreen should load the demo streams!`;
  
  fs.writeFileSync('MANUAL_POPULATE.md', instructions);
  console.log('📋 Manual instructions created: MANUAL_POPULATE.md');
  process.exit(0);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateData() {
  console.log('🚀 Populating Firestore with demo data...');
  
  try {
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
    console.log('🚀 Restart your app - HomeScreen should now load streams!');
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
  } finally {
    process.exit(0);
  }
}

populateData();