import type { AnalysisResult, ProficiencyLevel } from "@/lib/types";
import { SkillHeatmap, type SkillRow } from "@/components/SkillHeatmap";
import {
  Gauge,
  FileText,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Cpu,
  Target,
  TrendingUp,
} from "lucide-react";

// ─── Colour helpers ───────────────────────────────────────────────────────────

function scoreColor(value: number): string {
  if (value >= 70) return "var(--color-accent)";
  if (value >= 40) return "var(--color-amber)";
  return "#f87171";
}

const LEVEL_COLOR: Record<ProficiencyLevel, string> = {
  beginner:     "var(--color-amber)",
  intermediate: "var(--color-blue)",
  advanced:     "var(--color-accent)",
  expert:       "var(--color-accent)",
};

const LEVEL_HEAT: Record<ProficiencyLevel, number> = {
  beginner:     1,
  intermediate: 2,
  advanced:     3,
  expert:       4,
};

const IMPORTANCE_COLOR: Record<string, string> = {
  high:   "#f87171",
  medium: "var(--color-amber)",
  low:    "var(--color-text-muted)",
};

// ─── Convert AI data → SkillRow[] for the heatmap ────────────────────────────
// Each language proficiency entry becomes one row.
// We fill 12 cells: heat level repeated across the row with slight variance
// so it looks like a real activity graph, not a flat bar.

function buildHeatmapRows(result: AnalysisResult): SkillRow[] {
  const rows: SkillRow[] = [];

  // Language proficiency rows
  for (const lp of result.languageProficiency.slice(0, 6)) {
    const base = LEVEL_HEAT[lp.level] ?? 1;
    // Add small variation so cells aren't identical
    const values = Array.from({ length: 12 }, (_, i) => {
      const noise = [0, 1, 0, -1, 0, 1, -1, 0, 1, 0, -1, 0][i];
      return Math.min(4, Math.max(0, base + (i % 3 === 0 ? noise : 0)));
    });
    rows.push({ label: lp.language, values });
  }

  // Skill gap rows — gaps are low heat (things the dev is missing)
  for (const gap of (result.skillGaps ?? []).slice(0, 3)) {
    const base = gap.importance === "high" ? 0 : gap.importance === "medium" ? 1 : 1;
    const values = Array.from({ length: 12 }, (_, i) =>
      i % 4 === 0 ? Math.min(base + 1, 2) : base
    );
    rows.push({ label: gap.skill, values });
  }

  return rows;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: number;
}) {
  const color = scoreColor(value);
  return (
    <div className="rounded-md border border-(--color-border) bg-(--color-canvas) p-3">
      <Icon size={13} style={{ color }} />
      <div className="mt-2 font-mono text-xl font-semibold" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-(--color-text-muted)">
        {label}
      </div>
      {/* mini progress bar */}
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%`, backgroundColor: scoreColor(value) }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  const heatmapRows = buildHeatmapRows(result);

  // Derive employability + industry readiness from existing scores
  // Employability = weighted avg of overall + consistency
  // Industry Ready = weighted avg of overall + documentation
  const employabilityScore = Math.round((result.overallScore * 0.6) + (result.consistencyScore * 0.4));
  const industryReadyScore = Math.round((result.overallScore * 0.6) + (result.documentationScore * 0.4));

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-(--color-text-faint)">
          AI ANALYSIS
        </span>
        <span className="rounded-full bg-(--color-accent)/10 px-2 py-0.5 font-mono text-[10px] text-(--color-accent)">
          GROQ · LLAMA 3.3
        </span>
      </div>

      {/* ── Score cards — 5 total ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        <ScoreCard icon={Gauge}      label="Overall"        value={result.overallScore} />
        <ScoreCard icon={Target}     label="Employability"  value={employabilityScore} />
        <ScoreCard icon={TrendingUp} label="Industry Ready" value={industryReadyScore} />
        <ScoreCard icon={FileText}   label="Docs"           value={result.documentationScore} />
        <ScoreCard icon={RefreshCw}  label="Consistency"    value={result.consistencyScore} />
      </div>

      {/* ── Summary ──────────────────────────────────────────────────── */}
      <p className="text-sm leading-relaxed text-(--color-text-muted)">
        {result.summary}
      </p>

      {/* ── Skill heatmap ────────────────────────────────────────────── */}
      {heatmapRows.length > 0 && (
        <div>
          <span className="font-mono text-xs text-(--color-text-faint)">
            SKILL HEATMAP
          </span>
          <div className="mt-3">
            <SkillHeatmap rows={heatmapRows} animate />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-(--color-text-faint)">none</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <span
                key={v}
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{
                  backgroundColor: [
                    "var(--heat-0)",
                    "var(--heat-1)",
                    "var(--heat-2)",
                    "var(--heat-3)",
                    "var(--heat-4)",
                  ][v],
                  border: v === 0 ? "1px solid var(--color-border)" : undefined,
                }}
              />
            ))}
            <span className="text-[10px] text-(--color-text-faint)">expert</span>
          </div>
        </div>
      )}

      {/* ── Language proficiency ─────────────────────────────────────── */}
      {result.languageProficiency.length > 0 && (
        <div>
          <span className="font-mono text-xs text-(--color-text-faint)">
            LANGUAGE PROFICIENCY
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {result.languageProficiency.map((lp) => (
              <div
                key={lp.language}
                className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-(--color-text)">
                    {lp.language}
                  </span>
                  <span
                    className="font-mono text-xs capitalize"
                    style={{ color: LEVEL_COLOR[lp.level] ?? "var(--color-text-muted)" }}
                  >
                    {lp.level}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
                  {lp.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Project quality ──────────────────────────────────────────── */}
      {result.projectQuality.length > 0 && (
        <div>
          <span className="font-mono text-xs text-(--color-text-faint)">
            PROJECT QUALITY
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {result.projectQuality.map((pq) => (
              <div
                key={pq.repoName}
                className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-(--color-blue)">
                    {pq.repoName}
                  </span>
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{ color: scoreColor(pq.score * 10) }}
                  >
                    {pq.score}/10
                  </span>
                </div>
                <Bar value={pq.score * 10} />
                <div className="mt-2 flex flex-col gap-1">
                  {pq.strengths.map((s) => (
                    <div key={s} className="flex items-start gap-1.5 text-xs text-(--color-accent)">
                      <ChevronRight size={11} className="mt-0.5 shrink-0" />
                      {s}
                    </div>
                  ))}
                  {pq.weaknesses.map((w) => (
                    <div key={w} className="flex items-start gap-1.5 text-xs text-red-400">
                      <ChevronRight size={11} className="mt-0.5 shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Architecture insights ────────────────────────────────────── */}
      {result.architectureInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-(--color-text-faint)" />
            <span className="font-mono text-xs text-(--color-text-faint)">
              ARCHITECTURE INSIGHTS
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {result.architectureInsights.map((insight, i) => (
              <p key={i} className="text-xs leading-relaxed text-(--color-text-muted)">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Skill gaps ───────────────────────────────────────────────── */}
      {result.skillGaps && result.skillGaps.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle size={12} className="text-(--color-text-faint)" />
            <span className="font-mono text-xs text-(--color-text-faint)">
              SKILL GAPS
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {result.skillGaps.map((gap) => (
              <div
                key={gap.skill}
                className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-(--color-text)">
                    {gap.skill}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase"
                    style={{ color: IMPORTANCE_COLOR[gap.importance] ?? "var(--color-text-muted)" }}
                  >
                    {gap.importance}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
                  {gap.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
