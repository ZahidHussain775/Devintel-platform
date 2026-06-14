import type { ResumeData, ExperienceEntry, EducationEntry } from "./types";

// ─── Skill keyword dictionary ────────────────────────────────────────────────
// We scan the raw text for these keywords (case-insensitive).
// Grouped by category so we can later map them to skill areas for the heatmap.

const SKILL_KEYWORDS = [
  // Languages
  "javascript", "typescript", "python", "java", "kotlin", "swift",
  "c++", "c#", "go", "rust", "php", "ruby", "dart", "scala", "r",
  // Frontend
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "html", "css",
  "tailwind", "bootstrap", "sass", "scss", "jquery", "redux", "zustand",
  "vite", "webpack",
  // Backend
  "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring",
  "laravel", "graphql", "rest", "restful", "api",
  // Mobile
  "react native", "flutter", "android", "ios", "expo",
  // Databases
  "mongodb", "postgresql", "mysql", "sqlite", "firebase", "supabase",
  "redis", "prisma", "mongoose",
  // Cloud / DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "github actions",
  "vercel", "netlify", "linux", "nginx",
  // AI / Data
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
  "numpy", "scikit-learn", "llm", "openai", "langchain",
  // Tools
  "git", "github", "figma", "jira", "postman", "vs code",
];

// ─── Section header patterns ──────────────────────────────────────────────────
// These regexes detect common resume section headings so we can split the text.

const EXPERIENCE_HEADERS = /\b(experience|work history|employment|professional background)\b/i;
const EDUCATION_HEADERS  = /\b(education|academic|qualification|degree)\b/i;
const SKILLS_HEADERS     = /\b(skills|technologies|tech stack|competencies|tools)\b/i;

// ─── Helper: extract email ────────────────────────────────────────────────────
function extractEmail(text: string): string | null {
  // Standard email regex — matches most real-world email formats
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// ─── Helper: extract phone ────────────────────────────────────────────────────
function extractPhone(text: string): string | null {
  // Matches common formats: +92-300-1234567, (300) 123-4567, 03001234567
  const match = text.match(/(\+?\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}/);
  return match ? match[0].trim() : null;
}

// ─── Helper: extract name ─────────────────────────────────────────────────────
function extractName(text: string): string | null {
  // Most resumes start with the candidate's name on the first 1-2 lines.
  // We take the first non-empty line that isn't an email, phone, or URL.
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    const isEmail   = /@/.test(line);
    const isPhone   = /\d{7,}/.test(line);
    const isUrl     = /https?:\/\/|www\./.test(line);
    const isTooLong = line.length > 60;
    if (!isEmail && !isPhone && !isUrl && !isTooLong) {
      return line;
    }
  }
  return null;
}

// ─── Helper: extract skills ───────────────────────────────────────────────────
function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  // Filter the keyword list to only those that appear in the resume text
  return SKILL_KEYWORDS.filter(skill => lower.includes(skill));
}

// ─── Helper: estimate years of experience ────────────────────────────────────
function estimateExperienceYears(text: string): number {
  // Look for year ranges like "2019 - 2023" or "2020 – Present"
  const yearPattern = /\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/gi;
  const matches = [...text.matchAll(yearPattern)];
  const currentYear = new Date().getFullYear();
  let totalYears = 0;

  for (const match of matches) {
    const start = parseInt(match[1]);
    const endRaw = match[2].toLowerCase();
    const end = endRaw === "present" || endRaw === "current"
      ? currentYear
      : parseInt(match[2]);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalYears += end - start;
    }
  }
  return totalYears;
}

// ─── Helper: extract experience entries ──────────────────────────────────────
function extractExperience(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];

  // Look for lines containing a year range — these are usually job entries
  // Pattern: anything on the same line as "YYYY - YYYY" or "YYYY - Present"
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const yearMatch = line.match(/\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/i);

    if (yearMatch) {
      // The line with the year range is usually the title/company line,
      // or the lines just above it are.
      const duration = yearMatch[0];
      const withoutYear = line.replace(yearMatch[0], "").trim();

      // Try to split "Title at Company" or "Title | Company" or "Title - Company"
      const splitMatch = withoutYear.match(/^(.+?)\s*(at|@|\||-|–)\s*(.+)$/i);

      if (splitMatch) {
        entries.push({
          title:    splitMatch[1].trim(),
          company:  splitMatch[3].trim(),
          duration,
        });
      } else if (withoutYear.length > 0) {
        // Can't split cleanly — use the whole line as the title
        entries.push({
          title:    withoutYear,
          company:  "",
          duration,
        });
      }
    }
  }

  return entries.slice(0, 6); // cap at 6 entries
}

// ─── Helper: extract education entries ───────────────────────────────────────
function extractEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const degreePattern = /\b(bachelor|master|b\.?s\.?|m\.?s\.?|b\.?e\.?|m\.?e\.?|phd|ph\.d|bsc|msc|mba|b\.tech|m\.tech)\b/gi;
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (degreePattern.test(line)) {
      degreePattern.lastIndex = 0; // reset regex state after .test()

      // Look for a year on this line or the next line
      const yearMatch = (line + " " + (lines[i + 1] ?? "")).match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? yearMatch[0] : "";

      // Next line often has the institution name
      const institution = lines[i + 1]?.trim() ?? "";

      entries.push({
        degree: line,
        institution: institution.length < 80 ? institution : "",
        year,
      });
    }
  }

  return entries.slice(0, 3);
}

// ─── Main parser ──────────────────────────────────────────────────────────────
export function parseResumeText(rawText: string): ResumeData {
  // Normalise whitespace — PDFs often have irregular spacing
  const text = rawText.replace(/\r\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();

  return {
    rawText:              text,
    name:                 extractName(text),
    email:                extractEmail(text),
    phone:                extractPhone(text),
    skills:               extractSkills(text),
    experience:           extractExperience(text),
    education:            extractEducation(text),
    totalExperienceYears: estimateExperienceYears(text),
  };
}

// Export skill keywords so the AI step can reuse them
export { SKILL_KEYWORDS, EXPERIENCE_HEADERS, EDUCATION_HEADERS, SKILLS_HEADERS };
