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
const users = [
  {
    uid: 'seller_1',
    email: 'vintagevibes@demo.com',
    displayName: 'Vintage Vibes',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567890',
    role: 'seller'
  },
  {
    uid: 'seller_2',
    email: 'techdeals@demo.com',
    displayName: 'Tech Deals',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567891',
    role: 'seller'
  },
  {
    uid: 'seller_3',
    email: 'artisan@demo.com',
    displayName: 'Artisan Crafts',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567892',
    role: 'seller'
  },
  {
    uid: 'seller_4',
    email: 'bookworm@demo.com',
    displayName: 'Bookworm Finds',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567893',
    role: 'seller'
  },
  {
    uid: 'seller_5',
    email: 'sports@demo.com',
    displayName: 'Sports Memorabilia',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567894',
    role: 'seller'
  },
  {
    uid: 'seller_6',
    email: 'homedecor@demo.com',
    displayName: 'Home Decor Pro',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1234567895',
    role: 'seller'
  }
];

const liveStreams = [
  {
    id: 'stream_1',
    title: 'Authentic 70s Collection',
    sellerId: 'seller_1',
    sellerName: 'Vintage Vibes',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5', 'prod_6', 'prod_7', 'prod_8'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
    viewers: 1847,
    category: 'Vintage',
    currentBid: 45.0,
    productCount: 8,
    playbackUrl: 'https://example.com/stream1.m3u8'
  },
  {
    id: 'stream_2',
    title: 'Gaming Gear Auction',
    sellerId: 'seller_2',
    sellerName: 'Tech Deals',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_9', 'prod_10', 'prod_11', 'prod_12', 'prod_13', 'prod_14', 'prod_15', 'prod_16', 'prod_17', 'prod_18', 'prod_19', 'prod_20'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    viewers: 3264,
    category: 'Electronics',
    currentBid: 127.5,
    productCount: 12,
    playbackUrl: 'https://example.com/stream2.m3u8'
  },
  {
    id: 'stream_3',
    title: 'Handmade Jewelry Show',
    sellerId: 'seller_3',
    sellerName: 'Artisan Crafts',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_21', 'prod_22', 'prod_23', 'prod_24', 'prod_25', 'prod_26', 'prod_27', 'prod_28', 'prod_29', 'prod_30', 'prod_31', 'prod_32', 'prod_33', 'prod_34', 'prod_35'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    viewers: 892,
    category: 'Jewelry',
    currentBid: 28.0,
    productCount: 15,
    playbackUrl: 'https://example.com/stream3.m3u8'
  },
  {
    id: 'stream_4',
    title: 'Rare Book Collection',
    sellerId: 'seller_4',
    sellerName: 'Bookworm Finds',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_36', 'prod_37', 'prod_38', 'prod_39', 'prod_40', 'prod_41'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
    viewers: 567,
    category: 'Books',
    currentBid: 89.99,
    productCount: 6,
    playbackUrl: 'https://example.com/stream4.m3u8'
  },
  {
    id: 'stream_5',
    title: 'Signed Sports Cards',
    sellerId: 'seller_5',
    sellerName: 'Sports Memorabilia',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_42', 'prod_43', 'prod_44', 'prod_45', 'prod_46', 'prod_47', 'prod_48', 'prod_49', 'prod_50'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=300&fit=crop',
    viewers: 2156,
    category: 'Sports',
    currentBid: 199.0,
    productCount: 9,
    playbackUrl: 'https://example.com/stream5.m3u8'
  },
  {
    id: 'stream_6',
    title: 'Vintage Home Decor',
    sellerId: 'seller_6',
    sellerName: 'Home Decor Pro',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    startTime: serverTimestamp(),
    status: 'live',
    productIds: ['prod_51', 'prod_52', 'prod_53', 'prod_54', 'prod_55', 'prod_56', 'prod_57', 'prod_58', 'prod_59', 'prod_60', 'prod_61'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    viewers: 1423,
    category: 'Home',
    currentBid: 67.5,
    productCount: 11,
    playbackUrl: 'https://example.com/stream6.m3u8'
  }
];

const featuredStreams = [
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
  },
  {
    id: 'featured_3',
    streamId: 'stream_5',
    title: 'Comic Book Auction',
    sellerName: 'Sports Memorabilia',
    viewers: 1234,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=300&fit=crop',
    category: 'Collectibles',
    priority: 3,
    createdAt: serverTimestamp()
  }
];

async function populateDemoData() {
  try {
    console.log('🚀 Starting demo data population...');

    // Add users
    console.log('👥 Adding users...');
    for (const user of users) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, user);
      console.log(`✅ Added user: ${user.displayName}`);
    }

    // Add live streams
    console.log('📺 Adding live streams...');
    for (const stream of liveStreams) {
      const streamRef = doc(db, 'liveStreams', stream.id);
      await setDoc(streamRef, stream);
      console.log(`✅ Added stream: ${stream.title}`);
    }

    // Add featured streams
    console.log('⭐ Adding featured streams...');
    for (const featured of featuredStreams) {
      const featuredRef = doc(db, 'featuredStreams', featured.id);
      await setDoc(featuredRef, featured);
      console.log(`✅ Added featured: ${featured.title}`);
    }

    console.log('🎉 All demo data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating demo data:', error);
  }
}

// Run the population
populateDemoData();