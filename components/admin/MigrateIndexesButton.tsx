"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "running" | "done";

/**
 * One-time index fix: drops legacy text indexes that broke writes
 * (language_override collided with our `language` field). Run once,
 * then use the tafsir publish button.
 */
export function MigrateIndexesButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{ dropped?: string[]; error?: string } | null>(null);
  const router = useRouter();

  async function handleClick() {
    setPhase("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/migrate-indexes", { method: "POST" });
      const data = (await res.json()) as { dropped?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "ব্যর্থ হয়েছে");
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "ব্যর্থ হয়েছে" });
    }
    setPhase("done");
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={phase === "running"}
        className="inline-flex h-8 items-center rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {phase === "running" ? "ঠিক হচ্ছে…" : "ডাটাবেজ ইনডেক্স ঠিক করুন (একবার)"}
      </button>
      {phase === "done" && result && (
        <p role="status" className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          {result.error
            ? `ব্যর্থ: ${result.error}`
            : `সম্পন্ন — ${result.dropped?.length ?? 0}টি ইনডেক্স ঠিক হয়েছে।`}
        </p>
      )}
    </div>
  );
}
