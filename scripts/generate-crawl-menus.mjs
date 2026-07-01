/**
 * Writes crawlable menu HTML into public/ for static hosting on Vercel.
 * Run before vite build (npm run build).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderCrawlMenuHtml } from "../api/lib/crawlMenuHtml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, "..", "public");
const slugs = ["straelen", "kempen"];

async function main() {
  for (const slug of slugs) {
    const html = await renderCrawlMenuHtml(slug);
    if (!html) {
      throw new Error(`Failed to generate menu HTML for ${slug}`);
    }
    const dir = path.join(publicRoot, slug);
    await mkdir(dir, { recursive: true });
    const outPath = path.join(dir, "menu.html");
    await writeFile(outPath, html, "utf8");
    console.log(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
