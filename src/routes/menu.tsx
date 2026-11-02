import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";
import { CATEGORIES, getDB, inr, useDB } from "@/lib/pos-store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu & Prices — Spot Light Biriyani, Chennai" },
      {
        name: "description",
        content:
          "Full Spot Light Biriyani menu: chicken and mutton biriyani, egg biriyani, kushka, Chicken 65, kebabs, parotta and desserts with counter prices.",
      },
      { property: "og:title", content: "Menu & Prices — Spot Light Biriyani" },
      { property: "og:description", content: "Biriyani, kushka, starters and desserts with live counter prices." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const live = useDB();
  const db = live ?? getDB();

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight">THE MENU</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Counter prices shown. Swiggy and Zomato prices differ slightly to cover platform
          commission and packing.
        </p>

        <div className="mt-12 space-y-12">
          {CATEGORIES.map((cat) => {
            const items = db.items.filter((i) => i.category === cat.id && i.active);
            if (!items.length) return null;
            return (
              <div key={cat.id}>
                <h2 className="text-2xl text-primary">{cat.label.toUpperCase()}</h2>
                <ul className="mt-4 divide-y divide-border/60">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="text-sm font-medium">{i.name}</span>
                      <span className="flex-1 border-b border-dashed border-border/50" />
                      <span className="font-display text-base">{inr(i.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
