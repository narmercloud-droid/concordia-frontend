# Concordia — Owner Guide

You are the restaurant owner. Your lead developer handles all technical work.

**Hosting & go-live:** [DEPLOYMENT_ROADMAP.md](./DEPLOYMENT_ROADMAP.md)  
**This guide:** what works today, how to run Kempen, and how to grow direct orders.

---

## Quick navigation

| Section | What it covers |
|---------|----------------|
| [What works now](#what-works-now) | Website, Sunmi, drivers, admin panel |
| [Kempen delivery areas](#kempen-delivery-postcodes) | Postcodes, minimums, fees |
| [Growing the business](#growing-the-business) | Attract customers, improve flow, 90-day plan |
| [Your role](#your-role) | What you do vs what the developer does |
| [Live URLs](#live-urls-june-2026) | Production links |
| [Security](#security) | Passwords and credentials |
| [Online payments (Stripe)](#online-payments-stripe) | Card, Apple Pay, Google Pay per branch |

---

## Online payments (Stripe)

Each branch (Kempen, Straelen) has **its own Stripe account**. Money from online orders goes to that branch’s bank — not mixed together.

### What customers see

| Method | When available |
|--------|----------------|
| Cash on pickup/delivery | Always |
| Card | After branch Stripe is connected |
| Apple Pay | iPhone/Safari, after domain verified |
| Google Pay | Chrome/Android, after branch connected |
| PayPal | If still configured globally (optional) |

### One-time setup (developer / owner with Stripe login)

#### 1. Stripe Dashboard → [API keys](https://dashboard.stripe.com/apikeys)

Copy **Publishable key** (`pk_live_…`) and **Secret key** (`sk_live_…`).

#### 2. Render → `concordia-backend-eu` → **Environment**

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (step 3) |
| `FRONTEND_URL` | `https://www.concordiapizza.de` |

Save → service redeploys.

#### 3. Stripe Dashboard → [Webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**

| Field | Value |
|-------|--------|
| URL | `https://api.concordiapizza.de/api/stripe/webhook` |
| Events | `payment_intent.succeeded`, `account.updated` |
| Connected accounts | **Enabled** (“Listen to events on Connected accounts”) |

Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` on Render.

#### 4. Apple Pay domain file (already in the website repo)

File path on the live site:

`https://www.concordiapizza.de/.well-known/apple-developer-merchantid-domain-association`

After the next frontend deploy, Stripe can verify the domain. In Stripe → **Settings → Payment method domains**, add `www.concordiapizza.de` and click **Verify**.

#### 5. Connect each branch in admin

1. Open **https://www.concordiapizza.de/admin/platform-settings**
2. Log in as super admin (`owner@concordia.de`)
3. Select **Kempen** in the branch switcher → **Branch settings** tab
4. Click **Connect Stripe for this branch** → complete Stripe Express (business + bank for Kempen)
5. Repeat for **Straelen** when that branch goes live

### Helper script (on your PC, in `Concordia-Backend`)

```bash
node scripts/setup-stripe-payments.mjs
node scripts/setup-stripe-payments.mjs --validate-domains   # after frontend deploy
```

Uses `STRIPE_SECRET_KEY` from `.env` to register payment domains and prints the checklist above.

### Test before going live

1. Use Stripe **test keys** (`sk_test_…` / `pk_test_…`) on a staging backend first, or
2. Place a small real order at Kempen with card after Connect is complete
3. Confirm order shows **paid** in admin and kitchen receives it

---

## What works now

### Customer website

- Order online at **Kempen**: pickup or delivery (cash; **card / Apple Pay / Google Pay** per branch when Stripe is connected)
- **10% off** automatic discount on website orders
- **Free drink** on orders from €35
- **Guest or account checkout** — no sign-in required; accounts earn loyalty points
- **Cart editing** — change quantities or item options before checkout
- **11 languages** — good for Kempen’s diverse customer base
- Delivery postcode rules (Lieferando-aligned areas)
- ASAP or scheduled time slots
- Live order tracking with driver map (delivery)
- **Gift vouchers** — `/gutschein`, redeemable at checkout
- **Google reviews** on `/reviews`; order feedback in admin at `/admin/reviews`
- Bestsellers on the menu are based on **real order data**, not AI guesses

### Sunmi terminal (Kempen)

- Branch code: **KEMPEN** (enter once, stays connected 24/7)
- Staff sees new orders — **no auto-print**
- Staff sets prep time (default: 45 min delivery / 15 min pickup)
- Staff taps **Confirm time & Print**
- Prints full receipt + Kitchen 2 ticket (non-pizza items)

### Driver delivery

- Driver scans QR on receipt → accepts delivery → GPS tracks automatically
- Customer sees driver on the map during delivery

### Branch manager panel

- URL: **`/admin/login`** on the website
- **Kempen manager:** `kempen@concordia.de`
- **Super admin (you):** `owner@concordia.de`
- Default password: set via secure seed (`SEED_ADMIN_PASSWORD`) / ops vault — **never** store real passwords in this guide. Change immediately after first login.

From the panel you can:

- View today’s orders and revenue
- Edit opening hours and branch on/off (super admin)
- **Delivery settings** — postcode zones, distance radius, free delivery rules
- Toggle menu items on/off and change prices
- Read customer order reviews (food + delivery)

---

## Kempen delivery postcodes

| Postcode | Min order | Delivery fee |
|----------|-----------|--------------|
| 41749 | €30 | €2 |
| 47647 | €20 | €2 |
| 47669 | €20 | €2 |
| 47839 | €30 | €2 |
| 47906 | €15 | €2 |
| 47918 | €20 | €2 |
| 47929 | €20 | €2 |

---

## Kitchen routing

| Station | What prints |
|---------|-------------|
| **Kitchen 1 (Sunmi)** | Full order receipt |
| **Kitchen 2** | Non-pizza items only (on Sunmi until network printer is installed) |

**Staff rule:** Always set a realistic prep time and tap **Confirm time & Print** before the kitchen starts. Reliable timing = better reviews.

---

## Payment

**Launch:** cash on pickup and delivery (`CASH_ONLY_LAUNCH=true` on the server).  
**When ready:** card and PayPal can be turned on in hosting settings — many customers expect online payment.

---

## Growing the business

### The big opportunity

Lieferando takes roughly **15–30% commission**. Your own website keeps that margin and you still offer **10% off** to the customer — everyone wins except the platform.

**Goal:** Make ordering direct **easier and more trustworthy** than Lieferando, then **bring people back** so they order again.

> Keep Lieferando live in parallel until you are confident. Switch customers gradually, not overnight.

---

### 1. Attract new customers (outside the website)

These often matter **more than new software features**.

#### Own your Google presence

Most new local customers find you on **Google Maps**, not by typing your URL.

| Action | How |
|--------|-----|
| Ask for reviews | After a good meal or delivery: *“If you enjoyed it, a Google review helps us a lot.”* |
| QR on receipts | Link to your Kempen Google review page |
| Keep profile updated | Hours, photos, phone, link to your order site |

Your website already shows Google reviews on **`/reviews`** — use the same quotes on social media.

#### Move customers from Lieferando to your site

| Channel | Message |
|---------|---------|
| Receipt / flyer | *“Order direct & save 10%”* + your website URL |
| Bag insert | Small card in every delivery bag |
| In person | *“We have our own app-free website — 10% off automatically.”* |

#### Local partnerships (low cost)

- Schools, clubs, sports teams → family pizza night with online discount
- Flyers to offices in your delivery postcodes (47906, 47929, etc.)

#### Social media

Short kitchen clips (pizza from the oven, fresh pasta) outperform polished ads. Use **real guest quotes** from Google.

---

### 2. Improve the order flow (website → paid order)

Fix friction **before** adding fancy features.

| Priority | Issue | What to do |
|----------|--------|------------|
| **High** | Slow first load (“Loading menu…”) | Upgrade backend to **Render Starter (~€7/mo)** — no cold starts |
| **High** | `vercel.app` URL looks temporary | Connect **your own domain** (e.g. `www.concordia-kempen.de`) |
| **High** | Cash-only blocks some guests | Enable **card/PayPal** when you are ready |
| **Medium** | Mobile orders | Keep **Order now** obvious on the homepage |
| **Medium** | Straelen | When live, one site with **two branches** widens reach instantly |

**Already working well:** guest checkout, auto 10% discount, free drink from €35, live delivery tracking, gift vouchers, multi-language menu.

---

### 3. Bring customers back (retention)

Keeping a customer is cheaper than finding a new one.

| Tactic | Status | Next step |
|--------|--------|-----------|
| **Loyalty points** | Built for registered users | Launch with a simple message: *“Create an account — earn points every order.”* |
| **Post-order feedback** | Customers can rate on tracking page | Ask happy guests to leave a **Google** review; fix issues before they go public |
| **Marketing email/SMS** | Opt-in at checkout | Only with consent — Friday offers, birthday deals |
| **Gift vouchers** | Live at `/gutschein` | Promote for birthdays, Christmas, local employers |

**First loyalty reward** should be easy to reach (e.g. free drink or €5 off) so people feel progress quickly.

---

### 4. Operations = marketing

| If the kitchen/driver flow is reliable | Then |
|----------------------------------------|------|
| Realistic prep times on Sunmi | Fewer angry calls |
| Kitchen 2 tickets for non-pizza | Fewer mistakes, faster service |
| Driver QR + GPS map | Fewer “where is my food?” messages |
| Correct hours & prices in admin | No lost orders from wrong info |

**Happy operations → good reviews → more new customers.**

---

### 5. What to measure (simple weekly check)

You do not need complex analytics yet. Once a week, note:

| Metric | Why it matters |
|--------|----------------|
| Website orders vs Lieferando | Are you winning the switch? |
| Average order value | Is the €35 free drink lifting basket size? |
| Repeat customers (same phone/email) | Is retention working? |
| Delivery vs pickup split | Staffing and marketing focus |
| Google rating & review count | Local discovery |
| Feedback in **`/admin/reviews`** | Fix kitchen/driver issues early |

---

### 6. Ninety-day growth plan

#### Month 1 — Trust & reliability

- [ ] Custom domain + Render Starter (fast menu load)
- [ ] Google review push (receipt QR, ask in restaurant)
- [ ] Flyers: *“10% off — order direct”*
- [ ] Train staff: **Confirm time & Print** on every Sunmi order

#### Month 2 — Conversion & retention

- [ ] **Stripe Connect** for Kempen (card / Apple Pay / Google Pay) — see [Online payments](#online-payments-stripe)
- [ ] Promote gift vouchers locally
- [ ] Turn on loyalty for registered customers
- [ ] Post-order message: rate your order / leave Google review

#### Month 3 — Scale

- [ ] Straelen online when kitchen is ready
- [ ] Small SMS/email to past guests (**opt-in only**)
- [ ] 2–3 local business or club partnerships

---

### What not to chase yet

- AI chatbots on the website
- Complex loyalty tiers before basic points work
- More branches on the site before Straelen actually takes orders
- Heavy paid ads before Google reviews and your own domain are solid

---

### Bottom line

| Best return on effort | |
|----------------------|---|
| 1 | Switch Lieferando customers to your site (10% off + better experience) |
| 2 | Google reviews + own domain (trust) |
| 3 | Fast, reliable ordering (no cold starts, clear menu) |
| 4 | Bring people back (loyalty, vouchers, follow-up) |
| 5 | Run kitchen/driver flow consistently every shift |

You already have more technology than most independent restaurants. The gap is **visibility, trust, and habit** — then loyalty and notifications as you grow.

---

## Your role

1. **Test** when asked and report what you see (works / broken / confusing)
2. **Use the admin panel** for hours, prices, delivery rules, and feedback
3. **Say when you are ready** for friends & family, then public switch from Lieferando
4. **Drive growth** using the checklist above — marketing is yours; building is the developer’s

---

## Live URLs (June 2026)

| What | URL |
|------|-----|
| **Customer website** | https://www.concordiapizza.de |
| **Kempen menu** | https://www.concordiapizza.de/branch/concordia-kempen |
| **Straelen menu** | https://www.concordiapizza.de/branch/concordia-straelen |
| **Admin panel** | https://www.concordiapizza.de/admin/login |
| **Platform settings (Stripe)** | https://www.concordiapizza.de/admin/platform-settings |
| **Backend API** | https://api.concordiapizza.de |
| **Health check** | https://api.concordiapizza.de/api/health |

Custom domain setup details: see [DEPLOYMENT_ROADMAP.md](./DEPLOYMENT_ROADMAP.md).

---

## Deploy status

### Done

- Render backend **Live** (free tier — consider Starter for production)
- Vercel frontend **Live**
- Neon database connected
- Kempen menu synced

### Recommended next

1. **Custom domain** on Vercel + API subdomain on Render
2. **Render Starter** (~€7/mo) — eliminates slow “wake up” on first visit
3. **S3** for permanent menu photos (see deployment roadmap)
4. Change default admin password after first login

---

## Security

- Never share database passwords in chat or email
- Change the default admin password after first login
- Credentials live only in Vercel / Render / Neon dashboards
- Rotate Neon password if it was ever shared during setup
