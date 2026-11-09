import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Code2, Download, Eye, EyeOff, Flame, KeyRound, Lock, RefreshCw, Shield, Smartphone, Sparkles, Terminal, Upload, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_TENANTS, getDB, setDB, switchClientTenant, TenantConfig, useDB } from "@/lib/pos-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff & Terminal Gateway — RestoPulse Enterprise POS & Cloud ERP" },
      {
        name: "description",
        content: "Secure terminal authentication portal for Restaurant Owners, Cashiers, Kitchen Chefs, and System Architects.",
      },
    ],
  }),
  component: LoginPage,
});

type PortalType = "customer" | "staff";
type CustomerMode = "login" | "signup";
type RoleTab = "owner" | "cashier" | "waiter" | "kitchen" | "developer";

function LoginPage() {
  const db = useDB();
  const navigate = useNavigate();
  const [portalType, setPortalType] = useState<PortalType>("staff");
  const [customerMode, setCustomerMode] = useState<CustomerMode>("login");
  const [role, setRole] = useState<RoleTab>("owner");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("spotlight-biriyani");

  // Customer Form Fields
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custLocation, setCustLocation] = useState("Tharamani Flagship");

  // Staff Form Fields
  const [cashierBranch, setCashierBranch] = useState("taramani");
  const [ownerEmail, setOwnerEmail] = useState("owner@spotlight.in");
  const [ownerPassword, setOwnerPassword] = useState("spotlight2026");
  const [cashierPin, setCashierPin] = useState("1234");
  const [waiterPin, setWaiterPin] = useState("2002");
  const [kitchenPin, setKitchenPin] = useState("5555");
  const [devKey, setDevKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Developer Panel State
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [dbJson, setDbJson] = useState("");

  // Helper to ensure all default tenants (including Manam) are always present even with old local cache
  const getMergedTenants = (dbTenants?: TenantConfig[]): TenantConfig[] => {
    const fromDB = Array.isArray(dbTenants) ? dbTenants : [];
    const merged: TenantConfig[] = [];
    const manamDefault = DEFAULT_TENANTS.find((t) => t.id === "manam-restaurant") || DEFAULT_TENANTS[0]!;
    const existingManam = fromDB.find((t) => t.id === "manam-restaurant" || t.id === "manam");
    if (existingManam) {
      merged.push({
        ...manamDefault,
        ...existingManam,
        id: "manam-restaurant",
        degBatchEnabled: true,
        loginUsername: existingManam.loginUsername || "owner@manam.in",
        loginPassword: existingManam.loginPassword || "manam2026",
        cashierPin: existingManam.cashierPin || "4001",
        kitchenPin: existingManam.kitchenPin || "5555",
      });
    } else {
      merged.push({ ...manamDefault, degBatchEnabled: true });
    }

    // Then add the rest of DEFAULT_TENANTS
    DEFAULT_TENANTS.forEach((dt) => {
      if (dt.id === "manam-restaurant") return;
      const existing = fromDB.find((t) => t.id === dt.id);
      if (existing) {
        merged.push({ ...dt, ...existing });
      } else {
        merged.push({ ...dt });
      }
    });

    // Then any custom provisioned tenants
    fromDB.forEach((t) => {
      if (t.id !== "manam-restaurant" && t.id !== "manam" && !DEFAULT_TENANTS.some((dt) => dt.id === t.id)) {
        merged.push(t);
      }
    });
    return merged;
  };

  // Sync state with URL search param and tenant store on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get("tenant");
      const targetId = tenantParam || "spotlight-biriyani";
      setSelectedTenantId(targetId);
      if (tenantParam) {
        switchClientTenant(tenantParam);
      }

      const dbInst = getDB();
      const tenantsList = getMergedTenants(dbInst.tenants);
      const match = tenantsList.find((t) => t.id === targetId) || tenantsList[0];
      if (match) {
        if (match.loginUsername) setOwnerEmail(match.loginUsername);
        if (match.loginPassword) setOwnerPassword(match.loginPassword);
        if (match.cashierPin) setCashierPin(match.cashierPin);
        if (match.kitchenPin) setKitchenPin(match.kitchenPin);
        if (match.branches && match.branches.length > 0 && match.branches[0]) {
          setCashierBranch(match.branches[0].id);
        }
      }
    }
  }, []);

  const handleTenantChange = (tId: string) => {
    setSelectedTenantId(tId);
    switchClientTenant(tId);
    const dbInst = getDB();
    const tenantsList = getMergedTenants(dbInst.tenants);
    const match = tenantsList.find((t) => t.id === tId) || tenantsList[0];
    if (match) {
      if (match.loginUsername) setOwnerEmail(match.loginUsername);
      if (match.loginPassword) setOwnerPassword(match.loginPassword);
      if (match.cashierPin) setCashierPin(match.cashierPin);
      if (match.kitchenPin) setKitchenPin(match.kitchenPin);
      if (match.branches && match.branches.length > 0 && match.branches[0]) {
        setCashierBranch(match.branches[0].id);
      }
      toast.info(`Switched terminal context to ${match.businessName}`);
    }
  };

  const dbInst = getDB();
  const tenantsList: TenantConfig[] = getMergedTenants(dbInst.tenants);
  const fallbackTenant: TenantConfig = DEFAULT_TENANTS[0]!;
  const currentTenant: TenantConfig = tenantsList.find((t) => t.id === selectedTenantId) || tenantsList[0] || fallbackTenant;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone.trim()) {
      toast.error("Please enter your mobile phone number");
      return;
    }
    const name = custName.trim() || "Foodie Diner";
    localStorage.setItem("spotlight_customer_phone", custPhone.trim());
    localStorage.setItem("spotlight_customer_name", name);
    localStorage.setItem("spotlight_customer_branch", custLocation);

    toast.success(
      customerMode === "signup"
        ? `Welcome to ${currentTenant.businessName}, ${name}! Your profile is ready.`
        : `Welcome back, ${name}! Redirecting to Live Menu...`
    );
    setTimeout(() => {
      if (selectedTenantId === "manam-restaurant") {
        navigate({ to: "/manam", replace: true });
      } else {
        navigate({ to: "/menu", replace: true });
      }
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "owner") {
      const isMatch =
        (currentTenant.loginPassword && ownerPassword === currentTenant.loginPassword) ||
        ownerPassword === "9999" ||
        ownerPassword === "spotlight2026" ||
        ownerPassword === "manam2026" ||
        ownerPassword === "csk2026";

      if (isMatch) {
        switchClientTenant(currentTenant.id);
        sessionStorage.setItem("spotlight_session_active", "true");
        sessionStorage.setItem("restopulse_session_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_role", "owner");
        sessionStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Owner`);
        localStorage.setItem("spotlight_auth_role", "owner");
        localStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        localStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Owner`);
        toast.success(`Authenticated as Owner — ${currentTenant.businessName}`);
        navigate({ to: "/app", search: { tenant: currentTenant.id }, replace: true });
      } else {
        toast.error(`Invalid credentials. Demo password for ${currentTenant.businessName}: ${currentTenant.loginPassword || "manam2026"}`);
      }
    } else if (role === "cashier") {
      const validPin = currentTenant.cashierPin || "1234";
      const isPinMatch =
        cashierPin === validPin ||
        cashierPin === "1234" ||
        cashierPin === "1001" ||
        cashierPin === "4001" ||
        cashierPin === "0000";

      if (isPinMatch) {
        switchClientTenant(currentTenant.id);
        setDB((d) => {
          d.settings.activeBranchId = cashierBranch || (currentTenant.branches && currentTenant.branches[0] ? currentTenant.branches[0].id : "main");
        });
        sessionStorage.setItem("spotlight_session_active", "true");
        sessionStorage.setItem("restopulse_session_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_role", "cashier");
        sessionStorage.setItem("spotlight_auth_branch", cashierBranch);
        sessionStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Cashier`);
        localStorage.setItem("spotlight_auth_role", "cashier");
        localStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        localStorage.setItem("spotlight_auth_branch", cashierBranch);
        localStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Cashier`);
        toast.success(`Billing Terminal Unlocked — ${currentTenant.businessName}`);
        navigate({ to: "/app/billing", search: { tenant: currentTenant.id }, replace: true });
      } else {
        toast.error(`Incorrect Cashier PIN. Assigned PIN for ${currentTenant.businessName}: ${currentTenant.cashierPin || "4001"}`);
      }
    } else if (role === "waiter") {
      const validPin = currentTenant.cashierPin || "4001";
      const isPinMatch =
        waiterPin === "2002" ||
        waiterPin === validPin ||
        waiterPin === "1234" ||
        waiterPin === "4001" ||
        waiterPin === "9999" ||
        waiterPin === "0000";

      if (isPinMatch) {
        switchClientTenant(currentTenant.id);
        sessionStorage.setItem("spotlight_session_active", "true");
        sessionStorage.setItem("restopulse_session_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_role", "waiter");
        sessionStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Captain`);
        localStorage.setItem("spotlight_auth_role", "waiter");
        localStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        localStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Captain`);
        toast.success(`Captain Tableside POS Unlocked — ${currentTenant.businessName}`);
        navigate({ to: "/app/captain", search: { tenant: currentTenant.id }, replace: true });
      } else {
        toast.error(`Incorrect Captain PIN. Enter 2002 or ${currentTenant.cashierPin || "4001"}`);
      }
    } else if (role === "kitchen") {
      const validPin = currentTenant.kitchenPin || "5555";
      if (kitchenPin === validPin || kitchenPin === "5555") {
        switchClientTenant(currentTenant.id);
        sessionStorage.setItem("spotlight_session_active", "true");
        sessionStorage.setItem("restopulse_session_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        sessionStorage.setItem("spotlight_auth_role", "kitchen");
        sessionStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Kitchen Chef`);
        localStorage.setItem("spotlight_auth_role", "kitchen");
        localStorage.setItem("spotlight_auth_tenant", currentTenant.id);
        localStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Kitchen Chef`);
        toast.success(`Kitchen Terminal Unlocked — ${currentTenant.businessName}`);
        navigate({ to: "/app/stock", search: { tenant: currentTenant.id }, replace: true });
      } else {
        toast.error(`Incorrect Kitchen PIN. Chef PIN is ${currentTenant.kitchenPin || "5555"}`);
      }
    } else if (role === "developer") {
      if (devKey === "dev@spotlight2026" || devKey === "admin" || devKey === "9999" || devKey === "restrostack2026" || devKey === "restopulse2026") {
        sessionStorage.setItem("spotlight_session_active", "true");
        localStorage.setItem("spotlight_auth_role", "developer");
        localStorage.setItem("spotlight_auth_user", "System Architect & Super-Admin");
        toast.success("Super-Admin Developer Console Unlocked");
        navigate({ to: "/app/developer", replace: true });
      } else {
        toast.error("Invalid Developer Security Key. Try: admin or 9999");
      }
    }
  };

  const handleExportDB = () => {
    const data = JSON.stringify(getDB(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restopulse_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Database backup exported successfully!");
  };

  const handleResetFactory = () => {
    if (confirm("Are you sure you want to reset all data to default factory settings?")) {
      localStorage.removeItem("spotlight_pos_db");
      window.location.reload();
    }
  };

  const activeBranches = currentTenant.branches && currentTenant.branches.length > 0
    ? currentTenant.branches
    : [{ id: "main", name: currentTenant.activeBranchName || "Main Branch", address: currentTenant.address, phone: currentTenant.phone }];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Neutral SaaS Global Header */}
      <header className="border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white font-black text-sm shadow-sm">
              ⚡
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-sm tracking-wide text-foreground">
                  {db?.saasPlatformName || "RESTOPULSE"}
                </span>
                <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                  Cloud ERP &amp; POS
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold leading-none">
                Enterprise Multi-Tenant Gateway
              </span>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Terminals Online</span>
            </span>

            <Link
              to="/"
              className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
            >
              Platform Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative mx-auto max-w-4xl px-4 py-8 sm:py-12 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Ambient Culinary SaaS Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-primary/8 to-orange-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Shield className="size-3.5" /> {db?.saasPlatformName || "RestoPulse"} Enterprise Platform
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-display font-black tracking-tight text-foreground">
              TERMINAL &amp; STAFF GATEWAY
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              Select your restaurant and role to access your dedicated billing terminal, KDS, and reports.
            </p>
          </div>

          {/* Portal Switcher: Customer vs Staff */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-2xl border border-border bg-card p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setPortalType("staff")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                  portalType === "staff"
                    ? "bg-gradient-ember text-white shadow-ember"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="size-3.5" />
                <span>Staff &amp; Terminal Login</span>
              </button>
              <button
                type="button"
                onClick={() => setPortalType("customer")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                  portalType === "customer"
                    ? "bg-gradient-ember text-white shadow-ember"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="size-3.5" />
                <span>Diner / Customer Portal</span>
              </button>
            </div>
          </div>

          {portalType === "customer" ? (
            /* Diner / Customer Sign In & Sign Up Form */
            <div className="relative mt-6 mx-auto max-w-md rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-md p-6 sm:p-7 shadow-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary/30 before:via-primary before:to-amber-500/30">
              <div className="flex flex-col items-center justify-center gap-1 mb-4 pb-3 border-b border-border/60 text-center">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-ember text-white shadow-xs">
                    <Utensils className="size-3.5" />
                  </span>
                  <span className="font-display font-black text-xs uppercase tracking-wider text-foreground">
                    {currentTenant.businessName}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {currentTenant.activeBranchName} · Customer Ordering Portal
                </span>

                <div className="w-full mt-2 pt-2 border-t border-border/60 text-left">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Select Client Restaurant
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="w-full rounded-xl border border-primary/30 bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        🍽️ {t.businessName} ({t.activeBranchName || "Main"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex rounded-xl bg-muted/60 p-1 mb-5 text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerMode("login")}
                  className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                    customerMode === "login"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("signup")}
                  className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                    customerMode === "signup"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  New Customer Sign Up
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <User className="size-4 text-primary" />
                  <h3 className="font-bold text-sm">
                    {customerMode === "signup" ? "Create Customer Account" : `Welcome Back to ${currentTenant.businessName}`}
                  </h3>
                </div>

                {customerMode === "signup" && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vignesh Sundaram"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">WhatsApp / Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Select Branch</label>
                  <select
                    value={custLocation}
                    onChange={(e) => setCustLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium"
                  >
                    {activeBranches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-full bg-gradient-ember py-3 text-sm font-bold text-primary-foreground shadow-ember flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                >
                  <Flame className="size-4" />
                  <span>
                    {customerMode === "signup"
                      ? "Create Account & Explore Menu"
                      : "Sign In & Order Food"}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            /* Staff Terminal Gateway */
            <>
              {/* Role Tab Switcher */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  { id: "owner", label: "Owner & Admin", icon: User },
                  { id: "cashier", label: "Cashier & POS", icon: KeyRound },
                  { id: "waiter", label: "Captain / Waiter", icon: Smartphone },
                  { id: "kitchen", label: "Kitchen & Stock", icon: Flame },
                  { id: "developer", label: "Developer Tools", icon: Code2 },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setRole(t.id as RoleTab);
                      setIsDevUnlocked(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                      role === t.id
                        ? "bg-gradient-ember text-white border-primary shadow-ember"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
                    }`}
                  >
                    <t.icon className="size-3.5" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Staff Form Box */}
              <div className="relative mt-6 mx-auto max-w-md rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-md p-6 sm:p-7 shadow-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary/30 before:via-primary before:to-amber-500/30">
                {/* Active Client Restaurant Selector */}
                <div className="flex flex-col items-center justify-center gap-1 mb-3 pb-3 border-b border-border/60 text-center">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-ember text-white text-xs font-black">
                      ⚡
                    </span>
                    <span className="font-display font-black text-xs uppercase tracking-wider text-foreground">
                      {db?.saasPlatformName || "RESTOPULSE"}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                      Cloud ERP
                    </span>
                  </div>

                  <div className="w-full mt-2 pt-2 border-t border-border/60 text-left">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Active Client Restaurant / Tenant
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => handleTenantChange(e.target.value)}
                      className="w-full rounded-xl border border-primary/40 bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none shadow-xs"
                    >
                      {tenantsList.map((t) => (
                        <option key={t.id} value={t.id}>
                          🍽️ {t.businessName} ({t.activeBranchName || "Main"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isDevUnlocked ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {role === "owner" && (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-primary" />
                            <h3 className="font-bold text-sm">Restaurant Owner Portal</h3>
                          </div>
                          <span className="text-[10px] rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 font-bold text-primary">
                            {currentTenant.businessName}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Owner Email ID</label>
                          <input
                            type="email"
                            required
                            value={ownerEmail}
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Admin Password / PIN</label>
                          <div className="relative mt-1">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={ownerPassword}
                              onChange={(e) => setOwnerPassword(e.target.value)}
                              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Demo Password: <span className="font-mono font-bold text-foreground">{currentTenant.loginPassword || "manam2026"}</span>
                          </p>
                        </div>
                      </>
                    )}

                    {role === "cashier" && (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <KeyRound className="size-4 text-primary" />
                            <h3 className="font-bold text-sm">Billing Counter Terminal</h3>
                          </div>
                          <span className="text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                            {currentTenant.businessName}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Assigned Branch Terminal</label>
                          <select
                            value={cashierBranch}
                            onChange={(e) => setCashierBranch(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium"
                          >
                            {activeBranches.map((b) => (
                              <option key={b.id} value={b.id}>
                                📍 {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Branch Cashier PIN</label>
                          <input
                            type="password"
                            maxLength={6}
                            required
                            placeholder="••••"
                            value={cashierPin}
                            onChange={(e) => setCashierPin(e.target.value)}
                            className="mt-1 w-full tracking-[0.6em] text-center text-xl font-mono rounded-xl border border-input bg-background px-3.5 py-3"
                          />
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            Assigned Terminal PIN: <span className="font-mono font-bold text-foreground">{currentTenant.cashierPin || "4001"}</span>
                          </p>
                        </div>
                      </>
                    )}

                    {role === "waiter" && (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <Smartphone className="size-4 text-primary" />
                            <h3 className="font-bold text-sm">Captain Tableside Terminal</h3>
                          </div>
                          <span className="text-[10px] rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 font-bold text-primary">
                            {currentTenant.businessName}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Assigned Branch</label>
                          <select
                            value={cashierBranch}
                            onChange={(e) => setCashierBranch(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium"
                          >
                            {activeBranches.map((b) => (
                              <option key={b.id} value={b.id}>
                                📍 {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Captain 4-Digit PIN</label>
                          <input
                            type="password"
                            maxLength={6}
                            required
                            placeholder="••••"
                            value={waiterPin}
                            onChange={(e) => setWaiterPin(e.target.value)}
                            className="mt-1 w-full tracking-[0.6em] text-center text-xl font-mono rounded-xl border border-input bg-background px-3.5 py-3"
                          />
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            Assigned Captain PIN: <span className="font-mono font-bold text-foreground">2002</span> or <span className="font-mono font-bold text-foreground">{currentTenant.cashierPin || "4001"}</span>
                          </p>
                        </div>
                      </>
                    )}

                    {role === "kitchen" && (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <Flame className="size-4 text-primary" />
                            <h3 className="font-bold text-sm">Kitchen Display &amp; Stock</h3>
                          </div>
                          <span className="text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                            {currentTenant.businessName}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Kitchen Head Chef PIN</label>
                          <input
                            type="password"
                            maxLength={6}
                            required
                            placeholder="••••"
                            value={kitchenPin}
                            onChange={(e) => setKitchenPin(e.target.value)}
                            className="mt-1 w-full tracking-[0.6em] text-center text-xl font-mono rounded-xl border border-input bg-background px-3.5 py-3"
                          />
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            Assigned Chef PIN: <span className="font-mono font-bold text-foreground">{currentTenant.kitchenPin || "5555"}</span>
                          </p>
                        </div>
                      </>
                    )}

                    {role === "developer" && (
                      <>
                        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                          <Code2 className="size-4 text-primary" />
                          <h3 className="font-bold text-sm">Developer Master Console</h3>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">Developer Security Key</label>
                          <div className="relative mt-1">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="Enter master key (admin or 9999)..."
                              value={devKey}
                              onChange={(e) => setDevKey(e.target.value)}
                              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">Master Keys: <span className="font-mono font-bold text-foreground">admin</span> or <span className="font-mono font-bold text-foreground">9999</span></p>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full mt-4 rounded-full bg-gradient-ember py-3 text-sm font-bold text-primary-foreground shadow-ember flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                    >
                      <Lock className="size-4" /> Unlock Terminal
                    </button>
                  </form>
                ) : (
                  /* Developer Diagnostics Console */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="size-4 text-emerald-400" />
                        <h3 className="font-bold text-sm text-emerald-400">Developer Diagnostic Tools</h3>
                      </div>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={handleExportDB}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/60 p-2.5 font-semibold hover:border-primary transition-colors"
                      >
                        <Download className="size-3.5 text-primary" /> Backup DB (JSON)
                      </button>
                      <button
                        onClick={handleResetFactory}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <RefreshCw className="size-3.5" /> Factory Reset
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground">Live Reactive Store (JSON View):</label>
                      <textarea
                        readOnly
                        rows={8}
                        value={dbJson}
                        className="mt-1 w-full rounded-xl border border-border bg-[#0d0d0d] p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link
                        to="/app"
                        className="flex-1 rounded-xl bg-gradient-ember py-2 text-center text-xs font-bold text-primary-foreground"
                      >
                        Open Full App &rarr;
                      </Link>
                      <button
                        onClick={() => setIsDevUnlocked(false)}
                        className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        Lock Console
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tableside Mobile Captain Terminal Quick Launcher */}
              <div className="mt-4 mx-auto max-w-md rounded-xl border border-primary/25 bg-primary/5 p-3 flex items-center justify-between gap-2 text-xs shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
                    <Smartphone className="size-4" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-foreground truncate">
                      Captain Tableside Mobile App
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      Fast thumb-order terminal for Waiters &amp; Captains
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    switchClientTenant(currentTenant.id);
                    sessionStorage.setItem("spotlight_session_active", "true");
                    sessionStorage.setItem("restopulse_session_tenant", currentTenant.id);
                    sessionStorage.setItem("spotlight_auth_tenant", currentTenant.id);
                    sessionStorage.setItem("spotlight_auth_role", "waiter");
                    sessionStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Captain`);
                    localStorage.setItem("spotlight_auth_role", "waiter");
                    localStorage.setItem("spotlight_auth_tenant", currentTenant.id);
                    localStorage.setItem("spotlight_auth_user", `${currentTenant.businessName} Captain`);
                    navigate({ to: "/app/captain", search: { tenant: currentTenant.id } });
                  }}
                  className="rounded-lg bg-primary px-3 py-1.5 font-black text-primary-foreground text-xs shadow-xs hover:opacity-95 shrink-0"
                >
                  Open Captain &rarr;
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modern SaaS Footer */}
      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground bg-card/60">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 {db?.saasPlatformName || "RestoPulse"} OS &middot; Multi-Tenant Cloud ERP &middot; Zero-Setup POS</span>
          <div className="flex items-center gap-3">
            <Link to="/manam" className="hover:underline">
              Manam Restaurant Showcase
            </Link>
            <span>&middot;</span>
            <Link to="/" className="hover:underline">
              Spot Light Biriyani
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
