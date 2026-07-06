import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(here, "../src/i18n/locales")

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""))
}

function flatten(obj, prefix = "") {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key))
    } else {
      out[key] = v
    }
  }
  return out
}

function unflatten(flat) {
  const result = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".")
    let cur = result
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] ?? {}
      cur = cur[parts[i]]
    }
    cur[parts[parts.length - 1]] = value
  }
  return result
}

const master = readJson(path.join(localesDir, "de.json"))
const en = readJson(path.join(localesDir, "en.json"))
const masterFlat = flatten(master)
const enFlat = flatten(en)

const files = fs
  .readdirSync(localesDir)
  .filter((f) => f.endsWith(".json") && f !== "de.json")

for (const file of files) {
  const locPath = path.join(localesDir, file)
  const locFlat = flatten(readJson(locPath))
  let added = 0

  for (const [key, deValue] of Object.entries(masterFlat)) {
    if (key in locFlat) continue
    locFlat[key] = enFlat[key] ?? deValue
    added += 1
  }

  if (!added) {
    console.log(`${file}: up to date`)
    continue
  }

  fs.writeFileSync(locPath, `${JSON.stringify(unflatten(locFlat), null, 2)}\n`)
  console.log(`${file}: added ${added} keys`)
}
