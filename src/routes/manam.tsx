import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, ChevronRight, Clock, Compass, Download, ExternalLink, Flame, Heart, MapPin, MessageCircle, MessageSquare, Phone, ShieldCheck, Sparkles, Star, TrendingUp, Users, Utensils, Zap } from "lucide-react";
import { useState } from "react";

import heroImg from "@/assets/hero-biriyani.jpg";
import chickenRealImg from "@/assets/chicken-biriyani-real.jpg";
import muttonRealImg from "@/assets/mutton-biriyani-real.jpg";
import kushkaRealImg from "@/assets/kushka-salna-real.jpg";
import breadHalwaImg from "@/assets/bread-halwa.jpg";
import ennaiKathirikaiImg from "@/assets/ennai-kathirikai.jpg";
import onionRaitaImg from "@/assets/onion-raita.jpg";

export const Route = createFileRoute("/manam")({
  head: () => ({
    meta: [
      { title: "Manam Restaurant — Velachery Main Rd (Opp. Phoenix Market City), Chennai" },
      {
        name: "description",
        content:
          "Manam Restaurant, Velachery: Authentic Multi-Cuisine Family Dining & Late Night Kitchen open till 4:00 AM. Biriyani, Tandoori, Chinese & Chettinad specials opposite Phoenix Market City.",
      },
      { property: "og:title", content: "Manam Restaurant — Velachery, Chennai (Open till 4 AM)" },
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
  img?: string;
  isBestseller?: boolean;
  isVeg?: boolean;
};

const MANAM_MENU: MenuItem[] = [
  // Signature Biriyanis & Rice
  {
    id: "m6",
    name: "Manam Special Chicken Dum Biriyani",
    category: "biriyani",
    price: 220,
    desc: "Fragrant long-grain spiced seeraga samba rice layered with succulent tender chicken cuts, served with creamy onion raita and ennai kathirikai salna.",
    img: chickenRealImg,
    isBestseller: true,
  },
  {
    id: "m7",
    name: "Velachery Mutton Dum Biriyani",
    category: "biriyani",
    price: 310,
    desc: "Rich slow-cooked goat mutton dum biriyani cooked with whole crushed spices, pure ghee, and caramelized shallots.",
    img: muttonRealImg,
    isBestseller: true,
  },
  {
    id: "m8",
    name: "Fragrant Kushka with Rich Salna",
    category: "biriyani",
    price: 110,
    desc: "Aromatic dum-cooked biriyani rice without meat, served with spicy Chettinad brinjal salna and chilled curd raita.",
    img: kushkaRealImg,
    isBestseller: true,
  },
  {
    id: "m9",
    name: "Schezwan Chicken Fried Rice",
    category: "biriyani",
    price: 190,
    desc: "Wok-fried jasmine rice with shredded spiced chicken, scrambled eggs, spring onions, and fiery house Schezwan sauce.",
  },
  {
    id: "m10",
    name: "Mushroom Ghee Rice",
    category: "biriyani",
    price: 170,
    desc: "Aromatic Malabar ghee rice sautéed with fresh button mushrooms, golden cashews, and crispy fried onions.",
    isVeg: true,
  },

  // Starters & Grills
  {
    id: "m1",
    name: "Chicken 65 (Boneless)",
    category: "starters",
    price: 210,
    desc: "Crispy Chennai street style spiced chicken tossed with fresh curry leaves, green chillies, and cracked pepper.",
    img: chickenRealImg,
    isBestseller: true,
  },
  {
    id: "m2",
    name: "Tandoori Chicken (Half)",
    category: "starters",
    price: 240,
    desc: "Smoky clay-oven charcoal roasted chicken marinated in Kashmiri chilli curd masala, served with mint chutney and lemon wedges.",
    isBestseller: true,
  },
  {
    id: "m3",
    name: "Dragon Chicken",
    category: "starters",
    price: 230,
    desc: "Indo-Chinese sweet and spicy wok-tossed crispy chicken strips glazed with honey, sesame, and roasted garlic.",
  },
  {
    id: "m4",
    name: "Chettinad Pepper Mutton Fry",
    category: "starters",
    price: 320,
    desc: "Tender boneless goat meat slow-roasted in freshly ground black peppercorns, curry leaves, and country garlic.",
    isBestseller: true,
  },
  {
    id: "m5",
    name: "Paneer Tikka (Tandoori)",
    category: "starters",
    price: 190,
    desc: "Marinated soft malai cottage cheese cubes roasted on skewers with charred bell peppers and onions.",
    isVeg: true,
  },

  // Curries & Gravies
  {
    id: "m11",
    name: "Butter Chicken Masala",
    category: "gravies",
    price: 240,
    desc: "Tender pulled tandoori chicken simmered in rich creamy velvet tomato-butter makhani gravy with fenugreek.",
    isBestseller: true,
  },
  {
    id: "m12",
    name: "Kadai Chicken Wok Gravy",
    category: "gravies",
    price: 230,
    desc: "Spicy chicken gravy cooked in iron wok with bell peppers, coarse roasted coriander seeds, and dry red chillies.",
  },
  {
    id: "m13",
    name: "Chettinad Mutton Chukka Gravy",
    category: "gravies",
    price: 330,
    desc: "Traditional spicy Chettinad style thick rich gravy with succulent bone-in mutton pieces and roasted coconut paste.",
    isBestseller: true,
  },
  {
    id: "m14",
    name: "Paneer Butter Masala",
    category: "gravies",
    price: 190,
    desc: "Soft cottage cheese cubes simmered in mild cashew-tomato makhani sauce finished with fresh cream.",
    isVeg: true,
  },

  // Breads
  {
    id: "m15",
    name: "Butter Garlic Naan",
    category: "breads",
    price: 65,
    desc: "Fluffy leavened clay-tandoor bread brushed with melted butter, minced roasted garlic, and coriander leaves.",
    isVeg: true,
  },
  {
    id: "m16",
    name: "Kerala Flaky Parotta (2 Pcs)",
    category: "breads",
    price: 60,
    desc: "Multi-layered, crispy and golden pan-toasted parotta served hot with rich chicken salna.",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "m17",
    name: "Chilli Parotta (Street Style)",
    category: "breads",
    price: 150,
    desc: "Shredded layered parotta wok-tossed with diced onions, capsicum, scrambled egg, curry leaves, and spicy salna.",
    isBestseller: true,
  },

  // Desserts & Coolers
  {
    id: "m18",
    name: "Traditional Hot Bread Halwa",
    category: "desserts",
    price: 80,
    desc: "Classic wedding-style bread halwa slow-cooked in pure ghee, caramelized milk, and topped with crunchy roasted cashews.",
    img: breadHalwaImg,
    isBestseller: true,
    isVeg: true,
  },
  {
    id: "m19",
    name: "Elaneer Payasam",
    category: "desserts",
    price: 110,
    desc: "Refreshing South Indian tender coconut pudding made with rich condensed milk, coconut pulp, and cardamom.",
    isVeg: true,
  },
  {
    id: "m20",
    name: "Fresh Mint Lime Mojito",
    category: "desserts",
    price: 90,
    desc: "Chilled sparkling cooler infused with hand-crushed mint leaves, fresh lime juice, and Himalayan rock salt.",
    isVeg: true,
  },
];

function ManamShowcasePage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "starters" | "biriyani" | "gravies" | "breads" | "desserts">("all");
  const [distanceInfo, setDistanceInfo] = useState<string | null>(null);
  const [isDetectingDistance, setIsDetectingDistance] = useState(false);

  const filteredItems = activeCategory === "all" ? MANAM_MENU : MANAM_MENU.filter((i) => i.category === activeCategory);

  const handleDetectDistance = () => {
    setIsDetectingDistance(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Manam Restaurant Velachery: 12.9915° N, 80.2170° E (Opp Phoenix Market City)
          const manamLat = 12.9915;
          const manamLng = 80.217;
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          // Haversine formula
          const R = 6371; // km
          const dLat = ((userLat - manamLat) * Math.PI) / 180;
          const dLng = ((userLng - manamLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((manamLat * Math.PI) / 180) * Math.cos((userLat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = (R * c).toFixed(1);

          setDistanceInfo(`You are approximately ${dist} km away! (~${Math.max(5, Math.round(Number(dist) * 3))} min drive to Phoenix Market City)`);
          setIsDetectingDistance(false);
        },
        () => {
          setDistanceInfo("Location permission not granted. Manam is located directly opposite Phoenix Market City main entrance on Velachery Main Rd (~50 meters walk)!");
          setIsDetectingDistance(false);
        },
        { timeout: 8000 }
      );
    } else {
      setDistanceInfo("Manam Restaurant is located directly opposite Phoenix Market City on Velachery Main Road (~50 meters walk)!");
      setIsDetectingDistance(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Floating Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-2 px-4 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="size-3.5 animate-spin" />
        <span>LATE NIGHT DINING ACTIVE · OPEN TILL 4:00 AM · DINE-IN, TAKEAWAY &amp; MIDNIGHT DELIVERY</span>
      </div>

      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0d131f]/95 backdrop-blur-xl shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white font-black text-lg shadow-amber-500/20 shadow-md">
              <Flame className="size-6" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-wider text-white">
                  MANAM
                </span>
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-400">
                  RESTAURANT
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Velachery · Opp. Phoenix Market City
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/PETPOOJA_VS_RESTOPULSE_BATTLECARD.pdf"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:border-amber-500/50 transition-all shadow-xs"
            >
              <Download className="size-3.5 text-amber-400" />
              <span>Battlecard (PDF)</span>
            </a>

            <a
              href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20food%20or%20reserve%20a%20table"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Tenant Staff POS Gateway Link */}
            <Link
              to="/login"
              search={{ tenant: "manam-restaurant" }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 text-xs font-black text-white transition-all shadow-md active:scale-95"
            >
              <Zap className="size-3.5" />
              <span>Manam Staff POS Login &rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Rich Culinary Backdrop */}
      <section className="relative overflow-hidden border-b border-slate-800 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Manam Restaurant Dining Ambiance"
            className="w-full h-full object-cover opacity-15 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/80 via-[#0b0f17]/95 to-[#0b0f17]" />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="size-3 text-amber-400" /> Velachery Flagship
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                <Star className="size-3.5 fill-emerald-400" /> 4.5 Stars (50+ Google Reviews)
              </span>
              <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-400">
                🌙 Open till 4:00 AM Daily
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-tight">
              AUTHENTIC MULTI-CUISINE &amp; MIDNIGHT DINING
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Opposite Phoenix Market City, Velachery. Serving slow-cooked fragrant Dum Biriyanis, sizzling clay-oven Tandoori grills, spicy Chettinad curries, and street-style Chinese wok noodles.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/login"
                search={{ tenant: "manam-restaurant" }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 px-5 py-3 text-sm font-black text-white transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <Zap className="size-4" />
                <span>Launch Manam POS Terminal &rarr;</span>
              </Link>

              <a
                href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 text-xs sm:text-sm font-bold text-slate-100 transition-all shadow-sm"
              >
                <MapPin className="size-4 text-red-400" />
                <span>Google Maps Directions</span>
                <ExternalLink className="size-3 text-slate-400" />
              </a>

              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20reserve%20a%20family%20table%20or%20order%20takeaway"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-sm"
              >
                <MessageSquare className="size-4" />
                <span>WhatsApp Table Booking</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="block text-base font-black text-amber-400">4:00 AM</span>
                <span className="text-[11px] text-slate-400">Midnight Food Cravings</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="block text-base font-black text-amber-400">Family AC Hall</span>
                <span className="text-[11px] text-slate-400">Spacious Seating &amp; Cabins</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="block text-base font-black text-amber-400">100% Halal</span>
                <span className="text-[11px] text-slate-400">Fresh Meat &amp; Ingredients</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="block text-base font-black text-amber-400">0% Commission</span>
                <span className="text-[11px] text-slate-400">Direct WhatsApp Ordering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Location & Live Distance Detector */}
      <section className="border-b border-slate-800 bg-slate-900/40 py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0 mt-0.5">
              <Compass className="size-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Find Your Distance to Manam Restaurant
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Located at 1st Floor Nagendran Nagar, 53 Velachery Main Rd — Directly opposite Phoenix Market City main entrance.
              </p>
              {distanceInfo && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>{distanceInfo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleDetectDistance}
              disabled={isDetectingDistance}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs"
            >
              <Compass className={`size-3.5 ${isDetectingDistance ? "animate-spin" : ""}`} />
              <span>{isDetectingDistance ? "Calculating..." : "Detect Distance from Me"}</span>
            </button>

            <a
              href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-100 transition-all"
            >
              <ExternalLink className="size-3.5 text-slate-400" />
              <span>View on Maps</span>
            </a>
          </div>
        </div>
      </section>

      {/* Signature Dish Visual Gallery */}
      <section className="py-12 border-b border-slate-800 bg-[#0c111c]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Chef's Handcrafted Specialties
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-display mt-1">
                SIGNATURE DISHES
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Prepared fresh twice daily using authentic Chettinad whole spices, long-grain fragrant rice, and tender meat cuts.
              </p>
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

          {/* Dishes Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                {item.img && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    {item.isBestseller && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500 text-black font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider shadow-md">
                        Bestseller 🔥
                      </span>
                    )}
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-2.5 rounded-full ${item.isVeg ? "bg-emerald-500 ring-2 ring-emerald-500/30" : "bg-red-500 ring-2 ring-red-500/30"}`}
                          title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                        />
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {!item.img && item.isBestseller && (
                        <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xl font-black text-amber-400 font-display">
                      ₹{item.price}
                    </span>

                    <a
                      href={`https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(₹${item.price})`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>WhatsApp Order</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise & Corporate Catering Section */}
      <section className="py-14 border-b border-slate-800 bg-gradient-to-b from-[#0b0f17] to-slate-900/60 px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-400 uppercase tracking-wider">
                <Award className="size-3.5" /> Business Partnership
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                OWN A MANAM FRANCHISE &amp; CORPORATE BULK CATERING
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Partner with Chennai's fastest-growing midnight dining brand. Tap into high footfall Velachery and OMR IT tech parks with proven high-margin culinary recipes and zero-headache RestoPulse POS ERP management.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>High ROI Late-Night Footfall</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Zero Commission POS ERP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Central Kitchen Standardized Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Full Tech Support by Adeahub</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant%20Management,%20I%20am%20interested%20in%20Franchise%20/%20Corporate%20Bulk%20Catering%20partnership"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-6 py-3.5 text-sm font-black text-white transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <MessageSquare className="size-4" />
                <span>Inquire About Franchise</span>
              </a>

              <a
                href="/PETPOOJA_VS_RESTOPULSE_BATTLECARD.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-6 py-3 text-xs font-bold text-slate-200 transition-all"
              >
                <Download className="size-3.5 text-amber-400" />
                <span>Download POS Battlecard (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Real Diner Reviews & Social Proof */}
      <section className="py-12 border-b border-slate-800 bg-[#090d14] px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Diner Love &amp; Accolades
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
              4.5★ FROM OVER 50+ GOOGLE REVIEWS
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The best late-night biriyani spot in Velachery! Walking across from Phoenix Market City after a midnight movie and getting piping hot biriyani and chicken 65 at 2:30 AM was pure bliss."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs font-bold text-slate-400">
                — Vignesh Sundaram, Velachery
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Family AC cabins are very spacious and neat. The mutton dum biriyani meat was melting in mouth. Authentic spices, no excessive food coloring, and prompt service."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs font-bold text-slate-400">
                — Dr. Priya Kalyanakumar, Madipakkam
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "We ordered catering for our office tech team gathering of 40 people. Hot, neatly packed in thermal containers, delivered right on time opposite Phoenix. Highly recommended!"
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs font-bold text-slate-400">
                — Karthik Raja, OMR Tech Park
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Software Attribution */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 text-white font-bold text-xs shadow-xs">
              ⚡
            </span>
            <span className="font-display font-black text-sm tracking-wider uppercase text-white">
              MANAM RESTAURANT · VELACHERY
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            1st Floor, Nagendran Nagar, No 53, Velachery Main Rd, Directly Opp. PHOENIX MARKET CITY, Velachery, Chennai - 600042. Open Daily 12:00 PM – 4:00 AM.
          </p>

          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Live order billing, kitchen KDS, floor tables, and WhatsApp digital receipts for Manam Restaurant are powered by <strong>RestoPulse Cloud ERP</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold text-amber-400">
            <Link to="/login" search={{ tenant: "manam-restaurant" }} className="hover:underline flex items-center gap-1">
              <Zap className="size-3.5" />
              <span>Manam Staff POS Login</span>
            </Link>
            <span className="text-slate-600">·</span>
            <a href="/PETPOOJA_VS_RESTOPULSE_BATTLECARD.pdf" target="_blank" className="hover:underline flex items-center gap-1">
              <Download className="size-3" />
              <span>Battlecard PDF</span>
            </a>
            <span className="text-slate-600">·</span>
            <a href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              <MapPin className="size-3" />
              <span>Google Maps</span>
            </a>
            <span className="text-slate-600">·</span>
            <Link to="/" className="text-slate-400 hover:text-white">
              Spot Light Biriyani
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
