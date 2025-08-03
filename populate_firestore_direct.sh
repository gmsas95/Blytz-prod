#!/bin/bash

echo "🚀 Populating Firestore with demo data..."

# Use the correct Firebase CLI commands
firebase use blytz-e9935

# Clear existing collections (optional)
echo "🧹 Clearing existing collections..."
firebase firestore:delete --all-collections --force 2>/dev/null || true

# Create users
echo "👥 Creating users..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/users/seller_vintage_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "seller_vintage_001"},
      "email": {"stringValue": "vintage@demo.com"},
      "displayName": {"stringValue": "Vintage Vibes"},
      "photoURL": {"stringValue": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},
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
      "photoURL": {"stringValue": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},
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

# Create sellers
echo "🏪 Creating sellers..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/sellers/seller_vintage_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "seller_vintage_001"},
      "userId": {"stringValue": "seller_vintage_001"},
      "businessName": {"stringValue": "Vintage Vibes Emporium"},
      "businessDescription": {"stringValue": "Curating authentic vintage pieces from the 60s, 70s, and 80s. Specializing in clothing, accessories, and home decor."},
      "businessLogo": {"stringValue": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200\u0026h=200\u0026fit=crop"},
      "businessCategory": {"stringValue": "Vintage \u0026 Collectibles"},
      "verificationStatus": {"stringValue": "verified"},
      "totalSales": {"integerValue": 2847},
      "rating": {"doubleValue": 4.8},
      "followers": {"integerValue": 15234},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

# Create livestreams
echo "📺 Creating livestreams..."
curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/livestreams/stream_001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "stream_001"},
      "title": {"stringValue": "🔥 Vintage Designer Collection LIVE"},
      "sellerId": {"stringValue": "seller_vintage_001"},
      "sellerName": {"stringValue": "Vintage Vibes"},
      "sellerAvatar": {"stringValue": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},
      "startTime": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "status": {"stringValue": "live"},
      "productIds": {"arrayValue": {"values": [{"stringValue": "prod_vintage_001"}]}},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400\u0026h=300\u0026fit=crop"},
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

curl -X POST "https://firestore.googleapis.com/v1/projects/blytz-e9935/databases/(default)/documents/livestreams/stream_002" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "id": {"stringValue": "stream_002"},
      "title": {"stringValue": "🎮 Gaming Gear Auction LIVE"},
      "sellerId": {"stringValue": "seller_tech_001"},
      "sellerName": {"stringValue": "Tech Deals Hub"},
      "sellerAvatar": {"stringValue": "https://images.unsplash.com/photo-1494790108755-2616b612b5b9?w=150\u0026h=150\u0026fit=crop\u0026crop=face"},
      "startTime": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "status": {"stringValue": "live"},
      "productIds": {"arrayValue": {"values": [{"stringValue": "prod_tech_001"}]}},
      "thumbnailUrl": {"stringValue": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400\u0026h=300\u0026fit=crop"},
      "viewers": {"integerValue": 3264},
      "category": {"stringValue": "Electronics"},
      "currentBid": {"doubleValue": 95.0},
      "productCount": {"integerValue": 1},
      "playbackUrl": {"stringValue": "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8"},
      "isFeatured": {"booleanValue": true},
      "duration": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"timestampValue": "2024-01-01T00:00:00.000Z"}
    }
  }'

echo "✅ Firestore populated with demo data!" 
echo "🚀 Now restart your app - the HomeScreen should load streams successfully!"