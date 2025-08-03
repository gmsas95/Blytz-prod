// Firebase Admin SDK script to populate Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z"))
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
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z"))
    }
  },
  livestreams: {
    stream_001: {
      id: "stream_001",
      title: "🔥 Vintage Designer Collection LIVE",
      sellerId: "seller_vintage_001",
      sellerName: "Vintage Vibes",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      startTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
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
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z"))
    },
    stream_002: {
      id: "stream_002",
      title: "🎮 Gaming Gear Auction LIVE",
      sellerId: "seller_tech_001",
      sellerName: "Tech Deals Hub",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      startTime: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
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
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z")),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-01T00:00:00.000Z"))
    }
  }
};

async function populateDemoData() {
  console.log('🚀 Populating Firestore with demo data...');
  
  try {
    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    const collections = ['users', 'sellers', 'products', 'livestreams', 'featuredstreams'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`✅ Cleared ${collectionName}`);
      } catch (error) {
        console.log(`ℹ️  ${collectionName} collection doesn't exist or is empty`);
      }
    }

    // Add demo data
    for (const [collectionName, documents] of Object.entries(demoData)) {
      console.log(`📁 Adding ${Object.keys(documents).length} documents to ${collectionName}...`);
      
      for (const [docId, data] of Object.entries(documents)) {
        await db.collection(collectionName).doc(docId).set(data);
        console.log(`   ✓ ${collectionName}/${docId}`);
      }
    }

    console.log('🎉 Demo data populated successfully!');
    console.log('🚀 Now restart your app - the HomeScreen should load streams successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Only run if service account exists
const fs = require('fs');
if (fs.existsSync('./serviceAccountKey.json')) {
  populateDemoData().then(() => process.exit(0));
} else {
  console.log('❌ serviceAccountKey.json not found in current directory');
  console.log('📋 To create demo data:');
  console.log('1. Generate serviceAccountKey.json from Firebase Console → Project Settings → Service Accounts');
  console.log('2. Save it in this directory');
  console.log('3. Run: npm install firebase-admin');
  console.log('4. Run: node create_demo_data.js');
  console.log('');
  console.log('🎯 Alternative: Use Firebase Console → Firestore → Add Collection');
  console.log('   Collection: livestreams');
  console.log('   Document: stream_001');
  console.log('   Fields: title="Vintage Collection LIVE", status="live", viewers=1847');
}