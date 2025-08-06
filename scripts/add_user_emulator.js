const admin = require('firebase-admin');

// Initialize Firebase Admin for emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'demo-blytz'
  });
}

// Set Firestore to use emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const db = admin.firestore();

async function createUserDocument() {
  try {
    // Create user document
    await db.collection('users').doc('YaDaYBRGnVMFXepKO9k8ddYRLUr2').set({
      uid: 'YaDaYBRGnVMFXepKO9k8ddYRLUr2',
      email: 'test@gmail.com',
      displayName: 'SAS',
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      role: 'buyer',
      isVerified: false,
      rating: 0,
      totalSales: 0,
      followers: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    console.log('User document created successfully');
    
    // Also create empty notifications collection for the user
    await db.collection('notifications').doc('YaDaYBRGnVMFXepKO9k8ddYRLUr2').set({
      notifications: [],
      unreadCount: 0,
      lastUpdated: admin.firestore.Timestamp.now()
    });
    
    console.log('Notifications document created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating documents:', error);
    process.exit(1);
  }
}

createUserDocument();