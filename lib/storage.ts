import { ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

/** Must match `storage.rules` profile path limit. */
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export function formatFileSizeForDisplay(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(2) : mb.toFixed(1)} MB`;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic") return "heic";
  if (mime === "image/heif") return "heif";
  return "jpg";
}

/** Infer MIME when browsers leave `file.type` empty (common on iOS / some desktops). */
function resolveProfileImageType(file: File): { contentType: string; ext: string } {
  let raw = (file.type || "").toLowerCase().trim();
  if (raw === "image/jpg") raw = "image/jpeg";

  if (raw && ALLOWED_MIME.has(raw)) {
    return { contentType: raw, ext: extFromMime(raw) };
  }

  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return { contentType: "image/png", ext: "png" };
  if (n.endsWith(".webp")) return { contentType: "image/webp", ext: "webp" };
  if (n.endsWith(".heic")) return { contentType: "image/heic", ext: "heic" };
  if (n.endsWith(".heif")) return { contentType: "image/heif", ext: "heif" };
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return { contentType: "image/jpeg", ext: "jpg" };

  throw new Error("Please choose a PNG, JPEG, WebP, or HEIC image.");
}

/** Client-side checks before upload. Returns `null` if OK, otherwise a user-visible reason. */
export function getProfileImageValidationError(file: File): string | null {
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return `This file is ${formatFileSizeForDisplay(file.size)}. The maximum is ${formatFileSizeForDisplay(PROFILE_AVATAR_MAX_BYTES)}. Try a smaller or more compressed image.`;
  }
  try {
    resolveProfileImageType(file);
  } catch (e) {
    return e instanceof Error
      ? e.message
      : "We could not detect a supported image type. Use .jpg, .png, .webp, or .heic, or try another export.";
  }
  return null;
}

/** Upload profile avatar to `users/{userId}/profile/avatar.{ext}`. Returns download URL. */
export async function uploadUserProfilePhoto(userId: string, file: File): Promise<string> {
  const preflight = getProfileImageValidationError(file);
  if (preflight) throw new Error(preflight);
  const { contentType, ext } = resolveProfileImageType(file);
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `users/${userId}/profile/avatar.${ext}`);
  await uploadBytes(storageRef, file, { contentType });
  return getDownloadURL(storageRef);
}

/**
 * Upload an image (data URL or blob) to Storage under the user's content folder.
 * Returns the public download URL. Use this when saving content that contains
 * inline images so they are stored in Firebase Storage instead of base64 in Firestore.
 */
export async function uploadContentImage(
  userId: string,
  contentId: string,
  dataUrlOrBlob: string | Blob,
  filename?: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const name = filename ?? `img-${Date.now()}.png`;
  const path = `users/${userId}/content/${contentId}/${name}`;
  const storageRef = ref(storage, path);
  if (typeof dataUrlOrBlob === "string") {
    await uploadString(storageRef, dataUrlOrBlob, "data_url");
  } else {
    await uploadBytes(storageRef, dataUrlOrBlob);
  }
  return getDownloadURL(storageRef);
}
