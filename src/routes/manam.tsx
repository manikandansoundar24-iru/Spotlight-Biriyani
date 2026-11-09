import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  ExternalLink,
  Flame,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Utensils,
  Zap,
  QrCode,
  X,
} from "lucide-react";
import { useState } from "react";

import { ChennaiLeafletMap, MANAM_KITCHENS } from "@/components/map/ChennaiLeafletMap";
import { ManamAssistant } from "@/components/site/ManamAssistant";

export const Route = createFileRoute("/manam")({
  head: () => ({
    meta: [
      { title: "Manam Restaurant — Velachery Main Rd (Opp. Phoenix Market City), Chennai" },
      {
        name: "description",
        content:
          "Manam Restaurant, Velachery: Authentic Multi-Cuisine Family Dining & Late Night Kitchen open till 4:00 AM. Seeraga Samba Biriyani, Tandoori, Chinese & Chettinad specials opposite Phoenix Market City.",
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
  isBestseller?: boolean;
  isVeg?: boolean;
};

const MANAM_MENU: MenuItem[] = [
  // Signature Biriyanis & Rice
  {
    id: "m6",
    name: "Manam Special Chicken Dum Biriyani (Seeraga Samba)",
    category: "biriyani",
    price: 220,
    desc: "Fragrant long-grain spiced seeraga samba rice layered with succulent tender chicken cuts, served with creamy onion raita and ennai kathirikai salna.",
    isBestseller: true,
  },
  {
    id: "m7",
    name: "Velachery Mutton Dum Biriyani",
    category: "biriyani",
    price: 310,
    desc: "Rich slow-cooked goat mutton dum biriyani cooked with whole crushed spices, pure ghee, and caramelized shallots.",
    isBestseller: true,
  },
  {
    id: "m8",
    name: "Fragrant Kushka with Rich Salna",
    category: "biriyani",
    price: 110,
    desc: "Aromatic dum-cooked biriyani rice without meat, served with spicy Chettinad brinjal salna and chilled curd raita.",
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
  const [tableQrModalOpen, setTableQrModalOpen] = useState(false);
  const [selectedTableQr, setSelectedTableQr] = useState("T1");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Floating Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-2 px-4 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="size-3.5 animate-spin" />
        <span>LATE NIGHT DINING ACTIVE · OPEN TILL 4:00 AM · DINE-IN, TAKEAWAY &amp; MIDNIGHT DELIVERY</span>
      </div>

      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 h-16">
          {/* Logo & Location */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white font-black text-base sm:text-lg shadow-xs shrink-0">
              <Flame className="size-5 sm:size-6" />
            </span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-black text-lg sm:text-xl tracking-wider text-slate-900 leading-tight">
                  MANAM
                </span>
                <span className="rounded bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-white shadow-2xs leading-tight">
                  RESTAURANT
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                <MapPin className="size-3 text-orange-600 shrink-0" />
                Velachery · Opp. Phoenix Market City
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (>= xl: 1280px) */}
          <nav className="hidden xl:flex items-center gap-3.5 text-xs font-bold text-slate-700">
            <a href="#menu" className="hover:text-orange-600 transition-colors uppercase tracking-wider">
              Live Menu
            </a>
            <a href="#radar" className="hover:text-orange-600 transition-colors flex items-center gap-1 uppercase tracking-wider">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Velachery Radar
            </a>
            <button
              type="button"
              onClick={() => setTableQrModalOpen(true)}
              className="hover:text-orange-600 transition-colors flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
            >
              <QrCode className="size-3.5 text-orange-600" />
              Scan QR
            </button>
            <a href="#menu" className="hover:text-orange-600 transition-colors uppercase tracking-wider">
              Chef Specials
            </a>
            <a href="#catering" className="hover:text-orange-600 transition-colors uppercase tracking-wider">
              Franchise &amp; Party
            </a>
            <Link
              to="/app/captain"
              search={{ tenant: "manam-restaurant" }}
              className="rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 px-2.5 py-1 font-black hover:bg-amber-500/20 transition-all flex items-center gap-1"
            >
              <Smartphone className="size-3 text-amber-600" />
              Captain POS
            </Link>
            <Link
              to="/login"
              search={{ tenant: "manam-restaurant" }}
              className="rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-700 px-2.5 py-1 font-black hover:bg-orange-500/20 transition-all"
            >
              ⚡ POS Demo
            </Link>
          </nav>

          {/* Actions: WhatsApp + Staff Login + Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20food%20or%20reserve%20a%20table"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Tenant Staff POS Gateway Link */}
            <Link
              to="/login"
              search={{ tenant: "manam-restaurant" }}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-3 py-1.5 text-xs font-black text-white transition-all shadow-xs active:scale-95"
            >
              <Zap className="size-3.5" />
              <span>Staff Login</span>
            </Link>

            {/* Mobile / Tablet Hamburger Toggle (< xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="xl:hidden flex items-center justify-center size-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER (< xl) */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg space-y-2 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Utensils className="size-4 text-orange-500" />
                Live Menu
              </a>
              <a
                href="#radar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Compass className="size-4 text-emerald-500" />
                Velachery Radar
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTableQrModalOpen(true);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left font-bold"
              >
                <QrCode className="size-4 text-orange-500" />
                Scan Table QR
              </button>
              <a
                href="#catering"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Users className="size-4 text-amber-500" />
                Franchise &amp; Party
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/app/captain"
                search={{ tenant: "manam-restaurant" }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs font-black text-amber-800"
              >
                <Smartphone className="size-4 text-amber-600" />
                Launch Tableside Captain POS (Mobile)
              </Link>
              <Link
                to="/login"
                search={{ tenant: "manam-restaurant" }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/30 p-2.5 text-xs font-black text-orange-700"
              >
                <Zap className="size-4 text-orange-600" />
                ⚡ Open Counter Billing POS Demo
              </Link>
              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20food%20or%20reserve%20a%20table"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-2.5 text-xs font-bold text-white shadow-xs"
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp (+91 98400 99887)
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Clean Light Theme */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-amber-50/40 to-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-black text-orange-700 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="size-3 text-orange-600" /> Velachery Flagship
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700">
                <Star className="size-3.5 fill-emerald-600 text-emerald-600" /> 4.5 Stars (50+ Google Reviews)
              </span>
              <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-700">
                🌙 Open till 4:00 AM Daily
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-display leading-tight">
              AUTHENTIC MULTI-CUISINE &amp; MIDNIGHT DINING
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Opposite Phoenix Market City, Velachery. Serving slow-cooked fragrant Seeraga Samba Dum Biriyanis, sizzling clay-oven Tandoori grills, spicy Chettinad curries, and street-style Chinese wok noodles.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/login"
                search={{ tenant: "manam-restaurant" }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 px-5 py-3 text-sm font-black text-white transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Zap className="size-4" />
                <span>Launch Manam POS Terminal &rarr;</span>
              </Link>

              <a
                href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-all shadow-2xs"
              >
                <MapPin className="size-4 text-red-600" />
                <span>Google Maps Directions</span>
                <ExternalLink className="size-3 text-slate-400" />
              </a>

              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20reserve%20a%20family%20table%20or%20order%20takeaway"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-2xs"
              >
                <MessageSquare className="size-4" />
                <span>WhatsApp Table Booking</span>
              </a>
            </div>

            {/* Quick Feature Badges in Clean Light Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="block text-base font-black text-orange-600">4:00 AM</span>
                <span className="text-[11px] font-semibold text-slate-600">Midnight Food Cravings</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="block text-base font-black text-orange-600">Family AC Hall</span>
                <span className="text-[11px] font-semibold text-slate-600">Spacious Seating &amp; Cabins</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="block text-base font-black text-orange-600">100% Halal</span>
                <span className="text-[11px] font-semibold text-slate-600">Fresh Meat &amp; Ingredients</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="block text-base font-black text-orange-600">0% Commission</span>
                <span className="text-[11px] font-semibold text-slate-600">Direct WhatsApp Ordering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Location & Live Distance Detector */}
      <section className="border-b border-slate-200 bg-white py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 shrink-0 mt-0.5">
              <Compass className="size-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Find Your Distance to Manam Restaurant
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Located at 1st Floor Nagendran Nagar, 53 Velachery Main Rd — Directly opposite Phoenix Market City main entrance.
              </p>
              {distanceInfo && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700">
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
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-500/20 transition-all shadow-2xs"
            >
              <Compass className={`size-3.5 ${isDetectingDistance ? "animate-spin" : ""}`} />
              <span>{isDetectingDistance ? "Calculating..." : "Detect Distance from Me"}</span>
            </button>

            <a
              href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 transition-all shadow-2xs"
            >
              <ExternalLink className="size-3.5 text-slate-500" />
              <span>View on Maps</span>
            </a>
          </div>
        </div>
      </section>

      {/* Signature Dish Visual Gallery (ZERO Fake Photos, Pure Clean Culinary Cards) */}
      <section id="menu" className="py-12 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                Chef's Handcrafted Specialties
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display mt-1">
                SIGNATURE DISHES &amp; MENU
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Prepared fresh twice daily using authentic Chettinad whole spices, long-grain fragrant rice, and tender meat cuts.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
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
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Dishes Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-orange-500/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2.5 rounded-full ${item.isVeg ? "bg-emerald-600 ring-2 ring-emerald-500/30" : "bg-red-600 ring-2 ring-red-500/30"}`}
                        title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                      />
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {item.isBestseller && (
                      <span className="shrink-0 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-black text-orange-700 uppercase tracking-wider">
                        Bestseller 🔥
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xl font-black text-orange-600 font-display">
                    ₹{item.price}
                  </span>

                  <a
                    href={`https://wa.me/919840099887?text=Hi%20Manam%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(₹${item.price})`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>WhatsApp Order</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise & Corporate Catering Section (Clean Light Amber Card) */}
      <section id="catering" className="py-14 border-b border-slate-200 bg-white px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-black text-orange-700 uppercase tracking-wider">
                <Award className="size-3.5" /> Business Partnership
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                OWN A MANAM FRANCHISE &amp; CORPORATE BULK CATERING
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Partner with Chennai's fastest-growing midnight dining brand. Tap into high footfall Velachery and OMR IT tech parks with proven high-margin culinary recipes and zero-headache RestoPulse POS ERP management.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>High ROI Late-Night Footfall</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Zero Commission POS ERP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Central Kitchen Standardized Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Full Tech Support by Adeahub</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <a
                href="https://wa.me/919840099887?text=Hi%20Manam%20Restaurant%20Management,%20I%20am%20interested%20in%20Franchise%20/%20Corporate%20Bulk%20Catering%20partnership"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-6 py-3.5 text-sm font-black text-white transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <MessageSquare className="size-4" />
                <span>Inquire About Franchise</span>
              </a>

              <a
                href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-800 transition-all shadow-2xs"
              >
                <MapPin className="size-4 text-orange-600" />
                <span>Visit Restaurant (Google Maps)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Live South Chennai GPS Radar · Velachery Phoenix Hub */}
      <section id="radar" className="border-t border-slate-200 bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" /> Live South Chennai GPS Radar
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-display font-black text-slate-900">
                VELACHERY PHOENIX RESTAURANT HUB
              </h2>
              <p className="mt-1 text-xs text-slate-600 max-w-xl">
                Serving Velachery, Guindy, Madipakkam, OMR IT Corridor &amp; Adyar. Real-time GPS location opposite Phoenix Market City.
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-500/20 transition-all"
            >
              <MapPin className="size-3.5" />
              <span>Open in Google Maps App &rarr;</span>
            </a>
          </div>

          <ChennaiLeafletMap
            kitchens={MANAM_KITCHENS}
            height="480px"
            title="MANAM RESTAURANT · VELACHERY HUB"
            subtitle="Live South Chennai GPS Radar · Opp. Phoenix Market City"
            googleMapsUrl="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA"
            initialCenter={[12.9936, 80.2182]}
            initialZoom={14}
          />
        </div>
      </section>

      {/* Real Diner Reviews & Social Proof */}
      <section className="py-12 border-b border-slate-200 bg-white px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Diner Love &amp; Accolades
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
              4.5★ FROM OVER 50+ GOOGLE REVIEWS
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "The best late-night biriyani spot in Velachery! Walking across from Phoenix Market City after a midnight movie and getting piping hot biriyani and chicken 65 at 2:30 AM was pure bliss."
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-600">
                — Vignesh Sundaram, Velachery
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Family AC cabins are very spacious and neat. The mutton dum biriyani meat was melting in mouth. Authentic spices, no excessive food coloring, and prompt service."
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-600">
                — Dr. Priya Kalyanakumar, Madipakkam
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "We ordered catering for our office tech team gathering of 40 people. Hot, neatly packed in thermal containers, delivered right on time opposite Phoenix. Highly recommended!"
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-600">
                — Karthik Raja, OMR Tech Park
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Software Attribution */}
      <footer className="border-t border-slate-200 bg-slate-100 py-10 px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 text-white font-bold text-xs shadow-xs">
              ⚡
            </span>
            <span className="font-display font-black text-sm tracking-wider uppercase text-slate-900">
              MANAM RESTAURANT · VELACHERY
            </span>
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            1st Floor, Nagendran Nagar, No 53, Velachery Main Rd, Directly Opp. PHOENIX MARKET CITY, Velachery, Chennai - 600042. Open Daily 12:00 PM – 4:00 AM.
          </p>

          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Live order billing, kitchen KDS, floor tables, and WhatsApp digital receipts for Manam Restaurant are powered by <strong>RestoPulse Cloud ERP</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold text-orange-600">
            <Link to="/login" search={{ tenant: "manam-restaurant" }} className="hover:underline flex items-center gap-1">
              <Zap className="size-3.5" />
              <span>Manam Staff POS Login</span>
            </Link>
            <span className="text-slate-400">·</span>
            <a href="https://maps.app.goo.gl/nFAipTWvd2V2BdeZA" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              <MapPin className="size-3" />
              <span>Google Maps Directions</span>
            </a>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Powered by RestoPulse Cloud ERP
            </span>
          </div>
        </div>
      </footer>

      {/* Table QR Scan Modal */}
      {tableQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center space-y-4">
            <button
              type="button"
              onClick={() => setTableQrModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto">
              <QrCode className="size-6" />
            </div>

            <div>
              <h3 className="text-xl font-display font-black text-slate-900">
                DINE-IN DIGITAL TABLE QR
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan with any smartphone camera or UPI app at your table to view menu and order.
              </p>
            </div>

            {/* Table Selector */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setSelectedTableQr(tbl)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedTableQr === tbl
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            {/* Simulated Clean QR Code Preview */}
            <div className="border-2 border-dashed border-orange-300 rounded-2xl p-6 bg-orange-50/30 flex flex-col items-center justify-center space-y-3">
              <div className="size-48 rounded-xl bg-white p-3 shadow-md border border-slate-200 flex flex-col items-center justify-center">
                <QrCode className="size-36 text-slate-900" />
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider mt-1">
                  MANAM · TABLE {selectedTableQr}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 font-mono">
                https://spotlight-biriyani.vercel.app/manam?table={selectedTableQr}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://wa.me/919840099887?text=Hi%20Manam,%20I%20am%20at%20Table%20${selectedTableQr}%20and%20want%20to%20order`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="size-3.5" /> Order for Table {selectedTableQr}
              </a>
              <button
                type="button"
                onClick={() => setTableQrModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive Manam Restaurant Assistant */}
      <ManamAssistant />
    </div>
  );
}