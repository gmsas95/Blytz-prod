const admin = require('firebase-admin');

// For direct usage with Firebase Admin SDK
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp();
  const db = admin.firestore();

  async function createUsers() {
    console.log('Creating user documents...');
    
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

    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`Created user: ${user.displayName}`);
    }

    console.log('All users created successfully!');
  }

  createUsers().catch(console.error);
} else {
  console.log('Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
}