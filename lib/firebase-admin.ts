import { readFileSync } from "fs";
import { isAbsolute, join } from "path";
import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.error("[firebase-admin]", ...args);
  }
}

function getCredential() {
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    try {
      return cert(JSON.parse(jsonRaw) as ServiceAccount);
    } catch (e) {
      devLog(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but invalid JSON — fix it or remove the var so FIREBASE_SERVICE_ACCOUNT_PATH can be used.",
        e
      );
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (filePath) {
    try {
      const resolved = isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);
      const raw = readFileSync(resolved, "utf-8");
      return cert(JSON.parse(raw) as ServiceAccount);
    } catch (e) {
      devLog(
        `Could not load service account from FIREBASE_SERVICE_ACCOUNT_PATH (resolved: ${resolvedPathForLog(filePath)}).`,
        e
      );
    }
  } else {
    devLog(
      "Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH is set in the environment (e.g. .env). The JSON file can exist on disk, but Next.js only loads credentials from env vars."
    );
  }
  return undefined;
}

function resolvedPathForLog(filePath: string): string {
  try {
    return isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);
  } catch {
    return filePath;
  }
}

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0] as ReturnType<typeof initializeApp>;
  }
  const cred = getCredential();
  if (!cred) {
    throw new Error(
      "Firebase Admin requires FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH env var. See FIREBASE_SETUP.md §5."
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
