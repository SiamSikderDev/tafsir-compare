export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { handleRouteError, ok } from "@/lib/api-helpers";
import { Verse } from "@/models/Verse";
import { Tafsir } from "@/models/Tafsir";
import { Types } from "mongoose";
import DATA from "@/scripts/data/tafsirs-al-fatihah.json";

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
}

const ROWS = (DATA as { entries: BundledTafsir[] }).entries;

/**
 * POST /api/admin/seed-tafsirs — upsert the user-approved Al-Fatihah tafsir
 * entries (Ibn Kathir + Al-Mizan, Bengali + English) from the bundled JSON.
 * Admin only, idempotent (upsert on verseId+school+bookTitle+language),
 * single bulkWrite, audit-logged. No body required.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");
    await connectDB();

    // Resolve the 7 verse ObjectIds in one query.
    const ayahs = [...new Set(ROWS.map((r) => r.ayah))];
    const verses = (await Verse.find({
      surahNumber: 1,
      ayahNumber: { $in: ayahs },
    })
      .select("_id ayahNumber")
      .lean()) as unknown as { _id: Types.ObjectId; ayahNumber: number }[];
    const verseByAyah = new Map(verses.map((v) => [v.ayahNumber, v._id]));

    const missing: string[] = [];
    const ops = [];
    for (const r of ROWS) {
      const verseId = verseByAyah.get(r.ayah);
      if (!verseId) {
        missing.push(`${r.surah}:${r.ayah}`);
        continue;
      }
      ops.push({
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
              status: "published",
              verifiedBy: "Siam Sikder",
            },
          },
          upsert: true,
        },
      });
    }

    let upserted = 0;
    let matched = 0;
    if (ops.length > 0) {
      const result = await Tafsir.bulkWrite(ops, { ordered: false });
      upserted = result.upsertedCount;
      matched = result.matchedCount;
    }

    await writeAudit(ctx, {
      action: "seed",
      collectionName: "tafsirs",
      after: { entries: ROWS.length, upserted, matched, missing },
      req,
    });

    return ok({ total: ROWS.length, upserted, matched, missing });
  } catch (err) {
    const msg =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    // TEMP DEBUG — surface the real error to the admin UI
    return Response.json({ error: `DEBUG: ${msg}` }, { status: 500 });
  }
}
