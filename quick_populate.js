#!/usr/bin/env node

const { execSync } = require('child_process');

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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      auctionEndTime: "2024-01-01T02:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      auctionEndTime: "2024-01-01T01:30:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  },
  liveStreams: {
    "stream_001": {
      id: "stream_001",
      title: "🔥 Vintage Designer Collection LIVE",
      sellerId: "seller_vintage_001",
      sellerName: "Vintage Vibes",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      startTime: "2024-01-01T00:00:00.000Z",
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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    "stream_002": {
      id: "stream_002",
      title: "🎮 Gaming Gear Auction LIVE",
      sellerId: "seller_tech_001",
      sellerName: "Tech Deals Hub",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
      startTime: "2024-01-01T00:00:00.000Z",
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
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
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
      createdAt: "2024-01-01T00:00:00.000Z"
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
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  }
};

console.log('🚀 Populating Firestore with demo data...');

async function populateData() {
  try {
    // Create users
    console.log('👥 Creating users...');
    for (const [id, data] of Object.entries(demoData.users)) {
      execSync(`firebase firestore:set users/${id} '${JSON.stringify(data)}' --project=blytz-e9935`, { stdio: 'inherit' });
    }

    // Create sellers
    console.log('🏪 Creating sellers...');
    for (const [id, data] of Object.entries(demoData.sellers)) {
      execSync(`firebase firestore:set sellers/${id} '${JSON.stringify(data)}' --project=blytz-e9935`, { stdio: 'inherit' });
    }

    // Create products
    console.log('🛍️ Creating products...');
    for (const [id, data] of Object.entries(demoData.products)) {
      execSync(`firebase firestore:set products/${id} '${JSON.stringify(data)}' --project=blytz-e9935`, { stdio: 'inherit' });
    }

    // Create live streams
    console.log('📺 Creating live streams...');
    for (const [id, data] of Object.entries(demoData.liveStreams)) {
      execSync(`firebase firestore:set liveStreams/${id} '${JSON.stringify(data)}' --project=blytz-e9935`, { stdio: 'inherit' });
    }

    // Create featured streams
    console.log('⭐ Creating featured streams...');
    for (const [id, data] of Object.entries(demoData.featuredStreams)) {
      execSync(`firebase firestore:set featuredStreams/${id} '${JSON.stringify(data)}' --project=blytz-e9935`, { stdio: 'inherit' });
    }

    console.log('✅ Demo data populated successfully!');
    console.log('🚀 Restart your app - HomeScreen should now load streams!');

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Trying alternative method...');
    
    // Alternative: Use curl with Firebase REST API
    const curlCommands = [
      'curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_vintage_001" -H "Content-Type: application/json" -d \'{"fields":{"uid":{"stringValue":"seller_vintage_001"},"email":{"stringValue":"vintage@demo.com"},"displayName":{"stringValue":"Vintage Vibes"},"photoURL":{"stringValue":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"},"phoneNumber":{"stringValue":"+1234567890"},"emailVerified":{"booleanValue":true},"role":{"stringValue":"seller"},"isVerified":{"booleanValue":true},"rating":{"doubleValue":4.8},"totalSales":{"integerValue":2847},"followers":{"integerValue":15234},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}\'',
      'curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_tech_001" -H "Content-Type: application/json" -d \'{"fields":{"uid":{"stringValue":"seller_tech_001"},"email":{"stringValue":"tech@demo.com"},"displayName":{"stringValue":"Tech Deals Hub"},"photoURL":{"stringValue":"https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face"},"phoneNumber":{"stringValue":"+1234567891"},"emailVerified":{"booleanValue":true},"role":{"stringValue":"seller"},"isVerified":{"booleanValue":true},"rating":{"doubleValue":4.9},"totalSales":{"integerValue":5639},"followers":{"integerValue":28471},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}\'',
      'curl -X PATCH "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/liveStreams/stream_001" -H "Content-Type: application/json" -d \'{"fields":{"id":{"stringValue":"stream_001"},"title":{"stringValue":"🔥 Vintage Designer Collection LIVE"},"sellerId":{"stringValue":"seller_vintage_001"},"sellerName":{"stringValue":"Vintage Vibes"},"sellerAvatar":{"stringValue":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"},"startTime":{"timestampValue":"2024-01-01T00:00:00.000Z"},"status":{"stringValue":"live"},"productIds":{"arrayValue":{"values":[{"stringValue":"prod_vintage_001"}]}},"thumbnailUrl":{"stringValue":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop"},"viewers":{"integerValue":1847},"category":{"stringValue":"Vintage Fashion"},"currentBid":{"doubleValue":67.5},"productCount":{"integerValue":1},"playbackUrl":{"stringValue":"https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8"},"isFeatured":{"booleanValue":true},"duration":{"integerValue":0},"createdAt":{"timestampValue":"2024-01-01T00:00:00.000Z"},"updatedAt":{"timestampValue":"2024-01-01T00:00:00.000Z"}}}\''
    ];
    
    curlCommands.forEach(cmd => {
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        console.log('Note: REST API requires authentication');
      }
    });
  }
}

populateData();