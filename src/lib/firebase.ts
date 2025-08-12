import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import Constants from "expo-constants";

// Read values passed via app.config.js -> extra.firebase
const cfg = (Constants.expoConfig?.extra as any)?.firebase;

if (!cfg || !cfg.apiKey) {
  throw new Error(
    "Missing Firebase env (FIREBASE_*). Create a .env locally and add EAS Secrets for cloud builds."
  );
}

// Avoid double-initializing
const app = getApps().length ? getApp() : initializeApp(cfg);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously so Firestore rules can verify ownerUid
signInAnonymously(auth).catch(console.error);
