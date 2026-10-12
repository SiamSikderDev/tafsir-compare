"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TextInput } from "@/components/admin/fields";
import { GoldAyahNumber } from "./ui";
import type { ApiSurah } from "./types";

const norm = (s: string) => s.toLowerCase().trim();

/** Client-side filterable surah list. */
export function SurahList({ surahs }: { surahs: ApiSurah[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = norm(q);
    if (!needle) return surahs;
    const asNum = Number(needle);
    return surahs.filter(
      (s) =>
        (!Number.isNaN(asNum) && s.number === asNum) ||
        norm(s.nameTransliterated).includes(needle) ||
        norm(s.nameEnglish).includes(needle) ||
        s.nameBengali.includes(q.trim()) ||
        s.nameArabic.includes(q.trim()),
    );
  }, [q, surahs]);

  return (
    <div>
      <div className="mb-6 max-w-md">
        <TextInput
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নাম বা নম্বর দিয়ে খুঁজুন… (যেমন: বাকারা, ২, Baqarah)"
          aria-label="সূরা খুঁজুন"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          কোনো সূরা পাওয়া যায়নি।
        </p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <li key={s.number}>
              <Link
                href={`/surah/${s.number}`}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-600"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-900">
                  <GoldAyahNumber n={s.number} className="text-base" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                    {s.nameTransliterated} · {s.nameBengali}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {s.totalAyahs} আয়াত ·{" "}
                    {s.revelationPlace === "makkah" ? "মাক্কী" : "মাদানী"}
                  </span>
                </span>
                <span
                  dir="rtl"
                  className="font-arabic shrink-0 text-xl text-neutral-700 dark:text-neutral-300"
                >
                  {s.nameArabic}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
