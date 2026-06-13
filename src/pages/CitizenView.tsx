import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getClient } from "@/data/clients";
import { services } from "@/data/services";
import { CONTENT_WORLDS, PERSONA_LABELS } from "@/data/constants";
import { Heart, Sparkles, Bot, Check, Calendar, ChevronLeft, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RECS = [
  {
    id: "s4",
    reason: "כי את אוהבת מוזיקה ישראלית ומפגשים חברתיים",
    score: 94,
    tags: ["מוזיקה ישראלית", "פרסונה חברתית", "מפגש שבועי"],
    nextDate: "יום ג׳, 29.04 בשעה 10:00",
  },
  {
    id: "s3",
    reason: "שיחה אישית שבועית — מתנדבת שנבחרה עבורך",
    score: 89,
    tags: ["אישי", "ללא עלות", "בשעה שנוחה לך"],
    nextDate: "יום ד׳, 30.04 בשעה 11:00",
  },
  {
    id: "s1",
    reason: "קבוצה קטנה וחמה קרוב לבית, גיל דומה לשלך",
    score: 87,
    tags: ["קרוב לבית", "גיל מתאים", "100% מסובסד"],
    nextDate: "יום א׳, 04.05 בשעה 09:30",
  },
];

function WalletRing({ balance, total }: { balance: number; total: number }) {
  const pct = balance / total;
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg width="112" height="112" className="rotate-[-90deg]">
        <circle cx="56" cy="56" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <motion.circle
          cx="56" cy="56" r={r}
          stroke="#1B3A5C" strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-2xl font-bold text-primary tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {balance}
        </motion.div>
        <div className="text-[10px] text-muted-foreground">מתוך {total}</div>
      </div>
    </div>
  );
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } },
};

export default function CitizenView() {
  const sarah = getClient("c1")!;
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  const handleBook = (svcId: string, name: string, date: string) => {
    setBooked(p => ({ ...p, [svcId]: true }));
    toast.success(`${name} — נקבע!`, {
      description: `${date} · תקבלי SMS תזכורת יום לפני 🎉`,
      duration: 5000,
    });
  };

  const walletUsed = sarah.wallet.total - sarah.wallet.balance;
  const persona = PERSONA_LABELS[sarah.lev.persona];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #ede9fe 100%)" }}>
      {/* Sticky Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/60 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <div>
            <span className="font-bold text-primary text-base leading-none block">לב</span>
            <span className="text-[10px] text-muted-foreground">הסל האישי שלי</span>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          לוח הבקרה
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-5 py-7">
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5">

          {/* Greeting */}
          <motion.div variants={stagger.item} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
              {sarah.firstName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">שלום {sarah.firstName} 👋</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{sarah.age} שנים · {sarah.city} · רמת סיעוד {sarah.nursingLevel}</p>
            </div>
          </motion.div>

          {/* Wallet card */}
          <motion.div variants={stagger.item}>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-white/80">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">הסל האישי שלך</div>
              <div className="flex items-center gap-5">
                <WalletRing balance={sarah.wallet.balance} total={sarah.wallet.total} />
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary tabular-nums">{sarah.wallet.balance}</div>
                  <div className="text-sm text-muted-foreground">יחידות זמינות</div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                      <div className="text-xs text-muted-foreground">בשימוש</div>
                      <div className="font-bold text-foreground tabular-nums">{walletUsed}</div>
                    </div>
                    <div className="bg-primary-soft rounded-xl p-2.5 text-center">
                      <div className="text-xs text-muted-foreground">סבסוד</div>
                      <div className="font-bold text-primary">100%</div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {sarah.wallet.balance === sarah.wallet.total && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2.5">
                      <span className="text-xl shrink-0">⚠️</span>
                      <span>עדיין לא ניצלת אף יחידה ברבעון. הנה 3 הצעות שבחרנו עבורך — כולן מסובסדות!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* AI recommendations header */}
          <motion.div variants={stagger.item} className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-bold text-foreground">הסוכן ממליץ עבורך</div>
              <div className="text-xs text-muted-foreground">AI בחר על בסיס הפרופיל האישי שלך</div>
            </div>
          </motion.div>

          {/* Rec cards */}
          {RECS.map((rec, i) => {
            const svc = services.find(s => s.id === rec.id)!;
            const world = CONTENT_WORLDS[svc.world];
            const isBooked = booked[rec.id];
            return (
              <motion.div key={rec.id} variants={stagger.item}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(27,58,92,0.12)" }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "bg-white rounded-2xl overflow-hidden border transition-colors duration-300",
                    isBooked ? "border-success/30" : "border-white/80"
                  )}
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                  <div className="h-1" style={{ background: `linear-gradient(to left, ${["#1B3A5C","#3b82f6","#2d9e6a"][i]}, ${["#3b82f6","#8b5cf6","#3b82f6"][i]})` }} />
                  <div className="p-5">
                    {/* Title row */}
                    <div className="flex items-start gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0", world.colorClass)}>
                        {world.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-foreground text-base leading-tight">{svc.name}</span>
                          <span className="shrink-0 text-xs font-bold bg-primary-soft text-primary px-2 py-0.5 rounded-full tabular-nums">
                            {rec.score}% ✓
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                          <Sparkles className="w-3.5 h-3.5 text-primary inline ml-1 shrink-0" />
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.tags.map((tag, j) => (
                        <span key={j} className="text-xs bg-sky-50 text-sky-700 border border-sky-200/60 px-2.5 py-0.5 rounded-full">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.units} יחידות</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {svc.subsidy}% מסובסד</span>
                      <span>{svc.vendor}</span>
                    </div>

                    {/* Next date + CTA */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 text-xs bg-muted/40 rounded-lg px-3 py-2 text-foreground">
                        📅 {rec.nextDate}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => !isBooked && handleBook(rec.id, svc.name, rec.nextDate)}
                        className={cn(
                          "shrink-0 px-5 h-10 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                          isBooked
                            ? "bg-success text-success-foreground"
                            : "bg-primary text-primary-foreground hover:bg-primary-glow"
                        )}
                      >
                        {isBooked ? <><Check className="w-4 h-4" /> נקבע!</> : <><Calendar className="w-4 h-4" /> קבעי</>}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Personal profile card */}
          <motion.div variants={stagger.item}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">הפרופיל שלך</div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {[
                  { emoji: persona.emoji, label: persona.label.split(" ").slice(0, 2).join(" "), sub: "פרסונה" },
                  { emoji: sarah.lev.lonelinessScore <= 3 ? "❤️‍🩹" : "😊", label: sarah.lev.lonelinessScore + "/10", sub: "קשר חברתי", color: sarah.lev.lonelinessScore <= 3 ? "text-destructive" : "text-success" },
                  { emoji: "⭐", label: sarah.nursingLevel + "", sub: "רמת סיעוד" },
                ].map((item, i) => (
                  <div key={i} className="bg-gradient-to-b from-white to-slate-50 rounded-xl p-3 border border-border/40">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className={cn("text-base font-bold", (item as any).color ?? "text-foreground")}>{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground bg-muted/30 rounded-xl p-2.5 leading-relaxed">
                💭 "{sarah.lev.dream}"
              </div>
              <div className="mt-3 space-y-1.5">
                {sarah.lev.engagementTips.map((tip, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={stagger.item} className="text-center text-xs text-muted-foreground pt-2 pb-8 space-y-1">
            <div>הסל האישי שלך מנוהל על ידי <strong className="text-primary">מערכת לב</strong></div>
            <div>פיילוט ירושלים 2025 · Amazon Bedrock · AWS Lambda</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
