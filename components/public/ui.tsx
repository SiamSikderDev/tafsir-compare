import type { ReactNode } from "react";
import type { Confidence, TafsirSchool } from "./types";

/** Tiny uppercase section label, Geist-style. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
      {children}
    </p>
  );
}

/** Verse number rendered in gold. */
export function GoldAyahNumber({
  n,
  className = "",
}: {
  n: number | string;
  className?: string;
}) {
  return (
    <span className={`font-semibold text-gold-600 dark:text-gold-400 ${className}`}>
      {n}
    </span>
  );
}

/** School chip: সুন্নি / শিয়া / উভয়. */
export function SchoolChip({ school }: { school: TafsirSchool | string }) {
  const label =
    school === "sunni" ? "সুন্নি" : school === "shia" ? "শিয়া" : "উভয় মত";
  const cls =
    school === "sunni"
      ? "border-pine-600/30 bg-pine-50 text-pine-700 dark:border-pine-500/30 dark:bg-pine-500/10 dark:text-pine-300"
      : school === "shia"
        ? "border-gold-600/30 bg-gold-300/15 text-gold-600 dark:border-gold-400/30 dark:bg-gold-400/10 dark:text-gold-300"
        : "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

/** Research confidence badge. */
export function ConfidenceBadge({ level }: { level: Confidence | string }) {
  const label =
    level === "high" ? "উচ্চ আস্থা" : level === "medium" ? "মাঝারি আস্থা" : "প্রাথমিক";
  const cls =
    level === "high"
      ? "border-pine-600/30 bg-pine-50 text-pine-700 dark:border-pine-500/30 dark:bg-pine-500/10 dark:text-pine-300"
      : level === "medium"
        ? "border-gold-600/30 bg-gold-300/15 text-gold-600 dark:border-gold-400/30 dark:bg-gold-400/10 dark:text-gold-300"
        : "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400";
  return (
    <span
      title="Research confidence level"
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

/** Intentional empty state — never an error look. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-10 text-center dark:border-neutral-700 dark:bg-neutral-950">
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** One-line inline source citation for a tafsir entry. */
export function CitationLine({
  bookTitle,
  author,
  volume,
  page,
  publisher,
  publicationYear,
  sourceUrl,
}: {
  bookTitle: string;
  author?: string;
  volume?: string;
  page?: string;
  publisher?: string;
  publicationYear?: number;
  sourceUrl?: string;
}) {
  const parts = [
    bookTitle,
    author,
    volume ? `খণ্ড ${volume}` : undefined,
    page ? `পৃ. ${page}` : undefined,
    publisher,
    publicationYear ? String(publicationYear) : undefined,
  ].filter(Boolean);
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      <span className="font-semibold uppercase tracking-wide">সূত্র · </span>
      {parts.join(" · ")}
      {sourceUrl ? (
        <>
          {" · "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            লিংক
          </a>
        </>
      ) : null}
    </p>
  );
}

/** Logo mark used across public pages. */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "sm" ? "h-8 w-8 text-lg" : size === "lg" ? "h-14 w-14 text-3xl" : "h-10 w-10 text-xl";
  return (
    <span
      aria-hidden
      dir="rtl"
      className={`font-arabic flex ${dims} items-center justify-center rounded-lg bg-pine-700 font-bold text-white dark:bg-pine-600`}
    >
      ت
    </span>
  );
}
