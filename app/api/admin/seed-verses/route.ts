export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { handleRouteError, ok } from "@/lib/api-helpers";
import { Verse } from "@/models/Verse";
import VERSES from "@/scripts/data/verses.json";

interface BundledVerse {
  s: number;
  a: number;
  g: number;
  ar: string;
  en: string;
  bn: string;
  j: number;
}

const ROWS = VERSES as BundledVerse[];

/**
 * POST /api/admin/seed-verses — upsert one surah's verses from the bundled
 * verified Tanzil import (admin only). Body: { surahNumber: 1-114 }.
 * Idempotent and safe to retry; largest surah (Al-Baqarah, 286 verses) is a
 * single bulkWrite. Audit-logged.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");

    const body = (await req.json().catch(() => ({}))) as {
      surahNumber?: unknown;
    };
    const surahNumber = body.surahNumber;
    if (
      !Number.isInteger(surahNumber) ||
      (surahNumber as number) < 1 ||
      (surahNumber as number) > 114
    ) {
      return Response.json(
        { error: "surahNumber (1–114) আবশ্যক।" },
        { status: 400 },
      );
    }
    const s = surahNumber as number;

    await connectDB();

    const rows = ROWS.filter((v) => v.s === s);
    if (rows.length === 0) {
      return Response.json(
        { error: `সূরা ${s}-এর আয়াত বান্ডেলে পাওয়া যায়নি।` },
        { status: 404 },
      );
    }

    const result = await Verse.bulkWrite(
      rows.map((v) => ({
        updateOne: {
          filter: { surahNumber: v.s, ayahNumber: v.a },
          update: {
            $set: {
              surahNumber: v.s,
              ayahNumber: v.a,
              globalAyahNumber: v.g,
              arabicText: v.ar,
              bengaliTranslation: v.bn,
              englishTranslation: v.en,
              juz: v.j,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await writeAudit(ctx, {
      action: "seed",
      collectionName: "verses",
      after: {
        surah: s,
        upserted: result.upsertedCount,
        matched: result.matchedCount,
      },
      req,
    });

    return ok({
      surah: s,
      upserted: result.upsertedCount,
      matched: result.matchedCount,
      total: rows.length,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
