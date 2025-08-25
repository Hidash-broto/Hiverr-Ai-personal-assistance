export default {
  "expo": {
    "name": "Hiverr",
    "slug": "mobile-client",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hidash.mobileclient",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff",
      },
      "permissions": ["android.permission.RECORD_AUDIO"],
      "package": "com.hidash.mobileclient"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ],
      [
        "@react-native-voice/voice"
      ],
      [
        "expo-router",
      ],
      [
        "expo-contacts",
        {
          "contactsPermission": "Allow $(PRODUCT_NAME) to access your contacts."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "552a7ab6-7b61-4f74-9d8a-1ae000d240f4"
      }
    }
  }
};