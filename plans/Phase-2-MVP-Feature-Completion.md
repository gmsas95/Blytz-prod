# Phase 2: MVP Feature Completion

### 1. Seller-Side Streaming
- **Task:** Build the interface for sellers to host live auctions.
- **AC:**
    - `LiveStreamHostScreen.tsx` allows sellers to start/end streams.
    - Seller can select products to feature.
    - Host dashboard shows real-time chat, viewer count, and bids.
    - `ScheduleStreamScreen.tsx` is functional.
    - Seller actions are protected by Firestore rules.

### 2. Checkout & Payment Flow
- **Task:** Integrate Curlec and finalize the checkout process.
- **AC:**
    - `curlec.ts` service is implemented.
    - `CheckoutNavigator` screens are connected to the payment service.
    - Successful payment creates an order document in Firestore.
    - 8% platform fee is calculated and recorded.
    - API keys are managed via `.env` and `env.ts`.

### 3. Logistics & Shipping
- **Task:** Integrate the logistics provider's API.
- **AC:**
    - Logistics service in `src/services/logistics/` is implemented for label generation and tracking.
    - Seller can generate shipping labels from a dashboard.
    - Buyer can track orders in `MyOrdersScreen`.
    - API keys are securely managed.

### 4. Notification System
- **Task:** Develop backend and client-side handling for push notifications.
- **AC:**
    - Firebase Cloud Functions trigger notifications for key events (stream live, outbid, win, shipped).
    - `src/services/notifications/` service handles incoming FCM payloads.
    - Tapping a notification navigates to the correct screen.

### 5. Test Coverage
- **Task:** Write unit tests for all new services and hooks.
- **AC:**
    - Services (`payments`, `logistics`, `notifications`) are unit-tested with mocks.
    - Custom hooks are tested.
    - Test coverage for business logic is >= 70%.