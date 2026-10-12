export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { objectId, tafsirUpdateSchema } from "@/lib/validations";
import { Tafsir } from "@/models/Tafsir";
import { fail, handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** PUT /api/admin/tafsirs/[id] — update a tafsir (write role). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const { id } = await params;
    objectId.parse(id);

    const body = await readJson(req);
    const data = tafsirUpdateSchema.parse(body);
    if (Object.keys(data).length === 0) {
      return fail(400, "Request body must include at least one field to update.");
    }

    await connectDB();

    const before = await Tafsir.findById(id).lean();
    if (!before) return fail(404, "Tafsir not found.");

    const after = await Tafsir.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    await writeAudit(ctx, {
      action: "update",
      collectionName: "Tafsir",
      documentId: id,
      before: snapshot(before),
      after: snapshot(after),
      req,
    });

    return ok(after);
  } catch (err) {
    return handleRouteError(err);
  }
}
