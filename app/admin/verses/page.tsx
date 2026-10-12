import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { Pagination } from "@/components/admin/Pagination";
import { truncate, getPage } from "@/components/admin/utils";
import type { SerializedVerse } from "@/components/admin/types";

export const dynamic = "force-dynamic";

const LIMIT = 20;

export default async function VersesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = getPage(sp);
  const limitRaw = sp.limit;
  const limit =
    typeof limitRaw === "string" && Number.parseInt(limitRaw, 10) > 0
      ? Math.min(Number.parseInt(limitRaw, 10), 100)
      : LIMIT;

  await connectDB();
  const [total, docs] = await Promise.all([
    Verse.countDocuments(),
    Verse.find({})
      .sort({ surahNumber: 1, ayahNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);
  const verses = JSON.parse(JSON.stringify(docs)) as SerializedVerse[];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            আয়াত
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Verses · মোট {total}টি
          </p>
        </div>
        <Link
          href="/admin/verses/new"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
        >
          + নতুন আয়াত
        </Link>
      </div>

      <div className="admin-scroll overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                সূরা:আয়াত
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                আরবি পাঠ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                বাংলা অনুবাদ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                কাজ
              </th>
            </tr>
          </thead>
          <tbody>
            {verses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
                >
                  কোনো আয়াত যোগ করা হয়নি।
                </td>
              </tr>
            ) : (
              verses.map((v) => (
                <tr
                  key={v._id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-gold-600 dark:text-gold-400">
                    {v.surahNumber}:{v.ayahNumber}
                  </td>
                  <td
                    dir="rtl"
                    className="font-arabic max-w-xs truncate px-4 py-3 text-base text-neutral-900 dark:text-neutral-100"
                  >
                    {truncate(v.arabicText, 60)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {truncate(v.bengaliTranslation || "—", 60)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/verses/${v._id}`}
                      className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                    >
                      সম্পাদনা
                    </Link>
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
