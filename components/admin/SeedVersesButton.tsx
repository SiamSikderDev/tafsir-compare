"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "running" | "done";

const TOTAL_SURAHS = 114;

/**
 * Imports all 6,236 verses (verified Tanzil Arabic + Saheeh International
 * English) by POSTing each surah sequentially to /api/admin/seed-verses.
 * Shows a progress bar; safe to re-run (server upserts idempotently).
 */
export function SeedVersesButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(0);
  const [upserted, setUpserted] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const router = useRouter();

  async function handleClick() {
    setPhase("running");
    setDone(0);
    setUpserted(0);
    setFailed([]);
    let total = 0;
    const bad: number[] = [];
    for (let s = 1; s <= TOTAL_SURAHS; s += 1) {
      try {
        const res = await fetch("/api/admin/seed-verses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ surahNumber: s }),
        });
        const data = (await res.json()) as {
          upserted?: number;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? `সূরা ${s} ব্যর্থ`);
        total += data.upserted ?? 0;
      } catch {
        bad.push(s);
      }
      setDone(s);
      setUpserted(total);
    }
    setFailed(bad);
    setPhase("done");
    router.refresh();
  }

  const pct = Math.round((done / TOTAL_SURAHS) * 100);

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={phase === "running"}
        className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {phase === "running"
          ? `ইমপোর্ট হচ্ছে… ${done}/${TOTAL_SURAHS}`
          : "৬২৩৬ আয়াত ইমপোর্ট করুন (আরবি + ইংরেজি)"}
      </button>

      {(phase === "running" || phase === "done") && (
        <div className="mt-3 max-w-md">
          <div
            className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={TOTAL_SURAHS}
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p role="status" className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {phase === "running"
              ? `${done}/${TOTAL_SURAHS} সূরা সম্পন্ন (${pct}%)`
              : failed.length === 0
                ? `সম্পন্ন — মোট ${upserted}টি আয়াত ইমপোর্ট/আপডেট হয়েছে।`
                : `সম্পন্ন, তবে ${failed.length}টি সূরায় সমস্যা হয়েছে: ${failed.join(", ")} — আবার চেষ্টা করুন।`}
          </p>
        </div>
      )}
    </div>
  );
}
