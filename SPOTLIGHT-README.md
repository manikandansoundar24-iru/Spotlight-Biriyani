# Spot Light Biriyani — Website + Owner App (Spot Light Manager)

Everything the shop needs in one codebase:

| Part | URL | Who uses it |
| --- | --- | --- |
| Public website | `/`, `/menu`, `/branches`, `/contact` | Customers, Google search |
| Owner/POS app | `/app` and sub-pages | Owner, cashier, branch manager |

## What the app does

- **Billing** — tap-to-bill counter screen, auto price switch for Swiggy/Zomato, discount, payment mode, 80mm thermal receipt printing.
- **True profit per bill** — `customer pays − food cost − platform commission − packing = profit`. Shown *before* you save the bill.
- **Item-wise counts** — exactly how many chicken biriyani / mutton biriyani / kushka plates sold, per day, per branch, per channel.
- **Prep forecast** — suggested plates to cook tomorrow, from a weighted average of the last 4 same weekdays.
- **Stock** — raw material on hand, reorder alerts, purchase / used / wastage log, live stock value.
- **Menu & costs** — edit counter price, online price and plate cost; margin recalculates instantly.
- **Multi-branch** — Tharamani, Adyar, Velachery (add more in Settings), filter every report by branch.
- **Channel P&L** — see whether Swiggy or Zomato is actually making money after commission.
- **Backup / restore** — one-click JSON backup, restore on any device, reset to demo data.

## Docs index

1. [`docs/SETUP.md`](docs/SETUP.md) — install and run locally, deploy, install on a phone/tablet.
2. [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md) — screen-by-screen tour and the daily routine for staff.
3. [`docs/TESTING.md`](docs/TESTING.md) — test checklist to run before handover.
4. [`docs/CUSTOMISE.md`](docs/CUSTOMISE.md) — what to change for a new client, and where.
5. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the code and data layer work, how to move to a cloud database.
6. [`docs/BUSINESS-PLAYBOOK.md`](docs/BUSINESS-PLAYBOOK.md) — pricing, subscription plans, sales script, revenue maths.

## Important: where data is stored

Right now **all data lives in the browser** (`localStorage`, key `slb.pos.v1`). No server, no accounts, no monthly hosting bill, works offline at the counter.

Consequences to explain to the owner:
- Each device has its own data. Two counters = two datasets until you upgrade to cloud.
- Clearing browser data or using Incognito wipes it → take weekly backups (Settings → Download backup).
- When he wants all 3 branches live in one place with logins, that's the paid **Cloud upgrade** (see `docs/ARCHITECTURE.md` → "Moving to Cloud"). That upgrade is your first natural upsell.

## Tech

TanStack Start (React 19) + Vite 7 + Tailwind v4 + Recharts + lucide icons. All colours/fonts are design tokens in `src/styles.css`.
