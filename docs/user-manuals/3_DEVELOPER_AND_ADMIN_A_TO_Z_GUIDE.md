# 💻 Spot Light Biriyani — Developer & Admin A to Z Operating Guide

---

## Welcome, Developer / Administrator!
This document explains the technical runtime environment, starting and stopping the server, how local networking works, finding your IP address, opening the app on mobile phones/tablets, and deploying for free to the cloud.

---

## 1. Technical Prerequisites & Architecture
- **Language**: TypeScript / React 19
- **Bundler / Server**: Vite 8 (Node.js v20+)
- **Routing**: TanStack Router (File-based routing under `src/routes/`)
- **Styles**: Tailwind CSS v4 + OKLCH Design Tokens in `src/styles.css`
- **Data Persistence**: Offline-first `localStorage` (key: `slb.pos.v1`)

---

## 2. How to Start and Stop the Development Server

### A. Start the Server
Open Windows PowerShell or VS Code Terminal:
```powershell
cd "c:\Users\ManikandanSoundar\OneDrive - Adeahub\Personal Work\spotlight-biriyani-full-kit\spotlight-biriyani"

# Run Vite dev server on port 8080
& "C:\Users\ManikandanSoundar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "node_modules\vite\bin\vite.js" --port 8080
```
*(If Node is in your environment PATH, simply run `npm run dev`)*.

### B. Stop the Server
- If running in an active terminal: Press `Ctrl + C` and type `y`.
- If running in background or port 8080 is locked:
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 3. How to Open the App on Mobile Phones & Tablets

### Why `http://localhost:8080` does NOT work on a Mobile Phone:
- `localhost` is a special computer word that literally means **"THIS SAME MACHINE"**.
- When you type `localhost` on your laptop, it connects to your laptop's server.
- When you type `localhost` on your mobile phone, the phone looks inside itself! Since the phone does not have Node.js or Vite running inside it, the phone browser displays:
  **"This site can't be reached" (ERR_CONNECTION_REFUSED)**.

---

### Step-by-Step Instructions to Open on Mobile Phone:

#### Step 1: Connect Phone & Laptop to the Same Wi-Fi
- Both your laptop and your mobile phone **MUST be connected to the exact same Wi-Fi router** (or turn on your phone's Mobile Hotspot and connect your laptop to your phone's hotspot).

#### Step 2: Find Your Laptop's Local Wi-Fi IP Address
Open PowerShell on your laptop and run:
```powershell
ipconfig
```
Look for **Wireless LAN adapter Wi-Fi** -> **IPv4 Address**.
*(Your laptop's current Wi-Fi IP address is: `10.223.36.25`)*.

#### Step 3: Open on Your Mobile Browser (Chrome or Safari)
On your mobile phone, type this exact URL:
👉 **`http://10.223.36.25:8080/app/billing`** (or `http://10.223.36.25:8080/`)

#### Step 4: Install as an App on the Phone / Counter Tablet
1. In Chrome on your phone/tablet, tap the top-right menu **(⋮)**.
2. Tap **"Add to Home screen"** or **"Install App"**.
3. An app icon named **Spot Light Manager** appears on your home screen.
4. Tapping it opens full-screen with zero browser address bar, running like a native POS application!

---

## 4. How to Deploy to Free Cloud (Vercel / Netlify)

When you deploy to Vercel or Netlify, you get a public URL (e.g. `https://spotlight-biriyani.vercel.app`) that works on **ANY phone, anywhere in the world on mobile data (4G/5G)** without needing the same Wi-Fi!

```powershell
# 1. Build production bundle
npm run build

# 2. Preview production build locally
npm run preview
```

### Steps to Deploy to Vercel (100% Free):
1. Push this project to GitHub.
2. Log into [Vercel.com](https://vercel.com) with GitHub.
3. Click **"Add New Project"** -> Select `spotlight-biriyani`.
4. Framework Preset: **Vite**.
5. Click **"Deploy"**.
6. In 60 seconds, your application is live globally with free SSL (`https://`).
