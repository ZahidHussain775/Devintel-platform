import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/groq";
import type { GitHubProfile, ResumeData, AnalysisResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { githubProfile, resumeData, linkedinText, targetRole } = body as {
      githubProfile: GitHubProfile | null;
      resumeData: ResumeData | null;
      linkedinText: string | null;
      targetRole: string | null;
    };

    if (!githubProfile && !resumeData) {
      return NextResponse.json(
        { error: "At least one of githubProfile or resumeData is required" },
        { status: 400 }
      );
    }

    // ── Build GitHub section ──────────────────────────────────────────────────
    let githubSection = "";
    if (githubProfile) {
      const { user, repos, languages, totalStars, totalForks, accountAgeDays, hasReadmeCount, topTopics } = githubProfile;

      const repoSummary = repos.slice(0, 10).map((r) => ({
        name:        r.name,
        description: r.description,
        language:    r.language,
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        topics:      r.topics,
        hasReadme:   r.has_readme,
        size:        r.size,
      }));

      githubSection = `
## GitHub Profile
- Username: ${user.login}
- Account age: ${accountAgeDays} days
- Public repos: ${user.public_repos}
- Followers: ${user.followers}
- Total stars: ${totalStars}
- Total forks: ${totalForks}
- Repos with README: ${hasReadmeCount} of ${repos.length}
- Top topics: ${topTopics.join(", ") || "none"}

## Languages Used
${languages.map((l) => `- ${l.language}: ${l.percentage}%`).join("\n")}

## Top Repositories
${JSON.stringify(repoSummary, null, 2)}
`;
    }

    // ── Build resume section ──────────────────────────────────────────────────
    let resumeSection = "";
    if (resumeData) {
      resumeSection = `
## Resume
- Name: ${resumeData.name ?? "Unknown"}
- Total experience: ${resumeData.totalExperienceYears} years
- Skills detected: ${resumeData.skills.join(", ") || "none"}

### Work Experience
${resumeData.experience.length > 0
  ? resumeData.experience.map((e) => `- ${e.title}${e.company ? ` at ${e.company}` : ""} (${e.duration})`).join("\n")
  : "No experience entries found"}

### Education
${resumeData.education.length > 0
  ? resumeData.education.map((e) => `- ${e.degree}${e.institution ? ` — ${e.institution}` : ""}${e.year ? ` (${e.year})` : ""}`).join("\n")
  : "No education entries found"}

### Resume Raw Text (first 1500 chars)
${resumeData.rawText.slice(0, 1500)}
`;
    }

    // ── Build LinkedIn section ────────────────────────────────────────────────
    const linkedinSection = linkedinText
      ? `\n## LinkedIn Summary\n${linkedinText.slice(0, 800)}\n`
      : "";

    // ── Target role context ───────────────────────────────────────────────────
    const roleContext = targetRole
      ? `\n## Target Role\nThe developer is specifically targeting: "${targetRole}"\nFocus the skill gap analysis and suggestions entirely around what is needed for this role.\n`
      : "";

    // ── Full prompt ───────────────────────────────────────────────────────────
    const prompt = `
You are an expert software engineering evaluator. Analyze this developer's profile and return a JSON assessment.

${githubSection}
${resumeSection}
${linkedinSection}
${roleContext}

## Instructions
Evaluate the developer holistically using ALL data provided above — GitHub activity, resume experience, and LinkedIn if present.
${targetRole ? `The skill gaps and suggestions MUST be specific to the "${targetRole}" role — do not give generic advice.` : ""}
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "overallScore": <number 0-100>,
  "documentationScore": <number 0-100>,
  "consistencyScore": <number 0-100>,
  "languageProficiency": [
    {
      "language": "<string>",
      "level": "<beginner|intermediate|advanced|expert>",
      "evidence": "<one sentence referencing specific repos or resume entries>"
    }
  ],
  "projectQuality": [
    {
      "repoName": "<string>",
      "score": <number 0-10>,
      "strengths": ["<string>"],
      "weaknesses": ["<string>"]
    }
  ],
  "architectureInsights": ["<string>"],
  "skillGaps": [
    {
      "skill": "<string>",
      "importance": "<high|medium|low>",
      "suggestion": "<one actionable sentence>"
    }
  ],
  "summary": "<2-3 sentence overall assessment using all data sources${targetRole ? `, mentioning fit for the ${targetRole} role` : ""}"
}
`;

    const analysis = await generateJSON<AnalysisResult>(prompt);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}