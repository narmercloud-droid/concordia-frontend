/**
 * Merge loyaltyTerms into pages.terms and simplify acceptance copy.
 * Run: node scripts/i18n/merge-combined-terms.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")

export const TITLE = {
  de: "AGB & Treueprogramm",
  en: "Terms & Conditions",
  nl: "Algemene voorwaarden & spaarprogramma",
  pl: "Regulamin i program lojalnościowy",
  ru: "Условия использования и программа лояльности",
  ro: "Termeni și program de loialitate",
  hi: "नियम व शर्तें और लॉयल्टी कार्यक्रम",
  ar: "الشروط والأحكام وبرنامج الولاء",
  ku: "Mercên bikaranînê & bernameya dilsoziyê",
  tr: "Kullanım şartları ve sadakat programı",
  ckb: "مەرج و ڕێساکان و بەرنامەی وەفاداری"
}

export const ACCEPT = {
  de: {
    acceptTerms: "Ich akzeptiere die <termsLink>AGB & Treueprogramm</termsLink>.",
    acceptTermsRequired: "Bitte akzeptieren Sie die AGB & Treueprogramm-Bedingungen.",
    termsNotice: "Mit der Bestellung akzeptieren Sie unsere <termsLink>AGB & Treueprogramm</termsLink>."
  },
  en: {
    acceptTerms: "I accept the <termsLink>Terms & Conditions</termsLink>.",
    acceptTermsRequired: "Please accept the Terms & Conditions.",
    termsNotice: "By placing your order you accept our <termsLink>Terms & Conditions</termsLink>."
  },
  nl: {
    acceptTerms: "Ik accepteer de <termsLink>algemene voorwaarden</termsLink>.",
    acceptTermsRequired: "Accepteer de algemene voorwaarden.",
    termsNotice: "Door te bestellen accepteert u onze <termsLink>algemene voorwaarden</termsLink>."
  },
  pl: {
    acceptTerms: "Akceptuję <termsLink>regulamin</termsLink>.",
    acceptTermsRequired: "Zaakceptuj regulamin.",
    termsNotice: "Składając zamówienie akceptujesz <termsLink>regulamin</termsLink>."
  },
  ru: {
    acceptTerms: "Я принимаю <termsLink>условия использования</termsLink>.",
    acceptTermsRequired: "Примите условия использования.",
    termsNotice: "Оформляя заказ, вы принимаете <termsLink>условия использования</termsLink>."
  },
  ro: {
    acceptTerms: "Accept <termsLink>termenii și condițiile</termsLink>.",
    acceptTermsRequired: "Acceptați termenii și condițiile.",
    termsNotice: "Plasând comanda acceptați <termsLink>termenii și condițiile</termsLink>."
  },
  hi: {
    acceptTerms: "मैं <termsLink>नियम व शर्तें</termsLink> स्वीकार करता/करती हूँ।",
    acceptTermsRequired: "कृपया नियम व शर्तें स्वीकार करें।",
    termsNotice: "ऑर्डर देकर आप <termsLink>नियम व शर्तें</termsLink> स्वीकार करते हैं।"
  },
  ar: {
    acceptTerms: "أوافق على <termsLink>الشروط والأحكام</termsLink>.",
    acceptTermsRequired: "يرجى قبول الشروط والأحكام.",
    termsNotice: "بإتمام الطلب فإنك توافق على <termsLink>الشروط والأحكام</termsLink>."
  },
  ku: {
    acceptTerms: "Ez <termsLink>mercên bikaranînê</termsLink> qebûl dikim.",
    acceptTermsRequired: "Ji kerema xwe mercan qebûl bikin.",
    termsNotice: "Bi şandina fermana xwe hûn <termsLink>mercên bikaranînê</termsLink> qebûl dikin."
  },
  tr: {
    acceptTerms: "<termsLink>Kullanım şartlarını</termsLink> kabul ediyorum.",
    acceptTermsRequired: "Lütfen kullanım şartlarını kabul edin.",
    termsNotice: "Sipariş vererek <termsLink>Kullanım Şartları</termsLink>nı kabul etmiş olursunuz."
  },
  ckb: {
    acceptTerms: "<termsLink>مەرج و ڕێساکان</termsLink> قبوڵ دەکەم.",
    acceptTermsRequired: "تکایە مەرج و ڕێساکان قبوڵ بکە.",
    termsNotice: "بە دانانی داواکاری <termsLink>مەرج و ڕێساکان</termsLink> قبوڵ دەکەیت."
  }
}

const LOYALTY_PART = {
  de: { title: "Teil 2: Treueprogramm", lead: "Die folgenden Bedingungen gelten zusätzlich für unser kostenloses Treueprogramm." },
  en: { title: "Part 2: Loyalty programme", lead: "The following terms apply additionally to our free loyalty programme." },
  nl: { title: "Deel 2: Spaarprogramma", lead: "De volgende voorwaarden gelden aanvullend voor ons gratis spaarprogramma." },
  pl: { title: "Część 2: Program lojalnościowy", lead: "Poniższe warunki obowiązują dodatkowo dla naszego bezpłatnego programu lojalnościowego." },
  ru: { title: "Часть 2: Программа лояльности", lead: "Следующие условия дополнительно применяются к нашей бесплатной программе лояльности." },
  ro: { title: "Partea 2: Program de loialitate", lead: "Următoarele condiții se aplică în plus programului nostru gratuit de loialitate." },
  hi: { title: "भाग 2: लॉयल्टी कार्यक्रम", lead: "निम्नलिखित शर्तें हमारे मुफ्त लॉयल्टी कार्यक्रम पर अतिरिक्त लागू होती हैं।" },
  ar: { title: "الجزء 2: برنامج الولاء", lead: "تنطبق الشروط التالية إضافاً على برنامج الولاء المجاني." },
  ku: { title: "Beş 2: Bernameya dilsoziyê", lead: "Mercên jêrîn ji bo bernameya me ya belaş a dilsoziyê derbasdar in." },
  tr: { title: "Bölüm 2: Sadakat programı", lead: "Aşağıdaki koşullar ücretsiz sadakat programımız için ek olarak geçerlidir." },
  ckb: { title: "بەشی ٢: بەرنامەی وەفاداری", lead: "مەرجەکانی خوارەوە زیادە لەسەر بەرنامەی وەفاداری بەخۆڕاییمان جێبەجێ دەبن." }
}

export const NAV = {
  de: "AGB",
  en: "Terms",
  nl: "Voorwaarden",
  pl: "Regulamin",
  ru: "Условия",
  ro: "Termeni",
  hi: "नियम",
  ar: "الشروط",
  ku: "Merc",
  tr: "Şartlar",
  ckb: "مەرجەکان"
}

for (const file of fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"))) {
  const lang = file.replace(".json", "")
  const filePath = path.join(localesDir, file)
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))

  const loyalty = locale.pages?.loyaltyTerms
  if (!loyalty) {
    console.warn(`Skip ${lang} — no loyaltyTerms`)
    continue
  }

  locale.pages.terms.title = TITLE[lang] ?? locale.pages.terms.title
  locale.pages.terms.loyaltyPartTitle = LOYALTY_PART[lang]?.title ?? "Loyalty programme"
  locale.pages.terms.loyaltyPartLead = LOYALTY_PART[lang]?.lead ?? loyalty.lead
  locale.pages.terms.loyaltySections = loyalty.sections

  if (NAV[lang]) locale.pages.nav.terms = NAV[lang]
  delete locale.pages.nav.loyaltyTerms
  delete locale.pages.loyaltyTerms

  const accept = ACCEPT[lang]
  if (accept) {
    locale.auth.acceptTerms = accept.acceptTerms
    locale.auth.acceptTermsRequired = accept.acceptTermsRequired
    locale.checkout.termsNotice = accept.termsNotice
  }

  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Merged ${lang}`)
}

console.log("Done")
