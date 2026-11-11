import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { BarChart3, Boxes, Database, Flame, LayoutDashboard, LogOut, MapPin, Moon, Receipt, Settings, ShieldAlert, ShieldCheck, Smartphone, Sun, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getActiveBranchModules, getActiveTenant, getDB, setDB, TenantModules, useDB } from "@/lib/pos-store";
import { performFullSync } from "@/lib/neon-sync";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const sessionActive = sessionStorage.getItem("spotlight_session_active") === "true";
      const role = localStorage.getItem("spotlight_auth_role");
      if (!sessionActive || !role) {
        throw redirect({ to: "/login" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "RestoPulse Cloud ERP & POS Terminal" },
      {
        name: "description",
        content:
          "Multi-tenant restaurant terminal for counter billing, kitchen KDS, dynamic UPI QR, live deg stock, and multi-branch operations.",
      },
      { property: "og:title", content: "RestoPulse POS Terminal" },
      { property: "og:description", content: "Billing, stock and real profit tracking for restaurant operators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

type NavLinkItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  roles: readonly string[];
  module?: keyof TenantModules;
};

const LINKS: readonly NavLinkItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ["owner"] },
  { to: "/app/billing", label: "Billing & Floor POS", icon: Receipt, roles: ["owner", "cashier", "waiter"], module: "billing" },
  { to: "/app/captain", label: "Captain POS", icon: Smartphone, roles: ["owner", "cashier", "waiter"], module: "tables" },
  { to: "/app/reports", label: "Reports & Forecast", icon: BarChart3, roles: ["owner"], module: "reports" },
  { to: "/app/stock", label: "Stock & Deg", icon: Boxes, roles: ["owner", "kitchen"], module: "stock" },
  { to: "/app/items", label: "Menu & Costs", icon: UtensilsCrossed, roles: ["owner"], module: "menu" },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["owner"] },
  { to: "/app/developer", label: "Dev Console", icon: ShieldAlert, roles: ["developer"] },
];

function AppLayout() {
  const db = useDB();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("Staff");
  const [currentRole, setCurrentRole] = useState<string>("");

  // Automatic background sync on initial load, on tab focus, and every 45s
  useEffect(() => {
    performFullSync().catch(() => {});

    const interval = setInterval(() => {
      performFullSync().catch(() => {});
    }, 45000);

    const onFocus = () => {
      performFullSync().catch(() => {});
    };
    window.addEventListener("focus", onFocus);

    const onOnline = () => {
      toast.info("Internet connection restored! Syncing with Neon Cloud...", {
        icon: <Database className="size-4 text-primary" />,
      });
      performFullSync().catch(() => {});
    };
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("spotlight_pos_theme") === "dark") {
        setIsDarkMode(true);
      }
      const sessionActive = sessionStorage.getItem("spotlight_session_active") === "true";
      const role = localStorage.getItem("spotlight_auth_role");
      if (!sessionActive || !role) {
        // Strict Auth Guard: redirect unauthenticated access directly to /login
        window.location.replace("/login");
        return;
      }
      const user = localStorage.getItem("spotlight_auth_user") || "Restaurant Staff";
      setCurrentRole(role);
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Role-based route guard
      const path = window.location.pathname;
      if (role === "developer" && path === "/app") {
        window.location.replace("/app/developer");
        return;
      } else if (role === "cashier" && path !== "/app/billing") {
        window.location.href = "/app/billing";
      } else if (role === "kitchen" && path !== "/app/stock") {
        window.location.href = "/app/stock";
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("spotlight_session_active");
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

  const activeTenant = getActiveTenant(db);
  const activeBranchId =
    (activeTenant.branches && activeTenant.branches.some((b) => b.id === db?.settings.activeBranchId))
      ? db?.settings.activeBranchId
      : activeTenant.branches?.[0]?.id;
  const activeModules = getActiveBranchModules(activeTenant, activeBranchId);

  const visibleLinks = LINKS.filter((l) => {
    // 1. DEVELOPER ROLE: ONLY show Dev Console, completely isolated from restaurant operational screens
    if (currentRole === "developer") {
      return l.to === "/app/developer";
    }

    // 2. CLIENT RESTAURANT STAFF (owner, cashier, waiter, kitchen):
    // Never show Dev Console to client tenants
    if (l.to === "/app/developer") return false;

    // Check staff role permissions
    if (!l.roles.includes(currentRole)) return false;

    // Check client tenant feature entitlement modules
    if (l.module && activeModules[l.module] === false) {
      return false;
    }

    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Flame className="size-6 text-primary" />
          </span>
          <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground ${isDarkMode ? "dark" : ""}`}>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-xl shadow-xs">
        {currentRole === "developer" ? (
          /* DEVELOPER SUPER-ADMIN TOP BAR (Isolated from restaurant operations) */
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-3 sm:px-6 lg:px-8 h-14">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 shadow-md text-white font-black shrink-0">
                <ShieldAlert className="size-5" />
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm sm:text-base tracking-wide leading-none text-foreground truncate">
                    {db?.saasPlatformName || "RESTOPULSE"} SUPER-ADMIN
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.2 leading-tight shrink-0">
                    Control Plane
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground leading-tight mt-0.5 truncate">
                  Platform Multi-Tenant Master Backoffice
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs shadow-2xs">
                <ShieldCheck className="size-3.5 text-red-600" />
                <span className="font-bold text-red-600">Platform Developer</span>
              </div>

              {/* Neon Cloud PostgreSQL Sync */}
              <button
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs active:scale-98"
                title="Sync with Neon Cloud PostgreSQL"
              >
                <Database className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Neon Cloud"}</span>
              </button>

              {/* Dark / Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-lg border border-border bg-card size-8 sm:w-auto sm:px-2.5 sm:py-1 text-xs font-semibold text-foreground hover:border-primary transition-colors shadow-2xs"
                title="Switch Theme"
              >
                {isDarkMode ? <Moon className="size-3.5 text-primary" /> : <Sun className="size-3.5 text-amber-500" />}
                <span className="hidden sm:inline sm:ml-1">{isDarkMode ? "Dark" : "Light"}</span>
              </button>

              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 size-8 sm:w-auto sm:px-2.5 sm:py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors shadow-2xs"
                title="Lock Terminal & Log Out"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline sm:ml-1">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MOBILE TOP BAR (< sm: 640px): Compact, zero overlap, touch friendly */}
            <div className="flex sm:hidden items-center justify-between gap-2 px-3 h-13 border-b border-border/40">
              {/* Left: Brand + Active Restaurant Name */}
              <Link to="/app" className="flex items-center gap-2 min-w-0">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white shrink-0 shadow-xs">
                  <Flame className="size-4" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-xs text-foreground truncate max-w-[130px] leading-tight">
                    {activeTenant.businessName || "Restaurant"}
                  </span>
                  <span className="text-[9px] font-bold text-primary truncate leading-tight">
                    {db?.saasPlatformName || "RestoPulse"} Cloud POS
                  </span>
                </div>
              </Link>

              {/* Right: Branch Selector + Theme + Logout */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Branch dropdown */}
                <div className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] shadow-2xs">
                  <MapPin className="size-3 text-primary shrink-0" />
                  <select
                    value={
                      (activeTenant.branches && activeTenant.branches.some((b) => b.id === db?.settings.activeBranchId))
                        ? (db?.settings.activeBranchId ?? "")
                        : (activeTenant.branches?.[0]?.id ?? "")
                    }
                    onChange={(e) => {
                      const targetBranchId = e.target.value;
                      const branchesList = activeTenant.branches && activeTenant.branches.length > 0 ? activeTenant.branches : (db ?? getDB()).branches;
                      const targetBranch = branchesList.find((b) => b.id === targetBranchId);
                      setDB((d) => {
                        d.settings.activeBranchId = targetBranchId;
                        if (d.tenants) {
                          const t = d.tenants.find((item) => item.id === activeTenant.id);
                          if (t && targetBranch) {
                            t.activeBranchName = targetBranch.name;
                            t.address = targetBranch.address || t.address;
                            t.phone = targetBranch.phone || t.phone;
                          }
                        }
                      });
                      toast.success(`Branch: ${targetBranch?.name || targetBranchId}`);
                    }}
                    className="rounded border-none bg-transparent py-0 text-[11px] font-bold text-primary focus:outline-none cursor-pointer max-w-[95px] truncate"
                    title="Select restaurant branch"
                  >
                    {(activeTenant.branches && activeTenant.branches.length > 0
                      ? activeTenant.branches
                      : (db ?? getDB()).branches
                    ).map((b) => (
                      <option key={b.id} value={b.id} className="bg-card text-foreground font-medium">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center rounded-lg border border-border bg-card size-7 text-xs font-semibold text-foreground hover:border-primary transition-colors shadow-2xs"
                  title="Switch Theme"
                >
                  {isDarkMode ? <Moon className="size-3 text-primary" /> : <Sun className="size-3 text-amber-500" />}
                </button>

                {/* Logout Action */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 size-7 text-destructive hover:bg-destructive/20 transition-colors shadow-2xs"
                  title="Lock Terminal & Log Out"
                >
                  <LogOut className="size-3" />
                </button>
              </div>
            </div>

            {/* DESKTOP / TABLET TOP BAR (>= sm: 640px): Full Brand & Enterprise Controls */}
            <div className="hidden sm:flex mx-auto max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8 h-14">
              {/* LEFT: SaaS Platform Brand + Active Restaurant */}
              <div className="flex items-center gap-3 min-w-0">
                <Link to="/app" className="flex items-center gap-2.5 group shrink-0">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 shadow-md group-hover:scale-105 transition-transform text-white">
                    <Flame className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-sm sm:text-base tracking-wide leading-none text-foreground">
                        {db?.saasPlatformName || "RESTOPULSE"}
                      </span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.2 leading-tight">
                        Cloud POS
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground leading-tight mt-0.5 truncate">
                      Enterprise Restaurant OS
                    </span>
                  </div>
                </Link>
              </div>

              {/* RIGHT: Unified Client Restaurant & Branch Selector */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 1. Distinct Restaurant Brand Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs shadow-2xs">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-extrabold text-foreground tracking-tight whitespace-nowrap">
                    {activeTenant.businessName || db?.settings?.businessName || "Restaurant"}
                  </span>
                </div>

                {/* 2. Independent Branch Location Selector */}
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs shadow-2xs">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <select
                    value={
                      (activeTenant.branches && activeTenant.branches.some((b) => b.id === db?.settings.activeBranchId))
                        ? (db?.settings.activeBranchId ?? "")
                        : (activeTenant.branches?.[0]?.id ?? "")
                    }
                    onChange={(e) => {
                      const targetBranchId = e.target.value;
                      const branchesList = activeTenant.branches && activeTenant.branches.length > 0 ? activeTenant.branches : (db ?? getDB()).branches;
                      const targetBranch = branchesList.find((b) => b.id === targetBranchId);
                      setDB((d) => {
                        d.settings.activeBranchId = targetBranchId;
                        if (d.tenants) {
                          const t = d.tenants.find((item) => item.id === activeTenant.id);
                          if (t && targetBranch) {
                            t.activeBranchName = targetBranch.name;
                            t.address = targetBranch.address || t.address;
                            t.phone = targetBranch.phone || t.phone;
                          }
                        }
                      });
                      toast.success(`Active branch switched to ${targetBranch?.name || targetBranchId}`);
                    }}
                    className="rounded-md border-none bg-transparent py-0 text-xs font-bold text-primary focus:outline-none cursor-pointer max-w-[125px] sm:max-w-[170px] truncate"
                    title="Select active restaurant branch"
                  >
                    {(activeTenant.branches && activeTenant.branches.length > 0
                      ? activeTenant.branches
                      : (db ?? getDB()).branches
                    ).map((b) => (
                      <option key={b.id} value={b.id} className="bg-card text-foreground font-medium">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Neon Cloud PostgreSQL Sync */}
                <button
                  onClick={handleCloudSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs active:scale-98"
                  title="Sync with Neon Cloud PostgreSQL"
                >
                  <Database className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Neon Cloud"}</span>
                </button>

                {/* Dark / Light Mode Switcher */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center rounded-lg border border-border bg-card size-8 sm:w-auto sm:px-2.5 sm:py-1 text-xs font-semibold text-foreground hover:border-primary transition-colors shadow-2xs"
                  title="Switch Theme"
                >
                  {isDarkMode ? <Moon className="size-3.5 text-primary" /> : <Sun className="size-3.5 text-amber-500" />}
                  <span className="hidden sm:inline sm:ml-1">{isDarkMode ? "Dark" : "Light"}</span>
                </button>

                {/* Logout Action */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 size-8 sm:w-auto sm:px-2.5 sm:py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors shadow-2xs"
                  title="Lock Terminal & Log Out"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline sm:ml-1">Logout</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* BOTTOM NAV TABS: Smooth horizontal scrollable bar, no wrapping */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-6 lg:px-8 pb-1.5 pt-0.5 no-scrollbar">
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-primary/15 text-primary font-bold shadow-xs border-primary/30" }}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg border border-transparent px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all whitespace-nowrap"
            >
              <l.icon className="size-3.5 sm:size-4" />
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
