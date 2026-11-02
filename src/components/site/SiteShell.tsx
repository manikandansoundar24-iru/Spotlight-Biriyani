import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Flame,
  KeyRound,
  MapPin,
  Menu as MenuIcon,
  Phone,
  QrCode,
  Receipt,
  Sparkles,
  User,
  Utensils,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { SpotlightAssistant } from "./SpotlightAssistant";

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPricingMenu, setShowPricingMenu] = useState(false);
  const [pricingCycle, setPricingCycle] = useState<"annual" | "monthly">("monthly");
  const [qrTarget, setQrTarget] = useState<"cloud" | "local">("cloud");
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [franchiseForm, setFranchiseForm] = useState({
    name: "",
    phone: "",
    city: "",
    spaceStatus: "Seeking Commercial Space",
    investment: "₹15L - ₹25L (Cloud Kitchen)",
    experience: "New to F&B / Entrepreneur",
    notes: "",
  });

  const handleFranchiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchiseForm.name || !franchiseForm.phone || !franchiseForm.city) {
      toast.error("Please enter your name, phone number, and city");
      return;
    }
    toast.success("Franchise application received! Opening WhatsApp...");
    setShowFranchiseModal(false);
    const msg = encodeURIComponent(
      `*Spot Light Biriyani Franchise Inquiry* 🤝🍗\n\n` +
      `👤 *Name:* ${franchiseForm.name}\n` +
      `📞 *Phone:* ${franchiseForm.phone}\n` +
      `📍 *Target City / Area:* ${franchiseForm.city}\n` +
      `🏢 *Space Status:* ${franchiseForm.spaceStatus}\n` +
      `💰 *Investment Capacity:* ${franchiseForm.investment}\n` +
      `💼 *Prior F&B Experience:* ${franchiseForm.experience}\n` +
      (franchiseForm.notes ? `📝 *Notes:* ${franchiseForm.notes}\n\n` : "\n") +
      `Please send the franchise deck, menu economics, and site survey criteria.`
    );
    window.open(`https://api.whatsapp.com/send/?phone=919884430710&text=${msg}`, "_blank");
  };

  const [demoForm, setDemoForm] = useState({
    name: "",
    phone: "",
    restaurant: "Restaurant / Takeaway Outlet",
    purpose: "Spot Light POS Business Software Demo",
    datetime: "",
    city: "Tharamani (OMR Flagship Kitchen)",
  });

  const openTastingModal = () => {
    setDemoForm((f) => ({ ...f, purpose: "Chef's Food Tasting & Catering / Bulk Order" }));
    setShowDemoModal(true);
  };

  const openDemoModal = () => {
    setDemoForm((f) => ({ ...f, purpose: "Spot Light POS Software Demo & License" }));
    setShowDemoModal(true);
  };

  const openDemoModalForPlan = (planName: string) => {
    setDemoForm((f) => ({
      ...f,
      purpose: `Spot Light POS: ${planName} (${pricingCycle === "annual" ? "Annual License" : "Monthly Plan"})`,
      restaurant: "Restaurant / Cloud Kitchen License",
    }));
    setShowPricingMenu(false);
    setShowDemoModal(true);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.phone) {
      toast.error("Please enter your name and phone number");
      return;
    }
    toast.success("Booking Request Received! Opening WhatsApp...");
    setShowDemoModal(false);
    const dateFormatted = demoForm.datetime
      ? new Date(demoForm.datetime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "Flexible / Soon";
    const msg = encodeURIComponent(
      `*Spot Light Biriyani & Demo Booking Request* 🍗📋\n\n` +
      `👤 *Name:* ${demoForm.name}\n` +
      `📞 *Phone:* ${demoForm.phone}\n` +
      `🎯 *Purpose:* ${demoForm.purpose}\n` +
      `🏢 *Shop / Org:* ${demoForm.restaurant}\n` +
      `📅 *Date & Time:* ${dateFormatted}\n` +
      `📍 *Preferred Branch:* ${demoForm.city}\n\n` +
      `Please confirm availability & send menu / demo details.`
    );
    window.open(`https://api.whatsapp.com/send/?phone=919884430710&text=${msg}`, "_blank");
  };

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://spotlight-biriyani.vercel.app";
  const scannableUrl = qrTarget === "cloud" ? "https://spotlight-biriyani.vercel.app" : currentUrl;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(scannableUrl);
    setCopiedLink(true);
    toast.success("Website URL copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500/20 font-sans antialiased">
      {/* Clean Restaurant Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          {/* Restaurant Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-ember shadow-ember group-hover:scale-105 transition-transform">
              <Flame className="size-5 text-white" />
            </span>
            <div>
              <span className="font-display text-lg tracking-wide text-foreground leading-none block">
                SPOT LIGHT
              </span>
              <span className="text-[0.62rem] font-sans font-bold tracking-[0.25em] text-primary block mt-0.5">
                BIRIYANI · CHENNAI
              </span>
            </div>
          </Link>

          {/* Public Restaurant Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/menu"
              className="rounded-lg px-3.5 py-2 text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
            >
              Live Menu
            </Link>

            {/* Live Pricing & Rates Dropdown */}
            <div className="relative" onMouseLeave={() => setShowPricingMenu(false)}>
              <button
                type="button"
                onClick={() => setShowPricingMenu((v) => !v)}
                onMouseEnter={() => setShowPricingMenu(true)}
                className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                <span>Pricing List</span>
                <ChevronDown className={`size-3 text-primary transition-transform duration-200 ${showPricingMenu ? "rotate-180" : ""}`} />
              </button>

              {showPricingMenu && (
                <div
                  onMouseEnter={() => setShowPricingMenu(true)}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 w-[420px] rounded-2xl border border-border/80 bg-card p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50 text-left normal-case"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                    <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Spot Light POS Business Plans
                    </span>
                    {/* Monthly vs Annual Toggle */}
                    <div className="flex items-center rounded-lg bg-muted p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPricingCycle("monthly");
                        }}
                        className={`w-28 py-1 rounded-md text-center transition-all ${
                          pricingCycle === "monthly" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPricingCycle("annual");
                        }}
                        className={`w-28 py-1 rounded-md text-center transition-all ${
                          pricingCycle === "annual" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Annual (-20%)
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs">
                    {/* Starter Counter POS Plan */}
                    <div
                      onClick={() => openDemoModalForPlan("Core Counter Billing Plan")}
                      className="cursor-pointer rounded-xl border border-border/60 bg-muted/30 p-2.5 hover:border-primary/60 hover:bg-muted/50 transition-all group"
                      title="Click to select this plan & request demo"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">1. Core Counter Billing Plan</span>
                        <div className="text-right">
                          <span className="font-mono font-black text-primary text-sm">
                            {pricingCycle === "annual" ? "₹7,999" : "₹799"}
                            <span className="text-[10px] text-muted-foreground font-normal">{pricingCycle === "annual" ? "/yr" : "/mo"}</span>
                          </span>
                          {pricingCycle === "annual" && (
                            <span className="block text-[9px] text-emerald-600 font-bold">₹666/mo billed yearly</span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        High-speed counter billing, 80mm ESC/POS thermal printing, offline billing safety, token generator &amp; daily sales WhatsApp summary.
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to Select &amp; Request Demo &rarr;
                      </span>
                    </div>

                    {/* Pro Restaurant & Recipe Costing Plan */}
                    <div
                      onClick={() => openDemoModalForPlan("Pro Kitchen & Recipe Costing Plan")}
                      className="cursor-pointer rounded-xl border border-primary/50 bg-primary/5 p-2.5 relative shadow-xs hover:border-primary hover:bg-primary/10 transition-all group"
                      title="Click to select this plan & request demo"
                    >
                      <span className="absolute -top-2 right-3 rounded-full bg-gradient-ember px-2 py-0.2 text-[9px] font-extrabold text-white">
                        MOST POPULAR
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">2. Pro Kitchen &amp; Recipe Costing</span>
                        <div className="text-right">
                          <span className="font-mono font-black text-primary text-sm">
                            {pricingCycle === "annual" ? "₹14,999" : "₹1,499"}
                            <span className="text-[10px] text-muted-foreground font-normal">{pricingCycle === "annual" ? "/yr" : "/mo"}</span>
                          </span>
                          {pricingCycle === "annual" && (
                            <span className="block text-[9px] text-emerald-600 font-bold">₹1,250/mo billed yearly</span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Includes Core POS + Live Recipe Costing (COGS), automatic raw material depletion per biriyani sold, low stock alerts, Swiggy &amp; Zomato commission profit audit.
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to Select &amp; Request Demo &rarr;
                      </span>
                    </div>

                    {/* Multi-Outlet Cloud Franchise Plan */}
                    <div
                      onClick={() => openDemoModalForPlan("Multi-Outlet Franchise Cloud")}
                      className="cursor-pointer rounded-xl border border-border/60 bg-muted/30 p-2.5 hover:border-primary/60 hover:bg-muted/50 transition-all group"
                      title="Click to select this plan & request demo"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">3. Multi-Outlet Franchise Cloud</span>
                        <div className="text-right">
                          <span className="font-mono font-black text-primary text-sm">
                            {pricingCycle === "annual" ? "₹24,999" : "₹2,499"}
                            <span className="text-[10px] text-muted-foreground font-normal">{pricingCycle === "annual" ? "/yr" : "/mo"}</span>
                          </span>
                          {pricingCycle === "annual" && (
                            <span className="block text-[9px] text-emerald-600 font-bold">₹2,083/mo billed yearly</span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Multi-kitchen GPS Radar sync, central batch allocation, consolidated multi-store P&amp;L dashboard, role-based chef/cashier security PINs.
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to Select &amp; Request Demo &rarr;
                      </span>
                    </div>

                    {/* Popular Add-Ons */}
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-1.5">
                        Modular Add-Ons:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                        <span>• WhatsApp Auto-Receipts: ₹2,499/yr</span>
                        <span>• Swiggy &amp; Zomato Sync: ₹3,999/yr</span>
                        <span>• Chef Kitchen KDS: ₹3,499/yr</span>
                        <span>• 80mm Thermal Printer: ₹5,500</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDemoModalForPlan("Custom Plan & Quote")}
                      className="flex-1 text-center rounded-xl bg-gradient-ember hover:opacity-95 text-white py-2 font-bold text-xs shadow-ember transition-all"
                    >
                      ⚡ Request Quote &amp; Demo
                    </button>
                    <Link
                      to="/platform"
                      onClick={() => setShowPricingMenu(false)}
                      className="rounded-xl border border-border bg-card hover:bg-muted px-3 py-2 font-bold text-xs text-foreground transition-colors"
                    >
                      Compare Features
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/branches"
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
            >
              <span>Chennai Radar</span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
            >
              <QrCode className="size-3.5 text-primary" />
              <span>Scan QR</span>
            </button>

            <button
              onClick={openTastingModal}
              className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors text-xs font-semibold"
              title="Experience authentic Chennai food tasting / party catering"
            >
              <span>🍽️ Taste Our Dishes</span>
            </button>

            <button
              onClick={() => setShowFranchiseModal(true)}
              className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-primary hover:bg-primary/10 transition-colors text-xs font-bold"
              title="Apply for Spot Light Biriyani Franchise partnership"
            >
              <span>🤝 Franchise</span>
            </button>

            <button
              onClick={openDemoModal}
              className="rounded-full bg-gradient-ember px-3.5 py-1.5 text-xs font-bold text-white shadow-ember hover:opacity-95 transition-all"
              title="Request POS billing software live demo"
            >
              ⚡ POS Demo
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full border border-primary/50 bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted hover:border-primary transition-all shadow-2xs"
            >
              <User className="size-3.5 text-primary" /> Sign In / Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <nav className="grid gap-2 border-t border-border px-5 py-4 lg:hidden bg-card text-foreground">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowFranchiseModal(true);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10 flex items-center gap-2"
            >
              🤝 Franchise Opportunity
            </button>
            <Link
              to="/menu"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              Live Menu &amp; Specials
            </Link>
            <Link
              to="/branches"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted flex items-center justify-between"
            >
              <span>Chennai GPS Radar Map</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Live</span>
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setShowQRModal(true);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-left"
            >
              <QrCode className="size-4 text-primary" />
              <span>Scan QR on Mobile</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                openTastingModal();
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-left"
            >
              🍗 Taste The Biriyani / Bulk Catering
            </button>
            <button
              onClick={() => {
                setOpen(false);
                openDemoModal();
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-muted text-left"
            >
              ⚡ Request POS Software Demo
            </button>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-gradient-ember px-4 py-2.5 text-center text-sm font-bold text-white shadow-ember flex items-center justify-center gap-2"
            >
              <User className="size-4" /> Sign In / Register
            </Link>
          </nav>
        )}
      </header>

      <main>{children}</main>

      {/* Restaurant Footer */}
      <footer className="mt-24 border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <div>
            <p className="font-display font-black text-xl">SPOT LIGHT BIRIYANI</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Chennai's authentic biriyani since day one. Three kitchens, one recipe, freshly prepared. No reheats.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Visit Our Kitchens</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Tharamani — Kazhikundram, OMR</li>
              <li>Adyar — LB Road</li>
              <li>Velachery — 100 Feet Road</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Order &amp; Inquiries</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" /> +91 98844 30710
              </li>
              <li>Lunch Batch: 12:30 pm – 3:30 pm</li>
              <li>Dinner Batch: 7:00 pm – 10:30 pm</li>
              <li>Available on Swiggy &amp; Zomato</li>
            </ul>
          </div>
        </div>
        <p className="border-t border-border/60 px-5 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Spot Light Biriyani. All rights reserved.
        </p>
      </footer>

      {/* =========================================================================
          REAL MACHINE-SCANNABLE QR CODE MODAL (TESTED WITH GOOGLE LENS & CHROME)
      ========================================================================= */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="surface-card w-full max-w-sm p-6 relative shadow-2xl border border-primary/30 text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <QrCode className="size-4" /> Live Mobile Scan
            </div>
            <h3 className="font-display text-xl text-foreground">SCAN TO OPEN ON PHONE</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Open your iPhone or Android camera, or Google Lens, and point it directly at this QR code to load the app immediately!
            </p>

            {/* QR Mode Switcher: Cloud URL vs Local Network */}
            <div className="mt-3 flex rounded-lg border border-border bg-muted/60 p-1 text-xs">
              <button
                type="button"
                onClick={() => setQrTarget("cloud")}
                className={`flex-1 rounded-md py-1.5 font-bold transition-all ${
                  qrTarget === "cloud"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🌐 Cloud URL (Vercel)
              </button>
              <button
                type="button"
                onClick={() => setQrTarget("local")}
                className={`flex-1 rounded-md py-1.5 font-bold transition-all ${
                  qrTarget === "local"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                💻 Local Dev ({currentUrl.includes("localhost") ? "Localhost" : "Device"})
              </button>
            </div>

            {/* Standard Machine-Readable QR Code (Works 100% with Google Lens & Chrome) */}
            <div className="mt-4 mx-auto p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
                  scannableUrl
                )}`}
                alt="Spot Light Biriyani QR Code"
                className="size-48 mx-auto"
                loading="eager"
              />
            </div>

            {qrTarget === "local" && currentUrl.includes("localhost") && (
              <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                ⚠️ Scanning 'localhost' on a phone will not connect. Switch to <strong>Cloud URL</strong> to test live scanning from your phone!
              </p>
            )}

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-2 text-xs">
                <span className="font-mono truncate text-muted-foreground px-1 max-w-[200px]" title={scannableUrl}>
                  {scannableUrl}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-foreground border border-border hover:bg-muted shadow-2xs"
                >
                  {copiedLink ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <a
                href={scannableUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-primary font-semibold hover:underline pt-1"
              >
                <span>Open URL directly in browser</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Book Live Tasting, Bulk Party Order & POS Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="surface-card w-full max-w-md p-6 relative shadow-2xl border border-primary/30 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase">
              <Sparkles className="size-4" /> Live Booking &amp; Demo
            </div>
            <h3 className="text-2xl font-display font-black mt-1">TASTE OUR BIRIYANI &amp; CATERING INQUIRY</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Experience authentic Chennai Biriyani tasting at our 3 kitchens, order catering party buckets (1KG, 3KG, 5KG), or request a POS software demo.
            </p>

            <form onSubmit={handleDemoSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Your Name</label>
                <input
                  required
                  placeholder="e.g. Senthil Kumar"
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">WhatsApp / Contact Phone</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98844 30710"
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Inquiry Purpose</label>
                <select
                  value={demoForm.purpose}
                  onChange={(e) => setDemoForm({ ...demoForm, purpose: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none font-medium"
                >
                  <option value="Biriyani Food Tasting & Catering / Bulk Order">🍗 Food Tasting &amp; Bulk Party Buckets (1KG / 3KG / 5KG)</option>
                  <option value="POS Software Demo & Franchise Solution">💻 POS Billing Software Demo &amp; System Inquiry</option>
                  <option value="Wedding / Corporate Event Catering">🎉 Wedding &amp; Corporate Event Catering</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Preferred Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={demoForm.datetime}
                  onChange={(e) => setDemoForm({ ...demoForm, datetime: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kitchen / Location</label>
                <select
                  value={demoForm.city}
                  onChange={(e) => setDemoForm({ ...demoForm, city: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Tharamani (OMR Flagship Kitchen)">Tharamani (OMR Flagship Kitchen)</option>
                  <option value="Adyar (LB Road Beach Kitchen)">Adyar (LB Road Beach Kitchen)</option>
                  <option value="Velachery (Bypass Hub)">Velachery (100ft Road Hub)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-gradient-ember py-3 text-sm font-display font-black text-white shadow-ember flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Sparkles className="size-4" /> Submit via WhatsApp (+91 98844 30710)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Franchise Partnership Application Modal */}
      {showFranchiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="surface-card w-full max-w-lg p-6 relative shadow-2xl border border-primary/30 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowFranchiseModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase">
              <Sparkles className="size-4" /> Brand Expansion &amp; Franchise
            </div>
            <h3 className="text-2xl font-display font-black mt-1">OWN A SPOT LIGHT BIRIYANI FRANCHISE</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Join Chennai&apos;s high-margin Dum Biriyani chain. Zero head-chef dependency with our pre-measured deg spices, central cloud kitchen supply, and automated POS system.
            </p>

            <form onSubmit={handleFranchiseSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Your Name</label>
                  <input
                    required
                    placeholder="e.g. Manikandan"
                    value={franchiseForm.name}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Mobile / WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98844 30710"
                    value={franchiseForm.phone}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Target City / Area Proposed</label>
                <input
                  required
                  placeholder="e.g. Chennai - Velachery / Tambaram, Coimbatore, Madurai"
                  value={franchiseForm.city}
                  onChange={(e) => setFranchiseForm({ ...franchiseForm, city: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Commercial Space Status</label>
                  <select
                    value={franchiseForm.spaceStatus}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, spaceStatus: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Seeking Commercial Space">Seeking Commercial Space</option>
                    <option value="Rented Property Ready">Rented Property Ready (250-800 sq ft)</option>
                    <option value="Self-Owned Commercial Space">Self-Owned Commercial Space</option>
                    <option value="Food Court / Mall Space">Food Court / Mall Space</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Investment Budget</label>
                  <select
                    value={franchiseForm.investment}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, investment: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="₹10L - ₹15L (Cloud Kitchen Model)">₹10L - ₹15L (Cloud Kitchen)</option>
                    <option value="₹20L - ₹35L (Express Takeaway & Counter)">₹20L - ₹35L (Express Counter)</option>
                    <option value="₹50L+ (Flagship Dine-in Restaurant)">₹50L+ (Flagship Dine-in)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Prior Restaurant / Retail Experience</label>
                <select
                  value={franchiseForm.experience}
                  onChange={(e) => setFranchiseForm({ ...franchiseForm, experience: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="First-time Entrepreneur / Passionate about Biriyani">First-time Entrepreneur / New to F&B</option>
                  <option value="Existing Restaurant / Cafe Owner">Existing Restaurant / Cafe Owner</option>
                  <option value="Retail Franchise Investor">Retail Franchise Investor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Looking to launch within next 60 days, prime road facing shop available..."
                  value={franchiseForm.notes}
                  onChange={(e) => setFranchiseForm({ ...franchiseForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-gradient-ember py-3 text-sm font-display font-black text-white shadow-ember flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <span>🤝 Submit Franchise Application via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI & FAQ Restaurant Assistant */}
      <SpotlightAssistant />
    </div>
  );
}
