# Blytz Live Auction App (MVP Focus)

## 1. Core Principles
- **Purpose:** Real-time mobile auction app. MVP core feature is the seller-focused live stream.
- **Structure:** Feature-first organization (`src/{feature}`). Use `index.ts` for clean exports.
- **Workflow:**
    1.  **Fact-Check First:** Verify dependency and config changes from official sources.
    2.  **Pre-Completion Checks:** Before finishing a task, run `npx expo install --check`, `npx expo-doctor`, `npx tsc`, and `npx eslint`.

## 2. Code & Tech Standards
- **TypeScript:** Use **strictly**. Avoid `any`.
- **Components:** Functional components with Hooks only. Use explicit prop interfaces.
- **State:** `React Context` for global, `useState` for local. Consider `Zustand` for complex state.
- **Styling:** `StyleSheet.create` or **TailwindCSS**. No inline styles. Use theme tokens from `src/config/theme.ts`.
- **Async:** Use `async/await` with `try/catch`. Implement loading states.
- **Firebase:**
    - Use secure Firestore rules, `onSnapshot` for real-time data, and Firestore converters for type safety.
    - Offload complex logic (bidding, payouts) to **Cloud Functions**.
    - Centralize services in `src/services/firebase/`.
    - Define models in `src/types/models/`.
    - Abstract logic with custom hooks (`useAuth`, `useFirestore`).
- **Streaming (Alibaba Apsara):** Use a service abstraction layer (`src/services/streaming.ts`) to manage the SDK, secure URLs, and handle fallbacks.
- **Payments (Curlec):** Use **Curlec**. Process 8% platform fee via Cloud Functions. Abstract all logic in `src/services/payments/curlec.ts`.
- **Logistics:** Integrate API for shipping labels and tracking. Centralize in `src/services/logistics/`.
- **Secrets:** Store all keys in `.env` and access via typed `src/config/env.ts`.

## 3. Development Guidelines
- **Testing:**
    - **Tools:** `jest` for unit, `@testing-library/react-native` for UI.
    - **Mocks:** Mock all external APIs (Firebase, Apsara, Curlec, Logistics).
    - **Coverage:** Aim for **70%+** on critical business logic for MVP.
- **Performance:** Use `React.memo`, `useCallback`, `useMemo`. Virtualize long lists with `FlatList`. Paginate queries.
- **Error Handling:** Use a centralized logger (e.g., Firebase Crashlytics). Provide user-friendly error messages.
- **Security:**
    - Use secure storage for sensitive data on-device.
    - Validate all input on both client and server (Cloud Functions).
    - Use Firebase Auth; avoid custom auth schemes.
- **Best Practices:**
    - Sanitize user-generated content.
    - Use `src/utils/` for shared helper functions.
    - Use `TODO:` and `FIXME:` comment prefixes.
    - Clean up listeners and subscriptions to prevent memory leaks.

## 4. MVP Scope & Deferred Features
- **Core MVP Notifications:** "Stream starting," "Outbid," "Auction won," "Order shipped."
- **Core MVP Deep Linking:** Direct links to streams, profiles, or products.
- **Deferred for Post-MVP:**
    - Advanced i18n/l10n.
    - Complex offline capabilities.
    - Advanced deep linking and analytics.
    - Full CI/CD pipelines.
    - Formal security audits.

## 5. Screen Architecture (MVP)
- **Auth:** `LoginScreen`, `SignupScreen`, `ForgotPasswordScreen`
- **Home:** `HomeScreen`, `DiscoverScreen`
- **LiveStream:**
    - **Viewer:** `LiveStreamViewerScreen` (with `LiveChat`, `ProductCarousel`, `BidOverlay` components)
    - **Host:** `LiveStreamHostScreen` (MVP for sellers)
    - `ScheduleStreamScreen`, `PreviousStreamsScreen`
- **Product:** `ProductDetailScreen`, `ProductListScreen`
- **SellerProfile:** `SellerProfileScreen`, `FollowedSellersScreen`, `SellerDashboardScreen` (MVP for sellers)
- **UserProfile:** `MyProfileScreen`, `EditProfileScreen`, `SettingsScreen`, `MyOrdersScreen`, `MyBidsScreen`, `MyWinsScreen`
- **Checkout:** `ShippingAddressScreen`, `PaymentMethodScreen`, `OrderSummaryScreen`, `OrderConfirmationScreen`
- **Notifications:** `NotificationsScreen`
- **Other:** `HelpSupportScreen`