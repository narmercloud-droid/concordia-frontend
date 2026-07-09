/**
 * Generate Straelen TV promo posters (1920×1080) in 8 languages.
 * Run from repo root: node concordia-frontend/scripts/generate-straelen-tv-posters.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(frontendRoot, "..", "Concordia-Backend");
const require = createRequire(path.join(backendRoot, "package.json"));
const QRCode = require("qrcode");

const OUT_DIR = path.join(frontendRoot, "public", "brand", "tv-posters", "straelen");
const PNG_DIR = path.join(OUT_DIR, "png");
const FLAGS_DIR = path.join(OUT_DIR, "flags");
const ORDER_URL = "https://www.concordiapizza.de/branch/concordia-straelen";

/** All app languages except Kurdish (Kurmanji + Sorani). */
const LANGUAGE_FLAGS = [
  { code: "de", iso: "de", label: "Deutsch" },
  { code: "en", iso: "gb", label: "English" },
  { code: "nl", iso: "nl", label: "Nederlands" },
  { code: "pl", iso: "pl", label: "Polski" },
  { code: "ru", iso: "ru", label: "Русский" },
  { code: "ro", iso: "ro", label: "Română" },
  { code: "hi", iso: "in", label: "हिन्दी" },
  { code: "ar", iso: "sa", label: "العربية" },
  { code: "tr", iso: "tr", label: "Türkçe" }
];

const BRAND = {
  burgundy: "#8B1A2B",
  gold: "#D4A82A",
  green: "#2D5A3D",
  cream: "#FAF8F5",
  dark: "#1A1F1C",
  muted: "#5C6B62"
};

const POSTERS = {
  de: {
    langLabel: "Deutsch",
    headline: "Deine Vorteile",
    subhead: "Nur bei Online-Bestellung",
    discountNote: "Alle Rabatte gelten für Lieferung & Abholung über die Website",
    discountNote: "Alle Rabatte gelten für Lieferung & Abholung über die Website",
    promos: [
      { value: "10%", title: "Online-Rabatt", detail: "auf jede Website-Bestellung" },
      { value: "0 €", title: "Gratis Lieferung", detail: "ab 15 € Bestellwert" },
      { value: "Gratis", title: "Getränk", detail: "ab 35 € · 1,0 l Softdrink oder 0,5 l Durstlöscher" }
    ],
    scan: "Jetzt scannen & bestellen",
    branch: "Concordia Straelen",
    orderInLang: "Bestelle in deiner Sprache",
    tagline: "Deutsche Herzlichkeit · Italienische Leidenschaft"
  },
  en: {
    langLabel: "English",
    headline: "Your benefits",
    subhead: "Online orders only",
    discountNote: "All discounts apply to delivery & pickup orders via the website",
    promos: [
      { value: "10%", title: "Online discount", detail: "on every website order" },
      { value: "€0", title: "Free delivery", detail: "from €15 order value" },
      { value: "Free", title: "Drink", detail: "from €35 · 1.0 L soft drink or 0.5 L Durstlöscher" }
    ],
    scan: "Scan & order now",
    branch: "Concordia Straelen",
    orderInLang: "Order in your own language",
    tagline: "German warmth · Italian passion"
  },
  ro: {
    langLabel: "Română",
    headline: "Avantajele tale",
    subhead: "Doar la comenzi online",
    discountNote: "Toate reducerile sunt valabile la livrare și ridicare prin site",
    promos: [
      { value: "10%", title: "Reducere online", detail: "la fiecare comandă pe site" },
      { value: "0 €", title: "Livrare gratuită", detail: "de la 15 € comandă" },
      { value: "Gratis", title: "Băutură", detail: "de la 35 € · băutură 1,0 l sau Durstlöscher 0,5 l" }
    ],
    scan: "Scanează și comandă acum",
    branch: "Concordia Straelen",
    orderInLang: "Comandă în limba ta",
    tagline: "Căldură germană · Pasiune italiană"
  },
  ru: {
    langLabel: "Русский",
    headline: "Ваши преимущества",
    subhead: "Только при онлайн-заказе",
    discountNote: "Все скидки действуют на доставку и самовывоз через сайт",
    promos: [
      { value: "10%", title: "Скидка онлайн", detail: "на каждый заказ на сайте" },
      { value: "0 €", title: "Бесплатная доставка", detail: "от 15 € суммы заказа" },
      { value: "Напиток", title: "в подарок", detail: "от 35 € · 1,0 л безалкогольный или Durstlöscher 0,5 л" }
    ],
    scan: "Сканируйте и заказывайте",
    branch: "Concordia Straelen",
    orderInLang: "Заказывайте на своём языке",
    tagline: "Немецкое гостеприимство · Итальянская страсть"
  },
  hi: {
    langLabel: "हिन्दी",
    headline: "आपके फ़ायदे",
    subhead: "केवल ऑनलाइन ऑर्डर पर",
    discountNote: "सभी छूट वेबसाइट पर डिलीवरी और पिकअप ऑर्डर पर लागू होती हैं",
    promos: [
      { value: "10%", title: "ऑनलाइन छूट", detail: "हर वेबसाइट ऑर्डर पर" },
      { value: "0 €", title: "मुफ़्त डिलीवरी", detail: "15 € से ऑर्डर मूल्य पर" },
      { value: "मुफ़्त", title: "पेय", detail: "35 € से · 1.0 L सॉफ्ट ड्रिंक या 0.5 L Durstlöscher" }
    ],
    scan: "स्कैन करें और ऑर्डर करें",
    branch: "Concordia Straelen",
    orderInLang: "अपनी भाषा में ऑर्डर करें",
    tagline: "जर्मन मेहमाननवाज़ी · इतालवी जुनून"
  },
  pl: {
    langLabel: "Polski",
    headline: "Twoje korzyści",
    subhead: "Tylko przy zamówieniu online",
    discountNote: "Wszystkie rabaty obowiązują przy dostawie i odbiorze przez stronę",
    promos: [
      { value: "10%", title: "Rabat online", detail: "przy każdym zamówieniu na stronie" },
      { value: "0 €", title: "Darmowa dostawa", detail: "od 15 € wartości zamówienia" },
      { value: "Gratis", title: "Napój", detail: "od 35 € · napój 1,0 l lub Durstlöscher 0,5 l" }
    ],
    scan: "Zeskanuj i zamów teraz",
    branch: "Concordia Straelen",
    orderInLang: "Zamawiaj w swoim języku",
    tagline: "Niemiecka gościnność · Włoska pasja"
  },
  nl: {
    langLabel: "Nederlands",
    headline: "Jouw voordelen",
    subhead: "Alleen bij online bestelling",
    discountNote: "Alle kortingen gelden voor bezorging én afhalen via de website",
    promos: [
      { value: "10%", title: "Online korting", detail: "op elke bestelling via de website" },
      { value: "€0", title: "Gratis bezorging", detail: "vanaf €15 bestelwaarde" },
      { value: "Gratis", title: "Drankje", detail: "vanaf €35 · 1,0 l frisdrank of 0,5 l Durstlöscher" }
    ],
    scan: "Scan en bestel nu",
    branch: "Concordia Straelen",
    orderInLang: "Bestel in je eigen taal",
    tagline: "Duitse gastvrijheid · Italiaanse passie"
  },
  ar: {
    langLabel: "العربية",
    headline: "مزاياك",
    subhead: "عند الطلب عبر الإنترنت فقط",
    discountNote: "جميع الخصومات تنطبق على التوصيل والاستلام عبر الموقع",
    promos: [
      { value: "10%", title: "خصم أونلاين", detail: "على كل طلب عبر الموقع" },
      { value: "0 €", title: "توصيل مجاني", detail: "من 15 يورو قيمة الطلب" },
      { value: "مجاني", title: "مشروب", detail: "من 35 يورو · مشروب 1.0 ل أو Durstlöscher 0.5 ل" }
    ],
    scan: "امسح الرمز واطلب الآن",
    branch: "Concordia Straelen",
    orderInLang: "اطلب بلغتك",
    tagline: "كرم ألماني · شغف إيطالي"
  }
};

function posterHtml(lang, content, qrDataUrl) {
  const promoCards = content.promos
    .map(
      (p) => `
      <div class="promo">
        <div class="promo__value">${p.value}</div>
        <div class="promo__text">
          <strong>${p.title}</strong>
          <span>${p.detail}</span>
        </div>
      </div>`
    )
    .join("");

  const flagRow = LANGUAGE_FLAGS.map(
    (item) =>
      `<span class="lang-flag" title="${item.label}"><img src="flags/${item.iso}.png" alt="${item.label}" width="52" height="36" /></span>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>Concordia Straelen — ${content.langLabel}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      font-family: "DM Sans", Arial, sans-serif;
      background: ${BRAND.cream};
      color: ${BRAND.dark};
    }
    .poster {
      width: 1920px;
      height: 1080px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      background:
        radial-gradient(1200px 700px at 0% 0%, rgba(139,26,43,.12), transparent 60%),
        radial-gradient(900px 600px at 100% 100%, rgba(45,90,61,.10), transparent 55%),
        ${BRAND.cream};
    }
    .left {
      padding: 72px 64px 72px 88px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 28px;
    }
    .brand {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 58px;
      font-weight: 700;
      color: ${BRAND.burgundy};
      line-height: 1.05;
    }
    .tagline {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${BRAND.green};
    }
    .headline {
      font-size: 68px;
      font-weight: 800;
      line-height: 1;
      color: ${BRAND.dark};
    }
    .subhead {
      font-size: 26px;
      color: ${BRAND.muted};
      font-weight: 600;
    }
    .discount-note {
      display: inline-block;
      margin-top: 2px;
      padding: 14px 20px;
      border-radius: 14px;
      background: rgba(212,168,42,.18);
      border: 3px solid ${BRAND.gold};
      font-size: 26px;
      line-height: 1.3;
      font-weight: 800;
      color: ${BRAND.dark};
      max-width: 920px;
      box-shadow: 0 8px 24px rgba(26,31,28,.08);
    }
    .promos { display: grid; gap: 18px; margin-top: 10px; }
    .promo {
      display: grid;
      grid-template-columns: 190px 1fr;
      align-items: stretch;
      overflow: hidden;
      background: #fff;
      border: 3px solid ${BRAND.gold};
      border-radius: 20px;
      box-shadow: 0 14px 36px rgba(26,31,28,.14);
    }
    .promo__value {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 22px 16px;
      font-size: 64px;
      font-weight: 900;
      line-height: 0.95;
      text-align: center;
      color: #fff;
      background: linear-gradient(160deg, ${BRAND.burgundy} 0%, #6d1220 100%);
      letter-spacing: -0.02em;
    }
    .promo__text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 22px 28px;
      gap: 8px;
    }
    .promo__text strong {
      display: block;
      font-size: 42px;
      line-height: 1.05;
      color: ${BRAND.burgundy};
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .promo__text span {
      display: block;
      font-size: 28px;
      line-height: 1.25;
      color: ${BRAND.dark};
      font-weight: 700;
    }
    .right {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 72px 88px 72px 48px;
      text-align: center;
    }
    .qr-wrap {
      background: #fff;
      border: 10px solid ${BRAND.gold};
      border-radius: 28px;
      padding: 28px;
      box-shadow: 0 18px 50px rgba(26,31,28,.12);
    }
    .qr-wrap img {
      display: block;
      width: 420px;
      height: 420px;
    }
    .scan {
      margin-top: 36px;
      font-size: 42px;
      font-weight: 800;
      color: ${BRAND.green};
    }
    .url {
      margin-top: 14px;
      font-size: 22px;
      color: ${BRAND.muted};
      word-break: break-all;
      max-width: 520px;
    }
    .footer {
      margin-top: 36px;
      width: 100%;
      max-width: 560px;
    }
    .footer strong {
      color: ${BRAND.burgundy};
      font-size: 30px;
      display: block;
      margin-bottom: 18px;
    }
    .lang-callout {
      background: linear-gradient(135deg, rgba(139,26,43,.08), rgba(45,90,61,.10));
      border: 2px solid rgba(212,168,42,.45);
      border-radius: 22px;
      padding: 22px 26px 20px;
      box-shadow: 0 12px 32px rgba(26,31,28,.08);
    }
    .lang-callout__line {
      font-size: 30px;
      font-weight: 800;
      line-height: 1.2;
      color: ${BRAND.green};
      margin-bottom: 16px;
    }
    .lang-flags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px 12px;
    }
    .lang-flag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 40px;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(26,31,28,.10);
      border: 1px solid rgba(26,31,28,.08);
    }
    .lang-flag img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .poster { position: relative; }
  </style>
</head>
<body>
  <div class="poster">
    <section class="left">
      <div class="brand">Pizzeria Concordia</div>
      <div class="tagline">${content.tagline}</div>
      <h1 class="headline">${content.headline}</h1>
      <p class="subhead">${content.subhead}</p>
      <p class="discount-note">${content.discountNote}</p>
      <div class="promos">${promoCards}</div>
    </section>
    <section class="right">
      <div class="qr-wrap">
        <img src="${qrDataUrl}" alt="QR code" width="420" height="420" />
      </div>
      <p class="scan">${content.scan}</p>
      <p class="url">${ORDER_URL}</p>
      <div class="footer">
        <strong>${content.branch}</strong>
        <div class="lang-callout">
          <p class="lang-callout__line">${content.orderInLang}</p>
          <div class="lang-flags">${flagRow}</div>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`;
}

async function ensureFlagsDownloaded() {
  fs.mkdirSync(FLAGS_DIR, { recursive: true });

  for (const item of LANGUAGE_FLAGS) {
    const filePath = path.join(FLAGS_DIR, `${item.iso}.png`);
    if (fs.existsSync(filePath)) continue;

    const url = `https://flagcdn.com/w160/${item.iso}.png`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download flag for ${item.iso}: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded flags/${item.iso}.png`);
  }
}

async function loadChromium() {
  const candidates = [
    "@playwright/test",
    path.join(backendRoot, "node_modules", "@playwright", "test", "index.js"),
    path.join(backendRoot, "node_modules", "playwright", "index.js")
  ];

  for (const candidate of candidates) {
    try {
      const mod = await import(
        candidate.startsWith("@") ? candidate : pathToFileURL(candidate).href
      );
      const api = mod.chromium ? mod : mod.default;
      if (api?.chromium) return api.chromium;
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function exportPng(lang, htmlPath) {
  const chromium = await loadChromium();
  if (!chromium) return false;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0)
  );
  await page.screenshot({
    path: path.join(PNG_DIR, `poster-${lang}.png`),
    type: "png",
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });
  await browser.close();
  return true;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PNG_DIR, { recursive: true });
  await ensureFlagsDownloaded();

  const qrDataUrl = await QRCode.toDataURL(ORDER_URL, {
    width: 900,
    margin: 1,
    color: { dark: BRAND.dark, light: "#ffffff" }
  });

  const indexLinks = [];

  for (const [lang, content] of Object.entries(POSTERS)) {
    const html = posterHtml(lang, content, qrDataUrl);
    const htmlPath = path.join(OUT_DIR, `poster-${lang}.html`);
    fs.writeFileSync(htmlPath, html, "utf8");
    indexLinks.push({ lang, label: content.langLabel, file: `poster-${lang}.html` });
    console.log(`Wrote ${htmlPath}`);
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8" /><title>Straelen TV Posters</title>
<style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 20px} a{display:block;margin:10px 0;font-size:18px}</style>
</head><body>
<h1>Concordia Straelen — TV Posters</h1>
<p>1920×1080 · Open any poster fullscreen for your TV video.</p>
<ul>${indexLinks.map((l) => `<li><a href="${l.file}">${l.label} (${l.lang})</a></li>`).join("")}</ul>
<p>PNG exports: <code>png/</code> folder (if generated)</p>
</body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexHtml, "utf8");

  let pngCount = 0;
  for (const lang of Object.keys(POSTERS)) {
    const ok = await exportPng(lang, path.join(OUT_DIR, `poster-${lang}.html`));
    if (ok) {
      pngCount += 1;
      console.log(`Exported png/poster-${lang}.png`);
    }
  }

  if (pngCount === 0) {
    console.log("PNG export skipped (Playwright not available). Open HTML files in browser at 1920×1080.");
  } else {
    console.log(`Exported ${pngCount} PNG posters to ${PNG_DIR}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
