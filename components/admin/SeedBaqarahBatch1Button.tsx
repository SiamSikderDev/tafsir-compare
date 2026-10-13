"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "running" | "done";

/**
 * Publishes the user-approved Al-Baqarah 2:1–2:5 batch — 20 tafsirs
 * (Ibn Kathir + Al-Mizan, BN+EN), 9 hadiths (Sunni+Shia) and 10 per-verse
 * comparison research notes (BN+EN) — with a single POST to
 * /api/admin/seed-baqarah-batch-1. Safe to re-run (server upserts
 * idempotently). Only click after the research draft is approved.
 */
export function SeedBaqarahBatch1Button() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{
    tafsirs?: { upserted?: number; matched?: number };
    hadiths?: { upserted?: number; matched?: number };
    notes?: { upserted?: number; matched?: number };
    error?: string;
  } | null>(null);
  const router = useRouter();

  async function handleClick() {
    setPhase("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-baqarah-batch-1", { method: "POST" });
      const data = (await res.json()) as {
        tafsirs?: { upserted?: number; matched?: number };
        hadiths?: { upserted?: number; matched?: number };
        notes?: { upserted?: number; matched?: number };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "ইমপোর্ট ব্যর্থ হয়েছে");
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "ইমপোর্ট ব্যর্থ হয়েছে" });
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
        {phase === "running" ? "প্রকাশ হচ্ছে…" : "বাকারা ২:১–২:৫ প্রকাশ করুন (অনুমোদনের পর)"}
      </button>
      {phase === "done" && result && (
        <p role="status" className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {result.error
            ? `ব্যর্থ: ${result.error}`
            : `সম্পন্ন — তাফসীর ${result.tafsirs?.upserted}টি নতুন/${result.tafsirs?.matched}টি আপডেট, হাদিস ${result.hadiths?.upserted}টি নতুন/${result.hadiths?.matched}টি আপডেট, নোট ${result.notes?.upserted}টি নতুন/${result.notes?.matched}টি আপডেট।`}
        </p>
      )}
    </div>
  );
}
