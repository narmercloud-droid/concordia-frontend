/**
 * Smoke-test production customer site + public API endpoints.
 * Usage: node scripts/check-live-site.mjs [siteUrl] [apiUrl]
 */

const siteUrl = (process.argv[2] ?? "https://www.concordiapizza.de").replace(/\/$/, "");
const apiUrl = (process.argv[3] ?? "https://api.concordiapizza.de").replace(/\/$/, "");

const branches = ["concordia-kempen", "concordia-straelen"];

async function check(name, fn) {
  try {
    const detail = await fn();
    return { name, ok: true, detail };
  } catch (err) {
    return { name, ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 200);
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url} — ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body;
}

const results = [];

results.push(
  await check("homepage", async () => {
    const res = await fetch(siteUrl, { redirect: "follow" });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!html.includes('id="root"') && !html.includes("Concordia")) {
      throw new Error("Unexpected homepage HTML");
    }
    return { status: res.status, bytes: html.length };
  })
);

results.push(
  await check("health", async () => {
    const body = await fetchJson(`${apiUrl}/api/health`);
    return body?.status ?? body;
  })
);

results.push(
  await check("branches", async () => {
    const body = await fetchJson(`${apiUrl}/api/branches`);
    const list = body?.branches ?? body?.data ?? body;
    if (!Array.isArray(list) || list.length < 1) throw new Error("No branches returned");
    return { count: list.length, ids: list.map((b) => b.id).slice(0, 5) };
  })
);

for (const branchId of branches) {
  results.push(
    await check(`menu:${branchId}`, async () => {
      const body = await fetchJson(`${apiUrl}/api/branches/${branchId}/menu`);
      const categories = body?.categories ?? body?.menu?.categories ?? [];
      if (!Array.isArray(categories)) throw new Error("Invalid menu payload");
      return { categories: categories.length };
    })
  );

  results.push(
    await check(`delivery:${branchId}`, async () => {
      const body = await fetchJson(`${apiUrl}/api/branches/${branchId}/delivery-areas`);
      return {
        mode: body?.deliveryMode,
        radiusZones: body?.radiusZones?.length ?? 0,
        postcodes: body?.areas?.length ?? body?.deliveryAreas?.length ?? 0
      };
    })
  );

  results.push(
    await check(`quote:${branchId}:geldern`, async () => {
      const body = await fetchJson(`${apiUrl}/api/branches/${branchId}/delivery-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "Markt 7, 47608 Geldern",
          postalCode: "47608",
          lat: 51.5194,
          lng: 6.3236,
          orderTotal: 25
        })
      });
      if (body?.allowed === false) {
        throw new Error(body?.message ?? "Geldern address not deliverable");
      }
      return {
        allowed: body?.allowed,
        fee: body?.deliveryFee,
        distanceKm: body?.distanceKm
      };
    })
  );
}

results.push(
  await check("admin-login-page", async () => {
    const res = await fetch(`${siteUrl}/admin/login`, { redirect: "follow" });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { status: res.status, hasRoot: html.includes('id="root"') };
  })
);

const failed = results.filter((r) => !r.ok);
const summary = {
  siteUrl,
  apiUrl,
  passed: results.length - failed.length,
  failed: failed.length,
  results
};

console.log(JSON.stringify(summary, null, 2));
process.exit(failed.length ? 1 : 0);
