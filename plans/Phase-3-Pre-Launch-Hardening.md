# Phase 3: Pre-Launch Hardening

### 1. Performance & Profiling
- **Task:** Identify and resolve performance bottlenecks.
- **AC:**
    - Profiling tools (Flipper, etc.) are used for analysis.
    - Optimizations (`React.memo`, `useCallback`, `FlatList`) are applied.
    - Images are optimized.
    - App startup time is measured and improved.

### 2. UI/UX Polish
- **Task:** Conduct a full design review for consistency and quality.
- **AC:**
    - All screens match design specs.
    - Skeleton loaders are implemented for all data-dependent views.
    - Forms have proper error handling.
    - App is tested on various device sizes.

### 3. End-to-End (E2E) Testing
- **Task:** Test all critical user flows from start to finish.
- **AC:**
    - A formal E2E test plan is created and executed.
    - Flows are tested on physical iOS and Android devices.
    - Key flows: New User Registration & Bid, Winning & Checkout, Seller Stream & Sale.

### 4. Basic CI/CD Pipeline
- **Task:** Automate testing and builds.
- **AC:**
    - CI/CD configuration (e.g., GitHub Actions) is created.
    - Pipeline triggers on push to `main`/`develop`.
    - Pipeline runs `install`, `tsc`, `eslint`, and `test` commands.
    - (Optional) Pipeline generates signed debug builds.

### 5. App Store Submission Prep
- **Task:** Create and gather all assets for store submission.
- **AC:**
    - App icons and splash screens are created.
    - High-quality screenshots and video previews are ready.
    - Store descriptions and metadata are written.
    - Privacy policy and ToS are finalized and linked.