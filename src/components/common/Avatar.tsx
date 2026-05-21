import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: number;
  tone?: "default" | "primary" | "warm";
}

export function Avatar({ name, size = 36, tone = "default" }: AvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("") || "?";

  const toneClass =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "warm"
        ? "bg-warning-soft text-warning-foreground"
        : "bg-accent text-accent-foreground";

  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-semibold shrink-0 select-none", toneClass)}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      role="img"
      aria-label={name}
    >
      <span aria-hidden="true">{initials}</span>
    </div>
  );
}
