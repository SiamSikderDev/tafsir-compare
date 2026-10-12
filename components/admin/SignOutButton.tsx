"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-black dark:text-neutral-300 dark:hover:bg-neutral-900"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      সাইন আউট
    </button>
  );
}
