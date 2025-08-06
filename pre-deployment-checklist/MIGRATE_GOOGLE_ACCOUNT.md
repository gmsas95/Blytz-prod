
# How to Migrate Google Cloud & Firebase to a Company Account

This guide outlines the steps to transfer ownership of your Google Cloud and Firebase project from a personal account to a company-managed account.

**Overall Difficulty:** Moderately Complex. Requires careful execution to avoid losing access to the project.

---

### Key Areas to Update

Your personal email is likely tied to the project in these core places:

1.  **Firebase & Google Cloud Project Ownership:** Your Firebase project *is* a Google Cloud project. Your personal account is currently the "Owner," giving it full control. The goal is to transfer this ownership to a company account.
2.  **Service Accounts:** Your backend code (like Cloud Functions or the scripts in your `scripts` folder) uses Service Account keys (`.json` files) to authenticate with Google/Firebase services. While these belong to the *project*, you'll want to ensure they are managed by the new company owner.
3.  **Local Development Environment:** Your local Firebase CLI and Google Cloud CLI are authenticated with your personal account. You'll need to switch this to the company account.
4.  **Client-Side Config Files:** The `google-services.json` (for Android) and `GoogleService-Info.plist` (for iOS) files connect your mobile app to your Firebase project. These should be refreshed after the ownership change.

---

### Step-by-Step Migration Plan

#### 1. Transfer Project Ownership (The Most Critical Step)

This is the core of the migration. The best practice is to assign ownership to a **Google Group** that your company controls (e.g., `gcp-admins@yourcompany.com`), but you can also transfer it to a specific company email address.

*   **Action:**
    1.  Log in to the [Google Cloud Console](https://console.cloud.google.com/) with your **current personal account**.
    2.  Navigate to **IAM & Admin** > **IAM**.
    3.  Click **"Grant Access"** at the top.
    4.  In the "New principals" field, add the **company email address** (or Google Group).
    5.  In the "Assign roles" dropdown, select the **"Owner"** role.
    6.  Click **Save**.
*   **Verification:** The new company account will receive an email invitation to become an owner. They **must accept it**.
*   **Cleanup (Important):** Once the company account has accepted ownership, you should ideally **remove your personal account** from the "Owner" role to complete the transfer. You can keep it as an "Editor" if you still need to manage the project.

#### 2. Update Local Development Environment

*   **Action:** On your development machine, you need to switch the logged-in user.
    1.  **Log out the old account:**
        ```bash
        firebase logout
        gcloud auth revoke
        ```
    2.  **Log in with the new company account:**
        ```bash
        firebase login
        gcloud auth login
        ```
*   **Verification:** Run `firebase projects:list` to ensure you can see and access the project with the new account.

#### 3. Audit Service Account Keys

Your scripts like `firebase-admin-seed.js` likely use a service account key. While the existing keys will still work (they belong to the project, not you), it's good practice to create a new key under the new ownership.

*   **Action:**
    1.  In the Google Cloud Console (logged in as the **new company owner**), go to **IAM & Admin** > **Service Accounts**.
    2.  Select the relevant service account (often `firebase-adminsdk-...`).
    3.  Go to the **"Keys"** tab, click **"Add Key"** > **"Create new key"**, and download the new JSON file.
    4.  Securely store this new key and update any scripts or server environments that use the old one.

#### 4. Refresh Client Config Files

*   **Action:**
    1.  Log in to the [Firebase Console](https://console.firebase.google.com/) with the **new company account**.
    2.  Go to **Project Settings**.
    3.  Under the "Your apps" card, download the `google-services.json` for your Android app and the `GoogleService-Info.plist` for your iOS app.
    4.  Replace the existing files in your `android/app/` and `ios/BlytzApp/` directories with these new ones.
