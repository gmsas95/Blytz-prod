#!/usr/bin/env node

/**
 * Firebase Authentication Debug Script
 * This script helps diagnose Firebase authentication issues
 */

const https = require('https');

// Your Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD6682piSztFJL7VVeyehO4K0kj1ZFBq-E',
  projectId: 'blytz-e9935',
  authDomain: 'blytz-e9935.firebaseapp.com',
};

async function checkFirebaseAuthStatus() {
  console.log('🔍 Checking Firebase Authentication Status...\n');
  
  // Check if API key is valid
  console.log('📋 Firebase Configuration:');
  console.log(`   API Key: ${FIREBASE_CONFIG.apiKey}`);
  console.log(`   Project ID: ${FIREBASE_CONFIG.projectId}`);
  console.log(`   Auth Domain: ${FIREBASE_CONFIG.authDomain}\n`);

  // Test API key accessibility
  const testApiKey = () => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ statusCode: res.statusCode, response });
          } catch (e) {
            resolve({ statusCode: res.statusCode, error: 'Invalid JSON response' });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ statusCode: 0, error: error.message });
      });

      // Send empty request to test API key
      req.write(JSON.stringify({}));
      req.end();
    });
  };

  console.log('🔑 Testing API Key...');
  const result = await testApiKey();
  
  if (result.statusCode === 400) {
    console.log('✅ API key is valid and accessible');
    console.log('   The 400 error is expected for empty request body');
  } else if (result.statusCode === 403) {
    console.log('❌ API key has restrictions or is invalid');
    console.log('   SOLUTION: Check Firebase Console > Project Settings > API Keys');
    console.log('   Ensure "Identity Toolkit API" is enabled for this key');
  } else if (result.statusCode === 0) {
    console.log('❌ Network error or API key not found');
    console.log('   SOLUTION: Verify API key is correct in Firebase Console');
  } else {
    console.log(`⚠️  Unexpected response: ${result.statusCode}`);
    console.log('   Response:', result.response || result.error);
  }

  console.log('\n🔧 Next Steps:');
  console.log('1. Go to https://console.firebase.google.com/project/blytz-e9935/settings/general');
  console.log('2. Check if "Authentication" is enabled in the left sidebar');
  console.log('3. Go to Project Settings > API Keys');
  console.log('4. Ensure your API key has no restrictions or has Identity Toolkit API allowed');
  console.log('5. Verify the API key in your .env file matches the one in Firebase Console');
  console.log('6. Try running: npx expo start --clear to clear cache');
}

// Run the diagnostic
if (require.main === module) {
  checkFirebaseAuthStatus().catch(console.error);
}

module.exports = { checkFirebaseAuthStatus };