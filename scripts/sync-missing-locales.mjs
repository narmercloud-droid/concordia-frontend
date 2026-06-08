import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(here, "../src/i18n/locales")
const ref = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"))

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

function deepMergeMissing(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = deepMergeMissing(target[k] ?? {}, v)
    } else if (target[k] === undefined) {
      target[k] = v
    }
  }
  return target
}

const refFlat = flatten(ref)
const files = fs
  .readdirSync(localesDir)
  .filter((f) => f.endsWith(".json") && f !== "de.json")

for (const file of files) {
  const locPath = path.join(localesDir, file)
  const loc = JSON.parse(fs.readFileSync(locPath, "utf8"))
  const locFlat = flatten(loc)
  const missing = {}
  for (const [key, value] of Object.entries(refFlat)) {
    if (!(key in locFlat)) missing[key] = value
  }
  if (!Object.keys(missing).length) {
    console.log(`${file}: up to date`)
    continue
  }
  const merged = deepMergeMissing(loc, unflatten(missing))
  fs.writeFileSync(locPath, `${JSON.stringify(merged, null, 2)}\n`)
  console.log(`${file}: added ${Object.keys(missing).length} keys`)
}
