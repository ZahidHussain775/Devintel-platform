import type { GitHubProfile } from "@/lib/types";
import Image from "next/image";
import {
  Star,
  GitFork,
  BookOpen,
  Users,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

export function GitHubStats({ profile }: { profile: GitHubProfile }) {
  const { user, repos, languages, totalStars, totalForks, topTopics, accountAgeDays } =
    profile;

  const accountYears = (accountAgeDays / 365).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      {/* User card */}
      <div className="flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
        <Image
          src={user.avatar_url}
          alt={user.login}
          width={56}
          height={56}
          className="rounded-full border border-(--color-border)"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold truncate">
              {user.name ?? user.login}
            </span>
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-(--color-text-faint) hover:text-(--color-text)"
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <span className="font-mono text-xs text-(--color-text-muted)">
            @{user.login}
          </span>
          {user.bio && (
            <p className="mt-1 text-xs text-(--color-text-muted) line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip icon={BookOpen} label="Repos" value={user.public_repos} />
        <StatChip icon={Star} label="Stars" value={totalStars} />
        <StatChip icon={GitFork} label="Forks" value={totalForks} />
        <StatChip icon={Users} label="Followers" value={user.followers} />
      </div>

      {/* Account age */}
      <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
        <CalendarDays size={13} />
        <span>
          GitHub account active for{" "}
          <span className="text-(--color-text)">{accountYears} years</span>
        </span>
      </div>

      {/* Language breakdown */}
      {languages.length > 0 && (
        <div>
          <span className="font-mono text-xs text-(--color-text-faint)">
            LANGUAGES
          </span>
          {/* Stacked bar */}
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full">
            {languages.map((lang) => (
              <div
                key={lang.language}
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
                title={`${lang.language} ${lang.percentage}%`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {languages.slice(0, 6).map((lang) => (
              <div key={lang.language} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-xs text-(--color-text-muted)">
                  {lang.language}
                </span>
                <span className="font-mono text-xs text-(--color-text-faint)">
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top topics */}
      {topTopics.length > 0 && (
        <div>
          <span className="font-mono text-xs text-(--color-text-faint)">
            TOP TOPICS
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {topTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-0.5 font-mono text-xs text-(--color-blue)"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent repos */}
      <div>
        <span className="font-mono text-xs text-(--color-text-faint)">
          RECENT REPOS
        </span>
        <div className="mt-2 flex flex-col gap-2">
          {repos.slice(0, 5).map((repo) => (
            <a
              key={repo.name}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-3 rounded-md border border-(--color-border) bg-(--color-surface) p-3 transition-colors hover:border-(--color-accent-dim)"
            >
              <div className="min-w-0">
                <span className="font-mono text-sm text-(--color-blue) group-hover:underline">
                  {repo.name}
                </span>
                {repo.description && (
                  <p className="mt-0.5 text-xs text-(--color-text-muted) line-clamp-1">
                    {repo.description}
                  </p>
                )}
                {repo.topics.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-(--color-surface-2) px-1.5 py-px font-mono text-[10px] text-(--color-text-faint)"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-(--color-text-faint)">
                {repo.language && (
                  <span className="font-mono">{repo.language}</span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={11} />
                    {repo.stargazers_count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-(--color-border) bg-(--color-surface) p-3">
      <div className="flex items-center gap-1.5 text-(--color-text-faint)">
        <Icon size={12} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-mono text-lg font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
