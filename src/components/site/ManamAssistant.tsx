import { Bot, ChevronRight, Flame, MessageSquare, Send, Sparkles, Utensils, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  actionUrl?: string | undefined;
  actionLabel?: string | undefined;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "mnm-1",
    sender: "bot",
    text: "Vanakkam! 🙏 I am your Manam Restaurant Assistant. Ask me about our authentic Seeraga Samba Biriyani, late-night dining open till 4:00 AM, shawarma rolls, or getting directions to our diner opposite Phoenix Market City!",
  },
];

const PRESETS = [
  {
    label: "🍛 Authentic Menu & Prices",
    answer:
      "Our Bestsellers:\n• Seeraga Samba Biriyani: Plain ₹120 | Chicken ₹200 | Mutton ₹280 | Egg ₹140 | Kadai ₹200\n• Non-Veg Meals (3 gravies + rice): ₹180\n• Shawarma Rolls & Platters: ₹59 to ₹199\n• Charcoal Grill Chicken: Half ₹200 | Full ₹350\n• Parottas: Nool, Veechu, Ceylon & Kothu Parotta (₹32 - ₹250)\n• Starters: Naatukozhi Chukka (₹200), Vanchiram Fish Fry (₹180), Prawn 65 (₹190)\n• Ice Creams: Tender Coconut, Sitaphal (₹60)",
  },
  {
    label: "🌙 Late-Night Dining (Open till 4 AM)",
    answer:
      "Yes! Manam Restaurant is fully open every night until 4:00 AM.\n• Fresh steaming Seeraga Samba biriyani, juicy shawarma, and hot tawa parottas served all night.\n• Perfect for OMR techies, night shifters, and moviegoers opposite Phoenix Market City!",
  },
  {
    label: "📍 Velachery Location & Directions",
    answer:
      "We are located directly opposite Phoenix Market City on Velachery Main Road, Chennai 600042.\n• 1st Floor, Nagendran Nagar (Opp. Phoenix)\n• Ample two-wheeler & car parking available.",
    actionUrl: "https://maps.app.goo.gl/nFAipTWvd2V2BdeZA",
    actionLabel: "Open Google Maps",
  },
  {
    label: "📲 Table Booking & WhatsApp Order",
    answer:
      "Skip the wait! Book a table for your family or pre-order takeaway parcels directly with our Velachery kitchen counter on WhatsApp.",
    actionUrl:
      "https://api.whatsapp.com/send/?phone=919840099887&text=Hi%20Manam%20Restaurant%2C%20I%20would%20like%20to%20reserve%20a%20table%20or%20pre-order%20takeaway.",
    actionLabel: "Reserve on WhatsApp",
  },
  {
    label: "⚡ RestroStack POS Login",
    answer:
      "Authorized Manam Restaurant staff, cashier, or chef? Access the dedicated touch POS and Kitchen Display System (KDS) here.",
    actionUrl: "/login?tenant=manam-restaurant",
    actionLabel: "Open Staff POS Terminal",
  },
];

export function ManamAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom(false);
      const timer = setTimeout(() => scrollToBottom(true), 60);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [messages, open]);

  const handlePreset = (p: (typeof PRESETS)[0]) => {
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: p.label };
    const botMsg: Message = {
      id: `b-${Date.now() + 1}`,
      sender: "bot",
      text: p.answer,
      actionUrl: p.actionUrl,
      actionLabel: p.actionLabel,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text };
    let reply =
      "Thank you for contacting Manam Restaurant! For table reservations, bulk takeaway, or special orders, you can reach our Velachery counter directly on WhatsApp (+91 98400 99887).";
    let actionUrl: string | undefined =
      "https://api.whatsapp.com/send/?phone=919840099887&text=" +
      encodeURIComponent(`Hi Manam Restaurant, customer query from website: ${text}`);
    let actionLabel: string | undefined = "Chat on WhatsApp";

    const lower = text.toLowerCase();
    if (lower.includes("price") || lower.includes("rate") || lower.includes("menu") || lower.includes("biriyani") || lower.includes("cost")) {
      reply =
        "Our signature Seeraga Samba Chicken Biriyani is ₹200, Mutton Biriyani is ₹280, Plain Biriyani is ₹120, Grill Chicken Full is ₹350, and Shawarma Roll starts at ₹59!";
      actionUrl = undefined;
      actionLabel = undefined;
    } else if (lower.includes("time") || lower.includes("open") || lower.includes("close") || lower.includes("night") || lower.includes("late")) {
      reply =
        "We are open daily for lunch from 12:00 PM and throughout the night till 4:00 AM! Perfect for late-night cravings opposite Phoenix Market City.";
    } else if (lower.includes("where") || lower.includes("location") || lower.includes("address") || lower.includes("phoenix") || lower.includes("velachery")) {
      reply =
        "Manam Restaurant is located on the 1st Floor, Nagendran Nagar, directly opposite Phoenix Market City, Velachery Main Road, Chennai 600042.";
      actionUrl = "https://maps.app.goo.gl/nFAipTWvd2V2BdeZA";
      actionLabel = "Open Google Maps";
    }

    const botMsg: Message = {
      id: `b-${Date.now() + 1}`,
      sender: "bot",
      text: reply,
      actionUrl,
      actionLabel,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 px-4 py-3 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
          title="Open Manam Restaurant Assistant"
        >
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
          </span>
          <Utensils className="size-4" />
          <span className="text-xs font-bold tracking-wide">Manam Assistant</span>
        </button>
      </div>

      {/* Slide-over Chatbot Dialog */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] max-w-sm rounded-3xl border border-primary/30 bg-card p-4 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 flex flex-col h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white font-black text-sm shadow-sm">
                🍽️
              </span>
              <div>
                <h4 className="font-display font-black text-sm tracking-wide leading-tight">MANAM RESTAURANT</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Velachery Phoenix Hub · Open till 4 AM</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
              title="Close Assistant"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Quick FAQ Preset Buttons */}
          <div className="flex gap-1.5 overflow-x-auto py-2.5 border-b border-border/40 scrollbar-none">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(p)}
                className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium shadow-xs"
                      : "bg-muted/60 text-foreground border border-border/70 shadow-2xs"
                  }`}
                >
                  {m.text}
                </div>

                {m.actionUrl && (
                  <a
                    href={m.actionUrl}
                    target={m.actionUrl.startsWith("http") ? "_blank" : "_self"}
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline bg-primary/10 border border-primary/25 rounded-full px-3 py-1"
                  >
                    <span>{m.actionLabel || "View Link"}</span>
                    <ChevronRight className="size-3" />
                  </a>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="pt-2 border-t border-border/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dishes, timings, location..."
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
              title="Send Message"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

