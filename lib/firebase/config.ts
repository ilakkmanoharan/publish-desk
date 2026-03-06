// Firebase client config. Override with NEXT_PUBLIC_* env vars if needed.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCogjDtA96508-B4xaIGYNTSHg7NiaMyas",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "publish-desk.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "publish-desk",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "publish-desk.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "853353383285",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:853353383285:web:2616f47590db1202c6ff3c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-F19S2VS73M",
};
