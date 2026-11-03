# Customising for a new client (resell kit)

Rebranding this for another restaurant takes about 30–60 minutes.

## 1. Name, menu and branches
`src/lib/pos-store.ts` → the `seed()` function:
- `branches` — names, addresses, phones
- `items` — dish name, category, counter price, online price, plate cost
- `stock` — raw materials, units, reorder levels, cost per unit
- `channels` — commission % and packing cost
- `settings.businessName`

Existing installs keep their old data, so also change it in the UI (Settings / Menu & Costs)
or ask the client to press *Reset to demo data* once after the update.

## 2. Colours and fonts
`src/styles.css` only. Change `--primary`, `--accent`, `--background`, `--card` (all `oklch`)
and the `--font-display` / `--font-sans` families (also update the Google Fonts `<link>`
in `src/routes/__root.tsx`). Never hardcode colours in components.

## 3. Photos
Replace `src/assets/hero-biriyani.jpg`, `mutton.jpg`, `kushka.jpg` with the client's
own shots (same file names = zero code change). Keep them under ~400 KB.

## 4. Website copy and SEO
Each route file has a `head()` block — update title, description, og:title, og:description
per page. Text lives in the same file.

## 5. Add a category
`CATEGORIES` in `src/lib/pos-store.ts` + the `Category` union type. Menu page and
Billing tabs pick it up automatically.

## 6. Common paid add-ons (quote separately)
| Add-on | What it needs | Suggested price (INR) |
| --- | --- | --- |
| Cloud sync + logins for 3 branches | Lovable Cloud / Supabase, auth, RLS | 25,000–60,000 one-time + monthly |
| Recipe (BOM) auto stock deduction | recipe table per item; deduct on each bill | 15,000–25,000 |
| Fixed cost & real net profit module | rent/salary/electricity entry + monthly P&L | 10,000–18,000 |
| Staff attendance & shift wise sales | new tables + reports | 15,000+ |
| WhatsApp daily summary to owner | WhatsApp Business API / Twilio | 12,000 + usage |
| Customer loyalty by phone number | customer table, points, redemption | 20,000+ |
| Swiggy/Zomato order auto-import | partner API approval required | project quote |
| GST-compliant invoice + GSTR export | GSTIN fields, HSN, tax split | 15,000–25,000 |
