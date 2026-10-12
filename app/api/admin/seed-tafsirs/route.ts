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
 * audit-logged. No body required.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");
    await connectDB();

    let upserted = 0;
    let matched = 0;
    const missing: string[] = [];

    for (const r of ROWS) {
      const verse = (await Verse.findOne({
        surahNumber: r.surah,
        ayahNumber: r.ayah,
      })
        .select("_id")
        .lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!verse) {
        missing.push(`${r.surah}:${r.ayah}`);
        continue;
      }
      const res = await Tafsir.updateOne(
        {
          verseId: verse._id,
          school: r.school,
          bookTitle: r.bookTitle,
          language: r.language,
        },
        {
          $set: {
            verseId: verse._id,
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
        { upsert: true },
      );
      upserted += res.upsertedCount;
      matched += res.matchedCount;
    }

    await writeAudit(ctx, {
      action: "seed",
      collectionName: "tafsirs",
      after: { entries: ROWS.length, upserted, matched, missing },
      req,
    });

    return ok({ total: ROWS.length, upserted, matched, missing });
  } catch (err) {
    return handleRouteError(err);
  }
}
