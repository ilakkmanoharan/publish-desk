# Firebase setup for Publish Desk

The app uses **Firebase** (Auth, Firestore, Storage). No `.env` is required for basic use; config is in `lib/firebase/config.ts` (from your Firebase project).

## 1. Deploy Firestore rules

From the project root:

```bash
firebase deploy --only firestore:rules
```

Or copy the contents of `firestore.rules` into the Firebase Console → Firestore → Rules.

## 2. Deploy Storage rules

```bash
firebase deploy --only storage
```

Or copy `storage.rules` into Firebase Console → Storage → Rules.

## 3. Auth

Email/Password and Google sign-in must be enabled in Firebase Console → Authentication → Sign-in method (already done per your details).

## 4. Images in content

Images in markdown can be stored in Firebase Storage. Use `lib/storage.ts` → `uploadContentImage(userId, contentId, dataUrlOrBlob)` when saving content that contains inline images, then replace the image source in the markdown body with the returned URL.

## 5. GitHub repo as content library

Users can connect a **GitHub repository URL** (e.g. `https://github.com/ilakkmanoharan/content-library`) in **Dashboard → Content source**. The app fetches **all .md files** from the repo (ignoring .gitignore), organizes them by **folder = category**, and syncs them into the dashboard so they can be assigned to magazines.

For **Sync from GitHub** to work, the API route must verify the user and write to Firestore. That requires the **Firebase Admin SDK** and a **service account**:

1. In Firebase Console → Project settings → Service accounts, click **Generate new private key**.
2. Set the JSON contents as an env var (e.g. in Vercel or `.env.local`):
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```
   (Use single quotes and paste the whole JSON; escape any single quotes inside.)

After that, **Sync from GitHub** on the Content source page will work. Public repos only (no GitHub token required).
