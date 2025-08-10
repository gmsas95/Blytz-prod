# Blytz UI Design System (Updated for Mobile)

This document outlines the strict design system for the Blytz application. All UI/UX design and development must adhere to these guidelines to ensure a consistent, high-quality, and professional user experience.

## 1. Design Philosophy

The Blytz app must embody a **modern, clean, and user-centric** aesthetic. The UI should feel vibrant and engaging, with a clear focus on usability and accessibility. Every design choice should prioritize clarity and ease of use.

## 2. Color Palette

The following color palette is to be used exclusively throughout the application. Do not introduce new colors without updating this design system.

- **Primary:** `#FF385C`
- **Primary Variant:** `#E0002D`
- **Secondary:** `#A0A0A0`
- **Secondary Variant:** `#808080`
- **Background:** `#121212`
- **Surface:** `#333333`
- **Error:** `#B00020`
- **On Primary:** `#FFFFFF`
- **On Secondary:** `#FFFFFF`
- **On Background:** `#FFFFFF`
- **On Surface:** `#FFFFFF`
- **On Error:** `#FFFFFF`

## 3. Typography (Optimized for Mobile)

All text in the application must use the **Inter** font family. If Inter is not available, use a system default sans-serif font. All sizes are in `dp`.

- **H1:** fontSize: `40`, fontWeight: `700`, letterSpacing: `-1.0` — for page titles and hero text
- **H2:** fontSize: `32`, fontWeight: `700`, letterSpacing: `-0.5` — for section headers
- **H3:** fontSize: `28`, fontWeight: `600`, letterSpacing: `0` — for subsections and large cards
- **H4:** fontSize: `24`, fontWeight: `600`, letterSpacing: `0.15` — for card titles
- **H5:** fontSize: `20`, fontWeight: `500`, letterSpacing: `0.1` — for smaller section headers
- **H6:** fontSize: `18`, fontWeight: `500`, letterSpacing: `0.1` — for labels and form headings
- **Subtitle1:** fontSize: `16`, fontWeight: `500`, letterSpacing: `0.15` — for subheadings
- **Subtitle2:** fontSize: `14`, fontWeight: `500`, letterSpacing: `0.1` — for captions under titles
- **Body1:** fontSize: `16`, fontWeight: `400`, letterSpacing: `0.5` — for primary paragraph text
- **Body2:** fontSize: `14`, fontWeight: `400`, letterSpacing: `0.25` — for secondary text
- **Button:** fontSize: `14`, fontWeight: `600`, letterSpacing: `1.25`, textTransform: `uppercase` — for all buttons
- **Caption:** fontSize: `12`, fontWeight: `400`, letterSpacing: `0.4` — for helper text and footnotes
- **Overline:** fontSize: `10`, fontWeight: `500`, letterSpacing: `1.0`, textTransform: `uppercase` — for category labels

All font sizes and weights must be consistent across screens.

## 4. Spacing & Layout

A consistent spacing system is crucial for a clean layout. All margins, padding, and positioning must be based on a **base unit of 8px**.

- `space-1`: `8px`
- `space-2`: `16px`
- `space-3`: `24px`
- `space-4`: `32px`
- `space-5`: `40px`

Use consistent vertical rhythm between elements. Spacing may double (16px, 32px, etc.) but should not break the 8px base unit.

## 5. Component States

All interactive components must have clearly defined visual states to provide feedback to the user.

- **Default:** Normal state
- **Pressed:** Lower elevation or background darken
- **Focused:** Highlighted outline or glow (for accessibility)
- **Disabled:** Reduced opacity and no interaction

## 6. Iconography

All icons must use the **Ionicons** library, in the **`outline`** style. Icon sizes should be:

- **Small:** 16dp
- **Medium (default):** 24dp
- **Large (buttons/cards):** 32dp
- Ensure padding is used consistently around all icons.

## 7. Accessibility (A11y)

Accessibility is a core design principle. All designs must adhere to:

- **Minimum Touch Target:** `44x44dp`
- **Color Contrast Ratio:** At least `4.5:1` for all text and interactive elements
- **Font scaling:** Allow dynamic font scaling via system settings
- **Screen reader compatibility:** All interactive elements must have labels and roles defined

## 8. Mobile-First Layout Strategy

All screens and components must be designed **mobile-first**.

- **Start with the smallest screen (e.g., 360x640 dp)**
- **Use Flexbox for layouts**
- **Avoid fixed widths/heights** — use `%`, `flex`, or `aspectRatio`
- **Test all components on small and medium screen breakpoints**

## 9. Screen Completion Status

| Screen                               | Status        |
| ------------------------------------ | ------------- |
| Auth/ForgotPasswordScreen.tsx        | Completed     |
| Auth/LoginScreen.tsx                 | Completed     |
| Auth/OnboardingScreens.tsx           | Completed     |
| Auth/SellerSignupScreen.tsx          | Completed     |
| Auth/SignupScreen.tsx                | Completed     |
| Cart/CartScreen.tsx                  | Completed     |
| Checkout/CheckoutScreen.tsx          | Completed     |
| Checkout/OrderConfirmationScreen.tsx | Not Started   |
| Checkout/OrderSummaryScreen.tsx      | Not Started   |
| Checkout/PaymentMethodScreen.tsx     | In Progress   |
| Checkout/PaymentSuccessScreen.tsx    | Completed     |
| Checkout/ProductCheckoutScreen.tsx   | Completed     |
| Checkout/ShippingAddressScreen.tsx   | Completed     |
| Home/DiscoverScreen.tsx              | Completed     |
| Home/HomeScreen.tsx                  | Completed     |
| LiveStream/seller/LiveStreamHostScreen.tsx | Completed     |
| LiveStream/seller/ScheduleStreamScreen.tsx | Not Started   |
| LiveStream/viewer/LiveStreamViewerScreen.tsx | Completed     |
| LiveStream/viewer/PreviousStreamsScreen.tsx | Not Started   |
| LiveStream/viewer/StreamEndedScreen.tsx | Not Started   |
| Notifications/NotificationsScreen.tsx| Completed     |
| Orders/SellerOrderManagementScreen.tsx | In Progress   |
| Orders/SellerOrdersScreen.tsx        | In Progress   |
| Other/AboutAppScreen.tsx             | Not Started   |
| Other/HelpSupportScreen.tsx          | Not Started   |
| Other/PrivacyPolicyScreen.tsx        | Not Started   |
| Other/TermsAndConditionsScreen.tsx   | Not Started   |
| Product/ProductDetailScreen.tsx      | Completed     |
| Product/ProductListScreen.tsx        | Not Started   |
| Products/AddProductScreen.tsx        | Completed     |
| Products/BulkUploadScreen.tsx        | Completed     |
| Products/CreateProductScreen.tsx     | Not Started   |
| Products/MyProductsScreen.tsx        | Completed     |
| Products/ProductDetailScreen.tsx     | Not Started   |
| Products/ProductDiscoveryScreen.tsx  | Completed     |
| **Reviews/ProductReviewsScreen.tsx** | **Not Started** |
| **Reviews/SubmitReviewScreen.tsx**   | **Not Started** |
| **Returns/RequestReturnScreen.tsx**  | **Not Started** |
| Seller/BusinessDocumentsScreen.tsx   | Completed     |
| Seller/EditSellerProfileScreen.tsx   | Completed     |
| Seller/SellerDashboardScreen.tsx     | Completed     |
| Seller/SellerProfileScreen.tsx       | Completed     |
| SellerProfile/FollowedSellersScreen.tsx | Not Started   |
| SellerProfile/SellerDashboardScreen.tsx | Not Started   |
| SellerProfile/SellerProfileScreen.tsx | Completed     |
| Streams/CreateStreamScreen.tsx       | Completed     |
| Streams/MyStreamsScreen.tsx          | Completed     |
| UserProfile/ChangePasswordScreen.tsx | Completed     |
| UserProfile/EditProfileScreen.tsx    | Completed     |
| UserProfile/MyBidsScreen.tsx         | Completed     |
| UserProfile/MyOrdersScreen.tsx       | In Progress   |
| **UserProfile/OrderDetailScreen.tsx**| **Not Started** |
| UserProfile/MyProfileScreen.tsx      | Completed     |
| UserProfile/MyWinsScreen.tsx         | Completed     |
| UserProfile/SettingsScreen.tsx       | Completed     |
