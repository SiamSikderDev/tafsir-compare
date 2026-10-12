/**
 * Seed tafsir entries from scripts/data/tafsirs.json.
 *
 * Idempotent: upserts on { verseId, school, bookTitle, author }.
 *
 * Each row links to a verse either via "verseId" (a Verse _id string) or
 * via "verse": { surahNumber, ayahNumber } which is resolved at seed time.
 * Rows whose verse cannot be resolved, or whose summary is missing / still
 * a "…" placeholder, are skipped with a warning.
 *
 * Usage:
 *   bun scripts/seed-sample-tafsirs.ts
 *
 * Requires MONGODB_URI (bun loads .env automatically).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { Verse } from "../models/Verse";
import { Tafsir } from "../models/Tafsir";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(here, "data", "tafsirs.json");

const SCHOOLS = new Set(["sunni", "shia", "shared"]);
const STATUSES = new Set(["draft", "review", "published"]);

interface TafsirRow {
  verseId?: string;
  verse?: { surahNumber?: number; ayahNumber?: number };
  school?: string;
  bookTitle?: string;
  author?: string;
  volume?: string;
  page?: string;
  language?: string;
  summary?: string;
  fullText?: string;
  keyPoints?: string[];
  sourceUrl?: string;
  publisher?: string;
  publicationYear?: number;
  verifiedBy?: string;
  status?: string;
}

function isPlaceholderText(value: unknown): boolean {
  return (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.includes("…")
  );
}

async function resolveVerseId(row: TafsirRow, index: number): Promise<string | null> {
  if (row.verseId && mongoose.isValidObjectId(row.verseId)) {
    const exists = await Verse.exists({ _id: row.verseId });
    if (exists) return row.verseId;
    console.warn(`SKIP — row ${index}: verseId ${row.verseId} not found in verses collection`);
    return null;
  }
  if (row.verse?.surahNumber && row.verse?.ayahNumber) {
    const verse = (await Verse.findOne({
      surahNumber: row.verse.surahNumber,
      ayahNumber: row.verse.ayahNumber,
    })
      .select("_id")
      .lean()) as { _id: unknown } | null;
    if (verse) return String(verse._id);
    console.warn(
      `SKIP — row ${index}: no verse ${row.verse.surahNumber}:${row.verse.ayahNumber} in DB — seed verses first`,
    );
    return null;
  }
  console.warn(`SKIP — row ${index}: no verse or verseId given`);
  return null;
}

async function main(): Promise<void> {
  const raw = readFileSync(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as { tafsirs?: TafsirRow[] } | TafsirRow[];
  const rows: TafsirRow[] = Array.isArray(parsed) ? parsed : (parsed.tafsirs ?? []);

  if (rows.length === 0) {
    console.log("tafsirs.json has no rows. Nothing to seed.");
    process.exit(0);
  }

  await connectDB();

  let upserted = 0;
  let modified = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (!row.school || !SCHOOLS.has(row.school)) {
      console.warn(`SKIP — row ${i}: school must be sunni | shia | shared`);
      skipped += 1;
      continue;
    }
    if (isPlaceholderText(row.bookTitle) || isPlaceholderText(row.author)) {
      console.warn(`SKIP — row ${i}: bookTitle/author missing or placeholder`);
      skipped += 1;
      continue;
    }
    if (isPlaceholderText(row.summary)) {
      console.warn(
        `SKIP — row ${i}: summary missing or placeholder — write from the cited book first`,
      );
      skipped += 1;
      continue;
    }

    const verseId = await resolveVerseId(row, i);
    if (!verseId) {
      skipped += 1;
      continue;
    }

    const status = row.status && STATUSES.has(row.status) ? row.status : "draft";

    const res = await Tafsir.updateOne(
      { verseId, school: row.school, bookTitle: row.bookTitle, author: row.author },
      {
        $set: {
          verseId,
          school: row.school,
          bookTitle: row.bookTitle,
          author: row.author,
          ...(row.volume ? { volume: row.volume } : {}),
          ...(row.page ? { page: row.page } : {}),
          language: row.language ?? "bengali",
          summary: row.summary,
          fullText: row.fullText && !isPlaceholderText(row.fullText) ? row.fullText : "",
          keyPoints: Array.isArray(row.keyPoints)
            ? row.keyPoints.filter((k) => !isPlaceholderText(k))
            : [],
          ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
          ...(row.publisher ? { publisher: row.publisher } : {}),
          ...(row.publicationYear ? { publicationYear: row.publicationYear } : {}),
          ...(row.verifiedBy ? { verifiedBy: row.verifiedBy } : {}),
          status,
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
  console.error("seed-sample-tafsirs failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
