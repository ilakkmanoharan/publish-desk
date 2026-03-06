import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

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
    const { uploadBytes } = await import("firebase/storage");
    await uploadBytes(storageRef, dataUrlOrBlob);
  }
  return getDownloadURL(storageRef);
}
