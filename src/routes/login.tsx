import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Code2, Download, Eye, EyeOff, Flame, KeyRound, Lock, RefreshCw, Shield, Sparkles, Terminal, Upload, User, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";
import { getDB, setDB } from "@/lib/pos-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff & Developer Sign In — Spot Light Manager" },
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
type RoleTab = "owner" | "cashier" | "kitchen" | "developer";

function LoginPage() {
  const navigate = useNavigate();
  const [portalType, setPortalType] = useState<PortalType>("customer");
  const [customerMode, setCustomerMode] = useState<CustomerMode>("login");
  const [role, setRole] = useState<RoleTab>("owner");

  // Customer Form Fields
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custLocation, setCustLocation] = useState("Tharamani Flagship");
  const [custPassword, setCustPassword] = useState("");

  // Staff Form Fields
  const [cashierBranch, setCashierBranch] = useState("taramani");
  const [ownerEmail, setOwnerEmail] = useState("owner@spotlight.in");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [cashierPin, setCashierPin] = useState("");
  const [kitchenPin, setKitchenPin] = useState("");
  const [devKey, setDevKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Developer Panel State
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [dbJson, setDbJson] = useState("");

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone.trim()) {
      toast.error("Please enter your mobile phone number");
      return;
    }
    const name = custName.trim() || "Biriyani Foodie";
    localStorage.setItem("spotlight_customer_phone", custPhone.trim());
    localStorage.setItem("spotlight_customer_name", name);
    localStorage.setItem("spotlight_customer_branch", custLocation);

    toast.success(
      customerMode === "signup"
        ? `Welcome to Spot Light Biriyani, ${name}! Your foodie profile is ready.`
        : `Welcome back, ${name}! Redirecting to Live Menu...`
    );
    setTimeout(() => {
      navigate({ to: "/menu", replace: true });
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "owner") {
      if (ownerPassword === "spotlight2026" || ownerPassword === "9999") {
        localStorage.setItem("spotlight_auth_role", "owner");
        localStorage.setItem("spotlight_auth_user", "Restaurant Owner (Admin)");
        toast.success("Welcome, Master Admin! Access granted to Executive Dashboard.");
        setTimeout(() => navigate({ to: "/app", replace: true }), 300);
      } else {
        toast.error("Invalid owner credentials. Use 'spotlight2026' or PIN '9999'.");
      }
    } else if (role === "cashier") {
      let branchId = cashierBranch;
      let branchName = "Tharamani Flagship";

      if (cashierPin === "1001" || (cashierBranch === "taramani" && (cashierPin === "1234" || cashierPin === "1001"))) {
        branchId = "taramani";
        branchName = "Tharamani Flagship";
      } else if (cashierPin === "1002" || (cashierBranch === "adyar" && (cashierPin === "1234" || cashierPin === "1002"))) {
        branchId = "adyar";
        branchName = "Adyar Beach Kitchen";
      } else if (cashierPin === "1003" || (cashierBranch === "velachery" && (cashierPin === "1234" || cashierPin === "1003"))) {
        branchId = "velachery";
        branchName = "Velachery Delivery Hub";
      } else if (cashierPin === "1234") {
        branchId = cashierBranch || "taramani";
        branchName = branchId === "adyar" ? "Adyar Beach Kitchen" : branchId === "velachery" ? "Velachery Delivery Hub" : "Tharamani Flagship";
      } else {
        toast.error("Incorrect Cashier PIN. Assigned PINs: Taramani: 1001, Adyar: 1002, Velachery: 1003 (or Master PIN: 1234).");
        return;
      }

      setDB((d) => {
        d.settings.activeBranchId = branchId;
      });
      localStorage.setItem("spotlight_auth_role", "cashier");
      localStorage.setItem("spotlight_auth_branch", branchId);
      localStorage.setItem("spotlight_auth_user", `${branchName} Cashier`);
      toast.success(`${branchName} Terminal Unlocked! Loading Counter POS...`);
      setTimeout(() => navigate({ to: "/app/billing", replace: true }), 300);
    } else if (role === "kitchen") {
      if (kitchenPin === "5555") {
        localStorage.setItem("spotlight_auth_role", "kitchen");
        localStorage.setItem("spotlight_auth_user", "Kitchen Head Chef");
        toast.success("Kitchen Terminal Unlocked! Opening Stock Ledger...");
        setTimeout(() => navigate({ to: "/app/stock", replace: true }), 300);
      } else {
        toast.error("Incorrect Kitchen PIN. Default PIN is '5555'.");
      }
    } else if (role === "developer") {
      if (devKey === "dev@spotlight2026" || devKey === "admin") {
        localStorage.setItem("spotlight_auth_role", "developer");
        localStorage.setItem("spotlight_auth_user", "System Architect & Developer");
        setIsDevUnlocked(true);
        setDbJson(JSON.stringify(getDB(), null, 2));
        toast.success("Developer Console Unlocked! Diagnostic tools active.");
      } else {
        toast.error("Invalid Developer Security Key. Use 'dev@spotlight2026'.");
      }
    }
  };

  const handleExportDB = () => {
    const data = JSON.stringify(getDB(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spotlight_pos_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Database backup exported successfully!");
  };

  const handleResetFactory = () => {
    if (confirm("Are you sure you want to reset all sales and stock to factory seed data?")) {
      localStorage.removeItem("spotlight_pos_db");
      window.location.reload();
    }
  };

  return (
    <SiteShell>
      <section className="relative mx-auto max-w-4xl px-5 py-16 overflow-hidden min-h-[85vh]">
        {/* Modern Ambient Culinary Backdrop (Subtle, elegant SaaS glow without awkward watermarks) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-primary/8 to-orange-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Shield className="size-3.5" /> Secure Terminal Gateway
            </span>
            <h1 className="mt-3 text-4xl font-display">STAFF &amp; DEVELOPER LOGIN</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select your assigned role to access your dedicated terminal interface.
            </p>
          </div>

        {/* Portal Switcher: Customer vs Staff */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-card p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setPortalType("customer")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                portalType === "customer"
                  ? "bg-gradient-ember text-white shadow-ember"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="size-4" />
              <span>Diner / Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setPortalType("staff")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                portalType === "staff"
                  ? "bg-gradient-ember text-white shadow-ember"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="size-4" />
              <span>Staff &amp; Terminal Login</span>
            </button>
          </div>
        </div>

        {portalType === "customer" ? (
          /* Diner / Customer Sign In & Sign Up Form */
          <div className="relative mt-6 mx-auto max-w-md rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary/30 before:via-primary before:to-amber-500/30">
            <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-border/60">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-ember shadow-xs">
                <Flame className="size-3.5 text-white" />
              </span>
              <span className="font-display font-black text-xs uppercase tracking-wider text-foreground">
                Spot Light Biriyani · Chennai
              </span>
            </div>
            <div className="flex rounded-xl bg-muted/60 p-1 mb-5 text-xs">
              <button
                type="button"
                onClick={() => setCustomerMode("login")}
                className={`flex-1 rounded-lg py-2 font-bold transition-all ${
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
                className={`flex-1 rounded-lg py-2 font-bold transition-all ${
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
                  {customerMode === "signup" ? "Create Customer Account" : "Welcome Back, Biriyani Lover"}
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
                  placeholder="+91 98844 30710"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Preferred Chennai Branch</label>
                <select
                  value={custLocation}
                  onChange={(e) => setCustLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium"
                >
                  <option value="Tharamani Flagship">Tharamani (OMR Flagship Kitchen)</option>
                  <option value="Adyar Beach Kitchen">Adyar (LB Road)</option>
                  <option value="Velachery Bypass Hub">Velachery (100 Feet Road)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 rounded-full bg-gradient-ember py-3 text-sm font-bold text-primary-foreground shadow-ember flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <Flame className="size-4" />
                <span>
                  {customerMode === "signup"
                    ? "Create Foodie Account & Explore Menu"
                    : "Sign In & Access Live Order Terminal"}
                </span>
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Customer accounts allow quick checkout, special bulk catering discounts, and batch alerts.
            </p>
          </div>
        ) : (
          /* Staff Terminal Gateway */
          <>
            {/* Role Tab Switcher */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { id: "owner", label: "Owner & Admin", icon: User },
                { id: "cashier", label: "Cashier & POS", icon: KeyRound },
                { id: "kitchen", label: "Kitchen & Stock", icon: Flame },
                { id: "developer", label: "Developer Tools", icon: Code2 },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setRole(t.id as RoleTab);
                    setIsDevUnlocked(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
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

            {/* Main Authentication Box */}
            <div className="relative mt-6 mx-auto max-w-md rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary/30 before:via-primary before:to-amber-500/30">
              <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-border/60">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-ember shadow-xs">
                  <Flame className="size-3.5 text-white" />
                </span>
                <span className="font-display font-black text-xs uppercase tracking-wider text-foreground">
                  Spot Light Biriyani · Chennai
                </span>
              </div>
              {!isDevUnlocked ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {role === "owner" && (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <User className="size-4 text-primary" />
                        <h3 className="font-bold text-sm">Restaurant Owner Portal</h3>
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
                        <p className="mt-1 text-[11px] text-muted-foreground">Default: <strong>spotlight2026</strong> or PIN <strong>9999</strong></p>
                      </div>
                    </>
                  )}

                  {role === "cashier" && (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <KeyRound className="size-4 text-primary" />
                        <h3 className="font-bold text-sm">Billing Counter Terminal</h3>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Assigned Chennai Branch</label>
                        <select
                          value={cashierBranch}
                          onChange={(e) => setCashierBranch(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium"
                        >
                          <option value="taramani">Tharamani (OMR Flagship Kitchen) — PIN: 1001</option>
                          <option value="adyar">Adyar (Beach Kitchen) — PIN: 1002</option>
                          <option value="velachery">Velachery (Delivery Hub) — PIN: 1003</option>
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
                          Branch PINs: Tharamani (<strong>1001</strong>), Adyar (<strong>1002</strong>), Velachery (<strong>1003</strong>), Master (<strong>1234</strong>)
                        </p>
                      </div>
                    </>
                  )}

                  {role === "kitchen" && (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <Flame className="size-4 text-primary" />
                        <h3 className="font-bold text-sm">Kitchen &amp; Stock Terminal</h3>
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
                      </div>
                    </>
                  )}

                  {role === "developer" && (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <Code2 className="size-4 text-primary" />
                        <h3 className="font-bold text-sm">Developer &amp; Architect Access</h3>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Developer Security Key</label>
                        <div className="relative mt-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter developer key..."
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
          </>
        )}
        </div>
      </section>
    </SiteShell>
  );
}
