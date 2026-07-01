/**
 * Writes crawlable menu HTML into public/ for static hosting on Vercel.
 * Run before vite build (npm run build).
 *
 * If the live API is unreachable during CI (Render cold start), keeps committed
 * menu HTML files so the deployment still succeeds.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderCrawlMenuHtml } from "./lib/crawlMenuHtml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, "..", "public");
const slugs = ["straelen", "kempen"];

function outputPaths(slug) {
  return [
    path.join(publicRoot, slug, "menu.html"),
    path.join(publicRoot, "menus", `${slug}.html`),
    path.join(publicRoot, `${slug}-menu.html`)
  ];
}

async function writeAll(slug, html) {
  const paths = outputPaths(slug);
  await mkdir(path.join(publicRoot, slug), { recursive: true });
  await mkdir(path.join(publicRoot, "menus"), { recursive: true });
  for (const outPath of paths) {
    await writeFile(outPath, html, "utf8");
    console.log(`Wrote ${outPath}`);
  }
}

async function generateSlug(slug) {
  try {
    const html = await renderCrawlMenuHtml(slug);
    if (!html) {
      throw new Error(`empty menu for ${slug}`);
    }
    await writeAll(slug, html);
    return "generated";
  } catch (err) {
    const paths = outputPaths(slug);
    const allPresent = paths.every((p) => existsSync(p));
    if (!allPresent) {
      const missing = paths.filter((p) => !existsSync(p));
      throw new Error(
        `Menu generation failed for ${slug} and committed fallback files are missing: ${missing.join(", ")}. ${err?.message ?? err}`
      );
    }
    console.warn(
      `[generate-crawl-menus] API unavailable for ${slug}; using committed HTML. (${err?.message ?? err})`
    );
    return "fallback";
  }
}

async function main() {
  const results = [];
  for (const slug of slugs) {
    results.push(await generateSlug(slug));
  }
  const generated = results.filter((r) => r === "generated").length;
  const fallback = results.filter((r) => r === "fallback").length;
  console.log(
    `Menu HTML ready (${generated} regenerated, ${fallback} from committed files).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
