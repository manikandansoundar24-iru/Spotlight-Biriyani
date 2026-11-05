import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ExternalLink, Heart, MapPin, MessageSquare, Phone, Sparkles, Star, Utensils, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/manam")({
  head: () => ({
    meta: [
      { title: "Manam Restaurant — Velachery Main Rd (Opp. Phoenix Market City), Chennai" },
      {
        name: "description",
        content:
          "Manam Restaurant, Velachery: Authentic Multi-Cuisine Family Dining & Late Night Kitchen open till 4:00 AM. Biriyani, Tandoori, Chinese & Chettinad specials.",
      },
      { property: "og:title", content: "Manam Restaurant — Velachery, Chennai" },
      { property: "og:description", content: "Family dining & late-night kitchen open till 4 AM opposite Phoenix Market City." },
    ],
  }),
  component: ManamShowcasePage,
});

type MenuItem = {
  id: string;
  name: string;
  category: "starters" | "biriyani" | "gravies" | "breads" | "desserts";
  price: number;
  desc: string;
  isBestseller?: boolean;
  isVeg?: boolean;
};

const MANAM_MENU: MenuItem[] = [
  // Starters
  { id: "m1", name: "Chicken 65 (Boneless)", category: "starters", price: 210, desc: "Crispy Chennai style spiced chicken tossed with curry leaves", isBestseller: true },
  { id: "m2", name: "Tandoori Chicken (Half)", category: "starters", price: 240, desc: "Smoky clay-oven roasted chicken with mint chutney" },
  { id: "m3", name: "Dragon Chicken", category: "starters", price: 230, desc: "Indo-Chinese sweet and spicy wok-tossed chicken strips" },
  { id: "m4", name: "Chettinad Pepper Mutton Fry", category: "starters", price: 320, desc: "Tender goat meat slow-roasted in crushed black peppercorns", isBestseller: true },
  { id: "m5", name: "Paneer Tikka (Tandoori)", category: "starters", price: 190, desc: "Marinated cottage cheese cubes roasted with capsicum & onion", isVeg: true },

  // Biriyani & Rice
  { id: "m6", name: "Manam Special Chicken Biriyani", category: "biriyani", price: 220, desc: "Fragrant basmati rice layered with succulent chicken, served with raita & salna", isBestseller: true },
  { id: "m7", name: "Velachery Mutton Dum Biriyani", category: "biriyani", price: 310, desc: "Rich slow-cooked mutton biriyani with aromatic whole spices", isBestseller: true },
  { id: "m8", name: "Egg Dum Biriyani", category: "biriyani", price: 150, desc: "Flavorful biriyani rice served with two seasoned hard-boiled eggs" },
  { id: "m9", name: "Schezwan Chicken Fried Rice", category: "biriyani", price: 190, desc: "Wok-fried rice with shredded chicken, eggs and fiery Schezwan sauce" },
  { id: "m10", name: "Mushroom Ghee Rice", category: "biriyani", price: 170, desc: "Aromatic Malabar ghee rice sautéed with fresh button mushrooms", isVeg: true },

  // Curries & Gravies
  { id: "m11", name: "Butter Chicken Masala", category: "gravies", price: 240, desc: "Tender tandoori chicken simmered in rich creamy tomato-butter gravy", isBestseller: true },
  { id: "m12", name: "Kadai Chicken", category: "gravies", price: 230, desc: "Spicy chicken gravy cooked in iron wok with bell peppers and roasted coriander" },
  { id: "m13", name: "Chettinad Mutton Chukka Gravy", category: "gravies", price: 330, desc: "Traditional spicy Chettinad style rich gravy with tender mutton pieces", isBestseller: true },
  { id: "m14", name: "Paneer Butter Masala", category: "gravies", price: 190, desc: "Soft cottage cheese simmered in mild makhani sauce", isVeg: true },

  // Breads
  { id: "m15", name: "Butter Garlic Naan", category: "breads", price: 65, desc: "Leavened tandoor bread brushed with butter and minced toasted garlic", isVeg: true },
  { id: "m16", name: "Kerala Flaky Parotta (2 Pcs)", category: "breads", price: 60, desc: "Layered, flaky golden pan-toasted parotta", isVeg: true },
  { id: "m17", name: "Chilli Parotta (Street Style)", category: "breads", price: 150, desc: "Shredded parotta wok-tossed with onions, capsicum, egg and spices", isBestseller: true },

  // Desserts & Beverages
  { id: "m18", name: "Elaneer Payasam", category: "desserts", price: 110, desc: "Refreshing tender coconut pudding made with rich condensed milk", isBestseller: true, isVeg: true },
  { id: "m19", name: "Sizzling Brownie with Ice Cream", category: "desserts", price: 160, desc: "Warm chocolate brownie on sizzler plate topped with vanilla ice cream & hot fudge", isVeg: true },
  { id: "m20", name: "Fresh Mint Lime Mojito", category: "desserts", price: 90, desc: "Chilled sparkling cooler with fresh lime, mint leaves and rock salt", isVeg: true },
];

function ManamShowcasePage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "starters" | "biriyani" | "gravies" | "breads" | "desserts">("all");

  const filteredItems = activeCategory === "all" ? MANAM_MENU : MANAM_MENU.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Floating Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-2 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="size-3.5 animate-spin" />
        <span>LATE NIGHT DINING ACTIVE · OPEN TILL 4:00 AM · DINE-IN &amp; TAKEAWAY</span>
      </div>

      {/* Hero Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-xs font-black text-amber-400 uppercase tracking-widest">
                  Velachery Flagship
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Star className="size-3 fill-emerald-400" /> 4.5 (50+ Google Reviews)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
                MANAM RESTAURANT
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Authentic Multi-Cuisine Family Dining &amp; Midnight Culinary Destination. Serving fragrant Biriyani, sizzling Tandoori grills, spicy Chettinad gravies and Chinese specials opposite Phoenix Market City.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-amber-400 shrink-0" />
                  <span>53, Velachery Main Rd, Opp. PHOENIX MARKET CITY, Chennai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-amber-400 shrink-0" />
                  <span>12:00 PM – 4:00 AM Daily</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-col gap-2.5 w-full md:w-auto shrink-0">
              <a
                href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-100 transition-all shadow-sm"
              >
                <MapPin className="size-4 text-red-400" />
                <span>Google Maps Directions</span>
                <ExternalLink className="size-3 text-slate-400" />
              </a>

              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20food%20or%20reserve%20a%20table"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md"
              >
                <MessageSquare className="size-4" />
                <span>WhatsApp Order / Table Tab</span>
              </a>

              <Link
                to="/login"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2.5 text-xs font-black text-white transition-all shadow-md"
              >
                <Zap className="size-4" />
                <span>Manam Staff POS Login →</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Highlights Bar */}
      <section className="border-b border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="block text-base font-black text-amber-400">4:00 AM</span>
            <span className="text-[11px] text-slate-400">Late Night Midnight Dining</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="block text-base font-black text-amber-400">Family AC</span>
            <span className="text-[11px] text-slate-400">Spacious Hall &amp; Cabins</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="block text-base font-black text-amber-400">100% Halal</span>
            <span className="text-[11px] text-slate-400">Fresh Meat &amp; Ingredients</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="block text-base font-black text-amber-400">0% Commission</span>
            <span className="text-[11px] text-slate-400">Direct Delivery Available</span>
          </div>
        </div>
      </section>

      {/* Live Menu Section */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">SIGNATURE MENU</h2>
            <p className="text-xs text-slate-400 mt-1">Authentic recipes crafted by master chefs for lunch, dinner and late night cravings.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {[
              { id: "all", label: "All Items" },
              { id: "biriyani", label: "Biriyani & Rice" },
              { id: "starters", label: "Starters & Grills" },
              { id: "gravies", label: "Curries & Gravies" },
              { id: "breads", label: "Tandoor & Breads" },
              { id: "desserts", label: "Desserts & Coolers" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ${item.isVeg ? "bg-emerald-500 ring-2 ring-emerald-500/30" : "bg-red-500 ring-2 ring-red-500/30"}`}
                      title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                    />
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  {item.isBestseller && (
                    <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-lg font-black text-amber-400 font-display">
                  ₹{item.price}
                </span>

                <a
                  href={`https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(₹${item.price})`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <MessageSquare className="size-3" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer / Software Pitch */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-900/90 py-8 px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 text-white font-bold text-xs">
              ⚡
            </span>
            <span className="font-display font-black text-sm tracking-wider uppercase text-white">
              RESTOPULSE CLOUD ERP &amp; POS
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            This digital portal, real-time table management, KDS kitchen display, and dynamic UPI QR billing for <strong>Manam Restaurant</strong> are powered by RestoPulse.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold text-amber-400">
            <Link to="/login" className="hover:underline">
              Terminal Sign In
            </Link>
            <span>·</span>
            <Link to="/app" className="hover:underline">
              Live POS Dashboard
            </Link>
            <span>·</span>
            <a href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA" target="_blank" rel="noreferrer" className="hover:underline">
              Location on Google Maps
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
