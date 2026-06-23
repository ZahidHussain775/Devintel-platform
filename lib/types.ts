// ─── Resume types ─────────────────────────────────────────────────────────────

export type ResumeData = {
  rawText: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  totalExperienceYears: number;
};

export type ExperienceEntry = {
  title: string;
  company: string;
  duration: string;
};

export type EducationEntry = {
  degree: string;
  institution: string;
  year: string;
};

// ─── GitHub API types ─────────────────────────────────────────────────────────

export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
};

export type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  has_readme: boolean;
  size: number;
  open_issues_count: number;
};

export type LanguageStat = {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
};

export type GitHubProfile = {
  user: GitHubUser;
  repos: GitHubRepo[];
  languages: LanguageStat[];
  totalStars: number;
  totalForks: number;
  topTopics: string[];
  accountAgeDays: number;
  hasReadmeCount: number;
};

// ─── AI Analysis types ────────────────────────────────────────────────────────

export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type LanguageProficiency = {
  language: string;
  level: ProficiencyLevel;
  evidence: string;
};

export type ProjectQuality = {
  repoName: string;
  score: number; // 0–10
  strengths: string[];
  weaknesses: string[];
};

export type SkillGap = {
  skill: string;
  importance: "high" | "medium" | "low";
  suggestion: string;
};

export type AnalysisResult = {
  overallScore: number;          // 0–100
  documentationScore: number;    // 0–100
  consistencyScore: number;      // 0–100
  languageProficiency: LanguageProficiency[];
  projectQuality: ProjectQuality[];
  architectureInsights: string[];
  skillGaps: SkillGap[];
  summary: string;
};
