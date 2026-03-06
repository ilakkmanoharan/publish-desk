import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return cert(JSON.parse(json) as ServiceAccount);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0] as ReturnType<typeof initializeApp>;
  }
  const cred = getCredential();
  if (!cred) {
    throw new Error(
      "Firebase Admin requires FIREBASE_SERVICE_ACCOUNT_JSON env var (stringified service account JSON)"
    );
  }
  return initializeApp({
    credential: cred,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "publish-desk",
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
