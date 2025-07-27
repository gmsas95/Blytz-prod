module.exports = {
  expo: {
    name: "BlytzApp",
    slug: "BlytzApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
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
      firebaseAuthDomain: "",
      firebaseProjectId: "blytz-e9935",
      firebaseStorageBucket: "blytz-e9935.firebasestorage.app",
      firebaseMessagingSenderId: "929292925225",
      firebaseAppId: "1:929292925225:android:e2a212d3c8dd80cde09f38",
      firebaseMeasurementId: "",
      curlecApiKey: "",
      logisticsApiKey: "",
      eas: {
        projectId: "1666420c-3b08-4c61-9091-128e291ebd07"
      }
    },
    owner: "gmsas95",
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
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