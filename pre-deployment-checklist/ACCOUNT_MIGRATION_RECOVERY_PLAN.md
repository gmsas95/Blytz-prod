# Account Migration Recovery Plan (Worst-Case Scenario)

This document outlines the recovery process if you get locked out of your Google Cloud/Firebase project during the account ownership transfer.

This plan is only viable **before** your application has real user data. Executing this plan will result in a new, empty backend infrastructure. All existing data (users, Firestore documents, etc.) in the old project will be lost.

---

### The Core Concept: Code vs. Infrastructure

*   **Your Codebase (Safe):** The code in your Git repository is completely separate from the live Google Cloud infrastructure. It defines *how* your app works, but it isn't the infrastructure itself.
*   **Your Google/Firebase Project (Considered Lost):** This is the live infrastructure—the actual Firestore database, the user accounts in Authentication, the files in Cloud Storage, and the configured APIs. If you lose access, this is what becomes an "orphan."

---

### Recovery Steps: From Codebase to New Project

**1. Create a New Firebase Project**
*   **Action:** Using your **company Google account**, go to the [Firebase Console](https://console.firebase.google.com/) and create a brand new project.
*   **Result:** A new, empty Firebase project owned by your company from day one.

**2. Reconfigure Your Local Codebase**
This is the most crucial part: pointing your existing code to the *new* project.

*   **A. Update the Firebase Project Link:**
    *   In your terminal, at the root of your project, run this command. It will prompt you to select the new project you just created.
    ```bash
    firebase use --add
    ```
    *   This command updates your `.firebaserc` file, which links your local directory to a specific Firebase project.

*   **B. Replace Client Config Files:**
    *   Go to the **Project Settings** in your *new* Firebase project.
    *   Download the new `google-services.json` (for Android) and `GoogleService-Info.plist` (for iOS).
    *   Replace the old versions of these files in your `android/app/` and `ios/BlytzApp/` directories.

*   **C. Replace the Admin SDK Key:**
    *   In your *new* Firebase project's settings, go to the **Service Accounts** tab.
    *   Generate a new private key. A new `.json` key file will be downloaded.
    *   Find where you are using the old key (e.g., in a script or an environment variable) and replace it with the new one.

**3. Redeploy Your Backend**
Your code is configured. Now you need to push it to the new, empty infrastructure.

*   **A. Deploy Security Rules:**
    ```bash
    firebase deploy --only firestore:rules,storage:rules
    ```
*   **B. Deploy Cloud Functions:**
    ```bash
    firebase deploy --only functions
    ```

**4. Re-seed All Your Data**
Your new project is empty. You need to run all your data population scripts to fill it with the necessary demo data.

*   **Action:** Run your scripts from the `scripts/` directory (e.g., `populate_demo_data.js`, `create_users.js`, etc.) against the new project.

**5. (Optional but Recommended) Create a New Git Repo**
*   To avoid any confusion, you might want to treat this as a new project entirely. Push your reconfigured codebase to a new, clean Git repository.
