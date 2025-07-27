# Phase 1: Foundation Solidification

### 1. TypeScript Migration
- **Task:** Migrate all JS files from `build/` to TS in `src/`.
- **AC:**
    - `build/` directory is removed.
    - App runs from `src/` only.
    - `npx tsc --noEmit` passes.
    - `any` type is avoided.

### 2. Testing Framework
- **Task:** Configure Jest & `@testing-library/react-native`.
- **AC:**
    - `jest.config.js` is created.
    - `__tests__/` directory exists.
    - Mocks for external services are in `__tests__/mocks/`.
    - Initial unit tests for `auth.ts` and `firestore.ts` exist.
    - One simple component test exists.

### 3. Core Auth Flow
- **Task:** Secure and polish the entire authentication and onboarding flow.
- **AC:**
    - All screens in `src/screens/Auth/` are functional.
    - `useAuth` hook and `AuthContext` are used correctly.
    - Secure storage is used for tokens.
    - Firestore rules for auth are reviewed and tested.

### 4. Core Live Stream Viewer
- **Task:** Implement the primary user experience for viewing a live stream.
- **AC:**
    - `LiveStreamViewerScreen.tsx` plays a test stream via `streaming.ts`.
    - `useLiveStream` hook manages stream state.
    - `LiveChatComponent` is real-time.
    - `ProductCarouselComponent` displays products.
    - `BidOverlayComponent` shows real-time bid updates.