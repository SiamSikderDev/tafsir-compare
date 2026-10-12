export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { userCreateSchema } from "@/lib/validations";
import { User } from "@/models/User";
import { fail, handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** GET /api/admin/users — list all users without password hashes (admin role). */
export async function GET(): Promise<Response> {
  try {
    await requireRole("admin");
    await connectDB();

    const users = await User.find().select("-passwordHash").sort({ createdAt: 1 }).lean();
    return ok(users);
  } catch (err) {
    return handleRouteError(err);
  }
}

/** POST /api/admin/users — create a user (admin role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("admin");

    const body = await readJson(req);
    const data = userCreateSchema.parse(body);

    await connectDB();

    const email = data.email.toLowerCase();
    const existing = await User.findOne({ email }).select("_id").lean();
    if (existing) {
      return fail(409, "A user with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const doc = await User.create({
      name: data.name,
      email,
      passwordHash,
      role: data.role,
    });

    // Audit snapshot must never include the password hash.
    const after = snapshot(doc.toJSON()) as Record<string, unknown>;
    delete after.passwordHash;

    await writeAudit(ctx, {
      action: "create",
      collectionName: "User",
      documentId: String(doc._id),
      after,
      req,
    });

    return ok(after, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
