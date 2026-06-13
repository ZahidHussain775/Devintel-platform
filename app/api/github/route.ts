import { NextRequest, NextResponse } from "next/server";
import type { GitHubProfile, GitHubRepo, LanguageStat } from "@/lib/types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#fa7343",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function ghFetch(url: string) {
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } });
  if (res.status === 404) throw new Error("GitHub user not found");
  if (res.status === 403) throw new Error("GitHub rate limit exceeded — add a GITHUB_TOKEN to your .env.local");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  try {
    // Fetch user profile
    const user = await ghFetch(`https://api.github.com/users/${username}`);

    // Fetch up to 100 public repos, sorted by most recently updated
    const repos = await ghFetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    );

    // Aggregate language bytes across all repos concurrently (limit to 30 repos)
    const reposToAnalyze = repos.slice(0, 30);
    const languageMaps = await Promise.all(
      reposToAnalyze.map((repo: { name: string }) =>
        ghFetch(`https://api.github.com/repos/${username}/${repo.name}/languages`).catch(
          () => ({})
        )
      )
    );

    const languageTotals: Record<string, number> = {};
    for (const lmap of languageMaps) {
      for (const [lang, bytes] of Object.entries(lmap as Record<string, number>)) {
        languageTotals[lang] = (languageTotals[lang] ?? 0) + bytes;
      }
    }

    const totalBytes = Object.values(languageTotals).reduce((a, b) => a + b, 0);
    const languages: LanguageStat[] = Object.entries(languageTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
        color: LANGUAGE_COLORS[language] ?? "#6e7681",
      }));

    // Enrich repos with presence of README (we check topics & size as proxies)
    const enrichedRepos: GitHubRepo[] = repos.slice(0, 30).map(
      (r: {
        name: string;
        description: string | null;
        html_url: string;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        updated_at: string;
        topics: string[];
        size: number;
        open_issues_count: number;
      }) => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
        topics: r.topics ?? [],
        has_readme: r.size > 0, // repos with content almost always have a README
        size: r.size,
        open_issues_count: r.open_issues_count,
      })
    );

    // Aggregate stats
    const totalStars = repos.reduce(
      (sum: number, r: { stargazers_count: number }) => sum + r.stargazers_count,
      0
    );
    const totalForks = repos.reduce(
      (sum: number, r: { forks_count: number }) => sum + r.forks_count,
      0
    );

    const topicCounts: Record<string, number> = {};
    for (const repo of repos) {
      for (const topic of (repo.topics ?? []) as string[]) {
        topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
      }
    }
    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([t]) => t);

    const accountAgeDays = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const hasReadmeCount = enrichedRepos.filter((r) => r.has_readme).length;

    const profile: GitHubProfile = {
      user,
      repos: enrichedRepos,
      languages,
      totalStars,
      totalForks,
      topTopics,
      accountAgeDays,
      hasReadmeCount,
    };

    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
