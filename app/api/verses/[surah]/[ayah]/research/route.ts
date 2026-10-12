export const dynamic = "force-dynamic";

import { z } from "zod";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { ResearchNote } from "@/models/ResearchNote";
import { checkRateLimit, fail, handleRouteError, ok } from "@/lib/api-helpers";

const surahParamSchema = z.coerce.number().int().min(1).max(114);
const ayahParamSchema = z.coerce.number().int().min(1).max(300);

/** GET /api/verses/[surah]/[ayah]/research — published research notes for the verse. */
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

    const notes = await ResearchNote.find({
      verseId: verse._id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .lean();
    return ok(notes);
  } catch (err) {
    return handleRouteError(err);
  }
}
