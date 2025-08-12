import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type PinStatus = "Active" | "Idle";

export interface Pin {
  id?: string;
  lat: number;
  lng: number;
  status: PinStatus;      // "Active" when approaching/at; "Idle" after leaving
  createdAt?: any;
  activatedAt?: any;
}

/**
 * Create a new Latest Pin at the given coordinates.
 * Default status is "Active" so it's visible to everyone immediately.
 */
export async function createPin(lat: number, lng: number) {
  return addDoc(collection(db, "pins"), {
    lat,
    lng,
    status: "Active",
    createdAt: serverTimestamp(),
    activatedAt: serverTimestamp(),
  });
}

/** Flip a pin's status between "Active" and "Idle". */
export async function setPinStatus(pinId: string, status: PinStatus) {
  return updateDoc(doc(db, "pins", pinId), { status });
}

/**
 * Subscribe to Active pins only (public stream).
 * Returns an unsubscribe function; call it when you unmount.
 */
export function subscribeActivePins(cb: (pins: Pin[]) => void) {
  const q = query(collection(db, "pins"), where("status", "==", "Active"));
  return onSnapshot(q, (snap) => {
    const arr: Pin[] = [];
    snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
    cb(arr);
  });
}
