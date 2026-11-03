import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { inr, setDB, useDB, type StockMove } from "@/lib/pos-store";

export const Route = createFileRoute("/app/stock")({
  component: Stock,
});

function Stock() {
  const db = useDB();
  const [form, setForm] = useState({ stockItemId: "", type: "in" as StockMove["type"], qty: "", note: "" });
  const [newItem, setNewItem] = useState({ name: "", unit: "kg", qty: "", reorderLevel: "", costPerUnit: "" });
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    unit: string;
    qty: number;
    reorderLevel: number;
    costPerUnit: number;
  } | null>(null);

  if (!db) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const applyMove = () => {
    const qty = Number(form.qty);
    if (!form.stockItemId || !qty || qty <= 0) {
      toast.error("Pick an item and enter a quantity");
      return;
    }
    setDB((d) => {
      const item = d.stock.find((s) => s.id === form.stockItemId);
      if (!item) return;
      item.qty = Math.max(0, item.qty + (form.type === "in" ? qty : -qty));
      d.moves.unshift({
        id: Math.random().toString(36).slice(2, 10),
        date: new Date().toISOString(),
        branchId: d.settings.activeBranchId,
        stockItemId: item.id,
        type: form.type,
        qty,
        note: form.note,
      });
    });
    setForm({ stockItemId: "", type: "in", qty: "", note: "" });
    toast.success("Stock movement recorded");
  };

  const addItem = () => {
    if (!newItem.name.trim()) {
      toast.error("Enter a material name");
      return;
    }
    setDB((d) => {
      d.stock.push({
        id: Math.random().toString(36).slice(2, 10),
        name: newItem.name.trim(),
        unit: newItem.unit.trim() || "kg",
        qty: Number(newItem.qty) || 0,
        reorderLevel: Number(newItem.reorderLevel) || 0,
        costPerUnit: Number(newItem.costPerUnit) || 0,
      });
    });
    setNewItem({ name: "", unit: "kg", qty: "", reorderLevel: "", costPerUnit: "" });
    toast.success("Raw material added successfully");
  };

  const startEdit = (item: (typeof db.stock)[0]) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      unit: item.unit,
      qty: item.qty,
      reorderLevel: item.reorderLevel,
      costPerUnit: item.costPerUnit,
    });
  };

  const saveEdit = () => {
    if (!editingItem || !editingItem.name.trim()) {
      toast.error("Please enter a valid material name");
      return;
    }
    setDB((d) => {
      const item = d.stock.find((s) => s.id === editingItem.id);
      if (item) {
        item.name = editingItem.name.trim();
        item.unit = editingItem.unit.trim() || "kg";
        item.qty = Math.max(0, Number(editingItem.qty) || 0);
        item.reorderLevel = Math.max(0, Number(editingItem.reorderLevel) || 0);
        item.costPerUnit = Math.max(0, Number(editingItem.costPerUnit) || 0);
      }
    });
    toast.success(`Updated "${editingItem.name}" successfully`);
    setEditingItem(null);
  };

  const deleteItem = (id: string, name: string) => {
    const itemToDelete = db.stock.find((s) => s.id === id);
    setDB((d) => {
      d.stock = d.stock.filter((s) => s.id !== id);
    });
    toast.success(`Removed "${name}" from stock`, {
      action: itemToDelete
        ? {
            label: "Undo",
            onClick: () => {
              setDB((d) => {
                d.stock.push(itemToDelete);
              });
              toast.info(`Restored "${name}"`);
            },
          }
        : undefined,
    });
  };

  const stockValue = db.stock.reduce((s, i) => s + i.qty * i.costPerUnit, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">RAW MATERIAL &amp; KITCHEN INVENTORY</h1>
          <p className="text-sm text-muted-foreground">
            Track daily kitchen inventory on hand, reorder alerts, and purchases. Total stock valuation:{" "}
            <span className="font-semibold text-foreground font-mono">{inr(stockValue)}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground shadow-xs">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          <span>
            <strong className="text-foreground">Red Alert:</strong> Current Qty &le; Reorder Level triggers immediate restocking alert.
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <div className="space-y-6">
          <div className="surface-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display">CURRENT ON-HAND STOCK</h2>
              <span className="text-xs text-muted-foreground">{db.stock.length} materials tracked</span>
            </div>

            {/* Mobile-Friendly Stock Card List (Phone Screens) */}
            <div className="sm:hidden space-y-3 mb-4">
              {db.stock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No materials in inventory.</p>
              ) : (
                db.stock.map((s) => {
                  const low = s.qty <= s.reorderLevel;
                  return (
                    <div key={s.id} className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-sm">{s.name}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            low
                              ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {low ? <><AlertTriangle className="size-2.5" /> Reorder Alert</> : <><CheckCircle2 className="size-2.5" /> Healthy</>}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50">
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground block">On-Hand Qty</span>
                          <span className="font-mono font-bold text-foreground text-sm">{s.qty} {s.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground block">Reorder At</span>
                          <span className="font-mono text-muted-foreground">{s.reorderLevel} {s.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground block">Cost / Unit</span>
                          <span className="font-mono text-muted-foreground">{inr(s.costPerUnit)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground block">Asset Value</span>
                          <span className="font-mono font-bold text-primary">{inr(s.qty * s.costPerUnit)}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Pencil className="size-3 text-primary" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(s.id, s.name)}
                          className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="size-3" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Swipeable Desktop/Tablet Table with touch scrolling */}
            <div className="hidden sm:block overflow-x-auto touch-pan-x -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-3">Material Name</th>
                  <th className="pb-3">Current Qty</th>
                  <th className="pb-3">
                    Reorder Level
                    <span className="block text-[10px] text-muted-foreground font-normal">Alert trigger</span>
                  </th>
                  <th className="pb-3">Cost / Unit</th>
                  <th className="pb-3">Asset Value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {db.stock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No materials in inventory. Add one using the form on the right.
                    </td>
                  </tr>
                ) : (
                  db.stock.map((s) => {
                    const low = s.qty <= s.reorderLevel;
                    return (
                      <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 font-medium text-foreground">{s.name}</td>
                        <td className="py-3 font-mono font-semibold">
                          {s.qty} {s.unit}
                        </td>
                        <td className="py-3 text-muted-foreground font-mono">
                          {s.reorderLevel} {s.unit}
                        </td>
                        <td className="py-3 font-mono">{inr(s.costPerUnit)}</td>
                        <td className="py-3 font-mono font-semibold text-foreground">
                          {inr(s.qty * s.costPerUnit)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              low
                                ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {low ? (
                              <>
                                <AlertTriangle className="size-3" /> Reorder
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3" /> OK
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(s)}
                              className="inline-flex size-7.5 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted hover:border-primary hover:text-primary transition-all shadow-2xs active:scale-95"
                              title={`Edit "${s.name}" details`}
                              aria-label={`Edit ${s.name}`}
                            >
                              <Pencil className="size-3.5 text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(s.id, s.name)}
                              className="inline-flex size-7.5 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-2xs active:scale-95"
                              title={`Remove "${s.name}" from inventory`}
                              aria-label={`Remove ${s.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-display">RECENT MOVEMENTS</h2>
            {db.moves.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No movements recorded yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border/60 text-sm">
                {db.moves.slice(0, 12).map((m) => {
                  const item = db.stock.find((s) => s.id === m.stockItemId);
                  return (
                    <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2">
                      <span>
                        <span className="font-medium">{item?.name ?? "—"}</span>{" "}
                        <span className="text-muted-foreground">
                          {m.type === "in" ? "purchased" : m.type === "out" ? "used" : "wasted"} {m.qty} {item?.unit}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.date).toLocaleString("en-IN")} {m.note && `· ${m.note}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h2 className="text-lg font-display">RECORD STOCK MOVEMENT</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Log daily purchases, kitchen usage, or kitchen wastage.
            </p>
            <div className="mt-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Select Raw Material
                </label>
                <select
                  value={form.stockItemId}
                  onChange={(e) => setForm({ ...form, stockItemId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select material…</option>
                  {db.stock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.qty} {s.unit} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Movement Type
                </label>
                <div className="flex gap-1 rounded-lg border border-border p-0.5 bg-muted/30">
                  {(["in", "out", "wastage"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-all ${
                        form.type === t
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "in" ? "+ Purchase" : t === "out" ? "- Used" : "⚠ Wastage"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Reference Note (Optional)
                </label>
                <input
                  placeholder="e.g. Koyambedu market, Batch 4 Cooking, Damaged"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={applyMove}
                className="w-full rounded-full bg-gradient-ember py-2.5 text-sm font-semibold text-white shadow-ember hover:opacity-95 transition-opacity"
              >
                Save Movement
              </button>
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-display">ADD NEW RAW MATERIAL</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add rice, meat, spices, curd, carry bags, or cooking oils.
            </p>

            <div className="mt-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Material Name *
                </label>
                <input
                  placeholder="e.g. Garam Masala / Curd / Carry Bag"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Unit
                  </label>
                  <input
                    placeholder="kg / L / pcs / box"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1" title="Initial physical quantity right now">
                    Opening Qty
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1" title="Alerts in RED when stock drops below this number">
                    Reorder Alert At
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={newItem.reorderLevel}
                    onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Cost / Unit (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                💡 <strong>Why is Reorder Level Red?</strong> If Current Qty &le; Reorder Level, the badge turns red to alert the chef to purchase fresh supplies before the kitchen runs out.
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted py-2.5 text-sm font-semibold text-foreground transition-colors shadow-xs"
              >
                <Plus className="size-4 text-primary" /> Add Material to Inventory
              </button>
            </div>
          </div>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-foreground">Edit Raw Material Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Material Name
                </label>
                <input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Unit
                  </label>
                  <input
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    value={editingItem.qty}
                    onChange={(e) => setEditingItem({ ...editingItem, qty: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    value={editingItem.reorderLevel}
                    onChange={(e) => setEditingItem({ ...editingItem, reorderLevel: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Cost Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={editingItem.costPerUnit}
                    onChange={(e) => setEditingItem({ ...editingItem, costPerUnit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-full bg-gradient-ember px-5 py-2 text-xs font-bold text-white shadow-ember hover:opacity-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
