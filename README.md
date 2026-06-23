# DevIntel — AI Developer Intelligence Platform

DevIntel analyzes a developer's GitHub profile, resume, and (optionally)
LinkedIn summary, then uses AI to generate a holistic picture of their
skills and job-readiness.

## What it does

Upload or link:
- A GitHub username
- A resume (PDF)
- A LinkedIn profile summary (pasted text or PDF export)

DevIntel then analyzes:
- Coding skills (languages, frameworks, activity)
- Project quality and architecture (via AI code review)
- Documentation quality (READMEs, comments)

...and generates:
- **Employability Score**
- **Industry Readiness Score**
- **Salary Prediction** (estimate, with caveats)
- **Skill Gap Report** against target roles

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [GitHub REST API](https://docs.github.com/en/rest) for profile/repo data
- [Google Gemini API](https://ai.google.dev/) for AI analysis
- `pdf-parse` for resume text extraction
- [Recharts](https://recharts.org) for score visualizations

## Project status

This project is being built incrementally, feature by feature. See commit
history for progress. Planned milestones:

- [x] Project scaffold
- [x] Landing page UI
- [x] GitHub API integration
- [x] Resume parsing
- [ ] Gemini API integration
- [ ] AI-powered code & architecture analysis
- [ ] Employability / Industry Readiness scoring engine
- [ ] Skill gap report
- [ ] LinkedIn input
- [ ] Results dashboard
- [ ] Deployment + polish

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your API keys
npm run dev
```

Open http://localhost:3000 to view it.

## Environment variables

See `.env.example` for required keys (GitHub token, Gemini API key).
# DevIntel — AI Developer Intelligence Platform

DevIntel analyzes a developer's GitHub profile, resume, and (optionally)
LinkedIn summary, then uses AI to generate a holistic picture of their
skills and job-readiness.

## What it does

Upload or link:
- A GitHub username
- A resume (PDF)
- A LinkedIn profile summary (pasted text or PDF export)

DevIntel then analyzes:
- Coding skills (languages, frameworks, activity)
- Project quality and architecture (via AI code review)
- Documentation quality (READMEs, comments)

...and generates:
- **Employability Score**
- **Industry Readiness Score**
- **Salary Prediction** (estimate, with caveats)
- **Skill Gap Report** against target roles

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [GitHub REST API](https://docs.github.com/en/rest) for profile/repo data
- [Groq API](https://console.groq.com/) (llama-3.3-70b-versatile) for AI analysis
- `pdf-parse` for resume text extraction
- [Recharts](https://recharts.org) for score visualizations

## Project status

This project is being built incrementally, feature by feature. See commit
history for progress. Planned milestones:

- [x] Project scaffold
- [x] Landing page UI
- [x] GitHub API integration
- [x] Resume parsing
- [x] Groq API integration (llama-3.3-70b-versatile)
- [ ] AI-powered code & architecture analysis
- [ ] Employability / Industry Readiness scoring engine
- [ ] Skill gap report
- [ ] LinkedIn input
- [ ] Results dashboard
- [ ] Deployment + polish

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your API keys
npm run dev
```

Open http://localhost:3000 to view it.

## Environment variables

See `.env.example` for required keys (GitHub token, Groq API key).