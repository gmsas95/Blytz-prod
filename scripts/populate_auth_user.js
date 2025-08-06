// Add authenticated user to existing database structure
// Run with: node populate_auth_user.js
// Requires: npm install firebase-admin

const admin = require('firebase-admin');

// Check if service account key exists
const fs = require('fs');
const path = require('path');

// Try to find service account key
let serviceAccountPath = null;
const possiblePaths = [
  './serviceAccountKey.json',
  '../serviceAccountKey.json',
  '../../serviceAccountKey.json'
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

if (!serviceAccountPath) {
  console.log('❌ serviceAccountKey.json not found');
  console.log('📋 To add authenticated user:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as serviceAccountKey.json in this directory');
  console.log('4. Run: npm install firebase-admin');
  console.log('5. Run: node populate_auth_user.js');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Authenticated user data to align with existing structure
const authUserData = {
  users: {
    "YaDaYBRGnVMFXepKO9k8ddYRLUr2": {
      uid: "YaDaYBRGnVMFXepKO9k8ddYRLUr2",
      email: "test@gmail.com",
      displayName: "SAS",
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      role: "buyer",
      isVerified: false,
      rating: 0,
      totalSales: 0,
      followers: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  },
  notifications: {
    "YaDaYBRGnVMFXepKO9k8ddYRLUr2": {
      notifications: [],
      unreadCount: 0,
      lastUpdated: admin.firestore.Timestamp.now()
    }
  }
};

async function populateAuthUser() {
  console.log('🚀 Adding authenticated user to existing database structure...');
  
  try {
    // Create user document
    console.log('👤 Creating authenticated user document...');
    const userRef = db.collection('users').doc('YaDaYBRGnVMFXepKO9k8ddYRLUr2');
    await userRef.set(authUserData.users['YaDaYBRGnVMFXepKO9k8ddYRLUr2']);
    console.log('✅ User document created successfully');
    
    // Create notifications document
    console.log('🔔 Creating notifications document...');
    const notificationsRef = db.collection('notifications').doc('YaDaYBRGnVMFXepKO9k8ddYRLUr2');
    await notificationsRef.set(authUserData.notifications['YaDaYBRGnVMFXepKO9k8ddYRLUr2']);
    console.log('✅ Notifications document created successfully');
    
    console.log('🎉 Authenticated user successfully aligned with database structure!');
    console.log('📱 You can now test seller onboarding with the authenticated user');
    
  } catch (error) {
    console.error('❌ Error adding authenticated user:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the population
populateAuthUser();