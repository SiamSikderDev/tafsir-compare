# Seed scripts — Tafsir Compare

Database seeding for the Tafsir Compare platform. Run with Bun:

```bash
bun scripts/seed-surahs.ts
```

All scripts are **idempotent**: re-running them updates existing documents
instead of creating duplicates. `MONGODB_URI` must be set (Bun loads `.env`
automatically).

## Scripts

| Script | Data file | What it does |
|---|---|---|
| `seed-surahs.ts` | embedded in `../lib/surah-metadata.ts` | Inserts the 114 surah metadata documents. Skips when the collection is non-empty (use `--force` to upsert by surah number). |
| `seed-verses.ts` | `data/verses.json` | Upserts verses on `{ surahNumber, ayahNumber }`. |
| `seed-sample-tafsirs.ts` | `data/tafsirs.json` | Upserts tafsir entries on `{ verseId, school, bookTitle, author }`. |
| `seed-sample-hadiths.ts` | `data/hadiths.json` | Upserts hadiths on `{ collectionName, hadithNumber }` when a number is present. |
| `seed-sample-research.ts` | `data/research.json` | Upserts research notes on `{ verseId, title }`. |
| `seed-admin-user.ts` | env vars only | Creates the first admin user (see below). |

Shortcut entries in `package.json`:

```bash
bun run db:seed:surahs   # 114 surah metadata
bun run db:seed:admin    # admin user from SEED_ADMIN_* env vars
```

The surah metadata can also be seeded from the admin dashboard: when the
surahs collection is empty, the dashboard shows a **"ডাটাবেস খালি — ১১৪
সূরার তথ্য সিড করুন"** card that calls `POST /api/admin/seed-surahs`
(admin-only, audit-logged).

## Admin user

```bash
SEED_ADMIN_EMAIL=you@example.com \
SEED_ADMIN_PASSWORD='choose-a-strong-password' \
SEED_ADMIN_NAME="Your Name" \
bun scripts/seed-admin-user.ts
```

- Refuses to run unless `SEED_ADMIN_PASSWORD` is set (min 8 chars).
- Skips when the email already exists.
- Passwords are hashed with bcrypt (12 rounds). Never commit credentials.

## Content verification policy — READ THIS

**No content may be seeded (or published) without a verified source.**

- `lib/surah-metadata.ts` (114 surah names, ayah counts, Makki/Madani,
  chronological order) is structural metadata — the only content embedded
  in code.
- `data/verses.json` — **verified Tanzil Project import** (2026-10-12):
  6,236 verses, Uthmani Arabic (CC BY 3.0, byte-identical, unmodified) +
  Saheeh International English. See `data/ATTRIBUTION.md` for full license
  terms. The seed script refuses to run unless the file has exactly 6,236
  rows. **Never hand-edit verse text** — re-run the documented import instead,
  and never type Quranic Arabic from memory.
- `data/tafsirs.json`, `data/hadiths.json`, `data/research.json` —
  summaries and texts must be written from the cited book in hand, with
  exact book / author / volume / page. Unverifiable rows are rejected.
- The normal path for editorial content is the **admin dashboard**:
  create as `draft` → `review` → `published`. The publish gate requires at
  least one Sunni source, one Shia source, and two independent references.
- Seed scripts force `status: "draft"` / `confidence: "low"` on research
  notes unless they already carry real references.

## Deprecated

`scripts/seed-quran-data.ts` pulls Quran text and translations from a
third-party API at seed time. This conflicts with the platform rule that
final content must come from verified sources in our own database — use
`seed-surahs.ts` + the verified-mushaf workflow above instead.
