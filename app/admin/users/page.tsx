import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { UserForm } from "@/components/admin/UserForm";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { formatDateTime } from "@/components/admin/utils";
import { roleLabel, type SerializedUser } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const role = session?.user?.role ?? "viewer";

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-600/25 bg-rose-50 p-8 text-center dark:border-rose-500/25 dark:bg-rose-500/10">
          <p className="text-4xl font-semibold tracking-tight text-rose-600">403</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            শুধুমাত্র অ্যাডমিন
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Admin only · এই পৃষ্ঠা দেখার অনুমতি আপনার নেই।
          </p>
        </div>
      </div>
    );
  }

  await connectDB();
  const docs = await User.find({}).sort({ createdAt: -1 }).lean();
  const users = JSON.parse(JSON.stringify(docs)) as SerializedUser[];
  const ownId = session?.user?.id ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        ব্যবহারকারী
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Users · মোট {users.length} জন · শুধুমাত্র অ্যাডমিন
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="admin-scroll overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    নাম
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    ইমেইল
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    যোগ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    ভূমিকা
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {u.name}
                      {u._id === ownId ? (
                        <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                          (আপনি)
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleSelect
                        userId={u._id}
                        currentRole={u.role}
                        disabled={u._id === ownId}
                        userName={u.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            বর্তমান ভূমিকা: {roleLabel[role]} · নিজের সারির ভূমিকা পরিবর্তন
            নিষ্ক্রিয় রাখা হয়েছে।
          </p>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="mb-1 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            নতুন ব্যবহারকারী
          </h2>
          <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
            Create user · পাসওয়ার্ড কমপক্ষে ৮ অক্ষর
          </p>
          <UserForm />
        </section>
      </div>
    </div>
  );
}
