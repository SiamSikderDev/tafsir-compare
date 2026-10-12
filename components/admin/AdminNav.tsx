"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "./types";

interface NavLink {
  href: string;
  bn: string;
  en: string;
  adminOnly?: boolean;
}

const LINKS: NavLink[] = [
  { href: "/admin", bn: "ড্যাশবোর্ড", en: "Dashboard" },
  { href: "/admin/verses", bn: "আয়াত", en: "Verses" },
  { href: "/admin/tafsirs", bn: "তাফসীর", en: "Tafsir" },
  { href: "/admin/hadiths", bn: "হাদিস", en: "Hadith" },
  { href: "/admin/research", bn: "গবেষণা নোট", en: "Research" },
  { href: "/admin/references", bn: "রেফারেন্স", en: "References" },
  { href: "/admin/review", bn: "রিভিউ কিউ", en: "Review queue" },
  { href: "/admin/audit-logs", bn: "অডিট লগ", en: "Audit logs" },
  { href: "/admin/users", bn: "ব্যবহারকারী", en: "Users", adminOnly: true },
];

export function AdminNav({
  role,
  variant,
}: {
  role: Role;
  variant: "sidebar" | "topbar";
}) {
  const pathname = usePathname() ?? "";
  const links = LINKS.filter((l) => !l.adminOnly || role === "admin");

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  const base =
    "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition whitespace-nowrap";
  const activeCls =
    "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white";
  const idleCls =
    "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100";

  return (
    <nav
      aria-label="অ্যাডমিন নেভিগেশন"
      className={
        variant === "sidebar"
          ? "flex flex-col gap-1"
          : "admin-scroll flex gap-1 overflow-x-auto"
      }
    >
      {links.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`${base} ${active ? activeCls : idleCls}`}
          >
            {variant === "sidebar" && active ? (
              <span
                aria-hidden
                className="absolute left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-pine-700 dark:bg-pine-500"
              />
            ) : null}
            <span>{l.bn}</span>
            <span className="text-[11px] font-normal opacity-60">{l.en}</span>
          </Link>
        );
      })}
    </nav>
  );
}
