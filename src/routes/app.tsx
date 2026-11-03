import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BarChart3, Boxes, Database, Flame, LayoutDashboard, LogOut, Moon, Receipt, Settings, ShieldCheck, Sun, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getDB, setDB, useDB } from "@/lib/pos-store";
import { performFullSync } from "@/lib/neon-sync";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Spot Light Manager — Billing, Stock & Profit" },
      {
        name: "description",
        content:
          "Owner app for Spot Light Biriyani: counter billing, live stock, item-wise plate counts, Swiggy/Zomato commission and true profit per order across all branches.",
      },
      { property: "og:title", content: "Spot Light Manager" },
      { property: "og:description", content: "Billing, stock and real profit tracking for a multi-branch biriyani shop." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

const LINKS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ["owner", "developer"] },
  { to: "/app/billing", label: "Billing", icon: Receipt, roles: ["owner", "cashier", "developer"] },
  { to: "/app/reports", label: "Reports & Forecast", icon: BarChart3, roles: ["owner", "developer"] },
  { to: "/app/stock", label: "Stock", icon: Boxes, roles: ["owner", "kitchen", "developer"] },
  { to: "/app/items", label: "Menu & Costs", icon: UtensilsCrossed, roles: ["owner", "developer"] },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["owner", "developer"] },
] as const;

function AppLayout() {
  const db = useDB();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Automatic background sync on initial load
  useEffect(() => {
    performFullSync().catch(() => {});
  }, []);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const res = await performFullSync();
      if (res.success) {
        toast.success(res.message, {
          icon: <Database className="size-4 text-primary" />,
        });
      } else {
        toast.warning(res.message);
      }
    } catch (err: any) {
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  const [currentUser, setCurrentUser] = useState<string>("Staff");
  const [currentRole, setCurrentRole] = useState<string>("owner");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("spotlight_pos_theme") === "dark") {
        setIsDarkMode(true);
      }
      const role = localStorage.getItem("spotlight_auth_role") || "owner";
      const user = localStorage.getItem("spotlight_auth_user") || "Restaurant Owner (Admin)";
      setCurrentRole(role);
      setCurrentUser(user);

      // Role-based route guard
      const path = window.location.pathname;
      if (role === "cashier" && path !== "/app/billing") {
        window.location.href = "/app/billing";
      } else if (role === "kitchen" && path !== "/app/stock") {
        window.location.href = "/app/stock";
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spotlight_auth_role");
      localStorage.removeItem("spotlight_auth_user");
      window.location.href = "/login";
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("spotlight_pos_theme", next ? "dark" : "light");
      return next;
    });
  };

  const visibleLinks = LINKS.filter((l) => (l.roles as readonly string[]).includes(currentRole));

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground ${isDarkMode ? "dark" : ""}`}>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 sm:px-6 lg:px-8 py-2.5">
          <Link to="/app" className="flex items-center gap-2 group shrink-0">
            <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-gradient-ember shadow-ember group-hover:scale-105 transition-transform">
              <Flame className="size-3.5 sm:size-4 text-white" />
            </span>
            <span className="font-display font-black text-base sm:text-lg tracking-wide whitespace-nowrap">SPOT LIGHT MANAGER</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Active User Role Badge */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span className="font-bold text-foreground">{currentUser}</span>
            </div>

            {/* Neon Cloud PostgreSQL Sync */}
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs active:scale-98"
              title="Sync with Neon Cloud PostgreSQL (pushes bills, pulls live dishes & prices)"
            >
              <Database className={`size-3 sm:size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Neon Cloud"}</span>
            </button>

            {/* Royal White / Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 rounded-lg border border-border bg-card p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors shadow-2xs"
              title="Switch Theme"
            >
              {isDarkMode ? <Moon className="size-3.5 text-primary" /> : <Sun className="size-3.5 text-amber-500" />}
              <span className="hidden sm:inline">{isDarkMode ? "Dark" : "Light"}</span>
            </button>

            {/* Branch Selector */}
            <select
              value={db?.settings.activeBranchId ?? ""}
              onChange={(e) =>
                setDB((d) => {
                  d.settings.activeBranchId = e.target.value;
                })
              }
              className="rounded-lg border border-input bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold max-w-[130px] sm:max-w-none truncate"
            >
              {(db ?? getDB()).branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors shadow-2xs"
              title="Lock Terminal & Log Out"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2">
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-primary/15 text-primary font-bold shadow-xs" }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
