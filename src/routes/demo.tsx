import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Clock, Flame, MessageCircle, Phone, ShieldCheck, Sparkles, Star, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Book a Free Tasting & Live POS Demo — Spot Light Biriyani" },
      {
        name: "description",
        content:
          "Experience authentic Chennai biriyani and test drive our restaurant management & billing software. For owners, cloud kitchens & franchise partners.",
      },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    restaurant: "",
    outlets: "1",
    city: "Chennai",
    date: "",
    pref: "Tharamani Flagship (OMR)",
    notes: "",
  });
  const [platesPerDay, setPlatesPerDay] = useState(150);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please provide your name and phone number");
      return;
    }
    toast.success("Demo booking received! Our Chennai operations lead will contact you within 15 minutes.");

    const text = encodeURIComponent(
      `*New Restaurant Tasting & Software Demo Booking*\n` +
      `• Name: ${form.name}\n` +
      `• Phone: ${form.phone}\n` +
      `• Restaurant/Brand: ${form.restaurant || "New Outlet"}\n` +
      `• Outlets: ${form.outlets}\n` +
      `• Preferred Location: ${form.pref}\n` +
      `• Estimated Daily Plates: ${platesPerDay}\n` +
      `• Notes: ${form.notes || "None"}`
    );
    window.open(`https://wa.me/919884430710?text=${text}`, "_blank");
  };

  // ROI Math
  const monthlySavings = Math.round(platesPerDay * 30 * 4.5); // ₹4.50 saved per plate on wastage & commission reconciliation
  const annualProfitIncrease = Math.round(monthlySavings * 12);

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" /> For Restaurant Owners &amp; Cloud Kitchen Founders
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight">
            TASTE THE CRAFT. TEST DRIVE THE SOFTWARE.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            We invite restaurateurs, franchise investors, and biriyani chain owners to an on-site tasting session and an interactive walkthrough of the Spot Light Manager POS suite.
          </p>
        </div>

        {/* 2-Column Section: Booking Form + ROI & Benefits */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
          {/* Booking Card */}
          <div className="surface-card p-6 sm:p-8 border-primary/40 shadow-2xl bg-card">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-2xl font-display">RESERVE YOUR 30-MIN SESSION</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Zero obligation · Complied fresh biriyani tasting included</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400">
                100% Free
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">Your Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Manikandan Soundar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">WhatsApp / Phone Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98400 xxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">Restaurant or Concept Name</label>
                  <input
                    placeholder="e.g. Royal Biriyani Hub"
                    value={form.restaurant}
                    onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Number of Branches</label>
                  <select
                    value={form.outlets}
                    onChange={(e) => setForm({ ...form, outlets: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                  >
                    <option value="1">1 Outlet (Single Kitchen)</option>
                    <option value="2-4">2 – 4 Outlets (Growing Chain)</option>
                    <option value="5+">5+ Outlets (Enterprise Multi-Branch)</option>
                    <option value="New Launch">Planning New Opening Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Preferred Location in Chennai</label>
                <select
                  value={form.pref}
                  onChange={(e) => setForm({ ...form, pref: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                >
                  <option value="Tharamani Flagship (OMR)">Tharamani Flagship (Near Tidel Park OMR)</option>
                  <option value="Adyar Beach Kitchen">Adyar Kitchen (LB Road / Besant Nagar)</option>
                  <option value="Velachery Hub">Velachery Hub (100 Feet Bypass)</option>
                  <option value="At Your Restaurant">Visit My Restaurant in Chennai</option>
                  <option value="Online Zoom Walkthrough">Online Live Screen Demo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Any Specific Requirements / Questions?</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Thermal printer setup, Swiggy commission tracker, recipe secret lock..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-3 rounded-full bg-gradient-ember py-3.5 text-sm font-bold text-primary-foreground shadow-ember flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <Sparkles className="size-4" /> Confirm Free Tasting &amp; Live POS Demo
              </button>

              <p className="text-center text-[11px] text-muted-foreground mt-2">
                🔒 Your contact details are 100% private. We will never share your information.
              </p>
            </form>
          </div>

          {/* Interactive ROI Calculator & Feature Highlights */}
          <div className="space-y-6">
            {/* ROI Calculator Card */}
            <div className="surface-card p-6 border-border/80 bg-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Profit Impact Calculator
              </span>
              <h3 className="text-2xl font-display mt-1">SEE HOW MUCH YOU RECOVER</h3>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Daily Biriyani Plates Sold:</span>
                  <span className="text-primary font-bold text-base">{platesPerDay} plates / day</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={platesPerDay}
                  onChange={(e) => setPlatesPerDay(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Monthly Recovered Leakage</p>
                  <p className="text-xl font-display text-emerald-400 mt-1">₹{monthlySavings.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Annual Profit Boost</p>
                  <p className="text-xl font-display text-primary mt-1">₹{annualProfitIncrease.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                * Based on eliminating aggregator hidden commission leakages and avoiding unsold batch wastage.
              </p>
            </div>

            {/* What You Get In The Demo */}
            <div className="surface-card p-6 border-border/80 bg-card">
              <h3 className="text-lg font-bold">What is Included in Your 30-Min Demo:</h3>
              <ul className="mt-3 space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span><strong>Live Counter Billing:</strong> Test 3-second thermal receipt generation on physical 80mm printers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span><strong>Offline Billing Test:</strong> Watch billing continue with 100% data integrity even with the internet cable unplugged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span><strong>Recipe Cost &amp; Profit Engine:</strong> Calculate your exact plate cost per mutton and chicken batch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span><strong>Complimentary Tasting:</strong> Fresh hot biriyani, ennai kathirikai, and bread halwa served directly from the kitchen.</span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Immediate Questions?</p>
                  <p className="text-xs text-primary font-bold">Call: +91 98844 30710</p>
                </div>
                <Link
                  to="/login"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary transition-colors"
                >
                  Staff Login Portal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
