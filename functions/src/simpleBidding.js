const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Simple bid processing
exports.processBid = functions.database
  .ref('/auctions/{auctionId}/bids/{bidId}')
  .onCreate(async (snapshot, context) => {
    const bid = snapshot.val();
    const { auctionId, bidId } = context.params;
    
    console.log('Processing bid:', bid);
    
    try {
      // Update auction with new bid
      await admin.database().ref(`/auctions/${auctionId}`).update({
        currentPrice: bid.amount,
        lastBidderId: bid.userId,
        lastBidTime: admin.database.ServerValue.TIMESTAMP,
        bidCount: admin.database.ServerValue.increment(1)
      });
      
      console.log('✅ Bid processed successfully');
      
    } catch (error) {
      console.error('❌ Error processing bid:', error);
    }
  });

// Simple auction creation
exports.createAuction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { startingPrice, productId, durationMinutes = 60 } = data;
  const auctionId = admin.database().ref('auctions').push().key;
  
  const auction = {
    startingPrice,
    currentPrice: startingPrice,
    status: 'live',
    endTime: Date.now() + (durationMinutes * 60 * 1000),
    productId,
    sellerId: context.auth.uid,
    createdAt: admin.database.ServerValue.TIMESTAMP,
    bids: {}
  };
  
  await admin.database().ref(`auctions/${auctionId}`).set(auction);
  return { auctionId };
});

// Simple bid placement
exports.placeBid = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { auctionId, amount } = data;
  
  // Get auction
  const auction = await admin.database().ref(`auctions/${auctionId}`).once('value');
  if (!auction.exists()) {
    throw new functions.https.HttpsError('not-found', 'Auction not found');
  }
  
  const auctionData = auction.val();
  
  // Validate bid
  if (amount <= auctionData.currentPrice) {
    throw new functions.https.HttpsError('invalid-argument', 'Bid must be higher than current price');
  }
  
  // Create bid
  const bid = {
    userId: context.auth.uid,
    amount,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    status: 'confirmed'
  };
  
  const bidId = admin.database().ref(`auctions/${auctionId}/bids`).push().key;
  await admin.database().ref(`auctions/${auctionId}/bids/${bidId}`).set(bid);
  
  return { success: true, bidId };
});