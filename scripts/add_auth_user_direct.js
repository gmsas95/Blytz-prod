// Add authenticated user using Firebase REST API
// Uses application default credentials

const { execSync } = require('child_process');

// Get access token
let accessToken;
try {
  accessToken = execSync('gcloud auth application-default print-access-token', { encoding: 'utf8' }).trim();
} catch (error) {
  console.log('❌ Google Cloud SDK not configured. Please run:');
  console.log('gcloud auth application-default login');
  console.log('Then run this script again.');
  process.exit(1);
}

const projectId = 'blytz-e9935';
const userData = {
  fields: {
    uid: { stringValue: 'YaDaYBRGnVMFXepKO9k8ddYRLUr2' },
    email: { stringValue: 'test@gmail.com' },
    displayName: { stringValue: 'SAS' },
    photoURL: { nullValue: null },
    phoneNumber: { nullValue: null },
    emailVerified: { booleanValue: true },
    role: { stringValue: 'buyer' },
    isVerified: { booleanValue: false },
    rating: { integerValue: 0 },
    totalSales: { integerValue: 0 },
    followers: { integerValue: 0 },
    createdAt: { timestampValue: new Date().toISOString() },
    updatedAt: { timestampValue: new Date().toISOString() }
  }
};

const notificationsData = {
  fields: {
    notifications: { arrayValue: { values: [] } },
    unreadCount: { integerValue: 0 },
    lastUpdated: { timestampValue: new Date().toISOString() }
  }
};

console.log('🚀 Adding authenticated user to Firebase...');

// Use curl to create the user document
const curlCommand = `curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/YaDaYBRGnVMFXepKO9k8ddYRLUr2" \
  -H "Authorization: Bearer ${accessToken}" \
  -H "Content-Type: application/json" \
  -d '${JSON.stringify(userData)}'`;

const notificationsCommand = `curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/notifications/YaDaYBRGnVMFXepKO9k8ddYRLUr2" \
  -H "Authorization: Bearer ${accessToken}" \
  -H "Content-Type: application/json" \
  -d '${JSON.stringify(notificationsData)}'`;

try {
  console.log('👤 Creating user document...');
  const userResult = execSync(curlCommand, { encoding: 'utf8' });
  console.log('✅ User document created');
  
  console.log('🔔 Creating notifications document...');
  const notificationsResult = execSync(notificationsCommand, { encoding: 'utf8' });
  console.log('✅ Notifications document created');
  
  console.log('🎉 Authenticated user successfully aligned with database structure!');
} catch (error) {
  console.error('❌ Error:', error.message);
}