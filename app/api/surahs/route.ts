export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { Surah } from "@/models/Surah";
import { checkRateLimit, handleRouteError, ok } from "@/lib/api-helpers";

/** GET /api/surahs — all 114 surahs with metadata, sorted by number. */
export async function GET(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    await connectDB();
    const surahs = await Surah.find()
      .select(
        "number nameArabic nameTransliterated nameBengali nameEnglish revelationPlace totalAyahs",
      )
      .sort({ number: 1 })
      .lean();
    return ok(surahs);
  } catch (err) {
    return handleRouteError(err);
  }
}
