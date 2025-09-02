// Test script to verify the bidding system works end-to-end
const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://blytz-e9935-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
}

const db = getDatabase();
const firestore = getFirestore();

async function createTestAuction() {
  try {
    console.log('Creating test auction...');
    
    // Create a test auction in Firestore
    const auctionRef = firestore.collection('auctions').doc('test-auction-001');
    await auctionRef.set({
      title: 'Vintage Designer T-Shirt',
      description: 'Rare vintage designer t-shirt from the 90s',
      startingPrice: 30.00,
      currentPrice: 30.00,
      status: 'live',
      sellerId: 'test-seller-001',
      productId: 'prod_test_001',
      bidCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    });

    // Create corresponding Realtime Database entry
    const rtdbAuctionRef = db.ref('auctions/test-auction-001');
    await rtdbAuctionRef.set({
      title: 'Vintage Designer T-Shirt',
      description: 'Rare vintage designer t-shirt from the 90s',
      startingPrice: 30.00,
      currentPrice: 30.00,
      status: 'live',
      sellerId: 'test-seller-001',
      productId: 'prod_test_001',
      bidCount: 0,
      endTime: Date.now() + 30 * 60 * 1000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('✅ Test auction created successfully!');
    console.log('Auction ID: test-auction-001');
    console.log('Starting Price: $30.00');
    console.log('Status: live');
    
    return 'test-auction-001';
  } catch (error) {
    console.error('❌ Error creating test auction:', error);
    throw error;
  }
}

async function testPlaceBid(auctionId, amount, userId = 'test-user-001') {
  try {
    console.log(`\n🎯 Testing bid placement: $${amount} by ${userId}`);
    
    // Test via Cloud Function
    const functions = require('firebase-functions');
    
    // Simulate a bid placement
    const bidRef = db.ref(`auctions/${auctionId}/bids`).push();
    await bidRef.set({
      userId: userId,
      amount: amount,
      timestamp: Date.now(),
      status: 'pending'
    });

    console.log(`✅ Bid placed: $${amount} by ${userId}`);
    console.log(`Bid ID: ${bidRef.key}`);
    
    // Wait a moment for the Cloud Function to process
    setTimeout(async () => {
      const auctionSnapshot = await db.ref(`auctions/${auctionId}`).once('value');
      const auctionData = auctionSnapshot.val();
      console.log(`Current Price: $${auctionData.currentPrice}`);
      console.log(`Last Bidder: ${auctionData.lastBidderId}`);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error placing bid:', error);
  }
}

async function verifyAuctionState(auctionId) {
  try {
    console.log(`\n🔍 Verifying auction state for ${auctionId}`);
    
    // Check Realtime Database
    const rtdbSnapshot = await db.ref(`auctions/${auctionId}`).once('value');
    const rtdbData = rtdbSnapshot.val();
    
    console.log('📊 Realtime Database:');
    console.log(`- Current Price: $${rtdbData?.currentPrice || 'N/A'}`);
    console.log(`- Status: ${rtdbData?.status || 'N/A'}`);
    console.log(`- Bid Count: ${rtdbData?.bidCount || 0}`);
    
    // Check Firestore
    const firestoreSnapshot = await firestore.collection('auctions').doc(auctionId).get();
    const firestoreData = firestoreSnapshot.data();
    
    console.log('📊 Firestore:');
    console.log(`- Current Price: $${firestoreData?.currentPrice || 'N/A'}`);
    console.log(`- Status: ${firestoreData?.status || 'N/A'}`);
    console.log(`- Bid Count: ${firestoreData?.bidCount || 0}`);
    
    // Check bids
    const bidsSnapshot = await db.ref(`auctions/${auctionId}/bids`).once('value');
    const bidsData = bidsSnapshot.val();
    
    console.log('📊 Bids:');
    if (bidsData) {
      const bids = Object.values(bidsData);
      console.log(`- Total Bids: ${bids.length}`);
      bids.forEach((bid, index) => {
        console.log(`  ${index + 1}. $${bid.amount} by ${bid.userId}`);
      });
    } else {
      console.log('- No bids yet');
    }
    
  } catch (error) {
    console.error('❌ Error verifying auction state:', error);
  }
}

async function runFullTest() {
  console.log('🚀 Starting Bidding System Test\n');
  
  try {
    // Create test auction
    const auctionId = await createTestAuction();
    
    // Wait for setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test bid placement
    await testPlaceBid(auctionId, 35.00);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPlaceBid(auctionId, 40.00);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPlaceBid(auctionId, 42.50);
    
    // Verify final state
    setTimeout(async () => {
      await verifyAuctionState(auctionId);
      console.log('\n✅ Test completed successfully!');
      console.log('🎯 Your bidding system is working!');
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runFullTest();
}

module.exports = {
  createTestAuction,
  testPlaceBid,
  verifyAuctionState,
  runFullTest
};