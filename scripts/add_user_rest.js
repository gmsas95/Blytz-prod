const https = require('https');

const projectId = 'total-casing-399720';
const collection = 'users';
const documentId = 'YaDaYBRGnVMFXepKO9k8ddYRLUr2';

const data = {
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

const postData = JSON.stringify(data);

const options = {
  hostname: 'firestore.googleapis.com',
  port: 443,
  path: `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${documentId}?key=`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();