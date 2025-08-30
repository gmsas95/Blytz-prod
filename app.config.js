module.exports = {
  expo: {
    name: "BlytzApp",
    slug: "BlytzApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gmsas95.blytzapp",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.blytz.blytz",
      edgeToEdgeEnabled: true,
      "googleServicesFile": "./google-services.json"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "blytz-e9935",
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "blytz-e9935.firebasestorage.app",
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "929292925225",
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:929292925225:android:e2a212d3c8dd80cde09f38",
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
      curlecApiKey: process.env.EXPO_PUBLIC_CURLEC_API_KEY || "",
      logisticsApiKey: process.env.EXPO_PUBLIC_LOGISTICS_API_KEY || "",
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "1666420c-3b08-4c61-9091-128e291ebd07"
      }
    },
    owner: "gmsas95",
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      "@livekit/react-native-expo-plugin",
      "@config-plugins/react-native-webrtc",
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "2.1.0",
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "jvmTarget": "17",
            "jvmToolchainVersion": 17
          }
        }
      ]
    ]
  }
};