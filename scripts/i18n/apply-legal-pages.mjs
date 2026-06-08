/**
 * Merge legal pages into locale files (combined website + loyalty terms).
 * Run: node scripts/i18n/apply-legal-pages.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  ACCEPT,
  LOYALTY_PART,
  NAV,
  TITLE
} from "./merge-combined-terms.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")
const legal = JSON.parse(fs.readFileSync(path.join(__dirname, "legal-pages.json"), "utf8"))

for (const [lang, data] of Object.entries(legal)) {
  const filePath = path.join(localesDir, `${lang}.json`)
  if (!fs.existsSync(filePath)) continue
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))

  locale.pages.nav.terms = NAV[lang] ?? data.nav.terms
  delete locale.pages.nav.loyaltyTerms

  locale.pages.terms = {
    ...data.terms,
    title: TITLE[lang] ?? data.terms.title,
    loyaltyPartTitle: LOYALTY_PART[lang]?.title ?? "Loyalty programme",
    loyaltyPartLead: LOYALTY_PART[lang]?.lead ?? data.loyaltyTerms.lead,
    loyaltySections: data.loyaltyTerms.sections
  }
  delete locale.pages.loyaltyTerms

  const accept = ACCEPT[lang]
  if (accept) {
    locale.auth.acceptTerms = accept.acceptTerms
    locale.auth.acceptTermsRequired = accept.acceptTermsRequired
    locale.checkout.termsNotice = accept.termsNotice
  }

  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Merged legal pages into ${lang}.json`)
}

console.log("Done")
