"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/admin/fields";
import { ConfidenceBadge, EmptyState, GoldAyahNumber, SchoolChip, SectionLabel } from "./ui";
import type { ApiSearchItem } from "./types";

const TYPE_LABEL: Record<ApiSearchItem["type"], string> = {
  verse: "আয়াত",
  tafsir: "তাফসীর",
  hadith: "হাদিস",
  research: "গবেষণা",
};

function ResultCard({ item }: { item: ApiSearchItem }) {
  const inner = (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          {TYPE_LABEL[item.type]}
        </span>
        {item.school ? <SchoolChip school={item.school} /> : null}
        {item.confidence ? <ConfidenceBadge level={item.confidence} /> : null}
        {item.surahNumber && item.ayahNumber ? (
          <GoldAyahNumber n={`${item.surahNumber}:${item.ayahNumber}`} className="text-xs" />
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
        {item.snippet}
      </p>
      {item.sourceBook ? (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          সূত্র: {item.sourceBook}
        </p>
      ) : null}
    </>
  );

  const cls =
    "block rounded-lg border border-neutral-200 bg-white p-4 transition dark:border-neutral-800 dark:bg-black";
  return item.link ? (
    <Link href={item.link} className={`${cls} hover:border-neutral-400 dark:hover:border-neutral-600`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Debounced live search against /api/search. */
export function SearchClient({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<ApiSearchItem[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const needle = q.trim();
    if (!needle) {
      setResults(null);
      setState("idle");
      return;
    }
    setState("loading");
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(needle)}`);
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as ApiSearchItem[];
        setResults(data);
        setState("idle");
        router.replace(`/search?q=${encodeURIComponent(needle)}`, { scroll: false });
      } catch {
        setResults(null);
        setState("error");
      }
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div>
      <div className="mb-6 max-w-xl">
        <TextInput
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="আয়াত, তাফসীর বা হাদিস খুঁজুন…"
          aria-label="অনুসন্ধান"
          autoFocus
        />
      </div>

      {state === "loading" ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">খোঁজা হচ্ছে…</p>
      ) : null}

      {state === "error" ? (
        <EmptyState
          title="অনুসন্ধান এখনো প্রস্তুত নয়"
          body="ডাটাবেজে কনটেন্ট যোগ হওয়ার পর অনুসন্ধান চালু হবে।"
        />
      ) : null}

      {state === "idle" && results && results.length === 0 ? (
        <EmptyState
          title="কিছু পাওয়া যায়নি"
          body="অন্য শব্দে চেষ্টা করুন — আরবি, বাংলা বা ইংরেজিতে খুঁজতে পারেন।"
        />
      ) : null}

      {state === "idle" && !results && q.trim() === "" ? (
        <div className="max-w-xl">
          <SectionLabel>যেভাবে খুঁজবেন · How to search</SectionLabel>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <li>· আয়াতের অংশবিশেষ — আরবি, বাংলা বা ইংরেজিতে</li>
            <li>· তাফসীরের বইয়ের নাম — যেমন: ইবনে কাসীর, আল-মিযান</li>
            <li>· হাদিসের কিতাব — যেমন: বুখারী, আল-কাফী</li>
          </ul>
        </div>
      ) : null}

      {results && results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((item, i) => (
            <ResultCard key={i} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
