export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import {
  checkRateLimit,
  handleRouteError,
  ok,
  fail,
} from "@/lib/api-helpers";

const setupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

/** GET /api/setup — whether first-admin setup is still needed. */
export async function GET(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    await connectDB();
    const count = await User.countDocuments();
    return ok({ setupNeeded: count === 0 });
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * POST /api/setup — create the first admin user.
 * One-time only: refuses when any user already exists.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const body: unknown = await req.json().catch(() => null);
    const data = setupSchema.parse(body);

    await connectDB();
    const existing = await User.countDocuments();
    if (existing > 0) {
      return fail(403, "Setup already completed.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "admin",
    });

    // Audit the bootstrap creation (no authenticated user yet).
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        undefined;
      await AuditLog.create({
        userId: user._id,
        action: "setup.create_admin",
        collectionName: "users",
        documentId: String(user._id),
        after: { email: user.email, role: "admin" },
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    } catch {
      /* audit must not break setup */
    }

    return ok({ ok: true, email: user.email }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
