# Blytz App Development Checklist (MVP Focus)

This checklist is designed to be used iteratively throughout the development of the Blytz app, allowing for regular progress reviews and adjustments as needed.

**Phase 1: Project Setup & Core Configuration**

-   [x] 1. **Environment Variable Management:**
    -   [x] Establish `.env` and `.env.production` files.
    -   [x] Set up `src/config/env.ts` for secure, typed access to all environment-specific keys (Firebase, Alibaba Apsara, Curlec, Logistics).
-   [x] 2. **Styling System Setup:**
    -   [x] Install and configure TailwindCSS (if chosen).
    -   [x] Ensure proficiency with `StyleSheet.create` for localized styles.
    -   [x] Create a central `src/config/theme.ts` for managing design tokens (colors, spacing, typography).
-   [x] 3. **Navigation Configuration:**
    -   [x] Define the primary application navigation flow (e.g., Stack Navigator, Tab Navigator).
    -   [x] Centralize navigation configuration in `src/navigation/index.ts` and feature-specific navigation modules.
-   [x] 4. **Firebase Core Integration:**
    -   [x] Initialize Firebase services within the application.
    -   [x] Implement the typed Firebase service layer in `src/services/firebase/` for:
        -   [x] Authentication (`auth.ts`)
        -   [x] Firestore (`firestore.ts`)
        -   [x] Storage (`storage.ts`)
        -   [x] Cloud Functions (`functions.ts`)
    -   [x] Define initial Firestore data models and converters in `src/types/models/` for core MVP entities (e.g., `User`, `LiveStream`, `Product`).
-   [x] 5. **Global State Management Initialization:**
    -   [x] Set up essential React Contexts in `src/context/` for global state concerns (e.g., `AuthContext`, `ThemeContext`).

**Phase 2: Feature Development (Iterative - Repeat for Each Feature)**

For each core MVP feature (e.g., User Authentication, Live Stream Viewing, Basic Bidding, Seller Stream Hosting, Order Checkout):

-   [ ] 1. **Feature Structure Definition:**
    -   [ ] Create a dedicated folder for the feature within `src/screens/`.
    -   [ ] Create component subfolders within `src/components/` for feature-specific components.
    -   [ ] Develop a dedicated service file in `src/services/` for feature-specific API interactions.
    -   [ ] Define any new Firestore document interfaces required in `src/types/models/`.
    -   [ ] Create custom hooks in `src/hooks/` for complex logic or Firebase interactions.
-   [x] 2. **Screen & Navigation Implementation:**
    -   [x] Develop the primary screen components for the feature.
    -   [x] Integrate these screens into the relevant navigation stacks within `src/navigation/`.
-   \[ \] 3. **UI Component Construction:**
    -   \[ \] Identify reusable UI patterns and extract them into components.
    -   \[ \] Place generic components in `src/components/` and feature-specific ones in `src/components/{feature}/`.
    -   \[ \] Apply styles using `StyleSheet.create` and/or TailwindCSS classes, adhering to theme tokens.
    -   \[ \] Integrate accessibility labels and semantic elements.
-   \[ \] 4. **State Management & Data Flow:**
    -   \[ \] Use `useState` for component-specific UI state.
    -   \[ \] Integrate with existing React Contexts for global state.
    -   \[ \] Consider Zustand for complex feature-specific state (if needed for MVP).
    -   \[ \] Enforce TypeScript interfaces for all data structures.
    -   \[ \] Utilize Firestore converters for type-safe data handling.
-   \[ \] 5. **API Integration & Business Logic (Services & Hooks):**
    -   \[ \] Route all external service interactions through dedicated service modules.
    -   \[ \] Use `async/await` with `try/catch` for all asynchronous operations.
    -   \[ \] Implement loading states and retry mechanisms for API calls.
    -   \[ \] Leverage Firebase service layers for all Firebase interactions (including Cloud Functions for complex logic).
    -   \[ \] Create an abstraction layer for Alibaba Apsara streaming (if applicable).
    -   \[ \] Isolate Curlec payment logic.
    -   \[ \] Implement logistics provider API calls (for label generation and tracking, if applicable).
-   \[ \] 6. **Error Handling & Logging Implementation:**
    -   \[ \] Apply a consistent error and notification handling strategy.
    -   \[ \] Display clear, actionable error messages to the user.
    -   \[ \] Integrate Firebase Crashlytics for crash reporting.
-   \[ \] 7. **Testing Strategy:**
    -   \[ \] Write unit tests for service modules, hooks, and core logic.
    -   \[ \] Develop UI tests for components and screens.
    -   \[ \] Mock external dependencies in tests.
    -   \[ \] Prioritize testing core user flows and critical business logic.
    -   \[ \] Implement end-to-end tests for critical user paths.
-   \[ \] 8. **Performance Optimization:**
    -   \[ \] Apply performance guidelines (e.g., `React.memo`, `useCallback`, pagination, virtualization) where beneficial.
    -   \[ \] Profile the app's core flows and address any major bottlenecks.

**Ongoing:**

-   \[ \] Regularly review and update this checklist.
-   \[ \] Conduct code reviews and ensure adherence to best practices.
-   \[ \] Address technical debt and refactor code as needed.
-   \[ \] Continuously monitor app performance and user feedback.
-   \[ \] Update documentation to reflect changes and new features.

Remember to mark items as complete as you progress through development. This checklist will help you stay organized and ensure that all critical aspects of the app are addressed.