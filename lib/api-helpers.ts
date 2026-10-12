import { ZodError } from "zod";
import { isRateLimited, rateLimitHeaders } from "@/lib/rate-limit";

/** Best-effort client IP: first entry of x-forwarded-for, else x-real-ip. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Returns a 429 Response when the caller's IP is over the rate limit,
 * or null when the request may proceed. Public routes should return the
 * Response immediately when non-null.
 */
export function checkRateLimit(req: Request): Response | null {
  if (isRateLimited(clientIp(req))) {
    return Response.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: rateLimitHeaders() },
    );
  }
  return null;
}

/** Parses the request body as JSON. Throws a 400 Response on invalid JSON. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }
}

/** Success JSON response. */
export function ok(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

/** Error JSON response shaped as { error, ...extra }. */
export function fail(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
): Response {
  return Response.json({ error: message, ...(extra ?? {}) }, { status });
}

/**
 * Standard route error mapper:
 * - thrown Response (from requireRole / readJson) → returned as-is
 * - ZodError → 400 with issues
 * - MongoDB duplicate key (11000) → 409
 * - anything else → logged, 500
 */
export function handleRouteError(err: unknown): Response {
  if (err instanceof Response) return err;
  if (err instanceof ZodError) {
    return fail(400, "Validation failed.", { issues: err.issues });
  }
  if (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  ) {
    return fail(
      409,
      "Duplicate record — a document with these unique fields already exists.",
    );
  }
  console.error("[api] unhandled route error:", err);
  return fail(500, "Internal server error.");
}
