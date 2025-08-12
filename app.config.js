export default {
  expo: {
    name: "Geo Object Tracker",
    slug: "geo-object-tracker",
    scheme: "geotracker",

    // ⬇️ Add this block
    extra: {
      eas: {
        projectId: "c3227ea3-2eb7-41b4-aef2-cfc809df3ffe"
      }
    },

    android: {
      package: "com.example.geoobjecttracker",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    },
    plugins: [
      ["expo-location"],
      ["expo-notifications"]
    ]
  }
};