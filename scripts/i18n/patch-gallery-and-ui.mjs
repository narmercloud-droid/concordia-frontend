/**
 * Add gallery keys and fix common UI translation leftovers.
 * Run: node scripts/i18n/patch-gallery-and-ui.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")

const GALLERY = {
  de: {
    alforno: "Al Forno aus dem Ofen",
    classics: "Schnitzel & Klassiker",
    burger: "Burger vom Grill",
    baguette: "Frische Baguettes"
  },
  en: {
    alforno: "Baked al forno",
    classics: "Schnitzel & classics",
    burger: "Gourmet burgers",
    baguette: "Fresh baguettes"
  },
  nl: {
    alforno: "Al forno uit de oven",
    classics: "Schnitzel & klassiekers",
    burger: "Gourmet burgers",
    baguette: "Verse baguettes"
  },
  pl: {
    alforno: "Dania al forno z pieca",
    classics: "Sznitzle i klasyki",
    burger: "Burgery gourmet",
    baguette: "Świeże bagietki"
  },
  ru: {
    alforno: "Запечённые al forno",
    classics: "Шницель и классика",
    burger: "Гурме бургеры",
    baguette: "Свежие багеты"
  },
  ro: {
    alforno: "Al forno din cuptor",
    classics: "Șnițel și clasice",
    burger: "Burgeri gourmet",
    baguette: "Baghete proaspete"
  },
  hi: {
    alforno: "ओवन से al forno",
    classics: "श्निट्ज़ेल और क्लासिक",
    burger: "गourmet बर्गर",
    baguette: "ताज़ी बैगेट"
  },
  ar: {
    alforno: "أطباق al forno من الفرن",
    classics: "شنيتسل وكلاسيكيات",
    burger: "برغر فاخر",
    baguette: "باگيت طازج"
  },
  ku: {
    alforno: "Al forno ji firinê",
    classics: "Schnitzel & klasîk",
    burger: "Burgerên gourmet",
    baguette: "Bagetên taze"
  },
  tr: {
    alforno: "Fırından al forno",
    classics: "Şinitzel ve klasikler",
    burger: "Gurme burgerler",
    baguette: "Taze bagetler"
  },
  ckb: {
    alforno: "Al forno لە فڕنەوە",
    classics: "شنیتسل و کلاسیک",
    burger: "بەرگەری گورمێ",
    baguette: "باگێتی تازە"
  }
}

const SIZE_HINT = {
  de: "Zuerst Größe wählen — Extrapreise hängt von klein / groß ab",
  en: "Choose your size first — extra prices depend on small / large",
  nl: "Kies eerst de maat — extraprijzen hangen af van klein / groot",
  pl: "Najpierw wybierz rozmiar — ceny dodatków zależą od małej / dużej",
  ru: "Сначала выберите размер — цены зависят от маленькой / большой",
  ro: "Alegeți mai întâi mărimea — prețurile extra depind de mică / mare",
  hi: "पहले साइज़ चुनें — अतिरिक्त कीमत छोटी / बड़ी पर निर्भर",
  ar: "اختر الحجم أولاً — أسعار الإضافات تعتمد على صغير / كبير",
  ku: "Pêşî mezinahiyê hilbijêrin — bihayên zêde li gor biçûk / mezin in",
  tr: "Önce boyut seçin — ekstra fiyat küçük / büyük boyuta bağlıdır",
  ckb: "یەکەم قەبارە هەڵبژێرە — نرخی زیادکراو بەپێی بچووک / گەورە"
}

for (const [lang, gallery] of Object.entries(GALLERY)) {
  const filePath = path.join(localesDir, `${lang}.json`)
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))
  locale.home.gallery = { ...locale.home.gallery, ...gallery }
  if (SIZE_HINT[lang]) locale.item.extrasSizeHint = SIZE_HINT[lang]
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Patched ${lang}.json`)
}

console.log("Done")
