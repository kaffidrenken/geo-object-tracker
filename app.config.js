import "dotenv/config";

export default {
  expo: {
    name: "Geo Object Tracker",
    slug: "geo-object-tracker",
    scheme: "geotracker",

    extra: {
      eas: { projectId: "c3227ea3-2eb7-41b4-aef2-cfc809df3ffe" }, // keep yours
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
    },

    android: {
      package: "com.example.geoobjecttracker",
      minSdkVersion: 24,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE",
        "ACCESS_BACKGROUND_LOCATION",
      ],
    },
    plugins: [
      ["expo-location"],
      ["expo-notifications"],
      "./app.plugin.js",
    ],
  },
};
