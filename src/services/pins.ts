// src/services/pins.ts
import { db, auth } from "../lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

type PinStatus = "Active" | "Idle";

/** Ensure we have an authenticated (anonymous) user */
async function ensureAuthed() {
  if (!auth.currentUser) {
    await signInAnonymously(auth).catch(console.error);
  }
}

/** Create a public pin owned by the current user */
export async function createPin(lat: number, lng: number, status: PinStatus) {
  await ensureAuthed();
  const ownerUid = auth.currentUser?.uid ?? null;

  return addDoc(collection(db, "pins"), {
    lat,
    lng,
    status,                // "Active" or "Idle"
    ownerUid,              // required by Firestore rules
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Update the status of an existing pin */
export async function setPinStatus(pinId: string, status: PinStatus) {
  const ref = doc(db, "pins", pinId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Subscribe to all public pins (reads are public in your rules) */
export function subscribePins(
  cb: (snap: FirebaseFirestoreTypes.QuerySnapshot) => void
) {
  const q = query(collection(db, "pins"));
  // @ts-ignore - Firestore web types; your code will get a real snapshot object
  return onSnapshot(q, cb);
}