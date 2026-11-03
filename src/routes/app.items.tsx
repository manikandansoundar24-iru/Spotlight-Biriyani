import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CATEGORIES, inr, sanitizeAndDeduplicateItems, setDB, useDB, type Category } from "@/lib/pos-store";

export const Route = createFileRoute("/app/items")({
  component: Items,
});

function Items() {
  const db = useDB();
  const [draft, setDraft] = useState({
    name: "",
    category: "biryani" as Category,
    price: "",
    onlinePrice: "",
    cost: "",
  });
  const [customCat, setCustomCat] = useState("");

  if (!db) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const displayItems = sanitizeAndDeduplicateItems(db.items);

  const update = (id: string, patch: Partial<{ price: number; onlinePrice: number; cost: number; active: boolean }>) =>
    setDB((d) => {
      const it = d.items.find((i) => i.id === id);
      if (it) Object.assign(it, patch);
    });

  const removeItem = (id: string, name: string) => {
    const itemToDelete = db?.items.find((it) => it.id === id);
    setDB((d) => {
      d.items = d.items.filter((item) => item.id !== id);
    });
    toast.success(`Deleted "${name}" from menu`, {
      action: itemToDelete
        ? {
            label: "Undo",
            onClick: () => {
              setDB((d) => {
                d.items.push(itemToDelete);
              });
              toast.info(`Restored "${name}"`);
            },
          }
        : undefined,
    });
  };

  const add = () => {
    if (!draft.name || !draft.price) {
      toast.error("Name and counter price are required");
      return;
    }
    const finalCategory = draft.category === "custom" ? (customCat.trim().toLowerCase() || "specials") : draft.category;

    setDB((d) => {
      d.items.push({
        id: Math.random().toString(36).slice(2, 10),
        name: draft.name.trim(),
        category: finalCategory,
        price: Number(draft.price),
        onlinePrice: Number(draft.onlinePrice) || Math.round(Number(draft.price) * 1.28),
        cost: Number(draft.cost) || Math.round(Number(draft.price) * 0.45),
        active: true,
      });
    });
    setDraft({ name: "", category: "biryani", price: "", onlinePrice: "", cost: "" });
    setCustomCat("");
    toast.success(`Added ${draft.name} under ${finalCategory}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">MENU &amp; COSTS</h1>
        <p className="text-sm text-muted-foreground">
          Profit accuracy depends on these numbers. Update the plate cost whenever chicken, mutton or
          rice prices move.
        </p>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg font-bold">ADD AN ITEM OR DISH</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-6">
          <input
            placeholder="Item name (e.g. Schezwan Noodles, Chicken Fried Rice)"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
            <option value="custom">✨ + Custom / New Category...</option>
          </select>

          {draft.category === "custom" && (
            <input
              placeholder="Type New Category (e.g. Chinese, Tiffin, Juices)"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              className="sm:col-span-2 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-foreground focus:outline-none"
              autoFocus
            />
          )}

          <input
            placeholder="Counter ₹ (e.g. 180)"
            type="number"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Online ₹ (Swiggy)"
            type="number"
            value={draft.onlinePrice}
            onChange={(e) => setDraft({ ...draft, onlinePrice: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Plate cost ₹ (Meat+Rice)"
            type="number"
            value={draft.cost}
            onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={add}
          className="mt-3 rounded-full bg-gradient-ember px-6 py-2.5 text-sm font-bold text-white shadow-ember hover:opacity-95 transition-opacity"
        >
          + Add Item to Menu
        </button>
      </div>

      <div className="surface-card overflow-x-auto p-5">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-2">Item</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Counter ₹</th>
              <th className="pb-2">Online ₹</th>
              <th className="pb-2">Plate cost ₹</th>
              <th className="pb-2">Counter margin</th>
              <th className="pb-2">Live</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayItems.map((i) => (
              <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2 font-medium">{i.name}</td>
                <td className="py-2 text-muted-foreground">
                  {CATEGORIES.find((c) => c.id === i.category)?.label || (i.category ? i.category.charAt(0).toUpperCase() + i.category.slice(1) : "General")}
                </td>
                <td className="py-2">
                  <NumCell value={i.price} onChange={(v) => update(i.id, { price: v })} />
                </td>
                <td className="py-2">
                  <NumCell value={i.onlinePrice} onChange={(v) => update(i.id, { onlinePrice: v })} />
                </td>
                <td className="py-2">
                  <NumCell value={i.cost} onChange={(v) => update(i.id, { cost: v })} />
                </td>
                <td className="py-2">
                  <span className={i.price - i.cost > 0 ? "text-success" : "text-destructive"}>
                    {inr(i.price - i.cost)} ({i.price ? (((i.price - i.cost) / i.price) * 100).toFixed(0) : 0}%)
                  </span>
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => update(i.id, { active: !i.active })}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                      i.active
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-2xs"
                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                    }`}
                    title={i.active ? "Click to mark as Sold Out / Off-Menu" : "Click to mark as Serving"}
                  >
                    <span className={`size-2 rounded-full ${i.active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span>{i.active ? "Serving" : "Sold Out"}</span>
                  </button>
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(i.id, i.name)}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-2xs active:scale-95"
                    title={`Delete "${i.name}" from menu`}
                    aria-label={`Delete ${i.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
    />
  );
}
