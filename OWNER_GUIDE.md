# Concordia — Owner Guide

You are the restaurant owner. Your lead developer handles all technical work.

**Permanent hosting plan:** see [DEPLOYMENT_ROADMAP.md](./DEPLOYMENT_ROADMAP.md) for domain, Vercel, Render, S3, and go-live steps.



## What works now



### Customer website

- Customer site has no AI; bestsellers and manager analytics are SQL-based from real order data.

- Order online at Kempen: pickup or delivery (cash, card, PayPal when configured)

- **Cart editing** — change quantities or edit item options before checkout

- **Guest or account checkout** — guests can order without signing in; registered customers earn loyalty points

- **Payment method icons** on checkout and gift voucher pages

- Delivery postcode rules (Lieferando areas)

- ASAP or scheduled time slots

- Live order tracking with driver map (delivery orders)

- **Gift vouchers** — purchasable per branch, redeemable at checkout



### Sunmi terminal (Kempen)

- Branch code: **KEMPEN** (enter once, stays connected 24/7)

- Staff sees new orders — no auto-print

- Staff sets prep time (default 45 min delivery / 15 min pickup)

- Staff taps **Confirm time & Print**

- Prints full receipt + Kitchen 2 ticket (non-pizza items)



### Driver delivery

- Driver scans QR on receipt → accepts delivery → GPS tracks automatically

- Customer sees driver on map during delivery



### Branch manager panel

- URL: `/admin/login` on the website

- **Kempen manager:** `kempen@concordia.de`

- **Super admin (you):** `owner@concordia.de`

- Default password (change after first login): **Kempen2026!**



From the panel you can:

- View today's orders and revenue

- Edit opening hours

- **Delivery settings** — choose postcode zones, distance radius, or both; set free delivery when minimum order is reached

- Toggle menu items on/off and change prices



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



- **Kitchen 1 (Sunmi):** Full order receipt

- **Kitchen 2:** Non-pizza items only (on Sunmi until network printer is installed)



---



## Payment



Cash only at launch. PayPal comes later.



---



## When we go live online (free hosting)



Developer will:

1. Deploy backend to Render (free tier)

2. Deploy website to Vercel (free tier)

3. Set `CASH_ONLY_LAUNCH=true` (no payment setup needed)

4. Rebuild Sunmi APK with the live API URL

5. Run database seed once



You will then do **one full test session** before switching customers from Lieferando.



Lieferando stays live in parallel until you are confident.



---



## Your role



1. Test when asked and report what you see

2. Use the branch manager panel to adjust hours, prices, and delivery rules

3. Tell us when you are ready for friends & family soft launch



---



## Live URLs (June 2026)



| What | URL |

|------|-----|

| **Backend API (Render)** | https://concordia-backend-web.onrender.com |

| **Health check** | https://concordia-backend-web.onrender.com/health |

| **Customer website (Vercel)** | *pending — see deploy steps below* |

| **Kempen direct order link** | `/customer/branch/concordia-kempen` *(on your Vercel domain)* |



---



## Deploy status



### Done

- Render backend is **Live** (free tier)

- Neon database connected

- Kempen menu synced (113 items)



### Next (one-time setup)

1. **GitHub:** Create empty repo `concordia-frontend` under `narmercloud-droid` — lead developer pushes the website code

2. **Vercel:** Import `concordia-frontend`, set `VITE_API_URL=https://concordia-backend-web.onrender.com`

3. **Render:** Update `FRONTEND_URL`, `CORS_ORIGIN`, `PUBLIC_URL` to your Vercel URL



---



## Security



- Never share database passwords in chat

- Change the default admin password after first login

- Credentials stay in secure hosting settings only

- Rotate Neon password after launch (was shared during setup)

