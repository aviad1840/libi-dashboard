import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAiResponse, QUICK_PROMPTS, type AiMessage } from "@/lib/aiEngine";

const WELCOME: AiMessage = {
  id: "welcome",
  role: "assistant",
  content: "שלום שרית! אני עוזר לב, מופעל על Amazon Bedrock.\n\nאני יכולה לענות על שאלות על מטופלים, סיכונים, ניצול ארנקות וסוכני AI.\n\nנסי: \"מה מצב שרה?\" או לחצי על אחת השאלות המהירות למטה.",
  timestamp: new Date(),
};

function MessageBubble({ msg }: { msg: AiMessage }) {
  const isUser = msg.role === "user";
  const lines = msg.content.split("\n");

  const renderLine = (line: string, i: number) => {
    // Bold text **...**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j}>{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("flex", isUser ? "justify-start" : "justify-end")}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ml-2 mt-auto mb-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
          isUser
            ? "bg-muted text-foreground rounded-br-sm"
            : "bg-primary text-primary-foreground rounded-bl-sm"
        )}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {lines.map(renderLine)}
        <div className={cn("text-[10px] mt-1 opacity-60", isUser ? "text-right" : "text-left")}>
          {msg.timestamp.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-end"
    >
      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ml-2 mt-auto mb-0.5">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.16, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput("");

    const userMsg: AiMessage = { id: Date.now().toString(), role: "user", content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate Bedrock latency
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const response = generateAiResponse(query);
      const aiMsg: AiMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date() };
      setTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, delay);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center z-40 transition-opacity",
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        style={{ boxShadow: "0 4px 24px rgba(27,58,92,0.4)" }}
      >
        <Sparkles className="w-5 h-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {unread > 0 && (
          <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping pointer-events-none" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 left-6 w-[380px] h-[520px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden"
            style={{ boxShadow: "0 8px 48px rgba(27,58,92,0.22)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-l from-primary/5 to-card shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground">עוזר לב</div>
                <div className="text-[11px] text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  Amazon Bedrock · פעיל
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              <AnimatePresence>
                {typing && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 py-2 border-t border-border/50 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.label)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-xs text-muted-foreground transition-colors whitespace-nowrap"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="שאלי בעברית חופשית..."
                  className="flex-1 h-9 px-3 rounded-xl border border-border bg-muted/40 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || typing}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity shrink-0"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
