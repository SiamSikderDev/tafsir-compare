import { AuditLog } from "@/models/AuditLog";
import type { AuthContext } from "./authz";
import type { Types } from "mongoose";

interface AuditEntry {
  action: string;
  collectionName: string;
  documentId?: string | Types.ObjectId;
  before?: unknown;
  after?: unknown;
  req?: Request;
}

/**
 * Writes an audit log entry. Never throws — audit failure must not break
 * the primary mutation.
 */
export async function writeAudit(ctx: AuthContext, entry: AuditEntry): Promise<void> {
  try {
    const headers = entry.req?.headers;
    await AuditLog.create({
      userId: ctx.userId,
      action: entry.action,
      collectionName: entry.collectionName,
      documentId: entry.documentId ? String(entry.documentId) : undefined,
      before: entry.before ?? undefined,
      after: entry.after ?? undefined,
      ipAddress:
        headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headers?.get("x-real-ip") ??
        undefined,
      userAgent: headers?.get("user-agent")?.slice(0, 500),
    });
  } catch {
    // Audit logging is best-effort.
  }
}

/** JSON-safe snapshot of a Mongoose document for before/after diffs. */
export function snapshot(doc: unknown): unknown {
  try {
    return JSON.parse(
      JSON.stringify(doc, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );
  } catch {
    return undefined;
  }
}
