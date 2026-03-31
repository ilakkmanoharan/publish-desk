import { FirebaseError } from "firebase/app";

/**
 * Turns Firebase Auth errors into short, actionable copy for the UI.
 */
export function getFirebaseAuthUserMessage(err: unknown): string {
  const host =
    typeof window !== "undefined" ? window.location.hostname : "this site’s host";

  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/unauthorized-domain":
        return `Sign-in is blocked for this domain (“${host}”). In Firebase Console open Authentication → Settings → Authorized domains and add “${host}” (also add your production host, e.g. your Vercel URL). Then try again.`;
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in window. Allow popups for this site, or try again after disabling the blocker for this page.";
      case "auth/popup-closed-by-user":
        return "Sign-in was closed before it finished. Try “Continue with Google” again.";
      case "auth/cancelled-popup-request":
        return "Another sign-in window is already open. Close it and try once more.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method. Use “Continue with Google” if you originally signed up with Google.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email or password is incorrect. If this account was created with “Continue with Google”, use that button instead of email/password.";
      default:
        break;
    }
  }

  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
