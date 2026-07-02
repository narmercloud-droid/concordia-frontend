const SITE_ORIGIN = (process.env.PUBLIC_SITE_ORIGIN ?? "https://www.concordiapizza.de").replace(
  /\/$/,
  ""
);

const API_ORIGIN = (
  process.env.CONCORDIA_API_ORIGIN ?? "https://api.concordiapizza.de"
).replace(/\/$/, "");

const LOCATIONS = {
  straelen: {
    branchId: "concordia-straelen",
    label: "Concordia Pizzeria Straelen",
    servesCuisine: ["Pizza", "Pasta", "Italian"]
  },
  kempen: {
    branchId: "concordia-kempen",
    label: "Concordia Pizzeria Kempen",
    servesCuisine: ["Pizza", "Pasta", "Italian"]
  }
};

export function resolveCrawlMenuSlug(slug) {
  const key = String(slug ?? "").toLowerCase();
  return key in LOCATIONS ? key : null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEuro(price) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(Number(price) || 0);
}

function branchUrls(slug, branchId) {
  const menuUrl = `${SITE_ORIGIN}/${slug}-menu.html`;
  const orderUrl = `${SITE_ORIGIN}/branch/${branchId}`;
  const pickupUrl = `${SITE_ORIGIN}/branch/${branchId}/checkout?fulfillment=pickup`;
  const deliveryUrl = `${SITE_ORIGIN}/branch/${branchId}/checkout?fulfillment=delivery`;
  return { menuUrl, orderUrl, pickupUrl, deliveryUrl };
}

async function fetchApi(path) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  const body = await res.json();
  return body?.data ?? body;
}

function buildJsonLd(input) {
  const menuSections = input.categories.map((cat) => ({
    "@type": "MenuSection",
    name: cat.name,
    description: cat.description || undefined,
    hasMenuItem: (cat.items ?? []).map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      description: item.description || undefined,
      offers: {
        "@type": "Offer",
        price: Number(item.price || 0).toFixed(2),
        priceCurrency: "EUR"
      }
    }))
  }));

  const restaurant = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${input.urls.menuUrl}#restaurant`,
    name: input.name,
    url: input.urls.orderUrl,
    servesCuisine: LOCATIONS[input.slug].servesCuisine,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: input.address,
      addressLocality: input.city,
      postalCode: input.postalCode,
      addressCountry: "DE"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: input.lat,
      longitude: input.lng
    },
    hasMenu: {
      "@type": "Menu",
      name: `${input.name} – Speisekarte`,
      url: input.urls.menuUrl,
      hasMenuSection: menuSections
    },
    potentialAction: [
      {
        "@type": "OrderAction",
        target: input.urls.orderUrl,
        name: "Online bestellen"
      },
      {
        "@type": "OrderAction",
        target: input.urls.pickupUrl,
        name: "Abholung"
      },
      {
        "@type": "OrderAction",
        target: input.urls.deliveryUrl,
        name: "Lieferung"
      }
    ]
  };

  if (input.phone) restaurant.telephone = input.phone;
  return restaurant;
}

function renderCategoryHtml(cat) {
  const items = (cat.items ?? [])
    .map((item) => {
      const desc = item.description
        ? `<p class="item-desc">${escapeHtml(item.description)}</p>`
        : "";
      return `<li class="menu-item">
  <div class="item-row">
    <h3 class="item-name">${escapeHtml(item.name)}</h3>
    <span class="item-price">${escapeHtml(formatEuro(item.price))}</span>
  </div>
  ${desc}
</li>`;
    })
    .join("\n");

  const lead = cat.description
    ? `<p class="cat-desc">${escapeHtml(cat.description)}</p>`
    : "";

  return `<section class="menu-section" id="cat-${escapeHtml(String(cat.id))}">
  <h2>${escapeHtml(cat.name)}</h2>
  ${lead}
  <ul class="menu-list">${items}</ul>
</section>`;
}

export async function renderCrawlMenuHtml(slug) {
  const location = LOCATIONS[slug];
  if (!location) return null;

  const [branches, menuPayload] = await Promise.all([
    fetchApi("/api/branches"),
    fetchApi(`/api/branches/${location.branchId}/menu?lang=de`)
  ]);

  const branch = (Array.isArray(branches) ? branches : []).find(
    (row) => row.id === location.branchId
  );
  if (!branch || branch.comingSoon) return null;

  const categories = menuPayload?.categories ?? menuPayload;
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const urls = branchUrls(slug, location.branchId);
  const displayName = branch.name || location.label;
  const address = String(branch.address ?? "");
  const city = String(branch.city ?? "");
  const postalCode = String(branch.postalCode ?? "");
  const lat = Number(branch.lat ?? 0);
  const lng = Number(branch.lng ?? 0);
  const phone = String(branch.phone ?? "").trim();

  const jsonLd = buildJsonLd({
    slug,
    name: displayName,
    address,
    city,
    postalCode,
    lat,
    lng,
    phone,
    categories,
    urls
  });

  const sectionsHtml = categories.map(renderCategoryHtml).join("\n");
  const addressLine = [address, `${postalCode} ${city}`.trim()].filter(Boolean).join(", ");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(displayName)} – Speisekarte | Concordia</title>
  <meta name="description" content="Speisekarte von ${escapeHtml(displayName)}. Pizza, Pasta und mehr online bestellen – Abholung und Lieferung." />
  <link rel="canonical" href="${urls.menuUrl}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; line-height: 1.5; }
    body { margin: 0; background: #f6f8f6; color: #1a1a1a; }
    .wrap { max-width: 52rem; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
    header { background: #1b7340; color: #fff; padding: 1.5rem 1rem; }
    header h1 { margin: 0 0 0.35rem; font-size: 1.6rem; }
    header p { margin: 0; opacity: 0.92; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 1.25rem 0 1.75rem; }
    .actions a { display: inline-block; padding: 0.65rem 1rem; border-radius: 999px; text-decoration: none; font-weight: 600; }
    .btn-primary { background: #1b7340; color: #fff; }
    .btn-secondary { background: #fff; color: #1b7340; border: 1px solid #1b7340; }
    .menu-section { background: #fff; border-radius: 12px; padding: 1rem 1.1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .menu-section h2 { margin: 0 0 0.35rem; font-size: 1.25rem; color: #1b7340; }
    .cat-desc, .item-desc { margin: 0.25rem 0 0; color: #444; font-size: 0.95rem; }
    .menu-list { list-style: none; margin: 0.75rem 0 0; padding: 0; }
    .menu-item { padding: 0.65rem 0; border-top: 1px solid #eee; }
    .menu-item:first-child { border-top: 0; }
    .item-row { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
    .item-name { margin: 0; font-size: 1rem; font-weight: 600; }
    .item-price { font-weight: 600; white-space: nowrap; }
    footer { margin-top: 2rem; font-size: 0.9rem; color: #555; }
    footer a { color: #1b7340; }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <h1>${escapeHtml(displayName)}</h1>
      <p>${escapeHtml(addressLine)}</p>
    </div>
  </header>
  <main class="wrap">
    <p>Online bestellen bei Concordia – frische Pizza, Pasta und mehr.</p>
    <nav class="actions" aria-label="Bestellen">
      <a class="btn-primary" href="${urls.orderUrl}">Jetzt bestellen</a>
      <a class="btn-secondary" href="${urls.pickupUrl}">Abholung</a>
      <a class="btn-secondary" href="${urls.deliveryUrl}">Lieferung</a>
    </nav>
    ${sectionsHtml}
    <footer>
      <p>Interaktive Bestellung: <a href="${urls.orderUrl}">${escapeHtml(urls.orderUrl)}</a></p>
    </footer>
  </main>
</body>
</html>`;
}
