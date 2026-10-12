/**
 * Seed the 6,236 Quran verses from scripts/data/verses.json.
 *
 * The data file is the VERIFIED Tanzil Project import (Uthmani Arabic,
 * CC BY 3.0, byte-identical + Saheeh International English) — see
 * scripts/data/ATTRIBUTION.md. Never hand-edit verse text in the JSON;
 * re-run the documented import instead.
 *
 * Idempotent: bulk upserts on { surahNumber, ayahNumber }. Arabic and
 * English are always refreshed from the file; an existing Bengali
 * translation is preserved ($setOnInsert).
 *
 * Usage:
 *   bun scripts/seed-verses.ts
 *   bun run db:seed:verses
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

/** Compact row layout: { s, a, g, ar, en, j } — see the import script notes. */
interface CompactVerse {
  s: number;
  a: number;
  g: number;
  ar: string;
  en: string;
  j?: number;
}

function validateRow(row: CompactVerse, index: number): string | null {
  if (!Number.isInteger(row.s) || row.s < 1 || row.s > 114)
    return `row ${index}: invalid s (surahNumber)`;
  if (!Number.isInteger(row.a) || row.a < 1)
    return `row ${index}: invalid a (ayahNumber)`;
  if (!Number.isInteger(row.g) || row.g < 1 || row.g > 6236)
    return `row ${index}: invalid g (globalAyahNumber, must be 1-6236)`;
  if (typeof row.ar !== "string" || row.ar.length === 0 || row.ar.includes("…"))
    return `row ${index}: ar (arabicText) missing or placeholder — refusing to seed unverified text`;
  if (typeof row.en !== "string" || row.en.length === 0)
    return `row ${index}: en (englishTranslation) missing`;
  return null;
}

async function main(): Promise<void> {
  const rows = JSON.parse(readFileSync(DATA_PATH, "utf8")) as CompactVerse[];

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("verses.json has no rows. Nothing to seed.");
    process.exit(0);
  }
  if (rows.length !== 6236) {
    console.error(
      `REFUSING: verses.json has ${rows.length} rows, expected 6236 (Tanzil import).`,
    );
    process.exit(1);
  }

  await connectDB();

  const ops: Parameters<typeof Verse.bulkWrite>[0] = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const problem = validateRow(row, i);
    if (problem) {
      console.warn(`SKIP — ${problem}`);
      skipped += 1;
      continue;
    }
    ops.push({
      updateOne: {
        filter: { surahNumber: row.s, ayahNumber: row.a },
        update: {
          $set: {
            surahNumber: row.s,
            ayahNumber: row.a,
            globalAyahNumber: row.g,
            arabicText: row.ar,
            englishTranslation: row.en,
            ...(row.j !== undefined ? { juz: row.j } : {}),
          },
          $setOnInsert: { bengaliTranslation: "" },
        },
        upsert: true,
      },
    });
  }

  let upserted = 0;
  let matched = 0;
  for (let i = 0; i < ops.length; i += 1000) {
    const res = await Verse.bulkWrite(ops.slice(i, i + 1000), {
      ordered: false,
    });
    upserted += res.upsertedCount;
    matched += res.matchedCount;
  }

  console.log(
    `Done. Upserted ${upserted}, matched ${matched}, skipped ${skipped} of ${rows.length} rows.`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("seed-verses failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
