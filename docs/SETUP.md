# Setup & Deployment Guide — A to Z

## 1. What You Need

- Node.js 20+ (or Bun 1.1+)
- Any modern web browser (Chrome, Edge, Safari, Firefox)
- Nothing else: Zero external databases required, zero API keys required. IndexedDB offline storage handles local caching.

---

## 2. Run It Locally on Your Laptop

```bash
cd spotlight-biriyani
npm install          # or: bun install
npm run dev          # or: bun run dev
```

Open `http://localhost:8080` in your browser:
- Public Website & Customer Menu: `http://localhost:8080/`
- POS Billing Terminal: `http://localhost:8080/app/billing`
- Raw Material & Dum Stock Ledger: `http://localhost:8080/app/stock`
- Chennai Metro GPS Radar: `http://localhost:8080/branches`
- Multi-Industry Platform Hub: `http://localhost:8080/platform`
- Thermal Printer & Hardware Engine: `http://localhost:8080/app/settings`

The app boots pre-populated with **21 days of demo sales data** so every chart, profit margin, and stock ledger is active. You can reset to zero anytime in `/app/settings` -> *Reset to demo data*.

---

## 3. GitHub & Vercel Step-by-Step Deployment (100% Free, Zero Cost)

You do **NOT** need to pay for a domain name or expensive servers. Vercel provides a free, lightning-fast SSL HTTPS domain (e.g. `https://spotlight-biriyani.vercel.app`) that runs 24/7 across the globe.

### Step 3.1: Push Your Code to a Private GitHub Repository
1. Open PowerShell or Terminal in your project folder:
   ```bash
   cd "c:\Users\ManikandanSoundar\OneDrive - Adeahub\Personal Work\spotlight-biriyani-full-kit\spotlight-biriyani"
   ```
2. Initialize Git and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Spotlight Biriyani POS v1.0 Production Release"
   ```
3. Open your browser, go to **https://github.com** and log in.
4. Click **New Repository** (+ icon at top right):
   - Repository Name: `spotlight-biriyani`
   - Privacy: **Select Private** (⚠️ This ensures your source code is 100% private and protected).
   - Do NOT initialize with README or license. Click **Create repository**.
5. Copy the remote commands from GitHub and run them in your terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/spotlight-biriyani.git
   git push -u origin main
   ```

### Step 3.2: Connect and Deploy on Vercel
1. Go to **https://vercel.com** and log in (or click "Sign Up with GitHub").
2. On your Vercel Dashboard, click **Add New Project**.
3. Under "Import Git Repository", find your private repository: `spotlight-biriyani` and click **Import**.
4. Vercel automatically detects Vite and reads `vercel.json` from your root folder:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.
6. Within **45 seconds**, your app is live! You will receive a production URL such as:
   `https://spotlight-biriyani.vercel.app`
7. This URL works on any phone, counter tablet, iPhone, Android, or billing PC worldwide with zero downtime!

---

## 4. SaaS Business Model: Retaining 100% Product Ownership & Security

### Why You Never Give Raw Source Code to the Restaurant
- If you copy the source code to the restaurant owner's laptop, they can share it with competitors, hire a cheap freelancer to modify it, or stop paying you subscription fees.
- **The SaaS Solution:** You host the code on your private GitHub and Vercel cloud. The restaurant owner and cashier only get a login link (`https://spotlight-biriyani.vercel.app/app/billing`) and their 4-digit staff PIN.
- They **never touch the source code**. You retain 100% ownership, intellectual property rights, database control, and recurring monthly software licensing authority.

### Solving the "Laptop Must Always Run" Problem
- If an app runs locally on your laptop, closing the laptop turns the app off. The restaurant owner will not tolerate having to start terminal servers or run Node commands.
- **The Cloud Solution:** By deploying to Vercel/Cloud, the application runs 24 hours a day, 365 days a year on high-speed global serverless infrastructure.
- The restaurant owner never runs commands or starts servers. They simply open Google Chrome on their billing counter tablet or touchscreen PC, bookmark the URL, and start billing!

---

## 5. Hardware Reality: UPI Soundbox & Thermal Printers

### How the ₹340 "PhonePe / Paytm Soundbox" Works
- Small tea shops and large biriyani counters in Chennai use 4G Soundboxes (Paytm, PhonePe, Razorpay).
- The Soundbox has a 4G SIM card inside connected directly to the bank payment gateway API.
- In Spotlight POS, when a cashier selects **UPI Payment**, the screen displays a dynamic UPI QR code. When the customer scans and pays ₹340 via GooglePay or PhonePe:
  1. The payment gateway verifies the transaction.
  2. The Soundbox immediately announces: *"₹340 received on PhonePe"*.
  3. The cashier clicks **Done & Print Bill** (or sends the WhatsApp invoice).

### Installing Thermal Printers (80mm & 58mm)
- **80mm Desktop Receipt Printers:** (Epson, TVS RP-3200, Posiflex) connect via USB to the billing PC. In Chrome, set paper size to 80mm once; Chrome auto-remembers it.
- **58mm Pocket Bluetooth Printers:** (Sunmi, Everycom) connect via Bluetooth to counter Android tablets. Perfect for takeaway and parcel counters.
- Hardware configuration is managed inside `/app/settings` -> *Thermal Printer Engine*.

---

## 6. Raw Material Inventory & Stock Management

### How to Edit and Delete Materials
- In `/app/stock`, the **On-Hand Table** lists all tracked materials (Rice, Chicken, Mutton, Ghee, Masalas, Curd, Carry Bags).
- **Edit:** Click the **Edit** button (pencil icon) next to any row to modify Material Name, Unit, Quantity, Reorder Level, or Cost per Unit.
- **Delete / Remove:** Click the **Remove** button (trash icon) to instantly delete unwanted items (e.g. curd, carry bags, or mistyped materials).

### Understanding "Opening Quantity" vs "Reorder Alert in Red"
- **Opening Quantity:** The physical quantity on hand when first setting up the kitchen inventory.
- **Why Reorder is RED:** If `Current Qty <= Reorder Level`, the badge turns **RED ("⚠️ Reorder")** to alert the chef to order fresh stock before the restaurant runs out during peak hours. If stock is plentiful, it displays **GREEN ("✓ OK")**.

---

## 7. Daily Routine for Restaurant Staff

- **Morning (11:00 AM):** Cashier opens `/app/stock` and logs morning vegetable/meat purchases (*+ Purchase*).
- **Lunch Rush (12:30 PM - 3:30 PM):** Fast 3-second counter billing in `/app/billing`. Bills are auto-printed or sent via WhatsApp.
- **Evening (10:30 PM):** Manager checks `/app` Dashboard for today's net profit, Swiggy commission deduction, and prints the Day-End Z-Report.
