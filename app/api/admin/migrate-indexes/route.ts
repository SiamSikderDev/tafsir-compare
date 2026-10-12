export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { handleRouteError, ok } from "@/lib/api-helpers";
import { Tafsir } from "@/models/Tafsir";
import { ResearchNote } from "@/models/ResearchNote";

/**
 * POST /api/admin/migrate-indexes — one-time fix: drop legacy text indexes
 * whose default language_override collided with our `language` field
 * ("bengali" is not a supported MongoDB text language and broke writes).
 * The corrected indexes (language_override: xTextLanguage) are recreated
 * automatically by Mongoose on next model use. Admin only, idempotent.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");
    await connectDB();

    const dropped: string[] = [];
    for (const model of [Tafsir, ResearchNote]) {
      const indexes = await model.collection.indexes();
      for (const idx of indexes) {
        const isText =
          idx.key &&
          Object.values(idx.key as Record<string, unknown>).includes("text");
        if (isText && idx.name) {
          await model.collection.dropIndex(idx.name);
          dropped.push(`${model.collection.name}.${idx.name}`);
        }
      }
      // Recreate with corrected options right away.
      await model.syncIndexes();
    }

    await writeAudit(ctx, {
      action: "migrate",
      collectionName: "indexes",
      after: { dropped },
      req,
    });

    return ok({ dropped });
  } catch (err) {
    return handleRouteError(err);
  }
}
