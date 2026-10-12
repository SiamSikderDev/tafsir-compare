export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { Tafsir } from "@/models/Tafsir";
import { Hadith } from "@/models/Hadith";
import { ResearchNote } from "@/models/ResearchNote";
import { searchQuerySchema } from "@/lib/validations";
import { checkRateLimit, handleRouteError, ok } from "@/lib/api-helpers";

interface SearchResultItem {
  type: "verse" | "tafsir" | "hadith" | "research";
  surahNumber?: number;
  ayahNumber?: number;
  snippet: string;
  school?: string;
  sourceBook?: string;
  confidence?: string;
  link: string | null;
}

interface PopulatedVerseRef {
  surahNumber: number;
  ayahNumber: number;
}

const SNIPPET_LEN = 160;

const textScoreProjection = { score: { $meta: "textScore" } } as const;
const textScoreSort = { score: { $meta: "textScore" } } as const;

const snippetOf = (text: string | undefined | null): string =>
  (text ?? "").slice(0, SNIPPET_LEN);

/** Escape user input before embedding it in a RegExp. */
const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mirrors the `*.Schema.index({ ...: "text" })` definitions in models/.
const VERSE_TEXT_FIELDS = [
  "arabicText",
  "bengaliTranslation",
  "englishTranslation",
] as const;
const TAFSIR_TEXT_FIELDS = [
  "summary",
  "fullText",
  "bookTitle",
  "author",
] as const;
const HADITH_TEXT_FIELDS = [
  "arabicText",
  "bengaliTranslation",
  "englishTranslation",
  "narrator",
] as const;
const NOTE_TEXT_FIELDS = ["title", "context", "historicalContext"] as const;

/** Case-insensitive substring search, used when $text is unavailable. */
const regexOr = (q: string, fields: readonly string[]) => ({
  $or: fields.map((f) => ({ [f]: { $regex: escapeRegex(q), $options: "i" } })),
});

/** MongoDB error 27 = "text index required for $text query". */
const isTextIndexError = (err: unknown): boolean => {
  const e = err as { code?: number; message?: string } | null;
  return e?.code === 27 || /text index required/i.test(e?.message ?? "");
};

/**
 * GET /api/search?q=... — MongoDB $text search across verses (all) and
 * published tafsirs, hadiths, and research notes. Verses sort first.
 * If the $text index is missing on any collection (Atlas builds them in the
 * background and may lag behind a fresh deploy), the route transparently
 * falls back to a case-insensitive substring search instead of 500ing.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const { q } = searchQuerySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );

    await connectDB();

    let verses: unknown[];
    let tafsirs: unknown[];
    let hadiths: unknown[];
    let notes: unknown[];
    let fallback = false;

    try {
      [verses, tafsirs, hadiths, notes] = await Promise.all([
        Verse.find({ $text: { $search: q } }, textScoreProjection)
          .sort(textScoreSort)
          .limit(10)
          .lean(),
        Tafsir.find(
          { status: "published", $text: { $search: q } },
          textScoreProjection,
        )
          .sort(textScoreSort)
          .limit(10)
          .populate("verseId", "surahNumber ayahNumber")
          .lean(),
        Hadith.find(
          { status: "published", $text: { $search: q } },
          textScoreProjection,
        )
          .sort(textScoreSort)
          .limit(10)
          .lean(),
        ResearchNote.find(
          { status: "published", $text: { $search: q } },
          textScoreProjection,
        )
          .sort(textScoreSort)
          .limit(10)
          .populate("verseId", "surahNumber ayahNumber")
          .lean(),
      ]);
    } catch (err) {
      if (!isTextIndexError(err)) throw err;
      fallback = true;
      console.warn(
        "[search] $text index unavailable, using regex fallback:",
        (err as Error)?.message,
      );
      [verses, tafsirs, hadiths, notes] = await Promise.all([
        Verse.find(regexOr(q, VERSE_TEXT_FIELDS)).limit(10).lean(),
        Tafsir.find({ status: "published", ...regexOr(q, TAFSIR_TEXT_FIELDS) })
          .limit(10)
          .populate("verseId", "surahNumber ayahNumber")
          .lean(),
        Hadith.find({ status: "published", ...regexOr(q, HADITH_TEXT_FIELDS) })
          .limit(10)
          .lean(),
        ResearchNote.find({ status: "published", ...regexOr(q, NOTE_TEXT_FIELDS) })
          .limit(10)
          .populate("verseId", "surahNumber ayahNumber")
          .lean(),
      ]);
    }

    const items: SearchResultItem[] = [];

    for (const v of verses as Array<{
      surahNumber: number;
      ayahNumber: number;
      arabicText?: string;
      bengaliTranslation?: string;
      englishTranslation?: string;
    }>) {
      items.push({
        type: "verse",
        surahNumber: v.surahNumber,
        ayahNumber: v.ayahNumber,
        snippet: snippetOf(
          v.arabicText ?? v.bengaliTranslation ?? v.englishTranslation,
        ),
        link: `/surah/${v.surahNumber}/ayah/${v.ayahNumber}`,
      });
    }

    for (const t of tafsirs as Array<{
      verseId?: PopulatedVerseRef | null;
      summary?: string;
      school?: string;
      bookTitle?: string;
    }>) {
      const verse = (t.verseId as PopulatedVerseRef | null) ?? null;
      items.push({
        type: "tafsir",
        surahNumber: verse?.surahNumber,
        ayahNumber: verse?.ayahNumber,
        snippet: snippetOf(t.summary),
        school: t.school,
        sourceBook: t.bookTitle,
        link:
          verse?.surahNumber && verse?.ayahNumber
            ? `/surah/${verse.surahNumber}/ayah/${verse.ayahNumber}`
            : null,
      });
    }

    for (const h of hadiths as Array<{
      bengaliTranslation?: string;
      englishTranslation?: string;
      arabicText?: string;
      narrator?: string;
      school?: string;
      collectionName?: string;
    }>) {
      items.push({
        type: "hadith",
        snippet: snippetOf(
          h.bengaliTranslation ??
            h.englishTranslation ??
            h.arabicText ??
            h.narrator,
        ),
        school: h.school,
        sourceBook: h.collectionName,
        link: null,
      });
    }

    for (const n of notes as Array<{
      verseId?: PopulatedVerseRef | null;
      title?: string;
      context?: string;
      confidence?: string;
    }>) {
      const verse = (n.verseId as PopulatedVerseRef | null) ?? null;
      items.push({
        type: "research",
        surahNumber: verse?.surahNumber,
        ayahNumber: verse?.ayahNumber,
        snippet: snippetOf(n.title ?? n.context),
        confidence: n.confidence,
        sourceBook: n.title,
        link:
          verse?.surahNumber && verse?.ayahNumber
            ? `/surah/${verse.surahNumber}/ayah/${verse.ayahNumber}`
            : null,
      });
    }

    // Verses first, then everything else (each group already text-score ordered).
    items.sort((a, b) =>
      a.type === "verse" ? (b.type === "verse" ? 0 : -1) : b.type === "verse" ? 1 : 0,
    );

    return ok({ results: items, fallback });
  } catch (err) {
    return handleRouteError(err);
  }
}
