"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  const btn =
    "inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-black dark:text-neutral-200 dark:hover:bg-neutral-900";

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        পৃষ্ঠা {page} / {totalPages}
        <span className="ml-1 text-xs opacity-70">
          (Page {page} of {totalPages})
        </span>
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn}>
            ← আগের
          </Link>
        ) : (
          <span className={btn} aria-disabled>
            ← আগের
          </span>
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={btn}>
            পরের →
          </Link>
        ) : (
          <span className={btn} aria-disabled>
            পরের →
          </span>
        )}
      </div>
    </div>
  );
}
