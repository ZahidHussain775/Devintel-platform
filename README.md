# DevIntel — AI Developer Intelligence Platform

> Know exactly where you stand as a developer.

DevIntel analyzes a developer's GitHub profile and resume using AI to generate
a honest, data-driven picture of their skills, project quality, and job-readiness.

---

## What it does

Provide:
- A **GitHub username** — DevIntel fetches your public repos, languages, stars, topics, and account activity
- A **resume PDF** — extracts your skills, experience, and education
- A **LinkedIn summary** (optional) — paste your headline and about section

DevIntel then generates:
- **Overall Score** — holistic developer rating
- **Employability Score** — how hireable you look right now
- **Industry Readiness Score** — how close you are to production-level work
- **Documentation Score** — quality of your READMEs and code comments
- **Consistency Score** — activity and commit hygiene across repos
- **Skill Heatmap** — visual proficiency map across languages and skill areas
- **Language Proficiency** — per-language level with evidence from your repos
- **Project Quality** — per-repo score with strengths and weaknesses
- **Architecture Insights** — AI observations about how you structure code
- **Skill Gap Report** — what's missing and what to learn next

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Data | GitHub REST API |
| Resume parsing | `pdf-parse` |
| Icons | `lucide-react` |
| Fonts | Space Grotesk · Inter · JetBrains Mono |

---

## Project status

Being built incrementally, one feature at a time.

- [x] Project scaffold + design system
- [x] Landing page UI
- [x] GitHub API integration (profile, repos, languages, topics)
- [x] Resume PDF parsing (skills, experience, education extraction)
- [x] Groq API integration (`llama-3.3-70b-versatile`)
- [x] AI-powered code & architecture analysis
- [x] Employability / Industry Readiness scoring
- [x] Skill gap report
- [x] Skill heatmap from real AI data
- [x] Full-screen loading overlay with step indicators
- [x] Full-screen analysis report view
- [x] Clear / reset per data source
- [ ] Target role input (role-specific skill gap analysis)
- [ ] Export report as PDF
- [ ] Loading skeletons
- [ ] Deployment to Vercel

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
GROQ_API_KEY=        # https://console.groq.com
```

See `.env.example` for the full list.

---

## Project structure

```
app/
  page.tsx                  # Main UI — inputs, loading overlay, report view
  api/
    github/route.ts         # Fetches GitHub profile + repos + languages
    resume/route.ts         # Parses PDF resume
    analyze/route.ts        # Runs Groq AI analysis
    groq-test/route.ts      # Connection health check

components/
  AnalysisReport.tsx        # Full AI report — scores, heatmap, gaps
  GitHubStats.tsx           # GitHub profile card
  ResumeStats.tsx           # Parsed resume card
  SkillHeatmap.tsx          # Animated skill heatmap
  UploadCard.tsx            # Input step card wrapper
  GeminiStatus.tsx          # Groq connection status badge

lib/
  groq.ts                   # Groq client — generateText / generateJSON
  resumeParser.ts           # PDF text → structured ResumeData
  types.ts                  # Shared TypeScript types
```

---

Built by [Zahid Hussain](https://github.com/ZahidHussain775) — BSCS 2022, Sukkur IBA University.