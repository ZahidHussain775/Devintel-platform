import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/groq";
import type { GitHubProfile } from "@/lib/types";
import type { CodeAnalysis } from "@/lib/analysisTypes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { githubProfile, resumeText } = body as {
      githubProfile: GitHubProfile;
      resumeText?: string;
    };

    if (!githubProfile) {
      return NextResponse.json(
        { error: "githubProfile is required" },
        { status: 400 }
      );
    }

    const { user, repos, languages, totalStars, totalForks, accountAgeDays, hasReadmeCount, topTopics } = githubProfile;

    // Build a compact summary of the profile to send to Groq
    const repoSummary = repos.slice(0, 10).map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      topics: r.topics,
      hasReadme: r.has_readme,
      size: r.size,
    }));

    const prompt = `
You are an expert software engineering evaluator. Analyze this developer's GitHub profile and resume, then return a JSON object with your assessment.

## Developer Profile
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

${resumeText ? `## Resume Text\n${resumeText.slice(0, 2000)}` : ""}

## Instructions
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "overallScore": <number 0-100>,
  "languageProficiency": [
    {
      "language": "<string>",
      "level": "<beginner|intermediate|advanced>",
      "evidence": "<one sentence>"
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
  "documentationScore": <number 0-100>,
  "consistencyScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>"
}
`;

    const analysis = await generateJSON<CodeAnalysis>(prompt);

    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}