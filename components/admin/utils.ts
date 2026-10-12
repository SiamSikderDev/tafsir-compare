/** Pure helpers shared by server and client admin components. */

/** First value of a Next.js searchParam entry. */
export function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

/** Parse a page number from searchParams, clamped to >= 1. */
export function getPage(
  sp: Record<string, string | string[] | undefined>,
  fallback = 1,
): number {
  const raw = getParam(sp, "page");
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isInteger(n) && n >= 1 ? n : fallback;
}

/** Extract a human-readable message from an API error payload. */
export function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const e = (payload as { error: unknown }).error;
    if (typeof e === "string" && e.trim()) return e;
  }
  return fallback;
}

/** Parse a required integer input. Returns null when empty/invalid. */
export function toRequiredInt(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) ? n : null;
}

/**
 * Parse an optional integer input.
 * Returns undefined when empty, null when invalid, the number otherwise.
 */
export function toOptionalInt(v: string): number | undefined | null {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isInteger(n) ? n : null;
}

/** Split a textarea into trimmed, non-empty lines. */
export function toLines(v: string): string[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Parse comma-separated ObjectIds. Returns null when any entry is invalid.
 * Empty input yields an empty array.
 */
export function toObjectIds(v: string): string[] | null {
  const ids = v
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const id of ids) {
    if (!OBJECT_ID_RE.test(id)) return null;
  }
  return ids;
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

/** Format an ISO date string for the admin tables (server-side render). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
