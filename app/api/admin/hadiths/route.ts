export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { writeAudit, snapshot } from "@/lib/audit";
import { hadithCreateSchema } from "@/lib/validations";
import { Hadith } from "@/models/Hadith";
import { handleRouteError, ok, readJson } from "@/lib/api-helpers";

/** POST /api/admin/hadiths — create a hadith (write role). */
export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = await requireRole("write");

    const body = await readJson(req);
    const data = hadithCreateSchema.parse(body);

    await connectDB();
    const doc = await Hadith.create(data);

    await writeAudit(ctx, {
      action: "create",
      collectionName: "Hadith",
      documentId: String(doc._id),
      after: snapshot(doc),
      req,
    });

    return ok(doc.toJSON(), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
