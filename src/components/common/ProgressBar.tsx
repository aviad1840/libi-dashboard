import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  tone = "primary",
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  tone?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };
  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", size === "sm" ? "h-1.5" : "h-2", className)}>
      <div className={cn("h-full transition-all rounded-full", colorMap[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
