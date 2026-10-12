export const dynamic = "force-dynamic";

import { z } from "zod";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { ResearchNote } from "@/models/ResearchNote";
import { Hadith } from "@/models/Hadith";
import { checkRateLimit, fail, handleRouteError, ok } from "@/lib/api-helpers";

const surahParamSchema = z.coerce.number().int().min(1).max(114);
const ayahParamSchema = z.coerce.number().int().min(1).max(300);

/**
 * GET /api/verses/[surah]/[ayah]/hadiths — published hadiths linked to the
 * verse via its published research notes' hadithIds. Public, no-store.
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

    await connectDB();
    const verse = (await Verse.findOne({
      surahNumber,
      ayahNumber,
    }).lean()) as unknown as {
      _id: Types.ObjectId;
    } | null;
    if (!verse) return fail(404, "Verse not found.");

    const notes = (await ResearchNote.find({
      verseId: verse._id,
      status: "published",
    })
      .select("hadithIds")
      .lean()) as unknown as { hadithIds: Types.ObjectId[] }[];

    const ids = [...new Set(notes.flatMap((n) => n.hadithIds ?? []).map(String))];
    if (ids.length === 0) return ok([]);

    const hadiths = await Hadith.find({ _id: { $in: ids }, status: "published" })
      .sort({ createdAt: 1 })
      .lean();
    return ok(hadiths);
  } catch (err) {
    return handleRouteError(err);
  }
}
