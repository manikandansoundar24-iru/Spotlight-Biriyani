/**
 * Spot Light Biriyani — local data layer.
 *
 * Everything is stored in the browser (localStorage) so the app works offline
 * at the counter with zero setup. Swap `read`/`write` for API/Cloud calls later
 * (see docs/ARCHITECTURE.md) without touching any UI code.
 */
import { useEffect, useState } from "react";

/* ---------------------------------- types --------------------------------- */

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  upiId?: string | undefined;
  gstin?: string | undefined;
  fssai?: string | undefined;
};

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
  tenantId?: string | undefined;
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
  customFooter: "Freshly cooked twice daily - No reheats",
};

/* --- Phase 2 Enterprise Types --- */

export type TableStatus = "available" | "occupied" | "billed";
export type TableSection = "ac" | "non-ac" | "outdoor";

export type TableSession = {
  id: string; // "T1", "T2", ... "T8", "O1", "O2"
  name: string; // "Table 1 (Window)", etc.
  capacity: number; // 2, 4, 6
  status: TableStatus;
  section?: TableSection;
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
  updatedAt?: string | undefined;
  status: KdsStatus;
  notes?: string | undefined;
  lines: { name: string; qty: number; done?: boolean | undefined }[];
  tenantId?: string | undefined;
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
  branches?: Branch[] | undefined;
  items?: Item[] | undefined;
  stock?: StockItem[] | undefined;
  enabledModules: TenantModules;
};

export const DEFAULT_TABLES: TableSession[] = [
  // A/C Family Hall
  { id: "A1", name: "A/C Table 1", capacity: 4, section: "ac", status: "available", lines: [] },
  { id: "A2", name: "A/C Table 2", capacity: 4, section: "ac", status: "available", lines: [] },
  { id: "A3", name: "A/C Table 3 (Family)", capacity: 6, section: "ac", status: "available", lines: [] },
  { id: "A4", name: "A/C Table 4 (Couple)", capacity: 2, section: "ac", status: "available", lines: [] },

  // Non-A/C Main Dining Hall
  { id: "T1", name: "Table 1 (Window)", capacity: 2, section: "non-ac", status: "available", lines: [] },
  { id: "T2", name: "Table 2 (Window)", capacity: 2, section: "non-ac", status: "available", lines: [] },
  { id: "T3", name: "Table 3 (Center)", capacity: 4, section: "non-ac", status: "available", lines: [] },
  { id: "T4", name: "Table 4 (Center)", capacity: 4, section: "non-ac", status: "available", lines: [] },
  { id: "T5", name: "Table 5 (Booth)", capacity: 4, section: "non-ac", status: "available", lines: [] },
  { id: "T6", name: "Table 6 (Family)", capacity: 6, section: "non-ac", status: "available", lines: [] },
  { id: "T7", name: "Table 7 (High Top)", capacity: 4, section: "non-ac", status: "available", lines: [] },
  { id: "T8", name: "Table 8 (High Top)", capacity: 2, section: "non-ac", status: "available", lines: [] },

  // Outdoor Open Lawn / Balcony
  { id: "O1", name: "Outdoor 1 (Patio)", capacity: 4, section: "outdoor", status: "available", lines: [] },
  { id: "O2", name: "Outdoor 2 (Patio)", capacity: 4, section: "outdoor", status: "available", lines: [] },
  { id: "O3", name: "Outdoor 3 (Garden)", capacity: 6, section: "outdoor", status: "available", lines: [] },
  { id: "O4", name: "Outdoor 4 (Garden)", capacity: 4, section: "outdoor", status: "available", lines: [] },
];

export const MANAM_DEFAULT_ITEMS: Item[] = [
  // --- BIRIYANI VARIETIES (Seeraga Samba Traditional) ---
  { id: "mnm-bir-1", name: "Seeraga Samba Plain Biriyani / Kushka (Half)", category: "biryani", price: 120, onlinePrice: 155, cost: 45, active: true },
  { id: "mnm-bir-2", name: "Seeraga Samba Plain Biriyani / Kushka (Full)", category: "biryani", price: 140, onlinePrice: 179, cost: 55, active: true },
  { id: "mnm-bir-3", name: "Egg Biriyani (Half)", category: "biryani", price: 140, onlinePrice: 179, cost: 55, active: true },
  { id: "mnm-bir-4", name: "Egg Biriyani (Full)", category: "biryani", price: 160, onlinePrice: 199, cost: 65, active: true },
  { id: "mnm-bir-5", name: "Chicken Biriyani (Seeraga Samba)", category: "biryani", price: 200, onlinePrice: 249, cost: 95, active: true },
  { id: "mnm-bir-6", name: "Chicken 65 Biriyani", category: "biryani", price: 220, onlinePrice: 269, cost: 105, active: true },
  { id: "mnm-bir-7", name: "Kadai 65 Biriyani", category: "biryani", price: 200, onlinePrice: 249, cost: 95, active: true },
  { id: "mnm-bir-8", name: "Mutton Seeraga Samba Biriyani", category: "biryani", price: 280, onlinePrice: 349, cost: 155, active: true },

  // --- MEALS & THALI ---
  { id: "mnm-mls-1", name: "Non-Veg Meals (Fish, Chicken & Mutton Gravies)", category: "meals", price: 180, onlinePrice: 229, cost: 80, active: true },
  { id: "mnm-mls-2", name: "Plain Meals (Steamed Rice, Sambar, Rasam, Curd)", category: "meals", price: 90, onlinePrice: 119, cost: 35, active: true },

  // --- PAROTTA VARIETIES ---
  { id: "mnm-prt-1", name: "Plain Parotta (1 Pc)", category: "parotta", price: 32, onlinePrice: 42, cost: 10, active: true },
  { id: "mnm-prt-2", name: "Chapathi (2 Pcs)", category: "parotta", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-prt-3", name: "Nool Parotta", category: "parotta", price: 40, onlinePrice: 55, cost: 14, active: true },
  { id: "mnm-prt-4", name: "Veechu Parotta (Plain)", category: "parotta", price: 50, onlinePrice: 65, cost: 18, active: true },
  { id: "mnm-prt-5", name: "Veechu Parotta (Egg)", category: "parotta", price: 80, onlinePrice: 105, cost: 30, active: true },
  { id: "mnm-prt-6", name: "Lappa (Egg)", category: "parotta", price: 140, onlinePrice: 179, cost: 50, active: true },
  { id: "mnm-prt-7", name: "Lappa (Non-Veg / Chicken)", category: "parotta", price: 210, onlinePrice: 260, cost: 90, active: true },
  { id: "mnm-prt-8", name: "Ceylon Parotta (Egg)", category: "parotta", price: 120, onlinePrice: 155, cost: 45, active: true },
  { id: "mnm-prt-9", name: "Ceylon Parotta (Chicken / Mutton)", category: "parotta", price: 185, onlinePrice: 235, cost: 80, active: true },
  { id: "mnm-prt-10", name: "Kothu Parotta (Veg)", category: "parotta", price: 130, onlinePrice: 165, cost: 45, active: true },
  { id: "mnm-prt-11", name: "Kothu Parotta (Egg)", category: "parotta", price: 165, onlinePrice: 209, cost: 60, active: true },
  { id: "mnm-prt-12", name: "Kothu Parotta (Chicken)", category: "parotta", price: 220, onlinePrice: 269, cost: 95, active: true },
  { id: "mnm-prt-13", name: "Kothu Parotta (Mutton)", category: "parotta", price: 250, onlinePrice: 310, cost: 120, active: true },

  // --- NON-VEGETARIAN STARTER & GRAVY ---
  { id: "mnm-nv-1", name: "Chicken 65 (Boneless)", category: "starter", price: 180, onlinePrice: 229, cost: 80, active: true },
  { id: "mnm-nv-2", name: "Kadai 65", category: "starter", price: 170, onlinePrice: 219, cost: 75, active: true },
  { id: "mnm-nv-3", name: "Chicken Lollipop", category: "starter", price: 210, onlinePrice: 265, cost: 90, active: true },
  { id: "mnm-nv-4", name: "Chettinad Chicken Chukka (Dry / Gravy)", category: "starter", price: 220, onlinePrice: 275, cost: 95, active: true },
  { id: "mnm-nv-5", name: "Chicken Pepper Roast / Gravy", category: "starter", price: 220, onlinePrice: 275, cost: 95, active: true },
  { id: "mnm-nv-6", name: "Chicken Ghee Roast", category: "starter", price: 230, onlinePrice: 289, cost: 105, active: true },
  { id: "mnm-nv-7", name: "Madurai Chicken Kulambu", category: "curry", price: 220, onlinePrice: 275, cost: 95, active: true },
  { id: "mnm-nv-8", name: "Naatukozhi Chukka", category: "starter", price: 260, onlinePrice: 320, cost: 125, active: true },
  { id: "mnm-nv-9", name: "Naatukozhi Pepper Roast", category: "starter", price: 260, onlinePrice: 320, cost: 125, active: true },
  { id: "mnm-nv-10", name: "Nallaennai Naatukozhi Kulambu", category: "curry", price: 260, onlinePrice: 320, cost: 125, active: true },
  { id: "mnm-nv-11", name: "Pichupotta Naatukozhi Roast", category: "starter", price: 260, onlinePrice: 320, cost: 125, active: true },
  { id: "mnm-nv-12", name: "Madurai Mutton Chukka", category: "starter", price: 240, onlinePrice: 299, cost: 120, active: true },
  { id: "mnm-nv-13", name: "Mutton Ellumbu Kulambu", category: "curry", price: 240, onlinePrice: 299, cost: 110, active: true },
  { id: "mnm-nv-14", name: "Madurai Mutton Kulambu", category: "curry", price: 240, onlinePrice: 299, cost: 115, active: true },
  { id: "mnm-nv-15", name: "Vanchiram Fish Fry", category: "starter", price: 210, onlinePrice: 269, cost: 95, active: true },
  { id: "mnm-nv-16", name: "Fish Kulambu", category: "curry", price: 140, onlinePrice: 179, cost: 60, active: true },
  { id: "mnm-nv-17", name: "Prawn 65", category: "starter", price: 210, onlinePrice: 269, cost: 95, active: true },
  { id: "mnm-nv-18", name: "Prawn Masala (Gravy / Dry)", category: "curry", price: 240, onlinePrice: 299, cost: 110, active: true },

  // --- VEGETARIAN STARTER & GRAVY ---
  { id: "mnm-vg-1", name: "Gobi 65", category: "starter", price: 110, onlinePrice: 145, cost: 40, active: true },
  { id: "mnm-vg-2", name: "Paneer 65", category: "starter", price: 150, onlinePrice: 189, cost: 60, active: true },
  { id: "mnm-vg-3", name: "Mushroom 65", category: "starter", price: 140, onlinePrice: 179, cost: 55, active: true },
  { id: "mnm-vg-4", name: "Paneer / Mushroom Gravy", category: "curry", price: 190, onlinePrice: 239, cost: 75, active: true },
  { id: "mnm-vg-5", name: "Crispy Baby Corn", category: "starter", price: 150, onlinePrice: 189, cost: 60, active: true },

  // --- DOSA VARIETIES ---
  { id: "mnm-dos-1", name: "Plain Dosa / Kal Dosa", category: "dosa", price: 70, onlinePrice: 95, cost: 22, active: true },
  { id: "mnm-dos-2", name: "Podi / Onion / Egg Roast", category: "dosa", price: 110, onlinePrice: 145, cost: 38, active: true },
  { id: "mnm-dos-3", name: "Uthappam", category: "dosa", price: 80, onlinePrice: 105, cost: 26, active: true },
  { id: "mnm-dos-4", name: "Ghee Roast Dosa", category: "dosa", price: 120, onlinePrice: 155, cost: 42, active: true },
  { id: "mnm-dos-5", name: "Chicken Kari Dosa", category: "dosa", price: 240, onlinePrice: 299, cost: 105, active: true },
  { id: "mnm-dos-6", name: "Mutton Kari Dosa", category: "dosa", price: 240, onlinePrice: 299, cost: 115, active: true },

  // --- EGG VARIETIES ---
  { id: "mnm-egg-1", name: "Kalakki (Plain / Masala / Onion)", category: "egg", price: 40, onlinePrice: 55, cost: 14, active: true },
  { id: "mnm-egg-2", name: "Half Boil / Full Boil", category: "egg", price: 20, onlinePrice: 30, cost: 8, active: true },
  { id: "mnm-egg-3", name: "Chicken Omelette (2 Eggs)", category: "egg", price: 85, onlinePrice: 110, cost: 32, active: true },

  // --- RICE & NOODLES ---
  { id: "mnm-chn-1", name: "Fried Rice (Veg)", category: "chinese", price: 140, onlinePrice: 179, cost: 50, active: true },
  { id: "mnm-chn-2", name: "Fried Rice (Egg)", category: "chinese", price: 170, onlinePrice: 215, cost: 65, active: true },
  { id: "mnm-chn-3", name: "Fried Rice (Mushroom / Paneer)", category: "chinese", price: 170, onlinePrice: 215, cost: 68, active: true },
  { id: "mnm-chn-4", name: "Fried Rice (Chicken)", category: "chinese", price: 200, onlinePrice: 249, cost: 85, active: true },
  { id: "mnm-chn-5", name: "Noodles (Veg)", category: "chinese", price: 140, onlinePrice: 179, cost: 50, active: true },
  { id: "mnm-chn-6", name: "Noodles (Egg)", category: "chinese", price: 160, onlinePrice: 205, cost: 60, active: true },
  { id: "mnm-chn-7", name: "Noodles (Chicken)", category: "chinese", price: 200, onlinePrice: 249, cost: 85, active: true },
  { id: "mnm-chn-8", name: "Schezwan Rice / Noodles (Chicken Extra)", category: "chinese", price: 220, onlinePrice: 275, cost: 95, active: true },

  // --- GRILL CHICKEN (Manam Special Menu) ---
  { id: "mnm-grl-1", name: "Half Grill Chicken", category: "grill", price: 200, onlinePrice: 255, cost: 90, active: true },
  { id: "mnm-grl-2", name: "Full Grill Chicken", category: "grill", price: 350, onlinePrice: 429, cost: 165, active: true },

  // --- SHAWARMA ROLLS (Manam Special Menu) ---
  { id: "mnm-shw-1", name: "Regular Shawarma Roll", category: "shawarma", price: 99, onlinePrice: 129, cost: 40, active: true },
  { id: "mnm-shw-2", name: "Peri Peri Shawarma Roll", category: "shawarma", price: 109, onlinePrice: 139, cost: 44, active: true },
  { id: "mnm-shw-3", name: "Schezwan Shawarma Roll", category: "shawarma", price: 109, onlinePrice: 139, cost: 44, active: true },
  { id: "mnm-shw-4", name: "Cheese Shawarma Roll", category: "shawarma", price: 119, onlinePrice: 149, cost: 48, active: true },
  { id: "mnm-shw-5", name: "Full Meat Shawarma Roll", category: "shawarma", price: 130, onlinePrice: 165, cost: 55, active: true },

  // --- SHAWARMA PLATTERS ---
  { id: "mnm-shw-6", name: "Regular Shawarma Platter", category: "shawarma", price: 160, onlinePrice: 205, cost: 68, active: true },
  { id: "mnm-shw-7", name: "Peri Peri Shawarma Platter", category: "shawarma", price: 179, onlinePrice: 225, cost: 75, active: true },
  { id: "mnm-shw-8", name: "Schezwan Shawarma Platter", category: "shawarma", price: 179, onlinePrice: 225, cost: 75, active: true },
  { id: "mnm-shw-9", name: "Cheese Shawarma Platter", category: "shawarma", price: 189, onlinePrice: 239, cost: 80, active: true },
  { id: "mnm-shw-10", name: "Full Meat Shawarma Platter", category: "shawarma", price: 199, onlinePrice: 249, cost: 85, active: true },

  // --- DIPS ---
  { id: "mnm-dip-1", name: "Extra Garlic Mayonnaise Dip", category: "dips", price: 20, onlinePrice: 25, cost: 6, active: true },
  { id: "mnm-dip-2", name: "Manam OG House Dip", category: "dips", price: 20, onlinePrice: 25, cost: 6, active: true },
  { id: "mnm-dip-3", name: "Peri Peri Spicy Dip", category: "dips", price: 20, onlinePrice: 25, cost: 6, active: true },

  // --- BEVERAGES & SODAS ---
  { id: "mnm-bev-1", name: "Packaged Mineral Water Bottle (1L)", category: "beverage", price: 20, onlinePrice: 20, cost: 10, active: true },
  { id: "mnm-bev-2", name: "Pepsi / Coke Can", category: "beverage", price: 40, onlinePrice: 45, cost: 25, active: true },
  { id: "mnm-bev-3", name: "Fresh Pineapple Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-bev-4", name: "Blueberry Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 14, active: true },
  { id: "mnm-bev-5", name: "Orange Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-bev-6", name: "Grape Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-bev-7", name: "Mango Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-bev-8", name: "Traditional Paneer Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },
  { id: "mnm-bev-9", name: "Fresh Lemon Soda", category: "beverage", price: 40, onlinePrice: 50, cost: 10, active: true },
  { id: "mnm-bev-10", name: "Ginger Soda", category: "beverage", price: 40, onlinePrice: 55, cost: 12, active: true },

  // --- DESSERTS & ICE CREAMS ---
  { id: "mnm-ice-1", name: "Tender Coconut Ice Cream", category: "dessert", price: 60, onlinePrice: 79, cost: 22, active: true },
  { id: "mnm-ice-2", name: "Sitaphal (Custard Apple) Ice Cream", category: "dessert", price: 60, onlinePrice: 79, cost: 22, active: true },
  { id: "mnm-ice-3", name: "Fig & Honey Ice Cream", category: "dessert", price: 70, onlinePrice: 89, cost: 25, active: true },
  { id: "mnm-ice-4", name: "Traditional Hot Bread Halwa", category: "dessert", price: 80, onlinePrice: 105, cost: 28, active: true },
];

export const MANAM_DEFAULT_STOCK: StockItem[] = [
  { id: "mnm-stk-1", name: "Seeraga Samba Rice", unit: "kg", qty: 140, reorderLevel: 40, costPerUnit: 95 },
  { id: "mnm-stk-2", name: "Tender Farm Chicken", unit: "kg", qty: 50, reorderLevel: 25, costPerUnit: 210 },
  { id: "mnm-stk-3", name: "Fresh Mutton (Curry Cut)", unit: "kg", qty: 20, reorderLevel: 15, costPerUnit: 780 },
  { id: "mnm-stk-4", name: "Parotta Maida Flour", unit: "kg", qty: 60, reorderLevel: 20, costPerUnit: 42 },
  { id: "mnm-stk-5", name: "Shawarma Whole Chicken", unit: "kg", qty: 30, reorderLevel: 10, costPerUnit: 220 },
  { id: "mnm-stk-6", name: "Onion (Bellary & Sambar)", unit: "kg", qty: 65, reorderLevel: 25, costPerUnit: 38 },
  { id: "mnm-stk-7", name: "Country Tomato", unit: "kg", qty: 35, reorderLevel: 15, costPerUnit: 32 },
  { id: "mnm-stk-8", name: "Pure Cow Ghee", unit: "L", qty: 12, reorderLevel: 6, costPerUnit: 640 },
  { id: "mnm-stk-9", name: "Fresh Malai Paneer", unit: "kg", qty: 15, reorderLevel: 5, costPerUnit: 340 },
  { id: "mnm-stk-10", name: "Refined Sunflower Oil", unit: "L", qty: 40, reorderLevel: 20, costPerUnit: 125 },
  { id: "mnm-stk-11", name: "Tandoori Spices & Curd", unit: "kg", qty: 16, reorderLevel: 8, costPerUnit: 160 },
  { id: "mnm-stk-12", name: "Eco Packing Box & Covers", unit: "pcs", qty: 450, reorderLevel: 200, costPerUnit: 8 },
];

export const SPOTLIGHT_DEFAULT_STOCK: StockItem[] = [
  { id: "slb-stk-1", name: "Basmati Rice", unit: "kg", qty: 120, reorderLevel: 40, costPerUnit: 92 },
  { id: "slb-stk-2", name: "Chicken", unit: "kg", qty: 45, reorderLevel: 25, costPerUnit: 210 },
  { id: "slb-stk-3", name: "Mutton", unit: "kg", qty: 18, reorderLevel: 15, costPerUnit: 780 },
  { id: "slb-stk-4", name: "Onion", unit: "kg", qty: 60, reorderLevel: 25, costPerUnit: 38 },
  { id: "slb-stk-5", name: "Tomato", unit: "kg", qty: 30, reorderLevel: 15, costPerUnit: 32 },
  { id: "slb-stk-6", name: "Refined Oil", unit: "L", qty: 35, reorderLevel: 20, costPerUnit: 128 },
  { id: "slb-stk-7", name: "Ghee", unit: "L", qty: 8, reorderLevel: 6, costPerUnit: 620 },
  { id: "slb-stk-8", name: "Biriyani Masala", unit: "kg", qty: 6, reorderLevel: 4, costPerUnit: 480 },
  { id: "slb-stk-9", name: "Curd", unit: "kg", qty: 12, reorderLevel: 8, costPerUnit: 60 },
  { id: "slb-stk-10", name: "Packing Box (Full)", unit: "pcs", qty: 400, reorderLevel: 200, costPerUnit: 9 },
  { id: "slb-stk-11", name: "Carry Bag", unit: "pcs", qty: 700, reorderLevel: 300, costPerUnit: 3 },
  { id: "slb-stk-12", name: "LPG Cylinder", unit: "pcs", qty: 3, reorderLevel: 2, costPerUnit: 1850 },
];

export const DEFAULT_TENANTS: TenantConfig[] = [
  {
    id: "manam-restaurant",
    businessName: "Manam Restaurant",
    tagline: "Authentic Multi-Cuisine Family Dining & Late Night Kitchen (Open till 4 AM)",
    activeBranchName: "Velachery (Opp. Phoenix Market City)",
    phone: "+91 98400 99887",
    address: "1st Floor, Nagendran Nagar, No 53, Velachery Main Rd, Opp. PHOENIX MARKET CITY, Velachery, Chennai - 600042",
    gstin: "33AABCM1234F1Z8",
    fssai: "12424008000777",
    upiId: "manamrestaurant@okhdfcbank",
    gstPct: 5,
    cuisineType: "Multi-Cuisine & Family Dining",
    degBatchEnabled: true,
    currencySymbol: "₹",
    loginUsername: "owner@manam.in",
    loginPassword: "manam2026",
    cashierPin: "4001",
    kitchenPin: "5555",
    items: MANAM_DEFAULT_ITEMS,
    stock: MANAM_DEFAULT_STOCK,
    branches: [
      {
        id: "velachery-phoenix",
        name: "Velachery (Opp. Phoenix Market City)",
        address: "1st Floor, Nagendran Nagar, No 53, Velachery Main Rd, Opp. PHOENIX MARKET CITY, Velachery, Chennai - 600042",
        phone: "+91 98400 99887",
      },
    ],
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
    stock: SPOTLIGHT_DEFAULT_STOCK,
    branches: [
      {
        id: "taramani",
        name: "Taramani (Flagship)",
        address: "No 6/31, Kazhikundram, Tharamani, Chennai 600113",
        phone: "+91 98844 30710",
      },
      { id: "adyar", name: "Adyar", address: "Lattice Bridge Road, Adyar, Chennai", phone: "+91 90000 00002" },
      { id: "velachery", name: "Velachery", address: "100 Feet Road, Velachery, Chennai", phone: "+91 90000 00003" },
    ],
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
    branches: [
      {
        id: "tnagar",
        name: "T. Nagar (Main)",
        address: "45, Usman Road, T. Nagar, Chennai - 600017",
        phone: "+91 98765 43210",
      },
    ],
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
  { id: "parotta", label: "Parotta Varieties" },
  { id: "starter", label: "Starters & Fry" },
  { id: "curry", label: "Curries & Gravies" },
  { id: "grill", label: "Grill & Tandoori" },
  { id: "shawarma", label: "Shawarma & Rolls" },
  { id: "dosa", label: "Dosa Varieties" },
  { id: "meals", label: "Meals & Thali" },
  { id: "egg", label: "Egg Varieties" },
  { id: "chinese", label: "Chinese & Noodles" },
  { id: "rice", label: "Fried Rice & Fast Food" },
  { id: "bread", label: "Breads" },
  { id: "dessert", label: "Desserts & Ice Cream" },
  { id: "beverage", label: "Beverages & Sodas" },
  { id: "dips", label: "Dips & Sauces" },
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
export function getLiveBatchStatus(db: DB, branchId?: string, tenantId?: string) {
  const defaultCapacityMap: Record<string, number> = {
    taramani: 160,
    adyar: 120,
    velachery: 100,
    "velachery-phoenix": 120,
  };
  const activeT = getActiveTenant(db);
  const currentTenantId = tenantId || activeT.id || db.activeTenantId || "spotlight-biriyani";
  const currentBranchId =
    branchId ||
    (activeT.branches && activeT.branches.some((b) => b.id === db.settings.activeBranchId)
      ? db.settings.activeBranchId
      : activeT.branches?.[0]?.id) ||
    "main";

  const cap =
    db.settings?.dailyBatchCapacity?.[currentBranchId] ??
    db.settings?.dailyBatchCapacity?.[currentTenantId] ??
    (defaultCapacityMap[currentBranchId] || 120);

  const sales = Array.isArray(db.sales) ? db.sales : [];
  const hour = new Date().getHours();
  
  let chickenSold = 0;
  let muttonSold = 0;
  let kushkaSold = 0;
  let eggSold = 0;

  const soldToday = sales
    .filter((s) => {
      if (!s || typeof s.date !== "string") return false;
      const matchTenant = s.tenantId ? s.tenantId === currentTenantId : currentTenantId === "spotlight-biriyani";
      if (!matchTenant) return false;
      const matchBranch =
        !s.branchId ||
        s.branchId === currentBranchId ||
        (currentBranchId === "taramani" && s.branchId === "tharamani") ||
        Boolean(activeT.branches && activeT.branches.some((b) => b.id === s.branchId));
      return matchBranch && isSameDay(s.date);
    })
    .reduce((acc, s) => {
      let bPlates = 0;
      (s.lines || []).forEach((l) => {
        const n = (l?.name || "").toLowerCase();
        const cat = ((l as any)?.category || "").toLowerCase();
        const qty = l?.qty || 1;
        const isBiryaniName = n.includes("biriyani") || n.includes("biryani") || n.includes("briyani");
        const isBiryaniOrKushka = isBiryaniName || n.includes("kushka") || cat === "biryani" || cat === "kushka";

        if (isBiryaniOrKushka) {
          if (n.includes("chicken")) {
            chickenSold += qty;
          } else if (n.includes("mutton")) {
            muttonSold += qty;
          } else if (n.includes("kushka")) {
            kushkaSold += qty;
          } else if (n.includes("egg")) {
            eggSold += qty;
          } else {
            chickenSold += qty;
          }
          bPlates += qty;
        }
      });
      return acc + bPlates;
    }, 0);

  const platesLeft = Math.max(0, cap - soldToday);

  // Configurable or proportional capacity estimates for deg items
  const customSplit =
    db.settings?.batchSplit?.[currentBranchId] || db.settings?.batchSplit?.[currentTenantId];
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
  tenantId?: string;
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
    tenantId: input.tenantId || (cache?.activeTenantId || "spotlight-biriyani"),
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

  window.addEventListener("slb_store_updated", () => {
    listeners.forEach((l) => l());
  });
}

function notifyAllTabs() {
  try {
    broadcastBus?.postMessage({ type: "SLB_STORE_UPDATED", timestamp: Date.now() });
  } catch {
    // broadcast fallback
  }
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("slb_store_updated", { detail: Date.now() }));
    } catch {
      // custom event fallback
    }
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
  } else {
    // Migration: ensure every existing table has a section and missing default sections are merged
    const tbls = cache.tables;
    let tablesChanged = false;
    tbls.forEach((tbl) => {
      if (!tbl.section) {
        if (tbl.id.startsWith("A")) tbl.section = "ac";
        else if (tbl.id.startsWith("O")) tbl.section = "outdoor";
        else tbl.section = "non-ac";
        tablesChanged = true;
      }
    });
    // If cache only has old 10 tables without A/C (A1-A4), merge missing default tables in
    DEFAULT_TABLES.forEach((defTbl) => {
      if (!tbls.some((t) => t.id === defTbl.id)) {
        tbls.push({ ...defTbl });
        tablesChanged = true;
      }
    });
    if (tablesChanged) needsPersist = true;
  }
  if (!cache.tenants || !Array.isArray(cache.tenants) || cache.tenants.length === 0) {
    cache.tenants = [...DEFAULT_TENANTS];
    needsPersist = true;
  } else {
    const tenantsList = cache.tenants;
    // Migration: ensure every default tenant (like Manam) is present and synced
    DEFAULT_TENANTS.forEach((dt) => {
      const cur = tenantsList.find((t) => t.id === dt.id || (dt.id === "manam-restaurant" && t.id === "manam"));
      if (!cur) {
        tenantsList.push({ ...dt });
        needsPersist = true;
      } else {
        let changed = false;
        if (cur.id === "manam") { cur.id = "manam-restaurant"; changed = true; }
        if (!cur.loginUsername) { cur.loginUsername = dt.loginUsername; changed = true; }
        if (!cur.loginPassword) { cur.loginPassword = dt.loginPassword; changed = true; }
        if (!cur.cashierPin) { cur.cashierPin = dt.cashierPin; changed = true; }
        if (!cur.kitchenPin) { cur.kitchenPin = dt.kitchenPin; changed = true; }
        if (!cur.branches || cur.branches.length === 0) { cur.branches = dt.branches; changed = true; }
        if (!cur.address && dt.address) { cur.address = dt.address; changed = true; }
        if (!cur.phone && dt.phone) { cur.phone = dt.phone; changed = true; }
        if (!cur.activeBranchName && dt.activeBranchName) { cur.activeBranchName = dt.activeBranchName; changed = true; }
        if (!cur.items || cur.items.length < (dt.items?.length || 0)) { if (dt.items) cur.items = [...dt.items]; changed = true; }
        if (!cur.stock || cur.stock.length === 0 || ((cur.id === "manam-restaurant" || cur.id === "manam") && cur.stock.some((s) => s.name === "Basmati Rice"))) {
          if (cur.id === "manam-restaurant" || cur.id === "manam") {
            cur.stock = [...MANAM_DEFAULT_STOCK];
          } else if (dt.stock) {
            cur.stock = [...dt.stock];
          }
          changed = true;
        }
        if (cur.degBatchEnabled === undefined && dt.degBatchEnabled !== undefined) {
          cur.degBatchEnabled = dt.degBatchEnabled;
          changed = true;
        }
        if (changed) needsPersist = true;
      }
    });

    // Migration: ensure every tenant has complete module flags
    tenantsList.forEach((t) => {
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
  if (!cache.saasPlatformName || cache.saasPlatformName === "RestroStack") {
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
  if (Array.isArray(db.kdsOrders)) db.kdsOrders = db.kdsOrders.map((o) => ({ ...o, lines: (o.lines || []).map((l) => ({ ...l })) }));
  if (Array.isArray(db.tables)) db.tables = db.tables.map((t) => ({ ...t, lines: [...(t.lines || [])] }));
  if (Array.isArray(db.tenants)) db.tenants = [...db.tenants];
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
      setLocal({
        ...current,
        sales: [...(current.sales || [])],
        items: [...(current.items || [])],
        tables: (current.tables || []).map((t) => ({ ...t, lines: [...(t.lines || [])] })),
        kdsOrders: (current.kdsOrders || []).map((o) => ({ ...o, lines: (o.lines || []).map((l) => ({ ...l })) })),
        tenants: (current.tenants || []).map((t) => ({
          ...t,
          enabledModules: { ...t.enabledModules },
          branches: (t.branches || []).map((b) => ({ ...b })),
        })),
      });
    };
    sync();
    listeners.add(sync);

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = null;
        sync();
      }
    };
    const onCustom = () => {
      sync();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("slb_store_updated", onCustom);

    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("slb_store_updated", onCustom);
    };
  }, []);
  return db;
}

/* --------------------------------- helpers -------------------------------- */

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const dayKey = (iso: string) => iso.slice(0, 10);

export function filterSales(
  db: DB,
  opts: { days?: number; branchId?: string; channel?: ChannelId | "all"; tenantId?: string },
) {
  const from = opts.days ? Date.now() - opts.days * 864e5 : 0;
  const currentTenant = getActiveTenant(db);
  const targetTenantId = opts.tenantId || currentTenant.id;
  return db.sales.filter((s) => {
    if (!s || !s.date) return false;
    const matchTenant = s.tenantId ? s.tenantId === targetTenantId : targetTenantId === "spotlight-biriyani";
    if (!matchTenant) return false;
    const matchTime = new Date(s.date).getTime() >= from;
    const matchBranch = !opts.branchId || opts.branchId === "all" || s.branchId === opts.branchId;
    const matchChannel = !opts.channel || opts.channel === "all" || s.channel === opts.channel;
    return matchTime && matchBranch && matchChannel;
  });
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
 * Add a new table to the restaurant floor plan.
 */
export function addTable(newTable: TableSession) {
  setDB((d) => {
    if (!d.tables) d.tables = [...DEFAULT_TABLES];
    const exists = d.tables.some((t) => t.id.toLowerCase() === newTable.id.toLowerCase());
    if (exists) {
      throw new Error(`Table with ID "${newTable.id}" already exists`);
    }
    d.tables.push({
      ...newTable,
      lines: newTable.lines || [],
      status: newTable.status || "available",
      capacity: Number(newTable.capacity) || 4,
    });
  });
}

/**
 * Edit / Update an existing table's details (Name, Capacity, Section).
 */
export function updateTable(table: TableSession) {
  setDB((d) => {
    if (!d.tables) d.tables = [...DEFAULT_TABLES];
    const idx = d.tables.findIndex((t) => t.id === table.id);
    if (idx >= 0) {
      const cur = d.tables[idx];
      if (cur) {
        d.tables[idx] = {
          ...cur,
          ...table,
          capacity: Number(table.capacity) || cur.capacity,
        };
      }
    }
  });
}

/**
 * Delete a table from the floor plan.
 */
export function deleteTable(tableId: string) {
  setDB((d) => {
    if (!d.tables) return;
    d.tables = d.tables.filter((t) => t.id !== tableId);
  });
}

/**
 * Delete a single order from the Kitchen Display System (KDS).
 */
export function deleteKdsOrder(orderId: string) {
  setDB((d) => {
    if (!d.kdsOrders) return;
    d.kdsOrders = d.kdsOrders.filter((o) => o.id !== orderId);
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
 * Uses immutable mapping and fuzzy matching on ID, order number, table, or token.
 */
export function updateKdsStatus(orderId: string, status: KdsStatus) {
  setDB((d) => {
    if (!d.kdsOrders) return;
    const cleanTarget = String(orderId).replace("#", "").trim();
    d.kdsOrders = d.kdsOrders.map((o) => {
      const matches =
        o.id === orderId ||
        (o.orderNumber && (o.orderNumber === orderId || o.orderNumber.replace("#", "").trim() === cleanTarget)) ||
        (o.tokenNum !== undefined && String(o.tokenNum) === cleanTarget) ||
        (o.tableId && o.tableId === orderId);
      return matches ? { ...o, status, updatedAt: new Date().toISOString() } : { ...o };
    });
  });
}

/**
 * Toggle checkmark for an item on the kitchen tablet screen.
 */
export function toggleKdsLineDone(orderId: string, lineIndex: number) {
  setDB((d) => {
    if (!d.kdsOrders) return;
    const cleanTarget = String(orderId).replace("#", "").trim();
    d.kdsOrders = d.kdsOrders.map((o) => {
      const matches =
        o.id === orderId ||
        (o.orderNumber && (o.orderNumber === orderId || o.orderNumber.replace("#", "").trim() === cleanTarget)) ||
        (o.tokenNum !== undefined && String(o.tokenNum) === cleanTarget) ||
        (o.tableId && o.tableId === orderId);
      if (!matches) return { ...o };

      const updatedLines = o.lines.map((l, idx) => (idx === lineIndex ? { ...l, done: !l.done } : { ...l }));
      let newStatus = o.status;
      if (newStatus === "pending") {
        newStatus = "preparing";
      }
      const allDone = updatedLines.every((l) => l.done);
      if (allDone && newStatus !== "ready" && newStatus !== "completed") {
        newStatus = "ready";
      }
      return { ...o, lines: updatedLines, status: newStatus, updatedAt: new Date().toISOString() };
    });
  });
}

/**
 * Purge completed orders from the kitchen display system.
 */
export function clearCompletedKdsOrders() {
  setDB((d) => {
    if (!d.kdsOrders) return;
    d.kdsOrders = d.kdsOrders.filter((o) => o.status !== "completed");
  });
}

/**
 * Clear all orders from the kitchen display system (e.g. at day start / after shift close).
 */
export function clearAllKdsOrders(tenantId?: string) {
  setDB((d) => {
    if (!tenantId) {
      d.kdsOrders = [];
    } else {
      d.kdsOrders = (d.kdsOrders || []).filter((o) => o.tenantId && o.tenantId !== tenantId);
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
 * 1. URL search parameter (?tenant=xxx) — HIGHEST PRIORITY & 100% TAB-ISOLATED
 * 2. Tab-isolated sessionStorage ("restopulse_session_tenant")
 * 3. Fallback to currentDB.activeTenantId
 */
export function getActiveTenant(db?: DB | null): TenantConfig {
  const currentDB = db ?? getDB();
  const tenants = currentDB.tenants && currentDB.tenants.length > 0 ? currentDB.tenants : DEFAULT_TENANTS;
  let activeId: string | null = null;
  if (typeof window !== "undefined") {
    // 1. Highest priority: URL query param (?tenant=xxx) — completely immune to cross-tab pollution
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const paramTenant = searchParams.get("tenant");
      if (paramTenant && tenants.some((t) => t.id === paramTenant || (paramTenant === "manam" && t.id === "manam-restaurant"))) {
        activeId = paramTenant === "manam" ? "manam-restaurant" : paramTenant;
        sessionStorage.setItem("restopulse_session_tenant", activeId);
      }
    } catch {
      // ignore SSR or URL parsing errors
    }

    if (!activeId) {
      // 2. Tab-isolated sessionStorage
      const sessionTenant = sessionStorage.getItem("restopulse_session_tenant");
      if (sessionTenant && tenants.some((t) => t.id === sessionTenant || (sessionTenant === "manam" && t.id === "manam-restaurant"))) {
        activeId = sessionTenant === "manam" ? "manam-restaurant" : sessionTenant;
      }
    }
  }
  if (!activeId) {
    activeId = currentDB.activeTenantId || "spotlight-biriyani";
  }
  const found = tenants.find((t) => t.id === activeId || (activeId === "manam" && t.id === "manam-restaurant"));
  return found ?? tenants[0] ?? DEFAULT_TENANTS[0]!;
}

/**
 * Get items strictly for the active tenant.
 * Guarantees that each client restaurant's unique menu is isolated per tab.
 */
export function getTenantItems(db?: DB | null, tenant?: TenantConfig): Item[] {
  const activeT = tenant || getActiveTenant(db);
  if (activeT.items && activeT.items.length > 0) {
    return activeT.items;
  }
  const currentDB = db ?? getDB();
  if (activeT.id === "spotlight-biriyani") {
    return currentDB.items && currentDB.items.length > 0 ? currentDB.items : [];
  }
  const defaultMatch = DEFAULT_TENANTS.find((t) => t.id === activeT.id);
  if (defaultMatch?.items && defaultMatch.items.length > 0) {
    return defaultMatch.items;
  }
  return currentDB.items && currentDB.items.length > 0 ? currentDB.items : [];
}

/**
 * Get raw inventory stock strictly for the active tenant.
 * Prevents Biriyani Basmati Rice from leaking into Multi-Cuisine / other tenants.
 */
export function getTenantStock(db?: DB | null, tenant?: TenantConfig): StockItem[] {
  const activeT = tenant || getActiveTenant(db);
  if (activeT.id === "manam-restaurant" || activeT.id === "manam") {
    if (!activeT.stock || activeT.stock.length === 0 || activeT.stock.some((s) => s.name === "Basmati Rice")) {
      return MANAM_DEFAULT_STOCK;
    }
    return activeT.stock;
  }
  if (activeT.stock && activeT.stock.length > 0) {
    return activeT.stock;
  }
  const currentDB = db ?? getDB();
  return currentDB.stock && currentDB.stock.length > 0 ? currentDB.stock : SPOTLIGHT_DEFAULT_STOCK;
}

/**
 * Multi-Tenant Switcher (Used by Developer Super-Admin & Login Gateway).
 */
export function switchClientTenant(tenantId: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("restopulse_session_tenant", tenantId);
  }
  setDB((d) => {
    if (!d.tenants || d.tenants.length === 0) d.tenants = [...DEFAULT_TENANTS];
    const tenant = d.tenants.find((t) => t.id === tenantId);
    if (tenant) {
      d.activeTenantId = tenant.id;
      d.settings.businessName = tenant.businessName;
      d.settings.gstPct = tenant.gstPct;
      if (tenant.upiId) d.settings.upiId = tenant.upiId;
      if (tenant.items && tenant.items.length > 0) {
        d.items = [...tenant.items];
      }
      if (tenant.branches && tenant.branches.length > 0 && tenant.branches[0]) {
        d.branches = [...tenant.branches];
        d.settings.activeBranchId = tenant.branches[0].id;
      } else if (d.branches && d.branches[0]) {
        d.branches[0].name = tenant.activeBranchName;
        d.branches[0].phone = tenant.phone;
        d.branches[0].address = tenant.address;
        d.settings.activeBranchId = d.branches[0].id;
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
