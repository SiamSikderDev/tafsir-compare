/**
 * Seed hadith entries from scripts/data/hadiths.json.
 *
 * Idempotent: when a row has a hadithNumber it upserts on
 * { collectionName, hadithNumber }; otherwise it inserts a new document
 * (rows are expected to be unique by construction).
 *
 * Rows whose collectionName is missing, or whose text fields still contain
 * the "…" placeholder, are skipped with a warning.
 *
 * Usage:
 *   bun scripts/seed-sample-hadiths.ts
 *
 * Requires MONGODB_URI (bun loads .env automatically).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "../lib/db";
import { Hadith } from "../models/Hadith";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(here, "data", "hadiths.json");

const SCHOOLS = new Set(["sunni", "shia", "shared"]);
const STATUSES = new Set(["draft", "review", "published"]);

interface HadithRow {
  collectionName?: string;
  school?: string;
  book?: string;
  chapter?: string;
  hadithNumber?: string;
  narrator?: string;
  arabicText?: string;
  bengaliTranslation?: string;
  englishTranslation?: string;
  grading?: string;
  gradingSource?: string;
  sourceUrl?: string;
  notes?: string;
  status?: string;
}

function hasPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.includes("…");
}

async function main(): Promise<void> {
  const raw = readFileSync(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as { hadiths?: HadithRow[] } | HadithRow[];
  const rows: HadithRow[] = Array.isArray(parsed) ? parsed : (parsed.hadiths ?? []);

  if (rows.length === 0) {
    console.log("hadiths.json has no rows. Nothing to seed.");
    process.exit(0);
  }

  await connectDB();

  let inserted = 0;
  let modified = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (!row.collectionName || row.collectionName.trim().length === 0) {
      console.warn(`SKIP — row ${i}: collectionName is required`);
      skipped += 1;
      continue;
    }
    if (!row.school || !SCHOOLS.has(row.school)) {
      console.warn(`SKIP — row ${i}: school must be sunni | shia | shared`);
      skipped += 1;
      continue;
    }
    if (
      hasPlaceholder(row.arabicText) ||
      hasPlaceholder(row.bengaliTranslation) ||
      hasPlaceholder(row.englishTranslation)
    ) {
      console.warn(
        `SKIP — row ${i}: text fields still contain placeholders — verify from the collection first`,
      );
      skipped += 1;
      continue;
    }

    const status = row.status && STATUSES.has(row.status) ? row.status : "draft";

    const doc = {
      collectionName: row.collectionName,
      school: row.school,
      ...(row.book ? { book: row.book } : {}),
      ...(row.chapter ? { chapter: row.chapter } : {}),
      ...(row.hadithNumber ? { hadithNumber: row.hadithNumber } : {}),
      ...(row.narrator ? { narrator: row.narrator } : {}),
      arabicText: row.arabicText ?? "",
      bengaliTranslation: row.bengaliTranslation ?? "",
      englishTranslation: row.englishTranslation ?? "",
      ...(row.grading ? { grading: row.grading } : {}),
      ...(row.gradingSource ? { gradingSource: row.gradingSource } : {}),
      ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
      notes: row.notes ?? "",
      status,
    };

    if (row.hadithNumber) {
      const res = await Hadith.updateOne(
        { collectionName: row.collectionName, hadithNumber: row.hadithNumber },
        { $set: doc },
        { upsert: true },
      );
      if (res.upsertedCount > 0) inserted += 1;
      else if (res.modifiedCount > 0) modified += 1;
    } else {
      await Hadith.create(doc);
      inserted += 1;
    }
  }

  console.log(
    `Done. Inserted ${inserted}, updated ${modified}, skipped ${skipped} of ${rows.length} rows.`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("seed-sample-hadiths failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
