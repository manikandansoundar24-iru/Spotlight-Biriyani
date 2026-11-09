import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Flame,
  Layers,
  LayoutGrid,
  MapPin,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  Send,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trash2,
  Users,
  Utensils,
  UtensilsCrossed,
  Volume2,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import {
  addKdsOrder,
  CATEGORIES,
  DEFAULT_TABLES,
  getActiveTenant,
  getTenantItems,
  inr,
  normalizeCategory,
  setTableOrder,
  useDB,
  vacateTable,
  type Item,
  type SaleLine,
  type TableSession,
} from "@/lib/pos-store";

export const Route = createFileRoute("/app/captain")({
  head: () => ({
    meta: [
      { title: "Captain / Waiter Mobile POS — RestoPulse" },
      {
        name: "description",
        content: "Mobile and tablet tableside ordering terminal for restaurant captains and waiters.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaptainMobilePage,
});

function playChime(customStyle: "kaching" | "triad" | "click" = "kaching") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (customStyle === "kaching") {
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.28);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    }
  } catch {
    // Ignore audio errors
  }
}

function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([40, 50, 40]);
    } catch {
      // Ignore vibration error
    }
  }
}

function CaptainMobilePage() {
  const db = useDB();
  const activeTenant = getActiveTenant(db);
  const items = useMemo(() => getTenantItems(db, activeTenant), [db, activeTenant]);

  const [selectedTableId, setSelectedTableId] = useState<string>("T1");
  const [selectedSection, setSelectedSection] = useState<"all" | "ac" | "non-ac" | "outdoor">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  // Local draft lines added during the current ordering round
  const [draftLines, setDraftLines] = useState<SaleLine[]>([]);

  const tables: TableSession[] = db?.tables && db.tables.length > 0 ? db.tables : DEFAULT_TABLES;
  const currentTable = tables.find((t) => t.id === selectedTableId) || tables[0]!;

  // Categories list
  const categoryIds = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return ["all", ...Array.from(set)];
  }, [items]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return items.filter((dish) => {
      if (selectedCategory !== "all" && normalizeCategory(dish.category) !== normalizeCategory(selectedCategory)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return dish.name.toLowerCase().includes(q) || dish.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  // Combined lines: Existing saved lines for this table + current unsent draft lines
  const existingLines = currentTable.lines || [];

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setDraftLines([]);
    setOrderNote("");
    setIsTablePickerOpen(false);
  };

  const handleAddItem = (dish: Item) => {
    setDraftLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === dish.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx]!, qty: next[idx]!.qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          itemId: dish.id,
          name: dish.name,
          price: dish.price,
          qty: 1,
          cost: dish.cost || 0,
        },
      ];
    });
    triggerHaptic();
    playChime("click");
  };

  const handleRemoveItem = (itemId: string) => {
    setDraftLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === itemId);
      if (idx === -1) return prev;
      if (prev[idx]!.qty > 1) {
        const next = [...prev];
        next[idx] = { ...next[idx]!, qty: next[idx]!.qty - 1 };
        return next;
      }
      return prev.filter((l) => l.itemId !== itemId);
    });
    triggerHaptic();
  };

  // Merge existing table lines with draft lines
  const allMergedLines = useMemo(() => {
    const map = new Map<string, SaleLine>();
    existingLines.forEach((l) => {
      map.set(l.itemId, { ...l });
    });
    draftLines.forEach((l) => {
      if (map.has(l.itemId)) {
        const existing = map.get(l.itemId)!;
        existing.qty += l.qty;
      } else {
        map.set(l.itemId, { ...l });
      }
    });
    return Array.from(map.values());
  }, [existingLines, draftLines]);

  const draftTotal = draftLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const totalBillAmount = allMergedLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const totalItemCount = allMergedLines.reduce((sum, l) => sum + l.qty, 0);

  // Send KOT to Kitchen
  const handlePunchKot = () => {
    if (draftLines.length === 0) {
      toast.error("Please add at least 1 dish to send KOT to the kitchen.");
      return;
    }

    const tokenNum = (db?.sales?.length || 0) + 1;
    const kotId = `kot_${selectedTableId}_${Date.now()}`;

    // 1. Dispatch KOT to Kitchen Display System (KDS)
    addKdsOrder({
      id: kotId,
      tokenNum,
      tableId: selectedTableId,
      orderType: "dinein",
      channel: "counter",
      tenantId: activeTenant.id,
      lines: draftLines.map((l) => ({ name: l.name, qty: l.qty })),
      notes: orderNote || undefined,
    });

    // 2. Persist running order on table
    setTableOrder(selectedTableId, allMergedLines, currentTable.customerPhone, orderNote || currentTable.notes);

    // 3. Audio & Haptic confirmation
    triggerHaptic();
    playChime("kaching");

    toast.success(`🔥 KOT #${tokenNum} fired to Kitchen for Table ${selectedTableId}!`, {
      description: `${draftLines.length} item(s) sent to Chef Display.`,
      icon: <ChefHat className="size-4 text-emerald-500" />,
    });

    // Reset draft
    setDraftLines([]);
    setOrderNote("");
    setIsDrawerOpen(false);
  };

  // Vacate table
  const handleVacateTable = () => {
    if (confirm(`Vacate Table ${selectedTableId} and mark as available?`)) {
      vacateTable(selectedTableId);
      setDraftLines([]);
      setOrderNote("");
      toast.info(`Table ${selectedTableId} is now vacant.`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background text-foreground pb-24">
      {/* CAPTAIN APP STICKY HEADER */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to="/app/billing"
              className="flex size-8 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground hover:text-foreground shrink-0"
              title="Return to Main Counter POS"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-md bg-gradient-to-tr from-amber-500 to-red-600 text-white shrink-0">
                  <Smartphone className="size-3" />
                </span>
                <span className="font-extrabold text-xs text-foreground truncate">
                  {activeTenant.businessName}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold truncate">
                Captain Tableside Terminal · {activeTenant.activeBranchName || "Main"}
              </span>
            </div>
          </div>

          {/* Quick Table Switcher Trigger */}
          <button
            type="button"
            onClick={() => setIsTablePickerOpen((p) => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black shadow-xs transition-all shrink-0 ${
              currentTable.status === "occupied"
                ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <span>{currentTable.id}</span>
            <span className="text-[10px] font-bold">
              {currentTable.status === "occupied" ? "🔴 Busy" : "🟢 Free"}
            </span>
            <ChevronDown className="size-3" />
          </button>
        </div>

        {/* SECTION FILTER PILLS (When table picker is closed) */}
        {!isTablePickerOpen && (
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: "all", label: "All Tables" },
              { id: "ac", label: "❄️ A/C" },
              { id: "non-ac", label: "🍽️ Main" },
              { id: "outdoor", label: "🌿 Patio" },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id as any)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedSection === sec.id
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {sec.label}
              </button>
            ))}

            {/* Quick Vacate button if table occupied */}
            {currentTable.status === "occupied" && (
              <button
                type="button"
                onClick={handleVacateTable}
                className="ml-auto flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 text-[10px] font-bold text-destructive shrink-0"
              >
                <Trash2 className="size-3" /> Vacate {currentTable.id}
              </button>
            )}
          </div>
        )}
      </header>

      {/* EXPANDABLE FLOOR TABLE PICKER */}
      {isTablePickerOpen && (
        <div className="border-b border-border/80 bg-muted/40 p-3 shadow-inner animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Select Dining Table / Tab
            </span>
            <button
              onClick={() => setIsTablePickerOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
            {tables
              .filter((t) => {
                if (selectedSection === "all") return true;
                if (selectedSection === "ac") return t.section === "ac" || t.id.startsWith("A");
                if (selectedSection === "outdoor") return t.section === "outdoor" || t.id.startsWith("O");
                return t.section === "non-ac" || (!t.id.startsWith("A") && !t.id.startsWith("O"));
              })
              .map((tbl) => {
                const isSelected = tbl.id === selectedTableId;
                const isOccupied = tbl.status === "occupied";
                const lineCount = (tbl.lines || []).reduce((sum, l) => sum + l.qty, 0);

                return (
                  <button
                    key={tbl.id}
                    type="button"
                    onClick={() => handleSelectTable(tbl.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40"
                        : isOccupied
                        ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 hover:border-red-500"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="font-black text-sm">{tbl.id}</span>
                    <span className="text-[9px] font-bold mt-0.5 truncate max-w-full">
                      {isOccupied ? `🔴 ${lineCount} items` : "🟢 Free"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* DISH SEARCH & CATEGORIES */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dish (e.g. Biriyani, 65, Parotta)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-xs font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Horizontal Bar */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categoryIds.map((catId) => (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategory(catId)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === catId
                  ? "bg-gradient-ember text-white shadow-ember"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {catId === "all" ? "🔥 All Menu" : catId}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE TABLE RUNNING STATUS STRIP */}
      <div className="mx-3 mt-3 rounded-xl border border-border/80 bg-muted/40 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-xs">
            {currentTable.id}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">
              {currentTable.name || `Table ${currentTable.id}`}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {existingLines.length > 0
                ? `${existingLines.length} item(s) previously ordered · Running: ${inr(
                    existingLines.reduce((s, l) => s + l.price * l.qty, 0)
                  )}`
                : "No running dishes on this table"}
            </span>
          </div>
        </div>

        {existingLines.length > 0 && (
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-lg bg-card border border-border px-2.5 py-1 text-[11px] font-bold text-primary shadow-2xs hover:border-primary"
          >
            View Tab ({existingLines.length})
          </button>
        )}
      </div>

      {/* DISH CARDS LIST (Mobile ergonomic, big tap targets) */}
      <div className="px-3 pt-3 space-y-2">
        {filteredDishes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <UtensilsCrossed className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold">No dishes found</p>
            <p className="text-[10px] mt-1">Try changing category or search terms</p>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const inDraft = draftLines.find((l) => l.itemId === dish.id);
            const inExisting = existingLines.find((l) => l.itemId === dish.id);
            const draftQty = inDraft?.qty || 0;
            const existingQty = inExisting?.qty || 0;

            return (
              <div
                key={dish.id}
                className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 shadow-2xs hover:border-primary/40 transition-all"
              >
                {/* Dish Info */}
                <div
                  className="flex-1 min-w-0 pr-3 cursor-pointer"
                  onClick={() => handleAddItem(dish)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                      {dish.name}
                    </span>
                    {existingQty > 0 && (
                      <span className="rounded bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.2 shrink-0">
                        {existingQty} on table
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-black text-xs text-primary">{inr(dish.price)}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {dish.category}
                    </span>
                  </div>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {draftQty > 0 ? (
                    <div className="flex items-center gap-1 rounded-xl border border-primary/40 bg-primary/5 p-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(dish.id)}
                        className="flex size-7 items-center justify-center rounded-lg bg-card border border-border text-foreground hover:bg-muted active:scale-95 transition-transform"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-6 text-center font-black text-xs text-primary">
                        {draftQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItem(dish)}
                        className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-transform"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddItem(dish)}
                      className="flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 px-3 py-1.5 text-xs font-black transition-all active:scale-95"
                    >
                      <Plus className="size-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL ORDER SLIDE-UP DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border-t border-border rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xs">
                  {currentTable.id}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    {currentTable.name || `Table ${currentTable.id}`} Tab Summary
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {totalItemCount} total item(s) · Total: {inr(totalBillAmount)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Dish Breakdown */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {/* Previously Ordered (Saved on Table) */}
              {existingLines.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Dispatched to Kitchen Previously ({existingLines.length})
                  </span>
                  <div className="space-y-1.5">
                    {existingLines.map((l) => (
                      <div
                        key={l.itemId}
                        className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {l.name} <span className="font-bold text-muted-foreground">× {l.qty}</span>
                        </span>
                        <span className="font-bold text-foreground">{inr(l.price * l.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Draft additions in this round */}
              {draftLines.length > 0 ? (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1.5">
                    🔥 New Items to Punch ({draftLines.length})
                  </span>
                  <div className="space-y-1.5">
                    {draftLines.map((l) => (
                      <div
                        key={l.itemId}
                        className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs"
                      >
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-foreground block">{l.name}</span>
                          <span className="text-[10px] text-primary">{inr(l.price)} each</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(l.itemId)}
                            className="size-6 flex items-center justify-center rounded bg-card border border-border text-foreground"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-4 text-center font-bold text-xs">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const dish = items.find((it) => it.id === l.itemId);
                              if (dish) handleAddItem(dish);
                            }}
                            className="size-6 flex items-center justify-center rounded bg-primary text-primary-foreground"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No new items in draft. Tap dishes from menu to add to this round.
                </div>
              )}

              {/* Kitchen Special Note Field */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Kitchen Notes / Special Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra raita, bring lime, urgent for kids..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-border/80 bg-card/90 space-y-2">
              {draftLines.length > 0 && (
                <button
                  type="button"
                  onClick={handlePunchKot}
                  className="w-full rounded-2xl bg-gradient-ember py-3.5 text-sm font-black text-white shadow-ember flex items-center justify-center gap-2 active:scale-98 transition-transform"
                >
                  <ChefHat className="size-5" />
                  <span>PUNCH KOT TO KITCHEN ({inr(draftTotal)})</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <Link
                  to="/app/billing"
                  className="flex-1 rounded-xl border border-border bg-muted/60 py-2.5 text-center text-xs font-bold text-foreground hover:bg-muted"
                >
                  Go to Checkout Billing
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 rounded-xl border border-border bg-card py-2.5 text-center text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM QUICK ACTION BAR (Always visible when items in draft or table occupied) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 p-3 shadow-2xl max-w-lg mx-auto">
        {draftLines.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex-1 flex items-center justify-between rounded-xl bg-muted/80 border border-border px-3 py-2.5 text-left"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-foreground truncate">
                  {currentTable.id} · {draftLines.reduce((s, l) => s + l.qty, 0)} new items
                </span>
                <span className="text-[10px] text-primary font-bold">
                  {inr(draftTotal)} {existingLines.length > 0 && `(Total: ${inr(totalBillAmount)})`}
                </span>
              </div>
              <ChevronUp className="size-4 text-muted-foreground shrink-0" />
            </button>

            <button
              type="button"
              onClick={handlePunchKot}
              className="rounded-xl bg-gradient-ember px-4 py-2.5 text-xs font-black text-white shadow-ember flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
            >
              <ChefHat className="size-4" />
              <span>PUNCH KOT</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-xs text-foreground">
                Table {currentTable.id}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {currentTable.status === "occupied"
                  ? `Active (${existingLines.length} items · ${inr(totalBillAmount)})`
                  : "Ready for orders"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentTable.status === "occupied" && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
                >
                  View Tab
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTablePickerOpen((p) => !p)}
                className="rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary"
              >
                Change Table
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
