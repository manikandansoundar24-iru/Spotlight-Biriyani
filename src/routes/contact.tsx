import { createFileRoute } from "@tanstack/react-router";
import { Bike, Mail, Phone, Utensils } from "lucide-react";

import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Bulk Orders — Spot Light Biriyani" },
      {
        name: "description",
        content:
          "Call Spot Light Biriyani for bulk and party biriyani orders in Chennai, or order online through Swiggy and Zomato. Open daily 12:30 pm – 10:30 pm.",
      },
      { property: "og:title", content: "Contact & Bulk Orders — Spot Light Biriyani" },
      { property: "og:description", content: "Party orders, catering and online delivery across Chennai." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight">SAY HELLO / ORDER BIG</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Party trays from 10 plates upwards. Give us 4 hours notice and your fresh biriyani feast is ready.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <a href="tel:+919000000001" className="surface-card block p-6">
            <Phone className="size-5 text-primary" />
            <h2 className="mt-3 text-xl">CALL THE COUNTER</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">+91 90000 00001 · 12:30 pm – 10:30 pm</p>
          </a>
          <a href="mailto:orders@spotlightbiriyani.in" className="surface-card block p-6">
            <Mail className="size-5 text-primary" />
            <h2 className="mt-3 text-xl">BULK &amp; CATERING</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">orders@spotlightbiriyani.in</p>
          </a>
          <div className="surface-card p-6">
            <Bike className="size-5 text-primary" />
            <h2 className="mt-3 text-xl">DELIVERY</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Search "Spot Light Biriyani" on Swiggy or Zomato for your area.
            </p>
          </div>
          <div className="surface-card p-6">
            <Utensils className="size-5 text-primary" />
            <h2 className="mt-3 text-xl">DINE IN</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Walk-ins only, no reservations. Peak rush 1 pm and 8 pm.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
