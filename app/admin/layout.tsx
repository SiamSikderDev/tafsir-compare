import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { roleLabel, type Role } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // x-pathname is set by middleware; the login page must render without a session.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (!session?.user && !isLoginPage) {
    redirect("/admin/login");
  }

  // Login page: minimal centered shell (middleware already keeps signed-in users out).
  if (isLoginPage && !session?.user) {
    return <>{children}</>;
  }

  const role = (session?.user?.role ?? "viewer") as Role;
  const name = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              dir="rtl"
              className="font-arabic flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pine-700 text-lg font-bold text-white dark:bg-pine-600"
            >
              ت
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                তাফসীর তুলনা — অ্যাডমিন
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Tafsir Compare · Admin panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {roleLabel[role]}
              </p>
            </div>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
        <div className="border-t border-neutral-100 px-4 py-2 sm:px-6 lg:hidden dark:border-neutral-900">
          <AdminNav role={role} variant="topbar" />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-24 hidden w-60 shrink-0 lg:block">
          <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
            <div className="mb-2 flex items-center gap-2.5 border-b border-neutral-100 px-2 pb-3 dark:border-neutral-900">
              <span
                aria-hidden
                dir="rtl"
                className="font-arabic flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-pine-700 text-base font-bold text-white dark:bg-pine-600"
              >
                ت
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                  তাফসীর তুলনা
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Admin
                </p>
              </div>
            </div>
            <AdminNav role={role} variant="sidebar" />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
