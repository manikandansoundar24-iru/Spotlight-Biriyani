# RestoPulse — Master Documentation Index & Curriculum Guide
**Last Updated:** November 2026 | **Version:** 2.4 Production Release

Welcome to the definitive documentation index for **RestoPulse** (Cloud Restaurant POS & Kitchen ERP). 
Use this guide to know **which document to read**, **what to explain to whom**, and **which manual covers which part of the system**.

---

## Quick Reference: Which Document Do I Use For What?

| Your Goal / Who You Are Talking To | Document to Use | Location |
| :--- | :--- | :--- |
| **Explain Product Features & Day-to-Day Operations to a Restaurant Owner** | `SPOTLIGHT_FULL_OPERATIONS_MANUAL.md` | `docs/SPOTLIGHT_FULL_OPERATIONS_MANUAL.md` |
| **Explain Code Architecture Line-by-Line to a Developer or Technical Interviewer** | `CODE_WALKTHROUGH_LINE_BY_LINE.md` | `docs/CODE_WALKTHROUGH_LINE_BY_LINE.md` |
| **Explain Cloud Tech Stack, Database & Hosting Architecture** | `ARCHITECTURE.md` | `docs/ARCHITECTURE.md` |
| **How to Beat & Replace Petpooja (Feature Matrix & ₹14,000+ Price Breakdown)** | `PETPOOJA_VS_RESTOPULSE_BATTLECARD.md` | `public/PETPOOJA_VS_RESTOPULSE_BATTLECARD.pdf` & Brain Artifact |
| **How to Pitch, Overcome Objections & Close Sales Deals with Restaurant Owners** | `RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.md` | `docs/RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.md` |
| **Explain Restaurant Business Economics, Unit Economics & Margins** | `BUSINESS-PLAYBOOK.md` | `docs/BUSINESS-PLAYBOOK.md` |
| **How to Setup, Install, and Run Locally from Scratch** | `SETUP.md` | `docs/SETUP.md` |
| **Full Technical & Business Master Reference (Everything in One Place)** | `THE_DEFINITIVE_MASTER_ENGINEERING_AND_BUSINESS_BIBLE.md` | `docs/THE_DEFINITIVE_MASTER_ENGINEERING_AND_BUSINESS_BIBLE.md` |
| **Testing, Quality Assurance & Edge-Case Verification** | `TESTING.md` | `docs/TESTING.md` |
| **How to Customize Menu, Recipes, Prices & Tax Rates** | `CUSTOMISE.md` | `docs/CUSTOMISE.md` |

---

## Detailed Breakdown of Each Document

### 1. `SPOTLIGHT_FULL_OPERATIONS_MANUAL.md`
- **Purpose:** Complete end-to-end operational handbook for restaurant owners, billing counter cashiers, and kitchen chefs.
- **What it covers:**
  - **Billing Terminal Workflow:** How to take a counter order, apply discounts, select Cash/UPI/Card, and print 80mm/58mm thermal receipts in under 3 seconds.
  - **Deg Batch Portions & Stock Cap:** Why authentic biriyani kitchens cook in batches (e.g. 160 plates per deg) and how the live countdown prevents selling over capacity.
  - **WhatsApp Digital Receipts:** Sending direct bill receipts over WhatsApp without costly SMS gateway fees.
  - **Raw Material Inventory:** Logging raw meat, basmati rice, ghee, and cooking oil with low-stock alerts.
  - **Multi-Branch Operations:** Switching between Taramani Flagship, Adyar, and Velachery branches with separate stock and sales logs.
- **When to read it:** Read this before demonstrating the software to a restaurant manager or cashier staff.

---

### 2. `CODE_WALKTHROUGH_LINE_BY_LINE.md`
- **Purpose:** Engineering deep-dive explaining the TypeScript and React code line by line.
- **What it covers:**
  - **State Store (`src/lib/pos-store.ts`):** How `getDB()` and `setDB()` maintain reactive client state with zero external library overhead.
  - **Bidirectional Cloud Sync (`src/lib/neon-sync.ts`):** How `createServerFn` executes server-side queries to Neon PostgreSQL via connection-pooled HTTP endpoints.
  - **Reactive Rendering:** How `useMemo` optimizes search, dish category filtering, and sales calculations without UI lag.
  - **Audio Synthesis:** How the HTML5 Web Audio API generates authentic cash-register chimes without external MP3 audio files.
- **When to read it:** Read this when explaining how the application is built to a software engineer, technical interviewer, or co-founder.

---

### 3. `ARCHITECTURE.md`
- **Purpose:** High-level system design and cloud infrastructure document.
- **What it covers:**
  - **Zero-Cost Cloud Deployment:** How the application runs 100% free on Vercel Edge Serverless and Neon Cloud PostgreSQL (AWS Singapore region).
  - **Bidirectional Offline-First Sync:** Why the app works offline at the counter even if Wi-Fi temporarily drops, and syncs automatically when connection is restored.
  - **Data Schema:** The exact PostgreSQL schema for `"Sale"`, `"SaleLine"`, `"DishItem"`, and `"Stock"`.
- **When to read it:** Read this when evaluating scaling, security, data persistence, and database backups.

---

### 4. `RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.md`
- **Purpose:** The commercial sales playbook for pitching, negotiating, and closing restaurant contracts.
- **What it covers:**
  - **Why Restaurants Need This:** Eliminating staff pilferage, meat shrinkage, Swiggy/Zomato commission leakage (24%), and expensive hardware lock-ins.
  - **Objection Handling Scripts:**
    - *"I don't have a laptop"* → How to close using any Android mobile phone or budget tablet.
    - *"I already use Petpooja / Posist"* → Feature-by-feature comparison showing cost savings and biriyani-specific batch tracking.
    - *"Will my financial data be safe?"* → How enterprise cloud encryption and Neon PostgreSQL protect their sales records.
  - **The 2-Minute Walk-In Demo Script:** Exact words to say when meeting a restaurant owner in person.
- **When to read it:** Read this every time before speaking with a prospective client or restaurant owner.

---

### 5. `BUSINESS-PLAYBOOK.md`
- **Purpose:** Restaurant economics and financial modeling.
- **What it covers:**
  - Food cost percentage breakdown (meat 32%, rice 8%, spices 5%).
  - Swiggy vs Zomato vs Counter Dine-in margin calculations.
  - Breakeven plate calculations for cloud kitchens and quick-service restaurants (QSR).
- **When to read it:** Read this to speak the financial language of restaurant owners (gross margin, net margin, wastage percentage).

---

### 6. `SETUP.md` & `TESTING.md`
- **Purpose:** Developer onboarding, local environment setup, and test suite execution.
- **What it covers:**
  - Node.js version requirements, npm install steps, and environment variables (`DATABASE_URL`).
  - Unit tests, edge cases, and thermal printer simulation tests.
- **When to read it:** Read when installing the project on a new computer or preparing a fresh deployment.

---

## Study Roadmap: What Order Should You Read?
1. **Day 1 — Master the Product:** Read `docs/SPOTLIGHT_FULL_OPERATIONS_MANUAL.md` to know every single button and feature.
2. **Day 2 — Master the Sales Pitch:** Read `docs/RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.md` to know how to sell and overcome any doubt.
3. **Day 3 — Master the Tech & Code:** Read `docs/ARCHITECTURE.md` and `docs/CODE_WALKTHROUGH_LINE_BY_LINE.md` to understand the code under the hood.

