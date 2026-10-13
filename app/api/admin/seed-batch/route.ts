export const dynamic = "force-dynamic";

import { readFileSync } from "fs";
import { join, basename } from "path";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { handleRouteError, ok, fail } from "@/lib/api-helpers";
import { Verse } from "@/models/Verse";
import { Tafsir } from "@/models/Tafsir";
import { Hadith } from "@/models/Hadith";
import { ResearchNote } from "@/models/ResearchNote";
import { Types } from "mongoose";

interface BundledTafsir {
  surah: number;
  ayah: number;
  school: "sunni" | "shia";
  bookTitle: string;
  author: string;
  language: string;
  summary: string;
  sourceUrl: string;
  keyPoints: string[];
  mentionsAliAhlulBayt?: boolean;
  mentionNote?: string;
}

interface BundledHadith {
  key: string;
  collectionName: string;
  school: "sunni" | "shia" | "shared";
  book: string;
  hadithNumber: string;
  narrator: string;
  arabicText?: string;
  bengaliTranslation: string;
  englishTranslation: string;
  grading: string;
  gradingSource: string;
  sourceUrl: string;
  notes: string;
  relevanceNote?: string;
  evidenceTier?: "primary" | "disputed";
}

interface SchoolPair {
  sunni: string;
  shia: string;
}

interface BundledNote {
  ayah: number;
  language: string;
  title: string;
  sunniView: string;
  shiaView: string;
  neutralExplanation: string;
  agreements: string[];
  differences: string[];
  linguisticNotes: string[];
  shanENuzul?: { sunni: string; shia: string };
  comparisonTable?: {
    mainExplanation: SchoolPair;
    aliConnection: SchoolPair;
    keyHadithEvidence: SchoolPair;
    wilayahConcept: SchoolPair;
  };
  honestLimitations?: string[];
  references: {
    type: "tafsir" | "hadith" | "book" | "article" | "dictionary" | "manuscript";
    title: string;
    author?: string;
    url?: string;
  }[];
}

// Allowlist: only approved per-batch data files, e.g. baqarah-2-6-10.json.
// This prevents path traversal — no arbitrary file reads.
const BATCH_RE = /^(baqarah-2-\d+-\d+|fatihah-1-\d+-master)$/;

/**
 * POST /api/admin/seed-batch — upsert one user-approved research batch
 * (tafsirs + hadiths + per-verse comparison notes) from its bundled JSON
 * in scripts/data/<batch>.json. Body: { "batch": "baqarah-2-6-10" }.
 * Admin only, idempotent, audit-logged. Research notes link tafsirIds and
 * hadithIds nested inside sunniView/shiaView (the schema has no top-level
 * fields). Only click after the batch's research draft is approved.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");
    const { batch } = (await req.json().catch(() => ({}))) as { batch?: string };
    if (!batch || !BATCH_RE.test(basename(batch))) {
      return fail(400, "Unknown or unapproved batch.");
    }
    const file = join(process.cwd(), "scripts", "data", `${batch}.json`);
    let DATA: { tafsirs: BundledTafsir[]; hadiths: BundledHadith[]; researchNotes: BundledNote[] };
    try {
      DATA = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      return fail(404, "Batch data file not found.");
    }

    const TAFSIRS = DATA.tafsirs ?? [];
    const HADITHS = DATA.hadiths ?? [];
    const NOTES = DATA.researchNotes ?? [];
    const SURAH = TAFSIRS[0]?.surah ?? 2;
    if (TAFSIRS.length === 0) return fail(400, "Batch has no tafsir entries.");

    await connectDB();

    // Resolve verse ObjectIds for this batch's ayahs.
    const ayahs = [...new Set([...TAFSIRS.map((t) => t.ayah), ...NOTES.map((n) => n.ayah)])];
    const verses = (await Verse.find({
      surahNumber: SURAH,
      ayahNumber: { $in: ayahs },
    })
      .select("_id ayahNumber")
      .lean()) as unknown as { _id: Types.ObjectId; ayahNumber: number }[];
    const verseByAyah = new Map(verses.map((v) => [v.ayahNumber, v._id]));

    // 1. Upsert tafsirs by (verseId + school + bookTitle + language).
    const missingTafsir: string[] = [];
    const tafsirOps = [];
    for (const r of TAFSIRS) {
      const verseId = verseByAyah.get(r.ayah);
      if (!verseId) {
        missingTafsir.push(`${r.surah}:${r.ayah}`);
        continue;
      }
      tafsirOps.push({
        updateOne: {
          filter: {
            verseId,
            school: r.school,
            bookTitle: r.bookTitle,
            language: r.language,
          },
          update: {
            $set: {
              verseId,
              school: r.school,
              bookTitle: r.bookTitle,
              author: r.author,
              language: r.language,
              summary: r.summary,
              sourceUrl: r.sourceUrl,
              keyPoints: r.keyPoints,
              ...(r.mentionsAliAhlulBayt !== undefined
                ? { mentionsAliAhlulBayt: r.mentionsAliAhlulBayt }
                : {}),
              mentionNote: r.mentionNote || "",
              status: "published",
              verifiedBy: "Siam Sikder",
            },
          },
          upsert: true,
        },
      });
    }
    let tafsirsUpserted = 0;
    let tafsirsMatched = 0;
    if (tafsirOps.length > 0) {
      const r = await Tafsir.bulkWrite(tafsirOps, { ordered: false });
      tafsirsUpserted = r.upsertedCount;
      tafsirsMatched = r.matchedCount;
    }

    // 2. Upsert hadiths by (collectionName + hadithNumber).
    const hadithOps = HADITHS.map((h) => ({
      updateOne: {
        filter: { collectionName: h.collectionName, hadithNumber: h.hadithNumber },
        update: {
          $set: {
            collectionName: h.collectionName,
            school: h.school,
            book: h.book || undefined,
            hadithNumber: h.hadithNumber,
            narrator: h.narrator,
            arabicText: h.arabicText || "",
            bengaliTranslation: h.bengaliTranslation,
            englishTranslation: h.englishTranslation,
            grading: h.grading,
            gradingSource: h.gradingSource,
            sourceUrl: h.sourceUrl,
            notes: h.notes,
            relevanceNote: h.relevanceNote || "",
            ...(h.evidenceTier ? { evidenceTier: h.evidenceTier } : {}),
            status: "published",
            verifiedBy: "Siam Sikder",
          },
        },
        upsert: true,
      },
    }));
    let hadithsUpserted = 0;
    let hadithsMatched = 0;
    if (hadithOps.length > 0) {
      const r = await Hadith.bulkWrite(hadithOps, { ordered: false });
      hadithsUpserted = r.upsertedCount;
      hadithsMatched = r.matchedCount;
    }
    const allHadiths = (await Hadith.find({
      $or: HADITHS.map((h) => ({
        collectionName: h.collectionName,
        hadithNumber: h.hadithNumber,
      })),
    })
      .select("_id")
      .lean()) as unknown as { _id: Types.ObjectId }[];
    const hadithIds = allHadiths.map((h) => h._id);

    // 3. Upsert research notes by (verseId + language), linking tafsirs + hadiths.
    const missingNotes: string[] = [];
    const noteOps = [];
    for (const n of NOTES) {
      const verseId = verseByAyah.get(n.ayah);
      if (!verseId) {
        missingNotes.push(`${SURAH}:${n.ayah}`);
        continue;
      }
      const sunniTafsirs = (await Tafsir.find({
        verseId,
        school: "sunni",
        language: n.language,
        status: "published",
      })
        .select("_id")
        .lean()) as unknown as { _id: Types.ObjectId }[];
      const shiaTafsirs = (await Tafsir.find({
        verseId,
        school: "shia",
        language: n.language,
        status: "published",
      })
        .select("_id")
        .lean()) as unknown as { _id: Types.ObjectId }[];

      noteOps.push({
        updateOne: {
          filter: { verseId, language: n.language },
          update: {
            $set: {
              verseId,
              title: n.title,
              language: n.language,
              linguisticNotes: n.linguisticNotes,
              sunniView: {
                summary: n.sunniView,
                tafsirIds: sunniTafsirs.map((t) => t._id),
                hadithIds,
              },
              shiaView: {
                summary: n.shiaView,
                tafsirIds: shiaTafsirs.map((t) => t._id),
                hadithIds,
              },
              comparison: {
                agreements: n.agreements,
                differences: n.differences,
                neutralExplanation: n.neutralExplanation,
              },
              ...(n.comparisonTable ? { comparisonTable: n.comparisonTable } : {}),
              ...(n.shanENuzul ? { shanENuzul: n.shanENuzul } : {}),
              honestLimitations: n.honestLimitations ?? [],
              references: n.references,
              confidence: "medium",
              reviewer: "Siam Sikder",
              status: "published",
            },
          },
          upsert: true,
        },
      });
    }
    let notesUpserted = 0;
    let notesMatched = 0;
    if (noteOps.length > 0) {
      const r = await ResearchNote.bulkWrite(noteOps, { ordered: false });
      notesUpserted = r.upsertedCount;
      notesMatched = r.matchedCount;
    }

    await writeAudit(ctx, {
      action: "seed",
      collectionName: `batch-${batch}`,
      after: {
        tafsirs: { total: TAFSIRS.length, upserted: tafsirsUpserted, matched: tafsirsMatched, missing: missingTafsir },
        hadiths: { total: HADITHS.length, upserted: hadithsUpserted, matched: hadithsMatched },
        notes: { total: NOTES.length, upserted: notesUpserted, matched: notesMatched, missing: missingNotes },
      },
      req,
    });

    return ok({
      tafsirs: { total: TAFSIRS.length, upserted: tafsirsUpserted, matched: tafsirsMatched, missing: missingTafsir },
      hadiths: { total: HADITHS.length, upserted: hadithsUpserted, matched: hadithsMatched },
      notes: { total: NOTES.length, upserted: notesUpserted, matched: notesMatched, missing: missingNotes },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
