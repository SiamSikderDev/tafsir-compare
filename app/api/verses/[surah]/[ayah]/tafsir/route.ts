export const dynamic = "force-dynamic";

import { z } from "zod";
import type { FilterQuery, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { Tafsir, type ITafsir } from "@/models/Tafsir";
import { schoolQuerySchema } from "@/lib/validations";
import { checkRateLimit, fail, handleRouteError, ok } from "@/lib/api-helpers";

const surahParamSchema = z.coerce.number().int().min(1).max(114);
const ayahParamSchema = z.coerce.number().int().min(1).max(300);

/**
 * GET /api/verses/[surah]/[ayah]/tafsir — published tafsirs for the verse.
 * Optional ?school=sunni|shia|shared filter.
 */
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

    const { school } = schoolQuerySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );

    await connectDB();
    const verse = (await Verse.findOne({
      surahNumber,
      ayahNumber,
    }).lean()) as unknown as {
      _id: Types.ObjectId;
    } | null;
    if (!verse) return fail(404, "Verse not found.");

    const filter: FilterQuery<ITafsir> = {
      verseId: verse._id,
      status: "published",
    };
    if (school) filter.school = school;

    const tafsirs = await Tafsir.find(filter).sort({ createdAt: -1 }).lean();
    return ok(tafsirs);
  } catch (err) {
    return handleRouteError(err);
  }
}
