/**
 * Same-origin fetch helper for public pages.
 * Returns null on any failure (network, non-2xx, bad JSON) so pages can
 * render intentional empty states instead of throwing.
 *
 * NOTE: server components cannot fetch() a relative URL (no base URL), so on
 * the server we build an absolute URL from the request headers. The
 * next/headers import is dynamic so this module stays client-safe.
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    let url = path;
    if (typeof window === "undefined") {
      const { headers } = await import("next/headers");
      const h = await headers();
      const host =
        h.get("x-forwarded-host") ?? h.get("host") ?? "";
      if (host) {
        const proto = h.get("x-forwarded-proto") ?? "https";
        url = `${proto}://${host}${path}`;
      } else {
        url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tafsir-compare-siamsikderdevs-projects.vercel.app"}${path}`;
      }
    }
    const res = await fetch(url, {
      cache: "no-store",
      // Fail fast so a slow/unreachable DB renders empty states instead of hanging.
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Absolute site URL for metadata / share links. Falls back to the live domain. */
export function siteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "";
  return (
    fromEnv.replace(/\/$/, "") ||
    "https://tafsir-compare-siamsikderdevs-projects.vercel.app"
  );
}
