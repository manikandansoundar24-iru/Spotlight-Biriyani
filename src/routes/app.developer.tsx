import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  Flame,
  KeyRound,
  Layers,
  Lock,
  Plus,
  Power,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  Trash2,
  Upload,
  UserCheck,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addTenant,
  DEFAULT_TENANTS,
  deleteTenant,
  getActiveTenant,
  getDB,
  setDB,
  setSaasBrand,
  switchClientTenant,
  TenantConfig,
  TenantModules,
  updateTenant,
  useDB,
} from "@/lib/pos-store";
import { performFullSync } from "@/lib/neon-sync";

export const Route = createFileRoute("/app/developer")({
  head: () => ({
    meta: [
      { title: "Developer Super-Admin Console — Multi-Tenant Configurator" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DeveloperSuperAdminPage,
});

const BRAND_PRESETS = [
  { name: "RestoPulse", tag: "Recommended Flagship", desc: "Dynamic real-time restaurant operating pulse" },
  { name: "DinePulse", tag: "Modern QSR", desc: "Fast-casual dining and counter intelligence" },
  { name: "RestoSwift", tag: "Speed & Scale", desc: "Ultra-fast billing and high-speed kitchen turnover" },
  { name: "DegFlow", tag: "Biriyani Specialist", desc: "Tailored for authentic dum deg batch kitchens" },
  { name: "DineMatrix", tag: "Enterprise Analytics", desc: "Full-scale multi-outlet intelligence network" },
  { name: "RestroStack", tag: "SaaS Tech Stack", desc: "Developer-grade hospitality software stack" },
];

export function DeveloperSuperAdminPage() {
  const db = useDB();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [customBrandInput, setCustomBrandInput] = useState("");
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // New Tenant Provisioning Form State
  const [newClientName, setNewClientName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newBranchName, setNewBranchName] = useState("Main Kitchen");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [newFssai, setNewFssai] = useState("");
  const [newUpiId, setNewUpiId] = useState("");
  const [newGstPct, setNewGstPct] = useState(5);
  const [newCuisine, setNewCuisine] = useState("Biriyani Special");
  const [newDegBatch, setNewDegBatch] = useState(true);
  const [newPassword, setNewPassword] = useState("welcome2026");
  const [newCashierPin, setNewCashierPin] = useState("1234");
  const [newPlanPreset, setNewPlanPreset] = useState<"starter" | "standard" | "biriyani_pro" | "enterprise">("biriyani_pro");

  // Selected Tenant Profile Edit State
  const [editTenant, setEditTenant] = useState<TenantConfig | null>(null);

  const currentDB = db ?? getDB();
  const activeTenant = getActiveTenant(currentDB);
  const tenants = currentDB.tenants && currentDB.tenants.length > 0 ? currentDB.tenants : DEFAULT_TENANTS;

  // Security Verification
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("spotlight_auth_role");
      if (storedRole === "developer") {
        setIsUnlocked(true);
      } else if (storedRole) {
        toast.error("Super-Admin Developer Privileges Required.");
        window.location.replace("/app");
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedTenantId && activeTenant) {
      setSelectedTenantId(activeTenant.id);
    }
  }, [activeTenant, selectedTenantId]);

  useEffect(() => {
    const target = tenants.find((t) => t.id === selectedTenantId) || activeTenant;
    if (target) {
      setEditTenant({ ...target });
    }
  }, [selectedTenantId, db]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "dev@spotlight2026" || pinInput === "admin" || pinInput === "9999") {
      setIsUnlocked(true);
      sessionStorage.setItem("spotlight_session_active", "true");
      localStorage.setItem("spotlight_auth_role", "developer");
      localStorage.setItem("spotlight_auth_user", "System Architect & Super-Admin");
      toast.success("Super-Admin Console Unlocked!");
    } else {
      toast.error("Invalid Developer Security Key.");
    }
  };

  const handleSwitchTenant = (tenantId: string) => {
    switchClientTenant(tenantId);
    setSelectedTenantId(tenantId);
    toast.success(`Active store switched to ${(tenants.find((t) => t.id === tenantId)?.businessName || tenantId).toUpperCase()}!`, {
      icon: <Store className="size-4 text-primary" />,
    });
  };

  const handleBrandChange = (brand: string) => {
    setSaasBrand(brand);
    toast.success(`SaaS Platform Brand set to "${brand}" across all client screens!`, {
      icon: <Sparkles className="size-4 text-amber-500" />,
    });
  };

  const handleToggleModule = (moduleKey: keyof TenantModules) => {
    if (!editTenant) return;
    const updated: TenantConfig = {
      ...editTenant,
      enabledModules: {
        ...editTenant.enabledModules,
        [moduleKey]: !editTenant.enabledModules[moduleKey],
      },
    };
    setEditTenant(updated);
    updateTenant(updated);
    toast.info(`Updated module "${moduleKey}" for ${updated.businessName}`);
  };

  const handleSaveTenantProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenant) return;
    updateTenant(editTenant);
    toast.success(`Saved configuration and credentials for ${editTenant.businessName}!`, {
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  const handleApplyPresetPlan = (plan: "starter" | "standard" | "biriyani_pro" | "enterprise") => {
    if (!editTenant) return;
    let newModules: TenantModules;
    let degEnabled = editTenant.degBatchEnabled ?? true;

    if (plan === "starter") {
      newModules = {
        billing: true,
        tables: false,
        kds: false,
        stock: false,
        reports: false,
        menu: false,
        loyalty: false,
        dynamicUpi: true,
        zReport: false,
        multiBranch: false,
        aggregators: false,
      };
      degEnabled = false;
    } else if (plan === "standard") {
      newModules = {
        billing: true,
        tables: true,
        kds: false,
        stock: true,
        reports: true,
        menu: true,
        loyalty: true,
        dynamicUpi: true,
        zReport: true,
        multiBranch: false,
        aggregators: true,
      };
    } else if (plan === "biriyani_pro") {
      newModules = {
        billing: true,
        tables: true,
        kds: true,
        stock: true,
        reports: true,
        menu: true,
        loyalty: true,
        dynamicUpi: true,
        zReport: true,
        multiBranch: true,
        aggregators: true,
      };
      degEnabled = true;
    } else {
      // Enterprise
      newModules = {
        billing: true,
        tables: true,
        kds: true,
        stock: true,
        reports: true,
        menu: true,
        loyalty: true,
        dynamicUpi: true,
        zReport: true,
        multiBranch: true,
        aggregators: true,
      };
    }

    const updated: TenantConfig = {
      ...editTenant,
      degBatchEnabled: degEnabled,
      enabledModules: newModules,
    };
    setEditTenant(updated);
    updateTenant(updated);
    toast.success(`Applied ${plan.replace("_", " ").toUpperCase()} preset plan to ${updated.businessName}!`);
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error("Please enter Client Restaurant Name");
      return;
    }

    const slug = newClientName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    let modules: TenantModules = {
      billing: true,
      tables: true,
      kds: true,
      stock: true,
      reports: true,
      menu: true,
      loyalty: true,
      dynamicUpi: true,
      zReport: true,
      multiBranch: true,
      aggregators: true,
    };

    if (newPlanPreset === "starter") {
      modules = {
        billing: true,
        tables: false,
        kds: false,
        stock: false,
        reports: false,
        menu: false,
        loyalty: false,
        dynamicUpi: true,
        zReport: false,
        multiBranch: false,
        aggregators: false,
      };
    } else if (newPlanPreset === "standard") {
      modules.kds = false;
      modules.multiBranch = false;
    }

    const newTenant: TenantConfig = {
      id: slug,
      businessName: newClientName.trim(),
      tagline: newTagline.trim() || "Delicious Food & Hospitality",
      activeBranchName: newBranchName.trim() || "Flagship Kitchen",
      phone: newPhone.trim() || "+91 90000 00000",
      address: newAddress.trim() || "Chennai, Tamil Nadu",
      gstin: newGstin.trim() || "33AAAAA0000A1Z5",
      fssai: newFssai.trim() || "12424008000123",
      upiId: newUpiId.trim() || `${slug}@okaxis`,
      gstPct: Number(newGstPct) || 5,
      cuisineType: newCuisine,
      degBatchEnabled: newDegBatch,
      currencySymbol: "₹",
      loginUsername: `owner@${slug}.in`,
      loginPassword: newPassword.trim() || "client2026",
      cashierPin: newCashierPin.trim() || "1234",
      kitchenPin: "5555",
      enabledModules: modules,
    };

    addTenant(newTenant);
    switchClientTenant(newTenant.id);
    setSelectedTenantId(newTenant.id);
    setShowProvisionModal(false);

    // Reset form
    setNewClientName("");
    setNewTagline("");
    setNewPhone("");
    setNewAddress("");
    setNewUpiId("");

    toast.success(`Client "${newTenant.businessName}" provisioned and activated successfully!`, {
      icon: <Building2 className="size-4 text-emerald-600" />,
    });
  };

  const handleDeleteClient = (tenantId: string) => {
    if (tenants.length <= 1) {
      toast.error("Cannot delete the last remaining tenant in the system.");
      return;
    }
    const target = tenants.find((t) => t.id === tenantId);
    if (confirm(`Are you sure you want to delete client "${target?.businessName}"? This action cannot be undone.`)) {
      deleteTenant(tenantId);
      toast.success("Tenant removed.");
      setSelectedTenantId(tenants[0]?.id || "spotlight-biriyani");
    }
  };

  const handleExportAll = () => {
    const data = JSON.stringify(getDB(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restopulse_master_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Complete multi-tenant database backup downloaded!");
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const res = await performFullSync();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.warning(res.message);
      }
    } catch (err: any) {
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Locked View
  if (!isUnlocked) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 border border-red-500/30 shadow-inner">
              <ShieldAlert className="size-7" />
            </span>
            <h2 className="text-xl font-black text-foreground">Developer Control Plane</h2>
            <p className="text-xs text-muted-foreground max-w-xs">
              This terminal is strictly restricted to System Architects and SaaS Platform Developers. Please verify master key to continue.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Developer Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter dev@spotlight2026 or admin"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-center font-mono text-sm tracking-wider focus:border-red-500 focus:outline-none"
                />
                <KeyRound className="absolute right-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-red-700 hover:to-orange-700 transition-all active:scale-98"
            >
              Unlock Master Control Plane
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Master Control Plane Status */}
      <div className="rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/20 via-background to-orange-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
              <ShieldAlert className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-foreground">
                  Developer Super-Admin &amp; Multi-Tenant Console
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                  LIVE CONTROLS
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage clients, toggle granular feature entitlements per restaurant, reset passwords, and rebrand SaaS in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:border-primary transition-all shadow-2xs"
            >
              <Database className={`size-3.5 text-primary ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Neon PostgreSQL"}</span>
            </button>

            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs"
            >
              <Download className="size-3.5" />
              <span>Export Full Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: MASTER SAAS BRANDING CONFIGURATION */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-base font-black text-foreground">Master SaaS Platform Brand Name</h2>
          </div>
          <span className="text-xs font-bold text-primary">
            Active Global Brand: <span className="font-black text-foreground">{currentDB.saasPlatformName || "RestoPulse"}</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Choose a brand name for your SaaS software product. When changed here, every screen, receipt footer, header logo, and client portal updates automatically without modifying any code!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRAND_PRESETS.map((b) => {
            const isSelected = (currentDB.saasPlatformName || "RestoPulse").toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.name}
                type="button"
                onClick={() => handleBrandChange(b.name)}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                    : "border-border/70 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                    ⚡ {b.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {b.tag}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground mt-1">{b.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Brand Name Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={customBrandInput}
            onChange={(e) => setCustomBrandInput(e.target.value)}
            placeholder="Or type custom brand name (e.g. Adea RestoOS, KOTFlow)..."
            className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => {
              if (customBrandInput.trim()) {
                handleBrandChange(customBrandInput.trim());
                setCustomBrandInput("");
              }
            }}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors shadow-2xs"
          >
            Apply Custom Name
          </button>
        </div>
      </div>

      {/* SECTION 2: REGISTERED CLIENT RESTAURANTS & PROVISIONING */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h2 className="text-base font-black text-foreground">Registered Client Restaurants (Tenants)</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any restaurant to view its configuration, credentials, or switch the live active store.
            </p>
          </div>

          <button
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:from-primary/90 hover:to-orange-700 transition-all shadow-md active:scale-98"
          >
            <Plus className="size-4" />
            <span>+ Provision New Client Restaurant</span>
          </button>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {tenants.map((t) => {
            const isActive = activeTenant.id === t.id;
            const isSelected = selectedTenantId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTenantId(t.id)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                    : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h3 className="font-black text-sm text-foreground line-clamp-1">{t.businessName}</h3>
                    {isActive ? (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                        ACTIVE LIVE
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted border border-border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                        {t.cuisineType || "Standard"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">📍 {t.activeBranchName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{t.phone}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-1">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitchTenant(t.id);
                      }}
                      className="rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                      ⚡ Switch Live
                    </button>
                  ) : (
                    <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                      <Check className="size-3" /> Live Active
                    </span>
                  )}

                  {tenants.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(t.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete Tenant"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: GRANULAR FEATURE ENTITLEMENTS & CREDENTIALS FOR SELECTED TENANT */}
      {editTenant && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: Granular Feature Entitlement Matrix */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="size-5 text-primary" />
                  <h3 className="text-base font-black text-foreground">
                    Feature Access Entitlements: <span className="text-primary">{editTenant.businessName}</span>
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle on/off exact features based on what this client paid for. Navigation tabs hide or show dynamically!
                </p>
              </div>

              {/* Fast Plan Presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyPresetPlan("starter")}
                  className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] font-bold hover:bg-muted"
                  title="Billing only"
                >
                  Starter
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetPlan("standard")}
                  className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] font-bold hover:bg-muted"
                  title="Billing + Stock + Tables"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetPlan("biriyani_pro")}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 text-[10px] font-black hover:bg-amber-500/20"
                  title="Biriyani Deg + KDS + All"
                >
                  Biriyani Pro
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetPlan("enterprise")}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 text-[10px] font-black hover:bg-emerald-500/20"
                  title="All 11 Features"
                >
                  Enterprise
                </button>
              </div>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Billing */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🧾 Counter POS Billing</span>
                  <span className="text-[10px] text-muted-foreground">High-speed counter ordering</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("billing")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.billing ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.billing ? "✓" : "✕"}
                </button>
              </div>

              {/* Table Dine-in */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🪑 Dine-in Floor &amp; KOT</span>
                  <span className="text-[10px] text-muted-foreground">Table picker &amp; Kitchen ticket</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("tables")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.tables ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.tables ? "✓" : "✕"}
                </button>
              </div>

              {/* KDS */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">📺 Kitchen Display (KDS)</span>
                  <span className="text-[10px] text-muted-foreground">Chef tablet with timers</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("kds")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.kds ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.kds ? "✓" : "✕"}
                </button>
              </div>

              {/* Dynamic UPI */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">📱 Dynamic UPI QR</span>
                  <span className="text-[10px] text-muted-foreground">Live exact-amount QR code</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("dynamicUpi")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.dynamicUpi ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.dynamicUpi ? "✓" : "✕"}
                </button>
              </div>

              {/* Z-Report */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">💵 Shift Day-Close (Z-Report)</span>
                  <span className="text-[10px] text-muted-foreground">Cashier drawer reconciliation</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("zReport")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.zReport ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.zReport ? "✓" : "✕"}
                </button>
              </div>

              {/* Customer VIP Loyalty */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🌟 Customer Loyalty CRM</span>
                  <span className="text-[10px] text-muted-foreground">Phone tracking &amp; VIP discount</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("loyalty")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.loyalty ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.loyalty ? "✓" : "✕"}
                </button>
              </div>

              {/* Biriyani Deg Tracking */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🍲 Biriyani Deg Stock Cap</span>
                  <span className="text-[10px] text-muted-foreground">Live cooked portion countdown</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !(editTenant.degBatchEnabled ?? true);
                    const updated = { ...editTenant, degBatchEnabled: nextVal };
                    setEditTenant(updated);
                    updateTenant(updated);
                    toast.info(`Deg Batch Tracking set to ${nextVal ? "ON" : "OFF"}`);
                  }}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.degBatchEnabled ?? true ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.degBatchEnabled ?? true ? "✓" : "✕"}
                </button>
              </div>

              {/* Raw Stock */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">📦 Raw Inventory &amp; Stock</span>
                  <span className="text-[10px] text-muted-foreground">Meat, rice &amp; oil logging</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("stock")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.stock ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.stock ? "✓" : "✕"}
                </button>
              </div>

              {/* Reports & Forecast */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">📈 Reports &amp; AI Forecast</span>
                  <span className="text-[10px] text-muted-foreground">Sales curves &amp; dish breakdown</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("reports")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.reports ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.reports ? "✓" : "✕"}
                </button>
              </div>

              {/* Menu Engineering */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🍽️ Menu &amp; Recipe Costs</span>
                  <span className="text-[10px] text-muted-foreground">Food costing &amp; margin calculation</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("menu")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.menu ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.menu ? "✓" : "✕"}
                </button>
              </div>

              {/* Multi-Branch */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🏢 Multi-Branch Operations</span>
                  <span className="text-[10px] text-muted-foreground">Branch switcher in navbar</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("multiBranch")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.multiBranch ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.multiBranch ? "✓" : "✕"}
                </button>
              </div>

              {/* Online Aggregators */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/10">
                <div>
                  <span className="font-bold text-xs text-foreground block">🛵 Swiggy &amp; Zomato</span>
                  <span className="text-[10px] text-muted-foreground">Commission &amp; payout deduction</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleModule("aggregators")}
                  className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    editTenant.enabledModules.aggregators ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {editTenant.enabledModules.aggregators ? "✓" : "✕"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: Client Profile & Credentials Editor */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" />
                <h3 className="text-base font-black text-foreground">Client Profile &amp; Login Passwords</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set and inspect passwords and PINs for the restaurant owner, cashier, and chef.
              </p>
            </div>

            <form onSubmit={handleSaveTenantProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Restaurant Business Name</label>
                <input
                  type="text"
                  value={editTenant.businessName}
                  onChange={(e) => setEditTenant({ ...editTenant, businessName: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 font-bold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Primary Branch Name</label>
                  <input
                    type="text"
                    value={editTenant.activeBranchName}
                    onChange={(e) => setEditTenant({ ...editTenant, activeBranchName: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Cuisine / Type</label>
                  <input
                    type="text"
                    value={editTenant.cuisineType || "Biriyani Special"}
                    onChange={(e) => setEditTenant({ ...editTenant, cuisineType: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Owner Login Email/Username</label>
                  <input
                    type="text"
                    value={editTenant.loginUsername || `owner@${editTenant.id}.in`}
                    onChange={(e) => setEditTenant({ ...editTenant, loginUsername: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-[11px] focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-red-600 dark:text-red-400 block mb-1">Owner Password</label>
                  <input
                    type="text"
                    value={editTenant.loginPassword || "spotlight2026"}
                    onChange={(e) => setEditTenant({ ...editTenant, loginPassword: e.target.value })}
                    className="w-full rounded-xl border border-red-500/50 bg-background px-3 py-2 font-mono text-[11px] font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Cashier 4-Digit PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editTenant.cashierPin || "1234"}
                    onChange={(e) => setEditTenant({ ...editTenant, cashierPin: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-center font-bold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Kitchen 4-Digit PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editTenant.kitchenPin || "5555"}
                    onChange={(e) => setEditTenant({ ...editTenant, kitchenPin: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-center font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editTenant.phone}
                    onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">UPI ID for Dynamic QR</label>
                  <input
                    type="text"
                    value={editTenant.upiId}
                    onChange={(e) => setEditTenant({ ...editTenant, upiId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-[11px] focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Full Physical Address</label>
                <textarea
                  rows={2}
                  value={editTenant.address}
                  onChange={(e) => setEditTenant({ ...editTenant, address: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">GST %</label>
                  <input
                    type="number"
                    value={editTenant.gstPct}
                    onChange={(e) => setEditTenant({ ...editTenant, gstPct: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-muted-foreground block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editTenant.gstin}
                    onChange={(e) => setEditTenant({ ...editTenant, gstin: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-[11px] focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 font-bold text-white shadow-md hover:bg-primary/90 transition-all active:scale-98"
              >
                <Save className="size-4" />
                <span>Save Client Profile &amp; Passwords</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION NEW CLIENT MODAL DIALOG */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">Provision New Client Restaurant</h3>
                  <p className="text-[11px] text-muted-foreground">Creates an isolated tenant with immediate access</p>
                </div>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Client Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thalappakatti Biriyani, Chai Kings, Anjappar"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 font-bold text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Cuisine / Kitchen Type</label>
                  <select
                    value={newCuisine}
                    onChange={(e) => {
                      setNewCuisine(e.target.value);
                      if (e.target.value.toLowerCase().includes("biriyani")) {
                        setNewDegBatch(true);
                      } else {
                        setNewDegBatch(false);
                      }
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-medium focus:border-primary focus:outline-none"
                  >
                    <option value="Biriyani Special">Biriyani Special</option>
                    <option value="South Indian / Chettinad">South Indian / Chettinad</option>
                    <option value="Fast Food / QSR">Fast Food / QSR</option>
                    <option value="Cafe & Bakery">Cafe &amp; Bakery</option>
                    <option value="Chinese & Rolls">Chinese &amp; Rolls</option>
                    <option value="Multi-Cuisine Family Resto">Multi-Cuisine Family Resto</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Initial Plan Package</label>
                  <select
                    value={newPlanPreset}
                    onChange={(e) => setNewPlanPreset(e.target.value as any)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-bold text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="starter">Starter Plan (Counter POS only)</option>
                    <option value="standard">Standard Plan (+ Tables, Stock, UPI)</option>
                    <option value="biriyani_pro">Biriyani Pro (+ Deg, KDS, Reports)</option>
                    <option value="enterprise">Enterprise (All 11 Modules)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Primary Branch Name</label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="e.g. T. Nagar, Anna Nagar"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 98844 12345"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-red-600 dark:text-red-400 block mb-1">Owner Password *</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. pass2026"
                    className="w-full rounded-xl border border-red-500/50 bg-background px-3 py-2 font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Cashier 4-Digit PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newCashierPin}
                    onChange={(e) => setNewCashierPin(e.target.value)}
                    placeholder="1234"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-center font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">UPI ID (Merchant VPA)</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="e.g. client@okaxis"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-[11px] focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">GST Rate %</label>
                  <input
                    type="number"
                    value={newGstPct}
                    onChange={(e) => setNewGstPct(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Full Physical Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 100, GST Road, Guindy, Chennai"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="checkbox"
                  id="newDegBatchCheck"
                  checked={newDegBatch}
                  onChange={(e) => setNewDegBatch(e.target.checked)}
                  className="size-4 rounded text-primary"
                />
                <label htmlFor="newDegBatchCheck" className="text-xs font-bold text-foreground cursor-pointer">
                  Enable Biriyani Deg Batch Counter (Live 160-plate countdown)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-orange-600 py-2.5 font-bold text-white shadow-md hover:from-primary/90 hover:to-orange-700 active:scale-98"
                >
                  Provision Client &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
