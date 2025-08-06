import admin from 'firebase-admin';

// I will replace this with the actual service account key later
const serviceAccount = {
  "type": "service_account",
  "project_id": "blytz-e9935",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...your...private...key...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}; 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const data = {
  title: "Test Live Stream",
  sellerId: "test-seller",
  startTime: new Date(),
  status: "live",
  playbackUrl: "http://d23dyx6B8K.mp4"
};

db.collection('livestreams').add(data)
  .then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    process.exit(0);
  })
  .catch(error => {
    console.error("Error adding document: ", error);
    process.exit(1);
  });