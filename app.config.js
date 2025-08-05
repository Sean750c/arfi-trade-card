import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "CardKing",
  slug: "cardking",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/images/logo.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.bsdb.cardking",
    googleServicesFile: "./GoogleService-Info.plist",
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ["fetch", "remote-notification"],
      NSUserTrackingUsageDescription:
        "This data helps us provide relevant content and notifications. We respect your privacy and do not share your information without your permission.",
      UNUserNotificationCenterDelegate: true,
      FacebookAppID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "1525365371783998",
      FacebookDisplayName: "CardKing",
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [process.env.EXPO_PUBLIC_FACEBOOK_APP_SCHEMES || 'fb1525365371783998']
        }
      ]
    }
  },
  android: {
    package: "com.bsdb.cardking",
    googleServicesFile: "./google-services.json",
    config: {
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "1525365371783998",
      facebookDisplayName: "CardKing"
    }
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#008751",
        sounds: ["./assets/sounds/notification.mp3"],
        mode: "production"
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "We access your photo library so you can upload pictures of your gift cards for verification and selling.",
        cameraPermission:
          "We use your camera to let you take photos of your gift cards when submitting them for sale or verification.",
        faceIDPermission:
          "Allow CardKing to use Face ID for authentication."
      }
    ],
    [
      "expo-apple-authentication",
      {
        appleAuthUrl: "https://appleid.apple.com/auth/authorize",
        appleAuthRedirectUrl: "https://appleid.apple.com/auth/callback",
        appleAuthClientId: "com.bsdb.cardking.auth"
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  notification: {
    icon: "./assets/images/notification-icon.png",
    color: "#008751",
    iosDisplayInForeground: true,
    androidMode: "default",
    androidCollapsedTitle: "#{unread_notifications} new interactions"
  },
  extra: {
    router: {
      unstable_allowRequireContext: true
    },
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://test-giftcard8-api.gcard8.com",
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "791594810994-0n8lvdm11k3hse26khpp5dmhq51d57c3.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "791594810994-bqhvquvepta7ca4de13d782blnec7p6u.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "791594810994-nuplk4snq0mp4tgnd98hijupn17hm9c0.apps.googleusercontent.com",
    EXPO_PUBLIC_FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "1525365371783998",
    eas: {
      projectId: "6e88a397-970f-4337-b705-b85048eb66b6"
    },
  },
  jsEngine: "hermes",
  owner: "chaoqunz"
});
