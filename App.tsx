import React, { useEffect } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import MapScreen from "./src/screens/MapScreen";
import { TASK_LOCATION } from "./src/constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function startTracking() {
  const fg = await Location.requestForegroundPermissionsAsync();
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (fg.status !== "granted" || bg.status !== "granted") return;

  const already = await TaskManager.isTaskRegisteredAsync(TASK_LOCATION);
  if (!already) {
    await Location.startLocationUpdatesAsync(TASK_LOCATION, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // meters
      deferredUpdatesInterval: 60000, // ms
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Tracking location",
        notificationBody: "Monitoring proximity and stops.",
      },
