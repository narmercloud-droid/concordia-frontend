import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import {
  DEFAULT_LANGUAGE,
  detectPreferredLanguage,
  isRtlLanguage,
  resolveAppLanguage,
  SUPPORTED_LANGUAGE_CODES
} from "./languages"
import de from "./locales/de.json"

const LOCALE_LOADERS: Record<
  string,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  en: () => import("./locales/en.json"),
  nl: () => import("./locales/nl.json"),
  pl: () => import("./locales/pl.json"),
  ru: () => import("./locales/ru.json"),
  ro: () => import("./locales/ro.json"),
  hi: () => import("./locales/hi.json"),
  ar: () => import("./locales/ar.json"),
  ku: () => import("./locales/ku.json"),
  tr: () => import("./locales/tr.json"),
  ckb: () => import("./locales/ckb.json")
}

function syncDocumentLanguage(lng: string) {
  const short = lng.split("-")[0]
  document.documentElement.lang = short
  document.documentElement.dir = isRtlLanguage(short) ? "rtl" : "ltr"
}

async function loadLocale(lng: string) {
  const code = resolveAppLanguage(lng)
  if (code === DEFAULT_LANGUAGE || i18n.hasResourceBundle(code, "translation")) {
    return
  }
  const loader = LOCALE_LOADERS[code]
  if (!loader) return
  const mod = await loader()
  i18n.addResourceBundle(code, "translation", mod.default, true, true)
}

/** Load a locale file before switching language so UI text updates immediately. */
export async function ensureLocaleLoaded(lng: string) {
  await loadLocale(lng)
}

export async function bootstrapI18n() {
  const initialLanguage = detectPreferredLanguage()

  await i18n.use(initReactI18next).init({
    lng: initialLanguage,
    resources: {
      de: { translation: de }
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      bindI18nStore: "added removed"
    }
  })

  syncDocumentLanguage(i18n.language)
  i18n.on("languageChanged", (lng) => {
    syncDocumentLanguage(lng)
    void loadLocale(lng)
  })

  // German is bundled; other locales hydrate after first paint.
  void loadLocale(i18n.language)
}

export default i18n
