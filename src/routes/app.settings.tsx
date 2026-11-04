import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CheckSquare, Cpu, Eye, FileText, KeyRound, Lock, Plus, Printer, Scissors, ShieldAlert, ShieldCheck, Sparkles, Store, Utensils } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

import { DEFAULT_PRINTER_SETTINGS, DEFAULT_TENANTS, exportJSON, importJSON, resetDB, setDB, switchClientTenant, useDB, type TenantConfig } from "@/lib/pos-store";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

function Settings() {
  const db = useDB();
  const fileRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<string>("owner");
  const [activeTab, setActiveTab] = useState<"store" | "printer" | "aggregators" | "developer">("store");
  
  // Developer Mode Unlock Modal / State
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devPinInput, setDevPinInput] = useState("");
  const [showDevModal, setShowDevModal] = useState(false);

  // New Client Tenant Provisioning Form State
  const [newClientName, setNewClientName] = useState("");
  const [newClientBranch, setNewClientBranch] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientGstin, setNewClientGstin] = useState("");
  const [newClientFssai, setNewClientFssai] = useState("");
  const [newClientUpi, setNewClientUpi] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("spotlight_auth_role") || "owner";
      setRole(storedRole);
      if (storedRole === "developer") {
        setDevUnlocked(true);
      }
    }
  }, []);

  if (!db) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const printer = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;
  const currentBranch = db.branches[0];

  const handleUnlockDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    if (devPinInput === "dev@spotlight2026" || devPinInput === "admin" || devPinInput === "9999") {
      setDevUnlocked(true);
      setShowDevModal(false);
      setActiveTab("developer");
      toast.success("Developer Super-Admin console unlocked!");
    } else {
      toast.error("Incorrect developer security key");
    }
  };

  const handleCreateNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error("Please enter client restaurant name");
      return;
    }
    const tenantId = newClientName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const newTenant: TenantConfig = {
      id: tenantId,
      businessName: newClientName.trim(),
      tagline: "Authentic Restaurant & Cloud Kitchen",
      activeBranchName: newClientBranch.trim() || "Main Branch",
      phone: newClientPhone.trim() || "+91 98765 43210",
      address: newClientAddress.trim() || "Chennai, Tamil Nadu",
      gstin: newClientGstin.trim() || "33AAAAA0000A1Z5",
      fssai: newClientFssai.trim() || "12424008000456",
      upiId: newClientUpi.trim() || `${tenantId}@okaxis`,
      gstPct: 5,
      enabledModules: {
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
      },
    };

    setDB((d) => {
      if (!d.tenants) d.tenants = [...DEFAULT_TENANTS];
      d.tenants.push(newTenant);
    });

    switchClientTenant(tenantId);
    toast.success(`New tenant "${newTenant.businessName}" created and activated!`);
    setNewClientName("");
    setNewClientBranch("");
    setNewClientPhone("");
    setNewClientAddress("");
    setNewClientGstin("");
    setNewClientFssai("");
    setNewClientUpi("");
  };

  const testPrint = () => {
    const is58 = printer.paperWidth === "58mm";
    const w = window.open("", "_blank", `width=${is58 ? 260 : 380},height=540`);
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Thermal Printer Test</title><style>
      @media print { body { width: ${printer.paperWidth}; margin: 0; padding: 4px; font-family: 'Courier New', monospace; font-size: ${is58 ? "10px" : "12px"}; color: #000; } }
      body { width: ${is58 ? "210px" : "280px"}; margin: auto; padding: 8px; font-family: monospace; font-size: ${is58 ? "10px" : "12px"}; color: #111; }
      .c { text-align: center; }
      .b { font-weight: bold; }
    </style></head><body>
      <div class="c b" style="font-size: 14px;">${db.settings.businessName.toUpperCase()}</div>
      <div class="c" style="font-size: 10px;">TEST PRINT (${printer.paperWidth})</div>
      <div class="c" style="font-size: 9px; margin-top: 2px;">FSSAI: ${printer.fssaiNumber || "12424008000456"}</div>
      ${printer.gstin ? `<div class="c" style="font-size: 9px;">GSTIN: ${printer.gstin}</div>` : ""}
      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
      <div style="display: flex; justify-content: space-between;"><span>1x CHICKEN BIRIYANI (FULL)</span><span>₹180</span></div>
      <div style="display: flex; justify-content: space-between;"><span>1x PEPPER CHICKEN</span><span>₹160</span></div>
      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
      <div class="b" style="display: flex; justify-content: space-between;"><span>TOTAL (CASH)</span><span>₹340</span></div>
      <div class="c" style="font-size: 9px; margin-top: 8px;">${printer.customFooter || "Freshly cooked twice daily · No reheats · Thank you!"}</div>
      ${printer.autoCut ? '<div class="c" style="font-size: 8px; margin-top: 8px;">-- [ESC/POS AUTO CUT] --</div>' : ""}
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spotlight-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success("Backup downloaded");
  };

  const upload = (file: File) => {
    file.text().then((raw) => {
      try {
        importJSON(raw);
        toast.success("Backup restored");
      } catch {
        toast.error("That file isn't a valid backup");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Settings Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">SETTINGS</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Store identity, thermal hardware, delivery aggregator rates, and developer configuration.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("store")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "store"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            🏢 Restaurant Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("printer")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "printer"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            🖨️ Thermal Printer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("aggregators")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "aggregators"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            🛵 Aggregators &amp; Taxes
          </button>

          {/* Dedicated Developer Super-Admin Console Link */}
          <Link
            to="/app/developer"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 shadow-2xs"
            title="Open dedicated Developer Setup & Configuration Screen"
          >
            <ShieldAlert className="size-3.5" /> ⚡ Super-Admin Console →
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: STORE IDENTITY & RESTAURANT PROFILE (WHAT THE CLIENT SEES)
      ========================================================================= */}
      {activeTab === "store" && (
        <div className="space-y-6">
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Store className="size-5 text-primary" />
              <div>
                <h2 className="text-lg font-display font-bold">RESTAURANT &amp; OUTLET IDENTITY</h2>
                <p className="text-xs text-muted-foreground">
                  Official restaurant details printed on receipts, customer WhatsApp bills, and QR stands.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-muted-foreground">
                Restaurant Trade Name
                <input
                  value={db.settings.businessName}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.businessName = e.target.value;
                    })
                  }
                  placeholder="e.g. Spot Light Biriyani"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-bold focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Outlet / Branch Name
                <input
                  value={currentBranch?.name || ""}
                  onChange={(e) =>
                    setDB((d) => {
                      if (d.branches[0]) d.branches[0].name = e.target.value;
                    })
                  }
                  placeholder="e.g. Taramani (Flagship)"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-bold focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Store Contact Phone
                <input
                  value={currentBranch?.phone || ""}
                  onChange={(e) =>
                    setDB((d) => {
                      if (d.branches[0]) d.branches[0].phone = e.target.value;
                    })
                  }
                  placeholder="+91 98844 30710"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Store Address
                <input
                  value={currentBranch?.address || ""}
                  onChange={(e) =>
                    setDB((d) => {
                      if (d.branches[0]) d.branches[0].address = e.target.value;
                    })
                  }
                  placeholder="10, Kaikankuppam, Kazhikundram, Taramani, Chennai"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                GSTIN Tax Number
                <input
                  value={printer.gstin || ""}
                  onChange={(e) =>
                    setDB((d) => {
                      if (d.settings.printerSettings) d.settings.printerSettings.gstin = e.target.value;
                    })
                  }
                  placeholder="33AAAAA0000A1Z5"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                FSSAI Food License Number
                <input
                  value={printer.fssaiNumber || ""}
                  onChange={(e) =>
                    setDB((d) => {
                      if (d.settings.printerSettings) d.settings.printerSettings.fssaiNumber = e.target.value;
                    })
                  }
                  placeholder="12424008000456"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground sm:col-span-2">
                Merchant UPI ID (Used for Counter Dynamic QR Generation)
                <input
                  value={db.settings.upiId || "spotlightbiriyani@oksbi"}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.upiId = e.target.value;
                    })
                  }
                  placeholder="spotlightbiriyani@oksbi"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Customers scan dynamic QR generated at the counter; payment routes directly into this UPI VPA account.
                </span>
              </label>
            </div>
          </div>

          {/* Backup & Factory Seed Card */}
          <div className="surface-card p-5">
            <h2 className="text-lg font-display">LOCAL DATA BACKUP &amp; SYNC</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Export sales &amp; menu to a local JSON file or restore from a previous backup.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={download}
                className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition-all shadow-2xs"
              >
                Download Backup (.json)
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition-all shadow-2xs"
              >
                Restore from Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: THERMAL RECEIPT PRINTER & ESC/POS HARDWARE
      ========================================================================= */}
      {activeTab === "printer" && (
        <div className="surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Printer className="size-4" /> Thermal Printing &amp; Hardware Engine
              </div>
              <h2 className="text-xl font-display mt-0.5">RECEIPT PRINTER &amp; ESC/POS DRIVER</h2>
              <p className="text-xs text-muted-foreground">
                Configure 80mm desktop thermal printers or 58mm handheld Bluetooth rolls, auto-cutter, and cash drawer kick.
              </p>
            </div>
            <button
              onClick={testPrint}
              className="flex items-center gap-1.5 rounded-full bg-gradient-ember px-4 py-2 text-xs font-bold text-white shadow-ember hover:opacity-95 transition-all"
            >
              <Printer className="size-3.5" /> Test Print Receipt
            </button>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Left Form Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Thermal Roll Width Specification
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDB((d) => {
                        d.settings.printerSettings.paperWidth = "80mm";
                      })
                    }
                    className={`rounded-xl border p-3 text-left transition-all ${
                      printer.paperWidth === "80mm"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card/60 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">80mm (3-Inch)</span>
                      {printer.paperWidth === "80mm" && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Standard Heavy-Duty Desktop Counters (Epson, TVS RP-3200, Posiflex, Citizen). 48 characters/line.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDB((d) => {
                        d.settings.printerSettings.paperWidth = "58mm";
                      })
                    }
                    className={`rounded-xl border p-3 text-left transition-all ${
                      printer.paperWidth === "58mm"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card/60 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">58mm (2-Inch)</span>
                      {printer.paperWidth === "58mm" && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Compact Handheld Bluetooth Rolls (Everycom, NGX, Sunmi). 32 characters/line.
                    </p>
                  </button>
                </div>
              </div>

              {/* Hardware Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 cursor-pointer hover:border-primary/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={printer.autoCut}
                    onChange={(e) =>
                      setDB((d) => {
                        d.settings.printerSettings.autoCut = e.target.checked;
                      })
                    }
                    className="mt-0.5 size-4 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Scissors className="size-3.5 text-primary" /> Auto-Cut Paper After Bill (GS V 66 0)
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Sends the hardware knife cut sequence immediately when bill finishes printing.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 cursor-pointer hover:border-primary/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={printer.cashDrawerKick}
                    onChange={(e) =>
                      setDB((d) => {
                        d.settings.printerSettings.cashDrawerKick = e.target.checked;
                      })
                    }
                    className="mt-0.5 size-4 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-primary" /> Solenoid Cash Drawer Kick-Out (ESC p 0 25 250)
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically pops open the heavy metal cash drawer on cash settlement.
                    </p>
                  </div>
                </label>
              </div>

              {/* Custom Footer */}
              <label className="text-xs font-bold text-muted-foreground block pt-2">
                Custom Bill Receipt Footer Message
                <input
                  value={printer.customFooter}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.customFooter = e.target.value;
                    })
                  }
                  placeholder="Freshly cooked twice daily · No reheats · Thank you! Visit again."
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Live Visual Print Preview */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 flex flex-col items-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye className="size-3.5" /> Live Thermal Output Simulation ({printer.paperWidth})
              </span>
              <div
                className={`border border-border/80 bg-white text-black p-4 shadow-md font-mono transition-all ${
                  printer.paperWidth === "58mm" ? "w-[220px] text-[10px]" : "w-[280px] text-xs"
                }`}
              >
                <div className="text-center font-bold text-sm tracking-wide">
                  {db.settings.businessName.toUpperCase()}
                </div>
                <div className="text-center text-[10px] text-gray-600">
                  {currentBranch?.name || "Flagship Kitchen"}
                </div>
                <div className="text-center text-[9px] text-gray-600">
                  FSSAI: {printer.fssaiNumber || "12424008000456"}
                </div>
                {printer.gstin && (
                  <div className="text-center text-[9px] text-gray-600">
                    GSTIN: {printer.gstin}
                  </div>
                )}
                <div className="border-t border-dashed border-gray-400 my-2" />
                <div className="flex justify-between">
                  <span>1x CHICKEN BIRIYANI</span>
                  <span>₹180</span>
                </div>
                <div className="flex justify-between">
                  <span>1x PEPPER CHICKEN</span>
                  <span>₹160</span>
                </div>
                <div className="border-t border-dashed border-gray-400 my-2" />
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL (CASH)</span>
                  <span>₹340</span>
                </div>
                <div className="text-center text-[9px] text-gray-600 mt-2">
                  {printer.customFooter}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AGGREGATORS & COMMISSION RATES
      ========================================================================= */}
      {activeTab === "aggregators" && (
        <div className="surface-card p-5">
          <h2 className="text-lg font-display">AGGREGATOR PLATFORM COMMISSIONS &amp; TAXES</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Commission and packing cost deducted per order to compute true net profit.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-bold text-muted-foreground">
              GST % (Tax Rate)
              <input
                type="number"
                value={db.settings.gstPct}
                onChange={(e) =>
                  setDB((d) => {
                    d.settings.gstPct = Number(e.target.value) || 0;
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>

            {db.channels.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/80 bg-card p-3 space-y-2">
                <span className="text-xs font-bold uppercase text-foreground">{c.name}</span>
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Commission %
                  <input
                    type="number"
                    value={c.commissionPct}
                    onChange={(e) =>
                      setDB((d) => {
                        const target = d.channels.find((x) => x.id === c.id);
                        if (target) target.commissionPct = Number(e.target.value) || 0;
                      })
                    }
                    className="mt-0.5 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Packaging Cost (₹)
                  <input
                    type="number"
                    value={c.packagingCost}
                    onChange={(e) =>
                      setDB((d) => {
                        const target = d.channels.find((x) => x.id === c.id);
                        if (target) target.packagingCost = Number(e.target.value) || 0;
                      })
                    }
                    className="mt-0.5 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DEVELOPER SUPER-ADMIN CONSOLE (SECLUDED FOR MULTI-TENANT SAAS)
      ========================================================================= */}
      {activeTab === "developer" && devUnlocked && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Developer Banner */}
          <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/20 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider">
                  <ShieldAlert className="size-4" /> Multi-Tenant SaaS Master Super-Admin
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black mt-0.5">
                  CLIENT RESTAURANT PROVISIONING &amp; FEATURE CONTROL
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage restaurant client accounts on this platform. Switch active tenant with 1 click, customize module entitlements per restaurant, and configure white-label branding.
                </p>
              </div>
              <span className="rounded-full bg-red-600 text-white font-mono px-3 py-1 text-xs font-bold shadow-xs">
                Active Tenant: {db.settings.businessName}
              </span>
            </div>

            {/* Quick Tenant Switcher */}
            <div className="mt-4">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                Available Client Restaurant Tenants (1-Click Switch):
              </label>
              <div className="flex flex-wrap gap-2">
                {(db.tenants || DEFAULT_TENANTS).map((tenant) => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => {
                      switchClientTenant(tenant.id);
                      toast.success(`Active tenant switched to "${tenant.businessName}"!`);
                    }}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                      db.settings.businessName === tenant.businessName
                        ? "bg-red-600 text-white border-red-600 shadow-md scale-102"
                        : "border-border bg-card hover:border-red-500/50 text-foreground"
                    }`}
                  >
                    🏢 {tenant.businessName}
                    <span className="text-[10px] opacity-75 font-normal">({tenant.activeBranchName})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form to Provision New Client Restaurant */}
          <div className="surface-card p-5 border border-primary/30">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Plus className="size-5 text-primary" />
              <div>
                <h3 className="text-lg font-display font-bold">PROVISION NEW CLIENT RESTAURANT</h3>
                <p className="text-xs text-muted-foreground">
                  Selling this software to a new client (e.g. CSK Biriyani or Madurai Star)? Fill details here to instantly configure their account.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewTenant} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-muted-foreground">
                Client Restaurant Name *
                <input
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. CSK Biriyani & Fast Food"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Primary Branch Name
                <input
                  value={newClientBranch}
                  onChange={(e) => setNewClientBranch(e.target.value)}
                  placeholder="e.g. T. Nagar (Main Outlet)"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Client Contact Mobile
                <input
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                Merchant UPI ID (For Dynamic QR)
                <input
                  value={newClientUpi}
                  onChange={(e) => setNewClientUpi(e.target.value)}
                  placeholder="cskbiriyani@okaxis"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground sm:col-span-2">
                Outlet Street Address
                <input
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="45, Usman Road, T. Nagar, Chennai - 600017"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                GSTIN Number (Optional)
                <input
                  value={newClientGstin}
                  onChange={(e) => setNewClientGstin(e.target.value)}
                  placeholder="33AAAAA0000A1Z5"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <label className="text-xs font-bold text-muted-foreground">
                FSSAI License Number (Optional)
                <input
                  value={newClientFssai}
                  onChange={(e) => setNewClientFssai(e.target.value)}
                  placeholder="12424008000456"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-600 to-primary px-5 py-2.5 text-xs font-black text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="size-4" /> Provision &amp; Activate Client Account
                </button>
              </div>
            </form>
          </div>

          {/* Module Entitlement Control for Active Tenant */}
          <div className="surface-card p-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <CheckSquare className="size-4 text-emerald-600" />
              MODULE &amp; FEATURE ENTITLEMENTS FOR: {db.settings.businessName.toUpperCase()}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable or disable specific features based on the restaurant's subscription package (e.g. Basic Billing vs Enterprise with Tables &amp; KDS).
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { key: "billing", label: "Cloud Billing POS Terminal", desc: "Fast counter order creation" },
                { key: "tables", label: "Dine-in Tables & Floor Plan", desc: "Interactive T1–T8 tables & KOT" },
                { key: "kds", label: "Kitchen Display System (KDS)", desc: "Live chef tablet screen with timers" },
                { key: "stock", label: "Deg Batch & Raw Stock", desc: "Real-time plate countdown & ingredients" },
                { key: "reports", label: "P&L Financial Reports & AI", desc: "Plates sold, margin & next day forecast" },
                { key: "dynamicUpi", label: "Counter Dynamic UPI QR", desc: "Live on-screen amount QR code" },
                { key: "loyalty", label: "Customer VIP Loyalty & CRM", desc: "Mobile-based visit count & rewards" },
                { key: "zReport", label: "Cashier Day-End Z-Report", desc: "Drawer cash reconciliation & discrepancies" },
              ].map((mod) => (
                <div key={mod.key} className="rounded-xl border border-border bg-card p-3 flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{mod.label}</span>
                    <span className="text-[10px] text-muted-foreground">{mod.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SaaS Master Platform White-Label Branding */}
          <div className="surface-card p-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              MASTER SAAS PLATFORM BRANDING (WHITE-LABEL)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change the software brand name displayed on the top left of all screens.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <input
                value={db.saasPlatformName || "RESTOPULSE"}
                onChange={(e) =>
                  setDB((d) => {
                    d.saasPlatformName = e.target.value.toUpperCase();
                  })
                }
                placeholder="RESTOPULSE"
                className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-black tracking-wider text-foreground focus:border-primary focus:outline-none w-56"
              />
              <span className="text-xs text-muted-foreground">
                (Default: <strong>RESTOPULSE</strong> · Alternatives: <strong>NEXARESTO</strong>, <strong>BISTROOS</strong>)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Developer Unlock Modal Dialog */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <KeyRound className="size-5 text-red-600" />
              <div>
                <h3 className="font-bold text-sm text-foreground">Developer Super-Admin Security</h3>
                <p className="text-[11px] text-muted-foreground">Enter master security key to unlock multi-tenant controls</p>
              </div>
            </div>

            <form onSubmit={handleUnlockDeveloper} className="mt-4 space-y-3">
              <input
                type="password"
                autoFocus
                value={devPinInput}
                onChange={(e) => setDevPinInput(e.target.value)}
                placeholder="Enter Developer Security Key"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-center font-mono focus:border-primary focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-xs shadow-md transition-all"
                >
                  Unlock Super-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
