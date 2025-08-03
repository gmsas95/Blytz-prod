const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with project ID
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const demoData = {
  users: {
    seller_vintage_001: {
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
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    },
    seller_tech_001: {
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
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    }
  },
  sellers: {
    seller_vintage_001: {
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
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    },
    seller_tech_001: {
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
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    }
  },
  products: {
    prod_vintage_001: {
      id: "prod_vintage_001",
      name: "Vintage 70s Leather Jacket",
      description: "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.",
      price: 85.0,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 80.0,
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
      auctionEndTime: new Date("2024-01-01T02:00:00.000Z"),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    },
    prod_tech_001: {
      id: "prod_tech_001",
      name: "Razer Gaming Headset RGB",
      description: "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.",
      price: 89.99,
      startingPrice: 45.0,
      currentPrice: 67.5,
      reservePrice: 75.0,
      sellerId: "seller_tech_001",
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"],
      condition: "new",
      brand: "Razer",
      color: "Black",
      tags: ["gaming", "headset", "rgb", "surround", "razer"],
      isActive: true,
      auctionEndTime: new Date("2024-01-01T01:30:00.000Z"),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    }
  },
  liveStreams: {
    stream_001: {
      id: "stream_001",
      title: "🔥 Vintage Designer Collection LIVE",
      sellerId: "seller_vintage_001",
      sellerName: "Vintage Vibes",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      startTime: new Date("2024-01-01T00:00:00.000Z"),
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
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    },
    stream_002: {
      id: "stream_002",
      title: "🎮 Gaming Gear Auction LIVE",
      sellerId: "seller_tech_001",
      sellerName: "Tech Deals Hub",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      startTime: new Date("2024-01-01T00:00:00.000Z"),
      status: "live",
      productIds: ["prod_tech_001"],
      thumbnailUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      viewers: 3264,
      category: "Electronics",
      currentBid: 95.0,
      productCount: 1,
      playbackUrl: "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
      isFeatured: true,
      duration: 0,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z")
    }
  },
  featuredStreams: {
    featured_001: {
      id: "featured_001",
      streamId: "stream_001",
      title: "🔥 Vintage Designer Collection",
      sellerName: "Vintage Vibes",
      viewers: 2847,
      thumbnailUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
      category: "Fashion",
      priority: 1,
      createdAt: new Date("2024-01-01T00:00:00.000Z")
    },
    featured_002: {
      id: "featured_002",
      streamId: "stream_002",
      title: "🎮 Gaming Gear Live",
      sellerName: "Tech Deals Hub",
      viewers: 5639,
      thumbnailUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      category: "Electronics",
      priority: 2,
      createdAt: new Date("2024-01-01T00:00:00.000Z")
    }
  }
};

async function populateDemoData() {
  console.log('🚀 Populating demo data...');
  
  try {
    for (const [collectionName, documents] of Object.entries(demoData)) {
      console.log(`📁 Adding ${Object.keys(documents).length} documents to ${collectionName}...`);
      
      for (const [docId, data] of Object.entries(documents)) {
        await db.collection(collectionName).doc(docId).set(data);
        console.log(`   ✓ ${collectionName}/${docId}`);
      }
    }
    
    console.log('🎉 Demo data populated successfully!');
  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

// Only run if service account key exists
const fs = require('fs');
if (fs.existsSync('./serviceAccountKey.json')) {
  populateDemoData().then(() => process.exit(0));
} else {
  console.log('❌ serviceAccountKey.json not found. Using Firebase CLI alternative...');
  
  // Alternative: Create a simple script for Firebase CLI
  const cliCommands = [];
  
  for (const [collectionName, documents] of Object.entries(demoData)) {
    for (const [docId, data] of Object.entries(documents)) {
      const jsonData = JSON.stringify(data).replace(/"/g, '\\"');
      cliCommands.push(`firebase firestore:set --project blytz-e9935 "${collectionName}/${docId}" "${jsonData}"`);
    }
  }
  
  console.log('📋 Copy and run these commands with Firebase CLI:');
  cliCommands.forEach(cmd => console.log(cmd));
  
  // Create a simple batch file
  const batchContent = `#!/bin/bash
echo "🚀 Populating demo data for Blytz..."

# Users
firebase firestore:set --project blytz-e9935 "users/seller_vintage_001" '{"uid":"seller_vintage_001","email":"vintage@demo.com","displayName":"Vintage Vibes","photoURL":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face","phoneNumber":"+1234567890","emailVerified":true,"role":"seller","isVerified":true,"rating":4.8,"totalSales":2847,"followers":15234,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

firebase firestore:set --project blytz-e9935 "users/seller_tech_001" '{"uid":"seller_tech_001","email":"tech@demo.com","displayName":"Tech Deals Hub","photoURL":"https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face","phoneNumber":"+1234567891","emailVerified":true,"role":"seller","isVerified":true,"rating":4.9,"totalSales":5639,"followers":28471,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

# Sellers
firebase firestore:set --project blytz-e9935 "sellers/seller_vintage_001" '{"id":"seller_vintage_001","userId":"seller_vintage_001","businessName":"Vintage Vibes Emporium","businessDescription":"Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor.","businessLogo":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop","businessCategory":"Vintage & Collectibles","verificationStatus":"verified","totalSales":2847,"rating":4.8,"followers":15234,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

firebase firestore:set --project blytz-e9935 "sellers/seller_tech_001" '{"id":"seller_tech_001","userId":"seller_tech_001","businessName":"Tech Deals Hub","businessDescription":"Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified.","businessLogo":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop","businessCategory":"Electronics & Gaming","verificationStatus":"verified","totalSales":5639,"rating":4.9,"followers":28471,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

# Products
firebase firestore:set --project blytz-e9935 "products/prod_vintage_001" '{"id":"prod_vintage_001","name":"Vintage 70s Leather Jacket","description":"Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.","price":85.0,"startingPrice":45.0,"currentPrice":67.5,"reservePrice":80.0,"sellerId":"seller_vintage_001","category":"Vintage Clothing","images":["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop","https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop"],"condition":"excellent","brand":"Harley Davidson","size":"L","color":"Brown","material":"Genuine Leather","tags":["vintage","leather","motorcycle","70s","biker"],"isActive":true,"auctionEndTime":"2024-01-01T02:00:00.000Z","createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

firebase firestore:set --project blytz-e9935 "products/prod_tech_001" '{"id":"prod_tech_001","name":"Razer Gaming Headset RGB","description":"Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.","price":89.99,"startingPrice":45.0,"currentPrice":67.5,"reservePrice":75.0,"sellerId":"seller_tech_001","category":"Electronics","images":["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop","https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"],"condition":"new","brand":"Razer","color":"Black","tags":["gaming","headset","rgb","surround","razer"],"isActive":true,"auctionEndTime":"2024-01-01T01:30:00.000Z","createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

# Live Streams
firebase firestore:set --project blytz-e9935 "liveStreams/stream_001" '{"id":"stream_001","title":"🔥 Vintage Designer Collection LIVE","sellerId":"seller_vintage_001","sellerName":"Vintage Vibes","sellerAvatar":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face","startTime":"2024-01-01T00:00:00.000Z","status":"live","productIds":["prod_vintage_001"],"thumbnailUrl":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop","viewers":1847,"category":"Vintage Fashion","currentBid":67.5,"productCount":1,"playbackUrl":"https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8","isFeatured":true,"duration":0,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

firebase firestore:set --project blytz-e9935 "liveStreams/stream_002" '{"id":"stream_002","title":"🎮 Gaming Gear Auction LIVE","sellerId":"seller_tech_001","sellerName":"Tech Deals Hub","sellerAvatar":"https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face","startTime":"2024-01-01T00:00:00.000Z","status":"live","productIds":["prod_tech_001"],"thumbnailUrl":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop","viewers":3264,"category":"Electronics","currentBid":95.0,"productCount":1,"playbackUrl":"https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8","isFeatured":true,"duration":0,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

# Featured Streams
firebase firestore:set --project blytz-e9935 "featuredStreams/featured_001" '{"id":"featured_001","streamId":"stream_001","title":"🔥 Vintage Designer Collection","sellerName":"Vintage Vibes","viewers":2847,"thumbnailUrl":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop","category":"Fashion","priority":1,"createdAt":"2024-01-01T00:00:00.000Z"}'

firebase firestore:set --project blytz-e9935 "featuredStreams/featured_002" '{"id":"featured_002","streamId":"stream_002","title":"🎮 Gaming Gear Live","sellerName":"Tech Deals Hub","viewers":5639,"thumbnailUrl":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop","category":"Electronics","priority":2,"createdAt":"2024-01-01T00:00:00.000Z"}'

echo "🎉 Demo data setup completed!"
echo "🚀 Start your app: npm start"
`;

  fs.writeFileSync('./populate_firebase_cli.sh', batchContent);
  fs.chmodSync('./populate_firebase_cli.sh', '755');
  
  console.log('📋 Created populate_firebase_cli.sh - run: ./populate_firebase_cli.sh');
  console.log('🎯 Alternative: Use Firebase Console → Firestore → Import JSON');
}