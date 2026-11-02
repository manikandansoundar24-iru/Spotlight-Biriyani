import { Bot, ChevronRight, Flame, MessageSquare, Send, Sparkles, X } from "lucide-react";
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
    id: "m-1",
    sender: "bot",
    text: "Vanakkam! 🙏 I am your Spot Light Biriyani Assistant. Ask me about our authentic Chennai biriyani, party buckets, kitchen timings, or booking a live POS software demo!",
  },
];

const PRESETS = [
  {
    label: "🍛 Menu & Pricing",
    answer: "Our specialties:\n• Chicken Biriyani (Full): ₹180 | Half: ₹110\n• Mutton Biriyani (Full): ₹280 | Half: ₹170\n• Chicken 65 Biriyani: ₹210\n• Egg Biriyani: ₹120\n• Kushka: ₹110\n• Starters: Chicken 65 (₹140), Pepper Chicken (₹160)\nAll biriyanis include Brinjal Dalcha & Onion Raita!",
  },
  {
    label: "⏰ Fresh Batch Timings",
    answer: "We prepare two fresh batches daily:\n☀️ Lunch Batch: 12:30 PM to 3:30 PM\n🌙 Dinner Batch: 7:00 PM to 10:30 PM\nPrepared fresh twice a day. No reheats, ever!",
  },
  {
    label: "📍 Kitchen Locations",
    answer: "Three kitchens across South Chennai:\n1. Tharamani Flagship: Kazhikundram, OMR\n2. Adyar: LB Road\n3. Velachery: 100 Feet Bypass Road\nCheck our Chennai Radar Map for live status!",
    actionUrl: "/branches",
    actionLabel: "View Radar Map",
  },
  {
    label: "📦 Family Party Buckets",
    answer: "Planning an event? We offer jumbo party buckets (1KG, 3KG, 5KG) with complimentary boiled eggs, Chicken 65, dalcha, raita, and Madurai bread halwa!\nCall +91 98844 30710 for advance party booking.",
  },
  {
    label: "💼 POS Software Demo",
    answer: "Interested in the Spot Light Restaurant Management & POS software for your restaurant or cloud kitchen? We offer live counter billing, live food costing, stock inventory, and WhatsApp receipt dispatching.",
    actionUrl: "https://api.whatsapp.com/send/?phone=919884430710&text=Hi%20Mani%2C%20I%20want%20to%20book%20a%20live%20demo%20of%20the%20Spot%20Light%20POS%20Software.",
    actionLabel: "Book Demo on WhatsApp",
  },
];

export function SpotlightAssistant() {
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

  const handlePreset = (p: typeof PRESETS[0]) => {
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
    let reply = "Thank you for asking! For special orders, catering, or software questions, you can reach our team directly on WhatsApp (+91 98844 30710).";
    let actionUrl: string | undefined = "https://api.whatsapp.com/send/?phone=919884430710&text=" + encodeURIComponent(`Hi, query from website: ${text}`);
    let actionLabel: string | undefined = "Chat on WhatsApp";

    const lower = text.toLowerCase();
    if (lower.includes("price") || lower.includes("rate") || lower.includes("menu") || lower.includes("cost")) {
      reply = PRESETS[0]?.answer ?? "";
      actionUrl = undefined;
      actionLabel = undefined;
    } else if (lower.includes("time") || lower.includes("timing") || lower.includes("open") || lower.includes("close")) {
      reply = PRESETS[1]?.answer ?? "";
      actionUrl = undefined;
      actionLabel = undefined;
    } else if (lower.includes("location") || lower.includes("branch") || lower.includes("where") || lower.includes("address")) {
      reply = PRESETS[2]?.answer ?? "";
      actionUrl = "/branches";
      actionLabel = "View Chennai Radar Map";
    } else if (lower.includes("bucket") || lower.includes("party") || lower.includes("catering") || lower.includes("bulk")) {
      reply = PRESETS[3]?.answer ?? "";
      actionUrl = "https://api.whatsapp.com/send/?phone=919884430710&text=Hi%2C%20I%20want%20to%20order%20a%20family%20party%20bucket%20for%20my%20event.";
      actionLabel = "Order Bucket via WhatsApp";
    } else if (lower.includes("demo") || lower.includes("software") || lower.includes("pos") || lower.includes("system")) {
      reply = PRESETS[4]?.answer ?? "";
      actionUrl = "https://api.whatsapp.com/send/?phone=919884430710&text=Hi%20Mani%2C%20I%20want%20a%20live%20POS%20demo.";
      actionLabel = "Book Demo on WhatsApp";
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
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-ember px-4 py-3 text-white shadow-xl hover:scale-105 active:scale-95 transition-all shadow-primary/25 border border-white/20"
          title="Open Spot Light Assistant"
        >
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
          </span>
          <Bot className="size-5" />
          <span className="text-xs font-bold tracking-wide">Spot Light Assistant</span>
        </button>
      )}

      {/* Floating Chat Box */}
      {open && (
        <div className="w-[90vw] max-w-sm sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-ember p-3.5 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                <Flame className="size-4 text-white" />
              </span>
              <div>
                <h4 className="font-display font-black text-sm tracking-wide leading-tight">SPOT LIGHT ASSISTANT</h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online · Live AI &amp; FAQ Helper</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/20 transition-colors text-white/90"
              title="Close Assistant"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2 border-b border-border bg-muted/40 overflow-x-auto flex gap-1.5 no-scrollbar">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(p)}
                className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-primary hover:text-primary transition-colors shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-muted/20 sleek-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>

                {m.actionUrl && (
                  <a
                    href={m.actionUrl}
                    target={m.actionUrl.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 rounded-xl bg-primary/10 border border-primary/30 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>{m.actionLabel || "Open Link"}</span>
                    <ChevronRight className="size-3" />
                  </a>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Direct WhatsApp Action Banner */}
          <div className="px-3 py-1.5 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Need immediate human help?</span>
            <a
              href="https://api.whatsapp.com/send/?phone=919884430710&text=Hi%20Spot%20Light%20Biriyani%20team%2C%20I%20need%20assistance."
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MessageSquare className="size-3" /> Chat on WhatsApp
            </a>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-border bg-card flex gap-1.5">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-gradient-ember p-2 text-white shadow-ember disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
