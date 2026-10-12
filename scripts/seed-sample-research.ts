/**
 * Seed research notes from scripts/data/research.json.
 *
 * Idempotent: upserts on { verseId, title }.
 *
 * Each row links to a verse via "verseId" (a Verse _id string) or via
 * "verse": { surahNumber, ayahNumber } resolved at seed time. Optional
 * tafsirIds / hadithIds arrays are validated as ObjectId strings and only
 * kept when the referenced documents exist.
 *
 * Rows whose verse cannot be resolved, or whose prose still contains the
 * "…" placeholder, are skipped with a warning. Seeded rows keep
 * status "draft" and confidence "low" unless the row explicitly sets them
 * AND has at least one non-placeholder reference — the publish gate is
 * enforced by the admin review workflow, not by seeding.
 *
 * Usage:
 *   bun scripts/seed-sample-research.ts
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
import { Hadith } from "../models/Hadith";
import { ResearchNote } from "../models/ResearchNote";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(here, "data", "research.json");

const CONFIDENCES = new Set(["high", "medium", "low"]);
const STATUSES = new Set(["draft", "review", "published"]);
const REF_TYPES = new Set([
  "tafsir",
  "hadith",
  "book",
  "article",
  "dictionary",
  "manuscript",
]);

interface RefRow {
  type?: string;
  title?: string;
  author?: string;
  volume?: string;
  page?: string;
  publisher?: string;
  publicationYear?: number;
  url?: string;
  citationFormat?: string;
  notes?: string;
}

interface SchoolViewRow {
  summary?: string;
  tafsirIds?: string[];
  hadithIds?: string[];
}

interface ResearchRow {
  verseId?: string;
  verse?: { surahNumber?: number; ayahNumber?: number };
  title?: string;
  language?: string;
  context?: string;
  linguisticNotes?: string[];
  historicalContext?: string;
  sunniView?: SchoolViewRow;
  shiaView?: SchoolViewRow;
  comparison?: {
    agreements?: string[];
    differences?: string[];
    neutralExplanation?: string;
  };
  references?: RefRow[];
  confidence?: string;
  reviewer?: string;
  status?: string;
}

function hasPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.includes("…");
}

function cleanStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0 && !v.includes("…"),
  );
}

async function resolveVerseId(row: ResearchRow, index: number): Promise<string | null> {
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

/** Keeps only ObjectId strings whose documents actually exist. */
async function resolveIdRefs(
  ids: unknown,
  model: { exists(filter: object): Promise<unknown> },
  label: string,
  index: number,
): Promise<string[]> {
  if (!Array.isArray(ids)) return [];
  const valid = (ids as unknown[]).filter(
    (id): id is string => typeof id === "string" && mongoose.isValidObjectId(id),
  );
  const kept: string[] = [];
  for (const id of valid) {
    if (await model.exists({ _id: id })) kept.push(id);
    else console.warn(`row ${index}: ${label} ${id} not found — dropping`);
  }
  return kept;
}

function cleanView(view: SchoolViewRow | undefined) {
  return {
    summary:
      view?.summary && !hasPlaceholder(view.summary) ? view.summary : "",
    tafsirIds: [] as string[],
    hadithIds: [] as string[],
  };
}

async function main(): Promise<void> {
  const raw = readFileSync(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as { research?: ResearchRow[] } | ResearchRow[];
  const rows: ResearchRow[] = Array.isArray(parsed) ? parsed : (parsed.research ?? []);

  if (rows.length === 0) {
    console.log("research.json has no rows. Nothing to seed.");
    process.exit(0);
  }

  await connectDB();

  let upserted = 0;
  let modified = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (!row.title || row.title.trim().length === 0 || hasPlaceholder(row.title)) {
      console.warn(`SKIP — row ${i}: title is required`);
      skipped += 1;
      continue;
    }

    const proseFields = [
      row.context,
      row.historicalContext,
      row.sunniView?.summary,
      row.shiaView?.summary,
      row.comparison?.neutralExplanation,
    ];
    if (proseFields.some(hasPlaceholder)) {
      console.warn(
        `SKIP — row ${i}: prose still contains placeholders — write from verified sources first`,
      );
      skipped += 1;
      continue;
    }

    const verseId = await resolveVerseId(row, i);
    if (!verseId) {
      skipped += 1;
      continue;
    }

    const references = Array.isArray(row.references)
      ? row.references.filter(
          (r) =>
            r.type &&
            REF_TYPES.has(r.type) &&
            r.title &&
            r.title.trim().length > 0 &&
            !hasPlaceholder(r.title),
        )
      : [];

    // Seeding never publishes: only keep an explicit non-draft status when
    // the note has at least one real reference; otherwise force draft/low.
    const hasRealRefs = references.length > 0;
    const status =
      row.status && STATUSES.has(row.status) && hasRealRefs ? row.status : "draft";
    const confidence =
      row.confidence && CONFIDENCES.has(row.confidence) && hasRealRefs
        ? row.confidence
        : "low";

    const sunniView = cleanView(row.sunniView);
    const shiaView = cleanView(row.shiaView);
    sunniView.tafsirIds = await resolveIdRefs(row.sunniView?.tafsirIds, Tafsir, "tafsirId", i);
    sunniView.hadithIds = await resolveIdRefs(row.sunniView?.hadithIds, Hadith, "hadithId", i);
    shiaView.tafsirIds = await resolveIdRefs(row.shiaView?.tafsirIds, Tafsir, "tafsirId", i);
    shiaView.hadithIds = await resolveIdRefs(row.shiaView?.hadithIds, Hadith, "hadithId", i);

    const res = await ResearchNote.updateOne(
      { verseId, title: row.title },
      {
        $set: {
          verseId,
          title: row.title,
          language: row.language ?? "bengali",
          context: row.context ?? "",
          linguisticNotes: cleanStrings(row.linguisticNotes),
          historicalContext: row.historicalContext ?? "",
          sunniView,
          shiaView,
          comparison: {
            agreements: cleanStrings(row.comparison?.agreements),
            differences: cleanStrings(row.comparison?.differences),
            neutralExplanation: row.comparison?.neutralExplanation ?? "",
          },
          references,
          confidence,
          ...(row.reviewer ? { reviewer: row.reviewer } : {}),
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
  console.error("seed-sample-research failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
