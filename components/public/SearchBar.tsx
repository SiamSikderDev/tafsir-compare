"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Big search input — navigates to /search?q=… */
export function SearchBar({
  initial = "",
  autoFocus = false,
}: {
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form onSubmit={submit} role="search" className="w-full">
      <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition focus-within:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-within:border-neutral-600">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autoFocus}
          placeholder="আয়াত, তাফসীর বা হাদিস খুঁজুন…"
          aria-label="অনুসন্ধান"
          className="w-full bg-transparent px-5 py-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-50 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          className="shrink-0 bg-neutral-900 px-6 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
        >
          খুঁজুন
        </button>
      </div>
    </form>
  );
}
