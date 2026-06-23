import type { AnalysisResult, ProficiencyLevel } from "@/lib/types";
import {
  Gauge,
  FileText,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Cpu,
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

const IMPORTANCE_COLOR: Record<string, string> = {
  high:   "#f87171",
  medium: "var(--color-amber)",
  low:    "var(--color-text-muted)",
};

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
      <div
        className="mt-2 font-mono text-xl font-semibold"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-(--color-text-muted)">{label}</div>
    </div>
  );
}

// Thin coloured progress bar
function Bar({ value }: { value: number }) {
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, value)}%`,
          backgroundColor: scoreColor(value),
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalysisReport({ result }: { result: AnalysisResult }) {
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

      {/* ── Score cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard icon={Gauge}     label="Overall"     value={result.overallScore} />
        <ScoreCard icon={FileText}  label="Docs"        value={result.documentationScore} />
        <ScoreCard icon={RefreshCw} label="Consistency" value={result.consistencyScore} />
      </div>

      {/* ── Summary ──────────────────────────────────────────────────── */}
      <p className="text-sm leading-relaxed text-(--color-text-muted)">
        {result.summary}
      </p>

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
                    <div
                      key={s}
                      className="flex items-start gap-1.5 text-xs text-(--color-accent)"
                    >
                      <ChevronRight size={11} className="mt-0.5 shrink-0" />
                      {s}
                    </div>
                  ))}
                  {pq.weaknesses.map((w) => (
                    <div
                      key={w}
                      className="flex items-start gap-1.5 text-xs text-red-400"
                    >
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
              <p
                key={i}
                className="text-xs leading-relaxed text-(--color-text-muted)"
              >
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
