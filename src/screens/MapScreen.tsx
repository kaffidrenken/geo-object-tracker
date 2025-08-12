import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MapboxGL from "react-native-maplibre-gl";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPin, setPinStatus, subscribeActivePins, Pin } from "../services/pins";
import { setObjectPin } from "../bg/locationTask";
import { ARRIVAL_RADIUS_M } from "../constants";
import { haversine } from "../utils/geo";

// MapLibre does not require a token
MapboxGL.setAccessToken(null as any);

// Public demo style; replace with your own later if you like
const STYLE_URL = "https://demotiles.maplibre.org/style.json";

// Keys used by BG task / UI handoff
const K_LATEST_PIN_ID = "latestPinId";

export default function MapScreen() {
  const [user, setUser] = useState<{ latitude: number; longitude: number } | null>(null);
  const [objectPin, setObject] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activePins, setActivePins] = useState<Pin[]>([]);
  const [latestPinId, setLatestPinId] = useState<string | null>(null);

  // Initial location + restore object pin
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission required", "Enable location to use the map.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUser({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      const stored = await AsyncStorage.getItem("objectPin");
      if (stored) setObject(JSON.parse(stored));

      const storedLatest = await AsyncStorage.getItem(K_LATEST_PIN_ID);
      if (storedLatest) setLatestPinId(storedLatest);
    })();

    const unsub = subscribeActivePins(setActivePins);
    return () => unsub();
  }, []);

  // Listen for background flag to flip latest pin to Idle
  useEffect(() => {
    const i = setInterval(async () => {
      const flag = await AsyncStorage.getItem("setLatestPinIdle");
      if (flag && latestPinId) {
        await AsyncStorage.removeItem("setLatestPinIdle");
        await setPinStatus(latestPinId, "Idle");
        setLatestPinId(null);
        await AsyncStorage.removeItem(K_LATEST_PIN_ID);
      }
    }, 2000);
    return () => clearInterval(i);
  }, [latestPinId]);

  // Tap map to set the Object Pin
  const handleMapPress = async (e: any) => {
    const [lng, lat] = e.geometry.coordinates;
    setObject({ latitude: lat, longitude: lng });
    await setObjectPin(lat, lng); // persists for BG task
    Alert.alert("Object Pin set", "Background monitoring engaged.");
  };

  // User confirms both are stopped → create Latest Pin (Active)
  const confirmStopped = async (bothStopped: boolean) => {
    if (!bothStopped || !user) return;
    const ref = await createPin(user.latitude, user.longitude);
    setLatestPinId(ref.id);
    await AsyncStorage.setItem(K_LATEST_PIN_ID, ref.id);
    Alert.alert("Latest Pin added", "Status: Active (will switch to Idle after you leave).");
  };

  const withinArrival = () => {
    if (!user || !objectPin) return false;
    return haversine(user, objectPin) < ARRIVAL_RADIUS_M;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleURL={STYLE_URL}
        onPress={handleMapPress}
      >
        <MapboxGL.Camera
          zoomLevel={14}
          centerCoordinate={
            user ? [user.longitude, user.latitude] : [6.1319, 49.6116] // Luxembourg fallback
          }
        />

        {/* User location marker */}
        {user && (
          <MapboxGL.PointAnnotation id="me" coordinate={[user.longitude, user.latitude]}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#007AFF" }} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Object pin */}
        {objectPin && (
          <MapboxGL.PointAnnotation id="obj" coordinate={[objectPin.longitude, objectPin.latitude]}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#FF2D55" }} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Active pins from Firestore (public) */}
        {activePins.map((p) => (
          <MapboxGL.PointAnnotation key={p.id} id={p.id!} coordinate={[p.lng, p.lat]}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#34C759" }} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Footer controls */}
      <View style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 12,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            Status: {withinArrival() ? "Active (At/Approaching)" : "Idle (Away)"}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => confirmStopped(true)}
              style={{
                backgroundColor: "#111",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                marginRight: 10,
              }}
            >
              <Text style={{ color: "white" }}>Confirm Both Stopped</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmStopped(false)}
              style={{ backgroundColor: "#eee", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }}
            >
              <Text>Not Stopped</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Tip: Tap the map to set the object pin. Active pins show in green.
          </Text>
        </View>
      </View>
    </View>
  );
}
