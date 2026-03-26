import { FirebaseError } from "firebase/app";

/** Turn Firebase errors into actionable copy for the account UI. */
export function formatUserFacingFirebaseError(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) {
    if (err.code === "storage/unauthorized") {
      return [
        "Firebase Storage rejected the upload (storage/unauthorized).",
        "Fix: In the project folder run `firebase deploy --only storage` so rules allow `users/{userId}/profile/{fileName}` for the signed-in user.",
        "Also check Firebase Console → Storage → Rules (publish the same rules as `storage.rules` in this repo).",
        "If App Check is ON for Storage without a registered app, turn enforcement off or add App Check to the web app.",
      ].join(" ");
    }
    if (err.code === "storage/unauthenticated") {
      return "You are not signed in to Firebase (storage/unauthenticated). Sign in again, then retry.";
    }
    if (err.code === "storage/quota-exceeded") {
      return "Storage quota exceeded for this project (storage/quota-exceeded). Check Firebase Console → Usage.";
    }
    if (err.code === "storage/retry-limit-exceeded" || err.code === "storage/canceled") {
      return `Upload was interrupted (${err.code}). Check your network and try again.`;
    }
    if (err.code === "auth/requires-recent-login") {
      return "For security, sign out and sign in again, then update your profile (auth/requires-recent-login).";
    }
    return `${err.message} (${err.code})`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Extra detail when the avatar pipeline fails on a specific step. */
export function formatAvatarUploadFailure(stepLabel: string, err: unknown): string {
  const detail = formatUserFacingFirebaseError(err, "Something went wrong.");
  const isStorage =
    err instanceof FirebaseError &&
    typeof err.code === "string" &&
    err.code.startsWith("storage/");
  const tip = isStorage
    ? "Tip: Deploy rules with `firebase deploy --only storage`. Profile path must allow your signed-in uid and files under 5 MB."
    : "";
  return [`Step failed: ${stepLabel}`, "", detail, tip ? `\n${tip}` : ""].join("\n").trim();
}
