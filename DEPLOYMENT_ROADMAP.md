# Concordia — Permanent Deployment Roadmap

This is the step-by-step plan to move from the current setup (Vercel + Render free + Neon) to a **stable production stack with your own domain** — economical and maintainable for Kempen (and later Straelen).

**Last updated:** June 2026

---

## What you are deploying

| Piece | What it is | Today | Must be permanent? |
|-------|------------|-------|-------------------|
| **Customer website + admin** | `concordia-frontend` | Vercel | Yes |
| **Backend API** | `Concordia-Backend` | Render (`concordia-backend-eu`) | Yes |
| **Database** | Kempen menu, orders, customers | Neon Postgres | Yes |
| **Menu photos** | Dish images from admin | Render disk (temporary) | Yes → S3 |
| **Cache / speed** | Menu cache, rate limits | Redis (optional on free Render) | Recommended |
| **Sunmi terminal** | Kitchen APK on device | Points at Render API | Yes (API URL only) |
| **Domain** | e.g. `www.concordiapizza.de` | Connected (Cloudflare + Vercel) | Yes |

Courier ordering is already part of the main website (`/courier`). No separate hosting needed.

**Repos:**

- Frontend: `concordia-frontend` → https://github.com/narmercloud-droid/concordia-frontend
- Backend: `Concordia-Backend` → https://github.com/narmercloud-droid/Concordia-Backend

**Current live URLs (production):**

| What | URL |
|------|-----|
| Customer website | https://www.concordiapizza.de |
| Backend API | https://api.concordiapizza.de |
| Health check | https://api.concordiapizza.de/api/health |
| Render service (keep) | `concordia-backend-eu` |

> **Deprecated:** `concordia-backend-web.onrender.com` — old duplicate; safe to delete from Render once `api.concordiapizza.de` is confirmed on **EU**.

---

## Recommended “forever” stack (best value)

| Layer | Platform | Why | Est. cost |
|-------|----------|-----|-----------|
| **Website** | **Vercel** (Hobby, free) | Already wired; fast CDN, free SSL, custom domain | **€0** |
| **API** | **Render Starter** | Always on, no cold starts, Docker | **~$7/mo (~€7)** |
| **Database** | **Neon** (keep; upgrade when needed) | Already live; backups, serverless Postgres | **€0–19/mo** |
| **Redis** | **Upstash** | Serverless Redis; menu cache + rate limits | **€0–10/mo** |
| **Photos** | **AWS S3** (Frankfurt `eu-central-1`) | Permanent menu images | **~€1–3/mo** |
| **DNS** | **Cloudflare** (free) | Fast DNS, SSL, DDoS protection | **€0** |
| **Domain** | Registrar (IONOS / Cloudflare / etc.) | Your brand URL | **~€10–15/year** |

**Rough total: ~€10–25/month** for one branch in solid production.

### Avoid long-term

| Platform | Problem |
|----------|---------|
| **Render free** | Sleeps → slow first load; disk wiped on redeploy → photos lost |
| **Render disk for images** | Not permanent |
| **Many hosts for one app** | Extra cost and complexity |

---

## Target architecture

```
Customers (phone/browser)  →  www.your-domain.de  →  Vercel (website)
Sunmi terminal APK         →  api.your-domain.de  →  Render (API)
Render API                 →  Neon (database)
Render API                 →  Upstash (Redis cache)
Render API                 →  AWS S3 (menu photos)
Website                    →  S3 URLs for dish images (public read)
```

**Example domains (choose one set):**

- `concordia-kempen.de` — main brand
- `www.concordia-kempen.de` — customer website + admin
- `api.concordia-kempen.de` — backend API (recommended)

---

## Phase 1 — Domain and DNS (owner, ~1 day)

**Goal:** Own the URL forever.

- [ ] Buy a domain (German `.de` recommended for local trust)
  - Registrars: IONOS, Strato, Cloudflare Registrar, Namecheap
  - Example: `concordia-kempen.de` (~€10–15/year)
- [ ] Create free **Cloudflare** account and add the site
- [ ] At registrar, point nameservers to Cloudflare
- [ ] Decide final URLs:
  - Website: `https://www.concordia-kempen.de`
  - API: `https://api.concordia-kempen.de`

**Owner:** Buy domain; share Cloudflare access with developer.

---

## Phase 2 — Permanent data (developer, ~2 hours)

**Goal:** Nothing important lives on temporary server disk.

### 2a. Neon database

- [ ] Keep current Neon project (free tier OK for launch)
- [ ] Optional later: Neon **Launch** (~$19/mo) for more storage and backup SLAs
- [ ] Rotate database password after go-live

### 2b. AWS S3 for menu photos

See also: menu photo setup (bucket + IAM + Render env vars).

- [ ] Create S3 bucket in `eu-central-1` (Frankfurt), e.g. `concordia-menu-photos`
- [ ] Allow public read on `menu/*` (bucket policy)
- [ ] Create IAM user with `s3:PutObject` + `s3:PutObjectAcl` on `menu/*`
- [ ] Add to **Render** environment:

| Variable | Example |
|----------|---------|
| `S3_BUCKET` | `concordia-menu-photos` |
| `S3_REGION` | `eu-central-1` |
| `S3_ACCESS_KEY` | (from IAM) |
| `S3_SECRET_KEY` | (from IAM) |

- [ ] After redeploy, re-upload photos in **Admin → Menu → Edit item**
- [ ] Confirm image URLs start with `https://....s3.eu-central-1.amazonaws.com/menu/...`

### 2c. Upstash Redis

- [ ] Create Redis at https://upstash.com (EU region)
- [ ] Copy `REDIS_URL` into Render environment

**Effect:** Faster menu, stable caching, better rate limiting.

---

## Phase 3 — Upgrade backend (developer, ~1 hour)

**Goal:** API always awake and reliable.

- [ ] Render → `concordia-backend-eu` → upgrade **Free → Starter** (~$7/mo) if not already
- [ ] Set / verify environment variables:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | Upstash URL |
| `JWT_SECRET` | Strong random secret |
| `FRONTEND_URL` | `https://www.your-domain.de` |
| `CORS_ORIGIN` | `https://www.your-domain.de` |
| `BACKEND_PUBLIC_URL` | `https://api.your-domain.de` |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | (see Phase 2b) |
| PayPal, VAPID, etc. | As already configured in Render |

- [ ] Render → Custom Domains → add `api.your-domain.de`
- [ ] Cloudflare DNS: CNAME `api` → Render hostname
- [ ] Verify: `https://api.your-domain.de/health` returns **200**

---

## Phase 4 — Website on your domain (developer, ~1 hour)

**Goal:** Customers use your brand URL, not `*.vercel.app`.

- [ ] Vercel → `concordia-frontend` → Environment:
  - `VITE_API_URL=https://api.your-domain.de`
- [ ] Vercel → Domains → add `www.your-domain.de` and root domain
- [ ] Cloudflare DNS per Vercel instructions (CNAME for `www`, A/ALIAS for `@`)
- [ ] Cloudflare SSL: **Full (strict)**
- [ ] Redeploy frontend

**Tests:**

- [ ] Home page on your domain
- [ ] Menu: `/branch/concordia-kempen`
- [ ] Admin: `https://www.your-domain.de/admin/login`
- [ ] Test checkout (cash; PayPal if enabled)
- [ ] Language switcher and menu translations

---

## Phase 5 — Sunmi terminal (owner + developer, ~30 min)

Terminal is an **APK on the device**, not hosted on the web.

- [ ] Set `VITE_API_URL=https://api.your-domain.de` in `concordia-terminal-ui/.env.production`
- [ ] Rebuild APK (see `concordia-terminal-ui/TERMINAL_README.md`)
- [ ] Install on Sunmi devices
- [ ] Login with branch code **KEMPEN**

**Rule:** If API domain stays fixed, rebuild APK only when the API URL changes.

---

## Phase 6 — Go-live checklist

| # | Check | Who |
|---|--------|-----|
| 1 | Domain opens website on phone | Owner |
| 2 | `https://api.your-domain.de/health` = 200 | Developer |
| 3 | Menu photos use S3 URLs | Developer |
| 4 | Admin login on your domain | Owner |
| 5 | Test order: pickup + delivery | Owner |
| 6 | Sunmi: new order, confirm time, print | Owner |
| 7 | Driver QR / tracking (if used) | Owner |
| 8 | Change default admin password (`Kempen2026!`) | Owner |
| 9 | Rotate Neon DB password | Owner |
| 10 | Update Google Business / flyers with new URL | Owner |

---

## Monthly cost summary

| Item | Low budget | Recommended |
|------|------------|-------------|
| Domain | ~€1/mo | ~€1/mo |
| Vercel (website) | €0 | €0 |
| Render Starter (API) | €7 | €7 |
| Neon | €0 (free) | €0–19 |
| Upstash Redis | €0 (free tier) | €0–10 |
| S3 photos | €1–3 | €1–3 |
| **Total** | **~€9–12/mo** | **~€15–25/mo** |

---

## Suggested timeline

| Week | Focus |
|------|--------|
| **Week 1** | Domain, Cloudflare, S3, Upstash |
| **Week 2** | Render Starter, API custom domain, env vars |
| **Week 3** | Vercel custom domain, re-upload photos, test orders |
| **Week 4** | Terminal APK, switch marketing to your domain |

---

## Who does what

### Owner

- Buy and renew domain
- Pay hosting bills (~€15–25/mo)
- Cloudflare / registrar access
- Test orders on phone
- Install terminal APK
- Update marketing links (Google, Lieferando redirect, flyers)

### Developer (lead)

- S3, Upstash, Render, Vercel configuration
- DNS records in Cloudflare
- Environment variables, CORS, redeploys
- Terminal APK build
- Smoke tests after each phase

---

## After go-live (keep it running)

1. **Auto-deploy:** GitHub `main` → Vercel + Render (keep enabled).
2. **Backups:** Neon backups on; optional S3 versioning for photos.
3. **Domain:** Enable auto-renew at registrar.
4. **Photos:** Always use S3 — never rely on Render disk.
5. **Yearly:** Rotate admin password and review API keys; confirm SSL and domain renewal.

---

## Optional: cheaper API (advanced, not recommended for owner-only ops)

**Hetzner VPS** (~€4–6/mo) + Docker can replace Render, but requires ongoing server maintenance (updates, backups, security). Only consider if you have dedicated IT support.

**Default recommendation:** Vercel + Render Starter + Neon + S3 + Cloudflare.

---

## Related docs

- [OWNER_GUIDE.md](./OWNER_GUIDE.md) — day-to-day owner reference (login, terminal, manager panel)
- [concordia-terminal-ui/TERMINAL_README.md](./concordia-terminal-ui/TERMINAL_README.md) — Sunmi APK build and install
- [Concordia-Backend/DEPLOYMENT.md](./Concordia-Backend/DEPLOYMENT.md) — backend env vars and health checks

---

## Progress tracker

Use this section to tick phases as you complete them:

| Phase | Status | Date completed | Notes |
|-------|--------|----------------|-------|
| 1 — Domain & DNS | ⬜ Not started | | |
| 2a — Neon | ⬜ Not started | | |
| 2b — S3 photos | ⬜ Not started | | |
| 2c — Upstash Redis | ⬜ Not started | | |
| 3 — Render Starter + API domain | ⬜ Not started | | |
| 4 — Vercel + website domain | ⬜ Not started | | |
| 5 — Sunmi APK | ⬜ Not started | | |
| 6 — Go-live checklist | ⬜ Not started | | |

**Chosen domain:** _fill in when decided_

**Production website URL:** _fill in_

**Production API URL:** _fill in_
