import { createFileRoute } from "@tanstack/react-router";
import { Check, Cpu, Eye, FileText, Printer, Scissors, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { DEFAULT_PRINTER_SETTINGS, exportJSON, importJSON, resetDB, setDB, useDB } from "@/lib/pos-store";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

function Settings() {
  const db = useDB();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!db) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const printer = db.settings.printerSettings ?? DEFAULT_PRINTER_SETTINGS;

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
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">SETTINGS</h1>
        <p className="text-sm text-muted-foreground">
          Branches, aggregator commission rates and data backup.
        </p>
      </div>

      {/* =========================================================================
          DEVELOPER & CLIENT TENANT CONFIGURATION (FOR SELLING TO NEW CLIENTS)
      ========================================================================= */}
      <div className="surface-card p-5 border-2 border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <Cpu className="size-4" /> Developer &amp; Multi-Tenant Control Panel
            </div>
            <h2 className="text-xl font-display font-black mt-0.5">CLIENT RESTAURANT IDENTITY</h2>
            <p className="text-xs text-muted-foreground">
              When selling to a new restaurant (e.g. CSK Biriyani), change the name here. It instantly updates all headers, bills, WhatsApp receipts, and login screens!
            </p>
          </div>
          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            Active Tenant: {db.settings.businessName || "Spot Light Biriyani"}
          </span>
        </div>

        {/* Quick Tenant Switcher Presets */}
        <div className="mt-3.5">
          <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1.5">
            Quick Client Presets (1-Click Rebrand)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Spot Light Biriyani", branch: "Taramani (Flagship)", phone: "+91 98844 30710" },
              { name: "CSK Biriyani & Fast Food", branch: "T. Nagar (Main)", phone: "+91 98765 43210" },
              { name: "Madurai Star Biriyani", branch: "Anna Nagar Kitchen", phone: "+91 98400 11223" },
              { name: "Royal Cloud Kitchen", branch: "Velachery Hub", phone: "+91 99400 55667" },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setDB((d) => {
                    d.settings.businessName = preset.name;
                    if (d.branches && d.branches[0]) {
                      d.branches[0].name = preset.branch;
                      d.branches[0].phone = preset.phone;
                    }
                  });
                  toast.success(`Switched tenant to "${preset.name}"! All screens updated.`);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                  db.settings.businessName === preset.name
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                🏢 {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
            Client Restaurant Name
            <input
              value={db.settings.businessName}
              onChange={(e) =>
                setDB((d) => {
                  d.settings.businessName = e.target.value;
                })
              }
              placeholder="e.g. CSK Biriyani"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-bold focus:border-primary focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
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
        </div>
      </div>

      {/* =========================================================================
          THERMAL RECEIPT PRINTER & ESC/POS ENGINE CONFIGURATION (80mm vs 58mm)
      ========================================================================= */}
      <div className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Printer className="size-4" /> Thermal Printing &amp; Hardware Engine
            </div>
            <h2 className="text-xl font-display mt-0.5">RECEIPT PRINTER &amp; ESC/POS DRIVER</h2>
            <p className="text-xs text-muted-foreground">
              Configure 80mm desktop thermal printers or 58mm/56mm handheld Bluetooth rolls, auto-cutter, and cash drawer solenoid pulses.
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
            {/* Paper Width Selector */}
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
                    <span className="font-bold text-sm text-foreground">58mm / 56mm (2-Inch)</span>
                    {printer.paperWidth === "58mm" && <Check className="size-primary text-primary" />}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Compact Bluetooth Handheld &amp; Pocket Terminals (Sunmi, Everycom, NGX). 32 characters/line.
                  </p>
                </button>
              </div>
            </div>

            {/* Hardware Commands */}
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-xs bg-background/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Scissors className="size-3.5 text-primary" /> Auto Guillotine Cut
                </span>
                <input
                  type="checkbox"
                  checked={printer.autoCut}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.autoCut = e.target.checked;
                    })
                  }
                  className="size-4 accent-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-xs bg-background/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Cpu className="size-3.5 text-primary" /> Cash Drawer Kick
                </span>
                <input
                  type="checkbox"
                  checked={printer.cashDrawerKick}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.cashDrawerKick = e.target.checked;
                    })
                  }
                  className="size-4 accent-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-xs bg-background/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Printer className="size-3.5 text-primary" /> Kitchen KOT Copy
                </span>
                <select
                  value={printer.printCopies}
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.printCopies = Number(e.target.value) as 1 | 2;
                    })
                  }
                  className="rounded border border-input bg-card px-2 py-1 text-xs font-semibold"
                >
                  <option value={1}>1 Copy (Bill)</option>
                  <option value={2}>2 Copies (+KOT)</option>
                </select>
              </label>
            </div>

            {/* Tax & Legal Numbers */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                <span className="flex items-center gap-1 mb-1 font-semibold text-foreground">
                  <ShieldCheck className="size-3.5 text-primary" /> FSSAI License Number
                </span>
                <input
                  value={printer.fssaiNumber}
                  placeholder="e.g. 12424008000456"
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.fssaiNumber = e.target.value;
                    })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-mono"
                />
              </label>

              <label className="text-xs text-muted-foreground">
                <span className="flex items-center gap-1 mb-1 font-semibold text-foreground">
                  <FileText className="size-3.5 text-primary" /> GSTIN Tax Registration
                </span>
                <input
                  value={printer.gstin}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  onChange={(e) =>
                    setDB((d) => {
                      d.settings.printerSettings.gstin = e.target.value;
                    })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-mono uppercase"
                />
              </label>
            </div>

            {/* Custom Footer */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Receipt Footer Custom Note
              </label>
              <input
                value={printer.customFooter}
                onChange={(e) =>
                  setDB((d) => {
                    d.settings.printerSettings.customFooter = e.target.value;
                  })
                }
                placeholder="e.g. Freshly cooked twice daily · No reheats · Thank you! Visit again."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {/* Right Live Simulated Thermal Receipt Paper Preview */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-6">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
              <Eye className="size-3 text-primary" /> Live {printer.paperWidth} Simulation
            </span>

            {/* Simulated Paper Roll */}
            <div
              className="bg-white text-black p-4 font-mono shadow-2xl transition-all duration-300 relative border border-slate-300"
              style={{
                width: printer.paperWidth === "58mm" ? "210px" : "280px",
                fontSize: printer.paperWidth === "58mm" ? "10px" : "11px",
              }}
            >
              {/* Paper jagged top edge simulation */}
              <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-900">
                {db.settings.businessName}
              </div>
              <div className="text-center text-[10px] text-slate-600">Authentic Chennai Biriyani Specialists</div>
              <div className="text-center text-[9px] text-slate-500 mt-0.5">
                FSSAI: {printer.fssaiNumber || "12424008000456"}
              </div>
              {printer.gstin && (
                <div className="text-center text-[9px] text-slate-500">GSTIN: {printer.gstin}</div>
              )}

              <div className="border-t border-dashed border-slate-400 my-2" />

              <div className="border border-slate-800 p-1 text-center my-1 rounded-sm">
                <div className="text-[9px] font-bold">TOKEN #042</div>
                <div className="text-[8px] text-slate-600">COUNTER DINE-IN</div>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2" />

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>1x Chicken Biriyani (Full)</span>
                  <span>₹180</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Pepper Chicken (Crispy)</span>
                  <span>₹160</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2" />

              <div className="flex justify-between font-bold text-xs">
                <span>NET TOTAL</span>
                <span>₹340</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Paid via CASH</span>
                <span>₹500</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-800">
                <span>Change Returned</span>
                <span>₹160</span>
              </div>

              <div className="border-t border-dotted border-slate-400 my-2" />

              <div className="text-center text-[9px] text-slate-600 leading-tight">
                {printer.customFooter || "Freshly cooked twice daily · No reheats · Thank you! Visit again."}
              </div>

              {printer.autoCut && (
                <div className="text-center text-[8px] text-slate-400 mt-2 tracking-widest">
                  -- [ESC/POS AUTO CUT] --
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg font-display">CHANNEL COMMISSION &amp; PACKING</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the real percentages from your Swiggy / Zomato contract — profit maths depends on it.
        </p>
        <div className="mt-4 space-y-3">
          {db.channels.map((c, idx) => (
            <div key={c.id} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <p className="text-sm font-medium">{c.name}</p>
              <label className="text-xs text-muted-foreground">
                Commission %
                <input
                  type="number"
                  value={c.commissionPct}
                  onChange={(e) =>
                    setDB((d) => {
                      d.channels[idx]!.commissionPct = Number(e.target.value) || 0;
                    })
                  }
                  className="mt-1 w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Packing ₹ / order
                <input
                  type="number"
                  value={c.packagingCost}
                  onChange={(e) =>
                    setDB((d) => {
                      d.channels[idx]!.packagingCost = Number(e.target.value) || 0;
                    })
                  }
                  className="mt-1 w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg">BRANCHES</h2>
        <div className="mt-3 space-y-3">
          {db.branches.map((b, idx) => (
            <div key={b.id} className="grid gap-2 sm:grid-cols-3">
              <input
                value={b.name}
                onChange={(e) =>
                  setDB((d) => {
                    d.branches[idx]!.name = e.target.value;
                  })
                }
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={b.address}
                onChange={(e) =>
                  setDB((d) => {
                    d.branches[idx]!.address = e.target.value;
                  })
                }
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={b.phone}
                onChange={(e) =>
                  setDB((d) => {
                    d.branches[idx]!.phone = e.target.value;
                  })
                }
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setDB((d) => {
              d.branches.push({
                id: Math.random().toString(36).slice(2, 8),
                name: "New branch",
                address: "",
                phone: "",
              });
            })
          }
          className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-semibold"
        >
          Add branch
        </button>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg">DATA</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          All data lives in this browser. Take a backup every week and keep it in Drive.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={download}
            className="rounded-full bg-gradient-ember px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Download backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          >
            Restore backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <button
            onClick={() => {
              if (window.confirm("Reset all data back to the demo dataset?")) {
                resetDB();
                toast.success("Demo data restored");
              }
            }}
            className="rounded-full border border-destructive/50 px-4 py-2 text-sm font-semibold text-destructive"
          >
            Reset to demo data
          </button>
        </div>
      </div>
    </div>
  );
}
