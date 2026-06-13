// GitHub API types

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
