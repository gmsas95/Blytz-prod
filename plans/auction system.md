### **System Context File: Livestream Bidding System**

This document outlines the architecture, data flow, and technical implementation details for a real-time livestream bidding system.

#### **1. System Overview**

The system is a hybrid-database architecture designed to leverage the strengths of both Firebase Realtime Database (RTDB) and Firestore.

  * **Firebase Realtime Database (RTDB):** Used for all **live, high-frequency, concurrent data updates**, specifically the bidding process itself. Its low-latency synchronization is ideal for displaying the current bid to all users simultaneously.
  * **Firebase Cloud Functions:** Serves as the serverless backend. It handles all critical **business logic**, such as bid validation, state management, and data synchronization between the two databases. This ensures data integrity and prevents fraud.
  * **Firebase Firestore:** Used for **long-term storage** of permanent records, such as completed auctions, user profiles, and transaction history. Its collection/document model is ideal for structured data and complex queries.
  * **Firebase Authentication:** Handles user sign-up, login, and access control. All bidding actions are authenticated to ensure only logged-in users can participate.
  * **Third-Party Live Video Service:** The system does not handle video streaming directly. A low-latency live video provider (e.g., Mux, Dolby.io) is integrated on the client-side to handle the video stream.

-----

#### **2. Data Flow**

The data flow is a controlled process that moves information from the client to the database and back, ensuring data integrity at every step.

1.  **User Places Bid:** A bidder on the client-side application taps a button to place a bid.
2.  **Client-Side Write:** The client app sends the new bid data (user ID, bid amount, timestamp) to a specific path in the **RTDB** (e.g., `auctions/$auctionId/bids`). This is an initial, temporary write.
3.  **Cloud Function Trigger:** This write triggers the **`onBidPlaced` Cloud Function**.
4.  **Backend Validation (Cloud Function):** The function performs a critical validation check:
      * It uses a **database transaction** to read the current highest bid from `auctions/$auctionId/currentBid`.
      * It checks if the new bid's amount is higher than the current highest bid.
      * It verifies the user's ID to prevent forged bids.
5.  **RTDB Update:** If the bid is valid, the Cloud Function updates the `auctions/$auctionId/currentBid` node with the new, highest bid data. This update is **atomic** and prevents race conditions.
6.  **Real-time Sync:** The RTDB's real-time nature automatically and instantly pushes this updated `currentBid` value to all connected client applications, updating the UI for every user watching the auction.
7.  **Outbid Notification:** A separate Cloud Function is triggered by the `onBidPlaced` event. It identifies the previous highest bidder and sends a push notification via **Firebase Cloud Messaging (FCM)**.
8.  **Auction Ends:** A scheduled or manually triggered Cloud Function (`endAuction`) checks if the auction time has expired or if the seller has manually closed the auction.
9.  **RTDB to Firestore Transfer:** The `endAuction` Cloud Function performs the final data transfer:
      * It reads the final state of the auction from RTDB.
      * It writes a new, permanent document to a **Firestore** collection (e.g., `completedAuctions`). This document includes the winning bidder's UID and the final bid amount.
      * It marks the auction as `'closed'` in the RTDB.
10. **Winner Notification:** The `endAuction` function sends a final notification to the winner and the seller.

-----

#### **3. Database Setup**

##### **Firebase Realtime Database (RTDB) Schema**

```json
{
  "auctions": {
    "auction_id_1": {
      "itemDetails": {
        "title": "Vintage Comic Book",
        "description": "First edition, mint condition.",
        "sellerId": "seller_uid_abc"
      },
      "status": "live",
      "startTime": 1678885800000,
      "endTime": 1678886500000,
      "bidHistory": {
        "bid_id_1": {
          "bidderId": "bidder_uid_123",
          "amount": 100,
          "timestamp": 1678885810000
        },
        "bid_id_2": {
          "bidderId": "bidder_uid_456",
          "amount": 150,
          "timestamp": 1678885820000
        }
      },
      "currentBid": {
        "amount": 150,
        "bidderId": "bidder_uid_456",
        "timestamp": 1678885820000
      }
    }
  }
}
```

##### **Firebase Firestore Collection Structure**

A `completedAuctions` collection will hold the final results.

```json
/completedAuctions/{auction_id_1}
|-- winnerId: "bidder_uid_456"
|-- finalBid: 150
|-- finalBidTime: 1678886500000
|-- itemDetails: { ... }
|-- sellerId: "seller_uid_abc"
```

-----

#### **4. Cloud Functions Logic**

  * **`onBidPlaced`:**
      * **Trigger:** `onWrite` to `auctions/{auctionId}/bidHistory/{bidId}`.
      * **Action:** Validates bid and updates `auctions/{auctionId}/currentBid` via a transaction.
  * **`endAuction`:**
      * **Trigger:** `onUpdate` to `auctions/{auctionId}/status`. Or a scheduled cron job.
      * **Action:** Reads final data from RTDB, writes a new document to Firestore, and sends notifications.
  * **`sendOutbidNotification`:**
      * **Trigger:** `onUpdate` to `auctions/{auctionId}/currentBid`.
      * **Action:** Sends an FCM notification to the previous highest bidder.

-----

#### **5. Security Rules**

**Firebase Realtime Database Rules:**

```json
{
  "rules": {
    "auctions": {
      "$auctionId": {
        ".read": "true",
        "bidHistory": {
          ".write": "auth != null"
        },
        "currentBid": {
          ".write": "false",
          ".validate": "false"
        }
      }
    },
    ".write": "false"
  }
}
```

*Note: `currentBid` is only writable by the server via the Admin SDK, which is why `.write` is set to `false` for clients.*

**Firebase Firestore Rules:**

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /completedAuctions/{document=**} {
      // Only the server can write to this collection
      allow write: if false; 
      // Anyone can read completed auctions
      allow read: if true; 
    }
  }
}
```