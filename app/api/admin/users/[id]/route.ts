export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit } from "@/lib/audit";
import { objectId, userRoleUpdateSchema } from "@/lib/validations";
import { User } from "@/models/User";
import { fail, handleRouteError, ok, readJson } from "@/lib/api-helpers";

/**
 * PATCH /api/admin/users/[id] — change a user's role (admin role).
 * Admins cannot demote their own account.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const ctx = await requireRole("admin");

    const { id } = await params;
    objectId.parse(id);

    const body = await readJson(req);
    const data = userRoleUpdateSchema.parse(body);

    if (id === ctx.userId && data.role !== "admin") {
      return fail(400, "You cannot demote your own account.");
    }

    await connectDB();

    const before = (await User.findById(id).select("role").lean()) as unknown as {
      role: string;
    } | null;
    if (!before) return fail(404, "User not found.");

    const after = (await User.findByIdAndUpdate(
      id,
      { role: data.role },
      { new: true, runValidators: true },
    )
      .select("-passwordHash")
      .lean()) as unknown as { role: string } | null;

    await writeAudit(ctx, {
      action: "role-change",
      collectionName: "User",
      documentId: id,
      before: { role: before.role },
      after: { role: after?.role ?? data.role },
      req,
    });

    return ok(after);
  } catch (err) {
    return handleRouteError(err);
  }
}
