/**
 * Update birthday perk copy: discount (not free dessert).
 * Run: node scripts/i18n/patch-birthday-text.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")

const PATCHES = {
  de: {
    marketingPerkBirthday: "Geburtstagsangebot: Rabatt mit Code BIRTHDAY",
    birthdayHint:
      "Für das Geburtstagsangebot von Concordia — Rabatt mit Code BIRTHDAY (Ausweis erforderlich)."
  },
  en: {
    marketingPerkBirthday: "Birthday treat: discount with code BIRTHDAY",
    birthdayHint:
      "For Concordia's birthday treat — discount with code BIRTHDAY (ID required)."
  },
  nl: {
    marketingPerkBirthday: "Verjaardagsaanbieding: korting met code BIRTHDAY",
    birthdayHint:
      "Voor het verjaardagsaanbod van Concordia — korting met code BIRTHDAY (legitimatie verplicht)."
  },
  pl: {
    marketingPerkBirthday: "Oferta urodzinowa: rabat z kodem BIRTHDAY",
    birthdayHint:
      "Oferta urodzinowa Concordia — rabat z kodem BIRTHDAY (wymagany dokument tożsamości)."
  },
  ru: {
    marketingPerkBirthday: "Подарок на день рождения: скидка с кодом BIRTHDAY",
    birthdayHint:
      "Подарок на день рождения от Concordia — скидка с кодом BIRTHDAY (требуется удостоверение личности)."
  },
  ro: {
    marketingPerkBirthday: "Ofertă de ziua de naștere: reducere cu codul BIRTHDAY",
    birthdayHint:
      "Ofertă de ziua de naștere de la Concordia — reducere cu codul BIRTHDAY (act de identitate obligatoriu)."
  },
  hi: {
    marketingPerkBirthday: "जन्मदिन ऑफ़र: BIRTHDAY कोड के साथ छूट",
    birthdayHint:
      "Concordia का जन्मदिन ऑफ़र — BIRTHDAY कोड के साथ छूट (पहचान पत्र आवश्यक)।"
  },
  ar: {
    marketingPerkBirthday: "عرض عيد الميلاد: خصم برمز BIRTHDAY",
    birthdayHint:
      "عرض عيد الميلاد من Concordia — خصم برمز BIRTHDAY (يُطلب إبراز هوية)."
  },
  ku: {
    marketingPerkBirthday: "Pêşkêşiya rojbûnê: erzanî bi koda BIRTHDAY",
    birthdayHint:
      "Ji bo pêşkêşiya rojbûnê ya Concordia — erzanî bi koda BIRTHDAY (nasname pêwîst e)."
  },
  tr: {
    marketingPerkBirthday: "Doğum günü fırsatı: BIRTHDAY koduyla indirim",
    birthdayHint:
      "Concordia doğum günü fırsatı — BIRTHDAY koduyla indirim (kimlik gerekli)."
  },
  ckb: {
    marketingPerkBirthday: "پێشکەشکراوی ڕۆژی لەدایکبوون: داشکاندن بە کۆدی BIRTHDAY",
    birthdayHint:
      "پێشکەشکراوی ڕۆژی لەدایکبوونی Concordia — داشکاندن بە کۆدی BIRTHDAY (ناسنامە پێویستە)."
  }
}

for (const [lang, patch] of Object.entries(PATCHES)) {
  const filePath = path.join(localesDir, `${lang}.json`)
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))
  locale.checkout.marketingPerkBirthday = patch.marketingPerkBirthday
  locale.checkout.birthdayHint = patch.birthdayHint
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Patched ${lang}`)
}
