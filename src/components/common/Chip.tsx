import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    destructive: "bg-destructive-soft text-destructive",
    info: "bg-info-soft text-info",
  };
  return <span className={cn("libi-chip", tones[tone], className)}>{children}</span>;
}
