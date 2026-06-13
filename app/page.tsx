"use client";

import { useState } from "react";
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
} from "lucide-react";
import { UploadCard } from "@/components/UploadCard";
import { SkillHeatmap, type SkillRow } from "@/components/SkillHeatmap";

const SAMPLE_SKILLS: SkillRow[] = [
  { label: "Frontend", values: [2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3] },
  { label: "Backend", values: [3, 3, 2, 3, 4, 3, 3, 4, 3, 3, 2, 3] },
  { label: "Architecture", values: [1, 2, 2, 3, 2, 3, 2, 3, 2, 2, 3, 2] },
  { label: "Documentation", values: [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4] },
  { label: "Testing", values: [1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1] },
  { label: "DevOps", values: [2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 2] },
];

export default function Home() {
  const [githubUsername, setGithubUsername] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinText, setLinkedinText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const canAnalyze = githubUsername.trim().length > 0;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setStatus(
      "Analysis engine is being built step by step — check the README roadmap for progress. Your inputs aren't sent anywhere yet."
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-(--color-canvas)">
      {/* Header */}
      <header className="border-b border-(--color-border)">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-accent) text-(--color-canvas)">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              DevIntel
            </span>
          </div>
          <a
            href="https://github.com/ZahidHussain775/Devintel-platform"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-(--color-text-muted) transition-colors hover:text-(--color-text)"
          >
            <Code2 size={18} />
            <span className="hidden sm:inline">View source</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex-1 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: pitch + inputs */}
            <div>
              <span className="font-mono text-xs tracking-widest text-(--color-accent)">
                AI DEVELOPER INTELLIGENCE
              </span>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Know exactly where you stand as a developer.
              </h1>
              <p className="mt-4 max-w-lg text-(--color-text-muted)">
                Upload your GitHub profile, resume, and LinkedIn summary.
                DevIntel reads your code, not just your keywords, and turns
                it into a clear, honest picture of your skills, gaps, and
                readiness for the job market.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <UploadCard
                  icon={FolderGit2}
                  step="01"
                  title="GitHub profile"
                  description="We'll analyze your public repos, code structure, and documentation."
                >
                  <div className="flex items-center rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 focus-within:border-(--color-accent-dim)">
                    <span className="font-mono text-sm text-(--color-text-faint)">
                      github.com/
                    </span>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="your-username"
                      className="w-full bg-transparent font-mono text-sm text-(--color-text) outline-none placeholder:text-(--color-text-faint)"
                    />
                  </div>
                </UploadCard>

                <UploadCard
                  icon={FileUp}
                  step="02"
                  title="Resume"
                  description="PDF format. Used to cross-reference your stated skills and experience."
                >
                  <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-accent-dim)">
                    <span className="truncate">
                      {resumeFile ? resumeFile.name : "Choose a PDF file"}
                    </span>
                    <span className="ml-3 shrink-0 font-mono text-xs text-(--color-accent)">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </UploadCard>

                <UploadCard
                  icon={IdCard}
                  step="03"
                  title="LinkedIn summary"
                  description="Optional. Paste your headline and about section text."
                >
                  <textarea
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="Paste your LinkedIn headline and summary here..."
                    rows={2}
                    className="w-full resize-none rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-text) outline-none placeholder:text-(--color-text-faint) focus:border-(--color-accent-dim)"
                  />
                </UploadCard>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className="flex items-center justify-center gap-2 rounded-md bg-(--color-accent) px-5 py-3 text-sm font-semibold text-(--color-canvas) transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Analyze my profile
                  <ArrowRight size={16} />
                </button>
                {status && (
                  <p className="text-xs text-(--color-text-muted)">
                    {status}
                  </p>
                )}
              </div>
            </div>

            {/* Right: sample report preview */}
            <div className="relative overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
              <div className="scanline pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-(--color-accent)/10 to-transparent" />

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-widest text-(--color-text-faint)">
                  EXAMPLE OUTPUT
                </span>
                <span className="font-mono text-xs text-(--color-text-faint)">
                  octocat
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <ScoreBadge icon={Gauge} label="Employability" value="78" />
                <ScoreBadge icon={Target} label="Industry Ready" value="82" />
                <ScoreBadge icon={ListChecks} label="Skill Gaps" value="3" />
              </div>

              <div className="mt-6">
                <span className="font-mono text-xs text-(--color-text-faint)">
                  SKILL HEATMAP
                </span>
                <div className="mt-3">
                  <SkillHeatmap rows={SAMPLE_SKILLS} />
                </div>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-(--color-text-muted)">
                Each row reflects activity and quality signals across your
                repositories — denser, brighter cells mean stronger,
                more consistent evidence of that skill.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-20 border-t border-(--color-border) pt-12">
            <h2 className="font-display text-2xl font-semibold">
              How it works
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Step
                number="01"
                title="Upload"
                description="Share your GitHub username, resume, and (optionally) LinkedIn summary."
              />
              <Step
                number="02"
                title="AI analyzes"
                description="DevIntel reads your repos, code structure, docs, and resume to build a profile."
              />
              <Step
                number="03"
                title="Get your report"
                description="Receive scores, a skill gap report, and clear next steps to improve."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--color-border)">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-(--color-text-faint) sm:flex-row sm:items-center sm:justify-between">
          <span>Built incrementally, one feature at a time.</span>
          <a
            href="https://github.com/ZahidHussain775/Devintel-platform"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-(--color-text-muted)"
          >
            github.com/ZahidHussain775/Devintel-platform
          </a>
        </div>
      </footer>
    </div>
  );
}

function ScoreBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-(--color-border) bg-(--color-canvas) p-3">
      <Icon size={14} className="text-(--color-accent)" />
      <div className="mt-2 font-mono text-xl font-semibold">{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-(--color-text-muted)">
        {label}
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-(--color-accent)">
        {number}
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-sm text-(--color-text-muted)">{description}</p>
    </div>
  );
}
