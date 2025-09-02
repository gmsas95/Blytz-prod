const admin = require('firebase-admin');

// Initialize with service account
admin.initializeApp({
  databaseURL: 'https://blytz-e9935-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const db = admin.database();

// Create test auction
async function setupTestAuction() {
  const auctionId = 'test-auction-001';
  const auctionRef = db.ref(`auctions/${auctionId}`);
  
  await auctionRef.set({
    currentPrice: 10.00,
    startingPrice: 10.00,
    status: 'live',
    endTime: Date.now() + 3600000, // 1 hour from now
    productId: 'prod-001',
    sellerId: 'seller-001',
    productName: 'Test Product',
    description: 'Test auction for bidding system',
    bids: {}
  });
  
  console.log('✅ Test auction created:', auctionId);
  console.log('🔗 Test URL: https://blytz-e9935-default-rtdb.asia-southeast1.firebasedatabase.app/auctions/' + auctionId);
}

setupTestAuction().catch(console.error);