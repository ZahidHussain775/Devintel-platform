"use client";

import { useEffect, useRef } from "react";
import type { AnalysisResult, ProficiencyLevel } from "@/lib/types";
import { SkillHeatmap, type SkillRow } from "@/components/SkillHeatmap";
import {
  ChevronRight,
  AlertCircle,
  Cpu,
  Zap,
  BarChart2,
  BookOpen,
  Activity,
  Target,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(value: number): string {
  if (value >= 70) return "#39d353";
  if (value >= 40) return "#d29922";
  return "#f87171";
}

function scoreGrade(value: number): string {
  if (value >= 85) return "A+";
  if (value >= 70) return "A";
  if (value >= 55) return "B";
  if (value >= 40) return "C";
  return "D";
}

function scoreLabel(value: number): string {
  if (value >= 70) return "Strong";
  if (value >= 40) return "Developing";
  return "Needs Work";
}

const LEVEL_COLOR: Record<ProficiencyLevel, string> = {
  beginner:     "#d29922",
  intermediate: "#58a6ff",
  advanced:     "#39d353",
  expert:       "#39d353",
};

const LEVEL_BG: Record<ProficiencyLevel, string> = {
  beginner:     "rgba(210,153,34,0.1)",
  intermediate: "rgba(88,166,255,0.1)",
  advanced:     "rgba(57,211,83,0.1)",
  expert:       "rgba(57,211,83,0.15)",
};

const LEVEL_HEAT: Record<ProficiencyLevel, number> = {
  beginner: 1, intermediate: 2, advanced: 3, expert: 4,
};

const IMPORTANCE_STYLES: Record<string, { color: string; bg: string; dot: string }> = {
  high:   { color: "#f87171", bg: "rgba(248,113,113,0.1)", dot: "#f87171" },
  medium: { color: "#d29922", bg: "rgba(210,153,34,0.1)",  dot: "#d29922" },
  low:    { color: "#8b949e", bg: "rgba(139,148,158,0.1)", dot: "#8b949e" },
};

// ─── Circular progress ring ───────────────────────────────────────────────────

function CircleScore({
  value,
  label,
  size = 96,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const color    = scoreColor(value);
  const grade    = scoreGrade(value);
  const radius   = 36;
  const stroke   = 4;
  const circ     = 2 * Math.PI * radius;
  const progress = circ - (value / 100) * circ;
  const svgSize  = radius * 2 + stroke * 2 + 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke="var(--color-border)" strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold leading-none" style={{ color }}>
            {value}
          </span>
          <span className="font-mono text-[10px] font-semibold" style={{ color, opacity: 0.7 }}>
            {grade}
          </span>
        </div>
      </div>
      <span className="text-center text-[11px] leading-tight text-(--color-text-muted)">
        {label}
      </span>
    </div>
  );
}

// ─── Section header with left border ─────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: typeof AlertCircle;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border-l-2 border-(--color-accent) pl-3">
      <Icon size={13} className="text-(--color-accent) shrink-0" />
      <span className="font-mono text-xs font-semibold tracking-widest text-(--color-text-muted)">
        {label}
      </span>
    </div>
  );
}

// ─── Animated bar ─────────────────────────────────────────────────────────────

function AnimatedBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = "0%";
    const t = setTimeout(() => { el.style.width = `${Math.min(100, value)}%`; }, 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
      <div
        ref={ref}
        className="h-full rounded-full"
        style={{
          backgroundColor: scoreColor(value),
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

// ─── Heatmap builder ──────────────────────────────────────────────────────────

function buildHeatmapRows(result: AnalysisResult): SkillRow[] {
  const rows: SkillRow[] = [];
  for (const lp of result.languageProficiency.slice(0, 6)) {
    const base = LEVEL_HEAT[lp.level] ?? 1;
    const values = Array.from({ length: 12 }, (_, i) => {
      const noise = [0, 1, 0, -1, 0, 1, -1, 0, 1, 0, -1, 0][i];
      return Math.min(4, Math.max(0, base + (i % 3 === 0 ? noise : 0)));
    });
    rows.push({ label: lp.language, values });
  }
  for (const gap of (result.skillGaps ?? []).slice(0, 3)) {
    const base = gap.importance === "high" ? 0 : 1;
    const values = Array.from({ length: 12 }, (_, i) =>
      i % 4 === 0 ? Math.min(base + 1, 2) : base
    );
    rows.push({ label: gap.skill, values });
  }
  return rows;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  const heatmapRows        = buildHeatmapRows(result);
  const employabilityScore = Math.round((result.overallScore * 0.6) + (result.consistencyScore * 0.4));
  const industryReadyScore = Math.round((result.overallScore * 0.6) + (result.documentationScore * 0.4));

  const scores = [
    { label: "Overall",        value: result.overallScore      },
    { label: "Employability",  value: employabilityScore       },
    { label: "Industry Ready", value: industryReadyScore       },
    { label: "Docs",           value: result.documentationScore },
    { label: "Consistency",    value: result.consistencyScore  },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* ── Score rings row ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
        <div className="mb-6 flex items-center justify-between">
          <SectionHeader icon={BarChart2} label="SCORES" />
          <span className="rounded-full bg-(--color-accent)/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-(--color-accent)">
            GROQ · LLAMA 3.3
          </span>
        </div>

        {/* Circles */}
        <div className="grid grid-cols-5 gap-4">
          {scores.map((s) => (
            <CircleScore key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        {/* Summary text */}
        <div className="mt-6 rounded-lg border border-(--color-border) bg-(--color-canvas) p-4">
          <p className="text-sm leading-relaxed text-(--color-text-muted)">
            {result.summary}
          </p>
        </div>

        {/* Quick stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {scores.slice(0, 3).map((s) => (
            <div key={s.label}
              className="rounded-lg border border-(--color-border) bg-(--color-canvas) px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-(--color-text-faint)">{s.label}</span>
                <span className="font-mono text-xs font-semibold"
                  style={{ color: scoreColor(s.value) }}>
                  {scoreLabel(s.value)}
                </span>
              </div>
              <AnimatedBar value={s.value} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Skill heatmap ─────────────────────────────────────────────────── */}
      {heatmapRows.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
          <div className="mb-4">
            <SectionHeader icon={Activity} label="SKILL HEATMAP" />
          </div>
          <SkillHeatmap rows={heatmapRows} animate />
          {/* Legend */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-(--color-text-faint)">none</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <span key={v} className="h-3 w-3 rounded-[3px]"
                style={{
                  backgroundColor: ["var(--heat-0)","var(--heat-1)","var(--heat-2)","var(--heat-3)","var(--heat-4)"][v],
                  border: v === 0 ? "1px solid var(--color-border)" : undefined,
                }} />
            ))}
            <span className="text-[10px] text-(--color-text-faint)">expert</span>
          </div>
        </div>
      )}

      {/* ── Language proficiency ───────────────────────────────────────────── */}
      {result.languageProficiency.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
          <div className="mb-4">
            <SectionHeader icon={Zap} label="LANGUAGE PROFICIENCY" />
          </div>
          <div className="flex flex-col gap-3">
            {result.languageProficiency.map((lp) => (
              <div key={lp.language}
                className="rounded-lg border border-(--color-border) bg-(--color-canvas) p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-(--color-text)">
                    {lp.language}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold capitalize"
                    style={{
                      color: LEVEL_COLOR[lp.level],
                      backgroundColor: LEVEL_BG[lp.level],
                    }}
                  >
                    {lp.level}
                  </span>
                </div>
                {/* Proficiency bar */}
                <AnimatedBar value={LEVEL_HEAT[lp.level] * 25} />
                <p className="mt-2 text-xs leading-relaxed text-(--color-text-muted)">
                  {lp.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Project quality ────────────────────────────────────────────────── */}
      {result.projectQuality.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
          <div className="mb-4">
            <SectionHeader icon={Target} label="PROJECT QUALITY" />
          </div>
          <div className="flex flex-col gap-3">
            {result.projectQuality.map((pq) => (
              <div key={pq.repoName}
                className="rounded-lg border border-(--color-border) bg-(--color-canvas) p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-(--color-blue)">
                    {pq.repoName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-(--color-text-faint)">
                      {pq.score}/10
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
                      style={{
                        color: scoreColor(pq.score * 10),
                        backgroundColor: `${scoreColor(pq.score * 10)}18`,
                      }}
                    >
                      {scoreGrade(pq.score * 10)}
                    </span>
                  </div>
                </div>
                <AnimatedBar value={pq.score * 10} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    {pq.strengths.map((s) => (
                      <div key={s} className="flex items-start gap-1.5 text-xs text-(--color-accent) mb-1">
                        <ChevronRight size={11} className="mt-0.5 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div>
                    {pq.weaknesses.map((w) => (
                      <div key={w} className="flex items-start gap-1.5 text-xs text-red-400 mb-1">
                        <ChevronRight size={11} className="mt-0.5 shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Architecture insights ──────────────────────────────────────────── */}
      {result.architectureInsights.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
          <div className="mb-4">
            <SectionHeader icon={Cpu} label="ARCHITECTURE INSIGHTS" />
          </div>
          <div className="flex flex-col gap-2">
            {result.architectureInsights.map((insight, i) => (
              <div key={i}
                className="flex items-start gap-3 rounded-lg bg-(--color-canvas) p-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-surface-2) font-mono text-[10px] text-(--color-text-faint)">
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed text-(--color-text-muted)">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skill gaps ─────────────────────────────────────────────────────── */}
      {result.skillGaps && result.skillGaps.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
          <div className="mb-4">
            <SectionHeader icon={AlertCircle} label="SKILL GAPS" />
          </div>
          <div className="flex flex-col gap-3">
            {result.skillGaps.map((gap) => {
              const style = IMPORTANCE_STYLES[gap.importance] ?? IMPORTANCE_STYLES.low;
              return (
                <div key={gap.skill}
                  className="rounded-lg border bg-(--color-canvas) p-4"
                  style={{ borderColor: `${style.color}30` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Colored dot */}
                      <span className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: style.dot }} />
                      <span className="font-mono text-sm font-semibold text-(--color-text)">
                        {gap.skill}
                      </span>
                    </div>
                    {/* Priority badge */}
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: style.color, backgroundColor: style.bg }}
                    >
                      {gap.importance === "high"   ? "🔴 High"
                      : gap.importance === "medium" ? "🟡 Medium"
                      :                              "🟢 Low"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-(--color-text-muted)">
                    {gap.suggestion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}