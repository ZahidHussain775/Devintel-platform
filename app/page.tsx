"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Code2, FolderGit2, FileUp, IdCard, Sparkles,
  ArrowRight, Gauge, Target, ListChecks,
  CheckCircle2, X, Brain, Briefcase, Download,
  Zap, GitBranch,
} from "lucide-react";
import { UploadCard }     from "@/components/UploadCard";
import { SkillHeatmap, type SkillRow } from "@/components/SkillHeatmap";
import { GitHubStats }    from "@/components/GitHubStats";
import { ResumeStats }    from "@/components/ResumeStats";
import { AnalysisReport } from "@/components/AnalysisReport";
import { GitHubSkeleton, ResumeSkeleton, AnalysisSkeleton } from "@/components/ReportSkeleton";
import type { GitHubProfile, ResumeData, AnalysisResult } from "@/lib/types";

const SAMPLE_SKILLS: SkillRow[] = [
  { label: "Frontend",     values: [2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3] },
  { label: "Backend",      values: [3, 3, 2, 3, 4, 3, 3, 4, 3, 3, 2, 3] },
  { label: "Architecture", values: [1, 2, 2, 3, 2, 3, 2, 3, 2, 2, 3, 2] },
  { label: "Docs",         values: [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4] },
  { label: "Testing",      values: [1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1] },
  { label: "DevOps",       values: [2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 2] },
];

const ROLE_SUGGESTIONS = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "ML Engineer", "Data Scientist", "DevOps Engineer",
  "Mobile Developer",  "AI Engineer",
];

type SectionState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function Home() {
  const [githubUsername, setGithubUsername] = useState("");
  const [resumeFile,     setResumeFile]     = useState<File | null>(null);
  const [linkedinText,   setLinkedinText]   = useState("");
  const [targetRole,     setTargetRole]     = useState("");
  const [analyzing,      setAnalyzing]      = useState(false);

  const [githubState,   setGithubState]   = useState<SectionState<GitHubProfile>>({ status: "idle" });
  const [resumeState,   setResumeState]   = useState<SectionState<ResumeData>>({ status: "idle" });
  const [analysisState, setAnalysisState] = useState<SectionState<AnalysisResult>>({ status: "idle" });

  const reportRef = useRef<HTMLDivElement>(null);

  const canAnalyze = githubUsername.trim().length > 0 || resumeFile !== null;
  const isLoading  = analyzing ||
    githubState.status   === "loading" ||
    resumeState.status   === "loading" ||
    analysisState.status === "loading";

  const showGitHub   = githubState.status   === "success";
  const showResume   = resumeState.status   === "success";
  const showAnalysis = analysisState.status === "success";
  const showResults  = showGitHub || showResume;

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `DevIntel-Report-${githubUsername || "developer"}`,
    pageStyle: `@page { size: A4; margin: 20mm; }`,
  });

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

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return;
    setAnalyzing(true);
    setAnalysisState({ status: "idle" });
    const [githubProfile, resumeData] = await Promise.all([fetchGitHub(), parseResume()]);
    if (githubProfile || resumeData) await runAIAnalysis(githubProfile, resumeData);
    await new Promise(r => setTimeout(r, 2000));
    setAnalyzing(false);
  }

  return (
    <div className="relative flex min-h-full flex-col" style={{ zIndex: 1 }}>

      {/* ── Full-screen report / skeleton view ─────────────────────────────── */}
      {(showAnalysis || analysisState.status === "loading") && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: "var(--color-canvas)" }}>
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="fade-in mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="glow-pulse flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg,#39d353,#58a6ff)", color: "#0a0e13" }}>
                  <Brain size={16} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Developer Intelligence Report</h2>
                  {targetRole && (
                    <span className="font-mono text-xs" style={{ color: "var(--color-text-faint)" }}>
                      Analyzed for:{" "}
                      <span style={{ color: "var(--color-accent)" }}>{targetRole}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrint()}
                  disabled={analysisState.status === "loading"}
                  className="glass glass-hover flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--color-text-muted) disabled:opacity-40">
                  <Download size={14} />
                  Export PDF
                </button>
                <button onClick={() => setAnalysisState({ status: "idle" })}
                  className="glass glass-hover flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--color-text-muted)">
                  <X size={14} />
                  Back
                </button>
              </div>
            </div>

            {analysisState.status === "loading" ? (
              <div className="flex flex-col gap-6">
                <div className="glass flex flex-col items-center gap-4 rounded-xl py-10">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full"
                      style={{ border: "2px solid transparent", borderTopColor: "var(--color-accent)" }} />
                    <Brain size={20} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <p className="font-mono text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Groq AI is analyzing your profile…
                  </p>
                  {targetRole && (
                    <span className="rounded-full px-3 py-1 font-mono text-xs"
                      style={{ background: "rgba(57,211,83,0.1)", color: "var(--color-accent)", border: "1px solid rgba(57,211,83,0.2)" }}>
                      Target: {targetRole}
                    </span>
                  )}
                </div>
                <AnalysisSkeleton />
              </div>
            ) : showAnalysis ? (
              <div ref={reportRef} className="fade-in">
                <div className="hidden print:block mb-6">
                  <h1 className="font-display text-2xl font-semibold">DevIntel — Developer Intelligence Report</h1>
                  {githubUsername && <p className="font-mono text-sm mt-1">github.com/{githubUsername}</p>}
                  {targetRole    && <p className="font-mono text-sm">Target: {targetRole}</p>}
                  <p className="font-mono text-xs mt-1 opacity-50">Generated {new Date().toLocaleDateString()}</p>
                </div>
                <AnalysisReport result={analysisState.data} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(10,14,19,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="glow-pulse flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#39d353,#58a6ff)", color: "#0a0e13" }}>
              <Sparkles size={15} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Dev<span style={{ color: "var(--color-accent)" }}>Intel</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ZahidHussain775/Devintel-platform"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--color-text-faint)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
              <Code2 size={16} />
              <span className="hidden sm:inline">View source</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="mx-auto flex-1 px-6 py-16 w-full">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

            {/* ── Left: hero + inputs ──────────────────────────────────────── */}
            <div>
              {/* Hero */}
              <div className="slide-in slide-in-1 mb-10">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{ background: "rgba(57,211,83,0.08)", border: "1px solid rgba(57,211,83,0.2)" }}>
                  <Zap size={11} style={{ color: "var(--color-accent)" }} />
                  <span className="font-mono text-[11px] font-semibold tracking-widest"
                    style={{ color: "var(--color-accent)" }}>
                    AI DEVELOPER INTELLIGENCE
                  </span>
                </div>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Know exactly{" "}
                  <span className="gradient-text cursor">where you stand</span>
                  {" "}as a developer.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  Upload your GitHub profile and resume. DevIntel reads your
                  code — not just your keywords — and delivers an honest,
                  AI-powered picture of your skills and job-readiness.
                </p>
              </div>

              {/* Input cards */}
              <div className="flex flex-col gap-3">
                {/* Step 01 */}
                <UploadCard icon={FolderGit2} step="01" title="GitHub profile"
                  description="Analyze your repos, languages, and code patterns." delay="0.15">
                  {showGitHub ? (
                    <div className="relative flex items-center gap-2 rounded-lg px-3 py-2 pr-16"
                      style={{ border: "1px solid var(--color-accent-dim)", background: "rgba(57,211,83,0.05)" }}>
                      <CheckCircle2 size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                      <span className="truncate font-mono text-sm">github.com/{githubUsername}</span>
                      <button onClick={resetGitHub}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors"
                        style={{ color: "var(--color-text-faint)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
                        <X size={11} /> Clear
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="input-glow flex items-center rounded-lg px-3 py-2"
                        style={{ border: "1px solid var(--color-border)", background: "var(--color-canvas)", transition: "all 0.2s" }}>
                        <span className="font-mono text-sm" style={{ color: "var(--color-text-faint)" }}>github.com/</span>
                        <input type="text" value={githubUsername}
                          onChange={e => setGithubUsername(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                          placeholder="your-username"
                          className="w-full bg-transparent font-mono text-sm outline-none"
                          style={{ color: "var(--color-text)" }} />
                      </div>
                      {githubState.status === "error" && (
                        <p className="mt-1.5 text-xs text-red-400">{githubState.message}</p>
                      )}
                    </>
                  )}
                </UploadCard>

                {/* Step 02 */}
                <UploadCard icon={FileUp} step="02" title="Resume / CV"
                  description="Upload PDF — we extract skills, experience, and education." delay="0.25">
                  {showResume ? (
                    <div className="relative flex items-center gap-2 rounded-lg px-3 py-2 pr-16"
                      style={{ border: "1px solid var(--color-accent-dim)", background: "rgba(57,211,83,0.05)" }}>
                      <CheckCircle2 size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                      <span className="truncate font-mono text-sm">{resumeFile?.name ?? "resume.pdf"}</span>
                      <button onClick={resetResume}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors"
                        style={{ color: "var(--color-text-faint)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
                        <X size={11} /> Clear
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-all"
                        style={{ border: "1px solid var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text-muted)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent-dim)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}>
                        <FileUp size={14} style={{ flexShrink: 0 }} />
                        <span className="truncate font-mono text-sm">
                          {resumeFile ? resumeFile.name : "Choose PDF…"}
                        </span>
                        <input type="file" accept=".pdf" className="sr-only"
                          onChange={e => { setResumeFile(e.target.files?.[0] ?? null); setResumeState({ status: "idle" }); }} />
                      </label>
                      {resumeState.status === "error" && (
                        <p className="mt-1.5 text-xs text-red-400">{resumeState.message}</p>
                      )}
                    </>
                  )}
                </UploadCard>

                {/* Step 03 */}
                <UploadCard icon={IdCard} step="03" title="LinkedIn summary"
                  description="Optional — paste your headline and about section." delay="0.35">
                  <textarea value={linkedinText} onChange={e => setLinkedinText(e.target.value)}
                    placeholder="Paste your LinkedIn headline and summary here..."
                    rows={2}
                    className="input-glow w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text)", transition: "all 0.2s" }} />
                </UploadCard>

                {/* Step 04 */}
                <UploadCard icon={Briefcase} step="04" title="Target role"
                  description="Optional but recommended — skill gaps will be role-specific." delay="0.45">
                  <input type="text" value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, ML Engineer…"
                    className="input-glow w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                    style={{ border: "1px solid var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text)", transition: "all 0.2s" }} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ROLE_SUGGESTIONS.map(role => (
                      <button key={role} onClick={() => setTargetRole(role)}
                        className="rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all duration-200"
                        style={targetRole === role
                          ? { border: "1px solid var(--color-accent-dim)", color: "var(--color-accent)", background: "rgba(57,211,83,0.1)" }
                          : { border: "1px solid var(--color-border)", color: "var(--color-text-faint)", background: "transparent" }}>
                        {role}
                      </button>
                    ))}
                  </div>
                </UploadCard>
              </div>

              {/* Analyze button */}
              <div className="slide-in slide-in-5 mt-6">
                <button onClick={handleAnalyze} disabled={!canAnalyze || isLoading}
                  className="btn-shimmer relative flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: isLoading
                      ? "rgba(57,211,83,0.3)"
                      : "linear-gradient(135deg, #39d353, #2ea043)",
                    color: "#0a0e13",
                    boxShadow: isLoading ? "none" : "var(--glow-accent)",
                  }}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full"
                        style={{ border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#0a0e13" }} />
                      {githubState.status   === "loading" && "Fetching GitHub…"}
                      {resumeState.status   === "loading" && "Parsing resume…"}
                      {analysisState.status === "loading" && "Running AI analysis…"}
                      {analyzing && analysisState.status !== "loading" &&
                       githubState.status !== "loading" &&
                       resumeState.status !== "loading" && "Preparing report…"}
                    </span>
                  ) : (
                    <>
                      <Zap size={16} />
                      Analyze my profile
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Right: preview / data cards ──────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {showResults || githubState.status === "loading" || resumeState.status === "loading" ? (
                <>
                  {githubState.status === "loading" && <GitHubSkeleton />}
                  {showGitHub && (
                    <div className="glass fade-in rounded-xl p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--color-text-faint)" }}>GITHUB PROFILE</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold"
                            style={{ background: "rgba(57,211,83,0.1)", color: "var(--color-accent)", border: "1px solid rgba(57,211,83,0.2)" }}>
                            LIVE
                          </span>
                          <button onClick={resetGitHub} title="Remove"
                            className="flex h-6 w-6 items-center justify-center rounded-md transition-all"
                            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-faint)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.4)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <GitHubStats profile={githubState.data} />
                    </div>
                  )}

                  {resumeState.status === "loading" && <ResumeSkeleton />}
                  {showResume && (
                    <div className="glass fade-in rounded-xl p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--color-text-faint)" }}>RESUME PARSED</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold"
                            style={{ background: "rgba(57,211,83,0.1)", color: "var(--color-accent)", border: "1px solid rgba(57,211,83,0.2)" }}>
                            LIVE
                          </span>
                          <button onClick={resetResume} title="Remove"
                            className="flex h-6 w-6 items-center justify-center rounded-md transition-all"
                            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-faint)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.4)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <ResumeStats resume={resumeState.data} />
                    </div>
                  )}

                  {analysisState.status === "error" && (
                    <div className="rounded-xl p-4" style={{ border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}>
                      <p className="text-xs text-red-400">{analysisState.message}</p>
                    </div>
                  )}
                </>
              ) : (
                /* ── Idle floating preview ───────────────────────────────── */
                <div className="float glass relative overflow-hidden rounded-2xl p-6"
                  style={{ boxShadow: "var(--glow-accent)" }}>
                  <div className="scanline pointer-events-none absolute inset-y-0 left-0 w-1/3"
                    style={{ background: "linear-gradient(to right, transparent, rgba(57,211,83,0.06), transparent)" }} />

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tracking-widest" style={{ color: "var(--color-text-faint)" }}>
                      EXAMPLE OUTPUT
                    </span>
                    <span className="font-mono text-xs" style={{ color: "var(--color-text-faint)" }}>octocat</span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { icon: Gauge,      label: "Employability",  value: "78" },
                      { icon: Target,     label: "Industry Ready", value: "82" },
                      { icon: ListChecks, label: "Skill Gaps",     value: "3"  },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)" }}>
                        <Icon size={13} style={{ color: "var(--color-accent)" }} />
                        <div className="mt-2 font-mono text-xl font-bold" style={{ color: "var(--color-accent)" }}>{value}</div>
                        <div className="mt-0.5 text-[10px] leading-tight" style={{ color: "var(--color-text-faint)" }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <span className="font-mono text-xs" style={{ color: "var(--color-text-faint)" }}>SKILL HEATMAP</span>
                    <div className="mt-3"><SkillHeatmap rows={SAMPLE_SKILLS} /></div>
                  </div>

                  <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--color-text-faint)" }}>
                    Enter your GitHub username or upload your resume to see your real report.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── How it works ───────────────────────────────────────────────── */}
          {!showResults && (
            <div className="mt-24">
              <div className="mb-10 text-center">
                <span className="font-mono text-xs tracking-widest" style={{ color: "var(--color-accent)" }}>
                  HOW IT WORKS
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold">Three steps to clarity</h2>
              </div>
              <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Connecting line on desktop */}
                <div className="absolute top-8 left-1/6 right-1/6 hidden h-px sm:block"
                  style={{ background: "linear-gradient(to right, transparent, var(--color-accent-dim), transparent)" }} />
                {[
                  { n: "01", title: "Upload",          desc: "Share your GitHub username, resume PDF, and optionally LinkedIn summary.",         icon: GitBranch },
                  { n: "02", title: "AI Analyzes",     desc: "DevIntel fetches your repos, parses your resume, and sends it all to Groq AI.", icon: Brain  },
                  { n: "03", title: "Get Your Report", desc: "Receive scores, skill gaps, project quality ratings, and actionable next steps.", icon: Zap   },
                ].map(({ n, title, desc, icon: Icon }) => (
                  <div key={n} className="glass glass-hover relative flex flex-col gap-3 rounded-xl p-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: "linear-gradient(135deg,rgba(57,211,83,0.15),rgba(88,166,255,0.1))", border: "1px solid rgba(57,211,83,0.2)" }}>
                      <Icon size={20} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <span className="font-mono text-xs" style={{ color: "var(--color-accent)" }}>{n}</span>
                    <h3 className="font-display text-base font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "var(--color-text-faint)" }}>
          <span>Built with Next.js · Groq AI · GitHub API</span>
          <a href="https://github.com/ZahidHussain775/Devintel-platform"
            target="_blank" rel="noreferrer"
            className="transition-colors hover:text-(--color-text-muted)">
            github.com/ZahidHussain775/Devintel-platform
          </a>
        </div>
      </footer>
    </div>
  );
}