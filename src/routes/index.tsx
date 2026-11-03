import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CheckCircle2, ChevronRight, Clock, Flame, Heart, MapPin, MessageCircle, Phone, Sparkles, Star, TrendingUp, Users, Utensils } from "lucide-react";
import { useState } from "react";

import heroImg from "@/assets/hero-biriyani.jpg";
import chickenRealImg from "@/assets/chicken-biriyani-real.jpg";
import muttonRealImg from "@/assets/mutton-biriyani-real.jpg";
import kushkaRealImg from "@/assets/kushka-salna-real.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { ChennaiLeafletMap } from "@/components/map/ChennaiLeafletMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spot Light Biriyani — Authentic Chennai Biriyani Specialists | Tharamani, Adyar, Velachery" },
      {
        name: "description",
        content:
          "Spot Light Biriyani serves traditional seeraga samba mutton & chicken biriyani freshly cooked twice daily in Chennai (Tharamani, Adyar, Velachery). Order online, Swiggy, Zomato & takeaway.",
      },
      {
        name: "keywords",
        content:
          "Spot Light Biriyani, Spotlight Biriyani, Chennai biriyani, Tharamani biriyani, Adyar biriyani, Velachery biriyani, authentic Chennai biriyani, mutton biriyani Chennai, chicken biriyani OMR, seeraga samba biriyani",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "Spot Light Biriyani — Authentic Chennai Biriyani" },
      {
        property: "og:description",
        content: "Authentic Chennai biriyani, tender mutton & chicken cuts, kushka. 4.9★ Google rating across South Chennai kitchens.",
      },
      { property: "og:type", content: "restaurant" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Spot Light Biriyani — Chennai Biriyani Specialists" },
      { name: "twitter:description", content: "Freshly cooked twice daily authentic Chennai biriyani across Tharamani, Adyar & Velachery." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Spot Light Biriyani",
          "image": "https://spotlight-biriyani.vercel.app/assets/hero-biriyani-YI-fIhWX.jpg",
          "servesCuisine": ["South Indian", "Biriyani", "Mughlai"],
          "priceRange": "₹₹ (₹110 - ₹450)",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "MGR Main Road, Near Kazhikundram / OMR",
            "addressLocality": "Tharamani, Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600113",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 12.9863,
            "longitude": 80.2425
          },
          "telephone": "+91 98844 30710",
          "url": "https://spotlight-biriyani.vercel.app",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "11:30",
              "closes": "15:30"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "18:30",
              "closes": "23:00"
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "1250"
          }
        }),
      },
    ],
  }),
  component: Home,
});

const SIGNATURES = [
  {
    img: chickenRealImg,
    name: "Chicken Biriyani",
    price: "₹180",
    portion: "Full (2 Chicken cuts + Boiled Egg)",
    note: "Long-grain seeraga samba spiced rice, slow-cooked with aromatic whole spices and pure ghee.",
    tag: "Bestseller 🔥",
  },
  {
    img: muttonRealImg,
    name: "Mutton Biriyani",
    price: "₹280",
    portion: "Full (Tender Bone-in Cuts)",
    note: "Melt-in-mouth tender goat meat slow-cooked for 3 hours. Served with ennai kathirikai.",
    tag: "Chef Special ⭐",
  },
  {
    img: kushkaRealImg,
    name: "Kushka with Chicken Gravy",
    price: "₹110",
    portion: "Pure Ghee Spiced Rice",
    note: "The authentic Chennai plain biriyani rice infused with pure ghee and rich chicken salna gravy.",
    tag: "Classic 🍛",
  },
];

const BUCKET_COMBOS = [
  {
    title: "Family Biriyani Feast Bucket",
    serves: "Serves 4 - 5 Persons",
    price: "₹899",
    items: ["4-5 Portions Chennai Biriyani", "4 Boiled Eggs", "Chicken 65 (250g)", "Ennai Kathirikai Dalcha", "Thick Onion Raita", "4 Madurai Bread Halwas"],
    popular: true,
  },
  {
    title: "Double Delight Combo",
    serves: "Serves 2 Persons",
    price: "₹449",
    items: ["2 Chicken Biriyanis", "2 Boiled Eggs", "Chicken 65 Starter", "Raita & Gravy", "2 Bread Halwas"],
    popular: false,
  },
  {
    title: "Mutton & Chicken Grand Feast",
    serves: "Serves 3 - 4 Persons",
    price: "₹999",
    items: ["1 Mutton Biriyani", "2 Chicken Biriyanis", "Chicken 65 (250g)", "Double Dalcha & Raita", "Bread Halwa Feast"],
    popular: false,
  },
];

const REVIEWS = [
  {
    name: "Karthik Ramasamy",
    branch: "Tharamani Regular",
    rating: 5,
    text: "Hands down the most authentic biriyani near OMR. The meat is so tender it literally slips off the bone. The ennai kathirikai combination is pure magic!",
  },
  {
    name: "Priyadharshini Murali",
    branch: "Adyar Branch",
    rating: 5,
    text: "Ordered the Family Bucket for our Sunday lunch gathering. Packed in hot insulated containers with piping hot halwa. Everyone loved it!",
  },
  {
    name: "Vignesh Sundaram",
    branch: "Velachery Branch",
    rating: 5,
    text: "Consistent quality every single week. Not greasy, perfectly balanced spices that don't overwhelm your throat. 10/10.",
  },
];

function Home() {
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("Tharamani");

  const openWhatsApp = (branchName: string, prefillMsg?: string) => {
    const phone = "919000000001";
    const text = encodeURIComponent(
      prefillMsg || `Hello Spot Light Biriyani! I want to order freshly made Chennai biriyani from your ${branchName} branch.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <SiteShell>
      {/* Live Kitchen Batch Status Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-2.5 shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-xs text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
            <Flame className="size-3.5 fill-white text-white animate-pulse" />
            <span>KITCHEN STATUS</span>
          </span>
          <span className="font-medium opacity-95">
            Lunch Batch Prepared Fresh from 12:30 PM · Dinner Batch at 7:00 PM · Limited Daily Degs!
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Freshly prepared Chennai-style chicken biriyani"
          width={1600}
          height={1104}
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-smoke)]" />
        
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-card/80 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
            <Star className="size-3.5 fill-primary" /> 4.9 Rating · 2,400+ Happy Biriyani Foodies
          </div>
          
          <h1 className="mt-5 max-w-3xl text-5xl leading-[0.95] sm:text-7xl font-display">
            THE BIRIYANI CHENNAI <span className="text-gradient-ember">KEEPS COMING BACK FOR</span>
          </h1>
          
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Slow-cooked in traditional kitchen degs every single morning. Tender meat, pure ghee, and 
            signature Chennai spices served fresh across three kitchens.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setWaModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-500"
            >
              <MessageCircle className="size-4" /> Order on WhatsApp
            </button>
            <Link
              to="/menu"
              className="rounded-full bg-gradient-ember px-6 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
            >
              Explore Full Menu
            </Link>
            <Link
              to="/branches"
              className="rounded-full border border-border bg-card/80 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              Find a Kitchen
            </Link>
            <Link
              to="/demo"
              className="rounded-full border border-primary/60 bg-primary/10 px-5 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
            >
              ⚡ Request POS Demo
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-primary" /> 12:30 pm – 10:30 pm daily
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Tharamani · Adyar · Velachery
            </span>
            <span className="flex items-center gap-2">
              <Bike className="size-4 text-primary" /> Fast Delivery on Swiggy &amp; Zomato
            </span>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Daily Fresh Batches</p>
            <h2 className="text-3xl sm:text-4xl font-display">WHAT PEOPLE QUEUE FOR</h2>
          </div>
          <Link to="/menu" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all dishes <ChevronRight className="size-4" />
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Cooked in limited, fresh batches. When today's batch is sold out, we close until the evening batch.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SIGNATURES.map((s) => (
            <article key={s.name} className="surface-card group overflow-hidden transition-all hover:border-primary/80 hover:shadow-ember">
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md border border-border">
                  {s.tag}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <span className="font-display text-xl text-primary">{s.price}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-amber-500">{s.portion}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>
                <button
                  onClick={() => openWhatsApp(selectedBranch, `Hi Spot Light Biriyani! I want to order ${s.name} (${s.price}).`)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/60 py-2 text-xs font-bold text-foreground transition-colors hover:border-emerald-500 hover:bg-emerald-600/10 hover:text-emerald-400"
                >
                  <MessageCircle className="size-3.5 text-emerald-500" /> WhatsApp Quick Order
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Family Bucket Combos Showcase */}
      <section className="border-t border-border/60 bg-card/30 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
              <Users className="size-3.5" /> Gathering &amp; Party Feasts
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-display">FAMOUS FAMILY BIRIYANI BUCKETS</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hot insulated containers packed with sides, sweets, and starters. Perfect for family weekends &amp; office lunches.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BUCKET_COMBOS.map((combo) => (
              <div
                key={combo.title}
                className={`surface-card relative flex flex-col justify-between p-6 ${
                  combo.popular ? "border-primary/80 shadow-ember" : ""
                }`}
              >
                {combo.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-ember px-3 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                    MOST POPULAR FOR FAMILIES
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold">{combo.title}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{combo.serves}</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{combo.price}</p>
                  
                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                    {combo.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => openWhatsApp(selectedBranch, `Hi Spot Light Biriyani! I want to order the ${combo.title} (${combo.price}).`)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-ember py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="size-3.5" /> Order Bucket Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Chennai Kitchens Radar Map (Homepage Showcase) */}
      <section className="border-t border-border/60 bg-card/10 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Live Kitchen Radar
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-display">SOUTH CHENNAI KITCHENS MAP</h2>
            </div>
            <Link
              to="/branches"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              Open Full Radar &amp; Directions <ChevronRight className="size-4" />
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Authentic Chennai biriyani steaming across South Chennai. Select your nearest hub to view live kitchen batch status:
          </p>

          <div className="mt-8">
            <ChennaiLeafletMap height="460px" />
          </div>
        </div>
      </section>

      {/* Franchise Opportunity Section */}
      <section className="border-t border-border/60 bg-gradient-to-b from-card/40 to-background py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 relative overflow-hidden shadow-ember">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                🤝 Business Expansion
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-display font-black text-foreground">
                PARTNER WITH SPOT LIGHT BIRIYANI
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Open an authentic Chennai Dum Biriyani outlet in your city. Our turnkey franchise model offers 40%+ operating margins, standardized deg masala kits (zero head chef dependency), and built-in POS &amp; Cloud Radar technology.
              </p>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                  <span className="font-display text-2xl font-black text-primary">40%+</span>
                  <span className="block text-[11px] text-muted-foreground font-semibold mt-0.5">Operating Margin</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                  <span className="font-display text-2xl font-black text-foreground">6-9 Mo</span>
                  <span className="block text-[11px] text-muted-foreground font-semibold mt-0.5">Payback Period</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                  <span className="font-display text-2xl font-black text-emerald-600">0 Chef</span>
                  <span className="block text-[11px] text-muted-foreground font-semibold mt-0.5">Dependency</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="https://api.whatsapp.com/send/?phone=919884430710&text=Hi%20Spot%20Light%20Biriyani%20team,%20I%20am%20interested%20in%20a%20Franchise%20Partnership.%20Please%20share%20the%20franchise%20deck%20and%20investment%20details."
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-gradient-ember px-6 py-3 font-display font-bold text-white shadow-ember hover:opacity-95 transition-all text-sm flex items-center gap-2"
                >
                  🤝 Apply for Franchise Deck
                </a>
                <Link
                  to="/branches"
                  className="rounded-xl border border-border bg-card hover:bg-muted px-5 py-3 font-bold text-xs text-foreground transition-colors"
                >
                  Explore Kitchen Locations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Reviews */}
      <section className="border-t border-border/60 bg-card/20 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                <Star className="size-3.5 fill-primary" /> Verified Reviews
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-display">WHAT CHENNAI FOODIES SAY</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-display text-2xl text-foreground">4.9 / 5.0</span>
              <span>on Google Reviews</span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((rev) => (
              <div key={rev.name} className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-primary">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm italic text-muted-foreground leading-relaxed">
                    &quot;{rev.text}&quot;
                  </p>
                </div>
                <div className="mt-6 border-t border-border/60 pt-3">
                  <p className="text-sm font-bold text-foreground">{rev.name}</p>
                  <p className="text-xs text-muted-foreground">{rev.branch}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Branch Picker Modal */}
      {waModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <MessageCircle className="size-4" />
                </span>
                <h3 className="text-lg font-bold">Order on WhatsApp</h3>
              </div>
              <button
                onClick={() => setWaModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Select your nearest Spot Light Biriyani kitchen to chat and place your order directly:
            </p>

            <div className="mt-4 space-y-2">
              {[
                { name: "Tharamani Kitchen", area: "Kazhikundram / OMR", phone: "+91 98844 30710" },
                { name: "Adyar Kitchen", area: "LB Road / Besant Nagar", phone: "+91 90000 00002" },
                { name: "Velachery Kitchen", area: "100 Feet Road / Bypass", phone: "+91 90000 00003" },
              ].map((b) => (
                <button
                  key={b.name}
                  onClick={() => {
                    setWaModalOpen(false);
                    openWhatsApp(b.name);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-emerald-500 hover:bg-emerald-500/10"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.area}</p>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Chat &rarr;
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-center text-muted-foreground">
              ⚡ Orders are prepared fresh upon confirmation. Delivery available within 6km.
            </p>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
