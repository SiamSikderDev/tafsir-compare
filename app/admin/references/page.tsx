import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Reference } from "@/models/Reference";
import { Pagination } from "@/components/admin/Pagination";
import { formatDateTime, getPage, truncate } from "@/components/admin/utils";
import type { SerializedReference } from "@/components/admin/types";

export const dynamic = "force-dynamic";

const LIMIT = 20;

const TYPE_BN: Record<string, string> = {
  tafsir: "তাফসীর",
  hadith: "হাদিস",
  book: "বই",
  article: "প্রবন্ধ",
  dictionary: "অভিধান",
  manuscript: "পাণ্ডুলিপি",
};

export default async function ReferencesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = getPage(sp);

  await connectDB();
  const [total, docs] = await Promise.all([
    Reference.countDocuments(),
    Reference.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean(),
  ]);
  const refs = JSON.parse(JSON.stringify(docs)) as SerializedReference[];
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            রেফারেন্স
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            References · মোট {total}টি
          </p>
        </div>
        <Link
          href="/admin/references/new"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
        >
          + নতুন রেফারেন্স
        </Link>
      </div>

      <div className="admin-scroll overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                শিরোনাম
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                ধরন
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                লেখক
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                যোগ
              </th>
            </tr>
          </thead>
          <tbody>
            {refs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
                >
                  কোনো রেফারেন্স যোগ করা হয়নি।
                </td>
              </tr>
            ) : (
              refs.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                >
                  <td className="max-w-72 truncate px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {truncate(r.title, 70)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300">
                      {TYPE_BN[r.type] ?? r.type}
                    </span>
                  </td>
                  <td className="max-w-44 truncate px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {r.author ? truncate(r.author, 30) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(r.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
