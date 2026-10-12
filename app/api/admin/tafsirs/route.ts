export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { tafsirCreateSchema } from "@/lib/validations";
import { Tafsir } from "@/models/Tafsir";
import { handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** POST /api/admin/tafsirs — create a tafsir (write role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const body = await readJson(req);
    const data = tafsirCreateSchema.parse(body);

    await connectDB();
    const doc = await Tafsir.create(data);

    await writeAudit(ctx, {
      action: "create",
      collectionName: "Tafsir",
      documentId: String(doc._id),
      after: snapshot(doc),
      req,
    });

    return ok(doc.toJSON(), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
