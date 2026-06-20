/**
 * Compress public food/hero images to WebP (~80 quality) and shrink notification logo.
 * Run: node scripts/compress-static-assets.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const FOOD_QUALITY = 80;
const FOOD_MAX_WIDTH = 1200;
const HERO_MAX_WIDTH = 1600;
const PORTRAIT_MAX_WIDTH = 640;
const NOTIFICATION_LOGO_SIZE = 192;

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function writeWebp(inputPath, outputPath, { maxWidth, quality = FOOD_QUALITY }) {
  const before = fs.statSync(inputPath).size;
  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath);
  const after = fs.statSync(outputPath).size;
  console.log(`  ${path.basename(inputPath)} -> ${path.basename(outputPath)}  ${kb(before)} -> ${kb(after)}`);
  return { before, after };
}

async function compressFoodFolder() {
  const foodDir = path.join(publicDir, "images", "food");
  const files = fs.readdirSync(foodDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let saved = 0;

  console.log("\nFood images -> WebP");
  for (const file of files) {
    const inputPath = path.join(foodDir, file);
    const base = file.replace(/\.(jpe?g|png)$/i, "");
    const outputPath = path.join(foodDir, `${base}.webp`);
    const isHero = /hero|gallery-dining|gallery-kitchen/i.test(base);
    const { before, after } = await writeWebp(inputPath, outputPath, {
      maxWidth: isHero ? HERO_MAX_WIDTH : FOOD_MAX_WIDTH
    });
    saved += before - after;
    fs.unlinkSync(inputPath);
  }
  console.log(`Food folder saved ~${kb(saved)}`);
}

async function compressOwnerPortraits() {
  const ownersDir = path.join(publicDir, "images", "owners");
  if (!fs.existsSync(ownersDir)) return;

  console.log("\nOwner portraits -> WebP");
  const files = fs.readdirSync(ownersDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  for (const file of files) {
    const inputPath = path.join(ownersDir, file);
    const base = file.replace(/\.(jpe?g|png)$/i, "");
    const outputPath = path.join(ownersDir, `${base}.webp`);
    if (fs.existsSync(outputPath)) continue;
    await writeWebp(inputPath, outputPath, { maxWidth: PORTRAIT_MAX_WIDTH });
    if (/logo-portrait/i.test(base)) {
      fs.unlinkSync(inputPath);
    }
  }
}

async function shrinkNotificationLogo() {
  const source = path.join(publicDir, "images", "concordia-logo-fancy.png");
  const target = path.join(publicDir, "images", "concordia-logo.png");
  const before = fs.statSync(target).size;

  await sharp(source)
    .resize(NOTIFICATION_LOGO_SIZE, NOTIFICATION_LOGO_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png({ compressionLevel: 9, palette: true, quality: 80 })
    .toFile(`${target}.tmp`);

  fs.renameSync(`${target}.tmp`, target);
  const after = fs.statSync(target).size;
  console.log(`\nNotification logo: ${kb(before)} -> ${kb(after)}`);
}

async function recompressHeroVideo() {
  const videoPath = path.join(publicDir, "videos", "hero-oven.webp");
  const outputPath = path.join(publicDir, "videos", "hero-oven-opt.webp");
  if (!fs.existsSync(videoPath)) return;

  const before = fs.statSync(videoPath).size;

  try {
    await sharp(videoPath, { animated: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(outputPath);
    const after = fs.statSync(outputPath).size;
    console.log(`\nHero oven loop: ${kb(before)} -> ${kb(after)} (hero-oven-opt.webp)`);
  } catch (err) {
    console.warn("Hero oven recompress skipped:", err.message);
  }
}

async function compressBrandPngs() {
  const paletteTargets = ["concordia-logo-people-tiered.png", "concordia-logo-wordmark.png"];
  console.log("\nBrand PNGs (optimize in place)");
  for (const file of paletteTargets) {
    const filePath = path.join(publicDir, "images", file);
    if (!fs.existsSync(filePath)) continue;
    const before = fs.statSync(filePath).size;
    const tmp = `${filePath}.tmp`;
    await sharp(filePath)
      .png({ compressionLevel: 9, palette: true, quality: 85 })
      .toFile(tmp);
    fs.renameSync(tmp, filePath);
    const after = fs.statSync(filePath).size;
    console.log(`  ${file}: ${kb(before)} -> ${kb(after)}`);
  }
}

async function main() {
  console.log("Compressing static assets...");
  await compressFoodFolder();
  await compressOwnerPortraits();
  await shrinkNotificationLogo();
  await recompressHeroVideo();
  await compressBrandPngs();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
