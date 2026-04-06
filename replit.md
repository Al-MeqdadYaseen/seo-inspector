# SEO Vision — Project Overview

## Purpose

A full-stack SEO meta tag visualizer. Users enter any URL and get:
- A Google Search result preview
- Facebook and Twitter/X social card previews
- A detailed SEO issues report (errors, warnings, info)
- A history of past analyses

## Architecture

**Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query v5, React Hook Form + Zod, Wouter for routing.

**Backend**: Node.js + Express. Fetches target URLs using Axios (with `rejectUnauthorized: false` for broad compatibility), parses HTML with Cheerio, and stores results in PostgreSQL.

**Shared**: `shared/schema.ts` defines the Drizzle schema and Zod types. `shared/routes.ts` defines the API contract used by both the backend and frontend.

## Key Files

| File | Role |
|---|---|
| `client/src/pages/Home.tsx` | Main page — URL input, results display |
| `client/src/pages/History.tsx` | History list page |
| `client/src/components/previews/GooglePreview.tsx` | Google SERP card |
| `client/src/components/previews/SocialPreview.tsx` | Facebook + Twitter card previews |
| `client/src/components/results/IssueList.tsx` | SEO issues report |
| `client/src/hooks/use-seo.ts` | `useAnalyze` and `useHistory` hooks |
| `client/src/hooks/use-theme.ts` | Light/dark mode state management |
| `server/routes.ts` | `/api/analyze` and `/api/history` endpoints |
| `server/storage.ts` | `DatabaseStorage` — Drizzle CRUD operations |
| `shared/schema.ts` | `analysis_results` table schema |

## Database

PostgreSQL via Drizzle ORM. Single table: `analysis_results`.

Run `npm run db:push` after schema changes.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `SESSION_SECRET` — Used for session signing

## Running

- Development: `npm run dev` (Express + Vite on port 5000)
- Build: `npm run build`
- Start (production): `npm run start`

## URL Normalization

Both the frontend and backend normalize URLs before fetching:
1. Strip any existing protocol (including malformed `http:\\`, `https:\\`)
2. Strip leading slashes
3. Prepend `https://`
4. Validate hostname contains a dot

## Notable Design Decisions

- `rejectUnauthorized: false` on the HTTPS agent so the analyzer works with sites that have certificate issues in the Replit sandbox
- `maxContentLength: 5MB` to prevent memory issues on large HTML pages
- History limited to 10 most recent entries
- Errors are shown to the user via toast notifications (not just logged to console)
