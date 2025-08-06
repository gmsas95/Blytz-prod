const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function createUserDocument() {
  try {
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
  } catch (error) {
    console.error('Error creating user document:', error);
  }
}

createUserDocument();