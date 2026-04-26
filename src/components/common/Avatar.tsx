import { cn } from "@/lib/utils";

export function Avatar({ name, size = 36, tone = "default" }: { name: string; size?: number; tone?: "default" | "primary" | "warm" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "warm"
      ? "bg-warning-soft text-warning-foreground"
      : "bg-accent text-accent-foreground";
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", cls)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
