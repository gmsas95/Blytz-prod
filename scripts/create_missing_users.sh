#!/bin/bash

# Create missing user documents for authenticated users
firebase firestore:set users/08SkOtmWnWUVX7OR2mD4TTFEfUy2 --data '{"uid": "08SkOtmWnWUVX7OR2mD4TTFEfUy2", "email": "pablo@gmail.com", "displayName": "Pablo", "role": "buyer", "isVerified": false, "rating": 0, "totalSales": 0, "followers": 0, "emailVerified": false, "createdAt": "2024-08-03T14:00:00Z", "updatedAt": "2024-08-03T14:00:00Z"}' --project blytz-e9935

firebase firestore:set users/VQojzaRNI5Qzb9AARqaPQY48LZB2 --data '{"uid": "VQojzaRNI5Qzb9AARqaPQY48LZB2", "email": "janella@gmail.com", "displayName": "Janella", "role": "buyer", "isVerified": false, "rating": 0, "totalSales": 0, "followers": 0, "emailVerified": false, "createdAt": "2024-08-03T14:00:00Z", "updatedAt": "2024-08-03T14:00:00Z"}' --project blytz-e9935

firebase firestore:set users/eEyVpAS2chU9Z3a8NkoQETbFwdJ3 --data '{"uid": "eEyVpAS2chU9Z3a8NkoQETbFwdJ3", "email": "sas@gmail.com", "displayName": "SAS", "role": "buyer", "isVerified": false, "rating": 0, "totalSales": 0, "followers": 0, "emailVerified": false, "createdAt": "2024-08-03T14:00:00Z", "updatedAt": "2024-08-03T14:00:00Z"}' --project blytz-e9935