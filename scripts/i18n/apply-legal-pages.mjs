/**
 * Merge legal pages into locale files.
 * Run: node scripts/i18n/apply-legal-pages.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")
const legal = JSON.parse(fs.readFileSync(path.join(__dirname, "legal-pages.json"), "utf8"))

const AUTH_CHECKOUT = {
  de: {
    acceptTerms:
      "Ich akzeptiere die <termsLink>AGB</termsLink> und die <loyaltyLink>Bedingungen des Treueprogramms</loyaltyLink>.",
    acceptTermsRequired: "Bitte akzeptieren Sie die AGB und Treueprogramm-Bedingungen.",
    termsNotice:
      "Mit der Bestellung akzeptieren Sie unsere <termsLink>AGB</termsLink> und die <loyaltyLink>Bedingungen des Treueprogramms</loyaltyLink>."
  },
  en: {
    acceptTerms:
      "I accept the <termsLink>Terms & Conditions</termsLink> and <loyaltyLink>Loyalty Programme Terms</loyaltyLink>.",
    acceptTermsRequired: "Please accept the terms and loyalty programme conditions.",
    termsNotice:
      "By placing your order you accept our <termsLink>Terms & Conditions</termsLink> and <loyaltyLink>Loyalty Programme Terms</loyaltyLink>."
  },
  nl: {
    acceptTerms:
      "Ik accepteer de <termsLink>algemene voorwaarden</termsLink> en de <loyaltyLink>spaarprogramma-voorwaarden</loyaltyLink>.",
    acceptTermsRequired: "Accepteer de voorwaarden en spaarprogramma-voorwaarden.",
    termsNotice:
      "Door te bestellen accepteert u onze <termsLink>algemene voorwaarden</termsLink> en <loyaltyLink>spaarprogramma-voorwaarden</loyaltyLink>."
  },
  pl: {
    acceptTerms:
      "Akceptuję <termsLink>regulamin</termsLink> oraz <loyaltyLink>warunki programu lojalnościowego</loyaltyLink>.",
    acceptTermsRequired: "Zaakceptuj regulamin i warunki programu lojalnościowego.",
    termsNotice:
      "Składając zamówienie akceptujesz <termsLink>regulamin</termsLink> oraz <loyaltyLink>warunki programu lojalnościowego</loyaltyLink>."
  },
  ru: {
    acceptTerms:
      "Я принимаю <termsLink>условия использования</termsLink> и <loyaltyLink>правила программы лояльности</loyaltyLink>.",
    acceptTermsRequired: "Примите условия и правила программы лояльности.",
    termsNotice:
      "Оформляя заказ, вы принимаете <termsLink>условия использования</termsLink> и <loyaltyLink>правила программы лояльности</loyaltyLink>."
  },
  ro: {
    acceptTerms:
      "Accept <termsLink>termenii și condițiile</termsLink> și <loyaltyLink>regulamentul programului de loialitate</loyaltyLink>.",
    acceptTermsRequired: "Acceptați termenii și regulamentul programului de loialitate.",
    termsNotice:
      "Plasând comanda acceptați <termsLink>termenii și condițiile</termsLink> și <loyaltyLink>regulamentul programului de loialitate</loyaltyLink>."
  },
  hi: {
    acceptTerms:
      "मैं <termsLink>नियम व शर्तें</termsLink> और <loyaltyLink>लॉयल्टी प्रोग्राम की शर्तें</loyaltyLink> स्वीकार करता/करती हूँ।",
    acceptTermsRequired: "कृपया नियम और लॉयल्टी शर्तें स्वीकार करें।",
    termsNotice:
      "ऑर्डर देकर आप <termsLink>नियम व शर्तें</termsLink> और <loyaltyLink>लॉयल्टी प्रोग्राम की शर्तें</loyaltyLink> स्वीकार करते हैं।"
  },
  ar: {
    acceptTerms:
      "أوافق على <termsLink>الشروط والأحكام</termsLink> و<loyaltyLink>شروط برنامج الولاء</loyaltyLink>.",
    acceptTermsRequired: "يرجى قبول الشروط وشروط برنامج الولاء.",
    termsNotice:
      "بإتمام الطلب فإنك توافق على <termsLink>الشروط والأحكام</termsLink> و<loyaltyLink>شروط برنامج الولاء</loyaltyLink>."
  },
  ku: {
    acceptTerms:
      "Ez <termsLink>mercên bikaranînê</termsLink> û <loyaltyLink>mercên bernameya dilsoziyê</loyaltyLink> qebûl dikim.",
    acceptTermsRequired: "Ji kerema xwe mercan qebûl bikin.",
    termsNotice:
      "Bi şandina fermana xwe hûn <termsLink>mercên bikaranînê</termsLink> û <loyaltyLink>mercên bernameya dilsoziyê</loyaltyLink> qebûl dikin."
  },
  tr: {
    acceptTerms:
      "<termsLink>Kullanım şartlarını</termsLink> ve <loyaltyLink>sadakat programı koşullarını</loyaltyLink> kabul ediyorum.",
    acceptTermsRequired: "Lütfen şartları ve sadakat programı koşullarını kabul edin.",
    termsNotice:
      "Sipariş vererek <termsLink>Kullanım Şartları</termsLink> ve <loyaltyLink>Sadakat Programı Koşullarını</loyaltyLink> kabul etmiş olursunuz."
  },
  ckb: {
    acceptTerms:
      "<termsLink>مەرج و ڕێساکان</termsLink> و <loyaltyLink>مەرجەکانی بەرنامەی وەفاداری</loyaltyLink> قبوڵ دەکەم.",
    acceptTermsRequired: "تکایە مەرجەکان قبوڵ بکە.",
    termsNotice:
      "بە دانانی داواکاری <termsLink>مەرج و ڕێساکان</termsLink> و <loyaltyLink>مەرجەکانی بەرنامەی وەفاداری</loyaltyLink> قبوڵ دەکەیت."
  }
}

for (const [lang, data] of Object.entries(legal)) {
  const filePath = path.join(localesDir, `${lang}.json`)
  if (!fs.existsSync(filePath)) continue
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))
  locale.pages.nav.terms = data.nav.terms
  locale.pages.nav.loyaltyTerms = data.nav.loyaltyTerms
  locale.pages.terms = data.terms
  locale.pages.loyaltyTerms = data.loyaltyTerms
  const extra = AUTH_CHECKOUT[lang]
  if (extra) {
    locale.auth.acceptTerms = extra.acceptTerms
    locale.auth.acceptTermsRequired = extra.acceptTermsRequired
    locale.checkout.termsNotice = extra.termsNotice
  }
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Merged legal pages into ${lang}.json`)
}

console.log("Done")
