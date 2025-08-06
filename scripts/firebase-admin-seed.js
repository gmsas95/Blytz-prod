// Firebase Admin SDK script to seed demo data
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./blytz-e9935-firebase-adminsdk-fv7h1-9a1b2c3d4e.json'); // Replace with your service account file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'seller_2',
      email: 'techdeals@demo.com',
      displayName: 'Tech Deals',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567891',
      role: 'seller',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'seller_3',
      email: 'artisan@demo.com',
      displayName: 'Artisan Crafts',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phoneNumber: '+1234567892',
      role: 'seller',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  
  liveStreams: [
    {
      title: 'Authentic 70s Collection',
      sellerId: 'seller_1',
      sellerName: 'Vintage Vibes',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'live',
      productIds: ['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      viewers: 1847,
      category: 'Vintage',
      currentBid: 45.0,
      productCount: 5,
      playbackUrl: 'https://example.com/stream1.m3u8'
    },
    {
      title: 'Gaming Gear Auction',
      sellerId: 'seller_2',
      sellerName: 'Tech Deals',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'live',
      productIds: ['prod_6', 'prod_7', 'prod_8', 'prod_9', 'prod_10', 'prod_11'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      viewers: 3264,
      category: 'Electronics',
      currentBid: 127.5,
      productCount: 6,
      playbackUrl: 'https://example.com/stream2.m3u8'
    },
    {
      title: 'Handmade Jewelry Show',
      sellerId: 'seller_3',
      sellerName: 'Artisan Crafts',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'live',
      productIds: ['prod_12', 'prod_13', 'prod_14', 'prod_15', 'prod_16'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      viewers: 892,
      category: 'Jewelry',
      currentBid: 28.0,
      productCount: 5,
      playbackUrl: 'https://example.com/stream3.m3u8'
    }
  ],
  
  featuredStreams: [
    {
      streamId: 'stream_1',
      title: 'Vintage Designer Collection',
      sellerName: 'Vintage Vibes',
      viewers: 2847,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
      category: 'Fashion',
      priority: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      streamId: 'stream_2',
      title: 'Gaming Gear Auction',
      sellerName: 'Tech Deals',
      viewers: 5639,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      category: 'Electronics',
      priority: 2,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      streamId: 'stream_3',
      title: 'Handmade Jewelry',
      sellerName: 'Artisan Crafts',
      viewers: 892,
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      category: 'Jewelry',
      priority: 3,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');

    // Add users
    console.log('👥 Adding users...');
    for (const user of demoData.users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`✅ Added user: ${user.displayName}`);
    }

    // Add live streams
    console.log('📺 Adding live streams...');
    for (const stream of demoData.liveStreams) {
      const docRef = await db.collection('liveStreams').add(stream);
      console.log(`✅ Added stream: ${stream.title} (ID: ${docRef.id})`);
    }

    // Add featured streams
    console.log('⭐ Adding featured streams...');
    for (const featured of demoData.featuredStreams) {
      await db.collection('featuredStreams').add(featured);
      console.log(`✅ Added featured: ${featured.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();