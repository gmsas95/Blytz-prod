# Demo Data Setup Guide

This guide will help you set up demo data for the Blytz auction app to test the application.

## Prerequisites

1. **Firebase Project**: Make sure you have a Firebase project set up
2. **Firebase Admin SDK**: You need to generate a service account key
3. **Firestore Database**: Ensure Firestore is enabled in your Firebase project

## Step 1: Generate Firebase Admin Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon (Project Settings)
4. Go to "Service Accounts" tab
5. Click "Generate new private key"
6. Save the downloaded JSON file as `firebase-admin-key.json` in your project root

## Step 2: Install Dependencies

```bash
npm install firebase-admin
```

## Step 3: Seed Demo Data

Run the demo data seeder:

```bash
node seed_demo_data.js
```

This will populate your Firestore with:
- **Live Streams**: 3 live streams with realistic data
- **Featured Streams**: 3 featured streams
- **Products**: 6 demo products across different categories
- **Users**: 3 demo seller profiles
- **Sellers**: 3 verified seller accounts

## Step 4: Verify Data

After running the seeder, you should see:

### Live Streams
- `live_1`: "Vintage Designer Collection" (1847 viewers)
- `live_2`: "Gaming Gear Live Auction" (3264 viewers)  
- `live_3`: "Handmade Jewelry Showcase" (892 viewers)

### Featured Streams
- `featured_1`: Vintage Designer Collection (Priority 1)
- `featured_2`: Gaming Gear Live (Priority 2)
- `featured_3`: Handmade Jewelry (Priority 3)

### Products
- Vintage 70s Leather Jacket
- Vintage Gucci Handbag
- Vintage 60s Silk Scarf
- Gaming Headset RGB
- Mechanical Gaming Keyboard
- Wireless Gaming Mouse

## Step 5: Test the App

1. Start the development server:
   ```bash
   npm start
   ```

2. The home screen should now display live streams and featured content

## Troubleshooting

### Permission Errors
If you see "Missing or insufficient permissions" errors:

1. Check your Firestore rules (see `firestore.rules`)
2. Ensure the rules allow read access for public data
3. Make sure your Firebase config is correct in `.env`

### Missing Firebase Admin Key
If you get "firebase-admin-key.json not found":
1. Make sure you downloaded the service account key
2. Rename it to `firebase-admin-key.json`
3. Place it in your project root directory

### Database Connection Issues
1. Verify your Firebase project ID matches your `.env` configuration
2. Check that Firestore is enabled in your Firebase project
3. Ensure your service account has the necessary permissions

## Data Structure

The demo data follows the exact structure expected by the app:

```
Firestore Collections:
├── liveStreams/          # Live streaming sessions
├── featuredStreams/      # Featured content for home screen
├── products/            # Products being auctioned
├── users/               # User profiles
├── sellers/             # Seller business profiles
└── auctions/            # Active auctions
    ├── bids/            # Individual bids
    └── chatMessages/    # Live chat messages
```

## Customization

You can modify the demo data by editing:
- `seed_demo_data.js` - Main demo data file
- `firebase-admin-key-template.json` - Template for service account key

## Resetting Demo Data

To clear and re-seed the data:

1. Manually delete collections in Firestore console
2. Run the seeder again: `node seed_demo_data.js`

## Next Steps

Once the demo data is loaded:
1. Test the live streaming functionality
2. Try bidding on products
3. Check the featured streams carousel
4. Test user authentication flow