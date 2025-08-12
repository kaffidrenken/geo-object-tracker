import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⬇️ Replace these with YOUR values from Firebase Console:
// Firebase Console → Project Overview → "Add app" (Web) → copy the config object
const firebaseConfig = {
  apiKey: "AIzaSyAfVBstkc1ABTl8Vp61naJbGybsyW1-NKA",
  authDomain: "geotrack-1257b.firebaseapp.com",
  projectId: "geotrack-1257b",
  storageBucket: "geotrack-1257b.firebasestorage.app",
  messagingSenderId: "536928743188",
  appId: "1:536928743188:web:07e33d364b0809115b1c01",
  measurementId: "G-SNVSSQFREM"
};

// Avoid re-initializing in dev/hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);