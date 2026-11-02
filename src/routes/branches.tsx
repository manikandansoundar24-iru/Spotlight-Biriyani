import { createFileRoute } from "@tanstack/react-router";
import { Clock, ExternalLink, Flame, MapPin, Navigation, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { SiteShell } from "@/components/site/SiteShell";
import { ChennaiLeafletMap } from "@/components/map/ChennaiLeafletMap";
import { getDB, getLiveBatchStatus, useDB } from "@/lib/pos-store";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Our 3 Chennai Kitchens — Spot Light Biriyani" },
      {
        name: "description",
        content:
          "Visit Spot Light Biriyani in Tharamani, Adyar, and Velachery. Authentic Chennai biriyani cooked fresh twice daily. Dine in, takeaway & Swiggy/Zomato.",
      },
      { property: "og:title", content: "Our 3 Chennai Kitchens — Spot Light Biriyani" },
      { property: "og:description", content: "Tharamani, Adyar and Velachery kitchens across South Chennai." },
    ],
  }),
  component: BranchesPage,
});

const CHENNAI_PINS = [
  {
    id: "tharamani",
    name: "Tharamani Kitchen",
    landmark: "Near Kazhikundram / Tidel Park OMR",
    top: "54%",
    left: "62%",
    phone: "+91 90000 00001",
    status: "Lunch Batch Open · 14 Plates Left",
    highlight: "Primary Flagship Kitchen",
  },
  {
    id: "adyar",
    name: "Adyar Kitchen",
    landmark: "LB Road / Near Besant Nagar Beach",
    top: "38%",
    left: "70%",
    phone: "+91 90000 00002",
    status: "Dinner Batch Ready at 7:00 PM",
    highlight: "Family Dine-in & Beach Parcels",
  },
  {
    id: "velachery",
    name: "Velachery Kitchen",
    landmark: "100 Feet Road / Bypass Junction",
    top: "62%",
    left: "48%",
    phone: "+91 90000 00003",
    status: "Lunch Batch Open · Fast Delivery",
    highlight: "High-Speed Delivery Hub",
  },
];

function BranchesPage() {
  const live = useDB();
  const db = live ?? getDB();
  const [activePin, setActivePin] = useState("tharamani");

  const selected = CHENNAI_PINS.find((p) => p.id === activePin) || CHENNAI_PINS[0];

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <MapPin className="size-3.5" /> South Chennai Presence
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-display">THREE KITCHENS, ONE RECIPE</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-card p-2 rounded-xl border border-border">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>FSSAI Certified · Farm-fresh Meat Daily</span>
          </div>
        </div>
        
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every branch prepares fresh batches in-house every morning at 11:30 AM and 6:00 PM. No centralized frozen reheats — strictly fresh from fire to plate.
        </p>

        {/* Chennai Metro Interactive Pin Map Section */}
        <div className="mt-10">
          <ChennaiLeafletMap activeId={activePin} onSelectBranch={setActivePin} height="520px" />
        </div>

        {/* Detailed Kitchen Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {db.branches.map((b) => {
            const batch = getLiveBatchStatus(db, b.id);
            return (
              <article key={b.id} className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-2xl font-display text-primary">{b.name.toUpperCase()}</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {batch.platesLeft} Plates Left
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-emerald-500">{batch.status}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {b.address}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4 text-primary" /> {b.phone}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 text-primary" /> 12:30 pm – 10:30 pm
                  </p>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `Spot Light Biriyani ${b.address}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:border-primary transition-colors"
                  >
                    <Navigation className="size-3 text-primary" /> Directions
                  </a>
                  <a
                    href={`tel:${b.phone}`}
                    className="flex items-center justify-center rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:border-primary transition-colors"
                    title="Call Branch"
                  >
                    <Phone className="size-3 text-primary" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
