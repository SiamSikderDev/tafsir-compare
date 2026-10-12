export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { referenceCreateSchema } from "@/lib/validations";
import { Reference } from "@/models/Reference";
import { handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** POST /api/admin/references — create a standalone reference (write role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const body = await readJson(req);
    const data = referenceCreateSchema.parse(body);

    await connectDB();
    const doc = await Reference.create(data);

    await writeAudit(ctx, {
      action: "create",
      collectionName: "Reference",
      documentId: String(doc._id),
      after: snapshot(doc),
      req,
    });

    return ok(doc.toJSON(), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
