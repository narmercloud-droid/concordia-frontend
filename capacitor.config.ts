import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "de.concordia.customer",
  appName: "Concordia",
  webDir: "dist",
  android: {
    allowMixedContent: false
  },
  ios: {
    contentInset: "automatic",
    scheme: "Concordia"
  },
  server: {
    androidScheme: "https",
    iosScheme: "https"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#1b7340",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1b7340"
    }
  }
}

export default config
