import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Tafsir } from "@/models/Tafsir";
import { Pagination } from "@/components/admin/Pagination";
import { SchoolBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { getPage, getParam, truncate } from "@/components/admin/utils";
import {
  verseLabel,
  verseRefOf,
  type PublishStatus,
  type SerializedTafsir,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

const LIMIT = 20;
const STATUSES: { value: string; bn: string }[] = [
  { value: "", bn: "সব" },
  { value: "draft", bn: "খসড়া" },
  { value: "review", bn: "পর্যালোচনাধীন" },
  { value: "published", bn: "প্রকাশিত" },
];

export default async function TafsirsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = getPage(sp);
  const statusFilter = getParam(sp, "status") ?? "";
  const filter: Record<string, string> =
    statusFilter === "draft" || statusFilter === "review" || statusFilter === "published"
      ? { status: statusFilter }
      : {};

  await connectDB();
  const [total, docs] = await Promise.all([
    Tafsir.countDocuments(filter),
    Tafsir.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .populate("verseId", "surahNumber ayahNumber")
      .lean(),
  ]);
  const tafsirs = JSON.parse(JSON.stringify(docs)) as SerializedTafsir[];
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const tabCls = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900"
        : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            তাফসীর
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tafsir entries · মোট {total}টি
          </p>
        </div>
        <Link
          href="/admin/tafsirs/new"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
        >
          + নতুন তাফসীর
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/tafsirs?status=${s.value}` : "/admin/tafsirs"}
            className={tabCls(statusFilter === s.value)}
          >
            {s.bn}
          </Link>
        ))}
      </div>

      <div className="admin-scroll overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                গ্রন্থ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                লেখক
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                আয়াত
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                ধারা
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                অবস্থা
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                কাজ
              </th>
            </tr>
          </thead>
          <tbody>
            {tafsirs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
                >
                  কোনো তাফসীর পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              tafsirs.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                >
                  <td className="max-w-56 truncate px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {truncate(t.bookTitle, 50)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {truncate(t.author, 30)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-gold-600 dark:text-gold-400">
                    {verseLabel(verseRefOf(t.verseId))}
                  </td>
                  <td className="px-4 py-3">
                    <SchoolBadge school={t.school} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status as PublishStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/tafsirs/${t._id}`}
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
