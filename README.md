# DevIntel — AI Developer Intelligence Platform

> Know exactly where you stand as a developer.

**Live demo:** [devintel-platform.vercel.app](https://devintel-platform.vercel.app/)

DevIntel analyzes a developer's GitHub profile and resume using AI to generate
a honest, data-driven picture of their skills, project quality, and job-readiness.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat&logo=groq&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## What it does

Provide:
- A **GitHub username** — DevIntel fetches your public repos, languages, stars, topics, and account activity
- A **resume PDF** — extracts your skills, experience, and education
- A **target role** (optional) — skill gaps are tailored specifically to that role

DevIntel then generates a full **Developer Intelligence Report**:

| Score | What it measures |
|---|---|
| Overall Score | Holistic developer rating |
| Employability Score | How hireable you look right now |
| Industry Readiness | How close you are to production-level work |
| Documentation Score | Quality of READMEs and code comments |
| Consistency Score | Activity and commit hygiene across repos |

Plus:
- **Skill Heatmap** — visual proficiency map with score and level per language
- **Language Proficiency** — per-language level (Beginner → Expert) with evidence
- **Project Quality** — per-repo score with strengths, weaknesses, and grade (A–D)
- **Architecture Insights** — AI observations about how you structure code
- **Skill Gap Report** — what's missing and actionable next steps, role-specific

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + glassmorphism + custom animations |
| AI | Groq API — `llama-3.3-70b-versatile` (128k context, free tier) |
| Data | GitHub REST API |
| Resume parsing | `unpdf` (serverless-safe, no DOM dependencies) |
| PDF export | `react-to-print` |
| Icons | `lucide-react` |
| Fonts | Space Grotesk · Inter · JetBrains Mono |
| Deployment | Vercel |

---

## Features

- **Full-screen loading overlay** with step indicators (GitHub → Resume → AI)
- **Animated glassmorphism UI** — dot-grid background, noise texture, gradient text
- **Staggered card animations** on page load
- **Input glow on focus** with green accent
- **Floating preview card** with scanline animation in idle state
- **Circular score rings** with SVG arc animation and grade labels
- **Animated progress bars** on project quality and language proficiency
- **Skill heatmap** with per-row score + level badge
- **Skeleton loaders** for GitHub, resume, and AI analysis cards
- **Export report as PDF** via browser print
- **Clear / reset** per data source without full page reload
- **Target role chips** for quick role selection

---

## Project status

- [x] Project scaffold + design system
- [x] Landing page UI with animations
- [x] GitHub API integration (profile, repos, languages, topics)
- [x] Resume PDF parsing (skills, experience, education extraction)
- [x] Groq API integration (`llama-3.3-70b-versatile`)
- [x] AI-powered code & architecture analysis
- [x] Employability / Industry Readiness scoring
- [x] Skill gap report (role-specific)
- [x] Skill heatmap from real AI data
- [x] Full-screen loading + skeleton loaders
- [x] Full-screen analysis report view
- [x] Export report as PDF
- [x] Clear / reset per data source
- [x] Target role input with quick-select chips
- [x] Glassmorphism UI redesign with animations
- [x] Deployment to Vercel

---

## Getting started

```bash
git clone https://github.com/ZahidHussain775/Devintel-platform.git
cd Devintel-platform
npm install
cp .env.example .env.local   # fill in your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

```env
GITHUB_TOKEN=        # https://github.com/settings/tokens (public_repo scope)
GROQ_API_KEY=        # https://console.groq.com (free tier, no credit card)
```

See `.env.example` for the full list.

---

## Project structure

```
app/
  page.tsx                    # Main UI — inputs, loading, report view
  globals.css                 # Design tokens, animations, glassmorphism
  layout.tsx                  # Fonts, metadata
  api/
    github/route.ts           # Fetches GitHub profile + repos + languages
    resume/route.ts           # Parses PDF resume with unpdf
    analyze/route.ts          # Groq AI analysis with role-specific prompting
    groq-test/route.ts        # Connection health check

components/
  AnalysisReport.tsx          # Full AI report — score rings, heatmap, gaps
  GitHubStats.tsx             # GitHub profile card
  ResumeStats.tsx             # Parsed resume card
  ReportSkeleton.tsx          # Skeleton loaders for all cards
  SkillHeatmap.tsx            # Animated skill heatmap
  UploadCard.tsx              # Glassmorphism input step card
  GeminiStatus.tsx            # Groq connection status badge

lib/
  groq.ts                     # Groq client — generateText / generateJSON
  resumeParser.ts             # PDF text → structured ResumeData
  types.ts                    # Shared TypeScript types
```

---

## Author

Built by [Zahid Hussain](https://github.com/ZahidHussain775) — BSCS Batch 2022, Sukkur IBA University.git add README.md