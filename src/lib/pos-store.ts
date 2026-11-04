/**
 * Spot Light Biriyani — local data layer.
 *
 * Everything is stored in the browser (localStorage) so the app works offline
 * at the counter with zero setup. Swap `read`/`write` for API/Cloud calls later
 * (see docs/ARCHITECTURE.md) without touching any UI code.
 */
import { useEffect, useState } from "react";

/* ---------------------------------- types --------------------------------- */

export type Branch = { id: string; name: string; address: string; phone: string };

export type ChannelId = "counter" | "swiggy" | "zomato";

export type Channel = {
  id: ChannelId;
  name: string;
  /** platform commission on order value, % */
  commissionPct: number;
  /** packaging cost per order, INR */
  packagingCost: number;
};

export type Category =
  | "biryani"
  | "kushka"
  | "starter"
  | "bread"
  | "dessert"
  | "beverage"
  | "chinese"
  | "rice"
  | "curry"
  | "combos"
  | string;

export type Item = {
  id: string;
  name: string;
  category: Category;
  /** counter selling price */
  price: number;
  /** price on aggregators (usually higher to absorb commission) */
  onlinePrice: number;
  /** food cost to make one plate */
  cost: number;
  active: boolean;
};

export type SaleLine = { itemId: string; name: string; qty: number; price: number; cost: number };

export type Sale = {
  id: string;
  /** ISO datetime */
  date: string;
  branchId: string;
  channel: ChannelId;
  lines: SaleLine[];
  gross: number;
  discount: number;
  net: number;
  cogs: number;
  commission: number;
  packaging: number;
  profit: number;
  payment: "cash" | "upi" | "card" | "online";
  orderType?: "dinein" | "takeaway" | undefined;
  customerPhone?: string | undefined;
  customerName?: string | undefined;
  tableId?: string | undefined;
  kotToken?: number | undefined;
  isEdited?: boolean | undefined;
  originalNet?: number | undefined;
  editedAt?: string | undefined;
};

export type StockItem = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  reorderLevel: number;
  costPerUnit: number;
};

export type StockMove = {
  id: string;
  date: string;
  branchId: string;
  stockItemId: string;
  type: "in" | "out" | "wastage";
  qty: number;
  note: string;
};

export type PrinterSettings = {
  paperWidth: "80mm" | "58mm";
  autoCut: boolean;
  cashDrawerKick: boolean;
  printCopies: 1 | 2;
  printHeader: boolean;
  fssaiNumber: string;
  gstin: string;
  customFooter: string;
};

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  paperWidth: "80mm",
  autoCut: true,
  cashDrawerKick: true,
  printCopies: 1,
  printHeader: true,
  fssaiNumber: "12424008000456",
  gstin: "33AAAAA0000A1Z5",
  customFooter: "Freshly cooked twice daily · No reheats · Thank you! Visit again.",
};

/* --- Phase 2 Enterprise Types --- */

export type TableStatus = "available" | "occupied" | "billed";

export type TableSession = {
  id: string; // "T1", "T2", ... "T8", "O1", "O2"
  name: string; // "Table 1 (Window)", etc.
  capacity: number; // 2, 4, 6
  status: TableStatus;
  lines: SaleLine[];
  customerPhone?: string | undefined;
  customerName?: string | undefined;
  notes?: string | undefined;
  openedAt?: string | undefined;
  lastKotAt?: string | undefined;
  kotCount?: number | undefined;
};

export type KdsStatus = "pending" | "preparing" | "ready" | "completed";

export type KdsOrder = {
  id: string; // KOT or Sale ID
  orderNumber?: string | undefined;
  tokenNum?: number | undefined;
  tableId?: string | undefined;
  orderType: "dinein" | "takeaway" | "swiggy" | "zomato";
  channel: ChannelId;
  createdAt: string;
  status: KdsStatus;
  notes?: string | undefined;
  lines: { name: string; qty: number; done?: boolean | undefined }[];
};

export type ShiftDayClose = {
  id: string;
  date: string;
  closedAt: string;
  cashierName: string;
  openingFloat: number;
  cashBilled: number;
  upiBilled: number;
  cardBilled: number;
  expenses: number;
  expectedCash: number;
  actualCash: number;
  variance: number; // actualCash - expectedCash
  note?: string;
};

export type TenantModules = {
  billing: boolean;
  tables: boolean;
  kds: boolean;
  stock: boolean;
  reports: boolean;
  menu: boolean;
  loyalty: boolean;
  dynamicUpi: boolean;
  zReport: boolean;
  multiBranch: boolean;
  aggregators: boolean;
};

export type TenantConfig = {
  id: string;
  businessName: string;
  tagline: string;
  activeBranchName: string;
  phone: string;
  address: string;
  gstin: string;
  fssai: string;
  upiId: string;
  gstPct: number;
  cuisineType?: string | undefined;
  degBatchEnabled?: boolean | undefined;
  currencySymbol?: string | undefined;
  loginUsername?: string | undefined;
  loginPassword?: string | undefined;
  cashierPin?: string | undefined;
  kitchenPin?: string | undefined;
  enabledModules: TenantModules;
};

export const DEFAULT_TABLES: TableSession[] = [
  { id: "T1", name: "Table 1 (Window)", capacity: 2, status: "available", lines: [] },
  { id: "T2", name: "Table 2 (Window)", capacity: 2, status: "available", lines: [] },
  { id: "T3", name: "Table 3 (Center)", capacity: 4, status: "available", lines: [] },
  { id: "T4", name: "Table 4 (Center)", capacity: 4, status: "available", lines: [] },
  { id: "T5", name: "Table 5 (Booth)", capacity: 4, status: "available", lines: [] },
  { id: "T6", name: "Table 6 (Family)", capacity: 6, status: "available", lines: [] },
  { id: "T7", name: "Table 7 (High Top)", capacity: 4, status: "available", lines: [] },
  { id: "T8", name: "Table 8 (High Top)", capacity: 2, status: "available", lines: [] },
  { id: "O1", name: "Outdoor 1 (Patio)", capacity: 4, status: "available", lines: [] },
  { id: "O2", name: "Outdoor 2 (Patio)", capacity: 4, status: "available", lines: [] },
];

export const DEFAULT_TENANTS: TenantConfig[] = [
  {
    id: "spotlight-biriyani",
    businessName: "Spot Light Biriyani",
    tagline: "Authentic Chennai Dum Biriyani & Starters",
    activeBranchName: "Taramani (Flagship)",
    phone: "+91 98844 30710",
    address: "10, Kaikankuppam, Kazhikundram, Taramani, Chennai - 600113",
    gstin: "33AAAAA0000A1Z5",
    fssai: "12424008000456",
    upiId: "spotlightbiriyani@oksbi",
    gstPct: 5,
    cuisineType: "Biriyani Special",
    degBatchEnabled: true,
    currencySymbol: "₹",
    loginUsername: "owner@spotlight.in",
    loginPassword: "spotlight2026",
    cashierPin: "1234",
    kitchenPin: "5555",
    enabledModules: {
      billing: true,
      tables: true,
      kds: true,
      stock: true,
      reports: true,
      menu: true,
      loyalty: true,
      dynamicUpi: true,
      zReport: true,
      multiBranch: true,
      aggregators: true,
    },
  },
  {
    id: "csk-biriyani",
    businessName: "CSK Biriyani & Fast Food",
    tagline: "Chennai Super Kitchen",
    activeBranchName: "T. Nagar (Main)",
    phone: "+91 98765 43210",
    address: "45, Usman Road, T. Nagar, Chennai - 600017",
    gstin: "33BCDEF1234A1Z1",
    fssai: "12424008000999",
    upiId: "cskbiriyani@okaxis",
    gstPct: 5,
    cuisineType: "Biriyani & Fast Food",
    degBatchEnabled: true,
    currencySymbol: "₹",
    loginUsername: "owner@cskbiriyani.in",
    loginPassword: "csk2026",
    cashierPin: "1001",
    kitchenPin: "5555",
    enabledModules: {
      billing: true,
      tables: true,
      kds: true,
      stock: true,
      reports: true,
      menu: true,
      loyalty: true,
      dynamicUpi: true,
      zReport: true,
      multiBranch: true,
      aggregators: true,
    },
  },
  {
    id: "madurai-star",
    businessName: "Madurai Star Biriyani",
    tagline: "Original Seeraga Samba Biriyani",
    activeBranchName: "Anna Nagar Kitchen",
    phone: "+91 98400 11223",
    address: "12, 2nd Avenue, Anna Nagar, Chennai - 600040",
    gstin: "33CDEFG5678B1Z2",
    fssai: "12424008000888",
    upiId: "maduraistar@okicici",
    gstPct: 5,
    cuisineType: "Seeraga Samba Biriyani",
    degBatchEnabled: true,
    currencySymbol: "₹",
    loginUsername: "owner@maduraistar.in",
    loginPassword: "star2026",
    cashierPin: "2001",
    kitchenPin: "5555",
    enabledModules: {
      billing: true,
      tables: true,
      kds: true,
      stock: false,
      reports: true,
      menu: true,
      loyalty: true,
      dynamicUpi: true,
      zReport: true,
      multiBranch: false,
      aggregators: true,
    },
  },
  {
    id: "royal-brew-cafe",
    businessName: "Royal Brew Cafe & Bistro",
    tagline: "Artisan Coffee, Sandwiches & Desserts",
    activeBranchName: "Nungambakkam High Road",
    phone: "+91 98410 99887",
    address: "88, Nungambakkam High Road, Chennai - 600034",
    gstin: "33DEFGH9876C1Z3",
    fssai: "12424008000777",
    upiId: "royalbrew@okhdfcbank",
    gstPct: 5,
    cuisineType: "Cafe & Bistro",
    degBatchEnabled: false,
    currencySymbol: "₹",
    loginUsername: "owner@royalbrew.in",
    loginPassword: "royal2026",
    cashierPin: "3001",
    kitchenPin: "5555",
    enabledModules: {
      billing: true,
      tables: true,
      kds: true,
      stock: true,
      reports: true,
      menu: true,
      loyalty: true,
      dynamicUpi: true,
      zReport: true,
      multiBranch: false,
      aggregators: true,
    },
  },
];

export type DB = {
  branches: Branch[];
  channels: Channel[];
  items: Item[];
  sales: Sale[];
  stock: StockItem[];
  moves: StockMove[];
  tables?: TableSession[];
  kdsOrders?: KdsOrder[];
  shiftCloses?: ShiftDayClose[];
  tenants?: TenantConfig[];
  activeTenantId?: string;
  saasPlatformName?: string;
  settings: {
    businessName: string;
    gstPct: number;
    activeBranchId: string;
    printerSettings: PrinterSettings;
    upiId?: string;
    dailyBatchCapacity?: Record<string, number>;
    batchSplit?: Record<string, { chickenCap: number; muttonCap: number }>;
  };
};

/* ---------------------------------- seed ---------------------------------- */

const id = () => Math.random().toString(36).slice(2, 10);

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "biryani", label: "Biriyani" },
  { id: "kushka", label: "Kushka" },
  { id: "starter", label: "Starters" },
  { id: "chinese", label: "Chinese & Noodles" },
  { id: "rice", label: "Fried Rice & Fast Food" },
  { id: "curry", label: "Curries & Gravies" },
  { id: "bread", label: "Breads" },
  { id: "dessert", label: "Desserts" },
  { id: "beverage", label: "Beverages" },
  { id: "combos", label: "Combos & Buckets" },
];

export function isSameDay(dateStr?: string | Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Dynamically computes remaining plates and live batch status
 * based on actual sales records for that branch today.
 */
export function getLiveBatchStatus(db: DB, branchId: string) {
  const defaultCapacityMap: Record<string, number> = {
    taramani: 160,
    adyar: 120,
    velachery: 100,
  };
  const cap = db.settings?.dailyBatchCapacity?.[branchId] ?? (defaultCapacityMap[branchId] || 120);
  const sales = Array.isArray(db.sales) ? db.sales : [];
  const hour = new Date().getHours();
  
  let chickenSold = 0;
  let muttonSold = 0;
  let kushkaSold = 0;
  let eggSold = 0;

  const soldToday = sales
    .filter((s) => {
      if (!s || typeof s.date !== "string") return false;
      const matchBranch =
        s.branchId === branchId || !s.branchId || (branchId === "taramani" && s.branchId === "tharamani");
      return matchBranch && isSameDay(s.date);
    })
    .reduce((acc, s) => {
      let bPlates = 0;
      (s.lines || []).forEach((l) => {
        const n = (l?.name || "").toLowerCase();
        const qty = l?.qty || 1;
        if (n.includes("chicken") && (n.includes("biriyani") || n.includes("briyani"))) {
          chickenSold += qty;
          bPlates += qty;
        } else if (n.includes("mutton")) {
          muttonSold += qty;
          bPlates += qty;
        } else if (n.includes("kushka")) {
          kushkaSold += qty;
          bPlates += qty;
        } else if (n.includes("egg")) {
          eggSold += qty;
          bPlates += qty;
        } else if (n.includes("biriyani") || n.includes("briyani")) {
          bPlates += qty;
        }
      });
      return acc + bPlates;
    }, 0);

  const platesLeft = Math.max(0, cap - soldToday);

  // Configurable or proportional capacity estimates for deg items
  const customSplit = db.settings?.batchSplit?.[branchId];
  let chickenCap = customSplit?.chickenCap ?? Math.round(cap * 0.65);
  let muttonCap = customSplit?.muttonCap ?? (cap - chickenCap);

  // If actual sales for an item exceeded initial estimate, dynamically adapt capacity
  if (muttonSold > muttonCap) {
    muttonCap = muttonSold;
    chickenCap = Math.max(chickenSold, cap - muttonCap);
  } else if (chickenSold > chickenCap) {
    chickenCap = chickenSold;
    muttonCap = Math.max(muttonSold, cap - chickenCap);
  }

  // Raw remaining per item
  let chickenLeft = Math.max(0, chickenCap - chickenSold);
  let muttonLeft = Math.max(0, muttonCap - muttonSold);

  // Strict reconciliation: Item remaining counts can NEVER exceed total remaining plates
  if (platesLeft <= 0) {
    chickenLeft = 0;
    muttonLeft = 0;
  } else {
    // Bound chicken and mutton by total plates remaining in the kitchen
    chickenLeft = Math.min(platesLeft, chickenLeft);
    muttonLeft = Math.min(platesLeft - chickenLeft, muttonLeft);
    // If mutton was not sold out but chicken didn't take all remaining plates:
    if (muttonSold < muttonCap && chickenLeft + muttonLeft < platesLeft) {
      muttonLeft = platesLeft - chickenLeft;
    }
  }

  const kushkaCap = Math.round(chickenCap * 0.2);
  const kushkaLeft = chickenLeft > 0 ? chickenLeft : 0;

  let batchTitle = "Lunch Batch Open";
  if (hour >= 18) {
    batchTitle = "Dinner Batch Open";
  } else if (hour >= 15 && hour < 18) {
    return {
      cap,
      platesLeft,
      soldToday,
      status: "Dinner Batch Ready at 7:00 PM",
      isSoldOut: platesLeft <= 0,
      breakdown: {
        chickenSold,
        muttonSold,
        kushkaSold,
        eggSold,
        chickenCap,
        muttonCap,
        kushkaCap,
        chickenLeft,
        muttonLeft,
        kushkaLeft,
      },
    };
  }

  return {
    cap,
    platesLeft,
    soldToday,
    status: platesLeft > 0 ? `${batchTitle} · ${platesLeft} Plates Left` : "Today's Batch Sold Out",
    isSoldOut: platesLeft <= 0,
    breakdown: {
      chickenSold,
      muttonSold,
      kushkaSold,
      eggSold,
      chickenCap,
      muttonCap,
      kushkaCap,
      chickenLeft,
      muttonLeft,
      kushkaLeft,
    },
  };
}

function seed(): DB {
  const branches: Branch[] = [
    {
      id: "taramani",
      name: "Taramani",
      address: "No 6/31, Kazhikundram, Tharamani, Chennai 600113",
      phone: "+91 98844 30710",
    },
    { id: "adyar", name: "Adyar", address: "Lattice Bridge Road, Adyar, Chennai", phone: "+91 90000 00002" },
    { id: "velachery", name: "Velachery", address: "100 Feet Road, Velachery, Chennai", phone: "+91 90000 00003" },
  ];

  const mk = (
    name: string,
    category: Category,
    price: number,
    onlinePrice: number,
    cost: number,
  ): Item => ({ id: id(), name, category, price, onlinePrice, cost, active: true });

  const items: Item[] = [
    mk("Chicken Biriyani (Full)", "biryani", 180, 229, 96),
    mk("Chicken Biriyani (Half)", "biryani", 110, 149, 58),
    mk("Mutton Biriyani (Full)", "biryani", 280, 349, 172),
    mk("Mutton Biriyani (Half)", "biryani", 170, 219, 104),
    mk("Egg Biriyani", "biryani", 120, 159, 54),
    mk("Chicken 65 Biriyani", "biryani", 210, 259, 118),
    mk("Kushka (Plain)", "kushka", 90, 119, 34),
    mk("Kushka with Gravy", "kushka", 110, 145, 46),
    mk("Chicken 65", "starter", 150, 189, 82),
    mk("Pepper Chicken", "starter", 160, 199, 88),
    mk("Chicken Kebab", "starter", 170, 209, 95),
    mk("Parotta", "bread", 15, 25, 7),
    mk("Chicken Gravy", "starter", 70, 99, 31),
    mk("Bread Halwa", "dessert", 60, 89, 22),
    mk("Faluda", "dessert", 90, 119, 38),
    mk("Lemon Soda", "beverage", 30, 49, 9),
  ];

  const stock: StockItem[] = [
    { id: id(), name: "Basmati Rice", unit: "kg", qty: 120, reorderLevel: 40, costPerUnit: 92 },
    { id: id(), name: "Chicken", unit: "kg", qty: 45, reorderLevel: 25, costPerUnit: 210 },
    { id: id(), name: "Mutton", unit: "kg", qty: 18, reorderLevel: 15, costPerUnit: 780 },
    { id: id(), name: "Onion", unit: "kg", qty: 60, reorderLevel: 25, costPerUnit: 38 },
    { id: id(), name: "Tomato", unit: "kg", qty: 30, reorderLevel: 15, costPerUnit: 32 },
    { id: id(), name: "Refined Oil", unit: "L", qty: 35, reorderLevel: 20, costPerUnit: 128 },
    { id: id(), name: "Ghee", unit: "L", qty: 8, reorderLevel: 6, costPerUnit: 620 },
    { id: id(), name: "Biriyani Masala", unit: "kg", qty: 6, reorderLevel: 4, costPerUnit: 480 },
    { id: id(), name: "Curd", unit: "kg", qty: 12, reorderLevel: 8, costPerUnit: 60 },
    { id: id(), name: "Packing Box (Full)", unit: "pcs", qty: 400, reorderLevel: 200, costPerUnit: 9 },
    { id: id(), name: "Carry Bag", unit: "pcs", qty: 700, reorderLevel: 300, costPerUnit: 3 },
    { id: id(), name: "LPG Cylinder", unit: "pcs", qty: 3, reorderLevel: 2, costPerUnit: 1850 },
  ];

  const channels: Channel[] = [
    { id: "counter", name: "Counter / Dine-in", commissionPct: 0, packagingCost: 0 },
    { id: "swiggy", name: "Swiggy", commissionPct: 22, packagingCost: 12 },
    { id: "zomato", name: "Zomato", commissionPct: 24, packagingCost: 12 },
  ];

  // 21 days of believable demo sales so charts and reports are never empty.
  const sales: Sale[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  for (let d = 20; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const orders = 26 + Math.floor(Math.random() * 20);
    for (let o = 0; o < orders; o++) {
      const branch = pick(branches);
      const channel = pick(channels).id;
      const lineCount = 1 + Math.floor(Math.random() * 3);
      const lines: SaleLine[] = [];
      for (let l = 0; l < lineCount; l++) {
        const it = pick(items);
        if (lines.some((x) => x.itemId === it.id)) continue;
        lines.push({
          itemId: it.id,
          name: it.name,
          qty: 1 + Math.floor(Math.random() * 2),
          price: channel === "counter" ? it.price : it.onlinePrice,
          cost: it.cost,
        });
      }
      if (!lines.length) continue;
      const hour = 12 + Math.floor(Math.random() * 10);
      day.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      sales.push(
        buildSale({
          date: day.toISOString(),
          branchId: branch.id,
          channel,
          lines,
          discount: Math.random() < 0.15 ? 20 : 0,
          payment: channel === "counter" ? (Math.random() < 0.5 ? "cash" : "upi") : "online",
          channels,
        }),
      );
    }
  }

  return {
    branches,
    channels,
    items,
    sales,
    stock,
    moves: [],
    settings: {
      businessName: "Spot Light Biriyani",
      gstPct: 5,
      activeBranchId: "taramani",
      printerSettings: { ...DEFAULT_PRINTER_SETTINGS },
    },
  };
}

/* --------------------------- profit calculation ---------------------------- */

export function buildSale(input: {
  date?: string;
  branchId: string;
  channel: ChannelId;
  lines: SaleLine[];
  discount: number;
  payment: Sale["payment"];
  channels: Channel[];
}): Sale {
  const ch = input.channels?.find((c) => c.id === input.channel) || { commissionPct: 0, packagingCost: 0 };
  const gross = input.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const net = Math.max(0, gross - input.discount);
  const cogs = input.lines.reduce((s, l) => s + l.cost * l.qty, 0);
  const commission = +((net * (ch.commissionPct || 0)) / 100).toFixed(2);
  const packaging = ch.packagingCost || 0;
  return {
    id: id(),
    date: input.date ?? new Date().toISOString(),
    branchId: input.branchId || "taramani",
    channel: input.channel,
    lines: input.lines,
    gross,
    discount: input.discount,
    net,
    cogs,
    commission,
    packaging,
    profit: +(net - cogs - commission - packaging).toFixed(2),
    payment: input.payment,
  };
}

/* --------------------------------- storage -------------------------------- */

const KEY = "slb.pos.v1";
let cache: DB | null = null;
const listeners = new Set<() => void>();

// Cross-tab real-time sync broadcast bus
const SYNC_CHANNEL_NAME = "spotlight_pos_cross_tab_bus";
let broadcastBus: BroadcastChannel | null = null;

export function normalizeCategory(cat: string): Category {
  const c = (cat || "").trim().toLowerCase();
  if (c === "starters" || c === "starter") return "starter";
  if (c === "biriyanis" || c === "briyani" || c === "biryani") return "biryani";
  if (c === "breads" || c === "bread") return "bread";
  if (c === "desserts" || c === "dessert") return "dessert";
  if (c === "beverages" || c === "beverage") return "beverage";
  if (c === "curries" || c === "curry") return "curry";
  if (c === "chinese & noodles" || c === "chinese") return "chinese";
  if (c === "fried rice & fast food" || c === "rice") return "rice";
  if (c === "combos & buckets" || c === "combos") return "combos";
  if (c === "kushka") return "kushka";
  return c;
}

export function cleanDishName(name: string): string {
  let n = (name || "").trim();
  // Standardize common variant names
  if (/^chicken\s*65\s*\(\s*starters\s*\)$/i.test(n)) return "Chicken 65";
  if (/^kushka\s*\(\s*plain\s*biriyani\s*kuska\s*\)$/i.test(n)) return "Kushka (Plain)";
  if (/^pepper\s*chicken\s*dry$/i.test(n)) return "Pepper Chicken";
  // Remove extra multiple spaces
  n = n.replace(/\s+/g, " ");
  return n;
}

export function sanitizeAndDeduplicateItems(items: Item[]): Item[] {
  if (!Array.isArray(items)) return [];
  const seen = new Map<string, Item>();
  for (const item of items) {
    if (!item || !item.name) continue;
    const cleanName = cleanDishName(item.name);
    const cleanCat = normalizeCategory(item.category);
    const key = cleanName.toLowerCase().replace(/\s+/g, " ");

    const sanitizedItem: Item = {
      ...item,
      name: cleanName,
      category: cleanCat,
      price: Number(item.price) || 0,
      onlinePrice: Number(item.onlinePrice) || Math.round((Number(item.price) || 0) * 1.28),
      cost: Number(item.cost) || Math.round((Number(item.price) || 0) * 0.45),
      active: item.active !== false,
    };

    if (!seen.has(key)) {
      seen.set(key, sanitizedItem);
    } else {
      const prev = seen.get(key)!;
      // Prefer authoritative IDs (like slb- prefix) or actively priced items
      if (sanitizedItem.id && sanitizedItem.id.startsWith("slb-") && !prev.id.startsWith("slb-")) {
        seen.set(key, sanitizedItem);
      }
    }
  }
  return Array.from(seen.values());
}

if (typeof window !== "undefined") {
  if ("BroadcastChannel" in window) {
    try {
      broadcastBus = new BroadcastChannel(SYNC_CHANNEL_NAME);
      broadcastBus.onmessage = (event) => {
        if (event.data?.type === "SLB_STORE_UPDATED") {
          cache = null;
          listeners.forEach((l) => l());
        }
      };
    } catch {
      // fallback to storage event
    }
  }

  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

function notifyAllTabs() {
  try {
    broadcastBus?.postMessage({ type: "SLB_STORE_UPDATED", timestamp: Date.now() });
  } catch {
    // broadcast fallback
  }
}

export function getDB(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = seed());
  let needsPersist = false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as DB;
    } else {
      cache = seed();
      needsPersist = true;
    }
  } catch {
    cache = seed();
    needsPersist = true;
  }
  if (!cache.settings.printerSettings) {
    cache.settings.printerSettings = { ...DEFAULT_PRINTER_SETTINGS };
    needsPersist = true;
  }
  if (!cache.settings.dailyBatchCapacity) {
    cache.settings.dailyBatchCapacity = { taramani: 160, adyar: 120, velachery: 100 };
    needsPersist = true;
  }
  const tmBranch = cache.branches?.find((b) => b.id === "taramani" || b.id === "tharamani");
  if (tmBranch && (tmBranch.phone === "+91 90000 00001" || !tmBranch.phone)) {
    tmBranch.phone = "+91 98844 30710";
    needsPersist = true;
  }

  // Phase 2 State Initialization
  if (!cache.tables || !Array.isArray(cache.tables) || cache.tables.length === 0) {
    cache.tables = [...DEFAULT_TABLES];
    needsPersist = true;
  }
  if (!cache.tenants || !Array.isArray(cache.tenants) || cache.tenants.length === 0) {
    cache.tenants = [...DEFAULT_TENANTS];
    needsPersist = true;
  } else {
    // Migration: ensure every tenant has complete module flags
    cache.tenants.forEach((t) => {
      if (!t.enabledModules) {
        t.enabledModules = {
          billing: true,
          tables: true,
          kds: true,
          stock: true,
          reports: true,
          menu: true,
          loyalty: true,
          dynamicUpi: true,
          zReport: true,
          multiBranch: true,
          aggregators: true,
        };
        needsPersist = true;
      }
      if (t.enabledModules.multiBranch === undefined) {
        t.enabledModules.multiBranch = true;
        needsPersist = true;
      }
      if (t.enabledModules.aggregators === undefined) {
        t.enabledModules.aggregators = true;
        needsPersist = true;
      }
    });
  }
  if (!cache.kdsOrders || !Array.isArray(cache.kdsOrders)) {
    cache.kdsOrders = [];
    needsPersist = true;
  }
  if (!cache.shiftCloses || !Array.isArray(cache.shiftCloses)) {
    cache.shiftCloses = [];
    needsPersist = true;
  }
  if (!cache.settings.upiId) {
    cache.settings.upiId = "spotlightbiriyani@oksbi";
    needsPersist = true;
  }
  if (!cache.saasPlatformName) {
    cache.saasPlatformName = "RestoPulse";
    needsPersist = true;
  }

  // Auto-deduplicate and normalize dishes permanently
  if (Array.isArray(cache.items) && cache.items.length > 0) {
    const cleaned = sanitizeAndDeduplicateItems(cache.items);
    if (cleaned.length !== cache.items.length) {
      cache.items = cleaned;
      needsPersist = true;
    }
  }
  if (needsPersist) {
    persist();
  }
  return cache;
}

function persist() {
  if (typeof window === "undefined" || !cache) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (err) {
    console.error("Failed to persist POS state to localStorage:", err);
  }
}

export function setDB(mutate: (db: DB) => void) {
  const db = getDB();
  mutate(db);
  // Guarantee items are always sanitized and deduplicated
  if (Array.isArray(db.items)) {
    db.items = sanitizeAndDeduplicateItems(db.items);
  }
  // Ensure array references are fresh copies so React triggers instant re-renders
  if (Array.isArray(db.sales)) db.sales = [...db.sales];
  if (Array.isArray(db.items)) db.items = [...db.items];
  if (Array.isArray(db.stock)) db.stock = [...db.stock];
  cache = { ...db };
  persist();
  notifyAllTabs();
  listeners.forEach((l) => l());
}

export function resetDB() {
  cache = seed();
  persist();
  notifyAllTabs();
  listeners.forEach((l) => l());
}

export function exportJSON() {
  return JSON.stringify(getDB(), null, 2);
}

export function importJSON(raw: string) {
  cache = JSON.parse(raw) as DB;
  persist();
  notifyAllTabs();
  listeners.forEach((l) => l());
}

/** Subscribe to the store. Returns a client-hydrated snapshot (null on server). */
export function useDB(): DB | null {
  const [db, setLocal] = useState<DB | null>(null);
  useEffect(() => {
    const sync = () => {
      const current = getDB();
      setLocal({ ...current, sales: [...current.sales] });
    };
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return db;
}

/* --------------------------------- helpers -------------------------------- */

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const dayKey = (iso: string) => iso.slice(0, 10);

export function filterSales(db: DB, opts: { days?: number; branchId?: string; channel?: ChannelId | "all" }) {
  const from = opts.days ? Date.now() - opts.days * 864e5 : 0;
  return db.sales.filter(
    (s) =>
      new Date(s.date).getTime() >= from &&
      (!opts.branchId || opts.branchId === "all" || s.branchId === opts.branchId) &&
      (!opts.channel || opts.channel === "all" || s.channel === opts.channel),
  );
}

export function totals(sales: Sale[]) {
  const t = { orders: sales.length, revenue: 0, cogs: 0, commission: 0, packaging: 0, discount: 0, profit: 0 };
  for (const s of sales) {
    t.revenue += s.net;
    t.cogs += s.cogs;
    t.commission += s.commission;
    t.packaging += s.packaging;
    t.discount += s.discount;
    t.profit += s.profit;
  }
  return t;
}

export function itemBreakdown(sales: Sale[]) {
  const map = new Map<string, { name: string; itemId: string; qty: number; revenue: number; profit: number }>();
  for (const s of (sales || [])) {
    if (!s || !Array.isArray(s.lines)) continue;
    for (const l of s.lines) {
      if (!l || !l.name) continue;
      const canonicalKey = l.name.trim().toLowerCase();
      const existing = map.get(canonicalKey);
      const price = Number(l.price) || 0;
      const cost = Number(l.cost) || 0;
      const qty = Number(l.qty) || 0;
      if (existing) {
        existing.qty += qty;
        existing.revenue += price * qty;
        existing.profit += (price - cost) * qty;
      } else {
        map.set(canonicalKey, {
          name: l.name.trim(),
          itemId: l.itemId || canonicalKey,
          qty,
          revenue: price * qty,
          profit: (price - cost) * qty,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty);
}

/* ---------------- Phase 2 Enterprise Operations & Helpers ---------------- */

/**
 * Customer Loyalty & VIP Regular lookup based on 10-digit mobile phone number.
 */
export function getCustomerLoyalty(sales: Sale[], phone: string) {
  const clean = (phone || "").replace(/\D/g, "").slice(-10);
  if (!clean || clean.length < 10) return null;
  const customerSales = (sales || []).filter((s) => {
    const p = (s.customerPhone || "").replace(/\D/g, "").slice(-10);
    return p === clean;
  });
  const visitCount = customerSales.length;
  const totalSpent = customerSales.reduce((acc, s) => acc + (s.net || 0), 0);
  const isVip = visitCount >= 3;
  return {
    phone: clean,
    visitCount,
    totalSpent,
    isVip,
    suggestedDiscountPct: isVip ? 10 : 0,
    lastVisit: customerSales[0]?.date,
  };
}

/**
 * Occupy or update active tab for a table.
 */
export function setTableOrder(tableId: string, lines: SaleLine[], phone?: string, notes?: string) {
  setDB((d) => {
    if (!d.tables) d.tables = [...DEFAULT_TABLES];
    const t = d.tables.find((tbl) => tbl.id === tableId);
    if (t) {
      t.lines = lines;
      if (phone) t.customerPhone = phone;
      if (notes) t.notes = notes;
      t.status = lines.length > 0 ? "occupied" : "available";
      if (!t.openedAt) t.openedAt = new Date().toISOString();
    }
  });
}

/**
 * Reset table to available after billing.
 */
export function vacateTable(tableId: string) {
  setDB((d) => {
    if (!d.tables) return;
    const t = d.tables.find((tbl) => tbl.id === tableId);
    if (t) {
      t.lines = [];
      delete t.customerPhone;
      delete t.customerName;
      delete t.notes;
      delete t.openedAt;
      delete t.lastKotAt;
      t.kotCount = 0;
      t.status = "available";
    }
  });
}

/**
 * Add or update an order on the Kitchen Display System (KDS).
 */
export function addKdsOrder(order: Omit<KdsOrder, "createdAt" | "status">) {
  setDB((d) => {
    if (!d.kdsOrders) d.kdsOrders = [];
    const newKds: KdsOrder = {
      ...order,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    d.kdsOrders.unshift(newKds);
  });
}

/**
 * Update KDS order status (pending -> preparing -> ready -> completed).
 */
export function updateKdsStatus(orderId: string, status: KdsStatus) {
  setDB((d) => {
    if (!d.kdsOrders) return;
    const order = d.kdsOrders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
    }
  });
}

/**
 * Toggle checkmark for an item on the kitchen tablet screen.
 */
export function toggleKdsLineDone(orderId: string, lineIndex: number) {
  setDB((d) => {
    if (!d.kdsOrders) return;
    const order = d.kdsOrders.find((o) => o.id === orderId);
    if (order && order.lines[lineIndex]) {
      order.lines[lineIndex].done = !order.lines[lineIndex].done;
    }
  });
}

/**
 * Record a Cashier Day-End Z-Report Shift Close.
 */
export function recordShiftClose(close: Omit<ShiftDayClose, "id" | "closedAt">) {
  const newClose: ShiftDayClose = {
    ...close,
    id: `z_${Date.now()}`,
    closedAt: new Date().toISOString(),
  };
  setDB((d) => {
    if (!d.shiftCloses) d.shiftCloses = [];
    d.shiftCloses.unshift(newClose);
  });
  return newClose;
}

/**
 * Get the currently active TenantConfig.
 */
export function getActiveTenant(db?: DB | null): TenantConfig {
  const currentDB = db ?? getDB();
  const tenants = currentDB.tenants && currentDB.tenants.length > 0 ? currentDB.tenants : DEFAULT_TENANTS;
  const activeId = currentDB.activeTenantId || "spotlight-biriyani";
  const found = tenants.find((t) => t.id === activeId);
  return found ?? tenants[0] ?? DEFAULT_TENANTS[0]!;
}

/**
 * Multi-Tenant Switcher (Used exclusively by Developer Super-Admin).
 */
export function switchClientTenant(tenantId: string) {
  setDB((d) => {
    if (!d.tenants || d.tenants.length === 0) d.tenants = [...DEFAULT_TENANTS];
    const tenant = d.tenants.find((t) => t.id === tenantId);
    if (tenant) {
      d.activeTenantId = tenant.id;
      d.settings.businessName = tenant.businessName;
      d.settings.gstPct = tenant.gstPct;
      if (tenant.upiId) d.settings.upiId = tenant.upiId;
      if (d.branches && d.branches[0]) {
        d.branches[0].name = tenant.activeBranchName;
        d.branches[0].phone = tenant.phone;
        d.branches[0].address = tenant.address;
      }
      if (d.settings.printerSettings) {
        d.settings.printerSettings.gstin = tenant.gstin;
        d.settings.printerSettings.fssaiNumber = tenant.fssai;
      }
    }
  });
}

/**
 * Update an existing Tenant's profile, credentials, and modules.
 */
export function updateTenant(updated: TenantConfig) {
  setDB((d) => {
    if (!d.tenants) d.tenants = [...DEFAULT_TENANTS];
    const idx = d.tenants.findIndex((t) => t.id === updated.id);
    if (idx >= 0) {
      d.tenants[idx] = { ...updated };
    } else {
      d.tenants.push({ ...updated });
    }
    // If updating active tenant, update active settings as well
    if (d.activeTenantId === updated.id) {
      d.settings.businessName = updated.businessName;
      d.settings.gstPct = updated.gstPct;
      if (updated.upiId) d.settings.upiId = updated.upiId;
      if (d.branches && d.branches[0]) {
        d.branches[0].name = updated.activeBranchName;
        d.branches[0].phone = updated.phone;
        d.branches[0].address = updated.address;
      }
      if (d.settings.printerSettings) {
        d.settings.printerSettings.gstin = updated.gstin;
        d.settings.printerSettings.fssaiNumber = updated.fssai;
      }
    }
  });
}

/**
 * Provision a new client restaurant tenant.
 */
export function addTenant(newTenant: TenantConfig) {
  setDB((d) => {
    if (!d.tenants) d.tenants = [...DEFAULT_TENANTS];
    d.tenants.push(newTenant);
  });
}

/**
 * Delete a client restaurant tenant (prevent deleting if only 1 remains).
 */
export function deleteTenant(tenantId: string): boolean {
  let deleted = false;
  setDB((d) => {
    if (!d.tenants) d.tenants = [...DEFAULT_TENANTS];
    if (d.tenants.length <= 1) return;
    d.tenants = d.tenants.filter((t) => t.id !== tenantId);
    if (d.activeTenantId === tenantId) {
      d.activeTenantId = d.tenants[0]?.id || "spotlight-biriyani";
      const nextTenant = d.tenants[0];
      if (nextTenant) {
        d.settings.businessName = nextTenant.businessName;
      }
    }
    deleted = true;
  });
  return deleted;
}

/**
 * Update master SaaS brand name (e.g. RestoPulse, DinePulse, RestoSwift).
 */
export function setSaasBrand(brandName: string) {
  setDB((d) => {
    d.saasPlatformName = brandName.trim();
  });
}

/**
 * Toggle a feature module for a specific tenant.
 */
export function toggleTenantModule(tenantId: string, moduleKey: keyof TenantModules) {
  setDB((d) => {
    if (!d.tenants) d.tenants = [...DEFAULT_TENANTS];
    const tenant = d.tenants.find((t) => t.id === tenantId);
    if (tenant && tenant.enabledModules) {
      tenant.enabledModules[moduleKey] = !tenant.enabledModules[moduleKey];
    }
  });
}

export function dailySeries(sales: Sale[], days: number) {
  const buckets = new Map<string, { day: string; revenue: number; profit: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const k = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    buckets.set(k, { day: k.slice(5), revenue: 0, profit: 0, orders: 0 });
  }
  for (const s of sales) {
    const b = buckets.get(dayKey(s.date));
    if (!b) continue;
    b.revenue += s.net;
    b.profit += s.profit;
    b.orders += 1;
  }
  return [...buckets.values()];
}

/**
 * Simple, explainable forecast: weighted moving average of the last 4 same
 * weekdays (recent weeks weigh more: 40% W1 + 30% W2 + 20% W3 + 10% W4).
 * Used for "how many plates to prep tomorrow".
 *
 * Intelligent Fallback: If restaurant is newly opened or has < 4 weeks of data,
 * uses average daily sales across recorded days with a weekend surge buffer
 * so the chef never sees an unhelpful "0 plates" for actively selling dishes.
 */
export function forecastQty(sales: Sale[], itemId: string, targetDate = new Date()) {
  const weekday = targetDate.getDay();
  const weights = [0.4, 0.3, 0.2, 0.1];
  let total = 0;
  let used = 0;
  const matchItem = (l: SaleLine) =>
    l.itemId === itemId ||
    (l.name && l.name.trim().toLowerCase() === itemId.trim().toLowerCase());

  for (let w = 0; w < 4; w++) {
    const d = new Date(targetDate.getTime() - (w + 1) * 7 * 864e5);
    if (d.getDay() !== weekday) continue;
    const key = d.toISOString().slice(0, 10);
    const qty = (sales || [])
      .filter((s) => s && dayKey(s.date) === key)
      .reduce((sum, s) => sum + (s.lines || []).filter(matchItem).reduce((q, l) => q + (l.qty || 0), 0), 0);
    total += qty * weights[w]!;
    used += weights[w]!;
  }

  const weightedForecast = used ? Math.ceil(total / used) : 0;
  if (weightedForecast > 0) return weightedForecast;

  // Smart fallback for new restaurants / initial weeks:
  // Calculate average daily sales across recorded active days in recent history (up to last 14 days)
  const recentDays = new Set<string>();
  let recentTotal = 0;
  const cutoffTime = targetDate.getTime() - 14 * 864e5;

  (sales || []).forEach((s) => {
    if (!s || !s.date) return;
    const sTime = new Date(s.date).getTime();
    if (sTime >= cutoffTime && sTime <= targetDate.getTime()) {
      const dk = dayKey(s.date);
      recentDays.add(dk);
      const itemQty = (s.lines || [])
        .filter(matchItem)
        .reduce((sum, l) => sum + (l.qty || 0), 0);
      recentTotal += itemQty;
    }
  });

  if (recentDays.size > 0 && recentTotal > 0) {
    const dailyAvg = recentTotal / recentDays.size;
    // Friday (5), Saturday (6), Sunday (0) volume surge buffer (+20%), weekday (+5% buffer)
    const isWeekend = weekday === 0 || weekday === 5 || weekday === 6;
    const multiplier = isWeekend ? 1.2 : 1.05;
    return Math.max(1, Math.ceil(dailyAvg * multiplier));
  }

  return 0;
}
