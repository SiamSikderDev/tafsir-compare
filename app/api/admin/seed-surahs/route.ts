export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { handleRouteError, ok } from "@/lib/api-helpers";
import { Surah } from "@/models/Surah";
import { SURAH_METADATA, validateSurahMetadata } from "@/lib/surah-metadata";

/**
 * POST /api/admin/seed-surahs — insert the 114 surah metadata documents
 * (admin only). Refuses when the surahs collection is non-empty so the
 * operation is safe to retry. Audit-logged.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");

    await connectDB();

    const existing = await Surah.countDocuments();
    if (existing > 0) {
      return ok({
        seeded: 0,
        message: "Surahs already seeded — nothing to do.",
        existing,
      });
    }

    validateSurahMetadata();
    const docs = await Surah.insertMany(SURAH_METADATA, { ordered: true });

    await writeAudit(ctx, {
      action: "seed",
      collectionName: "surahs",
      after: { count: docs.length },
      req,
    });

    return ok({ seeded: docs.length });
  } catch (err) {
    return handleRouteError(err);
  }
}
