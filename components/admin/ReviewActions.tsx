"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { errorMessage } from "./utils";

type Target = "published" | "draft" | null;

export function ReviewActions({
  id,
  canReview,
}: {
  id: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Target>(null);
  const [error, setError] = useState("");

  if (!canReview) return null;

  const run = async (status: "published" | "draft") => {
    setBusy(status);
    setError("");
    try {
      const res = await fetch(`/api/admin/research/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(data, "অনুরোধ ব্যর্থ হয়েছে"));
        return;
      }
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("published")}
          className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
        >
          {busy === "published" ? "প্রকাশ হচ্ছে…" : "প্রকাশ করুন"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("draft")}
          className="inline-flex items-center rounded-md border border-amber-600/40 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/20"
        >
          {busy === "draft" ? "ফেরত পাঠানো হচ্ছে…" : "ফেরত পাঠান"}
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
