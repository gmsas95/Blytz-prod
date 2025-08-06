#!/bin/bash

# Create user documents for authenticated users using curl
# This script assumes the Firebase emulator is running

echo "Creating user documents for authenticated users..."

# Pablo
 curl -X PATCH "http://localhost:8080/v1/projects/demo-blytz/databases/(default)/documents/users/08SkOtmWnWUVX7OR2mD4TTFEfUy2" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "08SkOtmWnWUVX7OR2mD4TTFEfUy2"},
      "email": {"stringValue": "pablo@gmail.com"},
      "displayName": {"stringValue": "Pablo"},
      "photoURL": {"nullValue": null},
      "phoneNumber": {"nullValue": null},
      "emailVerified": {"booleanValue": false},
      "role": {"stringValue": "buyer"},
      "isVerified": {"booleanValue": false},
      "rating": {"integerValue": 0},
      "totalSales": {"integerValue": 0},
      "followers": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-08-03T14:00:00Z"},
      "updatedAt": {"timestampValue": "2024-08-03T14:00:00Z"}
    }
  }'

# Janella
 curl -X PATCH "http://localhost:8080/v1/projects/demo-blytz/databases/(default)/documents/users/VQojzaRNI5Qzb9AARqaPQY48LZB2" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "VQojzaRNI5Qzb9AARqaPQY48LZB2"},
      "email": {"stringValue": "janella@gmail.com"},
      "displayName": {"stringValue": "Janella"},
      "photoURL": {"nullValue": null},
      "phoneNumber": {"nullValue": null},
      "emailVerified": {"booleanValue": false},
      "role": {"stringValue": "buyer"},
      "isVerified": {"booleanValue": false},
      "rating": {"integerValue": 0},
      "totalSales": {"integerValue": 0},
      "followers": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-08-03T14:00:00Z"},
      "updatedAt": {"timestampValue": "2024-08-03T14:00:00Z"}
    }
  }'

# SAS
 curl -X PATCH "http://localhost:8080/v1/projects/demo-blytz/databases/(default)/documents/users/eEyVpAS2chU9Z3a8NkoQETbFwdJ3" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "uid": {"stringValue": "eEyVpAS2chU9Z3a8NkoQETbFwdJ3"},
      "email": {"stringValue": "sas@gmail.com"},
      "displayName": {"stringValue": "SAS"},
      "photoURL": {"nullValue": null},
      "phoneNumber": {"nullValue": null},
      "emailVerified": {"booleanValue": false},
      "role": {"stringValue": "buyer"},
      "isVerified": {"booleanValue": false},
      "rating": {"integerValue": 0},
      "totalSales": {"integerValue": 0},
      "followers": {"integerValue": 0},
      "createdAt": {"timestampValue": "2024-08-03T14:00:00Z"},
      "updatedAt": {"timestampValue": "2024-08-03T14:00:00Z"}
    }
  }'

echo "User documents created successfully!"