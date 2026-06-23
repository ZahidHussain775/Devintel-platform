export interface CodeAnalysis {
  overallScore: number; // 0-100
  languageProficiency: {
    language: string;
    level: "beginner" | "intermediate" | "advanced";
    evidence: string;
  }[];
  projectQuality: {
    repoName: string;
    score: number; // 0-10
    strengths: string[];
    weaknesses: string[];
  }[];
  architectureInsights: string[];
  documentationScore: number; // 0-100
  consistencyScore: number; // 0-100 (commit regularity, activity)
  summary: string;
}