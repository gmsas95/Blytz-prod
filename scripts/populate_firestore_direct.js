// Quick Firestore population using Firebase Admin SDK
// This script will populate demo data directly

const { execSync } = require('child_process');
const fs = require('fs');

// Create a simple service account placeholder
console.log('🔥 Using Firebase tools to create demo data...');

// Let's use the Firebase CLI to create data directly in Firestore
// We'll create a simple script that uses the available tools

const data = {
  'users/seller_vintage_001': {
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
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'users/seller_tech_001': {
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
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'sellers/seller_vintage_001': {
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
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'sellers/seller_tech_001': {
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
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'products/prod_vintage_001': {
    id: 'prod_vintage_001',
    name: 'Vintage 70s Leather Jacket',
    description: 'Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.',
    price: 85,
    startingPrice: 45,
    currentPrice: 67.5,
    reservePrice: 80,
    sellerId: 'seller_vintage_001',
    category: 'Vintage Clothing',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop'],
    condition: 'excellent',
    brand: 'Harley Davidson',
    size: 'L',
    color: 'Brown',
    material: 'Genuine Leather',
    tags: ['vintage', 'leather', 'motorcycle', '70s', 'biker'],
    isActive: true,
    auctionEndTime: { _seconds: 1704074400, _nanoseconds: 0 },
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'products/prod_tech_001': {
    id: 'prod_tech_001',
    name: 'Razer Gaming Headset RGB',
    description: 'Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.',
    price: 89.99,
    startingPrice: 45,
    currentPrice: 67.5,
    reservePrice: 75,
    sellerId: 'seller_tech_001',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop'],
    condition: 'new',
    brand: 'Razer',
    color: 'Black',
    tags: ['gaming', 'headset', 'rgb', 'surround', 'razer'],
    isActive: true,
    auctionEndTime: { _seconds: 1704072600, _nanoseconds: 0 },
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'liveStreams/stream_001': {
    id: 'stream_001',
    title: '🔥 Vintage Designer Collection LIVE',
    sellerId: 'seller_vintage_001',
    sellerName: 'Vintage Vibes',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    startTime: { _seconds: 1704067200, _nanoseconds: 0 },
    status: 'live',
    productIds: ['prod_vintage_001'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
    viewers: 1847,
    category: 'Vintage Fashion',
    currentBid: 67.5,
    productCount: 1,
    playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8',
    isFeatured: true,
    duration: 0,
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'liveStreams/stream_002': {
    id: 'stream_002',
    title: '🎮 Gaming Gear Auction LIVE',
    sellerId: 'seller_tech_001',
    sellerName: 'Tech Deals Hub',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face',
    startTime: { _seconds: 1704067200, _nanoseconds: 0 },
    status: 'live',
    productIds: ['prod_tech_001'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    viewers: 3264,
    category: 'Electronics',
    currentBid: 95,
    productCount: 1,
    playbackUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8',
    isFeatured: true,
    duration: 0,
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 },
    updatedAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'featuredStreams/featured_001': {
    id: 'featured_001',
    streamId: 'stream_001',
    title: '🔥 Vintage Designer Collection',
    sellerName: 'Vintage Vibes',
    viewers: 2847,
    thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop',
    category: 'Fashion',
    priority: 1,
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 }
  },
  'featuredStreams/featured_002': {
    id: 'featured_002',
    streamId: 'stream_002',
    title: '🎮 Gaming Gear Live',
    sellerName: 'Tech Deals Hub',
    viewers: 5639,
    thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    category: 'Electronics',
    priority: 2,
    createdAt: { _seconds: 1704067200, _nanoseconds: 0 }
  }
};

// Create a simple shell script to populate data
const scriptContent = `#!/bin/bash
echo "🔥 Populating Firestore with demo data..."

# Create users
echo "👥 Creating users..."
curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_vintage_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"uid":{"stringValue":"seller_vintage_001"},"email":{"stringValue":"vintage@demo.com"},"displayName":{"stringValue":"Vintage Vibes"},"photoURL":{"stringValue":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},"phoneNumber":{"stringValue":"+1234567890"},"emailVerified":{"booleanValue":true},"role":{"stringValue":"seller"},"isVerified":{"booleanValue":true},"rating":{"doubleValue":4.8},"totalSales":{"integerValue":2847},"followers":{"integerValue":15234},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_tech_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"uid":{"stringValue":"seller_tech_001"},"email":{"stringValue":"tech@demo.com"},"displayName":{"stringValue":"Tech Deals Hub"},"photoURL":{"stringValue":"https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},"phoneNumber":{"stringValue":"+1234567891"},"emailVerified":{"booleanValue":true},"role":{"stringValue":"seller"},"isVerified":{"booleanValue":true},"rating":{"doubleValue":4.9},"totalSales":{"integerValue":5639},"followers":{"integerValue":28471},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

# Create sellers
echo "🏪 Creating sellers..."
curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/sellers/seller_vintage_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"seller_vintage_001"},"userId":{"stringValue":"seller_vintage_001"},"businessName":{"stringValue":"Vintage Vibes Emporium"},"businessDescription":{"stringValue":"Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor."},"businessLogo":{"stringValue":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200\u0026h=200\u0026fit=crop"},"businessCategory":{"stringValue":"Vintage \u0026 Collectibles"},"verificationStatus":{"stringValue":"verified"},"totalSales":{"integerValue":2847},"rating":{"doubleValue":4.8},"followers":{"integerValue":15234},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/sellers/seller_tech_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"seller_tech_001"},"userId":{"stringValue":"seller_tech_001"},"businessName":{"stringValue":"Tech Deals Hub"},"businessDescription":{"stringValue":"Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified."},"businessLogo":{"stringValue":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200\u0026h=200\u0026fit=crop"},"businessCategory":{"stringValue":"Electronics \u0026 Gaming"},"verificationStatus":{"stringValue":"verified"},"totalSales":{"integerValue":5639},"rating":{"doubleValue":4.9},"followers":{"integerValue":28471},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

# Create live streams
echo "📺 Creating live streams..."
curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/liveStreams/stream_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"stream_001"},"title":{"stringValue":"🔥 Vintage Designer Collection LIVE"},"sellerId":{"stringValue":"seller_vintage_001"},"sellerName":{"stringValue":"Vintage Vibes"},"sellerAvatar":{"stringValue":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},"startTime":{"timestampValue":"2024-01-01T00:00:00.000Z"},"status":{"stringValue":"live"},"productIds":{"arrayValue":{"values":[{"stringValue":"prod_vintage_001"}]}},"thumbnailUrl":{"stringValue":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400\u0026h=300\u0026fit=crop"},"viewers":{"integerValue":1847},"category":{"stringValue":"Vintage Fashion"},"currentBid":{"doubleValue":67.5},"productCount":{"integerValue":1},"playbackUrl":{"stringValue":"https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8"},"isFeatured":{"booleanValue":true},"duration":{"integerValue":0},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/liveStreams/stream_002" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"stream_002"},"title":{"stringValue":"🎮 Gaming Gear Auction LIVE"},"sellerId":{"stringValue":"seller_tech_001"},"sellerName":{"stringValue":"Tech Deals Hub"},"sellerAvatar":{"stringValue":"https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},"startTime":{"timestampValue":"2024-01-01T00:00:00.000Z"},"status":{"stringValue":"live"},"productIds":{"arrayValue":{"values":[{"stringValue":"prod_tech_001"}]}},"thumbnailUrl":{"stringValue":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400\u0026h=300\u0026fit=crop"},"viewers":{"integerValue":3264},"category":{"stringValue":"Electronics"},"currentBid":{"doubleValue":95},"productCount":{"integerValue":1},"playbackUrl":{"stringValue":"https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8"},"isFeatured":{"booleanValue":true},"duration":{"integerValue":0},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

# Create featured streams
echo "⭐ Creating featured streams..."
curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/featuredStreams/featured_001" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"featured_001"},"streamId":{"stringValue":"stream_001"},"title":{"stringValue":"🔥 Vintage Designer Collection"},"sellerName":{"stringValue":"Vintage Vibes"},"viewers":{"integerValue":2847},"thumbnailUrl":{"stringValue":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400\u0026h=300\u0026fit=crop"},"category":{"stringValue":"Fashion"},"priority":{"integerValue":1},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/featuredStreams/featured_002" \\
  -H "Content-Type: application/json" \\
  -d '{"fields":{"id":{"stringValue":"featured_002"},"streamId":{"stringValue":"stream_002"},"title":{"stringValue":"🎮 Gaming Gear Live"},"sellerName":{"stringValue":"Tech Deals Hub"},"viewers":{"integerValue":5639},"thumbnailUrl":{"stringValue":"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400\u0026h=300\u0026fit=crop"},"category":{"stringValue":"Electronics"},"priority":{"integerValue":2},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}'

echo "✅ Demo data populated successfully!"
echo "🚀 Restart your app - HomeScreen should now load streams!"
`;

fs.writeFileSync('populate_demo.sh', scriptContent);
execSync('chmod +x populate_demo.sh');

console.log('🎯 Quick population script created: populate_demo.sh');
console.log('📋 Run: ./populate_demo.sh to populate the data');