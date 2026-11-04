import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Coins,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Flame,
  History,
  IceCream,
  Layers,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  PanelLeft,
  Pencil,
  Plus,
  PlusCircle,
  Printer,
  QrCode,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  Send,
  Soup,
  Sparkles,
  Ticket,
  Trash2,
  Utensils,
  UtensilsCrossed,
  Volume2,
  Wheat,
  X,
  ChefHat,
  Crown,
  DollarSign,
  CheckSquare,
  Square,
  UserCheck,
  Maximize2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  buildSale,
  CATEGORIES,
  DEFAULT_PRINTER_SETTINGS,
  DEFAULT_TABLES,
  getActiveTenant,
  getCustomerLoyalty,
  getLiveBatchStatus,
  inr,
  isSameDay,
  normalizeCategory,
  recordShiftClose,
  sanitizeAndDeduplicateItems,
  setDB,
  setTableOrder,
  updateKdsStatus,
  useDB,
  vacateTable,
  addKdsOrder,
  toggleKdsLineDone,
  type Category,
  type ChannelId,
  type Item,
  type PrinterSettings,
  type Sale,
  type SaleLine,
  type TableSession,
  type KdsOrder,
  type ShiftDayClose,
} from "@/lib/pos-store";
import { pushSalesToCloud } from "@/lib/neon-sync";

function renderCategoryIcon(catId: string, className = "size-3.5") {
  switch (catId) {
    case "biryani":
      return <Flame className={className} />;
    case "kushka":
      return <UtensilsCrossed className={className} />;
    case "starter":
      return <Sparkles className={className} />;
    case "chinese":
      return <Utensils className={className} />;
    case "rice":
      return <Wheat className={className} />;
    case "curry":
      return <Soup className={className} />;
    case "bread":
      return <Layers className={className} />;
    case "dessert":
      return <IceCream className={className} />;
    case "beverage":
      return <Coffee className={className} />;
    case "combos":
      return <Package className={className} />;
    case "all":
    default:
      return <LayoutGrid className={className} />;
  }
}

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [
      { title: "Billing Terminal — Spot Light Manager" },
      {
        name: "description",
        content: "Multi-item POS counter billing with custom items, live food cost, profit tracking & cash change calculator.",
      },
      { property: "og:title", content: "Billing Terminal — Spot Light Manager" },
      {
        property: "og:description",
        content: "Fast restaurant POS billing with channel pricing and live profit calculations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="surface-card mx-auto my-12 max-w-lg p-8 text-center shadow-lg border border-border">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
        <AlertCircle className="size-6" />
      </div>
      <h2 className="text-xl font-bold font-display">Billing Terminal Notice</h2>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {error?.message || "A minor display refresh is needed."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => {
            reset();
            window.location.reload();
          }}
          className="rounded-full bg-gradient-ember px-6 py-2.5 text-xs font-bold text-white shadow-ember hover:opacity-95"
        >
          🔄 Refresh Terminal
        </button>
      </div>
    </div>
  ),
  component: Billing,
});

/**
 * Synthesizes authentic POS audio effects using Web Audio API.
 * Supports: 'cash' (Ka-Ching / Chime) and 'print' (Gentle thermal paper feed).
 */
function playChime(type: "cash" | "print" = "cash", customStyle?: "kaching" | "triad" | "click" | "mute") {
  try {
    const style = customStyle || (typeof window !== "undefined" ? (localStorage.getItem("spotlight_pos_sound") || "kaching") : "kaching");
    if (style === "mute") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "cash") {
      if (style === "triad") {
        // Modern Apple Pay / GPay warm success triad (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (style === "click") {
        // Gentle mechanical click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else {
        // Authentic Cash Register Ka-Ching (Rich coin strike + brass chime)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();

        // High metallic register bell chime
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        osc1.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.06); // E6

        // Second resonant harmonic
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1567.98, ctx.currentTime); // G6
        osc2.frequency.exponentialRampToValueAtTime(2093.00, ctx.currentTime + 0.10); // C7

        // Coin strike overtone
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(2637.02, ctx.currentTime + 0.04); // E7
        osc3.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.15); // G7

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc3.start(ctx.currentTime + 0.04);
        osc1.stop(ctx.currentTime + 0.42);
        osc2.stop(ctx.currentTime + 0.42);
        osc3.stop(ctx.currentTime + 0.42);
      }
    } else {
      // Soft thermal printer receipt feed & cut (smooth dual-tone whisper click)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.08);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(480, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(360, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.10);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.10);
      osc2.stop(ctx.currentTime + 0.10);
    }
  } catch {
    // Ignore audio errors on unsupported environments
  }
}

function DishCard({
  item,
  inCartLine,
  liveBatch,
  price,
  canIncreaseDeg,
  onAdd,
  onStep,
  onUpdateQty,
  onBlurQty,
}: {
  item: Item;
  inCartLine?: SaleLine | undefined;
  liveBatch: any;
  price: number;
  canIncreaseDeg: boolean;
  onAdd: () => void;
  onStep: (delta: number) => void;
  onUpdateQty: (val: string) => void;
  onBlurQty: () => void;
}) {
  const inCartQty = inCartLine?.qty ?? 0;
  const isInCart = inCartLine !== undefined;

  const isDeg =
    (item.category || "").toLowerCase() === "biryani" ||
    (item.category || "").toLowerCase() === "kushka" ||
    item.name.toLowerCase().includes("biriyani") ||
    item.name.toLowerCase().includes("kushka");

  // Granular Deg batch breakdown per dish type (Chicken, Mutton, Kushka)
  const degStockLabel = useMemo(() => {
    if (!item.active) return "Off Menu";
    if (!isDeg) return null;
    const n = item.name.toLowerCase();
    const bd = liveBatch?.breakdown;
    if (n.includes("chicken")) {
      const left = bd?.chickenLeft ?? liveBatch.platesLeft;
      return left > 0 ? `${left} Chicken in Deg` : "Sold Out";
    }
    if (n.includes("mutton")) {
      const left = bd?.muttonLeft ?? 0;
      return left > 0 ? `${left} Mutton in Deg` : "Sold Out";
    }
    if (n.includes("kushka")) {
      return liveBatch.platesLeft > 0 ? "Deg Dum Rice" : "Sold Out";
    }
    return liveBatch.platesLeft > 0 ? `${liveBatch.platesLeft} Left in Deg` : "Sold Out";
  }, [isDeg, item.name, item.active, liveBatch]);

  const isSoldOut = !item.active || (isDeg && (liveBatch.platesLeft <= 0 || degStockLabel === "Sold Out"));

  return (
    <div
      className={`surface-card group relative p-3.5 text-left transition-all min-w-0 max-w-full overflow-hidden ${isSoldOut
          ? "opacity-60 bg-muted/20 border-border/40"
          : isInCart
            ? "border-primary/90 bg-primary/5 shadow-ember"
            : "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-card"
        }`}
    >
      <div
        className={isSoldOut ? "cursor-not-allowed" : "cursor-pointer"}
        onClick={() => !isSoldOut && onAdd()}
        title={isSoldOut ? (!item.active ? "Item marked Off Menu" : "Batch Sold Out") : "Click to add to bill"}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </p>
            {isDeg && (
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${liveBatch.platesLeft > 30
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : liveBatch.platesLeft > 10
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black animate-pulse"
                  }`}
              >
                <Flame className="size-2.5" />
                {degStockLabel}
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 font-display text-2xl text-primary">{inr(price)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Food cost {inr(item.cost)} ·{" "}
          <span className="text-success font-medium">Margin {inr(price - item.cost)}</span>
        </p>
      </div>

      {/* Direct Card Quantity Indicator & Step / Direct Type Controls */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
        {isInCart ? (
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-bold text-primary">
              {inCartQty > 0 ? `${inCartQty} in cart (${inr(price * inCartQty)})` : "Typing qty..."}
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStep(-1);
                }}
                className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Decrease"
              >
                <Minus className="size-3" />
              </button>
              <input
                type="number"
                min="1"
                value={inCartQty === 0 ? "" : inCartQty}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdateQty(e.target.value);
                }}
                onBlur={onBlurQty}
                className="w-12 text-center text-xs font-black bg-muted/40 rounded border border-border/80 focus:border-primary focus:bg-background focus:outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="Type quantity directly (e.g. 2, 5, 10, 25)"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStep(1);
                }}
                disabled={!canIncreaseDeg}
                className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Increase"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
        ) : isSoldOut ? (
          <div className="flex w-full items-center justify-center gap-1 text-xs font-bold text-rose-500 py-1">
            <AlertCircle className="size-3.5" /> {!item.active ? "Menu Sold Out" : "Batch Sold Out"}
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1"
          >
            <Plus className="size-3" /> Tap to Add
          </button>
        )}
      </div>
    </div>
  );
}

function Billing() {
  const db = useDB();
  const activeTenant = getActiveTenant(db);
  const [cat, setCat] = useState<Category | "all">("biryani");
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [channel, setChannel] = useState<ChannelId>("counter");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<Sale["payment"]>("cash");
  const [cashTendered, setCashTendered] = useState<number | "">("");
  const [lastTendered, setLastTendered] = useState<number | "">("");
  const [lastChange, setLastChange] = useState(0);
  const [orderNote, setOrderNote] = useState("");
  const [lastBill, setLastBill] = useState<Sale | null>(null);

  // Past Bills & Order History State
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [whatsappTargetBill, setWhatsappTargetBill] = useState<Sale | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyChannelFilter, setHistoryChannelFilter] = useState<"all" | ChannelId>("all");
  const [quickPhone, setQuickPhone] = useState("");

  // Phase 2 Enterprise State: Tables, KDS, UPI QR, Z-Report
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [kdsModalOpen, setKdsModalOpen] = useState(false);
  const [upiQrModalOpen, setUpiQrModalOpen] = useState(false);
  const [zReportModalOpen, setZReportModalOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [pettyCashExpenses, setPettyCashExpenses] = useState<number>(0);
  const [countedPhysicalCash, setCountedPhysicalCash] = useState<string>("");
  const [kdsFilter, setKdsFilter] = useState<"all" | "pending" | "preparing" | "ready">("all");

  // Category UI Layout Toggle ('top' | 'rail') — Default to Left Touch Rail for ergonomic counter billing
  const [categoryLayout, setCategoryLayout] = useState<"top" | "rail">("rail");

  // WhatsApp Receipt Modal State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Custom Item Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customCost, setCustomCost] = useState("");

  // POS Sound Style State ('kaching' | 'triad' | 'click' | 'mute')
  const [soundStyle, setSoundStyle] = useState<"kaching" | "triad" | "click" | "mute">(() => {
    if (typeof window === "undefined") return "kaching";
    return (localStorage.getItem("spotlight_pos_sound") as "kaching" | "triad" | "click" | "mute") || "kaching";
  });

  const changeSound = (s: "kaching" | "triad" | "click" | "mute") => {
    setSoundStyle(s);
    if (typeof window !== "undefined") {
      localStorage.setItem("spotlight_pos_sound", s);
    }
    if (s !== "mute") {
      playChime("cash", s);
    }
  };

  const preview = useMemo(() => {
    if (!db || !lines.length) return null;
    const activeLines = lines.filter((l) => l.qty > 0);
    if (!activeLines.length) return null;
    return buildSale({
      branchId: db.settings.activeBranchId,
      channel,
      lines: activeLines,
      discount,
      payment,
      channels: db.channels,
    });
  }, [db, lines, channel, discount, payment]);

  const [orderType, setOrderType] = useState<"dinein" | "takeaway">("dinein");

  // VIP Customer Loyalty Lookup (triggers on 10-digit phone number)
  const customerLoyalty = useMemo(() => {
    const p = (quickPhone.trim() || customerPhone.trim()).replace(/\D/g, "");
    if (p.length >= 10 && db?.sales) {
      return getCustomerLoyalty(db.sales, p);
    }
    return null;
  }, [quickPhone, customerPhone, db?.sales]);

  // Today's Sales History (most recent first for active branch)
  const todaySales = useMemo(() => {
    if (!db || !Array.isArray(db.sales)) return [];
    const activeBranch = db.settings.activeBranchId || "taramani";
    return db.sales
      .filter((s) => {
        if (!s || typeof s.date !== "string") return false;
        const matchBranch =
          s.branchId === activeBranch ||
          !s.branchId ||
          (activeBranch === "taramani" && s.branchId === "tharamani");
        return matchBranch && isSameDay(s.date);
      })
      .slice()
      .reverse();
  }, [db]);

  const todayCashTotal = useMemo(() => {
    return todaySales.filter((s) => s.payment === "cash").reduce((acc, s) => acc + (s.net || 0), 0);
  }, [todaySales]);

  const todayUpiTotal = useMemo(() => {
    return todaySales.filter((s) => s.payment === "upi").reduce((acc, s) => acc + (s.net || 0), 0);
  }, [todaySales]);

  const todayOtherTotal = useMemo(() => {
    return todaySales.filter((s) => s.payment !== "cash" && s.payment !== "upi").reduce((acc, s) => acc + (s.net || 0), 0);
  }, [todaySales]);

  const expectedCashInDrawer = openingFloat + todayCashTotal - pettyCashExpenses;
  const countedNum = Number(countedPhysicalCash) || 0;
  const drawerVariance = countedPhysicalCash === "" ? 0 : countedNum - expectedCashInDrawer;

  const filteredHistory = useMemo(() => {
    const rawSales = Array.isArray(db?.sales) ? db.sales : [];
    const source = (historySearch && historySearch.trim().length > 0)
      ? rawSales.slice().reverse()
      : todaySales;

    const rawQ = (historySearch || "").trim().toLowerCase();
    const cleanQ = rawQ.replace(/^#/, "");

    return source.filter((s) => {
      if (!s) return false;
      if (historyChannelFilter !== "all" && s.channel !== historyChannelFilter) return false;
      if (!rawQ) return true;
      try {
        const idStr = String(s.id || "").toLowerCase();
        const idMatch = idStr.includes(rawQ) || (cleanQ.length > 0 && idStr.includes(cleanQ));
        const dishMatch =
          Array.isArray(s.lines) &&
          s.lines.some((l) => {
            const name = String(l?.name || "").toLowerCase();
            return name.includes(rawQ) || (cleanQ.length > 0 && name.includes(cleanQ));
          });
        const payMatch = String(s.payment || "").toLowerCase().includes(rawQ);
        const netMatch = String(s.net || "").includes(cleanQ || rawQ);
        return Boolean(idMatch || dishMatch || payMatch || netMatch);
      } catch {
        return false;
      }
    });
  }, [db, todaySales, historyChannelFilter, historySearch]);

  const allCategories = useMemo(() => {
    const list: { id: Category | "all"; label: string }[] = [
      { id: "all", label: "All Dishes" },
      ...CATEGORIES,
    ];
    if (db?.items) {
      db.items.forEach((it) => {
        const normCat = normalizeCategory(it.category);
        if (!list.some((c) => c.id === normCat)) {
          const formattedLabel = normCat.charAt(0).toUpperCase() + normCat.slice(1);
          list.push({ id: normCat, label: formattedLabel });
        }
      });
    }
    return list;
  }, [db]);

  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    if (db?.items) {
      db.items.forEach((it) => {
        if (it.active) {
          counts["all"] = (counts["all"] || 0) + 1;
          const c = normalizeCategory(it.category || "other");
          counts[c] = (counts[c] || 0) + 1;
        }
      });
    }
    return counts;
  }, [db]);

  const liveBatch = useMemo(() => {
    if (!db) {
      return {
        cap: 120,
        soldToday: 0,
        platesLeft: 120,
        status: "Lunch Batch Open",
        isSoldOut: false,
        breakdown: {
          chickenSold: 0,
          muttonSold: 0,
          kushkaSold: 0,
          eggSold: 0,
          chickenCap: 72,
          muttonCap: 30,
          kushkaCap: 18,
          chickenLeft: 72,
          muttonLeft: 30,
          kushkaLeft: 18,
        },
      };
    }
    const activeBranch = db.settings.activeBranchId || "taramani";
    const statusInfo = getLiveBatchStatus(db, activeBranch);
    const cap = statusInfo.cap || 120;
    const platesLeft = statusInfo.platesLeft;
    const soldToday = Math.max(0, cap - platesLeft);
    return {
      cap,
      soldToday,
      platesLeft,
      status: statusInfo.status,
      isSoldOut: statusInfo.isSoldOut,
      breakdown: statusInfo.breakdown,
    };
  }, [db]);

  const isDegItem = (itemOrLine: { name?: string; category?: string } | null | undefined) => {
    if (!itemOrLine) return false;
    const n = (itemOrLine.name || "").toLowerCase();
    const c = (itemOrLine.category || "").toLowerCase();
    return c === "biryani" || c === "kushka" || n.includes("biriyani") || n.includes("kushka");
  };

  const currentCartDegPlates = useMemo(() => {
    return lines
      .filter((l) => isDegItem(l))
      .reduce((sum, l) => sum + (l.qty || 0), 0);
  }, [lines]);

  const isCartOverDeg = currentCartDegPlates > liveBatch.platesLeft;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [db?.settings.activeBranchId]);

  const [editBatchModalOpen, setEditBatchModalOpen] = useState(false);
  const [newBatchCapacity, setNewBatchCapacity] = useState("");
  const [newChickenCap, setNewChickenCap] = useState("");
  const [newMuttonCap, setNewMuttonCap] = useState("");

  const openEditBatch = () => {
    const activeBranch = db?.settings.activeBranchId || "taramani";
    const currentCap = db?.settings.dailyBatchCapacity?.[activeBranch] || 160;
    const currentSplit = db?.settings.batchSplit?.[activeBranch];
    const cCap = currentSplit?.chickenCap ?? Math.round(currentCap * 0.65);
    const mCap = currentSplit?.muttonCap ?? (currentCap - cCap);
    setNewBatchCapacity(String(currentCap));
    setNewChickenCap(String(cCap));
    setNewMuttonCap(String(mCap));
    setEditBatchModalOpen(true);
  };

  const handleSaveBatchCapacity = () => {
    const cVal = parseInt(newChickenCap, 10) || 0;
    const mVal = parseInt(newMuttonCap, 10) || 0;
    const totalVal = cVal + mVal > 0 ? cVal + mVal : parseInt(newBatchCapacity, 10);
    if (isNaN(totalVal) || totalVal <= 0) {
      toast.error("Please enter a valid plate count (e.g. 160)");
      return;
    }
    const finalChicken = cVal > 0 ? cVal : Math.round(totalVal * 0.65);
    const finalMutton = mVal > 0 ? mVal : (totalVal - finalChicken);
    const activeBranch = db?.settings.activeBranchId || "taramani";
    setDB((d) => {
      if (!d.settings.dailyBatchCapacity) {
        d.settings.dailyBatchCapacity = {};
      }
      if (!d.settings.batchSplit) {
        d.settings.batchSplit = {};
      }
      d.settings.dailyBatchCapacity[activeBranch] = totalVal;
      d.settings.batchSplit[activeBranch] = { chickenCap: finalChicken, muttonCap: finalMutton };
    });
    setEditBatchModalOpen(false);
    toast.success(`Updated today's Deg: ${totalVal} plates (${finalChicken} Chicken, ${finalMutton} Mutton)!`);
  };

  // Today's Token number counter (strictly synchronized with today's branch sales)
  const todayToken = useMemo(() => {
    return todaySales.length + 1;
  }, [todaySales]);

  const priceFor = (itemId: string) => {
    if (!db) return 0;
    const it = db.items.find((i) => i.id === itemId);
    if (!it) return 0;
    return channel === "counter" ? it.price : it.onlinePrice;
  };

  const add = (itemId: string) => {
    if (!db) return;
    const it = db.items.find((i) => i.id === itemId);
    if (!it) return;

    if (isDegItem(it)) {
      if (liveBatch.platesLeft <= 0) {
        toast.error("❌ Deg Batch Sold Out! No plates left in today's kitchen deg.");
        return;
      }
      if (currentCartDegPlates + 1 > liveBatch.platesLeft) {
        toast.error(`❌ Stock Limit: Only ${liveBatch.platesLeft} plates available in today's Deg (${currentCartDegPlates} already in cart)!`);
        return;
      }
    }

    setLines((prev) => {
      const found = prev.find((l) => l.itemId === itemId);
      if (found) return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId, name: it.name, qty: 1, price: priceFor(itemId), cost: it.cost }];
    });
  };

  const step = (itemId: string, delta: number) => {
    if (!db) return;
    const line = lines.find((l) => l.itemId === itemId);
    const it = db.items.find((i) => i.id === itemId);
    const isDeg = isDegItem(line) || isDegItem(it);

    if (delta > 0 && isDeg) {
      if (liveBatch.platesLeft <= 0) {
        toast.error("❌ Deg Batch Sold Out!");
        return;
      }
      if (currentCartDegPlates + delta > liveBatch.platesLeft) {
        toast.error(`❌ Stock Limit: Only ${liveBatch.platesLeft} plates available in today's Deg!`);
        return;
      }
    }

    setLines((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const updateQty = (itemId: string, newQtyRaw: number | string) => {
    if (!db) return;
    if (newQtyRaw === "" || newQtyRaw === 0) {
      // User is clearing the box to type a single digit (e.g. 5 or 6).
      // Keep line in cart with qty: 0 so the input box stays mounted!
      setLines((prev) =>
        prev.map((l) => (l.itemId === itemId ? { ...l, qty: 0 } : l))
      );
      return;
    }

    const parsed = typeof newQtyRaw === "string" ? parseInt(newQtyRaw, 10) : newQtyRaw;
    if (isNaN(parsed)) return;

    if (parsed <= 0) {
      setLines((prev) => prev.filter((l) => l.itemId !== itemId));
      return;
    }

    const currentLine = lines.find((l) => l.itemId === itemId);
    const it = db.items.find((i) => i.id === itemId);
    const isDeg = isDegItem(currentLine) || isDegItem(it);

    let finalQty = parsed;
    if (isDeg) {
      const otherDegPlates = lines
        .filter((l) => l.itemId !== itemId && isDegItem(l))
        .reduce((sum, l) => sum + (l.qty || 0), 0);
      const maxPossible = Math.max(0, liveBatch.platesLeft - otherDegPlates);
      if (finalQty > maxPossible) {
        finalQty = maxPossible;
        toast.warning(`⚠️ Stock capped: Only ${maxPossible} plates available in Deg!`);
      }
    }

    if (finalQty <= 0) {
      setLines((prev) => prev.filter((l) => l.itemId !== itemId));
      return;
    }

    setLines((prev) => {
      const found = prev.find((l) => l.itemId === itemId);
      if (found) {
        return prev.map((l) => (l.itemId === itemId ? { ...l, qty: finalQty } : l));
      }
      if (it) {
        return [...prev, { itemId, name: it.name, qty: finalQty, price: priceFor(itemId), cost: it.cost }];
      }
      return prev;
    });
  };

  const handleQtyBlur = (itemId: string) => {
    setLines((prev) => {
      const line = prev.find((l) => l.itemId === itemId);
      if (!line || line.qty <= 0) {
        return prev.filter((l) => l.itemId !== itemId);
      }
      return prev;
    });
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customPrice) {
      toast.error("Please enter item name and price");
      return;
    }
    const price = Number(customPrice);
    const cost = Number(customCost) || Math.round(price * 0.45);
    const customId = `custom-${Date.now()}`;
    setLines((prev) => [
      ...prev,
      { itemId: customId, name: customName.trim(), qty: 1, price, cost },
    ]);
    setCustomName("");
    setCustomPrice("");
    setCustomCost("");
    setCustomModalOpen(false);
    toast.success(`Added custom item: ${customName}`);
  };

  const changeChannel = (c: ChannelId) => {
    setChannel(c);
    setPayment(c === "counter" ? "cash" : "online");
    if (!db) return;
    setLines((prev) =>
      prev.map((l) => {
        const it = db.items.find((i) => i.id === l.itemId);
        if (!it) return l;
        return { ...l, price: c === "counter" ? it.price : it.onlinePrice };
      }),
    );
  };

  const startEditPastBill = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setLines(sale.lines.map((l) => ({ ...l })));
    setChannel(sale.channel);
    setPayment(sale.payment);
    setDiscount(sale.discount || 0);
    setOrderHistoryOpen(false);
    toast.info(`Loaded Bill into Cart! Change quantities or add dishes, then click "UPDATE & RE-PRINT BILL".`);
  };

  const cancelEdit = () => {
    setEditingSaleId(null);
    setLines([]);
    setDiscount(0);
    setCashTendered("");
    setOrderNote("");
    toast.info("Cancelled bill correction.");
  };

  const voidBill = (saleId: string) => {
    if (confirm("Are you sure you want to void / cancel this bill? This will remove it from today's sales and revenue.")) {
      setDB((d) => {
        d.sales = d.sales.filter((s) => s.id !== saleId);
      });
      if (lastBill?.id === saleId) {
        setLastBill(null);
      }
      toast.success("Bill voided successfully.");
    }
  };

  const triggerWhatsAppForBill = (sale: Sale) => {
    setWhatsappTargetBill(sale);
    setWhatsappModalOpen(true);
  };

  const triggerPrintForBill = (sale: Sale, tokenNum?: number) => {
    if (!db) return;
    playChime("print", soundStyle);
    const p = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;
    printBill(sale, db.settings.businessName, tokenNum || todayToken - 1, "", "", 0, p);
    toast.success(`Sent Bill to ${p.paperWidth} thermal printer`);
  };

  const saveOrUpdate = () => {
    if (!preview || !db) return;
    if (isCartOverDeg) {
      toast.error(`❌ Cannot place order: ${currentCartDegPlates} Deg plates in cart exceeds ${liveBatch.platesLeft} available plates!`);
      return;
    }
    const currentPreview = preview;
    const tender = cashTendered;
    const change = changeDue;
    const note = orderNote;

    if (editingSaleId) {
      // Correct existing bill with full audit trail
      let savedSaleForWa: Sale | null = null;
      setDB((d) => {
        const idx = d.sales.findIndex((s) => s.id === editingSaleId);
        if (idx !== -1) {
          const old = d.sales[idx];
          if (!old) return;
          const updatedSale: Sale = {
            ...currentPreview,
            id: editingSaleId,
            date: old.date,
            isEdited: true,
            originalNet: old.originalNet || old.net,
            editedAt: new Date().toISOString(),
            orderType,
          };
          d.sales[idx] = updatedSale;
          savedSaleForWa = updatedSale;
        }
      });
      if (savedSaleForWa) {
        pushSalesToCloud([savedSaleForWa]).catch((err) => console.warn("Background Neon push:", err));
      }
      playChime("cash", soundStyle);
      setLastBill(savedSaleForWa || currentPreview);
      setLastTendered(tender);
      setLastChange(change);
      setEditingSaleId(null);
      setLines([]);
      setDiscount(0);
      setCashTendered("");
      setOrderNote("");

      const p = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;
      printBill(savedSaleForWa || currentPreview, db.settings.businessName, todayToken - 1, note ? `${note} (CORRECTED)` : "(CORRECTED BILL)", tender, change, p);
      toast.success(`Bill updated & reprinted! ${inr(currentPreview.net)} · Profit ${inr(currentPreview.profit)}`);
      return savedSaleForWa || currentPreview;
    } else {
      // Normal new bill with service order type
      const currentToken = todayToken;
      const activeBranch = db.settings.activeBranchId || "taramani";
      const cleanCustomerPhone = (quickPhone.trim() || customerPhone.trim()).replace(/\D/g, "").slice(-10);
      const newSale: Sale = {
        ...currentPreview,
        id: currentPreview.id || Math.random().toString(36).slice(2, 10),
        date: new Date().toISOString(),
        branchId: activeBranch,
        orderType,
        kotToken: currentToken,
      };
      if (cleanCustomerPhone) newSale.customerPhone = cleanCustomerPhone;
      if (selectedTableId) newSale.tableId = selectedTableId;

      setDB((d) => {
        if (!Array.isArray(d.sales)) d.sales = [];
        d.sales.push(newSale);
      });
      pushSalesToCloud([newSale]).catch((err) => console.warn("Background Neon push:", err));

      // Push to Kitchen Display System (KDS)
      const kdsItem: Parameters<typeof addKdsOrder>[0] = {
        id: newSale.id,
        orderNumber: selectedTableId ? `Table ${selectedTableId}` : `#${currentToken}`,
        tokenNum: currentToken,
        orderType,
        channel,
        lines: newSale.lines.map((l) => ({ name: l.name, qty: l.qty })),
      };
      if (selectedTableId) kdsItem.tableId = selectedTableId;
      if (note) kdsItem.notes = note;
      addKdsOrder(kdsItem);

      // If billing a dine-in table, vacate table upon settlement
      if (selectedTableId) {
        vacateTable(selectedTableId);
        setSelectedTableId(null);
      }

      playChime("cash", soundStyle);
      setLastBill(newSale);
      setLastTendered(tender);
      setLastChange(change);
      setLines([]);
      setDiscount(0);
      setCashTendered("");
      setOrderNote("");

      const p = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;
      printBill(newSale, db.settings.businessName, currentToken, note, tender, change, p);
      toast.success(`Bill saved & sent to printer! Token #${currentToken} · ${inr(newSale.net)} · Profit ${inr(newSale.profit)}`, {
        icon: <Sparkles className="size-4 text-primary" />,
      });
      return newSale;
    }
  };

  const saveAndWhatsApp = () => {
    if (!preview) return;
    const target = saveOrUpdate();
    if (target) {
      setWhatsappTargetBill(target);
      setWhatsappModalOpen(true);
    }
  };

  const handleQuickWhatsApp = () => {
    if (!preview) return;
    const rawInput = quickPhone.trim() || customerPhone.trim();
    const cleanPhone = rawInput.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit customer mobile number before sending WhatsApp receipt");
      return;
    }
    const validPhone = cleanPhone.slice(-10);
    const target = saveOrUpdate();
    if (!target) return;

    const businessName = db?.settings?.businessName || "Spot Light Biriyani";
    const branch = db?.branches.find((b) => b.id === target.branchId) || db?.branches[0];
    const itemsText = target.lines.map((l) => `🍲 ${l.qty}x ${l.name} - ₹${l.price * l.qty}`).join("\n");
    const orderTypeStr = target.orderType === "takeaway" ? "🥡 TAKEAWAY / PARCEL" : (target.tableId ? `🍽️ DINE-IN (${target.tableId})` : "🍽️ DINE-IN");
    const msg = `Hi Customer, your ${businessName} bill is confirmed ✅\n\n*${businessName} — ${branch?.name || "Kitchen"}*\n📅 ${new Date(target.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}\n🔖 *${orderTypeStr}*\n${itemsText}\n💰 *₹${target.net}* · Paid via ${target.payment.toUpperCase()}\n📍 ${branch?.address || "Chennai"}\n📞 ${branch?.phone || ""}\nBill Ref: *#${target.id.slice(0, 6).toUpperCase()}*\n\n♨️ Thank you for dining with us! Visit again.`;

    const whatsappUrl = `https://wa.me/91${validPhone}?text=${encodeURIComponent(msg)}`;
    const w = window.open(whatsappUrl, "_blank");
    if (!w || w.closed || typeof w.closed === "undefined") {
      window.location.href = whatsappUrl;
    }
    toast.success(`WhatsApp receipt launched for +91 ${validPhone}!`);
    setQuickPhone("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        if (preview) {
          saveOrUpdate();
        } else {
          toast.info("Add items to bill before printing (F2)");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview, saveOrUpdate]);

  const items = useMemo(() => {
    if (!db?.items) return [];
    const sanitized = sanitizeAndDeduplicateItems(db.items);
    return sanitized.filter((i) => (cat === "all" ? true : normalizeCategory(i.category) === cat) && i.active);
  }, [db?.items, cat]);

  // Cash change computation
  const tenderNum = Number(cashTendered) || 0;
  const netDue = preview?.net ?? 0;
  const changeDue = tenderNum > netDue ? tenderNum - netDue : 0;

  if (!db) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading billing terminal…
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Top Header Bar — Guaranteed Single Line, No Stair-Step Wrapping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        {/* Left: Terminal Brand & Actions */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-wrap w-full sm:w-auto">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none">
              {db?.settings?.businessName || "Spot Light Biriyani"} · Billing Terminal
            </p>
            <h1 className="text-xl sm:text-3xl font-display font-black tracking-tight leading-none mt-1">COUNTER POS</h1>
          </div>

          <div className="h-9 w-px bg-border/60 hidden sm:block" />

          {/* Next Token on Mobile appears right next to COUNTER POS */}
          <div
            className="sm:hidden h-9 flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 text-xs font-black text-primary shadow-2xs tracking-wide shrink-0"
          >
            <Ticket className="size-3.5 text-primary shrink-0" />
            <span>Next Token #{todayToken}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto mt-1 sm:mt-0 flex-wrap">
            <button
              onClick={() => setOrderHistoryOpen(true)}
              className="flex-1 sm:flex-none h-10 sm:h-11 flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 sm:px-4 text-xs sm:text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-all shadow-2xs active:scale-98"
              title="View today's past bills, reprint receipts, re-send WhatsApp, or correct wrong bills"
            >
              <History className="size-4 text-primary shrink-0" />
              <span>Past Bills ({todaySales.length})</span>
            </button>

            {activeTenant.enabledModules.kds && (
              <button
                onClick={() => setKdsModalOpen(true)}
                className="flex-1 sm:flex-none h-10 sm:h-11 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 sm:px-4 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-2xs active:scale-98"
                title="Open Kitchen Display System (KDS) for kitchen chefs and tablet display"
              >
                <ChefHat className="size-4 text-amber-600 shrink-0" />
                <span>KDS Screen {((db?.kdsOrders || []).filter((o) => o.status !== "completed")).length > 0 && `(${((db?.kdsOrders || []).filter((o) => o.status !== "completed")).length})`}</span>
              </button>
            )}

            {activeTenant.enabledModules.zReport && (
              <button
                onClick={() => setZReportModalOpen(true)}
                className="flex-1 sm:flex-none h-10 sm:h-11 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 sm:px-4 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-2xs active:scale-98"
                title="Perform Day-End Cashier Z-Close & Cash Drawer Reconciliation"
              >
                <FileText className="size-4 text-emerald-600 shrink-0" />
                <span>Z-Report Day Close</span>
              </button>
            )}

            <button
              onClick={() => setCustomModalOpen(true)}
              className="flex-1 sm:flex-none h-10 sm:h-11 flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-3 sm:px-4 text-xs sm:text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-all shadow-2xs active:scale-98"
              title="Add an unlisted custom item or special order to the bill"
            >
              <PlusCircle className="size-4 text-primary shrink-0" />
              <span>+ Custom Item</span>
            </button>
          </div>
        </div>

        {/* Right: Next Token Dispatcher (on desktop) */}
        <div
          className="hidden sm:flex h-10 sm:h-11 items-center gap-2.5 rounded-xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 px-4 sm:px-5 text-xs sm:text-sm font-black text-primary shadow-xs tracking-wide shrink-0"
          title="Next live token ticket number to be printed"
        >
          <Ticket className="size-4 sm:size-4.5 text-primary shrink-0" />
          <span>Next Token #{todayToken}</span>
        </div>
      </div>

      {/* Active Correction Alert Banner */}
      {editingSaleId && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-600 animate-pulse shrink-0" />
            <span>
              <strong>Correcting Bill #{editingSaleId.slice(0, 6).toUpperCase()}</strong>: Adjust items, quantities, or discounts, then click <strong>UPDATE &amp; RE-PRINT BILL</strong>.
            </span>
          </div>
          <button
            onClick={cancelEdit}
            className="rounded-lg border border-amber-500/40 bg-card px-2.5 py-1 font-bold text-foreground hover:bg-amber-500/20 transition-colors"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Main 2-Column POS Workspace: Left = Kitchen Deg & Dishes, Right = Cart (Both Starting at Same Parallel Top) */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_380px] w-full min-w-0 max-w-full items-start">
        <div className="min-w-0 max-w-full">
          {/* Live Kitchen Deg Batch Availability Bar */}
          {(activeTenant.degBatchEnabled ?? true) && (
            <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card p-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Flame className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Today's Fresh Kitchen Deg Batch
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {liveBatch.platesLeft > 0 ? "Lunch Batch Active · Auto Decrements on Counter & Online Orders" : "Batch Sold Out · Next Cook Batch at 7:00 PM"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openEditBatch}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-2xs"
                    title="Enter or update today's cooked batch quantity (Chicken & Mutton Deg)"
                  >
                    <Pencil className="size-3" />
                    <span>Edit Deg Capacity</span>
                  </button>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${liveBatch.platesLeft > 30
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : liveBatch.platesLeft > 10
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                    }`}>
                    <span className="size-2 rounded-full bg-current animate-ping" />
                    {liveBatch.platesLeft > 0 ? `${liveBatch.platesLeft} Plates Left in Deg` : "SOLD OUT"}
                  </span>
                </div>
              </div>

              {/* 3 Quick-Grip Visual Stats */}
              <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-muted/40 p-2 border border-border/50 text-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Cooked in Deg</span>
                  <span className="text-lg sm:text-xl font-black font-display text-foreground">{liveBatch.cap}</span>
                  <span className="text-[10px] text-muted-foreground block">Plates</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Sold Today</span>
                  <span className="text-lg sm:text-xl font-black font-display text-primary">{liveBatch.soldToday}</span>
                  <span className="text-[10px] text-muted-foreground block">Counter + Online</span>
                </div>
                <div className={`rounded-xl p-2 border ${liveBatch.platesLeft > 30
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : liveBatch.platesLeft > 10
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}>
                  <span className="text-[10px] font-black uppercase tracking-wider block">Remaining Stock</span>
                  <span className="text-lg sm:text-xl font-black font-display">{liveBatch.platesLeft}</span>
                  <span className="text-[10px] font-bold block">Plates Available</span>
                </div>
              </div>

              {/* Visual Meter Bar */}
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                  <span>Depletion Rate: {liveBatch.soldToday} of {liveBatch.cap} plates sold</span>
                  <span className="font-mono text-foreground font-black">{Math.round((liveBatch.soldToday / liveBatch.cap) * 100)}% Consumed</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border/40">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${liveBatch.platesLeft > 30 ? "bg-emerald-500" : liveBatch.platesLeft > 10 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    style={{ width: `${Math.min(100, Math.round((liveBatch.soldToday / liveBatch.cap) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Deg Segment Breakdown: Chicken, Mutton, Egg, Kushka */}
              {liveBatch.breakdown && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-[11px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Flame className="size-3 text-primary" /> Deg Breakdown:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium border border-border/40">
                    <span className="font-bold text-foreground">Chicken Biriyani:</span> {liveBatch.breakdown.chickenSold} sold · <span className="text-primary font-bold">{liveBatch.breakdown.chickenLeft} left</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium border border-border/40">
                    <span className="font-bold text-foreground">Mutton Biriyani:</span> {liveBatch.breakdown.muttonSold} sold · <span className="text-primary font-bold">{liveBatch.breakdown.muttonLeft} left</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium border border-border/40">
                    <span className="font-bold text-foreground">Egg Biriyani:</span> {liveBatch.breakdown.eggSold} sold
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium border border-border/40">
                    <span className="font-bold text-foreground">Kushka Portions:</span> {liveBatch.breakdown.kushkaSold} sold
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Header & Category Layout Switcher */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Tap items to add. Tap multiple times or use the +/- buttons directly on each card.
            </p>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 text-[11px] font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setCategoryLayout("rail")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${categoryLayout === "rail" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                title="Left vertical touch rail (Fast counter layout)"
              >
                <PanelLeft className="size-3.5" />
                <span>Left Touch Rail</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryLayout("top")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${categoryLayout === "top" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                title="Horizontal category tab strip"
              >
                <LayoutGrid className="size-3.5" />
                <span>Top Tabs</span>
              </button>
            </div>
          </div>

          {/* Category Switcher & Dishes Layout (Top Ribbon vs Left Thumb Rail) */}
          {categoryLayout === "top" ? (
            <>
              {/* Top Ribbon Categories (Horizontal Scroll Strip) */}
              <div className="mt-3 w-full max-w-full min-w-0 overflow-hidden">
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar max-w-full">
                  {allCategories.map((c) => {
                    const count = categoryItemCounts[c.id] || 0;
                    const isSelected = cat === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCat(c.id)}
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-ember scale-[1.02]"
                            : "border-border bg-card/70 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
                          }`}
                      >
                        <span className="shrink-0">{renderCategoryIcon(c.id, "size-3.5")}</span>
                        <span>{c.label}</span>
                        <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dishes Grid (3 Columns) */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((i) => {
                  const inCart = lines.find((l) => l.itemId === i.id);
                  return (
                    <DishCard
                      key={i.id}
                      item={i}
                      price={priceFor(i.id)}
                      inCartLine={inCart}
                      liveBatch={liveBatch}
                      canIncreaseDeg={!isDegItem(i) || currentCartDegPlates < liveBatch.platesLeft}
                      onAdd={() => add(i.id)}
                      onStep={(d) => step(i.id, d)}
                      onUpdateQty={(val) => updateQty(i.id, val)}
                      onBlurQty={() => handleQtyBlur(i.id)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            /* Left Touch Rail Layout (Petpooja / Toast Style) */
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              {/* Left Touch Rail (Horizontal scrollable chips on mobile, vertical sidebar on desktop) */}
              <div className="w-full sm:w-36 lg:w-40 shrink-0 flex flex-row sm:flex-col gap-1.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[640px] pb-2 sm:pb-0 sm:pr-1.5 border-b sm:border-b-0 sm:border-r border-border/60">
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-0.5">
                  Categories
                </span>
                {allCategories.map((c) => {
                  const count = categoryItemCounts[c.id] || 0;
                  const isSelected = cat === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCat(c.id)}
                      className={`shrink-0 sm:w-full flex items-center justify-between gap-2 rounded-xl border p-2 text-left text-[11px] font-bold transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-ember scale-[1.01]"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0 text-primary">{renderCategoryIcon(c.id, "size-3.5")}</span>
                        <span className="truncate whitespace-nowrap">{c.label}</span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dishes Grid (2 Columns in Rail Mode) */}
              <div className="flex-1 min-w-0 grid gap-2.5 grid-cols-1 sm:grid-cols-2 self-start">
                {items.map((i) => {
                  const inCart = lines.find((l) => l.itemId === i.id);
                  return (
                    <DishCard
                      key={i.id}
                      item={i}
                      price={priceFor(i.id)}
                      inCartLine={inCart}
                      liveBatch={liveBatch}
                      canIncreaseDeg={!isDegItem(i) || currentCartDegPlates < liveBatch.platesLeft}
                      onAdd={() => add(i.id)}
                      onStep={(d) => step(i.id, d)}
                      onUpdateQty={(val) => updateQty(i.id, val)}
                      onBlurQty={() => handleQtyBlur(i.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Cart / Order Summary */}
        <aside id="pos-cart" className="surface-card h-fit p-4 lg:p-5 lg:sticky lg:top-24 w-full min-w-0 max-w-full overflow-hidden">
          {/* Order Service Type Toggle (Dine-in vs Takeaway/Parcel) */}
          <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1 text-xs mb-2.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setOrderType("dinein")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition-all ${orderType === "dinein"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              🍽️ Dine-in
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType("takeaway");
                setSelectedTableId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition-all ${orderType === "takeaway"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              🥡 Takeaway / Parcel
            </button>
          </div>

          {/* Dine-in Interactive Floor Plan & Table Bar */}
          {orderType === "dinein" && activeTenant.enabledModules.tables && (
            <div className="mb-2.5 rounded-xl border border-primary/30 bg-primary/5 p-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-primary uppercase tracking-wider">
                  <Utensils className="size-3" /> Select Table / Floor Plan:
                </span>
                {selectedTableId ? (
                  <span className="text-xs text-primary font-black">
                    Table {selectedTableId} Tab Active
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Tap table to assign</span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(db.tables || DEFAULT_TABLES).map((tbl) => {
                  const isSelected = selectedTableId === tbl.id;
                  const isOccupied = tbl.status === "occupied";
                  return (
                    <button
                      key={tbl.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTableId(null);
                        } else {
                          setSelectedTableId(tbl.id);
                          if (tbl.lines && tbl.lines.length > 0) {
                            setLines(tbl.lines);
                            if (tbl.customerPhone) setQuickPhone(tbl.customerPhone);
                            if (tbl.notes) setOrderNote(tbl.notes);
                            toast.info(`Loaded active tab for ${tbl.name}`);
                          }
                        }
                      }}
                      className={`rounded-lg py-1 px-1 text-center font-bold text-xs transition-all border flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : isOccupied
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/40 hover:bg-rose-500/20"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                      title={`${tbl.name} (${tbl.capacity} seats) · ${isOccupied ? "Occupied" : "Free"}`}
                    >
                      <span>{tbl.id}</span>
                      <span className={`size-1.5 rounded-full mt-0.5 ${isOccupied ? "bg-rose-500" : "bg-emerald-500"}`} />
                    </button>
                  );
                })}
              </div>

              {selectedTableId && (
                <div className="flex items-center justify-between pt-1 border-t border-primary/20 text-xs">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {selectedTableId} Tab Open
                  </span>
                  <button
                    type="button"
                    disabled={!preview || preview.lines.length === 0}
                    onClick={() => {
                      if (!preview) return;
                      const currentTable = (db.tables || DEFAULT_TABLES).find((t) => t.id === selectedTableId);
                      setTableOrder(selectedTableId, preview.lines, quickPhone, orderNote);
                      printKOT(selectedTableId, currentTable?.name || selectedTableId, preview.lines, orderNote);
                      addKdsOrder({
                        id: `kot_${Date.now()}`,
                        tokenNum: todayToken,
                        tableId: selectedTableId,
                        orderType: "dinein",
                        channel,
                        lines: preview.lines.map((l) => ({ name: l.name, qty: l.qty })),
                        notes: orderNote,
                      });
                      playChime("print", soundStyle);
                      toast.success(`KOT printed & sent to kitchen for ${selectedTableId}! Tab is saved.`);
                    }}
                    className="rounded bg-orange-600 hover:bg-orange-700 text-white font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 shadow-2xs disabled:opacity-40"
                  >
                    <Flame className="size-3" /> Send KOT to Kitchen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Channel Switcher */}
          <div className="flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
            {db.channels.map((c) => (
              <button
                key={c.id}
                onClick={() => changeChannel(c.id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-all ${channel === c.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c.id === "counter" ? "Counter / Dine-in" : c.name}
              </button>
            ))}
          </div>

          {/* POS Sound Selector Bar */}
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-border/70 bg-card px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Volume2 className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold">Sound:</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: "kaching", label: "🔔 Ka-Ching" },
                { id: "triad", label: "✨ Chime" },
                { id: "click", label: "🔘 Click" },
                { id: "mute", label: "🔇 Mute" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => changeSound(s.id as "kaching" | "triad" | "click" | "mute")}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${soundStyle === s.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                  title={`Select ${s.label} sound on billing`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Bill Correction Banner */}
          {editingSaleId && (
            <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">
                    CORRECTING BILL #{editingSaleId.slice(0, 6).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                    Adjust quantities (e.g. 2 to 4), then click "UPDATE & RE-PRINT BILL".
                  </p>
                </div>
              </div>
              <button
                onClick={cancelEdit}
                className="shrink-0 rounded-lg border border-amber-600/30 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-500/30 transition-colors"
              >
                Cancel Edit
              </button>
            </div>
          )}

          {/* Cart items list */}
          {lines.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <Ticket className="size-8 opacity-30" />
              <p className="mt-2 text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-muted-foreground/80">Tap dishes on the left to build the bill.</p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground pb-1 border-b border-border/50">
                <span>Selected Dishes ({lines.reduce((a, b) => a + b.qty, 0)})</span>
                <button
                  onClick={() => setLines([])}
                  className="text-[11px] text-destructive hover:underline"
                >
                  Clear all
                </button>
              </div>
              <ul className="max-h-[30vh] divide-y divide-border/60 overflow-y-auto pr-1">
                {lines.map((l) => (
                  <li key={l.itemId} className="flex items-center gap-2 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.qty} × {inr(l.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => step(l.itemId, -1)}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Decrease"
                      >
                        <Minus className="size-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={l.qty === 0 ? "" : l.qty}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateQty(l.itemId, e.target.value)}
                        onBlur={() => handleQtyBlur(l.itemId)}
                        className="w-12 text-center text-xs font-black bg-muted/40 rounded border border-border/80 focus:border-primary focus:bg-background focus:outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Type quantity directly (e.g. 5, 10, 25)"
                      />
                      <button
                        type="button"
                        onClick={() => step(l.itemId, 1)}
                        disabled={isDegItem(l) && currentCartDegPlates >= liveBatch.platesLeft}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Increase"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <span className="w-16 text-right font-display text-base text-foreground">
                      {inr(l.price * l.qty)}
                    </span>
                    <button
                      onClick={() => step(l.itemId, -l.qty)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Order Note Input */}
          <div className="mt-3">
            <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <FileText className="size-3 text-primary" /> Special Kitchen Note / Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra raita, parcel packing"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Discount & Payment Controls */}
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
            <label className="text-xs text-muted-foreground">
              Discount (₹)
              <input
                type="number"
                min={0}
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Payment Mode
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value as Sale["payment"])}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                <option value="cash">Cash (Counter)</option>
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="card">Card POS</option>
                <option value="online">Online (Swiggy/Zomato)</option>
              </select>
            </label>
          </div>

          {/* Quick Cash Tender & Change Calculator */}
          {payment === "cash" && preview && preview.net > 0 && (
            <div className="mt-3 rounded-xl border border-border bg-card/70 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <Coins className="size-3.5 text-primary" /> Cash Tendered
                </span>
                {changeDue > 0 && (
                  <span className="font-bold text-success">
                    Return Change: {inr(changeDue)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-1.5">
                {[preview.net, 200, 500, 1000].map((amt) => {
                  if (amt < preview.net && amt !== preview.net) return null;
                  return (
                    <button
                      key={amt}
                      onClick={() => setCashTendered(amt)}
                      className={`flex-1 rounded-md border border-border py-1 text-xs font-semibold transition-colors ${cashTendered === amt
                          ? "border-primary bg-primary/20 text-primary"
                          : "bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                    >
                      {amt === preview.net ? "Exact" : `₹${amt}`}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                placeholder="Or enter cash received..."
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-2 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Dynamic Counter UPI Payment QR */}
          {payment === "upi" && preview && preview.net > 0 && (
            <div className="mt-3 rounded-xl border border-primary/40 bg-card p-3.5 text-center shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-primary uppercase tracking-wider text-[11px]">
                  <QrCode className="size-3.5" /> Counter UPI Payment QR
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  ₹{preview.net}
                </span>
              </div>

              {/* Authentic machine-scannable UPI QR */}
              <div className="mt-2.5 mx-auto p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(
                    `upi://pay?pa=${db.settings.upiId || "spotlightbiriyani@oksbi"}&pn=${encodeURIComponent(db.settings.businessName || "Spot Light Biriyani")}&am=${preview.net}&cu=INR`
                  )}`}
                  alt={`UPI Payment QR ₹${preview.net}`}
                  className="size-36 mx-auto"
                  loading="eager"
                />
              </div>

              <p className="mt-1.5 text-[11px] font-semibold text-foreground">
                Scan with GPay · PhonePe · Paytm · BHIM · Cred
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                VPA: {db.settings.upiId || "spotlightbiriyani@oksbi"}
              </p>

              {activeTenant.enabledModules.dynamicUpi && (
                <button
                  type="button"
                  onClick={() => setUpiQrModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <Maximize2 className="size-3" /> Show Customer Full Screen QR
                </button>
              )}
            </div>
          )}

          {/* Live Profit & Cost Breakdown */}
          {preview && (
            <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs sm:text-sm">
              <Row label="Item Total" value={inr(preview.gross)} />
              {preview.discount > 0 && <Row label="Discount" value={`- ${inr(preview.discount)}`} />}
              <Row label="Customer Pays" value={inr(preview.net)} strong />
              <Row label="Food Cost (COGS)" value={`- ${inr(preview.cogs)}`} muted />
              {preview.commission > 0 && <Row label="Platform Commission" value={`- ${inr(preview.commission)}`} muted />}
              {preview.packaging > 0 && <Row label="Packaging Fee" value={`- ${inr(preview.packaging)}`} muted />}
              <div className="mt-2 rounded-lg bg-success/10 p-2 border border-success/30">
                <Row
                  label="Your Operating Profit"
                  value={`${inr(preview.profit)} (${((preview.profit / (preview.net || 1)) * 100).toFixed(1)}%)`}
                  profit
                />
              </div>
            </dl>
          )}

          {/* Save or Update Bill Action Bar */}
          <div className="mt-4 space-y-2">
            {isCartOverDeg && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-center text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                ⚠️ Cannot place order: {currentCartDegPlates} Deg plates in cart exceeds {liveBatch.platesLeft} available plates!
              </div>
            )}
            <button
              onClick={saveOrUpdate}
              disabled={!preview || isCartOverDeg}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-display font-black text-sm sm:text-base tracking-wider text-white shadow-ember transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${editingSaleId ? "bg-amber-600 hover:bg-amber-700" : "bg-gradient-ember"
                }`}
              title={isCartOverDeg ? "Cannot place bill: stock limit exceeded" : "Save order and print thermal paper receipt (Shortcut: Press F2)"}
            >
              <Printer className="size-4 sm:size-5 shrink-0" />
              <span>{editingSaleId ? "UPDATE & RE-PRINT BILL" : "SAVE BILL & PRINT"}</span>
            </button>

            {/* Inline Quick WhatsApp Row (Non-intrusive for counter rush) */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 pl-1 shrink-0 flex items-center gap-1">
                <MessageSquare className="size-3.5 text-emerald-600" /> WhatsApp:
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile (optional)"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && preview) {
                    e.preventDefault();
                    handleQuickWhatsApp();
                  }
                }}
                className="h-8 flex-1 min-w-0 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!preview}
                onClick={handleQuickWhatsApp}
                className="h-8 shrink-0 flex items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                title="Save bill and send WhatsApp receipt"
              >
                <Send className="size-3 shrink-0" />
                <span>Send</span>
              </button>
            </div>

            {/* VIP Regular Loyalty Banner */}
            {customerLoyalty && activeTenant.enabledModules.loyalty && (
              <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <Crown className="size-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="block font-black leading-tight">
                      {customerLoyalty.isVip ? "🌟 VIP Regular Customer!" : "Returning Customer"}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none font-normal">
                      {customerLoyalty.visitCount} visits · {inr(customerLoyalty.totalSpent)} lifetime spend
                    </span>
                  </div>
                </div>
                {discount === 0 && preview && (
                  <button
                    type="button"
                    onClick={() => {
                      const disc = Math.round(preview.gross * 0.10);
                      setDiscount(disc);
                      toast.success(`Applied 10% VIP Regular Discount (${inr(disc)})!`);
                    }}
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-2.5 py-1 shadow-xs transition-all shrink-0"
                  >
                    Apply 10% Disc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Recent Bills Panel (Last 3 Bills) with instant Print, WhatsApp, and Edit actions */}
          {todaySales.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card p-3.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Today's Recent Bills
                </span>
                <button
                  onClick={() => setOrderHistoryOpen(true)}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>View All ({todaySales.length})</span>
                  <span>→</span>
                </button>
              </div>

              <div className="mt-2.5 divide-y divide-border/60">
                {todaySales.slice(0, 3).map((sale, idx) => {
                  const isSelectedForEdit = editingSaleId === sale.id;
                  const itemsSummary = Array.isArray(sale.lines)
                    ? sale.lines.map((l) => `${l?.qty || 1}x ${l?.name || "Dish"}`).join(", ")
                    : "Items";
                  const timeStr = sale.date
                    ? new Date(sale.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "--:--";
                  const saleIdStr = typeof sale.id === "string" ? sale.id.slice(0, 5).toUpperCase() : "BILL";

                  return (
                    <div key={sale.id || idx} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-foreground">
                            #{saleIdStr}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{timeStr}</span>
                          <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-bold uppercase text-muted-foreground">
                            {sale.channel}
                          </span>
                          {sale.isEdited && (
                            <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1 py-0.2 text-[9px] font-bold">
                              ✏️ Edit
                            </span>
                          )}
                          {sale.orderType && (
                            <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-bold uppercase text-muted-foreground">
                              {sale.orderType === "takeaway" ? "Parcel" : "Dine"}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground mt-0.5" title={itemsSummary}>
                          {itemsSummary}
                        </p>
                        <p className="font-semibold text-foreground text-xs font-mono mt-0.5">
                          {inr(sale.net)}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            ({sale.payment ? sale.payment.toUpperCase() : "CASH"})
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => triggerPrintForBill(sale, todaySales.length - idx)}
                          className="rounded-lg border border-border bg-background p-1.5 text-foreground hover:bg-muted hover:border-primary transition-colors"
                          title="Re-print thermal bill"
                        >
                          <Printer className="size-3.5 text-primary" />
                        </button>

                        <button
                          onClick={() => triggerWhatsAppForBill(sale)}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          title="Send bill on WhatsApp"
                        >
                          <MessageSquare className="size-3.5" />
                        </button>

                        <button
                          onClick={() => startEditPastBill(sale)}
                          className={`rounded-lg border p-1.5 transition-colors ${isSelectedForEdit
                              ? "border-amber-500 bg-amber-500 text-white font-bold"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                            }`}
                          title="Load into cart to correct wrong quantities or items"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        <button
                          onClick={() => voidBill(sale.id)}
                          className="rounded-lg border border-destructive/30 bg-destructive/5 p-1.5 text-destructive hover:bg-destructive/20 transition-colors"
                          title="Void / cancel bill"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Floating Sticky Mobile Cart Quick-Action (Only on mobile screens when items are in cart) */}
      {lines.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
          <button
            type="button"
            onClick={() => document.getElementById("pos-cart")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary via-orange-600 to-amber-600 p-3.5 text-white shadow-2xl shadow-primary/40 border border-white/20 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/25">
                <ShoppingCart className="size-4.5 text-white" />
              </span>
              <div className="text-left">
                <p className="text-xs font-black tracking-wide leading-none">{lines.reduce((s, l) => s + l.qty, 0)} Items Selected</p>
                <p className="text-[10px] text-white/80 font-medium leading-none mt-1">Tap to review cart &amp; print</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight">₹{preview?.net ?? 0}</span>
              <span className="rounded-xl bg-white text-primary px-3 py-1 text-xs font-black shadow-xs">Pay &gt;</span>
            </div>
          </button>
        </div>
      )}

      {/* Custom Item Popover / Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-sm p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-base font-bold">
                <Edit3 className="size-4 text-primary" /> Add Custom / Open Item
              </h3>
              <button
                onClick={() => setCustomModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Add off-menu requests, party bucket packages, or extra portions.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Dish / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Special Extra Egg Curry, Bucket 1KG"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Food Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto 45%"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setCustomModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={addCustomItem}
                className="flex-1 rounded-xl bg-gradient-ember py-2 text-xs font-bold text-primary-foreground shadow-ember"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Today's Deg Batch Capacity Modal */}
      {editBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="surface-card w-full max-w-sm p-6 animate-in zoom-in-95 relative border border-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="flex items-center gap-2 text-base font-display">
                🍲 TODAY'S DEG CAPACITY
              </h3>
              <button
                type="button"
                onClick={() => setEditBatchModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Set how many total plates were cooked in today's kitchen Degs for this branch ({db?.branches.find((b) => b.id === (db.settings.activeBranchId || "taramani"))?.name || "Kitchen"}).
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Chicken Deg
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 130"
                    value={newChickenCap}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewChickenCap(v);
                      const m = parseInt(newMuttonCap, 10) || 0;
                      const c = parseInt(v, 10) || 0;
                      setNewBatchCapacity(String(c + m));
                    }}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-base font-black font-display text-primary focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-muted-foreground">Plates cooked</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Mutton Deg
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 70"
                    value={newMuttonCap}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewMuttonCap(v);
                      const c = parseInt(newChickenCap, 10) || 0;
                      const m = parseInt(v, 10) || 0;
                      setNewBatchCapacity(String(c + m));
                    }}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-base font-black font-display text-primary focus:border-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">Plates cooked</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Total Deg Cooked:</span>
                <span className="font-display font-black text-primary text-base">
                  {(parseInt(newChickenCap, 10) || 0) + (parseInt(newMuttonCap, 10) || 0)} Plates
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                {[100, 120, 160, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const c = Math.round(preset * 0.65);
                      const m = preset - c;
                      setNewChickenCap(String(c));
                      setNewMuttonCap(String(m));
                      setNewBatchCapacity(String(preset));
                    }}
                    className="flex-1 py-1 text-xs font-bold rounded-lg border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setEditBatchModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBatchCapacity}
                className="flex-1 rounded-xl bg-gradient-ember py-2 text-xs font-bold text-primary-foreground shadow-ember"
              >
                Save Batch Size
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAST BILLS & ORDER HISTORY MODAL (WITH EDIT, VOID, RE-PRINT & WHATSAPP)
      ========================================================================= */}
      {orderHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="surface-card w-full max-w-4xl p-6 animate-in zoom-in-95 relative border border-border shadow-2xl h-[82vh] min-h-[540px] max-h-[850px] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-display">
                  <History className="size-5 text-primary" /> TODAY'S ORDER HISTORY &amp; PAST BILLS
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track, re-print, re-send WhatsApp, or correct wrong bill quantities entered in error.
                </p>
              </div>
              <button
                onClick={() => setOrderHistoryOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by Bill # or dish name (e.g. Chicken 65, Mutton)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-1 rounded-lg border border-border p-0.5 bg-muted/40">
                {(["all", "counter", "swiggy", "zomato"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setHistoryChannelFilter(ch)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-all ${historyChannelFilter === ch
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {ch === "all" ? "All Channels" : ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Bills List / Table */}
            <div className="mt-4 overflow-y-auto flex-1 divide-y divide-border/60 min-h-0 flex flex-col">
              {filteredHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Receipt className="size-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm font-semibold">No orders matching search</p>
                  <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search term.</p>
                </div>
              ) : (
                filteredHistory.map((sale, idx) => {
                  const itemsSummary = Array.isArray(sale.lines)
                    ? sale.lines.map((l) => `${l?.qty || 1}x ${l?.name || "Dish"}`).join(", ")
                    : "Items";
                  const saleDate = sale.date ? new Date(sale.date) : null;
                  const dateStr = saleDate
                    ? saleDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "Today";
                  const timeStr = saleDate
                    ? saleDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "--:--";
                  const saleIdStr = typeof sale.id === "string" ? sale.id.slice(0, 6).toUpperCase() : "BILL";
                  const isBeingEdited = editingSaleId === sale.id;

                  return (
                    <div
                      key={sale.id || idx}
                      className={`py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors ${isBeingEdited ? "bg-amber-500/10 px-3 rounded-xl border border-amber-500/30" : "hover:bg-muted/30 px-2 rounded-xl"
                        }`}
                    >
                      <div className="min-w-[200px] flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-foreground">
                            #{saleIdStr}
                          </span>
                          <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <MapPin className="size-2.5 shrink-0" />
                            {db?.branches?.find((b) => b.id === sale.branchId)?.name || sale.branchId || "Branch"}
                          </span>
                          <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                            <Calendar className="size-3 text-primary shrink-0" /> {dateStr}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3 text-primary/70 shrink-0" /> {timeStr}
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                            {sale.channel}
                          </span>
                          <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {sale.payment || "cash"}
                          </span>
                          {sale.isEdited && (
                            <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold">
                              ✏️ Corrected {sale.originalNet ? `(Was ₹${sale.originalNet})` : ""}
                            </span>
                          )}
                          {sale.orderType && (
                            <span className="rounded bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                              {sale.orderType === "takeaway" ? "🥡 Takeaway" : "🍽️ Dine-in"}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-foreground font-medium mt-1">
                          {itemsSummary}
                        </p>

                        <div className="flex items-center gap-3 text-xs mt-1">
                          <span className="font-display text-primary text-base">
                            {inr(sale.net || 0)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Food Cost: {inr(sale.cogs || 0)} · <strong className="text-success">Profit: {inr(sale.profit || 0)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for Each Bill */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setOrderHistoryOpen(false);
                            startEditPastBill(sale);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors shadow-2xs"
                          title="Load into Cart to correct quantities/items"
                        >
                          <Pencil className="size-3.5" /> Correct Bill
                        </button>

                        <button
                          onClick={() => triggerPrintForBill(sale, filteredHistory.length - idx)}
                          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors shadow-2xs"
                          title="Print receipt on thermal printer"
                        >
                          <Printer className="size-3.5 text-primary" /> Print
                        </button>

                        <button
                          onClick={() => {
                            setOrderHistoryOpen(false);
                            triggerWhatsAppForBill(sale);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                          title="Send receipt to customer WhatsApp"
                        >
                          <MessageSquare className="size-3.5" /> WhatsApp
                        </button>

                        <button
                          onClick={() => voidBill(sale.id)}
                          className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                          title="Void / cancel bill"
                        >
                          <Trash2 className="size-3.5" /> Void
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP BILL DISPATCH MODAL (WORKS FOR LAST BILL OR ANY PAST BILL)
      ========================================================================= */}
      {whatsappModalOpen && (whatsappTargetBill || lastBill || todaySales[0]) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          {(() => {
            const activeBill = whatsappTargetBill || lastBill || todaySales[0];
            if (!activeBill) return null;
            const branch = db.branches.find((b) => b.id === activeBill.branchId) || db.branches[0];

            return (
              <div className="surface-card w-full max-w-md p-5 animate-in zoom-in-95 relative border border-emerald-500/30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="size-4" /> WhatsApp Receipt Dispatcher
                  </div>
                  <button
                    onClick={() => {
                      setWhatsappModalOpen(false);
                      setWhatsappTargetBill(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Customer WhatsApp Mobile Number</label>
                    <div className="mt-1 flex gap-2">
                      <span className="flex items-center rounded-lg border border-input bg-muted px-3 text-xs font-mono font-bold text-muted-foreground">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold tracking-wider text-foreground focus:border-emerald-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Customer Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Manikandan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Formatted Message Chat Preview */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Message Preview (WhatsApp Card)
                    </label>
                    <div className="rounded-xl border border-border bg-[#efeae2] dark:bg-[#111b21] p-3 text-[11px] text-slate-800 dark:text-slate-100 font-sans shadow-inner">
                      <div className="rounded-lg bg-white dark:bg-[#202c33] p-3 shadow-xs border border-slate-200 dark:border-slate-700 space-y-1.5 leading-relaxed">
                        <p className="font-medium">
                          Hi <span className="font-bold text-emerald-600 dark:text-emerald-400">{customerName || "Customer"}</span>, your Spot Light Biriyani bill is confirmed ✅
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Spot Light Biriyani — {branch?.name || "Chennai Kitchen"}
                        </p>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                          <span>📅 {new Date(activeBill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                          <span className="font-bold uppercase text-primary">
                            {activeBill.orderType === "takeaway" ? "🥡 Takeaway / Parcel" : "🍽️ Dine-in"}
                          </span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-1 text-[11px] space-y-0.5">
                          {activeBill.lines.map((l) => (
                            <div key={l.itemId} className="flex justify-between">
                              <span>🍲 {l.qty}x {l.name}</span>
                              <span className="font-mono">₹{l.price * l.qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-1 font-bold text-xs flex justify-between text-slate-900 dark:text-white">
                          <span>💰 ₹{activeBill.net}</span>
                          <span className="uppercase text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Paid via {activeBill.payment}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          📍 {branch?.address || "Chennai, Tamil Nadu"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          📞 {branch?.phone || "+91 98844 30710"}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          Bill Ref: <span className="font-mono text-emerald-600 dark:text-emerald-400">#{activeBill.id.slice(0, 6).toUpperCase()}</span>
                        </p>
                        <p className="text-[10px] italic text-slate-500">
                          ♨️ Freshly prepared authentic Chennai Biriyani. Enjoy your meal!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const itemsText = activeBill.lines.map((l) => `🍲 ${l.qty}x ${l.name} - ₹${l.price * l.qty}`).join("\n");
                        const orderTypeStr = activeBill.orderType === "takeaway" ? "🥡 TAKEAWAY / PARCEL" : "🍽️ DINE-IN";
                        const msg = `Hi ${customerName || "Customer"}, your Spot Light Biriyani bill is confirmed ✅\n\n*Spot Light Biriyani — ${branch?.name || "Chennai Kitchen"}*\n📅 ${new Date(activeBill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}\n🔖 *${orderTypeStr}*\n${itemsText}\n💰 *₹${activeBill.net}* · Paid via ${activeBill.payment.toUpperCase()}\n📍 ${branch?.address || "Chennai, Tamil Nadu"}\n📞 ${branch?.phone || "+91 98844 30710"}\nBill Ref: *#${activeBill.id.slice(0, 6).toUpperCase()}*\n\n♨️ Freshly prepared authentic Chennai recipe. Enjoy your meal!`;
                        navigator.clipboard.writeText(msg);
                        toast.success("WhatsApp bill copied to clipboard!");
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="size-3.5" /> Copy Text
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = customerPhone.replace(/\D/g, "");
                        if (!cleanPhone || cleanPhone.length < 10) {
                          toast.error("Please enter a valid 10-digit mobile number");
                          return;
                        }
                        const validPhone = cleanPhone.slice(-10);
                        const businessName = db?.settings?.businessName || "Spot Light Biriyani";
                        const itemsText = activeBill.lines.map((l) => `🍲 ${l.qty}x ${l.name} - ₹${l.price * l.qty}`).join("\n");
                        const orderTypeStr = activeBill.orderType === "takeaway" ? "🥡 TAKEAWAY / PARCEL" : "🍽️ DINE-IN";
                        const msg = `Hi ${customerName || "Customer"}, your ${businessName} bill is confirmed ✅\n\n*${businessName} — ${branch?.name || "Kitchen"}*\n📅 ${new Date(activeBill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}\n🔖 *${orderTypeStr}*\n${itemsText}\n💰 *₹${activeBill.net}* · Paid via ${activeBill.payment.toUpperCase()}\n📍 ${branch?.address || "Chennai"}\n📞 ${branch?.phone || ""}\nBill Ref: *#${activeBill.id.slice(0, 6).toUpperCase()}*\n\n♨️ Thank you! Visit again.`;
                        
                        const whatsappUrl = `https://wa.me/91${validPhone}?text=${encodeURIComponent(msg)}`;
                        const w = window.open(whatsappUrl, "_blank");
                        if (!w || w.closed || typeof w.closed === "undefined") {
                          window.location.href = whatsappUrl;
                        }
                        toast.success("WhatsApp opened with formatted bill!");
                        setWhatsappModalOpen(false);
                        setWhatsappTargetBill(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs shadow-md transition-all"
                    >
                      <Send className="size-3.5" /> Send on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          PHASE 2: KITCHEN DISPLAY SYSTEM (KDS) MODAL / CHEF TABLET VIEW
      ========================================================================= */}
      {kdsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                  <ChefHat className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-black leading-tight text-foreground">
                    KITCHEN DISPLAY SYSTEM (KDS)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time chef tablet display with elapsed cooking timers &amp; item checklist.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
                  {(["all", "pending", "preparing", "ready"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setKdsFilter(status)}
                      className={`rounded px-2.5 py-1 font-bold capitalize transition-all ${
                        kdsFilter === status
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setKdsModalOpen(false)}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* KDS Order Cards Grid */}
            <div className="mt-4 flex-1 overflow-y-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pr-1">
              {((db?.kdsOrders || []).filter((o) => (kdsFilter === "all" ? o.status !== "completed" : o.status === kdsFilter))).length === 0 ? (
                <div className="col-span-full py-16 text-center text-muted-foreground">
                  <UtensilsCrossed className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-bold text-sm">No Active Kitchen Orders</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Orders sent from Counter Billing or Table KOT will appear here automatically.</p>
                </div>
              ) : (
                (db?.kdsOrders || [])
                  .filter((o) => (kdsFilter === "all" ? o.status !== "completed" : o.status === kdsFilter))
                  .map((order) => {
                    const elapsedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                    const isUrgent = elapsedMins >= 10;
                    const isMedium = elapsedMins >= 5 && elapsedMins < 10;
                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                          order.status === "ready"
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : isUrgent
                            ? "border-rose-500/60 bg-rose-500/10 animate-pulse"
                            : isMedium
                            ? "border-amber-500/50 bg-amber-500/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-border/60 pb-2">
                            <div>
                              <span className="font-display font-black text-base text-foreground">
                                {order.tableId ? `Table ${order.tableId}` : `Token #${order.tokenNum || order.orderNumber}`}
                              </span>
                              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                                {order.orderType === "takeaway" ? "Takeaway" : "Dine-in"}
                              </span>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide ${
                                isUrgent
                                  ? "bg-rose-600 text-white"
                                  : isMedium
                                  ? "bg-amber-500 text-white"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              ⏱ {elapsedMins}m ago
                            </span>
                          </div>

                          {/* Items Checklist */}
                          <div className="mt-3 space-y-2">
                            {order.lines.map((line, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => toggleKdsLineDone(order.id, idx)}
                                className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg border transition-all ${
                                  line.done
                                    ? "border-emerald-500/30 bg-emerald-500/10 line-through text-muted-foreground opacity-60"
                                    : "border-border/60 bg-muted/40 text-foreground"
                                }`}
                              >
                                <span className="font-bold text-xs flex items-center gap-1.5">
                                  {line.done ? <CheckSquare className="size-3.5 text-emerald-600 shrink-0" /> : <Square className="size-3.5 text-muted-foreground shrink-0" />}
                                  {line.name}
                                </span>
                                <span className="font-mono font-black text-sm text-primary px-1">
                                  x{line.qty}
                                </span>
                              </button>
                            ))}
                          </div>

                          {order.notes && (
                            <p className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 p-1.5 rounded-lg">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>

                        {/* Status Actions */}
                        <div className="mt-4 pt-2 border-t border-border/60 flex gap-2">
                          {order.status !== "ready" ? (
                            <button
                              type="button"
                              onClick={() => {
                                updateKdsStatus(order.id, "ready");
                                playChime("cash", soundStyle);
                                toast.success(`Order ${order.orderNumber || order.tableId || order.id} marked Ready for Pickup!`);
                              }}
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="size-3.5" /> Mark Ready (Ding Bell)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                updateKdsStatus(order.id, "completed");
                                toast.info(`Order ${order.orderNumber || order.tableId || order.id} completed & cleared from kitchen`);
                              }}
                              className="w-full rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold py-2 text-xs border border-border transition-all"
                            >
                              Clear from Screen
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: SHIFT DAY-CLOSE & CASHIER Z-REPORT MODAL
      ========================================================================= */}
      {zReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-emerald-600" />
                <div>
                  <h3 className="font-display font-black text-lg text-foreground">
                    CASHIER SHIFT DAY-CLOSE (Z-REPORT)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Reconcile physical cash drawer with system billed totals before closing shift.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZReportModalOpen(false)}
                className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Cash Billed Today</span>
                  <span className="font-display font-black text-base text-foreground">₹{todayCashTotal}</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">UPI Billed Today</span>
                  <span className="font-display font-black text-base text-emerald-600">₹{todayUpiTotal}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-3 space-y-2 bg-card">
                <label className="flex items-center justify-between font-bold text-muted-foreground">
                  <span>Opening Cash Float (Counter Starting Cash):</span>
                  <input
                    type="number"
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-right text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </label>

                <label className="flex items-center justify-between font-bold text-muted-foreground">
                  <span>Petty Cash Expenses (Paid from Drawer):</span>
                  <input
                    type="number"
                    value={pettyCashExpenses}
                    onChange={(e) => setPettyCashExpenses(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-right text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </label>

                <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-foreground">
                  <span>Expected Cash in Drawer:</span>
                  <span className="font-mono text-sm">₹{expectedCashInDrawer}</span>
                </div>

                <label className="flex items-center justify-between font-black text-foreground pt-1 border-t border-dashed border-border/60">
                  <span>Actual Cash Counted by Cashier:</span>
                  <input
                    type="number"
                    autoFocus
                    placeholder="Enter count"
                    value={countedPhysicalCash}
                    onChange={(e) => setCountedPhysicalCash(e.target.value)}
                    className="w-32 rounded-lg border-2 border-primary bg-background px-2.5 py-1 text-right text-sm font-bold text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </label>

                {countedPhysicalCash !== "" && (
                  <div
                    className={`rounded-lg p-2 font-bold flex justify-between items-center text-xs ${
                      drawerVariance === 0
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                        : drawerVariance > 0
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                    }`}
                  >
                    <span>Cash Drawer Variance:</span>
                    <span>
                      {drawerVariance === 0
                        ? "✅ Exact Match (₹0 Variance)"
                        : drawerVariance > 0
                        ? `+₹${drawerVariance} (Cash Surplus / Over)`
                        : `-₹${Math.abs(drawerVariance)} (Cash Shortage)`}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setZReportModalOpen(false)}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const counted = Number(countedPhysicalCash) || expectedCashInDrawer;
                    const closeRec = recordShiftClose({
                      date: new Date().toISOString().slice(0, 10),
                      cashierName: localStorage.getItem("spotlight_auth_user") || "Counter Cashier",
                      openingFloat,
                      cashBilled: todayCashTotal,
                      upiBilled: todayUpiTotal,
                      cardBilled: todayOtherTotal,
                      expenses: pettyCashExpenses,
                      expectedCash: expectedCashInDrawer,
                      actualCash: counted,
                      variance: counted - expectedCashInDrawer,
                    });
                    const p = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;
                    printZReport(closeRec, db.settings.businessName, p);
                    toast.success("Shift Day-Close finalized & Z-Report sent to printer!");
                    setZReportModalOpen(false);
                  }}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="size-3.5" /> Close Shift &amp; Print Z-Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: CUSTOMER FACING DYNAMIC UPI QR MODAL
      ========================================================================= */}
      {upiQrModalOpen && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border-2 border-primary/50 bg-card p-6 shadow-2xl text-center animate-in zoom-in-95">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-black text-primary">
              <QrCode className="size-3.5" /> SCAN &amp; PAY VIA UPI
            </span>
            <h3 className="mt-2 font-display font-black text-xl text-foreground">
              {db.settings.businessName.toUpperCase()}
            </h3>
            <p className="text-3xl font-display font-black text-primary mt-1">
              ₹{preview.net}
            </p>

            <div className="mt-4 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-300 inline-block shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
                  `upi://pay?pa=${db.settings.upiId || "spotlightbiriyani@oksbi"}&pn=${encodeURIComponent(db.settings.businessName || "Spot Light Biriyani")}&am=${preview.net}&cu=INR`
                )}`}
                alt={`UPI Dynamic QR ₹${preview.net}`}
                className="size-48 mx-auto"
                loading="eager"
              />
            </div>

            <p className="mt-3 text-xs font-semibold text-foreground">
              Scan with GPay · PhonePe · Paytm · BHIM · Cred
            </p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Merchant VPA: {db.settings.upiId || "spotlightbiriyani@oksbi"}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setUpiQrModalOpen(false)}
                className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Back to Counter
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpiQrModalOpen(false);
                  saveOrUpdate();
                }}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-3.5" /> Payment Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
  profit,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  profit?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className={muted ? "text-muted-foreground" : "font-medium"}>{label}</dt>
      <dd
        className={`font-semibold ${profit ? "text-success font-bold text-sm" : ""} ${strong ? "text-base font-display text-foreground" : ""
          } ${muted ? "text-muted-foreground" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

/** Opens an 80mm or 58mm thermal receipt formatted print dialog */
function printBill(
  sale: Sale,
  businessName: string,
  tokenNum: number,
  note?: string,
  tendered?: number | "",
  change?: number,
  printer: PrinterSettings = DEFAULT_PRINTER_SETTINGS,
) {
  const is58 = printer.paperWidth === "58mm";
  const w = window.open("", "_blank", `width=${is58 ? 260 : 380},height=640`);
  if (!w) return;
  const rows = sale.lines
    .map(
      (l) =>
        `<tr>
          <td style="padding: 3px 0; font-weight: 600;">${l.name}</td>
          <td style="text-align: center; padding: 3px 0;">${l.qty}</td>
          <td style="text-align: right; padding: 3px 0;">₹${l.price * l.qty}</td>
        </tr>`,
    )
    .join("");

  const tenderVal = Number(tendered) || 0;
  const changeVal = change !== undefined ? change : (tenderVal > sale.net ? tenderVal - sale.net : 0);

  const printWidth = is58 ? "58mm" : "80mm";
  const bodyWidth = is58 ? "210px" : "300px";
  const fontSize = is58 ? "10px" : "12px";

  // Kitchen KOT HTML if copies === 2
  const kotHtml = printer.printCopies === 2 ? `
    <div style="margin-top: 25px; border-top: 2px dashed #000; padding-top: 15px; text-align: center;">
      <div style="font-size: 11px; font-weight: bold; letter-spacing: 2px;">✂ - - - KITCHEN ORDER TOKEN (KOT) - - - ✂</div>
      <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">TOKEN #${String(Math.max(1, tokenNum)).padStart(3, "0")}</div>
      <div style="font-size: 10px; margin-top: 2px;">${sale.channel.toUpperCase()} · ${new Date(sale.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
      ${note ? `<div style="border: 1px solid #000; padding: 4px; font-weight: bold; margin-top: 6px; font-size: 11px;">NOTE: ${note}</div>` : ""}
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px dashed #000;"><th style="padding: 2px 0;">ITEM</th><th style="text-align: right;">QTY</th></tr>
        </thead>
        <tbody>
          ${sale.lines.map(l => `<tr><td style="padding: 3px 0; font-weight: bold;">${l.name}</td><td style="text-align: right; font-size: 14px; font-weight: 900;">${l.qty}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  ` : "";

  w.document.write(`<!DOCTYPE html><html><head><title>Receipt #${sale.id.slice(0, 6)}</title><style>
    @media print {
      body { width: ${printWidth}; margin: 0; padding: 6px; font-family: 'Courier New', monospace; font-size: ${fontSize}; color: #000; }
    }
    body { width: ${bodyWidth}; margin: auto; padding: 10px; font-family: -apple-system, monospace; font-size: ${fontSize}; color: #111; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .token-box { border: 2px dashed #000; padding: 6px; text-align: center; margin: 8px 0; border-radius: 4px; }
    .token-num { font-size: 24px; font-weight: 900; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; border-bottom: 1px dashed #000; padding-bottom: 4px; font-size: ${is58 ? "9px" : "11px"}; }
    td { border-bottom: 1px dotted #ccc; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 8px; border-top: 1px dashed #000; padding-top: 4px; }
    .calc-row { display: flex; justify-content: space-between; font-size: ${is58 ? "10px" : "11px"}; margin-top: 2px; }
    .note-box { border: 1px solid #888; background: #f9f9f9; padding: 4px; font-size: 11px; margin-top: 6px; border-radius: 3px; }
    .footer { font-size: ${is58 ? "9px" : "10px"}; text-align: center; margin-top: 12px; border-top: 1px dotted #888; padding-top: 6px; }
  </style></head><body>
    <div class="center">
      <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px;">${businessName.toUpperCase()}</div>
      <div style="font-size: 11px; margin-top: 2px;">Authentic Chennai Biriyani Specialists</div>
      <div style="font-size: 9px; color: #555; margin-top: 2px;">FSSAI: ${printer.fssaiNumber || "12424008000456"}</div>
      ${printer.gstin ? `<div style="font-size: 9px; color: #555;">GSTIN: ${printer.gstin}</div>` : ""}
      <div style="font-size: 10px; color: #555; margin-top: 2px;">${new Date(sale.date).toLocaleString("en-IN")}</div>
    </div>
    
    <div class="token-box">
      <div style="font-size: 10px; font-weight: bold; letter-spacing: 1px;">ORDER TOKEN</div>
      <div class="token-num">#${String(Math.max(1, tokenNum)).padStart(3, "0")}</div>
      <div style="font-size: 10px; font-weight: bold;">${sale.orderType === "takeaway" ? "🥡 TAKEAWAY / PARCEL" : "🍽️ DINE-IN"} · ${sale.channel.toUpperCase()}</div>
    </div>

    ${note ? `<div class="note-box"><strong>KITCHEN NOTE:</strong> ${note}</div>` : ""}

    <table>
      <thead>
        <tr>
          <th>ITEM</th>
          <th style="text-align: center;">QTY</th>
          <th style="text-align: right;">PRICE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="total-row">
      <span>NET TOTAL</span>
      <span>₹${sale.net}</span>
    </div>
    ${sale.discount > 0 ? `<div class="calc-row" style="color:#555;"><span>Discount Applied</span><span>- ₹${sale.discount}</span></div>` : ""}

    ${tenderVal > 0 ? `
      <div class="calc-row" style="margin-top: 4px; border-top: 1px dotted #ccc; padding-top: 4px;">
        <span>Customer Paid (Cash)</span>
        <span class="bold">₹${tenderVal}</span>
      </div>
      <div class="calc-row" style="font-weight: bold; font-size: 12px;">
        <span>Change Returned</span>
        <span>₹${changeVal}</span>
      </div>
    ` : ""}

    <div style="font-size: 11px; margin-top: 5px; border-top: 1px dotted #bbb; padding-top: 4px;">
      Payment Method: <span class="bold">${sale.payment.toUpperCase()}</span>
    </div>
    
    <div class="footer">
      <div>${printer.customFooter || "Freshly cooked twice daily · No reheats"}</div>
      <div style="font-weight: bold; margin-top: 2px;">Thank you! Visit again.</div>
    </div>

    ${kotHtml}
  </body></html>`);
  w.document.close();
  setTimeout(() => {
    w.print();
  }, 250);
}

/** Opens an 80mm or 58mm Kitchen Order Ticket (KOT) formatted print dialog */
function printKOT(
  tableId: string,
  tableName: string,
  lines: SaleLine[],
  note?: string,
  printer: PrinterSettings = DEFAULT_PRINTER_SETTINGS,
) {
  const is58 = printer.paperWidth === "58mm";
  const w = window.open("", "_blank", `width=${is58 ? 260 : 380},height=500`);
  if (!w) return;
  const rows = lines
    .map(
      (l) =>
        `<tr>
          <td style="padding: 4px 0; font-size: ${is58 ? "12px" : "14px"}; font-weight: 800;">${l.name.toUpperCase()}</td>
          <td style="text-align: right; padding: 4px 0; font-size: ${is58 ? "14px" : "16px"}; font-weight: 900;">${l.qty}</td>
        </tr>`
    )
    .join("");

  w.document.write(`<!DOCTYPE html><html><head><title>KOT - ${tableName}</title><style>
    @media print { body { width: ${printer.paperWidth}; margin: 0; padding: 4px; font-family: monospace; color: #000; } }
    body { width: ${is58 ? "210px" : "280px"}; margin: auto; padding: 8px; font-family: monospace; color: #111; }
    .c { text-align: center; }
    .b { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
  </style></head><body>
    <div class="c b" style="font-size: 14px; border-bottom: 2px dashed #000; padding-bottom: 4px;">*** KITCHEN ORDER TICKET (KOT) ***</div>
    <div style="font-size: 13px; font-weight: 900; margin-top: 6px;">TABLE: ${tableName.toUpperCase()}</div>
    <div style="font-size: 10px; color: #333;">TIME: ${new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })} · DINE-IN</div>
    <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
    <table>
      <thead>
        <tr style="border-bottom: 1px dashed #000; font-size: 10px;">
          <th style="text-align: left; padding-bottom: 3px;">ITEM</th>
          <th style="text-align: right; padding-bottom: 3px;">QTY</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${note ? `<div style="margin-top: 8px; border: 1px solid #000; padding: 4px; font-size: 11px; font-weight: bold;">SPECIAL INSTRUCTION: ${note.toUpperCase()}</div>` : ""}
    <div style="border-top: 2px dashed #000; margin: 8px 0;"></div>
    <div class="c" style="font-size: 10px; font-weight: bold;">-- PREPARE IMMEDIATELY --</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
}

/** Opens an 80mm or 58mm Cashier Shift Day-Close (Z-Report) formatted print dialog */
function printZReport(
  z: ShiftDayClose,
  businessName: string,
  printer: PrinterSettings = DEFAULT_PRINTER_SETTINGS,
) {
  const is58 = printer.paperWidth === "58mm";
  const w = window.open("", "_blank", `width=${is58 ? 260 : 380},height=600`);
  if (!w) return;

  w.document.write(`<!DOCTYPE html><html><head><title>Z-Report - ${z.date}</title><style>
    @media print { body { width: ${printer.paperWidth}; margin: 0; padding: 4px; font-family: monospace; color: #000; } }
    body { width: ${is58 ? "210px" : "280px"}; margin: auto; padding: 8px; font-family: monospace; color: #111; }
    .c { text-align: center; }
    .b { font-weight: bold; }
    .row { display: flex; justify-content: space-between; padding: 2px 0; }
  </style></head><body>
    <div class="c b" style="font-size: 14px;">${businessName.toUpperCase()}</div>
    <div class="c b" style="font-size: 11px; margin-top: 2px;">*** CASHIER SHIFT DAY-CLOSE (Z-REPORT) ***</div>
    <div class="c" style="font-size: 9px; margin-top: 2px;">CLOSED AT: ${new Date(z.closedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
    <div class="c" style="font-size: 9px;">CASHIER: ${z.cashierName}</div>
    <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
    <div class="row"><span>Opening Cash Float:</span><span>₹${z.openingFloat}</span></div>
    <div class="row"><span>Cash Sales Billed:</span><span>₹${z.cashBilled}</span></div>
    <div class="row"><span>UPI Sales Billed:</span><span>₹${z.upiBilled}</span></div>
    ${z.cardBilled > 0 ? `<div class="row"><span>Card/Online Billed:</span><span>₹${z.cardBilled}</span></div>` : ""}
    ${z.expenses > 0 ? `<div class="row"><span>Petty Cash Expenses:</span><span>-₹${z.expenses}</span></div>` : ""}
    <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
    <div class="row b"><span>Expected Cash in Drawer:</span><span>₹${z.expectedCash}</span></div>
    <div class="row b"><span>Counted Cash Handed Over:</span><span>₹${z.actualCash}</span></div>
    <div class="row b" style="font-size: 12px; margin-top: 4px;">
      <span>Discrepancy (Variance):</span>
      <span>${z.variance === 0 ? "₹0 (BALANCED)" : (z.variance > 0 ? `+₹${z.variance} (OVER)` : `-₹${Math.abs(z.variance)} (SHORT)`)}</span>
    </div>
    <div style="border-top: 2px dashed #000; margin: 12px 0 24px 0;"></div>
    <div style="font-size: 10px; margin-top: 10px;">Manager Signature: __________________</div>
    <div style="font-size: 10px; margin-top: 8px;">Cashier Signature: __________________</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
}
