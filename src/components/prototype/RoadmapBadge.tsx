import { Construction } from "lucide-react";

interface RoadmapBadgeProps {
  milestone: string;
  description?: string;
}

export function RoadmapBadge({ milestone, description }: RoadmapBadgeProps) {
  return (
    <div className="inline-flex items-start gap-2 bg-warning-soft border border-warning/30 text-warning-foreground rounded-lg px-3 py-2 text-xs">
      <Construction className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <div className="font-semibold">בפיתוח לפי roadmap — {milestone}</div>
        {description && <div className="text-warning-foreground/80 mt-0.5 leading-relaxed">{description}</div>}
      </div>
    </div>
  );
}
