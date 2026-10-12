"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "running" | "done";

/**
 * Publishes the user-approved Al-Fatihah tafsir entries (Ibn Kathir + Al-Mizan,
 * Bengali + English — 28 entries) with a single POST to
 * /api/admin/seed-tafsirs. Safe to re-run (server upserts idempotently).
 */
export function SeedTafsirsButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{
    total?: number;
    upserted?: number;
    matched?: number;
    error?: string;
  } | null>(null);
  const router = useRouter();

  async function handleClick() {
    setPhase("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-tafsirs", { method: "POST" });
      const data = (await res.json()) as {
        total?: number;
        upserted?: number;
        matched?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "ইমপোর্ট ব্যর্থ হয়েছে");
      setResult(data);
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "ইমপোর্ট ব্যর্থ হয়েছে",
      });
    }
    setPhase("done");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={phase === "running"}
        className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {phase === "running"
          ? "প্রকাশ হচ্ছে…"
          : "আল-ফাতিহার তাফসীর প্রকাশ করুন (২৮টি এন্ট্রি)"}
      </button>

      {phase === "done" && result && (
        <p role="status" className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {result.error
            ? `ব্যর্থ: ${result.error}`
            : `সম্পন্ন — ${result.upserted}টি নতুন, ${result.matched}টি আপডেট (${result.total}টির মধ্যে)।`}
        </p>
      )}
    </div>
  );
}
