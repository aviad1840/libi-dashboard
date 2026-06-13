import { ReactNode } from "react";
import { motion } from "framer-motion";
import AppSidebar from "./AppSidebar";
import AiChatPanel from "./AiChatPanel";

export default function AppLayout({ children, title, subtitle, actions }: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <AppSidebar />
      <main className="mr-64 min-h-screen">
        {title && (
          <header className="px-8 pt-7 pb-5 flex items-end justify-between gap-4 border-b border-border bg-background sticky top-0 z-20">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {actions}
          </header>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
      <AiChatPanel />
    </div>
  );
}
