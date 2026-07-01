import { renderCrawlMenuHtml, resolveCrawlMenuSlug } from "../lib/crawlMenuHtml.mjs";

export default async function handler(req, res) {
  const slug = resolveCrawlMenuSlug(req.query.slug);
  if (!slug) {
    res.status(404).setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send("Not found");
  }

  try {
    const html = await renderCrawlMenuHtml(slug);
    if (!html) {
      res.status(404).setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send("Not found");
    }

    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("crawl-menu error", slug, err);
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send("Menu temporarily unavailable");
  }
}
