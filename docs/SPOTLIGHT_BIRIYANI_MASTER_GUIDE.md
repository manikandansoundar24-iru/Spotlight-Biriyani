# 🍗 Spot Light Biriyani & POS Suite — Master Guide, Diagrams & Business Playbook

---

## 1. System Architecture & Tech Stack

```mermaid
graph TD
    subgraph Client_Browser ["Client Browser / Counter Tablet"]
        UI["React 19 + TanStack Router UI"]
        subgraph Public_Site ["Public Website (Customer Facing)"]
            Home["/ (Hero, Live Handi Status, WhatsApp Modal)"]
            Menu["/menu (Categorized Dishes & Prices)"]
            Branches["/branches (Tharamani, Adyar, Velachery)"]
            Contact["/contact (Bulk & Catering)"]
        end
        subgraph POS_App ["Spot Light Manager (/app)"]
            Dash["/app (KPIs, Profit Margin, Charts)"]
            Bill["/app/billing (POS Counter, Swiggy, Zomato, Custom Dishes)"]
            Rep["/app/reports (Item breakdown, Prep Forecast)"]
            Stock["/app/stock (Inventory & Waste Movements)"]
            Items["/app/items (Menu & Plate Cost Editor)"]
            Set["/app/settings (Channels, Backup/Restore)"]
        end
        Store["POS Store Engine (src/lib/pos-store.ts)"]
        LocalStorage[("Browser LocalStorage\nKey: slb.pos.v1\n100% Offline Capable")]
    end

    subgraph Peripherals ["Hardware & Integrations"]
        Printer["80mm Thermal Receipt Printer (USB / Bluetooth)"]
        Audio["Web Audio API (Synthesizer Chimes)"]
        WhatsApp["WhatsApp Business Cloud Link"]
    end

    Home --> Store
    Menu --> Store
    Dash --> Store
    Bill --> Store
    Rep --> Store
    Stock --> Store
    Items --> Store
    Set --> Store

    Store <--> LocalStorage
    Bill -->|Browser Print Dialog| Printer
    Bill -->|Sound Chime| Audio
    Home -->|Direct Order| WhatsApp
```

---

## 2. Complete Entity Relationship Data Model (ERD)

```mermaid
erDiagram
    BRANCH ||--o{ SALE : "records"
    BRANCH ||--o{ STOCK_ITEM : "stores"
    CHANNEL ||--o{ SALE : "routes"
    ITEM ||--o{ SALE_LINE : "ordered_in"
    SALE ||--|{ SALE_LINE : "contains"
    STOCK_ITEM ||--o{ STOCK_MOVE : "tracks"

    BRANCH {
        string id PK "tharamani, adyar, velachery"
        string name "Tharamani"
        string address "Kazhikundram, OMR"
        string phone "+91 90000 00001"
    }

    CHANNEL {
        string id PK "counter, swiggy, zomato"
        string name "Swiggy"
        number commissionPct "22.0%"
        number packingCost "₹8.00"
    }

    ITEM {
        string id PK "cb-full, mb-full, kushka"
        string name "Chicken Biriyani (Full)"
        string category "biryani, starters, breads"
        number price "Counter price ₹180"
        number onlinePrice "Swiggy price ₹220"
        number cost "Plate food cost ₹96"
        boolean active "true/false"
    }

    SALE {
        string id PK "sale-uuid"
        string branchId FK
        string channel FK "counter / swiggy / zomato"
        number gross "₹540"
        number discount "₹20"
        number net "₹520 (Customer pays)"
        number cogs "₹236 (Food cost)"
        number commission "₹114.40 (Swiggy cut)"
        number packing "₹8.00"
        number profit "₹161.60 (Net profit)"
        string payment "cash / upi / card / online"
        datetime timestamp
    }

    SALE_LINE {
        string itemId FK
        string name "Chicken Biriyani (Full)"
        number qty "2"
        number price "₹180"
        number cost "₹96"
    }

    STOCK_ITEM {
        string id PK "st-chicken, st-rice, st-oil"
        string name "Broiler Chicken"
        string unit "kg / liter / packet"
        number onHand "42.5"
        number reorderLevel "15.0"
        number costPerUnit "₹160/kg"
    }

    STOCK_MOVE {
        string id PK "move-uuid"
        string stockItemId FK
        string type "purchase / used / wastage"
        number qty "25"
        string note "Morning market purchase"
        datetime timestamp
    }
```

---

## 3. Order & True Profit Calculation Flowchart

```mermaid
flowchart TD
    A["Cashier Selects Channel:\nCounter / Swiggy / Zomato"] --> B["Select Dishes (Full, Half, 65) & Multi-Quantities\nor Click '+ Custom / Open Dish'"]
    B --> C["Gross Revenue = Σ (Price × Qty)"]
    C --> D["Apply Discount (₹)\nNet Customer Revenue = Gross - Discount"]
    
    subgraph Deductions ["Operating Cost Deductions"]
        E["Food Cost (COGS) = Σ (Plate Cost × Qty)"]
        F["Platform Cut = Net Revenue × Channel % (e.g. Swiggy 22%)"]
        G["Packaging Fee = Fixed Order Fee (e.g. ₹8.00)"]
    end

    D --> Deductions
    Deductions --> H["NET PROFIT FORMULA:\nProfit = Net Revenue - COGS - Commission - Packing"]
    H --> I{"Live Margin Check"}
    I -->|Healthy Margin| J["🟢 Green Highlight on POS Screen\nReal-time Margin % Displayed"]
    I -->|Low Margin Alert| K["🔴 Warning Indicator"]
    J --> L["Cash Tendered Input:\n[Exact] [₹200] [₹500] [₹1000] -> Calculates Return Change"]
    L --> M["Save Sale -> LocalStorage\nPlay Web Audio Chime (Ding!)\nPrint 80mm Receipt with Token #"]
```

---

## 4. End-to-End Daily Restaurant Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Restaurant Staff / Cashier
    actor Owner as Restaurant Owner
    participant POS as Spot Light Manager
    participant Kitchen as Kitchen Dum Master
    participant Printer as 80mm Thermal Printer

    Note over Staff,Kitchen: MORNING (11:00 AM - 12:00 PM)
    Staff->>POS: Open /app/stock -> Record Morning Purchases (Chicken, Rice, Oil)
    POS->>POS: Calculate Updated Inventory & Stock Value
    Staff->>POS: Open /app/reports -> Check "Prep Tomorrow" forecast plates
    Staff->>Kitchen: Handover Dum Handi cooking targets (e.g., 65 Chicken, 30 Mutton)

    Note over Staff,Kitchen: LUNCH & DINNER RUSH (12:30 PM - 10:30 PM)
    Staff->>POS: Open /app/billing -> Choose Channel (Counter / Swiggy / Zomato)
    Staff->>POS: Tap dishes -> Enter discount -> Select Cash/UPI
    POS->>Staff: Shows live true profit & cash change to return
    Staff->>POS: Tap "SAVE BILL & PRINT"
    POS->>POS: Plays cash register chime (Ding!)
    POS->>Printer: Output 80mm receipt with Token #039 & Kitchen Note
    POS->>POS: Automatically deducts ingredients from stock

    Note over Staff,Owner: NIGHT AUDIT & CLOSING (10:45 PM)
    Owner->>POS: Open /app Dashboard -> Check Today's Net Revenue, Net Profit, Swiggy Cut
    Owner->>POS: Open /app/reports -> Export Day CSV for Accountant
    Owner->>POS: Open /app/settings -> Download JSON Backup (Weekly to Google Drive)
```

---

## 5. Local Network & Mobile Phone Architecture

```mermaid
graph TD
    Laptop["Your Laptop (Windows PC)<br/>Running Server on Port 8080<br/>Local IP: 10.223.36.25"]
    Router["Local Wi-Fi Router or Mobile Hotspot<br/>(Same Local Network Subnet)"]
    Phone["Your Mobile Phone or Counter Tablet<br/>(Chrome or Safari Browser)"]

    Laptop <-->|Connected to Local Wi-Fi| Router
    Router <-->|Connected to Same Wi-Fi| Phone

    Phone -->|Step 1: Type http://10.223.36.25:8080| Laptop
    Laptop -->|Step 2: Streams Live POS App| Phone
```

---

## 6. Directory Layout of the Master Codebase

```
spotlight-biriyani/
├── public/                     Static web assets
│   ├── favicon.svg             Glowing brand flame SVG icon
│   └── favicon.ico             32x32 browser tab icon
│
├── src/
│   ├── routes/                 TanStack Router (File-based routes)
│   │   ├── __root.tsx          Master Shell (Fonts, Favicons, Sonner toaster)
│   │   ├── index.tsx           Homepage (Live Handi banner, WhatsApp modal, Buckets, Reviews)
│   │   ├── menu.tsx            Public menu (Reads live prices from POS store)
│   │   ├── branches.tsx        Kitchen locations with Google Maps directions
│   │   ├── contact.tsx         Bulk catering inquiry form
│   │   │
│   │   ├── app.tsx             POS App Shell (Branch dropdown, navigation tabs)
│   │   ├── app.index.tsx       Manager Dashboard (Revenue, Food Cost, Net Profit %)
│   │   ├── app.billing.tsx     Fast touch billing terminal, multi-item counters, custom items, receipts
│   │   ├── app.reports.tsx     Item sales counts, P&L breakdown & Prep Forecast
│   │   ├── app.stock.tsx       Raw materials (Chicken, Rice, Oil) on hand & wastage
│   │   ├── app.items.tsx       Menu & Cost Editor (Counter price, Swiggy price, Plate cost)
│   │   └── app.settings.tsx    Branch names, Swiggy/Zomato commission %, JSON Backup
│   │
│   ├── lib/
│   │   └── pos-store.ts        THE CORE ENGINE: Database, profit math, storage, demo seed data
│   │
│   ├── components/site/
│   │   └── SiteShell.tsx       Public website navigation header & footer
│   │
│   ├── assets/                 Food photography (Biriyani, Mutton, Kushka)
│   └── styles.css              All design tokens (Embers & Charcoal OKLCH color palette)
│
└── docs/
    ├── user-manuals/           Dedicated Step-by-Step Operating Manuals
    │   ├── 1_RESTAURANT_OWNER_MANUAL.md
    │   ├── 2_MANAGER_AND_CASHIER_MANUAL.md
    │   ├── 3_DEVELOPER_AND_ADMIN_A_TO_Z_GUIDE.md
    │   ├── 4_WHITE_LABEL_REBRANDING_GUIDE.md
    │   └── printable-pdf-html/ (Printable HTML files ready to save as PDF via Ctrl + P)
    │
    └── delivery/               14 Client proposals, pricing sheets, sales pitch decks (English, Tamil, Hindi)
```

---

## 7. Dedicated User Manuals & Printable PDF Files

All manuals are organized inside [docs/user-manuals/](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals):

1. **[1_RESTAURANT_OWNER_MANUAL.md](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/1_RESTAURANT_OWNER_MANUAL.md)**
   - *For the Owner*: Daily morning to night routine, how to check true profit, stop Swiggy leakage, and download Sunday backups.
   - *Printable PDF*: [1_RESTAURANT_OWNER_MANUAL.html](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/printable-pdf-html/1_RESTAURANT_OWNER_MANUAL.html)

2. **[2_MANAGER_AND_CASHIER_MANUAL.md](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/2_MANAGER_AND_CASHIER_MANUAL.md)**
   - *For the Cashier / Counter*: Step-by-step billing, ordering multiple dishes (1 full, 1 half, 1 65), adding custom off-menu dishes, using quick cash tender chips, and printing 80mm thermal receipts with token numbers.
   - *Printable PDF*: [2_MANAGER_AND_CASHIER_MANUAL.html](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/printable-pdf-html/2_MANAGER_AND_CASHIER_MANUAL.html)

3. **[3_DEVELOPER_AND_ADMIN_A_TO_Z_GUIDE.md](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/3_DEVELOPER_AND_ADMIN_A_TO_Z_GUIDE.md)**
   - *For You (Developer / Admin)*: Starting/stopping server, finding your Wi-Fi IP, opening on mobile phones, free cloud deployment on Vercel/Netlify.
   - *Printable PDF*: [3_DEVELOPER_AND_ADMIN_A_TO_Z_GUIDE.html](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/printable-pdf-html/3_DEVELOPER_AND_ADMIN_A_TO_Z_GUIDE.html)

4. **[4_WHITE_LABEL_REBRANDING_GUIDE.md](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/4_WHITE_LABEL_REBRANDING_GUIDE.md)**
   - *For Business Scaling*: How to adapt this software for ANY restaurant (Chai cafe, burger joint, Mandi shop) in 15 minutes, pricing models, pitch scripts, and financial models.
   - *Printable PDF*: [4_WHITE_LABEL_REBRANDING_GUIDE.html](file:///c:/Users/ManikandanSoundar/OneDrive%20-%20Adeahub/Personal%20Work/spotlight-biriyani-full-kit/spotlight-biriyani/docs/user-manuals/printable-pdf-html/4_WHITE_LABEL_REBRANDING_GUIDE.html)
