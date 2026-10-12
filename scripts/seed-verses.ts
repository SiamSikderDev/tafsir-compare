/**
 * Seed verses from scripts/data/verses.json.
 *
 * Idempotent: upserts on { surahNumber, ayahNumber }.
 *
 * Rows whose arabicText is missing or still contains the "…" placeholder
 * are skipped with a warning — see scripts/README.md for the verification
 * policy.
 *
 * Usage:
 *   bun scripts/seed-verses.ts
 *
 * Requires MONGODB_URI (bun loads .env automatically).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "../lib/db";
import { Verse } from "../models/Verse";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(here, "data", "verses.json");

interface VerseRow {
  surahNumber?: number;
  ayahNumber?: number;
  globalAyahNumber?: number;
  arabicText?: string;
  bengaliTranslation?: string;
  englishTranslation?: string;
  juz?: number;
  page?: number;
}

function isPlaceholderText(value: unknown): boolean {
  return (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.includes("…")
  );
}

function validateRow(row: VerseRow, index: number): string | null {
  if (!Number.isInteger(row.surahNumber) || (row.surahNumber as number) < 1 || (row.surahNumber as number) > 114)
    return `row ${index}: invalid surahNumber`;
  if (!Number.isInteger(row.ayahNumber) || (row.ayahNumber as number) < 1)
    return `row ${index}: invalid ayahNumber`;
  if (!Number.isInteger(row.globalAyahNumber) || (row.globalAyahNumber as number) < 1 || (row.globalAyahNumber as number) > 6236)
    return `row ${index}: invalid globalAyahNumber (must be 1-6236)`;
  if (isPlaceholderText(row.arabicText))
    return `row ${index}: arabicText missing or still a placeholder — verify from a mushaf first`;
  return null;
}

async function main(): Promise<void> {
  const raw = readFileSync(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as { verses?: VerseRow[] } | VerseRow[];
  const rows: VerseRow[] = Array.isArray(parsed) ? parsed : (parsed.verses ?? []);

  if (rows.length === 0) {
    console.log("verses.json has no rows. Nothing to seed.");
    process.exit(0);
  }

  await connectDB();

  let upserted = 0;
  let modified = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const problem = validateRow(row, i);
    if (problem) {
      console.warn(`SKIP — ${problem}`);
      skipped += 1;
      continue;
    }

    const res = await Verse.updateOne(
      { surahNumber: row.surahNumber, ayahNumber: row.ayahNumber },
      {
        $set: {
          surahNumber: row.surahNumber,
          ayahNumber: row.ayahNumber,
          globalAyahNumber: row.globalAyahNumber,
          arabicText: row.arabicText,
          bengaliTranslation: row.bengaliTranslation ?? "",
          englishTranslation: row.englishTranslation ?? "",
          ...(row.juz !== undefined ? { juz: row.juz } : {}),
          ...(row.page !== undefined ? { page: row.page } : {}),
        },
      },
      { upsert: true },
    );
    if (res.upsertedCount > 0) upserted += 1;
    else if (res.modifiedCount > 0) modified += 1;
  }

  console.log(
    `Done. Inserted ${upserted}, updated ${modified}, skipped ${skipped} of ${rows.length} rows.`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("seed-verses failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
