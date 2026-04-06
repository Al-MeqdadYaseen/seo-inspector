# SEO Vision

An interactive SEO meta tag visualizer that fetches any website's HTML, parses its meta tags, and renders live visual previews of how the page appears on Google Search, Facebook, and Twitter/X — alongside actionable recommendations.

## Features

- **Live URL Analysis** — Enter any URL (with or without `https://`) and get instant results
- **Google Search Preview** — Pixel-faithful rendering of how your page appears in Google search results, including favicon, display URL, title, and description
- **Social Card Previews** — Facebook (Open Graph) and Twitter/X card previews side by side
- **SEO Issue Reports** — Categorized errors, warnings, and info items covering title length, description length, OG tags, Twitter cards, and more
- **Analysis History** — Last 10 analyses stored in PostgreSQL, accessible from the History page
- **Dark Mode** — Full dark/light theme support with system preference detection

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL via Drizzle ORM |
| HTML Parsing | Cheerio |
| HTTP Client | Axios |
| Validation | Zod |
| Forms | React Hook Form |
| Data Fetching | TanStack Query v5 |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session signing |

### Database Setup

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

The app runs on port 5000. The Vite dev server and Express backend are served on the same port.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
├── client/               # React frontend (Vite)
│   └── src/
│       ├── components/   # UI and feature components
│       │   ├── layout/   # Header
│       │   ├── previews/ # Google and Social card previews
│       │   └── results/  # Issue list
│       ├── hooks/        # Custom hooks (use-seo, use-theme, use-toast)
│       ├── pages/        # Home, History, NotFound
│       └── lib/          # QueryClient, utilities
├── server/               # Express backend
│   ├── routes.ts         # API endpoints + HTML parsing logic
│   ├── storage.ts        # Database access layer
│   └── db.ts             # Drizzle DB connection
├── shared/               # Shared types and API contracts
│   ├── schema.ts         # Database schema (Drizzle + Zod)
│   └── routes.ts         # API path and schema definitions
└── script/               # Build scripts
```

## API

### `POST /api/analyze`

Fetches the given URL, parses meta tags, and returns structured SEO data with issues.

**Request body:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "url": "https://example.com",
  "title": "...",
  "description": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "ogImage": "...",
  "twitterCard": "summary_large_image",
  "twitterTitle": "...",
  "twitterDescription": "...",
  "twitterImage": "...",
  "favicon": "...",
  "issues": [
    { "type": "error", "message": "Missing meta description.", "tag": "description" }
  ]
}
```

### `GET /api/history`

Returns the 10 most recent analyses.

## SEO Checks Performed

| Tag | What is checked |
|---|---|
| `<title>` | Presence, length (optimal: 50–60 chars) |
| `meta[description]` | Presence, length (optimal: 150–160 chars) |
| `og:title` | Presence |
| `og:description` | Presence |
| `og:image` | Presence |
| `twitter:card` | Presence and type |

## License

MIT
