import type { ResumeData } from "@/lib/types";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code2,
  Clock,
} from "lucide-react";

export function ResumeStats({ resume }: { resume: ResumeData }) {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Personal info ───────────────────────────────────────── */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
        <span className="font-mono text-xs text-(--color-text-faint)">
          CANDIDATE
        </span>
        <div className="mt-3 flex flex-col gap-2">

          {/* Name */}
          {resume.name && (
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0 text-(--color-accent)" />
              <span className="font-display text-base font-semibold">
                {resume.name}
              </span>
            </div>
          )}

          {/* Email */}
          {resume.email && (
            <div className="flex items-center gap-2">
              <Mail size={13} className="shrink-0 text-(--color-text-faint)" />
              <span className="text-sm text-(--color-text-muted)">
                {resume.email}
              </span>
            </div>
          )}

          {/* Phone */}
          {resume.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} className="shrink-0 text-(--color-text-faint)" />
              <span className="text-sm text-(--color-text-muted)">
                {resume.phone}
              </span>
            </div>
          )}

          {/* Experience years */}
          {resume.totalExperienceYears > 0 && (
            <div className="flex items-center gap-2">
              <Clock size={13} className="shrink-0 text-(--color-text-faint)" />
              <span className="text-sm text-(--color-text-muted)">
                ~{resume.totalExperienceYears} year
                {resume.totalExperienceYears !== 1 ? "s" : ""} of experience
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Skills detected ──────────────────────────────────────── */}
      {resume.skills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={13} className="text-(--color-accent)" />
            <span className="font-mono text-xs text-(--color-text-faint)">
              SKILLS DETECTED ({resume.skills.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-0.5 font-mono text-xs text-(--color-blue)"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Work experience ──────────────────────────────────────── */}
      {resume.experience.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={13} className="text-(--color-accent)" />
            <span className="font-mono text-xs text-(--color-text-faint)">
              EXPERIENCE
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {resume.experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-md border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-(--color-text)">
                      {exp.title}
                    </span>
                    {exp.company && (
                      <span className="text-sm text-(--color-text-muted)">
                        {" "}at {exp.company}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-(--color-text-faint)">
                    {exp.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ────────────────────────────────────────────── */}
      {resume.education.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={13} className="text-(--color-accent)" />
            <span className="font-mono text-xs text-(--color-text-faint)">
              EDUCATION
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {resume.education.map((edu, i) => (
              <div
                key={i}
                className="rounded-md border border-(--color-border) bg-(--color-surface) p-3"
              >
                <span className="text-sm font-semibold text-(--color-text)">
                  {edu.degree}
                </span>
                {edu.institution && (
                  <p className="mt-0.5 text-xs text-(--color-text-muted)">
                    {edu.institution}
                    {edu.year && ` · ${edu.year}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No data fallback ─────────────────────────────────────── */}
      {resume.skills.length === 0 &&
        resume.experience.length === 0 &&
        resume.education.length === 0 && (
          <p className="text-sm text-(--color-text-muted)">
            Could not extract structured data from this PDF. The AI analysis
            step will still read the full raw text directly.
          </p>
        )}
    </div>
  );
}
