export const dynamic = "force-dynamic";

import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db";
import { Hadith, type IHadith } from "@/models/Hadith";
import { paginationSchema, schoolQuerySchema } from "@/lib/validations";
import { checkRateLimit, handleRouteError, ok } from "@/lib/api-helpers";

/**
 * GET /api/hadiths — published hadiths, paginated.
 * Optional ?school=sunni|shia|shared filter.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const queryParams = Object.fromEntries(new URL(req.url).searchParams);
    const { page, limit } = paginationSchema.parse(queryParams);
    const { school } = schoolQuerySchema.parse(queryParams);

    await connectDB();

    const filter: FilterQuery<IHadith> = { status: "published" };
    if (school) filter.school = school;

    const [data, total] = await Promise.all([
      Hadith.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Hadith.countDocuments(filter),
    ]);

    return ok({ data, page, limit, total });
  } catch (err) {
    return handleRouteError(err);
  }
}
