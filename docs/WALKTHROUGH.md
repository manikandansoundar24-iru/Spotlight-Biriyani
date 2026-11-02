# Spotlight Biriyani & Commerce Cloud — Screen-by-Screen Walkthrough

## 1. Public Experience & Customer Touchpoints

| Route | Feature & Purpose |
| --- | --- |
| `/` **Home** | Royal White flagship storefront featuring slow-dum brass handi countdown, 4.9★ reviews, signature biriyanis, party buckets, Chennai sides, and 1-tap WhatsApp quick order. |
| `/menu` **Live Menu** | Real-time synchronized menu grouped by category (Dum Biriyanis, Starters, Breads, Halwa). Automatically updates whenever prices or dish availability are edited in the management app. |
| `/branches` **Chennai Radar** | Authentic South Chennai radar map with coastline and live GPS hub pins (Tharamani OMR Flagship, Adyar Beach Kitchen, Velachery Hub) showing batch stock levels and 1-tap Google Maps directions. |
| `/platform` **Commerce Cloud** | Square-inspired multi-vertical platform hub showcasing four specialized industry engines: Spotlight Biriyani & QSR, StyleStudio (Salon & Spa), FreshCut (Meat & Seafood), and TradePulse (Wholesale FMCG). |
| Header **Scan QR** | Interactive SVG QR Code modal allowing any mobile phone camera to instantly scan and launch the app or customer menu on any mobile device worldwide. |
| Floating **Spotlight Assistant** | AI-driven floating sales assistant (inspired by Square Assistant) guiding prospective clients through service models, business types, and instant WhatsApp demo scheduling. |

---

## 2. Management & POS Application (`/app`)

### 2.1 Billing Terminal (`/app/billing`)
1. **Dynamic Sales Channels:** Switch between Counter, Swiggy, and Zomato. Menu prices automatically adjust to compensate for 28% delivery commissions.
2. **Instant Bill Calculation:** Subtotal, customized discounts, SGST/CGST tax calculations, and net payable amount.
3. **Multi-Payment Modes:** Cash, UPI Dynamic QR, and Card.
4. **Thermal Printer Integration:** 1-tap instant print tailored for 80mm desktop and 58mm portable thermal receipt engines.
5. **WhatsApp Digital Invoice Dispatcher:** Send formatted digital receipt cards directly to the customer's WhatsApp phone number.

### 2.2 Raw Material & Dum Stock Ledger (`/app/stock`)
1. **On-Hand Raw Material Inventory:** Real-time tracking of Basmati rice, chicken, mutton, spices, oil, curd, and packaging materials.
2. **Edit Material Details:** Modify raw material names, units, stock quantities, reorder thresholds, and unit costs anytime.
3. **Remove / Delete Material:** One-click removal of mistakes or obsolete inventory items (e.g. curd, carry bags, garam masala).
4. **Reorder Alert System:** Badges automatically turn **RED ("⚠️ Reorder")** when `Current Qty <= Reorder Level` to warn kitchen staff before ingredients run out. Plentiful stock displays **GREEN ("✓ OK")**.
5. **Movement Logger:** Record daily raw material purchases, kitchen cooking usage, and kitchen wastage.

### 2.3 Menu & Plate Cost Engineering (`/app/items`)
- Manage counter prices, delivery platform prices, and True Food Cost (COGS) per dish.
- Live margin and gross profit percentage recalculation per dish.

### 2.4 Reports, Analytics & Daily Forecast (`/app/reports`)
- Comprehensive breakdown of gross sales, customer discounts, raw material food costs, delivery aggregator commissions, and net retained profit.
- Tomorrow's kitchen prep forecasting based on weighted moving averages.
- Accountant-ready CSV data export.

### 2.5 Hardware & System Settings (`/app/settings`)
- Brand details, FSSAI license headers, and tax registration numbers.
- **Thermal Printer Engine:** Configure 80mm vs 58mm/56mm paper widths, auto-guillotine paper cutting, and solenoid cash drawer kick pulses.
- System backups: 1-click JSON backup download and database restoration.
