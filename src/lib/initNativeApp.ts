import { isNativeApp, isIosApp, isAndroidApp } from "@/lib/nativeApp"

/** Shared Capacitor bootstrap for iOS + Android customer apps (same UI, same API). */
export async function initNativeApp() {
  if (!isNativeApp()) return

  document.documentElement.classList.add("native-app")
  if (isIosApp()) {
    document.documentElement.classList.add("native-app--ios")
  }
  if (isAndroidApp()) {
    document.documentElement.classList.add("native-app--android")
  }

  const [{ App }, { SplashScreen }, { StatusBar, Style }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/splash-screen"),
    import("@capacitor/status-bar")
  ])

  try {
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: "#1b7340" })
  } catch {
    // Status bar plugin unavailable in browser preview.
  }

  try {
    await SplashScreen.hide()
  } catch {
    // ignore
  }

  App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
    if (canGoBack) {
      window.history.back()
    }
  })
}
