import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function UploadCard({
  icon: Icon,
  step,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-accent-dim) sm:flex-row sm:items-start sm:gap-4">
      <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2">
        <span className="font-mono text-xs text-(--color-text-faint)">
          {step}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-(--color-surface-2) text-(--color-accent)">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-display text-sm font-semibold text-(--color-text)">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-(--color-text-muted)">
          {description}
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
