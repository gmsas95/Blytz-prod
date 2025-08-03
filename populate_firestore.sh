#!/bin/bash

# Use Firebase CLI to populate Firestore with demo data
echo "🚀 Populating Firestore demo data for Blytz..."

# Set the correct project
firebase use blytz-e9935

# Add users to Firestore
echo "👥 Adding users..."
firebase firestore:delete users --all-collections --force || true
firebase firestore:delete sellers --all-collections --force || true
firebase firestore:delete products --all-collections --force || true
firebase firestore:delete livestreams --all-collections --force || true
firebase firestore:delete featuredstreams --all-collections --force || true

# Create JSON files for import
cat > users.json << 'EOF'
{
  "seller_vintage_001": {
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "seller_tech_001": {
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "seller_artisan_001": {
    "uid": "seller_artisan_001",
    "email": "artisan@demo.com",
    "displayName": "Artisan Crafts",
    "photoURL": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "phoneNumber": "+1234567892",
    "emailVerified": true,
    "role": "seller",
    "isVerified": true,
    "rating": 4.7,
    "totalSales": 1234,
    "followers": 8923,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
EOF

cat > sellers.json << 'EOF'
{
  "seller_vintage_001": {
    "id": "seller_vintage_001",
    "userId": "seller_vintage_001",
    "businessName": "Vintage Vibes Emporium",
    "businessDescription": "Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor.",
    "businessLogo": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop",
    "businessCategory": "Vintage & Collectibles",
    "verificationStatus": "verified",
    "totalSales": 2847,
    "rating": 4.8,
    "followers": 15234,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "seller_tech_001": {
    "id": "seller_tech_001",
    "userId": "seller_tech_001",
    "businessName": "Tech Deals Hub",
    "businessDescription": "Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified.",
    "businessLogo": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
    "businessCategory": "Electronics & Gaming",
    "verificationStatus": "verified",
    "totalSales": 5639,
    "rating": 4.9,
    "followers": 28471,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "seller_artisan_001": {
    "id": "seller_artisan_001",
    "userId": "seller_artisan_001",
    "businessName": "Artisan Craft Studio",
    "businessDescription": "Handcrafted jewelry and accessories made with love. Each piece is unique and tells a story.",
    "businessLogo": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",
    "businessCategory": "Handmade & Artisan",
    "verificationStatus": "verified",
    "totalSales": 1234,
    "rating": 4.7,
    "followers": 8923,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
EOF

cat > products.json << 'EOF'
{
  "prod_vintage_001": {
    "id": "prod_vintage_001",
    "name": "Vintage 70s Leather Jacket",
    "description": "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.",
    "price": 85.0,
    "startingPrice": 45.0,
    "currentPrice": 67.5,
    "reservePrice": 80.0,
    "sellerId": "seller_vintage_001",
    "category": "Vintage Clothing",
    "images": [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop"
    ],
    "condition": "excellent",
    "brand": "Harley Davidson",
    "size": "L",
    "color": "Brown",
    "material": "Genuine Leather",
    "tags": ["vintage", "leather", "motorcycle", "70s", "biker"],
    "isActive": true,
    "auctionEndTime": "2024-01-01T02:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "prod_tech_001": {
    "id": "prod_tech_001",
    "name": "Razer Gaming Headset RGB",
    "description": "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.",
    "price": 89.99,
    "startingPrice": 45.0,
    "currentPrice": 67.5,
    "reservePrice": 75.0,
    "sellerId": "seller_tech_001",
    "category": "Electronics",
    "images": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"
    ],
    "condition": "new",
    "brand": "Razer",
    "color": "Black",
    "tags": ["gaming", "headset", "rgb", "surround", "razer"],
    "isActive": true,
    "auctionEndTime": "2024-01-01T01:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
EOF

cat > livestreams.json << 'EOF'
{
  "stream_001": {
    "id": "stream_001",
    "title": "🔥 Vintage Designer Collection LIVE",
    "sellerId": "seller_vintage_001",
    "sellerName": "Vintage Vibes",
    "sellerAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    "startTime": "2024-01-01T00:00:00.000Z",
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "stream_002": {
    "id": "stream_002",
    "title": "🎮 Gaming Gear Auction LIVE",
    "sellerId": "seller_tech_001",
    "sellerName": "Tech Deals Hub",
    "sellerAvatar": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face",
    "startTime": "2024-01-01T00:00:00.000Z",
    "status": "live",
    "productIds": ["prod_tech_001"],
    "thumbnailUrl": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    "viewers": 3264,
    "category": "Electronics",
    "currentBid": 95.0,
    "productCount": 1,
    "playbackUrl": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
    "isFeatured": true,
    "duration": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
EOF

cat > featuredstreams.json << 'EOF'
{
  "featured_001": {
    "id": "featured_001",
    "streamId": "stream_001",
    "title": "🔥 Vintage Designer Collection",
    "sellerName": "Vintage Vibes",
    "viewers": 1847,
    "thumbnailUrl": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
    "category": "Fashion",
    "priority": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "featured_002": {
    "id": "featured_002",
    "streamId": "stream_002",
    "title": "🎮 Gaming Gear Live",
    "sellerName": "Tech Deals Hub",
    "viewers": 5639,
    "thumbnailUrl": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    "category": "Electronics",
    "priority": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
EOF

echo "📁 Created JSON files for Firestore import"
echo "Now use Firebase Console → Firestore → Import JSON"
echo "Or run individual document creation with:"
echo "firebase firestore:set users/seller_vintage_001 --data-file users.json"