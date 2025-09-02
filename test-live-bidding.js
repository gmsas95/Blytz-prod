// Test script for live bidding integration
const { httpsCallable } = require('firebase/functions');
const { functions } = require('./src/services/firebase/firebase');

async function testLiveBidding() {
  console.log('🧪 Testing live bidding integration...');
  
  const testData = {
    auctionId: 'test-auction-001',
    amount: 15.50
  };

  try {
    const placeBidFunction = httpsCallable(functions, 'placeBid');
    const result = await placeBidFunction(testData);
    console.log('✅ Bid placed successfully:', result.data);
  } catch (error) {
    console.error('❌ Bid failed:', error.message);
  }
}

// Test connection
async function testConnection() {
  console.log('🔗 Testing connection to bidding system...');
  
  try {
    // Check if auction exists
    const { getDatabase, ref, get } = require('firebase/database');
    const db = getDatabase();
    const auctionRef = ref(db, 'test-auction-001');
    const snapshot = await get(auctionRef);
    
    if (snapshot.exists()) {
      console.log('✅ Auction found:', snapshot.val());
    } else {
      console.log('❌ Auction not found');
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

console.log('🚀 Testing live bidding setup...');
testConnection();