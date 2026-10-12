export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { researchNoteCreateSchema } from "@/lib/validations";
import { ResearchNote } from "@/models/ResearchNote";
import { handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** POST /api/admin/research — create a research note (write role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const body = await readJson(req);
    const data = researchNoteCreateSchema.parse(body);

    await connectDB();
    const doc = await ResearchNote.create(data);

    await writeAudit(ctx, {
      action: "create",
      collectionName: "ResearchNote",
      documentId: String(doc._id),
      after: snapshot(doc),
      req,
    });

    return ok(doc.toJSON(), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
