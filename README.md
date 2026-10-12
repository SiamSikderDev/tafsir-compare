# তাফসীর তুলনা — Tafsir Compare

A research-based Quran tafsir platform presenting **Sunni** and **Shia**
interpretations side by side — every claim backed by an exact, verifiable source.
Bengali-first UI, Arabic preserved exactly.

> **Current stage:** foundation only — project setup, MongoDB models, API routes,
> and the admin dashboard. Public browsing pages and seed data come next.

## Tech stack

- Next.js 15 (App Router) + TypeScript (strict) + React 19
- Tailwind CSS v4 · ESLint 9 · Prettier
- MongoDB + Mongoose 8 · Zod validation · bcryptjs password hashing
- Auth.js v5 (next-auth) — Credentials provider, JWT sessions, httpOnly cookies
- Bun 1.4.2 as runtime & package manager · Vercel-ready (standard `next build`)

## Setup

```bash
bun install
cp .env.example .env
# edit .env: set MONGODB_URI (MongoDB Atlas), AUTH_SECRET, NEXTAUTH_URL
bun run dev      # http://localhost:3000
bun run build    # production build (needs no database present)
bun run start
```

### Environment variables

| Variable      | Description                                            |
| ------------- | ------------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string (Atlas recommended)          |
| `AUTH_SECRET` | Long random secret for Auth.js (`openssl rand -base64 32`) |
| `NEXTAUTH_URL`| Public base URL, e.g. `http://localhost:3000`          |

The app connects to MongoDB **lazily** (cached global connection, first DB use
only), so `bun run build` succeeds with no database configured.

## Project structure

```
app/
  api/
    auth/[...nextauth]/route.ts   # Auth.js handlers
    surahs/…  verses/…  search/…  hadiths/…  tafsirs/…   # public GET APIs
    admin/…                                                # auth + role-guarded CRUD
  admin/
    login/  page.tsx (dashboard)  verses/  tafsirs/  hadiths/
    research/  references/  review/  audit-logs/  users/
lib/
  db.ts          # lazy cached Mongoose connection
  auth.ts        # Auth.js v5 Credentials config
  authz.ts       # requireRole() capability guard
  validations.ts # Zod schemas (all API input)
  rate-limit.ts  # 60 req/min/IP in-memory limiter (public APIs)
  audit.ts       # writeAudit() helper
models/          # 8 Mongoose models (User, Surah, Verse, Tafsir, Hadith,
                 #   ResearchNote, Reference, AuditLog)
middleware.ts    # redirects unauthenticated /admin/* → /admin/login
```

## Roles & editorial workflow

Roles: `admin` · `researcher` · `reviewer` · `viewer`

- **researcher / admin** — create & edit drafts (`write`)
- **reviewer / admin** — approve (`review → published`) or send back (`review → draft`)
- **admin** — user management
- **viewer** — read-only (403 on admin APIs)

Status flow: `draft → review → published`, with `review → draft` on rejection.
Every admin mutation is written to `auditLogs` (who, what, before/after, IP).

## Deployment (Vercel)

1. Push to GitHub, import in Vercel.
2. Set the three env vars above in Vercel project settings.
3. Use a MongoDB Atlas cluster (allow Vercel IPs / `0.0.0.0/0`).
4. Deploy — no custom server, standard Next.js output.

## Creating the first admin user

No seed scripts yet (next stage). Until then, insert directly via mongosh —
the password must be a bcrypt hash:

```js
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  passwordHash: "<bcrypt-hash>", // generate: bun -e "console.log(await Bun.password.hash('YourPass123'))"
  role: "admin",
});
```

## License

Private research project. All religious content must be source-verified before
publishing — see the editorial policy in `/about` (upcoming).
