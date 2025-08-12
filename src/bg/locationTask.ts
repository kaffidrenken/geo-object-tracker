import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TASK_LOCATION,
  ARRIVAL_RADIUS_M,
  IDLE_SECONDS,
  LEAVE_RADIUS_M,
  LEAVE_MINUTES,
} from "../constants";
import { haversine } from "../utils/geo";

// Persisted keys
const K_OBJECT_PIN = "objectPin";            // { latitude, longitude }
const K_APPROACH_PROMPTED = "approachPrompted";
const K_ARRIVED_AT = "arrivedAt";
const K_IDLE_PROMPTED = "idlePrompted";
const K_LEAVE_START_AT = "leaveStartAt";

// Background task definition
TaskManager.defineTask(TASK_LOCATION, async ({ data, error }) => {
  if (error) return;
  const { locations } = (data as any) || {};
  const latest = locations?.[0];
  if (!latest) return;

  const me = {
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
    speed: latest.coords.speed ?? 0,
  };

  const rawPin = await AsyncStorage.getItem(K_OBJECT_PIN);
  if (!rawPin) return; // no object defined
  const objectPin = JSON.parse(rawPin);

  const d = haversine(me, objectPin);                     // meters
  const speed = Math.max(me.speed || 0, 1.4);             // m/s; fallback walking speed
  const etaSec = d / speed;                               // seconds
  const fiveMin = 5 * 60;

  // 1) Approach prompt (~5 minutes out by heuristic ETA)
  const approached = await AsyncStorage.getItem(K_APPROACH_PROMPTED);
  if (etaSec < fiveMin && !approached) {
    await AsyncStorage.setItem(K_APPROACH_PROMPTED, "1");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Approaching object",
        body: "Are you approaching the object? Open the app to confirm Yes/No.",
      },
      trigger: null,
    });
  }

  // 2) Arrival detection: inside ARRIVAL_RADIUS_M
  if (d < ARRIVAL_RADIUS_M) {
    const arrivedAt = await AsyncStorage.getItem(K_ARRIVED_AT);
    if (!arrivedAt) await AsyncStorage.setItem(K_ARRIVED_AT, String(Date.now()));
  } else {
    await AsyncStorage.removeItem(K_ARRIVED_AT);
  }

  // 3) Idle confirmation: stopped for > IDLE_SECONDS after arrival
  const arrivedAt = await AsyncStorage.getItem(K_ARRIVED_AT);
  if (arrivedAt) {
    const idleSec = (Date.now() - Number(arrivedAt)) / 1000;
    const idlePrompted = await AsyncStorage.getItem(K_IDLE_PROMPTED);
    if (idleSec > IDLE_SECONDS && !idlePrompted) {
      await AsyncStorage.setItem(K_IDLE_PROMPTED, "1");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Confirm stop",
          body: "Are both you and the object stopped? Open the app to confirm Yes/No.",
        },
        trigger: null,
      });
    }
  }

  // 4) Leaving detection: beyond LEAVE_RADIUS_M and away for >= LEAVE_MINUTES
  if (d > LEAVE_RADIUS_M) {
    const leaveStartAt = await AsyncStorage.getItem(K_LEAVE_START_AT);
    if (!leaveStartAt) {
      await AsyncStorage.setItem(K_LEAVE_START_AT, String(Date.now()));
    } else {
      const mins = (Date.now() - Number(leaveStartAt)) / 60000;
      if (mins >= LEAVE_MINUTES) {
        await AsyncStorage.removeItem(K_LEAVE_START_AT);
        // Signal foreground UI to flip the latest pin from Active -> Idle (Firestore update happens in UI)
        await AsyncStorage.setItem("setLatestPinIdle", "1");
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Pin set to Idle",
            body: "You left the object. Latest pin is now Idle (visible to all).",
          },
          trigger: null,
        });
      }
    }
  } else {
    await AsyncStorage.removeItem(K_LEAVE_START_AT);
  }
});

// Helpers used by the UI to set/clear the tracked object pin
export async function setObjectPin(lat: number, longitude: number) {
  await AsyncStorage.setItem(
    K_OBJECT_PIN,
    JSON.stringify({ latitude: lat, longitude })
  );
  // reset flags for a fresh session
  await AsyncStorage.multiRemove([
    K_APPROACH_PROMPTED,
    K_ARRIVED_AT,
    K_IDLE_PROMPTED,
    K_LEAVE_START_AT,
  ]);
}

export async function clearObjectPin() {
  await AsyncStorage.multiRemove([
    K_OBJECT_PIN,
    K_APPROACH_PROMPTED,
    K_ARRIVED_AT,
    K_IDLE_PROMPTED,
    K_LEAVE_START_AT,
  ]);
}
