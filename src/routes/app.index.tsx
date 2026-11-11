import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, IndianRupee, Lock, Percent, Receipt, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  dailySeries,
  filterSales,
  getActiveBranchModules,
  getActiveTenant,
  getTenantStock,
  inr,
  itemBreakdown,
  totals,
  useDB,
  type ChannelId,
} from "@/lib/pos-store";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
] as const;

function Dashboard() {
  const db = useDB();
  const [days, setDays] = useState<number>(7);
  const [branch, setBranch] = useState<string>("all");
  const [channel, setChannel] = useState<ChannelId | "all">("all");

  if (!db) return <p className="text-sm text-muted-foreground">Loading your shop data…</p>;

  const activeTenant = getActiveTenant(db);
  const activeBranchId = branch !== "all" ? branch : db.settings.activeBranchId;
  const activeModules = getActiveBranchModules(activeTenant, activeBranchId);

  if (activeModules.dashboard === false) {
    return (
      <div className="surface-card p-8 sm:p-12 text-center max-w-lg mx-auto my-12 space-y-4 rounded-3xl border border-border shadow-lg">
        <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-foreground">Executive Dashboard Disabled</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Executive Analytics Dashboard module is not enabled on your plan for{" "}
            <span className="font-bold text-foreground">{activeTenant.businessName}</span>. Please contact your system administrator to update your subscription or feature plan.
          </p>
        </div>
        <Link
          to="/app/billing"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all"
        >
          Go to Billing Terminal
        </Link>
      </div>
    );
  }

  const sales = filterSales(db, { days, branchId: branch, channel, tenantId: activeTenant.id });
  const t = totals(sales);
  const series = dailySeries(sales, Math.max(days, 7));
  const items = itemBreakdown(sales);
  const tenantStock = getTenantStock(db, activeTenant);
  const lowStock = tenantStock.filter((s) => s.qty <= s.reorderLevel);
  const margin = t.revenue ? (t.profit / t.revenue) * 100 : 0;

  const byChannel = db.channels.map((c) => {
    const cs = sales.filter((s) => s.channel === c.id);
    return { name: c.name, ...totals(cs) };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">DASHBOARD</h1>
          <p className="text-sm text-muted-foreground">
            Real profit after food cost, platform commission and packing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  days === r.days ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
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
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All channels</option>
            {db.channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={IndianRupee} label="Revenue" value={inr(t.revenue)} sub={`${t.orders} orders`} />
        <Kpi icon={TrendingUp} label="Net profit" value={inr(t.profit)} sub={`${margin.toFixed(1)}% margin`} highlight />
        <Kpi icon={Percent} label="Platform commission" value={inr(t.commission)} sub="Swiggy + Zomato cut" />
        <Kpi icon={Receipt} label="Food cost (COGS)" value={inr(t.cogs)} sub={`Packing ${inr(t.packaging)}`} />
      </div>

      {lowStock.length > 0 && (
        <div className="surface-card flex flex-wrap items-center gap-3 border-warning/40 p-4">
          <AlertTriangle className="size-5 text-warning" />
          <p className="text-sm">
            <span className="font-semibold">{lowStock.length} item(s) at or below reorder level:</span>{" "}
            {lowStock.map((s) => `${s.name} (${s.qty}${s.unit})`).join(", ")}
          </p>
          <Link to="/app/stock" className="ml-auto rounded-full bg-gradient-ember px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            Update stock
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-lg">REVENUE VS PROFIT</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-lg">PLATES SOLD BY ITEM</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items.slice(0, 8)}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={9}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(val: string) => (val && val.length > 14 ? `${val.slice(0, 13)}…` : val)}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="qty" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-x-auto p-5">
        <h2 className="text-lg">CHANNEL PROFITABILITY</h2>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-2">Channel</th>
              <th className="pb-2">Orders</th>
              <th className="pb-2">Revenue</th>
              <th className="pb-2">Commission</th>
              <th className="pb-2">Profit</th>
              <th className="pb-2">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {byChannel.map((c) => (
              <tr key={c.name}>
                <td className="py-2.5 font-medium">{c.name}</td>
                <td className="py-2.5">{c.orders}</td>
                <td className="py-2.5">{inr(c.revenue)}</td>
                <td className="py-2.5 text-destructive">{inr(c.commission)}</td>
                <td className="py-2.5 text-success">{inr(c.profit)}</td>
                <td className="py-2.5">{c.revenue ? ((c.profit / c.revenue) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`surface-card p-5.5 transition-all hover:border-primary/50 ${highlight ? "border-primary/70 bg-primary/10 shadow-ember ring-1 ring-primary/30" : "shadow-card"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-black">
        <Icon className="size-4.5 text-primary shrink-0" />
        <span className="font-black text-foreground text-xs tracking-wider">{label}</span>
      </div>
      <p className={`mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="mt-1.5 text-xs font-extrabold text-foreground/85 tracking-wide">
        {sub}
      </p>
    </div>
  );
}
