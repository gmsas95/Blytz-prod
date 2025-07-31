# MVP Action Plan: Livestream E-Commerce App
*Generated: 2025-07-27*

## Current Status Analysis
- ✅ **Foundation**: 70% complete (auth, navigation, basic UI)
- ❌ **Commerce Engine**: 0% complete (no working payments, bidding, or seller tools)
- ❌ **Live Stream Commerce**: 30% complete (UI exists, no backend logic)

---

## Phase 1: Seller Onboarding & Registration (Week 1)
**Goal**: Enable sellers to join the platform

### Week 1 Checklist

#### Seller Registration Flow
- [ ] Create `SellerSignupScreen.tsx` (extend existing auth)
- [ ] Add business verification fields:
  - Business name
  - Tax ID/SSM number
  - Bank account details for payouts
  - Business address verification
- [ ] Connect to Firestore `sellers` collection
- [ ] Add seller role to user claims: `auth.setCustomUserClaims(uid, {seller: true})`

#### Seller Profile Setup
- [ ] Complete `SellerProfileScreen.tsx` with editable fields
- [ ] Add business logo upload to Firebase Storage
- [ ] Create `SellerDashboardScreen.tsx` with stats:
  - Active live streams count
  - Total sales revenue
  - Pending orders
  - Customer reviews

#### Navigation Updates
- [ ] Add conditional navigation (seller vs buyer views)
- [ ] Create `SellerNavigator.tsx` for seller-specific flows
- [ ] Update tab navigation based on user role

---

## Phase 2: Stream Creation & Management (Week 1-2)
**Goal**: Sellers can create and manage live streams

### Week 1-2 Checklist

#### Stream Creation
- [ ] Complete `ScheduleStreamScreen.tsx` with form validation:
  - Stream title and description
  - Scheduled start time
  - Product categories
  - Thumbnail upload
- [ ] Add product upload during stream scheduling
- [ ] Create `CreateProductScreen.tsx` for adding products to streams
- [ ] Implement `useCreateStream` hook with Firestore integration

#### Stream Management
- [ ] Build `LiveStreamHostScreen.tsx` with camera integration
- [ ] Add real-time product management:
  - Add/remove products during stream
  - Update product prices
  - Mark products as sold
- [ ] Create `StreamControls` component:
  - Start stream button
  - Pause/resume functionality
  - End stream with confirmation
- [ ] Implement viewer count tracking

#### Backend Setup
- [ ] Create Cloud Functions:
  - `createStream` - Initialize new stream
  - `updateStream` - Modify stream details
  - `endStream` - Close stream and trigger winner notifications
- [ ] Set up Firestore collections:
  - `streams` - Stream metadata
  - `products` - Product catalog
  - `stream_products` - Products in specific streams

---

## Phase 3: Secure Bidding System (Week 2-3)
**Goal**: Safe, real-time bidding with automatic price updates

### Week 2-3 Checklist

#### Cloud Functions (Critical)
```typescript
// functions/src/auctions.ts
exports.placeBid = functions.https.onCall(async (data, context) => {
  // 1. Validate authentication
  // 2. Validate bid amount > current price + minimum increment
  // 3. Check user has sufficient funds/pre-authorization
  // 4. Update auction current price
  // 5. Create bid record
  // 6. Notify previous highest bidder
  // 7. Notify all viewers via FCM
});

exports.finalizeAuction = functions.https.onCall(async (data, context) => {
  // 1. Determine auction winner
  // 2. Create order record
  // 3. Process payment pre-authorization
  // 4. Notify winner and seller
  // 5. Update inventory
});
```

#### Bid Implementation
- [ ] Create `useBidding` hook with real-time listeners
- [ ] Update `BidOverlayComponent.tsx` with secure bid placement
- [ ] Add bid history tracking in `LiveStreamViewerScreen`
- [ ] Implement minimum bid increments (10% or RM5 minimum)
- [ ] Add bid confirmation modal

#### Real-time Updates
- [ ] WebSocket connection for bid updates
- [ ] Push notifications for outbid alerts
- [ ] Auto-refresh product pricing
- [ ] Real-time bid countdown timer

---

## Phase 4: Payment Integration (Week 3-4)
**Goal**: Secure payment processing for auction winners

### Week 3-4 Checklist

#### Payment Setup
- [ ] Add Fiuu API keys to environment config
- [ ] Create `PaymentService.ts` with Fiuu integration:
  ```typescript
  // src/services/payments/Fiuu.ts
  export const processPayment = async (amount: number, customerId: string) => {
    // Fiuu API integration
  };
  ```
- [ ] Implement pre-authorization for bidding (hold funds)
- [ ] Create payment method management screens

#### Checkout Flow
- [ ] Complete `CheckoutScreen.tsx` with actual payment processing
- [ ] Add order creation in Firestore `orders` collection
- [ ] Create `OrderConfirmationScreen.tsx` with order details
- [ ] Implement payment failure handling + retry mechanism
- [ ] Add payment webhook handlers

#### Payment Security
- [ ] Add 3D Secure authentication
- [ ] Implement PCI compliance measures
- [ ] Create refund system for cancelled orders
- [ ] Add fraud detection rules

---

## Phase 5: Order Management (Week 4)
**Goal**: End-to-end order fulfillment

### Week 4 Checklist

#### Buyer Experience
- [ ] Complete `MyOrdersScreen.tsx` with order tracking:
  - Order status (pending, confirmed, shipped, delivered)
  - Real-time tracking updates
  - Estimated delivery dates
- [ ] Add `OrderDetailScreen.tsx` with:
  - Full order information
  - Shipping updates
  - Contact seller option
- [ ] Create `MyWinsScreen.tsx` for auction winners

#### Seller Experience
- [ ] Build order management in `SellerDashboardScreen`:
  - Incoming orders list
  - Order status updates
  - Shipping label generation
- [ ] Add payout system for sellers:
  - Automated weekly payouts
  - Sales reports
  - Tax documentation

#### Logistics Integration
- [ ] Complete `getShippingRates` with real providers:
  - PosLaju integration
  - DHL eCommerce
  - J&T Express
- [ ] Add tracking number input for sellers
- [ ] Implement delivery confirmation

---

## Phase 6: Testing & Launch Prep (Week 5)
**Goal**: Production-ready app

### Week 5 Checklist

#### Security Audit
- [ ] Review all Firestore rules
- [ ] Test payment security
- [ ] Validate user input sanitization
- [ ] Implement rate limiting on APIs

#### Performance Testing
- [ ] Load test with 100+ concurrent users
- [ ] Optimize image loading:
  - Lazy loading
  - Image caching
  - Compression
- [ ] Test on low-end devices (Android 8+, iOS 12+)
- [ ] Memory leak testing

#### Launch Preparation
- [ ] App Store screenshots + descriptions
- [ ] Beta testing program:
  - 10 sellers
  - 50 buyers
  - 1 week testing period
- [ ] Create onboarding documentation
- [ ] Set up customer support system
- [ ] Create launch marketing materials

---

## Quick Start Actions (Today)

### Immediate Setup (30 minutes)
1. **Set up Cloud Functions project**:
   ```bash
   cd functions
   npm install firebase-functions@latest firebase-admin@latest
   firebase deploy --only functions
   ```

2. **Add Fiuu sandbox keys** to `app.config.js`:
   ```javascript
   extra: {
     FiuuApiKey: process.env.Fiuu_API_KEY,
     FiuuSecretKey: process.env.Fiuu_SECRET_KEY,
     FiuuEnvironment: 'sandbox',
   }
   ```

3. **Create seller registration branch**:
   ```bash
   git checkout -b feature/seller-onboarding
   ```

4. **Set up Firebase App Check** for security

---

## Daily Task Breakdown

| **Week** | **Monday** | **Tuesday** | **Wednesday** | **Thursday** | **Friday** |
|----------|-------------|-------------|---------------|---------------|---------------|
| **Week 1** | Seller auth flow | Profile setup | Dashboard UI | Navigation logic | Integration testing |
| **Week 2** | Stream creation | Product upload | Host screen | Real-time sync | User testing |
| **Week 3** | Cloud Functions | Bid system | Notifications | Security rules | Load testing |
| **Week 4** | Payment setup | Checkout flow | Order creation | Logistics | End-to-end testing |
| **Week 5** | Security audit | Performance optimization | Beta testing | Bug fixes | Launch preparation |

---

## Critical Success Metrics

### MVP Success Criteria
- [ ] 1 working seller can go live
- [ ] 10 products can be auctioned simultaneously
- [ ] 5 buyers can place concurrent bids
- [ ] 1 successful payment processed end-to-end
- [ ] 1 complete order fulfilled (payment → shipping → delivery)

### Technical Metrics
- [ ] App load time < 3 seconds
- [ ] Bid latency < 500ms
- [ ] Payment processing < 10 seconds
- [ ] 99.9% uptime during streams
- [ ] Zero payment failures in testing

---

## Risk Mitigation

### Technical Risks
- **Payment failures**: Implement retry logic + fallback payment methods
- **Stream stability**: Use CDN for video delivery + backup streaming servers
- **Concurrent users**: Implement proper Firestore indexing + caching

### Business Risks
- **Seller adoption**: Create simple onboarding + tutorials
- **Payment disputes**: Clear terms of service + automated dispute resolution
- **Fraud prevention**: Identity verification + transaction monitoring

---

## Resource Requirements

### Team Allocation
- **1 Backend Developer**: Cloud Functions + Payment integration
- **1 Frontend Developer**: Seller flows + UI completion
- **1 QA Tester**: End-to-end testing + bug tracking
- **1 Product Manager**: User testing + launch coordination

### Budget Estimation
- **Cloud Functions**: ~$50/month (initial usage)
- **Payment Processing**: 3-5% transaction fees
- **Video Streaming**: ~$100/month (100 concurrent streams)
- **Testing**: $200 for beta testing incentives

This plan transforms your current "video app with auction UI" into a real "livestream e-commerce platform" with actual money flow in 5 weeks.
