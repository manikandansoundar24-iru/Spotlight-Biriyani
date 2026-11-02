# 🌟 SPOT LIGHT BIRIYANI — COMPLETE END-TO-END OPERATIONS & USER MANUAL

**Platform Version:** 3.4.0 (Enterprise Edition)  
**Author & Solution Architect:** Manikandan Soundar (Owner & Platform Administrator)  
**Target Audience:** Restaurant Owners, Branch Managers, Cashiers, Kitchen Head Chefs, Franchise Partners  
**Last Updated:** October 2026  

---

## EXECUTIVE SUMMARY & SYSTEM OVERVIEW

**Spot Light Biriyani & Commerce Cloud** is a specialized, high-performance Restaurant Management & Counter POS Operating System engineered specifically for authentic Chennai biriyani chains, cloud kitchens, and QSR outlets.

### Why This System Was Built:
Traditional restaurant billing machines and generic retail POS softwares suffer from three critical financial leakages:
1. **Hidden Aggregator Commission Bleed:** Swiggy and Zomato deduct between 22% and 28% in commissions, delivery cuts, and onboarding fees. Restaurant owners think they made ₹1,000, but only receive ₹720 in the bank. Spot Light POS automatically deducts commission in real time so the dashboard shows your **true cash operating profit**.
2. **Food Wastage & Over-Cooking:** Biriyani is cooked in massive daily batches. Cooking too much leads to unsold rice wastage; cooking too little leads to missed afternoon peak revenues. Our built-in **AI Prep Forecasting Engine** analyzes historical day-of-week sales patterns to tell the kitchen exactly how many plates to prepare each morning.
3. **Cashier Fraud & Pilferage:** Correcting bills, deleting items, or voiding orders without an audit trail costs restaurants thousands every month. Spot Light POS enforces cryptographic **Bill Correction Audit Logging** where every edit is recorded with the original net amount, modification timestamp, and reason badge.

---

## 1. PUBLIC WEBSITE & LEAD GENERATION WORKFLOW

### Screen 1: Public Homepage (`http://localhost:8080/` or `https://spotlight-biriyani.vercel.app/`)
* **Role:** Customer Discovery, Online Menu Browsing, WhatsApp Ordering, and B2B Software Demonstration.
* **Key Features:**
  - **Live Kitchen Status Bar:** Pulsing banner showing whether the lunch batch (12:30 PM) or dinner batch (7:00 PM) is currently active and ready.
  - **Signature Dishes Showcase:** Chicken Biriyani (₹180 Full, ₹110 Half), Mutton Biriyani (₹280 Full, ₹170 Half), and Kushka (₹110).
  - **Famous Family Biriyani Feast Buckets:** Jumbo insulated bucket combos serving 4-5 people with sides and Madurai bread halwa.
  - **South Chennai Radar Map:** Interactive Leaflet map displaying real-time branch pins across Tharamani (OMR), Adyar (LB Road), and Velachery (Bypass).
  - **Spot Light Assistant (Bottom-Right):** Floating AI bot answering FAQ questions regarding prices, timings, party orders, and 1-click WhatsApp demo booking.
* **Access Rules:** Publicly accessible by any diner or franchise prospect. **No POS buttons are visible to diners.** The header only displays a secure `[Staff Sign In]` link.

### Screen 2: Book a Demo & Tasting Modal (`/demo`)
* **Purpose:** For selling the software to other restaurant owners or booking large corporate party orders.
* **Fields Captured:**
  - Diner / Owner Name
  - Contact Phone Number (Default test line: `+91 98844 30710`)
  - Restaurant Name / Purpose (Biriyani Kitchen, QSR, Cloud Kitchen, Franchise Partner)
  - Preferred Date & Time (`<input type="datetime-local" />`)
  - Notes & Requirements
* **Action:** Automatically generates a formatted WhatsApp inquiry message and opens WhatsApp Web/Mobile with pre-filled details.

---

## 2. SECURITY, AUTHENTICATION & ROLE ACCESS CONTROL

### Screen 3: Terminal Authentication Gatekeeper (`/login`)
The entire restaurant operations suite (`/app/*`) is protected by role-based token authentication. Direct unauthenticated access is immediately blocked and redirected to `/login`.

| Role | Default Credential | Permissions & Accessible Screens |
| :--- | :--- | :--- |
| 👑 **Restaurant Owner & Admin** | Password: `spotlight2026`<br>Master PIN: `9999` | Complete access to Executive Dashboard, Consolidated Reports, Multi-Branch P&L, Inventory, Menu Pricing, and Database Backups. |
| 🧾 **Taramani Cashier** | PIN: `1001` | Dedicated Counter POS Terminal for Tharamani Flagship Kitchen. Automatically scopes sales and cash drawer to Taramani. |
| 🧾 **Adyar Cashier** | PIN: `1002` | Dedicated Counter POS Terminal for Adyar Beach Kitchen. Automatically scopes sales and cash drawer to Adyar. |
| 🧾 **Velachery Cashier** | PIN: `1003` | Dedicated Counter POS Terminal for Velachery Delivery Hub. Automatically scopes sales and cash drawer to Velachery. |
| 🧾 **General / Master Cashier** | PIN: `1234` | Allows counter POS billing across any selected branch. |
| 🔥 **Kitchen Head Chef** | PIN: `5555` | Direct access to Raw Material & Kitchen Inventory Ledger (`/app/stock`). Allows recording meat/rice consumption without touching financial reports. |
| 🛠️ **System Architect / Developer** | Master Key: `dev@spotlight2026` | Master administrative ownership held by Manikandan Soundar. Unlocks raw JSON database inspector, outlet reset, and emergency password bypass. |

### What Happens If a Restaurant Forgets Their Password?
Because you possess the Master Developer Key (`dev@spotlight2026`), the restaurant owner simply contacts you. You log in via Developer Access, open the JSON database editor, reset their password/PIN, or download a fresh backup. **You maintain 100% intellectual property ownership and control over all deployed outlets.**

---

## 3. HIGH-SPEED COUNTER POS BILLING TERMINAL (`/app/billing`)

### Core Capabilities:
1. **Sub-3-Second Order Punching:** Designed for high-volume Chennai lunch rushes. Cashiers tap dish cards on the left touch-grid; items instantly append to the cart on the right.
2. **Category Switcher & Dynamic Expansion:** Quick filter tabs for `Biriyani`, `Kushka`, `Starters` (Chicken 65, Pepper Chicken), `Chinese & Noodles`, `Fried Rice & Fast Food`, `Curries & Gravies`, `Breads` (Parotta), `Desserts` (Madurai Bread Halwa), and `Beverages`. Any custom category created under `/app/items` automatically appears as a billing tab.
3. **Service Type Toggle:**
   - `[🍽️ Dine-in]`: For guests dining inside the branch.
   - `[🥡 Takeaway / Parcel]`: Adds parcel packaging instructions and prints `SERVICE: TAKEAWAY / PARCEL` boldly on the customer receipt.
4. **Channel Origin Selector:**
   - `Counter`: 0% platform commission.
   - `Swiggy`: Deducts 28% commission and applies aggregator packaging fees.
   - `Zomato`: Deducts 24% commission.
5. **Streamlined High-Speed Action Controls:**
   - Full-Width Primary Action: **`[ 🖨️ SAVE BILL & PRINT (F2) ]`** saves the bill and triggers the thermal printer in a single tap or via keyboard shortcut **F2**.
   - Inline Quick WhatsApp Bar: Non-intrusive `📱 WhatsApp: [ 10-digit mobile ] [ 💬 Send ]` bar directly underneath the print button for cashiers whose customers request digital receipts, avoiding awkward screen shifts.
6. **Next Token Dispatcher:** Automatic sequential token numbering (`Token #101`, `Token #102`) reset daily at midnight.
7. **Dynamic Live Batch & Stock Decrement:** Every biriyani plate punched at the counter or received via Swiggy/Zomato immediately decrements on-hand capacity in real time. The branch card on the public website and the Chennai map dynamically reflect: `Lunch Batch Open · X Plates Left`.

### Bill Correction & Audit Trail Workflow:
* **The Problem:** A cashier enters 2 Chicken Biriyanis instead of 4, prints the bill, and the customer demands a correction.
* **The Solution:**
   1. Cashier opens **"Past Bills"** (`/app/billing` -> `[History]`).
   2. Search by Bill ID (e.g., `#T4G9FZ` or `T4G9FZ`, `#` prefix is automatically normalized) or Dish Name (e.g., "Chicken 65").
   3. Tap **`[✏️ Correct Bill]`**. The cart reloads with the exact historical items.
   4. Adjust quantities or discounts, and click **`[UPDATE & RE-PRINT BILL (F2)]`**.
   5. The system flags the bill with `isEdited: true`, preserves `originalNet`, records `editedAt`, recalculates food costs for P&L, and displays an amber audit badge: `✏️ Corrected (Was ₹...)`. This completely prevents cash skimming.

---

## 4. EXECUTIVE DASHBOARD & REAL MARGIN TRACKING (`/app`)

### The 4 Key Metrics Displayed:
1. **Total Net Revenue:** Total cash and online gross sales across selected date ranges (Today, 7 Days, 30 Days).
2. **True Operating Profit:** The exact cash left in the business after subtracting Food Cost (meat, rice, ghee), Aggregator Commissions, and Packaging fees.
3. **Platform Commission Bleed:** The exact amount lost to Swiggy and Zomato. Gives the owner the exact data needed to push counter direct orders.
4. **Food Cost (COGS):** The total cost of raw food consumed to produce today's sales.

### Channel Profitability Matrix:
A side-by-side comparative table demonstrating:
- **Counter Sales:** 100% revenue retention with high operating margins (~45%).
- **Swiggy Orders:** Net payout after 28% commission deduction.
- **Zomato Orders:** Net payout after 24% commission deduction.

---

## 5. INTELLIGENT PREP FORECASTING & REPORTS (`/app/reports`)

### How the Prep Algorithm Works:
Biriyani sales vary wildly by day of the week. Sundays experience 3x the volume of Tuesdays.
* The system uses a **weighted 4-week historical moving average**:
  $$\text{Target Prep} = (0.4 \times \text{Last Week}) + (0.3 \times \text{2 Weeks Ago}) + (0.2 \times \text{3 Weeks Ago}) + (0.1 \times \text{4 Weeks Ago})$$
* **Operational Timing (Night Day-Close at 10:00 PM — Never Wait Until 8:00 AM):** Biriyani requires 3 to 4 hours of slow fire cooking starting by 7:00 AM, and wholesale meat markets (Koyambedu/Pulianthope) open before dawn. Waiting until 8:00 AM is far too late to buy meat and cook lunch. Therefore, the owner/chef reviews `/app/reports` every night during Day-Close (10:00 PM – 11:00 PM Z-Report). The **"Prep Tomorrow"** column tells them exact plate counts so meat, poultry, and seeraga samba rice can be ordered for 5:00 AM delivery:
  - *Chicken Biriyani:* 142 plates
  - *Mutton Biriyani:* 68 plates
  - *Kushka:* 45 plates
* **Benefit:** Zero food spoilage, zero disappointed customers.

---

## 6. RAW MATERIAL & KITCHEN INVENTORY LEDGER (`/app/stock`)

### Inventory Management:
* **Items Tracked:** Broiler Chicken (kg), Tender Goat Mutton (kg), Seeraga Samba / Basmati Rice (kg), Pure Country Ghee (L), Sun Flower Oil (L), Full-Cream Curd (L), Carry Bags & Parcel Containers (Units).
* **Movement Types:**
  - `Purchase`: Morning Koyambedu market inward stock. Increases stock level and total asset valuation.
  - `Usage / Cooking`: Consumption into daily biriyani batches.
  - `Wastage / Return`: Spoiled or returned raw ingredients.
* **Automatic Red Reorder Alert:** When the on-hand quantity drops below the configured `reorderLevel`, the item card pulses red on the dashboard, signaling the store manager to reorder before the dinner batch begins.

---

## 7. MENU, DISH CONFIGURATION & ACTIVE TOGGLES (`/app/items`)

### Dynamic Cost Engine:
* Displays: Dish Name, Category, Counter Price, Swiggy Price, Raw Plate Cost, and Net Profit Margin %.
* **Interactive Status & Action Buttons:**
  - `[🟢 Serving]`: Dish is live and available on counter billing.
  - `[⚪ Sold Out]`: Instantly hides the dish from cashier touch grids during evening stockouts without deleting menu master records.
  - `[🗑️ Delete]`: Safely and permanently deletes test dishes (e.g. accidental entries) or discontinued menu items with a browser confirmation safeguard.
* **Category Engine & Custom Addition:**
  - Standard categories include Biriyani, Kushka, Starters, Chinese & Noodles, Fried Rice & Fast Food, Curries & Gravies, Breads, Desserts, and Beverages.
  - Selecting `+ Custom / New Category...` allows restaurant owners to type any category name (e.g. Shawarma, BBQ, Tandoori). The new category immediately auto-propagates as a navigation filter tab on the billing terminal.

---

## 8. HARDWARE, THERMAL PRINTERS & SETTINGS (`/app/settings`)

### Printing Specifications:
* **Supported Paper Sizes:** Standard 80mm Counter Desktop Printers and 58mm / 56mm Handheld Bluetooth Printers.
* **ESC/POS Driver Features:**
  - Auto-paper cut command injection.
  - Cash drawer 24V solenoid pulse kick on bill settlement.
  - Custom Tamil / English receipt header and FSSAI license printing.
  - Direct print browser bypass via USB / Bluetooth thermal printer drivers.
* **Disaster Recovery:** 1-click **Download Backup (JSON)** and **Restore Backup** buttons to guarantee zero data loss.

---

## 9. SWIGGY & ZOMATO INTEGRATION ARCHITECTURE

### How Online Orders Connect to the App:
```
[Customer on Swiggy App]
          │
          ▼
[Swiggy / Zomato Cloud Servers]
          │ (Webhook HTTP POST JSON)
          ▼
[Spot Light Webhook Gateway / UrbanPiper API Relay]
          │
          ▼
[Spot Light Billing Terminal]
   ├── 1. Injects bill with channel = "swiggy"
   ├── 2. Prints Kitchen KOT (Kitchen Order Ticket) automatically
   ├── 3. Deducts 28% aggregator commission in P&L
   └── 4. Depletes on-hand chicken and rice inventory in `/app/stock`
```

---

## 10. CLOUD DEPLOYMENT & VERCEL GLOBAL SETUP

### Live Cloud PostgreSQL Database (Neon Production):
* **Cloud Host:** Neon Serverless PostgreSQL (AWS Singapore `ap-southeast-1` — 30ms ultra-low ping latency to Chennai).
* **Project Name:** `spotlight-biriyani-prod` (`orange-cake-05189526`).
* **Live Provisioned Tables (All 8 Verified):** `Branch`, `Channel`, `DishItem`, `KitchenBatch`, `Sale`, `SaleLine`, `StockItem`, `StockMove`.
* **Browser Table Editor:** Open Neon Console -> click **"Tables"** to view and edit menu items, prices, and past bills in your web browser without SQL knowledge.

### Running Locally vs. Production Cloud:
* **Local Mode (`http://localhost:8080`):** Operates on your laptop during local development.
* **Production Cloud (`https://spotlight-biriyani.vercel.app`):**
  - Hosted globally on Vercel's edge network with free automatic SSL encryption.
  - Once deployed, managers can open the app on Android phones, iPhones, iPads, and counter tablets anywhere in the world without local Wi-Fi restrictions.
  - **Data Isolation:** Each outlet can be assigned its own tenant ID or sub-domain (e.g., `adyar.spotlightbiriyani.in`).

---

---

## 11. APPLICATION SELLING PRICING MATRIX (PETPOOJA BENCHMARK)

To sell this POS software commercially to other restaurant owners, cloud kitchens, and franchise operators, adopt the industry-standard modular SaaS subscription model (pioneered by Petpooja and Posist):

| Plan Name | Annual Subscription | Target Customer | Features Included |
| :--- | :--- | :--- | :--- |
| **Core Counter Plan** | Rs 7,999 / year / terminal | Small Biriyani Stalls, Takeaway Kiosks, QSRs | Counter billing, 80mm ESC/POS thermal printing, daily token numbers, cash change calculator, WhatsApp deep-link receipts, offline persistence, bill correction audit logging. |
| **Pro Recipe & Kitchen Plan** | Rs 14,999 / year / outlet | Cloud Kitchens, Biriyani Outlets (100-300 plates/day) | Everything in Core + Raw material inventory ledger (/app/stock), recipe COGS margin engine, low-stock red pulse alerts, daily kitchen deg portion tracker, AI prep forecasting (/app/reports). |
| **Multi-Outlet Franchise Cloud** | Rs 24,999 / year / brand | Biriyani Chains (3-10 Outlets), Central Commissary Kitchens | Everything in Pro + Multi-branch radar map, central menu management, cross-outlet sales aggregation, role-based branch PIN security, and developer master backup controls. |

### High-Margin Add-On Modules:
* **Swiggy & Zomato Live Sync Relay (UrbanPiper / Direct Webhook):** +Rs 4,000 / year / outlet.
* **Meta WhatsApp Cloud API (Automated PDF Receipts & Broadcasts):** +Rs 1,500 / year + Meta utility message fees (Rs 0.40-Rs 0.75/msg).
* **Kitchen Display System (KDS) Screen for Chefs:** +Rs 3,500 / year / screen.
* **Turnkey Hardware Bundle (One-time):** Rs 28,000 (15-inch Touch Terminal + 80mm Auto-Cut ESC/POS Thermal Printer + Heavy-Duty Cash Drawer).

---

## 12. TECHNICAL ARCHITECTURE & FREQUENTLY ASKED QUESTIONS

### Q1: Why Are We Coding in TypeScript / Node.js Instead of Java?
* **Legacy Java (Spring Boot):** Requires heavy JVM memory (1-2 GB RAM just to idle), slow compile cycles, and bulky deployment containers.
* **Modern TypeScript / Node.js:** The global standard powering modern POS platforms (Toast POS, Square Register, Shopify). TypeScript provides end-to-end type safety, runs ultra-fast in browser runtimes and serverless edge functions, consumes < 100 MB of RAM, and shares data structures directly between the POS frontend and backend without translation bugs.

### Q2: Is PostgreSQL Open Source? Can We Integrate It? Does It Cost Anything?
* **Is it Open Source?** Yes! PostgreSQL is 100% free and open source under the liberal PostgreSQL License. There are zero licensing fees forever.
* **Cost:** Rs 0. You can host it on your own server or use managed cloud PostgreSQL providers like **Supabase** or **Neon**, which offer generous perpetual free tiers (500 MB database storage, millions of queries free forever).
* **Complexity:** Extremely low. Using **Prisma ORM** or **Drizzle ORM**, database tables (Bill, SaleLine, InventoryItem, Branch) are mapped automatically to SQL tables with automated schema migrations. The application can seamlessly synchronize between local offline storage and PostgreSQL cloud backups.

### Q3: Can Vercel Handle High Traffic? Why Do People Buy Domains?
* **The High-Load Myth:** Vercel is built on global AWS Edge infrastructure with Anycast routing. It currently powers **OpenAI (ChatGPT)**, **Notion**, and **The Washington Post**, serving billions of requests per minute. It handles massive traffic spikes effortlessly.
* **Hosting vs Domain:**
  - **Vercel = The Engine / Server Compute:** Hosts and runs the website code globally.
  - **Domain (e.g., spotlightbiriyani.com) = The Name Tag:** A custom web address registered for Rs 499-Rs 899 / year on GoDaddy, Namecheap, or Cloudflare.
  - **How They Work Together:** You buy your custom domain, point its DNS CNAME records to Vercel, and Vercel automatically manages free SSL certificates and serves enterprise-grade traffic under your brand name!

### Q4: WhatsApp Integration: Do We Need a Dedicated Phone Number?
* **Option A: WhatsApp Web Deep-Link (Currently Active - 100% Free):**
  - Uses https://wa.me/91XXXXXXXXXX?text=...
  - **No dedicated phone number required.** The cashier uses the restaurant's existing phone or personal WhatsApp Web logged into the POS computer.
  - Costs Rs 0, requires no Meta approvals, and works instantly.
* **Option B: Meta WhatsApp Cloud API (Automated Server-to-Phone PDF Delivery):**
  - Sends bills silently in the background directly from the cloud server.
  - **Requires a dedicated 10-digit mobile number or landline** that is NOT registered on the consumer WhatsApp app.
  - Involves Meta Business verification and per-message utility charges (~Rs 0.40-Rs 0.75 per sent bill).

### Q5: How Do Swiggy and Zomato Orders Flow Into the POS?
1. Diner places an order on the Swiggy or Zomato app.
2. Swiggy/Zomato servers dispatch an HTTP POST JSON payload to our POS webhook endpoint (/api/webhooks/swiggy).
3. The POS terminal instantly plays an incoming order chime, appends the order with channel swiggy, auto-prints the Kitchen KOT on the 80mm thermal printer, and updates the daily P&L deducting the 28% commission.
4. The on-hand Biriyani Deg capacity immediately decrements so the counter cashier knows remaining stock.

### Q6: Live Kitchen Deg Stock Mechanics (e.g. 120 Plates Cooked Today):
* The chef inputs the morning batch size (e.g. 120 plates).
* As plates are sold via Counter, Swiggy, or Zomato, the POS automatically calculates:
  Plates Remaining = Batch Capacity (120) - Total Plates Sold Today
* A dynamic progress bar and color-coded badge display on the terminal:
  - **Green (> 30 plates left):** Healthy stock.
  - **Amber (10-30 plates left):** Low stock warning.
  - **Red Pulse (< 10 plates left):** Critical batch depletion alert.
  - **Sold Out:** Prevents overselling and prompts chef to start the evening batch.

### Q7: Keycloak, Docker & Microservices — Are They Needed For This Application?
* **Why Keycloak is unnecessary:**
  - Keycloak is an enterprise IAM / OAuth2 server written in Java (WildFly/Quarkus) designed for conglomerates with thousands of corporate employees.
  - It requires 1GB - 2GB of dedicated RAM just to boot, requires Java runtime dependencies, and costs ₹3,000 - ₹5,000/month in cloud server RAM.
  - For a high-speed restaurant counter where a cashier must enter a 4-digit PIN in under 1 second, Keycloak introduces unacceptable network latency and server bloat.
  - Spot Light POS uses lightweight, instant cryptographic PIN/JWT authentication with Cloud PostgreSQL and local cache fallback, giving sub-50ms login speeds at ₹0 hosting cost.
* **Why Docker is not needed:**
  - Docker is useful when running multi-container backend microservices on AWS EC2 or Linux VPS.
  - Spot Light POS is built on **Serverless Edge Architecture (Vercel)** + **Cloud Serverless PostgreSQL (Neon / Supabase)**.
  - Serverless eliminates containers completely: pages and APIs scale from 0 to 10,000 requests per second automatically with zero server maintenance, zero memory footprint on cash counter laptops, and instant global edge CDN caching.

### Q8: How to Inspect & Check PostgreSQL Data in Real Time:
* **Option A: Web Dashboard (Zero Installation in Google Chrome):**
  - **Neon (neon.tech):** Log in to the Neon console, click **"Tables"** or **"SQL Editor"** on the left menu. You can browse, search, and edit records in `Branch`, `DishItem`, `SaleOrder`, and `InventoryStock` directly in your browser just like Google Sheets!
  - **Supabase (supabase.com):** Log in to Supabase, click **"Table Editor"**. It gives a visual spreadsheet view where you can see every order, plate count, and stock movement in real time.
* **Option B: Local Visual Spreadsheet (Prisma Studio):**
  - Open terminal and run:
    ```bash
    npx prisma studio
    ```
  - It opens an interactive visual GUI at `http://localhost:5555` where you can view, filter, sort, and edit all your PostgreSQL tables, rows, and relationships visually with zero SQL knowledge.

### Q9: Deg Batch Granularity: Why Deg Applies Only to Biriyani & How We Differentiate:
* **The Traditional Restaurant Reality:**
  - In authentic biriyani kitchens, food cooked in a brass/copper *Deg* under charcoal *dum* is strictly:
    1. **Chicken Biriyani Deg** (~70-90 plates per deg)
    2. **Mutton Biriyani Deg** (~40-50 plates per deg)
    3. **Kushka** (scooped directly from the fragrant spiced dum rice of the biriyani deg, without the meat piece)
    4. **Egg Biriyani** (dum rice served with boiled eggs)
  - Items like Starters (Chicken 65, Pepper Chicken), Chinese noodles, Fried rice, Parottas, Desserts, and Beverages are NOT cooked in a deg—they are prepared on the tawa/wok or served from cold storage.
* **How Spot Light POS Differentiates & Tracks Portions:**
  - The live batch monitor computes dish-level breakdown:
    - **Chicken Biriyani:** Shows remaining Chicken portions in Deg.
    - **Mutton Biriyani:** Shows remaining Mutton portions in Deg.
    - **Kushka Portions:** Tracks dum rice depletion without decrementing meat pieces.
  - Non-deg items (starters, Chinese, drinks) show standard kitchen inventory or made-to-order status.

### Q10: Real-Time Cross-Tab & Cross-Device Reactive Synchronization:
* When a sale of 100 biriyanis is punched in the Billing Terminal in Tab 1, all other open tabs (e.g. Homepage South Chennai Radar Map in Tab 2, Executive Dashboard in Tab 3) update their plate counters and charts **instantly in real time (sub-2ms)** with ZERO manual browser refresh (`F5`).
* This is achieved through a multi-tier reactive message bus combining browser-native `BroadcastChannel("spotlight_pos_cross_tab_bus")` and storage event listeners in `pos-store.ts`.

### Q11: Complete Export, Reports, Formulas & Sharing Ecosystem:
* **Excel (.CSV / .XLSX compatible):** 1-click structured CSV export in `/app/reports` detailing Date, Invoice ID, Channel, Gross, Discount, Net Revenue, COGS, Platform Commission, and Net Operating Profit.
* **PDF (.PDF):**
  - Instant Day-End Z-Report print with FSSAI, GSTIN, payment splits, and tax summary via the **"Download / Print PDF"** button.
  - 80mm & 58mm ESC/POS Thermal Bill receipts for kitchen and customers.
  - Master 8-screen Restaurant Operations Manual PDF (`SPOTLIGHT_FULL_OPERATIONS_MANUAL.pdf`).
* **Live Formulas & Costing:**
  - Embedded P&L formulas visible directly under the **"View Embedded Formulas & Math"** toggle in `/app/reports`.
  - Recipe COGS calculation (`Food Cost % = (Ingredient Cost / Price) * 100`).
  - True operating profit margin (`Margin = Price - COGS - Aggregator Cut`).
  - Cash tendered change calculator (`Change Due = Tendered - Net Payable`).
* **Instant Digital Sharing:**
  - 1-click WhatsApp bill receipt dispatch directly to customer mobile number with automated itemized text, tax summary, and kitchen pickup token.

### Q12: Master Field Guide & Operations Clarifications:
* **1. Where to find PDF Export & Formulas:**
  - Navigate to **Reports & Forecast** (`/app/reports`).
  - Next to the "Excel / CSV" button, click **"Download / Print PDF"** to open a ready-to-print executive Day-End Z-Report / P&L statement with full FSSAI, GSTIN, and branch metrics.
  - Click **"View Embedded Formulas & Math"** right above the table to view the exact formulas for Revenue, COGS, Commission, Net Profit, Margin %, and Tomorrow's Prep forecast.
  - For full spreadsheet editing, downloading the CSV opens directly in Microsoft Excel or Google Sheets, where you can write `=SUM()`, `=AVERAGE()`, add pivot tables, and share via email/WhatsApp.
* **2. Neon & Supabase Credentials:**
  - Neon (`neon.tech`) and Supabase (`supabase.com`) are external serverless cloud database providers.
  - There is NO pre-configured username/password from us. You simply sign up on their website using your own Google account or personal email for free.
  - Once signed up, click "Create Project" (select AWS Mumbai `ap-south-1` region) to obtain your unique `DATABASE_URL`. Paste this URL into your `.env` file. You can then view and edit all live tables directly in Chrome!
* **3. Prisma Studio (`npx prisma studio`):**
  - `localhost:5555` showed "refused to connect" because Prisma Studio is a background development command that must be started in a terminal first (`npx prisma studio`).
  - With Neon Cloud Database, you don't even need to run Prisma Studio on your laptop—you can view and edit records in Neon's built-in web table editor in any browser.
* **4. Deg Batch Math Reconciliation:**
  - Kitchen batch capacity is now split cleanly between Chicken Deg (e.g. 130 plates) and Mutton Deg (e.g. 70 plates) in the batch capacity modal.
  - Individual dish remaining counts are strictly capped and reconciled by total deg plates remaining (`platesLeft = chickenLeft + muttonLeft`), completely eliminating any mathematical mismatch.
* **5. Single-Digit Quantity Typing:**
  - Dish cards now keep the quantity input box mounted even if you backspace down to 0 while typing.
  - Clicking on the quantity box automatically highlights the number via `onFocus` auto-select, allowing cashiers to type `2`–`9` directly in one single keypress without backspacing.
* **6. Menu & Costs <-> Counter POS Sold Out Sync:**
  - When an item is toggled from "Serving" to "Sold Out" in Menu & Costs (`/app/items`), it immediately shows as "Sold Out" in Counter POS (`/app/billing`) and is disabled from billing.
  - When deg inventory runs out, Counter POS displays "Batch Sold Out" to prevent overselling.
* **7. Multi-Branch Role & PIN Reference:**
  - **Owner (Central Admin):** Password `spotlight2026` or PIN `9999` (has master access across all 3 branches: Taramani, Adyar, Velachery).
  - **Taramani Cashier:** PIN `1001` (locks terminal to Taramani branch).
  - **Adyar Cashier:** PIN `1002` (locks terminal to Adyar branch).
  - **Velachery Cashier:** PIN `1003` (locks terminal to Velachery branch).
  - **General Cashier:** PIN `1234`.
  - **Kitchen Chef:** PIN `5555`.
* **8. Past Bills Branch Badging:**
  - Every order in Past Bills displays a clear branch badge (`📍 Taramani`, `📍 Adyar`, `📍 Velachery`), making multi-outlet auditing and reprints instantaneous.

---

### Q13: Automation Architecture, AWS Mumbai Rationale & Deg Batch Controls

* **1. What is 100% AUTOMATIC vs What is MANUAL in Spot Light POS?**
  * **100% Automated by System:**
    * **Real-Time Deg Batch Decrementation:** Every time a Chicken or Mutton Biriyani/Kushka is billed (Counter, Swiggy, or Zomato), remaining batch plates immediately decrement in real time.
    * **Instant Profit & Margin Computation:** System dynamically calculates Net Total, COGS (recipe food cost), Aggregator Commission (22% Swiggy, 24% Zomato), Packaging deductions (₹12), and Net Operating Profit for every single bill.
    * **Sequential Daily Token Generator:** Automatically resets and generates `#001`, `#002`, `#003` sequentially per branch per calendar day.
    * **Cross-Tab & Multi-Terminal Synchronization:** If an order is punched on one terminal, other counter terminals and kitchen screens instantly receive live stock updates via BroadcastChannel and reactive store events.
    * **GST & Tax Compliance Calculations:** Automated 5% restaurant GST calculations, FSSAI badge printing, and invoice numbering.
    * **Aggregator Pricing Auto-Switch:** Switching channels from Counter to Swiggy/Zomato automatically switches dish prices to aggregator tier prices and applies packaging charges without cashier manual typing.
    * **Sold-Out Safety Interlocks:** When the batch hits 0, deg dishes automatically enter "Batch Sold Out" mode and disable further addition to cart, preventing over-selling.
    * **Tomorrow's Kitchen Prep Forecast:** Automatically analyzes past 4 weeks' matching day sales patterns to forecast exactly how many plates of Basmati Rice, Chicken, and Mutton should be cooked tomorrow.
    * **End-of-Day Z-Report & Audit Ledger:** System auto-summarizes total orders, cash collected, online payments, platform deductions, and net margins for day-end settlement.
  * **What is Manual (Human Input Required):**
    * **Dish Selection / Order Punching:** Cashier taps items on the left touch rail or menu cards to add them to the cart.
    * **Accepting Payment & Tender Amount:** Cashier receives physical currency notes and enters cash tendered (e.g. ₹500 note) to calculate change due.
    * **Morning Deg Batch Cook Entry:** When the chef finishes cooking the morning dum deg, the chef or owner taps `[ ✏️ Edit Deg Capacity ]` to enter how many plates were actually cooked today (e.g., Chicken: 130, Mutton: 70).
    * **Ingredient Cost & Menu Price Changes:** If raw meat/vegetable market rates fluctuate, the owner manually updates base food costs in `/app/items` or `/app/stock`.
    * **Physical Paper Bill Delivery:** Tearing off the thermal receipt from the printer and handing it with food/token to the diner.

* **2. Why AWS Mumbai (`ap-south-1`) Region?**
  * **Ultra-Low Latency (15–20ms vs 280ms):** A server in US East (N. Virginia) takes ~280ms round-trip to Chennai. AWS Mumbai takes only 15–20ms. In high-speed lunchtime billing where 30 customers are queued, 20ms feels instantaneous with zero cashier lag.
  * **Indian Data Localization & Legal Compliance:** Under RBI, GST, and Indian corporate compliance guidelines, financial transactions, GST invoices, and customer phone records of registered Indian businesses are strongly mandated to be stored within Indian national borders.
  * **Direct ISP Peering:** Major Indian broadband and mobile networks (Jio, Airtel, ACT Fibernet) have direct fiber trunk routes to Mumbai Internet Exchanges (NIXI / Mumbai IX), guaranteeing uptime even during undersea cable disturbances.
  * **INR (₹) Billing with GST Input Credit:** Indian region cloud services provide GST invoices in Indian Rupees, allowing 18% GST input tax credit for your business entity.

* **3. How is Today's Deg Batch Defined (130 Chicken + 70 Mutton = 200 Plates)?**
  * **100% Dynamic, Never Hardcoded:** The daily cooked batch capacity is stored in `db.settings.batchSplit` and `db.settings.dailyBatchCapacity`.
  * **Single, Clean 1-Tap Entry for Chef / Owner:**
    * In Counter POS (`/app/billing`), right above the dish cards in the Deg Batch banner, there is ONE prominent button: **`[ ✏️ Edit Deg Capacity ]`** (the duplicate button inside the stat box has been removed to eliminate confusion).
    * Tapping it opens the **"TODAY'S DEG CAPACITY"** dialog.
    * Enter Chicken Deg (e.g. `130`), Mutton Deg (e.g. `70`), or click a quick preset (`100`, `120`, `160`, `200`).
    * Click **"Save Batch Capacity"**—the system updates immediately across all screens!

* **4. Critical Billing Persistence & UI Stability Fix:**
  * **The Root Cause:** In `pos-store.ts`, `getDB()` was redundantly calling `persist()` on cache reads, triggering cross-tab ping-pong loops that could revert in-memory mutations. In addition, `lg:grid-cols-[1.5fr_1fr]` allowed elements to cause horizontal page scrolling (`window.scrollX`), which shifted the left header and dishes offscreen when selecting branches.
  * **The Fix:**
    1. Ensured `newSale` is assigned a fresh ISO timestamp (`date: new Date().toISOString()`), guaranteed branch ID (`branchId: activeBranch`), and unique UUID at checkout.
    2. Locked layout with stable grid columns (`lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_380px]`) and enforced `overflow-x-hidden` on main wrappers, completely eliminating horizontal scrolling and layout shifts.
    3. Derived `todayToken` directly from `todaySales.length + 1`, ensuring token sequence and history count are strictly synchronized.

* **5. Login Page Aesthetic Redesign (Clean Watermarks & Brand Badges):**
  * **Removed Giant Blocked Center Circle:** The heavy dark bullseye centered behind the card has been completely removed.
  * **Delicate Corner Watermarks:** Added elegant, faint establishment seals in the top-left and bottom-right page margins (`opacity-[0.07]`), completely outside the login card area so they are never blocked and never dark.
  * **Card Brand Insignia:** Placed an authentic Spot Light Biriyani flame badge directly inside the login card header for a proud, luxurious look.

* **6. "ITEM-WISE PERFORMANCE & KITCHEN PREP" Explained Simply:**
  * **Item:** Dish name (e.g. Chicken Biriyani Half, Mutton Biriyani Full, Kushka).
  * **Plates:** Total plates sold across Counter, Swiggy, and Zomato.
  * **Revenue:** Total cash collected from customers for this item.
  * **Profit:** Pure net profit left after deducting meat/rice food cost (COGS), platform commission (23–28%), and packaging charges.
  * **Profit / Plate:** Exactly how much profit the restaurant earns on every single plate (e.g. ₹52 profit per ₹110 Half Biriyani).
  * **Prep Tomorrow (The Chef's Secret Weapon):** An automated weighted forecast (40% last week + 30% 2 weeks ago + 20% 3 weeks ago + 10% 4 weeks ago) that tells the chef exactly how many plates to cook tomorrow, preventing costly food wastage while avoiding selling out too early.

---

* **7. Deg Batch Inventory Reconciliation (The 6-Plate Exact Breakdown):**
  * **Where Did the 6th Plate Go?** When an order contains Chicken Biriyani (Full), Chicken Biriyani (Half), Chicken 65 Biriyani, Mutton Biriyani (Full), Mutton Biriyani (Half), and Egg Biriyani, total sold plates equals 6.
  * **The Display Fix:** The Deg Breakdown bar now explicitly presents all 4 kitchen categories:
    🍗 Chicken Biriyani: 3 sold · X left | 🍖 Mutton Biriyani: 2 sold · Y left | 🥚 Egg Biriyani: 1 sold | 🍚 Kushka Portions: 0 sold.
  * **Exact Math Verification:** 3 Chicken + 2 Mutton + 1 Egg + 0 Kushka = 6 plates sold. 100% of punched dishes are fully visible and matched with the SOLD TODAY: 6 badge.

* **8. Terminal Header Elevation & Parallel Cart Alignment:**
  * **No Gap Above Cart:** Extracted the terminal title and quick actions (COUNTER POS, Past Bills, + Custom Dish, Next Token) into a full-width header bar spanning across the top.
  * **Perfect Parallel Baseline:** Directly below the top bar, both the Kitchen Deg Batch card (left column) and the Billing Cart card (right column) start at the exact same vertical pixel. This completely eliminates blank whitespace above the [🍽️ Dine-in] / [🥡 Takeaway] and channel toggle buttons.
  * **Restored Side Gutters (Vertical Breathing Room):** Standardized container width across all pages (/app, /app/billing, /app/reports, /app/stock, /app/items) to max-w-6xl with generous padding (px-4 sm:px-6 lg:px-8). Restores the elegant framed dashboard appearance on laptops and POS displays instead of edge-to-edge stretching.

---

* **9. Intelligent Prep Tomorrow Forecasting & New-Launch Fallback:**
  * **How the Prep Data Feeds:** In `/app/reports`, the **Prep Tomorrow** column calculates the exact quantity of each dish the kitchen should prepare for tomorrow's lunch and dinner services.
  * **4-Week Weighted Moving Average (Mature Outlets):** For established branches, it looks at the last 4 same weekdays ($40\% W_1 + 30\% W_2 + 20\% W_3 + 10\% W_4$). For example, a Sunday prep forecast is calculated from the last 4 Sundays because weekend biriyani demand is 2x to 3x higher than a Tuesday.
  * **New Restaurant Smart Fallback (Why it Showed "0" Previously):** In a freshly opened outlet or test environment, there are no sales recorded 7, 14, 21, or 28 days ago. The system now uses an intelligent run-rate fallback: it calculates the average daily sales of that dish across recorded active days and applies a $+20\%$ weekend buffer (Friday–Sunday) or $+5\%$ weekday buffer. A restaurant that sold 8 Chicken Biriyanis today will now see a sensible recommendation (e.g. 8–10 plates) instead of an unhelpful 0 plates!
  * **Why Checking at Night (Day-Close ~10:00 PM) is Vital (Never Wait Until 8:00 AM):** Checking prep at 8:00 AM is far too late for a biriyani kitchen. Chennai wholesale meat markets (Koyambedu / Pulianthope) open at 4:00 AM, and authentic Dum Biriyani requires 3 to 4 hours of slow dum cooking starting by 7:30 AM to be hot and fragrant for 12:00 PM lunch. Therefore, the owner and head chef check the **Prep Tomorrow** column every night during Day-Close (10:00 PM – 11:00 PM Z-Report review), immediately place supplier orders for meat, poultry, seeraga samba rice, and onions for 5:00 AM delivery, ensuring 100% on-time preparation without last-minute panic or costly waste.

* **10. Live Kitchen Deg Stockout vs. Master "Menu & Costs" Status:**
  * **The User's Question:** If all 160 plates in the Deg are sold out, does it change to "Sold Out" in MENU & COSTS (`/app/items`)?
  * **System Distinction:**
    1. **Live Deg Batch Stockout (Daily Dynamic Inventory):** When the 160 plates cooked for today are sold out ($platesLeft = 0$), the POS billing screen immediately marks all biriyani cards as **"SOLD OUT"** in red and blocks further punching. This is *automatic daily inventory exhaustion*.
    2. **Master Menu Catalog (`/app/items`):** The `[🟢 Serving]` vs `[⚪ Sold Out]` button in MENU & COSTS is the *permanent catalog toggle* (e.g., when a supplier fails to deliver mutton, or a seasonal dish is taken off menu for months).
    3. **Why They Are Decoupled:** If the daily 160-plate stockout flipped the master menu toggle to "Sold Out", the owner would have to manually open MENU & COSTS every single morning and re-enable 15 different dishes one by one! Instead, tomorrow morning's fresh cooked Deg capacity (e.g. 160 plates) automatically resets live ordering, saving the owner manual effort.

* **11. Touch-Optimized Billing Header & Live Terminal Controls:**
  * **Large High-Touch Buttons:** [Past Bills] and [+ Custom / Open Dish] now have expanded touch padding (px-5 py-2.5), bold font styling, and 18px icons, engineered specifically for speed on counter touchscreens.
  * **Live Register & Keyboard Shortcut Helpers:** Bridges the header gap on wide monitors by displaying a pulsing Live Counter · {Branch Name} status pill and quick keyboard shortcuts ([F2] Save & Print · [Esc] Clear).
  * **Prominent Next Token Badge:** Positioned directly above the billing cart with double-border amber/primary gradient styling (Next Token #X) for effortless visual tracking by cashiers and expeditors.
  * **Optimal 7XL Margins:** Upgraded container layout to max-w-7xl with px-4 sm:px-6 lg:px-8, allowing dish cards, tables, and reports to occupy full comfortable width.

* **12. Modern Ambient Culinary Login Screen (Zero Watermark Clutter):**
  * **Why Old Watermarks Looked Clumsy:** Circular clip-art watermarks or dark seals placed behind login boxes get 70% covered by the card, creating awkward severed shapes and visual clutter.
  * **Modern SaaS Ambient Lighting:** Replaced with soft, diffuse culinary radial glows (mber-500/10 and primary/8) with 64px Gaussian blur behind the card, paired with an executive gradient top-accent bar (h-1 amber-to-primary) and crisp terminal gateway badges.
  * **Result:** Looks like modern high-end software (Stripe, Linear, Toast) while keeping 100% focus on secure, fast terminal authentication.
  * **Header Gap Elimination:** Grouped terminal controls (`[Past Bills]`, `[+ Custom / Open Dish]`, and `[Next Token #X]`) directly beside the `COUNTER POS` title with a subtle divider line, completely eliminating the wide empty gap across wide screens.
  * **Optimal 7XL Margins:** Upgraded container layout to `max-w-7xl` with `px-4 sm:px-6 lg:px-8`. Dishes, tables, and reports now occupy more screen width comfortably while preserving clean breathing margins from the window edges.

* **12. 100% Watermark-Free Login Screen:**
  * **Clean & Modern Gateway:** Completely removed all background watermark circles and seals from `/login`. The login portal is now pristine, crisp, and distraction-free.

---

*(End of Operations Manual - Prepared for Spot Light Biriyani & Commerce Cloud)*

