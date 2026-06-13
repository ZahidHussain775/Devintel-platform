type SkillRow = {
  label: string;
  values: number[]; // intensity levels 0-4, mirrors GitHub's contribution graph scale
};

const HEAT_COLORS = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
];

export function SkillHeatmap({
  rows,
  animate = true,
}: {
  rows: SkillRow[];
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, rowIndex) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-(--color-text-muted) sm:w-32">
            {row.label}
          </span>
          <div className="flex gap-1">
            {row.values.map((value, cellIndex) => (
              <span
                key={cellIndex}
                className={animate ? "heatmap-cell rounded-[3px]" : "rounded-[3px]"}
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: HEAT_COLORS[value] ?? HEAT_COLORS[0],
                  border:
                    value === 0 ? "1px solid var(--color-border)" : undefined,
                  animationDelay: animate
                    ? `${(rowIndex * row.values.length + cellIndex) * 25}ms`
                    : undefined,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export type { SkillRow };
