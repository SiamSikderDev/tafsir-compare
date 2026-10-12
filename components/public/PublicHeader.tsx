import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoMark } from "./ui";

const NAV = [
  { href: "/surah", bn: "সূরা", en: "Surahs" },
  { href: "/search", bn: "খুঁজুন", en: "Search" },
  { href: "/about", bn: "পদ্ধতি", en: "Method" },
  { href: "/sources", bn: "সূত্র", en: "Sources" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              তাফসীর তুলনা
            </span>
            <span className="block text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
              Tafsir Compare
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.en}
              className="rounded-md px-2 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 sm:px-3 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
            >
              {item.bn}
            </Link>
          ))}
          <span className="ml-1">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
