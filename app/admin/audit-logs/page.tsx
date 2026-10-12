import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { Pagination } from "@/components/admin/Pagination";
import { FormField } from "@/components/admin/FormField";
import { TextInput, submitButtonClass } from "@/components/admin/fields";
import { formatDateTime, getPage, getParam, truncate } from "@/components/admin/utils";
import type { SerializedAuditLog } from "@/components/admin/types";

export const dynamic = "force-dynamic";

const LIMIT = 25;

function auditUser(u: SerializedAuditLog["userId"]): string {
  if (u && typeof u === "object") return u.name || u.email || "—";
  return "—";
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = getPage(sp);
  const action = (getParam(sp, "action") ?? "").trim();
  const collection = (getParam(sp, "collection") ?? "").trim();

  const filter: Record<string, string> = {};
  if (action) filter.action = action;
  if (collection) filter.collectionName = collection;

  await connectDB();
  const [total, docs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .populate("userId", "name email")
      .lean(),
  ]);
  const logs = JSON.parse(JSON.stringify(docs)) as SerializedAuditLog[];
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        অডিট লগ
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Audit logs · মোট {total}টি এন্ট্রি
      </p>

      <form
        method="get"
        action="/admin/audit-logs"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="w-52">
          <FormField label="অ্যাকশন" english="Action">
            <TextInput name="action" defaultValue={action} placeholder="create" />
          </FormField>
        </div>
        <div className="w-52">
          <FormField label="কালেকশন" english="Collection">
            <TextInput
              name="collection"
              defaultValue={collection}
              placeholder="ResearchNote"
            />
          </FormField>
        </div>
        <button type="submit" className={submitButtonClass}>
          ফিল্টার
        </button>
        {(action || collection) && (
          <a
            href="/admin/audit-logs"
            className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            মুছুন
          </a>
        )}
      </form>

      <div className="admin-scroll overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                সময়
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                ব্যবহারকারী
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                অ্যাকশন
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                কালেকশন
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                ডকুমেন্ট ID
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
                >
                  কোনো লগ পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr
                  key={l._id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(l.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {truncate(auditUser(l.userId), 30)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300">
                      {l.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {l.collectionName}
                  </td>
                  <td className="max-w-44 truncate px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {l.documentId ? truncate(l.documentId, 24) : "—"}
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
