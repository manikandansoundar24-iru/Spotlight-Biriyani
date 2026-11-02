import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Layers, MapPin, Navigation, Phone, Sparkles } from "lucide-react";
import { getDB, getLiveBatchStatus, useDB } from "@/lib/pos-store";

export interface BranchPin {
  id: string;
  name: string;
  landmark: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  status: string;
  highlight: string;
  platesLeft: number;
}

export const CHENNAI_KITCHENS: BranchPin[] = [
  {
    id: "taramani",
    name: "Tharamani Flagship Kitchen",
    landmark: "Near Kazhikundram / Tidel Park OMR",
    area: "OMR IT Corridor, South Chennai",
    lat: 12.9863,
    lng: 80.2432,
    phone: "+91 98844 30710",
    status: "Lunch Batch Open · 14 Plates Left",
    highlight: "Primary Flagship Kitchen",
    platesLeft: 14,
  },
  {
    id: "adyar",
    name: "Adyar Beach Kitchen",
    landmark: "LB Road / Near Besant Nagar Beach",
    area: "Lattice Bridge Rd, Adyar, Chennai",
    lat: 13.0012,
    lng: 80.2565,
    phone: "+91 90000 00002",
    status: "Dinner Batch Ready at 7:00 PM",
    highlight: "Family Dine-in & Beach Parcels",
    platesLeft: 28,
  },
  {
    id: "velachery",
    name: "Velachery Delivery Hub",
    landmark: "100 Feet Road / Bypass Junction",
    area: "Velachery Bypass, Chennai",
    lat: 12.9759,
    lng: 80.2212,
    phone: "+91 90000 00003",
    status: "Lunch Batch Open · Fast Delivery",
    highlight: "High-Speed Delivery Hub",
    platesLeft: 19,
  },
];

interface ChennaiLeafletMapProps {
  activeId?: string;
  onSelectBranch?: (id: string) => void;
  height?: string;
  showDetailsCard?: boolean;
}

export function ChennaiLeafletMap({
  activeId = "taramani",
  onSelectBranch,
  height = "460px",
  showDetailsCard = true,
}: ChennaiLeafletMapProps) {
  const liveDb = useDB();
  const db = liveDb ?? getDB();

  const dynamicKitchens = useMemo(() => {
    return CHENNAI_KITCHENS.map((k) => {
      const live = getLiveBatchStatus(db, k.id);
      const branchFromDb = db?.branches?.find((b) => {
        const bId = b.id.toLowerCase().replace(/h/g, "");
        const kId = k.id.toLowerCase().replace(/h/g, "");
        const bName = b.name.toLowerCase().replace(/h/g, "");
        const kName = k.name.toLowerCase().replace(/h/g, "");
        return bId === kId || bName.includes(kId) || kName.includes(bName);
      });
      return {
        ...k,
        name: branchFromDb ? `${branchFromDb.name} Flagship Kitchen` : k.name,
        landmark: branchFromDb?.address || k.landmark,
        phone: branchFromDb?.phone || k.phone,
        status: live.status,
        platesLeft: live.platesLeft,
      };
    });
  }, [db]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const circlesRef = useRef<{ [key: string]: any }>({});
  const [selectedId, setSelectedId] = useState(activeId);
  const [mapType, setMapType] = useState<"dark" | "streets" | "satellite">("dark");
  const [mapReady, setMapReady] = useState(false);

  const selected = dynamicKitchens.find((k) => k.id === selectedId) || dynamicKitchens[0];

  useEffect(() => {
    if (activeId && activeId !== selectedId) {
      setSelectedId(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    let isMounted = true;

    // Load Leaflet dynamically if not loaded
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      if (!(window as any).L) {
        // Load CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Load JS
        await new Promise<void>((resolve, reject) => {
          if (document.getElementById("leaflet-js")) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered between Tharamani, Adyar, and Velachery
      const map = L.map(mapContainerRef.current, {
        center: [12.9878, 80.2403],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add Clean Watermark-Free Tile Layer
      let tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tileOptions: any = {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      };

      if (mapType === "satellite") {
        tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        tileOptions.maxZoom = 18;
      } else if (mapType === "dark") {
        tileOptions.className = "dark-radar-tiles";
      }

      L.tileLayer(tileUrl, tileOptions).addTo(map);

      // Add Markers and 5km Delivery Radius Circles
      CHENNAI_KITCHENS.forEach((k) => {
        // Delivery radius circle
        const circle = L.circle([k.lat, k.lng], {
          color: k.id === selectedId ? "#ea580c" : "#10b981",
          fillColor: k.id === selectedId ? "#ea580c" : "#10b981",
          fillOpacity: 0.12,
          weight: 1.5,
          radius: 4500, // 4.5km delivery radius
          dashArray: "4, 6",
        }).addTo(map);
        circlesRef.current[k.id] = circle;

        // Custom pulsing HTML marker
        const isSelected = k.id === selectedId;
        const customIcon = L.divIcon({
          className: "custom-kitchen-marker",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translate(-50%, -50%);">
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${
                isSelected ? "#ea580c" : "#10b981"
              }; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: ${
                isSelected ? "linear-gradient(135deg, #ea580c, #c2410c)" : "#1e293b"
              }; color: #ffffff; font-weight: 700; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 1.5px solid ${
                isSelected ? "#f97316" : "#475569"
              }; white-space: nowrap;">
                <span>🔥</span>
                <span>${k.name.replace(" Kitchen", "").replace(" Delivery Hub", "")}</span>
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const marker = L.marker([k.lat, k.lng], { icon: customIcon }).addTo(map);
        marker.on("click", () => {
          setSelectedId(k.id);
          if (onSelectBranch) onSelectBranch(k.id);
          map.flyTo([k.lat, k.lng], 14, { duration: 1.2 });
        });
        markersRef.current[k.id] = marker;
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapType]);

  // Handle selected branch change
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectBranch) onSelectBranch(id);

    const k = CHENNAI_KITCHENS.find((b) => b.id === id);
    if (k && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([k.lat, k.lng], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="surface-card overflow-hidden p-4 sm:p-6 shadow-xl border border-border">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Live South Chennai GPS Radar
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display">AUTHENTIC CHENNAI METRO HUBS</h3>
        </div>

        {/* Layer Selector & Controls */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setMapType("dark")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              mapType === "dark" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dark Radar
          </button>
          <button
            onClick={() => setMapType("streets")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              mapType === "streets" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              mapType === "satellite" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Branch Selector Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {dynamicKitchens.map((k) => (
          <button
            key={k.id}
            onClick={() => handleSelect(k.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              selectedId === k.id
                ? "bg-gradient-ember text-white border-primary shadow-ember"
                : "bg-muted/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
            }`}
          >
            <Flame className="size-3.5" />
            <span>{k.name}</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.2 text-[10px]">
              {k.platesLeft} Plates Left
            </span>
          </button>
        ))}

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([12.9878, 80.2403], 12.5, { duration: 1.2 });
            }
          }}
          className="ml-auto text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <span>Show All 3 Kitchens</span>
        </button>
      </div>

      {/* Main Grid: Real Leaflet Map + Branch Details */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr] items-stretch">
        {/* Real Leaflet Map Container */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-inner bg-card">
          <div ref={mapContainerRef} style={{ width: "100%", height }} className="z-10" />

          {/* Real Map Overlays: Coast & Water Body Indicators */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 border border-border/80 text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-sky-400" />
            <span>Bay of Bengal Coastline · OMR Corridor</span>
          </div>

          <div className="absolute bottom-3 left-3 z-20 pointer-events-none rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 border border-border/80 text-[10px] text-emerald-400 font-mono">
            <span>🟢 Dotted Rings: 5km Fast Delivery Radius</span>
          </div>
        </div>

        {/* Selected Branch Real-Time Card */}
        {showDetailsCard && selected && (
          <div className="surface-card p-5 border-primary/40 flex flex-col justify-between bg-card">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {selected.highlight}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Counter
                </span>
              </div>

              <h4 className="mt-2 text-2xl font-display">{selected.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.area}</p>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Location Landmark</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> {selected.landmark}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Kitchen Batch Status</span>
                  <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <Flame className="size-3.5 text-primary" /> {selected.status}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Direct Kitchen Hotline</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-primary" /> {selected.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `Spot Light Biriyani ${selected.name} ${selected.landmark}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-ember py-2.5 text-xs font-bold text-primary-foreground shadow-ember hover:scale-[1.02] transition-transform"
              >
                <Navigation className="size-3.5" /> Navigate on Google Maps
              </a>
              <p className="text-center text-[10px] text-muted-foreground">
                📍 Real GPS Pin: {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
