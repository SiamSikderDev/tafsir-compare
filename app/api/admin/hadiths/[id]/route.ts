export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { objectId, hadithUpdateSchema } from "@/lib/validations";
import { Hadith } from "@/models/Hadith";
import { fail, handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** PUT /api/admin/hadiths/[id] — update a hadith (write role). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const { id } = await params;
    objectId.parse(id);

    const body = await readJson(req);
    const data = hadithUpdateSchema.parse(body);
    if (Object.keys(data).length === 0) {
      return fail(400, "Request body must include at least one field to update.");
    }

    await connectDB();

    const before = await Hadith.findById(id).lean();
    if (!before) return fail(404, "Hadith not found.");

    const after = await Hadith.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    await writeAudit(ctx, {
      action: "update",
      collectionName: "Hadith",
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
