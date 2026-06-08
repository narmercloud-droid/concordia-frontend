import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import {
  DEFAULT_LANGUAGE,
  isRtlLanguage,
  resolveAppLanguage,
  SUPPORTED_LANGUAGE_CODES
} from "./languages"
import de from "./locales/de.json"
import en from "./locales/en.json"
import nl from "./locales/nl.json"
import pl from "./locales/pl.json"
import ru from "./locales/ru.json"
import ro from "./locales/ro.json"
import hi from "./locales/hi.json"
import ar from "./locales/ar.json"
import ku from "./locales/ku.json"
import tr from "./locales/tr.json"
import ckb from "./locales/ckb.json"

function syncDocumentLanguage(lng: string) {
  const short = lng.split("-")[0]
  document.documentElement.lang = short
  document.documentElement.dir = isRtlLanguage(short) ? "rtl" : "ltr"
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      nl: { translation: nl },
      pl: { translation: pl },
      ru: { translation: ru },
      ro: { translation: ro },
      hi: { translation: hi },
      ar: { translation: ar },
      ku: { translation: ku },
      tr: { translation: tr },
      ckb: { translation: ckb }
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "concordia-lang-v2",
      convertDetectedLanguage: (lng) => resolveAppLanguage(lng)
    },
    interpolation: { escapeValue: false }
  })

syncDocumentLanguage(i18n.language)
i18n.on("languageChanged", syncDocumentLanguage)

export default i18n
