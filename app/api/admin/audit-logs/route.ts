export const dynamic = "force-dynamic";

import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { auditLogQuerySchema } from "@/lib/validations";
import { AuditLog, type IAuditLog } from "@/models/AuditLog";
import { handleRouteError, ok } from "@/lib/api-helpers";

/**
 * GET /api/admin/audit-logs — audit log entries, newest first (read role).
 * Optional ?action= and ?collection= filters; paginated.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    await requireRole("read");

    const queryParams = Object.fromEntries(new URL(req.url).searchParams);
    const { page, limit, action, collection } = auditLogQuerySchema.parse(queryParams);

    await connectDB();

    const filter: FilterQuery<IAuditLog> = {};
    if (action) filter.action = action;
    if (collection) filter.collectionName = collection;

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return ok({ data, page, limit, total });
  } catch (err) {
    return handleRouteError(err);
  }
}
