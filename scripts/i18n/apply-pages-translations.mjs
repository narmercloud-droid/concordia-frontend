/**
 * Merge translated pages.* into all locale files.
 * Run: node scripts/i18n/apply-pages-translations.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")
const pagesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "pages-translations.json"), "utf8")
)

const LANGS = Object.keys(pagesData)

for (const lang of LANGS) {
  const filePath = path.join(localesDir, `${lang}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(`Skip ${lang} — locale file missing`)
    continue
  }
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))
  locale.pages = pagesData[lang]
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Updated pages in ${lang}.json`)
}

console.log("Done")
