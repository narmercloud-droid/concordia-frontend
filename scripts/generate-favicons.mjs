/**
 * Generate favicon + PWA icons from the chef mascot lockup.
 * Crops the circular emblem (top square) for legibility at small sizes.
 *
 * Run: node scripts/generate-favicons.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

/** Chef lockup closest to the classic Pizzeria Concordia brand mark. */
const SRC = path.join(
  publicDir,
  "images",
  "logo-options",
  "concordia-logo-chef-v3-plate-stacked.png",
);

async function emblemPipeline() {
  const meta = await sharp(SRC).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;
  // Circle emblem sits in the upper portion; omit lockup text for small icons.
  const side = Math.min(width, Math.round(height * 0.72));
  const left = Math.floor((width - side) / 2);
  return sharp(SRC).extract({ left, top: 0, width: side, height: side });
}

async function writePng(pipeline, outPath, size) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pipeline.clone().resize(size, size).png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`  ${path.relative(root, outPath)} (${size}x${size})`);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source logo not found: ${SRC}`);
  }

  const emblem = await emblemPipeline();

  console.log("Generating favicon + brand icons from chef mascot…");

  await writePng(emblem, path.join(publicDir, "brand", "favicon-48.png"), 48);
  await writePng(emblem, path.join(publicDir, "brand", "concordia-mark-192.png"), 192);
  await writePng(emblem, path.join(publicDir, "brand", "concordia-mark-512.png"), 512);
  await writePng(emblem, path.join(publicDir, "brand", "apple-touch-icon.png"), 180);
  await writePng(emblem, path.join(publicDir, "brand", "apple-touch-icon-152.png"), 152);
  await writePng(emblem, path.join(publicDir, "brand", "apple-touch-icon-167.png"), 167);
  await writePng(emblem, path.join(publicDir, "images", "concordia-logo-web-icon.png"), 512);
  await writePng(emblem, path.join(publicDir, "logo192.png"), 192);
  await writePng(emblem, path.join(publicDir, "logo512.png"), 512);

  const faviconPath = path.join(publicDir, "favicon.ico");
  await emblem.clone().resize(32, 32).toFile(faviconPath);

  console.log(`  ${path.relative(root, faviconPath)} (32x32 ico)`);
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
