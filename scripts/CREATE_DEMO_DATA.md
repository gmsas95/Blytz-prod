# Create Demo Data for Blytz Live Auction App

## Quick Setup Guide

Since we don't have direct API access, here's how to manually populate Firestore with demo data using the Firebase Console:

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `blytz-e9935`
3. Navigate to **Firestore Database** → **Data** tab

### Step 2: Create Collections and Documents

#### 1. Create `users` collection:
**Collection:** `users`  
**Document ID:** `seller_vintage_001`
```json
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
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Document ID:** `seller_tech_001`
```json
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
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Create `sellers` collection:
**Collection:** `sellers`  
**Document ID:** `seller_vintage_001`
```json
{
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
}
```

**Document ID:** `seller_tech_001`
```json
{
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
}
```

#### 3. Create `products` collection:
**Collection:** `products`  
**Document ID:** `prod_vintage_001`
```json
{
  "id": "prod_vintage_001",
  "name": "Vintage 70s Leather Jacket",
  "description": "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs.",
  "price": 85,
  "startingPrice": 45,
  "currentPrice": 67.5,
  "reservePrice": 80,
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
}
```

**Document ID:** `prod_tech_001`
```json
{
  "id": "prod_tech_001",
  "name": "Razer Gaming Headset RGB",
  "description": "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic.",
  "price": 89.99,
  "startingPrice": 45,
  "currentPrice": 67.5,
  "reservePrice": 75,
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
```

#### 4. Create `liveStreams` collection:
**Collection:** `liveStreams`  
**Document ID:** `stream_001`
```json
{
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
}
```

**Document ID:** `stream_002`
```json
{
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
  "currentBid": 95,
  "productCount": 1,
  "playbackUrl": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8",
  "isFeatured": true,
  "duration": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 5. Create `featuredStreams` collection:
**Collection:** `featuredStreams`  
**Document ID:** `featured_001`
```json
{
  "id": "featured_001",
  "streamId": "stream_001",
  "title": "🔥 Vintage Designer Collection",
  "sellerName": "Vintage Vibes",
  "viewers": 2847,
  "thumbnailUrl": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop",
  "category": "Fashion",
  "priority": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Document ID:** `featured_002`
```json
{
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
```

### Step 3: Verify Data
After creating all documents, you should see:
- ✅ `users` collection with 2 seller users
- ✅ `sellers` collection with 2 business profiles  
- ✅ `products` collection with 2 products
- ✅ `liveStreams` collection with 2 live streams
- ✅ `featuredStreams` collection with 2 featured streams

### Step 4: Restart Your App
Now restart your Expo app and the HomeScreen should successfully load the demo data!

## Troubleshooting
- If you see permission errors, ensure Firestore rules allow read access
- The Firestore composite index has already been created for liveStreams queries
- Check that all collection names match exactly (case-sensitive)