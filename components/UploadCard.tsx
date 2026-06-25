import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function UploadCard({
  icon: Icon,
  step,
  title,
  description,
  children,
  delay = "0",
}: {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
  children: ReactNode;
  delay?: string;
}) {
  return (
    <div
      className="slide-in glass glass-hover group relative flex flex-col gap-3 overflow-hidden rounded-xl p-4 sm:flex-row sm:items-start sm:gap-4"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Large faded step number in background */}
      <span
        className="pointer-events-none absolute right-3 top-1 font-mono text-6xl font-bold select-none"
        style={{ color: "var(--color-border)", opacity: 0.5, lineHeight: 1 }}
      >
        {step}
      </span>

      {/* Left: icon */}
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, rgba(57,211,83,0.15), rgba(88,166,255,0.1))",
            border: "1px solid rgba(57,211,83,0.2)",
            color: "var(--color-accent)",
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>

      {/* Right: content */}
      <div className="relative flex-1">
        <h3 className="font-display text-sm font-semibold text-(--color-text)">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-(--color-text-muted)">{description}</p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}