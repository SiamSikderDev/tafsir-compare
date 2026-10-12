import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ResearchNote } from "@/models/ResearchNote";
import { Tafsir } from "@/models/Tafsir";
import { Hadith } from "@/models/Hadith";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { ConfidenceBadge } from "@/components/admin/StatusBadge";
import { formatDateTime, truncate } from "@/components/admin/utils";
import {
  verseLabel,
  verseRefOf,
  type Confidence,
  type SerializedResearchNote,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const session = await auth();
  const role = session?.user?.role ?? "viewer";
  const canReview = role === "admin" || role === "reviewer";

  await connectDB();
  const [tafsirsInReview, hadithsInReview, docs] = await Promise.all([
    Tafsir.countDocuments({ status: "review" }),
    Hadith.countDocuments({ status: "review" }),
    ResearchNote.find({ status: "review" })
      .sort({ updatedAt: -1 })
      .populate("verseId", "surahNumber ayahNumber")
      .lean(),
  ]);
  const notes = JSON.parse(JSON.stringify(docs)) as SerializedResearchNote[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        রিভিউ কিউ
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Review queue · প্রকাশের অপেক্ষায় থাকা বিষয়বস্তু
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/tafsirs?status=review"
          className="rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
        >
          <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {tafsirsInReview}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            পর্যালোচনাধীন তাফসীর
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            তালিকা দেখুন →
          </p>
        </Link>
        <Link
          href="/admin/hadiths?status=review"
          className="rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
        >
          <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {hadithsInReview}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            পর্যালোচনাধীন হাদিস
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            তালিকা দেখুন →
          </p>
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        গবেষণা নোট — পর্যালোচনার অপেক্ষায় ({notes.length})
      </h2>

      {!canReview && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          আপনার ভূমিকায় প্রকাশ/ফেরতের অনুমতি নেই — শুধুমাত্র পর্যালোচক ও
          অ্যাডমিন এই কাজ করতে পারেন।
        </p>
      )}

      {notes.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          কোনো গবেষণা নোট পর্যালোচনার অপেক্ষায় নেই।
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((n) => (
            <article
              key={n._id}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {truncate(n.title, 80)}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    আয়াত {verseLabel(verseRefOf(n.verseId))} · হালনাগাদ{" "}
                    {formatDateTime(n.updatedAt)}
                    {n.reviewer ? ` · পর্যালোচক: ${n.reviewer}` : ""}
                  </p>
                </div>
                <ConfidenceBadge confidence={n.confidence as Confidence} />
              </div>
              {n.context ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {truncate(n.context, 160)}
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-900">
                <Link
                  href={`/admin/research/${n._id}`}
                  className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                >
                  সম্পূর্ণ দেখুন / সম্পাদনা
                </Link>
                <span className="flex-1" />
                <ReviewActions id={n._id} canReview={canReview} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
