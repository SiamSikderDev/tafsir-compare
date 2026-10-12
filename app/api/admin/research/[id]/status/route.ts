export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import {
  objectId,
  researchStatusPatchSchema,
  isAllowedTransition,
} from "@/lib/validations";
import { ResearchNote } from "@/models/ResearchNote";
import { fail, handleRouteError, ok, readJson } from "@/lib/api-helpers";

/**
 * PATCH /api/admin/research/[id]/status — change editorial status (review role).
 * Allowed: draft→review, review→published, review→draft.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const ctx = await requireRole("review");

    const { id } = await params;
    objectId.parse(id);

    const body = await readJson(req);
    const data = researchStatusPatchSchema.parse(body);

    await connectDB();

    const before = (await ResearchNote.findById(id)
      .select("status")
      .lean()) as unknown as { status: string } | null;
    if (!before) return fail(404, "Research note not found.");

    if (!isAllowedTransition(before.status, data.status)) {
      return fail(400, "Invalid status transition.", {
        from: before.status,
        to: data.status,
      });
    }

    const after = (await ResearchNote.findByIdAndUpdate(
      id,
      { status: data.status },
      { new: true, runValidators: true },
    ).lean()) as unknown as { status: string } | null;

    await writeAudit(ctx, {
      action: "status-change",
      collectionName: "ResearchNote",
      documentId: id,
      before: { status: before.status },
      after: { status: after?.status ?? data.status },
      req,
    });

    return ok(after);
  } catch (err) {
    return handleRouteError(err);
  }
}
