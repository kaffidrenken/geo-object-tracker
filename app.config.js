export default {
  expo: {
    name: "Geo Object Tracker",
    slug: "geo-object-tracker",
    scheme: "geotracker",
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
