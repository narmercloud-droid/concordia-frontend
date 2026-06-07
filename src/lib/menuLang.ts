import i18n from "@/i18n"
import { resolveAppLanguage } from "@/i18n/languages"

/** Language code sent to menu API (categories, items, toppings). */
export function getMenuLang(): string {
  return resolveAppLanguage(i18n.language?.split("-")[0])
}
