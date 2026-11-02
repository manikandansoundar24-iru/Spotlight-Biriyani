import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Flame,
  Layers,
  LayoutGrid,
  MapPin,
  Package,
  Phone,
  Printer,
  Receipt,
  Scissors,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
  Wrench,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Spotlight Commerce Cloud — Multi-Industry Business OS & POS Suite" },
      {
        name: "description",
        content:
          "The unified business operating system inspired by Square and Toast. High-speed POS engines for Restaurants & Chennai Biriyani, Hair Salons, Fresh Meat Markets, and Wholesale Distribution.",
      },
    ],
  }),
  component: MasterPlatformPage,
});

interface Vertical {
  id: string;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  badge: string;
  status: "Live & Deployed" | "Ready for Rollout" | "In Development";
  features: string[];
  metrics: string;
  actionUrl: string;
  actionText: string;
  quickLinks: { label: string; url: string }[];
}

const VERTICALS: Vertical[] = [
  {
    id: "food",
    name: "Spotlight Biriyani & QSR Suite",
    category: "Restaurants, Cloud Kitchens & Biriyani Chains",
    tagline: "Engineered specifically for fresh batch tracking, 3-second counter billing, and automated Swiggy/Zomato commission recovery.",
    icon: "🍲",
    badge: "Flagship Engine",
    status: "Live & Deployed",
    features: [
      "Kitchen Batch Countdown (Live Plates Remaining)",
      "0ms Offline Counter POS with ESC/POS 80mm & 58mm Thermal Printing",
      "True Food Cost Margin per Plate & Swiggy 28% Commission Deductor",
      "Interactive Chennai Metro GPS Radar & 5km Delivery Radius",
      "Direct WhatsApp Digital Bill Dispatcher to Customer Phone",
    ],
    metrics: "₹24,000+ Avg. monthly profit recovered per counter",
    actionUrl: "/app/billing",
    actionText: "Open Billing Terminal",
    quickLinks: [
      { label: "Live Menu", url: "/menu" },
      { label: "Billing Terminal", url: "/app/billing" },
      { label: "Stock Ledger", url: "/app/stock" },
      { label: "Chennai Radar", url: "/branches" },
      { label: "Printer Config", url: "/app/settings" },
    ],
  },
  {
    id: "salon",
    name: "StyleStudio — Salon & Spa OS",
    category: "Hair Salons, Spas & Beauty Studios",
    tagline: "Appointment calendars, chair utilization, automated stylist commission splits, and client repeat cards.",
    icon: "💇",
    badge: "Beauty & Wellness",
    status: "Ready for Rollout",
    features: [
      "Visual Chair & Stylist Booking Schedule with SMS Reminders",
      "Automated Stylist Commission Calculator (Service + Product bonus)",
      "Client Hair History, Preferred Products & Membership Wallets",
      "Fast Express Billing with UPI Soundbox & WhatsApp Invoices",
    ],
    metrics: "32% Increase in re-booking and client retention",
    actionUrl: "/demo",
    actionText: "Request Salon POS Demo",
    quickLinks: [
      { label: "Book Consultation", url: "/demo" },
      { label: "Feature Matrix", url: "/demo" },
    ],
  },
  {
    id: "meat",
    name: "FreshCut — Meat & Seafood POS",
    category: "Butcheries, Poultry Chains & Seafood Markets",
    tagline: "Live electronic weighing scale integration, carcass yield cutting math, and cold storage batch tracking.",
    icon: "🥩",
    badge: "Meat & Poultry",
    status: "Ready for Rollout",
    features: [
      "Direct USB/RS232 Electronic Weighing Scale Auto-Tare & Read",
      "Whole Goat/Chicken Cut-Yield Calculator (Curry cut, Bone-in, Keema)",
      "Cold-Storage Chilled Batch Expiry Alerts & Same-Day Clearance",
      "Daily Wholesale Market Meat Rate Board with 1-Tap Price Sync",
    ],
    metrics: "Zero weighing fraud & 99.4% carcass yield accuracy",
    actionUrl: "/demo",
    actionText: "Request Meat POS Demo",
    quickLinks: [
      { label: "Hardware Compatibility", url: "/demo" },
      { label: "Schedule Scale Demo", url: "/demo" },
    ],
  },
  {
    id: "wholesale",
    name: "TradePulse — Wholesale & Mart POS",
    category: "Wholesale Distributors, FMCG & Supermarts",
    tagline: "High-volume barcode scanning, carton & loose piece conversion, B2B GST tax invoices, and customer khata.",
    icon: "📦",
    badge: "Wholesale & FMCG",
    status: "In Development",
    features: [
      "Dual Master Units: Carton Box vs. Individual Loose Piece Ledger",
      "Instant B2B GST E-Way Bill & E-Invoice Generation",
      "Customer Khata Ledger (Payment Due Dates & WhatsApp Statement)",
      "High-speed USB HID Barcode Reader Support (100 items/minute)",
    ],
    metrics: "₹1.2L Saved in manual bookkeeping & stock leakage",
    actionUrl: "/demo",
    actionText: "Request Wholesale Demo",
    quickLinks: [
      { label: "B2B GST Details", url: "/demo" },
      { label: "Contact Sales", url: "/demo" },
    ],
  },
];

function MasterPlatformPage() {
  const [activeVertical, setActiveVertical] = useState("food");
  const [bizType, setBizType] = useState<string | null>("food");

  const selected = (VERTICALS.find((v) => v.id === activeVertical) || VERTICALS[0])!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500/20">
      {/* Platform Header (Square Style) */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-8">
            <Link to="/platform" className="flex items-center gap-3 group">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-ember shadow-ember group-hover:scale-105 transition-transform">
                <Flame className="size-5 text-white" />
              </span>
              <div>
                <span className="font-display text-lg tracking-wide text-slate-900 block leading-none">
                  SPOTLIGHT
                </span>
                <span className="text-[0.62rem] font-sans font-bold tracking-[0.25em] text-primary block mt-0.5">
                  COMMERCE CLOUD
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {VERTICALS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVertical(v.id);
                    setBizType(v.id);
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeVertical === v.id
                      ? "bg-slate-100 text-primary font-extrabold"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  {v.name.split("—")[0]?.replace("Suite", "").trim() ?? v.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Staff Login
            </Link>
            <Link
              to="/demo"
              className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Book Demo
            </Link>
            <Link
              to="/app/billing"
              className="rounded-full bg-gradient-ember px-4 py-2 text-xs font-bold text-white shadow-ember hover:opacity-95 transition-all hover:scale-105"
            >
              Launch POS App →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Square / Toast White Aesthetic) */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-700 shadow-2xs">
            <Sparkles className="size-3.5 text-orange-600" /> Unified Business Engine Architecture
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-display tracking-tight text-slate-900 leading-tight">
            ONE COMMERCE ENGINE. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600">
              FOUR VERTICAL INDUSTRY SUITES.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The modern operating architecture for local businesses. Whether you run a high-speed Chennai Biriyani kitchen, a premier hair styling salon, a fresh meat market, or wholesale FMCG distribution — Spotlight powers your counter, stock ledger, and bottom-line margins.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/app/billing"
              className="rounded-full bg-gradient-ember px-7 py-3 text-sm font-bold text-white shadow-ember hover:scale-105 transition-transform"
            >
              Open Spotlight Biriyani POS Counter
            </Link>
            <Link
              to="/menu"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View Live Restaurant Menu
            </Link>
            <Link
              to="/branches"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Chennai Kitchens Radar
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Business Engine Selector (Square Style) */}
      <section className="mx-auto max-w-5xl px-6 -mt-8 relative z-10 mb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Bot className="size-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Spotlight Intelligent Business Recommender</h3>
                <p className="text-xs text-slate-500">Pick an industry vertical to see purpose-built features &amp; quick access links.</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-semibold text-slate-600">
              Interactive Selector
            </span>
          </div>

          <div className="mt-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {VERTICALS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setBizType(opt.id);
                    setActiveVertical(opt.id);
                  }}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    activeVertical === opt.id
                      ? "border-primary bg-orange-50/70 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="text-2xl mb-2">{opt.icon}</span>
                  <p className="font-bold text-sm text-slate-900">{opt.name.split("—")[0]?.trim() ?? opt.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{opt.category}</p>
                </button>
              ))}
            </div>

            {/* Selected Engine Spotlight Card */}
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="inline-block rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {selected.badge}
                  </span>
                  <h4 className="mt-1 font-display text-xl text-slate-900">{selected.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{selected.tagline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={selected.actionUrl}
                    className="rounded-full bg-gradient-ember px-5 py-2.5 text-xs font-bold text-white shadow-ember hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    <span>{selected.actionText}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Jump Links */}
              {selected.quickLinks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-orange-200/70 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                    Quick Navigation:
                  </span>
                  {selected.quickLinks.map((ql, idx) => (
                    <Link
                      key={idx}
                      to={ql.url}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors shadow-2xs"
                    >
                      <span>{ql.label}</span>
                      <ExternalLink className="size-3 text-slate-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Deep Industry Specialized Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Tailored Workflows</p>
          <h2 className="mt-1.5 text-3xl font-display text-slate-900">DEEP INDUSTRY SPECIALIZATION</h2>
          <p className="mt-2 text-sm text-slate-600">
            Never force generic screens onto a live biriyani kitchen or an appointment salon. Each industry gets its own purpose-built mechanics.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {VERTICALS.map((v) => (
            <div
              key={v.id}
              className={`rounded-2xl border bg-white p-6 sm:p-7 flex flex-col justify-between transition-all ${
                activeVertical === v.id
                  ? "border-orange-500 shadow-lg ring-1 ring-orange-500/20"
                  : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{v.icon}</span>
                    <div>
                      <h3 className="font-display text-xl text-slate-900">{v.name}</h3>
                      <p className="text-xs text-orange-600 font-semibold">{v.category}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      v.status === "Live & Deployed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <p className="mt-3.5 text-xs text-slate-600 leading-relaxed">{v.tagline}</p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Key Engineered Capabilities:
                  </p>
                  <ul className="mt-2 space-y-2 text-xs text-slate-700">
                    {v.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Impact:</span>
                  <p className="text-xs font-bold text-emerald-700">{v.metrics}</p>
                </div>
                <Link
                  to={v.actionUrl}
                  className="rounded-full bg-slate-100 hover:bg-orange-600 hover:text-white px-4 py-2 text-xs font-bold text-slate-800 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>{v.actionText}</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Spotlight Commerce Cloud. Operating Architecture for Local Business.</p>
        <div className="mt-2 flex justify-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-orange-600 font-medium">Spotlight Biriyani Food App</Link>
          <Link to="/menu" className="text-slate-600 hover:text-orange-600 font-medium">Live Menu</Link>
          <Link to="/branches" className="text-slate-600 hover:text-orange-600 font-medium">Chennai Kitchens Radar</Link>
          <Link to="/demo" className="text-slate-600 hover:text-orange-600 font-medium">Request Live Demo</Link>
          <Link to="/login" className="text-slate-600 hover:text-orange-600 font-medium">Staff Portal</Link>
        </div>
      </footer>
    </div>
  );
}
