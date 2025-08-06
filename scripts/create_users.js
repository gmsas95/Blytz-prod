const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./blytz-firebase-adminsdk.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createUsers() {
  const users = [
    {
      uid: "08SkOtmWnWUVX7OR2mD4TTFEfUy2",
      email: "pablo@gmail.com",
      displayName: "Pablo",
      role: "buyer",
      isVerified: false,
      rating: 0,
      totalSales: 0,
      followers: 0,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: "VQojzaRNI5Qzb9AARqaPQY48LZB2",
      email: "janella@gmail.com",
      displayName: "Janella",
      role: "buyer",
      isVerified: false,
      rating: 0,
      totalSales: 0,
      followers: 0,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: "eEyVpAS2chU9Z3a8NkoQETbFwdJ3",
      email: "sas@gmail.com",
      displayName: "SAS",
      role: "buyer",
      isVerified: false,
      rating: 0,
      totalSales: 0,
      followers: 0,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const notifications = [
    {
      userId: "08SkOtmWnWUVX7OR2mD4TTFEfUy2",
      type: "system",
      title: "Welcome to Blytz!",
      body: "Your account has been successfully created. Start exploring live auctions!",
      isRead: false,
      priority: "high",
      createdAt: new Date()
    },
    {
      userId: "VQojzaRNI5Qzb9AARqaPQY48LZB2",
      type: "system",
      title: "Welcome to Blytz!",
      body: "Your account has been successfully created. Start exploring live auctions!",
      isRead: false,
      priority: "high",
      createdAt: new Date()
    },
    {
      userId: "eEyVpAS2chU9Z3a8NkoQETbFwdJ3",
      type: "system",
      title: "Welcome to Blytz!",
      body: "Your account has been successfully created. Start exploring live auctions!",
      isRead: false,
      priority: "high",
      createdAt: new Date()
    }
  ];

  try {
    // Create user documents
    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`Created user: ${user.displayName} (${user.uid})`);
    }

    // Create notifications
    for (const notification of notifications) {
      await db.collection('notifications').add(notification);
      console.log(`Created notification for user: ${notification.userId}`);
    }

    console.log('All users and notifications created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

createUsers();