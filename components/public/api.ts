/**
 * Same-origin fetch helper for public pages.
 * Returns null on any failure (network, non-2xx, bad JSON) so pages can
 * render intentional empty states instead of throwing.
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, {
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
  return fromEnv.replace(/\/$/, "") || "https://tafsir-compare.vercel.app";
}
