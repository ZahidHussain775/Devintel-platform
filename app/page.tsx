"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Code2,
  FolderGit2,
  FileUp,
  IdCard,
  Sparkles,
  ArrowRight,
  Gauge,
  Target,
  ListChecks,
  CheckCircle2,
  X,
  Brain,
  Briefcase,
  Download,
} from "lucide-react";
import { UploadCard }     from "@/components/UploadCard";
import { SkillHeatmap, type SkillRow } from "@/components/SkillHeatmap";
import { GitHubStats }    from "@/components/GitHubStats";
import { ResumeStats }    from "@/components/ResumeStats";
import { AnalysisReport } from "@/components/AnalysisReport";
import { GitHubSkeleton, ResumeSkeleton, AnalysisSkeleton } from "@/components/ReportSkeleton";
import type { GitHubProfile, ResumeData, AnalysisResult } from "@/lib/types";

// ─── Sample heatmap ───────────────────────────────────────────────────────────
const SAMPLE_SKILLS: SkillRow[] = [
  { label: "Frontend",     values: [2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3] },
  { label: "Backend",      values: [3, 3, 2, 3, 4, 3, 3, 4, 3, 3, 2, 3] },
  { label: "Architecture", values: [1, 2, 2, 3, 2, 3, 2, 3, 2, 2, 3, 2] },
  { label: "Docs",         values: [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4] },
  { label: "Testing",      values: [1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1] },
  { label: "DevOps",       values: [2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 2] },
];

const ROLE_SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "ML Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "AI Engineer",
];

type SectionState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [githubUsername, setGithubUsername] = useState("");
  const [resumeFile,     setResumeFile]     = useState<File | null>(null);
  const [linkedinText,   setLinkedinText]   = useState("");
  const [targetRole,     setTargetRole]     = useState("");

  const [githubState,   setGithubState]   = useState<SectionState<GitHubProfile>>({ status: "idle" });
  const [resumeState,   setResumeState]   = useState<SectionState<ResumeData>>({ status: "idle" });
  const [analysisState, setAnalysisState] = useState<SectionState<AnalysisResult>>({ status: "idle" });


  // Ref for the printable report area
  const reportRef = useRef<HTMLDivElement>(null);

  const canAnalyze = githubUsername.trim().length > 0 || resumeFile !== null;
  const [analyzing, setAnalyzing] = useState(false);
  const isLoading = analyzing ||
      githubState.status   === "loading" ||
      resumeState.status   === "loading" ||
      analysisState.status === "loading";

  const showGitHub   = githubState.status   === "success";
  const showResume   = resumeState.status   === "success";
  const showAnalysis = analysisState.status === "success";
  const showResults  = showGitHub || showResume;

  // ── PDF export ──────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `DevIntel-Report-${githubUsername || "developer"}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { background: #0d1117 !important; color: #e6edf3 !important; }
      }
    `,
  });

  // ── Resets ──────────────────────────────────────────────────────────────────
  function resetGitHub() {
    setGithubUsername("");
    setGithubState({ status: "idle" });
    setAnalysisState({ status: "idle" });
  }

  function resetResume() {
    setResumeFile(null);
    setResumeState({ status: "idle" });
    setAnalysisState({ status: "idle" });
  }

  // ── Fetch GitHub ────────────────────────────────────────────────────────────
  async function fetchGitHub(): Promise<GitHubProfile | null> {
    if (!githubUsername.trim()) return null;
    setGithubState({ status: "loading" });
    try {
      const res  = await fetch(`/api/github?username=${encodeURIComponent(githubUsername.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch GitHub data");
      setGithubState({ status: "success", data });
      return data;
    } catch (err) {
      setGithubState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      return null;
    }
  }

  // ── Parse resume ────────────────────────────────────────────────────────────
  async function parseResume(): Promise<ResumeData | null> {
    if (!resumeFile) return null;
    setResumeState({ status: "loading" });
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const res  = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to parse resume");
      setResumeState({ status: "success", data });
      return data;
    } catch (err) {
      setResumeState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      return null;
    }
  }

  // ── AI analysis ─────────────────────────────────────────────────────────────
  async function runAIAnalysis(
    githubProfile: GitHubProfile | null,
    resumeData: ResumeData | null,
  ): Promise<void> {
    if (!githubProfile && !resumeData) return;
    setAnalysisState({ status: "loading" });
    try {
      const res  = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubProfile,
          resumeData,
          linkedinText: linkedinText.trim() || null,
          targetRole:   targetRole.trim()   || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysisState({ status: "success", data });
    } catch (err) {
      setAnalysisState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  // ── Main handler ────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return;
    setAnalyzing(true);
    setAnalysisState({ status: "idle" });
    const [githubProfile, resumeData] = await Promise.all([fetchGitHub(), parseResume()]);
    if (githubProfile || resumeData) await runAIAnalysis(githubProfile, resumeData);
    setAnalyzing(false);
}
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-full flex-col bg-(--color-canvas)">

      {/* ── Full-screen report + skeleton view ───────────────────────────────── */}
      {(showAnalysis || analysisState.status === "loading") && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-(--color-canvas)">
          <div className="mx-auto max-w-4xl px-6 py-12">

            {/* Report header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-accent) text-(--color-canvas)">
                  <Brain size={15} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Your Developer Intelligence Report
                  </h2>
                  {targetRole && (
                    <span className="font-mono text-xs text-(--color-text-faint)">
                      Analyzed for:{" "}
                      <span className="text-(--color-accent)">{targetRole}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint()}
                  disabled={analysisState.status === "loading"}
                  className="flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download size={14} />
                  Export PDF
                </button>
                <button
                  onClick={() => setAnalysisState({ status: "idle" })}
                  className="flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-text)"
                >
                  <X size={14} />
                  Back
                </button>
              </div>
            </div>

            {/* Skeleton while AI runs / real report when done */}
            {analysisState.status === "loading" ? (
              <div className="flex flex-col gap-6">
                {/* Step indicators while AI runs */}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) py-8">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-(--color-border)" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-(--color-accent)" />
                    <Brain size={18} className="text-(--color-accent)" />
                  </div>
                  <p className="font-mono text-sm text-(--color-text-muted)">
                    Running AI analysis… this takes 10–20 seconds
                  </p>
                </div>
                {/* Skeleton of the report below */}
                <AnalysisSkeleton />
              </div>
            ) : showAnalysis ? (
              <div ref={reportRef}>
                {/* Print-only header */}
                <div className="hidden print:block mb-6">
                  <h1 className="font-display text-2xl font-semibold">DevIntel — Developer Intelligence Report</h1>
                  {githubUsername && <p className="font-mono text-sm mt-1">github.com/{githubUsername}</p>}
                  {targetRole    && <p className="font-mono text-sm">Target role: {targetRole}</p>}
                  <p className="font-mono text-xs mt-1 opacity-50">Generated {new Date().toLocaleDateString()}</p>
                </div>
                <AnalysisReport result={analysisState.data} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-(--color-border)">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-accent) text-(--color-canvas)">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">DevIntel</span>
          </div>
          <a href="https://github.com/ZahidHussain775/Devintel-platform"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-(--color-text-muted) transition-colors hover:text-(--color-text)">
            <Code2 size={18} />
            <span className="hidden sm:inline">View source</span>
          </a>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="mx-auto flex-1 px-6 py-12 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ── Left: inputs ─────────────────────────────────────────────── */}
            <div>
              <span className="font-mono text-xs tracking-widest text-(--color-accent)">
                AI DEVELOPER INTELLIGENCE
              </span>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Know exactly where you stand as a developer.
              </h1>
              <p className="mt-4 max-w-lg text-(--color-text-muted)">
                Upload your GitHub profile and resume. DevIntel reads your code — not just
                your keywords — and turns it into a clear, honest picture of your skills,
                gaps, and readiness for the job market.
              </p>

              <div className="mt-8 flex flex-col gap-3">

                {/* Step 01 — GitHub */}
                <UploadCard icon={FolderGit2} step="01" title="GitHub profile"
                  description="We'll analyze your public repos, code structure, and documentation.">
                  {showGitHub ? (
                    <div className="relative flex items-center gap-2 rounded-md border border-(--color-accent-dim) bg-(--color-canvas) px-3 py-2 pr-16">
                      <CheckCircle2 size={14} className="shrink-0 text-(--color-accent)" />
                      <span className="font-mono text-sm text-(--color-text) truncate">
                        github.com/{githubUsername}
                      </span>
                      <button onClick={resetGitHub} title="Clear"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded px-2 py-0.5 text-xs text-(--color-text-faint) transition-colors hover:bg-(--color-surface-2) hover:text-red-400">
                        <X size={11} /> Clear
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 focus-within:border-(--color-accent-dim)">
                        <span className="font-mono text-sm text-(--color-text-faint)">github.com/</span>
                        <input type="text" value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                          placeholder="your-username"
                          className="w-full bg-transparent font-mono text-sm text-(--color-text) outline-none placeholder:text-(--color-text-faint)"
                        />
                      </div>
                      {githubState.status === "error" && (
                        <p className="mt-1.5 text-xs text-red-400">{githubState.message}</p>
                      )}
                    </>
                  )}
                </UploadCard>

                {/* Step 02 — Resume */}
                <UploadCard icon={FileUp} step="02" title="Resume / CV"
                  description="Upload your PDF resume. We extract skills, experience, and education.">
                  {showResume ? (
                    <div className="relative flex items-center gap-2 rounded-md border border-(--color-accent-dim) bg-(--color-canvas) px-3 py-2 pr-16">
                      <CheckCircle2 size={14} className="shrink-0 text-(--color-accent)" />
                      <span className="font-mono text-sm text-(--color-text) truncate">
                        {resumeFile?.name ?? "resume.pdf"}
                      </span>
                      <button onClick={resetResume} title="Clear"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded px-2 py-0.5 text-xs text-(--color-text-faint) transition-colors hover:bg-(--color-surface-2) hover:text-red-400">
                        <X size={11} /> Clear
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 transition-colors hover:border-(--color-accent-dim)">
                        <FileUp size={14} className="shrink-0 text-(--color-text-faint)" />
                        <span className="truncate font-mono text-sm text-(--color-text-muted)">
                          {resumeFile ? resumeFile.name : "Choose PDF…"}
                        </span>
                        <input type="file" accept=".pdf" className="sr-only"
                          onChange={(e) => { setResumeFile(e.target.files?.[0] ?? null); setResumeState({ status: "idle" }); }} />
                      </label>
                      {resumeState.status === "error" && (
                        <p className="mt-1.5 text-xs text-red-400">{resumeState.message}</p>
                      )}
                    </>
                  )}
                </UploadCard>

                {/* Step 03 — LinkedIn */}
                <UploadCard icon={IdCard} step="03" title="LinkedIn summary"
                  description="Optional. Paste your headline and about section text.">
                  <textarea value={linkedinText} onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="Paste your LinkedIn headline and summary here..."
                    rows={2}
                    className="w-full resize-none rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-text) outline-none placeholder:text-(--color-text-faint) focus:border-(--color-accent-dim)"
                  />
                </UploadCard>

                {/* Step 04 — Target role */}
                <UploadCard icon={Briefcase} step="04" title="Target role"
                  description="Optional but recommended. Skill gaps will be tailored to this role.">
                  <input type="text" value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, ML Engineer…"
                    className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 font-mono text-sm text-(--color-text) outline-none placeholder:text-(--color-text-faint) focus:border-(--color-accent-dim)"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ROLE_SUGGESTIONS.map((role) => (
                      <button key={role} onClick={() => setTargetRole(role)}
                        className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-0.5 font-mono text-[11px] text-(--color-text-faint) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-accent)"
                        style={targetRole === role ? { borderColor: "var(--color-accent-dim)", color: "var(--color-accent)" } : {}}>
                        {role}
                      </button>
                    ))}
                  </div>
                </UploadCard>
              </div>

              <div className="mt-6">
                <button onClick={handleAnalyze} disabled={!canAnalyze || isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-(--color-accent) px-5 py-3 text-sm font-semibold text-(--color-canvas) transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
                  Analyze my profile
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* ── Right: preview / skeletons / fetched data ────────────────── */}
            <div className="flex flex-col gap-4">
              {showResults || githubState.status === "loading" || resumeState.status === "loading" ? (
                <>
                  {/* GitHub — skeleton while loading, real card when done */}
                  {githubState.status === "loading" && <GitHubSkeleton />}
                  {showGitHub && (
                    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-xs tracking-widest text-(--color-text-faint)">GITHUB PROFILE</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-(--color-accent)/10 px-2 py-0.5 font-mono text-[10px] text-(--color-accent)">LIVE</span>
                          <button onClick={resetGitHub} title="Remove"
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-(--color-border) text-(--color-text-faint) transition-colors hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <GitHubStats profile={githubState.data} />
                    </div>
                  )}

                  {/* Resume — skeleton while loading, real card when done */}
                  {resumeState.status === "loading" && <ResumeSkeleton />}
                  {showResume && (
                    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-xs tracking-widest text-(--color-text-faint)">RESUME PARSED</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-(--color-accent)/10 px-2 py-0.5 font-mono text-[10px] text-(--color-accent)">LIVE</span>
                          <button onClick={resetResume} title="Remove"
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-(--color-border) text-(--color-text-faint) transition-colors hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <ResumeStats resume={resumeState.data} />
                    </div>
                  )}

                  {/* AI analysis skeleton — shown while Groq runs */}
                  {analysisState.status === "loading" && (
                    <AnalysisSkeleton />
                  )}

                  {analysisState.status === "error" && (
                    <div className="rounded-lg border border-red-900/40 bg-(--color-surface) p-4">
                      <p className="text-xs text-red-400">{analysisState.message}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Idle preview */
                <div className="relative overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
                  <div className="scanline pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-(--color-accent)/10 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tracking-widest text-(--color-text-faint)">EXAMPLE OUTPUT</span>
                    <span className="font-mono text-xs text-(--color-text-faint)">octocat</span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <ScoreBadge icon={Gauge}      label="Employability"  value="78" />
                    <ScoreBadge icon={Target}     label="Industry Ready" value="82" />
                    <ScoreBadge icon={ListChecks} label="Skill Gaps"     value="3"  />
                  </div>
                  <div className="mt-6">
                    <span className="font-mono text-xs text-(--color-text-faint)">SKILL HEATMAP</span>
                    <div className="mt-3"><SkillHeatmap rows={SAMPLE_SKILLS} /></div>
                  </div>
                  <p className="mt-6 text-xs leading-relaxed text-(--color-text-muted)">
                    Enter your GitHub username or upload your resume on the left to replace this with your real data.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── How it works ─────────────────────────────────────────────────── */}
          {!showResults && githubState.status !== "loading" && resumeState.status !== "loading" && (
            <div className="mt-20 border-t border-(--color-border) pt-12">
              <h2 className="font-display text-2xl font-semibold">How it works</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Step number="01" title="Upload"          description="Share your GitHub username, resume, and (optionally) LinkedIn summary." />
                <Step number="02" title="AI analyzes"     description="DevIntel reads your repos, code structure, docs, and resume to build a profile." />
                <Step number="03" title="Get your report" description="Receive scores, a skill gap report, and clear next steps to improve." />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-(--color-border)">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-(--color-text-faint) sm:flex-row sm:items-center sm:justify-between">
          <span>Built incrementally, one feature at a time.</span>
          <a href="https://github.com/ZahidHussain775/Devintel-platform" target="_blank" rel="noreferrer"
            className="transition-colors hover:text-(--color-text-muted)">
            github.com/ZahidHussain775/Devintel-platform
          </a>
        </div>
      </footer>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBadge({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-md border border-(--color-border) bg-(--color-canvas) p-3">
      <Icon size={14} className="text-(--color-accent)" />
      <div className="mt-2 font-mono text-xl font-semibold">{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-(--color-text-muted)">{label}</div>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-(--color-accent)">{number}</span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-sm text-(--color-text-muted)">{description}</p>
    </div>
  );
}