/**
 * Ensures every locale file has the same keys as de.json (master).
 * Applies per-language patches from scripts/i18n-patches/<lang>.json
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "../src/i18n/locales")
const patchesDir = path.join(__dirname, "i18n-patches")

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== "object") target[key] = {}
      deepMerge(target[key], value)
    } else {
      target[key] = value
    }
  }
  return target
}

function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const pathKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flatten(value, pathKey)
    }
    return [[pathKey, value]]
  })
}

// Apply de patch first so new master keys are included in parity checks
const masterPath = path.join(localesDir, "de.json")
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"))
const dePatchPath = path.join(patchesDir, "de.json")
if (fs.existsSync(dePatchPath)) {
  deepMerge(master, JSON.parse(fs.readFileSync(dePatchPath, "utf8")))
  fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`)
}
const masterKeys = new Set(flatten(master).map(([k]) => k))

const localeFiles = fs
  .readdirSync(localesDir)
  .filter((f) => f.endsWith(".json"))

let failed = false

for (const file of localeFiles) {
  const lang = file.replace(".json", "")
  const filePath = path.join(localesDir, file)
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"))

  const patchPath = path.join(patchesDir, `${lang}.json`)
  if (fs.existsSync(patchPath)) {
    const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"))
    deepMerge(data, patch)
  }

  const keys = new Set(flatten(data).map(([k]) => k))
  const missing = [...masterKeys].filter((k) => !keys.has(k))
  const extra = [...keys].filter((k) => !masterKeys.has(k))

  if (missing.length) {
    console.error(`${file}: missing ${missing.length} keys`)
    missing.forEach((k) => console.error(`  - ${k}`))
    failed = true
  }
  if (extra.length) {
    console.warn(`${file}: ${extra.length} extra keys (not in de.json)`)
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Updated ${file}`)
}

if (failed) {
  console.error("\nLocale sync failed — add missing keys to i18n-patches/")
  process.exit(1)
}

console.log("\nAll locales in sync with de.json")
