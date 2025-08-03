#!/bin/bash

echo "🚀 Populating Firestore with demo data for Blytz..."
echo "Please ensure you have Firebase CLI installed and logged in."

# Set the project
echo "Setting project to blytz-e9935..."
firebase use blytz-e9935

# Create demo data using Firestore REST API with curl
echo "📁 Creating demo collections and documents..."

# Create users collection
echo "👥 Creating users..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_vintage_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "seller_vintage_001"},
      "email": {"stringValue": "vintage@demo.com"},
      "displayName": {"stringValue": "Vintage Vibes"},
      "photoURL": {"stringValue": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"},
      "phoneNumber": {"stringValue": "+1234567890"},
      "emailVerified": {"booleanValue": true},
      "role": {"stringValue": "seller"},
      "isVerified": {"booleanValue": true},
      "rating": {"doubleValue": 4.8},
      "totalSales": {"integerValue": 2847},
      "followers": {"integerValue": 15234},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_tech_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "seller_tech_001"},
      "email": {"stringValue": "tech@demo.com"},
      "displayName": {"stringValue": "Tech Deals Hub"},
      "photoURL": {"stringValue": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face"},
      "phoneNumber": {"stringValue": "+1234567891"},
      "emailVerified": {"booleanValue": true},
      "role": {"stringValue": "seller"},
      "isVerified": {"booleanValue": true},
      "rating": {"doubleValue": 4.9},
      "totalSales": {"integerValue": 5639},
      "followers": {"integerValue": 28471},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

# Create sellers collection
echo "🏪 Creating sellers..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/sellers/seller_vintage_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "seller_vintage_001"},
      "userId": {"stringValue": "seller_vintage_001"},
      "businessName": {"stringValue": "Vintage Vibes Emporium"},
      "businessDescription": {"stringValue": "Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor."},
      "businessLogo": {"stringValue": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop"},
      "businessCategory": {"stringValue": "Vintage & Collectibles"},
      "verificationStatus": {"stringValue": "verified"},
      "totalSales": {"integerValue": 2847},
      "rating": {"doubleValue": 4.8},
      "followers": {"integerValue": 15234},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/sellers/seller_tech_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "seller_tech_001"},
      "userId": {"stringValue": "seller_tech_001"},
      "businessName": {"stringValue": "Tech Deals Hub"},
      "businessDescription": {"stringValue": "Latest tech gadgets, gaming gear, and electronics at unbeatable prices. All items tested and verified."},
      "businessLogo": {"stringValue": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop"},
      "businessCategory": {"stringValue": "Electronics & Gaming"},
      "verificationStatus": {"stringValue": "verified"},
      "totalSales": {"integerValue": 5639},
      "rating": {"doubleValue": 4.9},
      "followers": {"integerValue": 28471},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

# Create products collection
echo "🛍️ Creating products..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/products/prod_vintage_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "prod_vintage_001"},
      "name": {"stringValue": "Vintage 70s Leather Jacket"},
      "description": {"stringValue": "Authentic 1970s brown leather motorcycle jacket. Excellent condition with original patches and studs."},
      "price": {"doubleValue": 85},
      "startingPrice": {"doubleValue": 45},
      "currentPrice": {"doubleValue": 67.5},
      "reservePrice": {"doubleValue": 80},
      "sellerId": {"stringValue": "seller_vintage_001"},
      "category": {"stringValue": "Vintage Clothing"},
      "images": {"arrayValue": {"values": [
        {"stringValue": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop"},
        {"stringValue": "https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=400&h=400&fit=crop"}
      ]}},
      "condition": {"stringValue": "excellent"},
      "brand": {"stringValue": "Harley Davidson"},
      "size": {"stringValue": "L"},
      "color": {"stringValue": "Brown"},
      "material": {"stringValue": "Genuine Leather"},
      "tags": {"arrayValue": {"values": [
        {"stringValue": "vintage"},
        {"stringValue": "leather"},
        {"stringValue": "motorcycle"},
        {"stringValue": "70s"},
        {"stringValue": "biker"}
      ]}},
      "isActive": {"booleanValue": true},
      "auctionEndTime": {"timestampValue": "2024-01-01T02:00:00.000Z"},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/products/prod_tech_001" \
  -H "Content-Type: "application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "prod_tech_001"},
      "name": {"stringValue": "Razer Gaming Headset RGB"},
      "description": {"stringValue": "Professional gaming headset with 7.1 surround sound, RGB lighting, and noise-canceling mic."},
      "price": {"doubleValue": 89.99},
      "startingPrice": {"doubleValue": 45},
      "currentPrice": {"doubleValue": 67.5},
      "reservePrice": {"doubleValue": 75},
      "sellerId": {"stringValue": "seller_tech_001"},
      "category": {"stringValue": "Electronics"},
      "images": {"arrayValue": {"values": [
        {"stringValue": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"},
        {"stringValue": "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop"}
      ]}},
      "condition": {"stringValue": "new"},
      "brand": {"stringValue": "Razer"},
      "color": {"stringValue": "Black"},
      "tags": {"arrayValue": {"values": [
        {"stringValue": "gaming"},
        {"stringValue": "headset"},
        {"stringValue": "rgb"},
        {"stringValue": "surround"},
        {"stringValue": "razer"}
      ]}},
      "isActive": {"booleanValue": true},
      "auctionEndTime": {"timestampValue": "2024-01-01T01:30:00.000Z"},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

# Create liveStreams collection
echo "📺 Creating live streams..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/liveStreams/stream_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "stream_001"},
      "title": {"stringValue": "🔥 Vintage Designer Collection LIVE"},
      "sellerId": {"stringValue": "seller_vintage_001"},
      "sellerName": {"stringValue": "Vintage Vibes"},
      "sellerAvatar": {"stringValue": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"},
      "startTime": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "status": {"stringValue": "live"},
      "productIds": {"arrayValue": {"values": [
        {"stringValue": "prod_vintage_001"}
      ]}},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop"},
      "viewers": {"integerValue": 1847},
      "category": {"stringValue": "Vintage Fashion"},
      "currentBid": {"doubleValue": 67.5},
      "productCount": {"integerValue": 1},
      "playbackUrl": {"stringValue": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8"},
      "isFeatured": {"booleanValue": true},
      "duration": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/liveStreams/stream_002" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "stream_002"},
      "title": {"stringValue": "🎮 Gaming Gear Auction LIVE"},
      "sellerId": {"stringValue": "seller_tech_001"},
      "sellerName": {"stringValue": "Tech Deals Hub"},
      "sellerAvatar": {"stringValue": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150&h=150&fit=crop&crop=face"},
      "startTime": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "status": {"stringValue": "live"},
      "productIds": {"arrayValue": {"values": [
        {"stringValue": "prod_tech_001"}
      ]}},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"},
      "viewers": {"integerValue": 3264},
      "category": {"stringValue": "Electronics"},
      "currentBid": {"doubleValue": 95},
      "productCount": {"integerValue": 1},
      "playbackUrl": {"stringValue": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8"},
      "isFeatured": {"booleanValue": true},
      "duration": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

# Create featuredStreams collection
echo "⭐ Creating featured streams..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/featuredStreams/featured_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "featured_001"},
      "streamId": {"stringValue": "stream_001"},
      "title": {"stringValue": "🔥 Vintage Designer Collection"},
      "sellerName": {"stringValue": "Vintage Vibes"},
      "viewers": {"integerValue": 2847},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop"},
      "category": {"stringValue": "Fashion"},
      "priority": {"integerValue": 1},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/featuredStreams/featured_002" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "featured_002"},
      "streamId": {"stringValue": "stream_002"},
      "title": {"stringValue": "🎮 Gaming Gear Live"},
      "sellerName": {"stringValue": "Tech Deals Hub"},
      "viewers": {"integerValue": 5639},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"},
      "category": {"stringValue": "Electronics"},
      "priority": {"integerValue": 2},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

echo "✅ Demo data populated successfully!"
echo "🚀 Now restart your app - the HomeScreen should load streams successfully!"
echo ""
echo "📋 Summary of created data:"
echo "- 2 users (sellers)"
echo "- 2 sellers (business profiles)"
echo "- 2 products (1 vintage, 1 tech)"
echo "- 2 live streams (both live)"
echo "- 2 featured streams"