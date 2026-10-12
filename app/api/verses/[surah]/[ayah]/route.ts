export const dynamic = "force-dynamic";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { checkRateLimit, fail, handleRouteError, ok } from "@/lib/api-helpers";

const surahParamSchema = z.coerce.number().int().min(1).max(114);
const ayahParamSchema = z.coerce.number().int().min(1).max(300);

/** GET /api/verses/[surah]/[ayah] — a single verse. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ surah: string; ayah: string }> },
): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const { surah, ayah } = await params;
    const surahNumber = surahParamSchema.parse(surah);
    const ayahNumber = ayahParamSchema.parse(ayah);

    await connectDB();
    const verse = await Verse.findOne({ surahNumber, ayahNumber }).lean();
    if (!verse) return fail(404, "Verse not found.");

    return ok(verse);
  } catch (err) {
    return handleRouteError(err);
  }
}
