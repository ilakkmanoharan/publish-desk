import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";

const USERS = "users";

export type UserProfileFields = {
  username?: string | null;
  fullName?: string | null;
  recoveryEmail?: string | null;
  headline?: string | null;
  country?: string | null;
  /** Mirror of Firebase Auth / Storage URL for dashboards and backups */
  photoURL?: string | null;
  /** Public profile links (separate from `githubRepoUrl` content source) */
  linkedinUrl?: string | null;
  githubProfileUrl?: string | null;
  twitterUrl?: string | null;
};

export type UserProfileDocument = UserProfileFields & {
  githubRepoUrl?: string | null;
  profileUpdatedAt?: unknown;
};

/** Trim; empty → null; otherwise valid http(s) URL string. */
export function normalizeOptionalHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    throw new Error("Use a full URL starting with https:// (or http://).");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("URL must use http:// or https://.");
  }
  return u.href;
}

function db() {
  return getFirebaseFirestore();
}

export async function getUserProfileDocument(userId: string): Promise<UserProfileDocument | null> {
  const snap = await getDoc(doc(db(), USERS, userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProfileDocument;
}

/** Merge profile fields into `users/{userId}` without removing other keys (e.g. githubRepoUrl). */
export async function saveUserProfileDocument(
  userId: string,
  fields: UserProfileFields
): Promise<void> {
  const ref = doc(db(), USERS, userId);
  await setDoc(
    ref,
    {
      ...fields,
      profileUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
