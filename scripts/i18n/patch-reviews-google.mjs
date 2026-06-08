/**
 * Add Google reviews UI keys to all locale files (from en template).
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../../src/i18n/locales")
const en = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"))
const template = en.pages.reviews

const OVERRIDES = {
  nl: {
    lead: "Echte feedback van Google Maps — bedankt voor uw vertrouwen.",
    branchLabel: "Kies vestiging",
    branchReviews: "Top Google-recensies voor Concordia {{branch}}",
    loading: "Recensies laden…",
    loadError: "Google-recensies konden nu niet worden geladen.",
    fallbackNotice: "Uitgelichte gastcitaten voor {{branch}} terwijl Google-recensies laden.",
    viewOnGoogle: "Alle recensies op Google Maps",
    ratingLabel: "{{rating}} van 5 sterren",
    reviewCount: "{{count}} Google-recensies"
  },
  pl: {
    lead: "Prawdziwe opinie z Google Maps — dziękujemy za zaufanie.",
    branchLabel: "Wybierz oddział",
    branchReviews: "Najlepsze opinie Google dla Concordia {{branch}}",
    loading: "Ładowanie opinii…",
    loadError: "Nie udało się teraz załadować opinii Google.",
    fallbackNotice: "Polecane cytaty gości dla {{branch}}, podczas ładowania opinii Google.",
    viewOnGoogle: "Zobacz wszystkie opinie w Google Maps",
    ratingLabel: "{{rating}} na 5 gwiazdek",
    reviewCount: "{{count}} opinii Google"
  }
}

for (const file of fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"))) {
  const lang = file.replace(".json", "")
  if (lang === "en" || lang === "de") continue
  const filePath = path.join(localesDir, file)
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"))
  const extra = OVERRIDES[lang] ?? {}
  locale.pages.reviews = {
    ...locale.pages.reviews,
    lead: extra.lead ?? template.lead,
    branchLabel: extra.branchLabel ?? template.branchLabel,
    branchReviews: extra.branchReviews ?? template.branchReviews,
    loading: extra.loading ?? template.loading,
    loadError: extra.loadError ?? template.loadError,
    fallbackNotice: extra.fallbackNotice ?? template.fallbackNotice,
    viewOnGoogle: extra.viewOnGoogle ?? template.viewOnGoogle,
    ratingLabel: extra.ratingLabel ?? template.ratingLabel,
    reviewCount: extra.reviewCount ?? template.reviewCount
  }
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`)
  console.log(`Patched ${lang}`)
}
