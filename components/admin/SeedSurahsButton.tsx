"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SeedState = "idle" | "loading" | "success" | "error";

export function SeedSurahsButton() {
  const [state, setState] = useState<SeedState>("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleClick() {
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/seed-surahs", { method: "POST" });
      const data = (await res.json()) as {
        seeded?: number;
        error?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "সিড করতে ব্যর্থ হয়েছে।");
      setState("success");
      setMessage(
        data.seeded && data.seeded > 0
          ? `সফলভাবে ${data.seeded}টি সূরার তথ্য সিড হয়েছে।`
          : "সূরার তথ্য আগেই সিড করা আছে।",
      );
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(
        err instanceof Error ? err.message : "একটি অজানা ত্রুটি ঘটেছে।",
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {state === "loading" ? "সিড হচ্ছে…" : "১১৪ সূরার তথ্য সিড করুন"}
      </button>
      {message && (
        <p
          role="status"
          className={`mt-2 text-sm ${
            state === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
