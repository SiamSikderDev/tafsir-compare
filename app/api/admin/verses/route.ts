export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { verseCreateSchema } from "@/lib/validations";
import { Verse } from "@/models/Verse";
import { handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** POST /api/admin/verses — create a verse (write role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const body = await readJson(req);
    const data = verseCreateSchema.parse(body);

    await connectDB();
    const doc = await Verse.create(data);

    await writeAudit(ctx, {
      action: "create",
      collectionName: "Verse",
      documentId: String(doc._id),
      after: snapshot(doc),
      req,
    });

    return ok(doc.toJSON(), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
