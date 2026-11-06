import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, Calculator, FileSpreadsheet, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  filterSales,
  forecastQty,
  inr,
  itemBreakdown,
  totals,
  useDB,
  getActiveTenant,
  getTenantItems,
  type ChannelId,
} from "@/lib/pos-store";

export const Route = createFileRoute("/app/reports")({
  component: Reports,
});

function Reports() {
  const db = useDB();
  const [days, setDays] = useState(30);
  const [branch, setBranch] = useState("all");
  const [channel, setChannel] = useState<ChannelId | "all">("all");
  const [showFormulas, setShowFormulas] = useState(false);

  if (!db) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const sales = filterSales(db, { days, branchId: branch, channel });
  const t = totals(sales);
  const rows = itemBreakdown(sales);
  const allSales = filterSales(db, { days: 60, branchId: branch });

  const exportCsv = () => {
    const header = "Item,Plates sold,Revenue,Profit,Profit per plate,Suggested prep tomorrow";
    const body = rows
      .map((r) => {
        const item = (getTenantItems(db, getActiveTenant(db))).find((i) => i.name.toLowerCase() === r.name.toLowerCase() || i.id === r.itemId) || db.items.find((i) => i.name.toLowerCase() === r.name.toLowerCase() || i.id === r.itemId);
        const f = forecastQty(allSales, item?.id || r.name, new Date(Date.now() + 864e5));
        return [r.name, r.qty, Math.round(r.revenue), Math.round(r.profit), Math.round(r.profit / r.qty), f].join(",");
      })
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spotlight-report-${days}d.csv`;
    a.click();
  };

  const exportPdf = () => {
    window.print();
  };

  const branchName = branch === "all" ? "All Outlets (Consolidated)" : db.branches.find((b) => b.id === branch)?.name || branch;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">REPORTS &amp; FORECAST</h1>
          <p className="text-sm text-muted-foreground">
            Item-wise plates sold, profit per plate, and how many to prep tomorrow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs sm:text-sm font-semibold"
          >
            <option value={1}>Today (Day-End Z-Report)</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs sm:text-sm font-semibold"
          >
            <option value="all">All branches</option>
            {db.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelId | "all")}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs sm:text-sm font-semibold"
          >
            <option value="all">All channels</option>
            {db.channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Excel / CSV Export Button */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs sm:text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-all shadow-2xs"
            title="Download raw data to open in Microsoft Excel or Google Sheets (Editable, Formulas, Sharing)"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" /> Excel / CSV
          </button>

          {/* Download / Print PDF Report Button */}
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-2xs"
            title="Print or Save official PDF P&L Statement (Z-Report)"
          >
            <Printer className="size-4" /> Download / Print PDF
          </button>
        </div>
      </div>

      {/* Official Print Header (Only visible on paper / PDF) */}
      <div className="hidden print:block border-b-2 border-black pb-4 text-center">
        <h2 className="text-2xl font-black font-display tracking-wider">SPOT LIGHT BIRIYANI</h2>
        <p className="text-xs uppercase tracking-widest text-gray-600">Executive P&amp;L Financial Report &amp; Day-End Summary</p>
        <p className="text-xs mt-1">Branch: <strong>{branchName}</strong> · Period: <strong>{days === 1 ? "Today" : `Last ${days} Days`}</strong></p>
        <p className="text-[10px] text-gray-500 mt-0.5">GSTIN: {db.settings.printerSettings?.gstin || "33AAAAA0000A1Z5"} · FSSAI: {db.settings.printerSettings?.fssaiNumber || "12424008000456"}</p>
      </div>

      <div className="surface-card grid gap-4 p-5 sm:grid-cols-4">
        <Stat label="Orders" value={String(t.orders)} />
        <Stat label="Revenue" value={inr(t.revenue)} />
        <Stat label="Profit" value={inr(t.profit)} accent />
        <Stat label="Avg bill" value={inr(t.orders ? t.revenue / t.orders : 0)} />
      </div>

      <div className="surface-card overflow-x-auto p-5">
        <div className="flex items-center justify-between pb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-display">ITEM-WISE PERFORMANCE &amp; KITCHEN PREP</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              "Prep tomorrow" weighted forecast (checked at Night Day-Close 10:00 PM to order raw meat &amp; rice for morning cooking).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFormulas(!showFormulas)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all print:hidden"
          >
            <Calculator className="size-3.5" />
            {showFormulas ? "Hide Formulas" : "View Embedded Formulas & Math"}
          </button>
        </div>

        {/* Formulas Explanations Card */}
        {showFormulas && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground space-y-2 animate-in fade-in print:hidden">
            <h3 className="font-bold text-primary flex items-center gap-1.5 text-sm">
              <Sparkles className="size-4" /> Embedded Restaurant P&amp;L Formulas in Spot Light POS:
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 text-muted-foreground">
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">Revenue:</strong> Σ (Item Price × Quantity Sold) − Discounts Given
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">COGS (Food Cost):</strong> Σ (Ingredient Batch Cost per Plate × Quantity Sold)
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">Aggregator Commission:</strong> Net Sales on Swiggy/Zomato × 23–28%
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">Net Profit:</strong> Revenue − COGS − Platform Commission − Packaging
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">Margin %:</strong> (Net Profit ÷ Revenue) × 100
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border/60">
                <strong className="text-foreground">Tomorrow Prep Forecast:</strong> Weighted average of last 4 same weekdays (40% W1 + 30% W2 + 20% W3 + 10% W4) with new-branch smart fallback. Review at Night Day-Close (10:00 PM) for early-morning meat &amp; rice procurement.
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              💡 <em>To edit individual line items or run custom spreadsheet formulas (=SUM, =AVERAGE), click <strong>Excel / CSV</strong> above to download directly to Microsoft Excel or Google Sheets.</em>
            </p>
          </div>
        )}

        <table className="mt-2 w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-2">Item</th>
              <th className="pb-2">Plates</th>
              <th className="pb-2">Revenue</th>
              <th className="pb-2">Profit</th>
              <th className="pb-2">Profit / plate</th>
              <th className="pb-2">Prep tomorrow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r) => {
              const item = (getTenantItems(db, getActiveTenant(db))).find((i) => i.name.toLowerCase() === r.name.toLowerCase() || i.id === r.itemId) || db.items.find((i) => i.name.toLowerCase() === r.name.toLowerCase() || i.id === r.itemId);
              const f = forecastQty(allSales, item?.id || r.name, new Date(Date.now() + 864e5));
              return (
                <tr key={r.name}>
                  <td className="py-2.5 font-medium">{r.name}</td>
                  <td className="py-2.5">{r.qty}</td>
                  <td className="py-2.5">{inr(r.revenue)}</td>
                  <td className="py-2.5 text-success">{inr(r.profit)}</td>
                  <td className="py-2.5">{inr(r.profit / r.qty)}</td>
                  <td className="py-2.5 font-semibold text-primary">{f} plates</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg">WHERE THE MONEY WENT</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Line label="Revenue collected" value={inr(t.revenue)} />
          <Line label="Discounts given" value={inr(t.discount)} />
          <Line label="Food cost (COGS)" value={inr(t.cogs)} />
          <Line label="Platform commission" value={inr(t.commission)} />
          <Line label="Packing cost" value={inr(t.packaging)} />
          <Line label="Net profit" value={inr(t.profit)} accent />
        </dl>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-semibold ${accent ? "text-success" : ""}`}>{value}</dd>
    </div>
  );
}
