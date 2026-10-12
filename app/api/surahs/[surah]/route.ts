export const dynamic = "force-dynamic";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Surah } from "@/models/Surah";
import { Verse } from "@/models/Verse";
import { checkRateLimit, fail, handleRouteError, ok } from "@/lib/api-helpers";

const surahParamSchema = z.coerce.number().int().min(1).max(114);

/** GET /api/surahs/[surah] — one surah with all its verses. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ surah: string }> },
): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const { surah } = await params;
    const surahNumber = surahParamSchema.parse(surah);

    await connectDB();
    const surahDoc = await Surah.findOne({ number: surahNumber })
      .select(
        "number nameArabic nameTransliterated nameBengali nameEnglish revelationPlace totalAyahs",
      )
      .lean();
    if (!surahDoc) return fail(404, "Surah not found.");

    const verses = await Verse.find({ surahNumber })
      .select("ayahNumber arabicText bengaliTranslation englishTranslation juz")
      .sort({ ayahNumber: 1 })
      .lean();

    return ok({ surah: surahDoc, verses });
  } catch (err) {
    return handleRouteError(err);
  }
}
