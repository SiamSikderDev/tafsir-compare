export const dynamic = "force-dynamic";

import { TAFSIR_SOURCES, type TafsirSchool } from "@/lib/tafsir-sources";
import { checkRateLimit, handleRouteError } from "@/lib/api-helpers";

/**
 * GET /api/tafsir-sources — canonical tafsir source bibliography.
 * Optional ?school=sunni|shia filter. Static data; no DB involved.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const limited = checkRateLimit(req);
    if (limited) return limited;

    const url = new URL(req.url);
    const school = url.searchParams.get("school");
    if (school !== null && school !== "sunni" && school !== "shia") {
      return Response.json(
        { error: "school অবশ্যই sunni বা shia হতে হবে।" },
        { status: 400 },
      );
    }
    const list = school
      ? TAFSIR_SOURCES.filter((s) => s.school === (school as TafsirSchool))
      : TAFSIR_SOURCES;
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
