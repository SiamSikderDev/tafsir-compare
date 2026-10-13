"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CitationLine,
  ConfidenceBadge,
  EmptyState,
  GoldAyahNumber,
  SchoolChip,
  SectionLabel,
} from "./ui";
import type { ApiHadith, ApiResearchNote, ApiTafsir, ApiVerse } from "./types";

type TabId = "sunni" | "shia" | "hadith" | "nuzul" | "compare" | "refs";

const TABS: { id: TabId; bn: string; en: string }[] = [
  { id: "sunni", bn: "সুন্নি তাফসীর", en: "Sunni tafsir" },
  { id: "shia", bn: "শিয়া তাফসীর", en: "Shia tafsir" },
  { id: "hadith", bn: "হাদিস", en: "Hadith" },
  { id: "nuzul", bn: "শান-এ-নুযূল", en: "Occasion of revelation" },
  { id: "compare", bn: "তুলনা", en: "Comparison" },
  { id: "refs", bn: "সূত্র", en: "References" },
];

const BOOKMARK_KEY = "tafsir-compare:bookmarks";

function bookmarkKey(s: number, a: number) {
  return `${s}:${a}`;
}

function readBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function ActionButton({
  onClick,
  label,
  active,
  d,
  activeD,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  d: string;
  activeD?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-pine-600/40 bg-pine-50 text-pine-700 dark:border-pine-500/40 dark:bg-pine-500/10 dark:text-pine-300"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-neutral-50"
      }`}
    >
      <Icon d={active && activeD ? activeD : d} />
      {label}
    </button>
  );
}

function TafsirEntry({ t }: { t: ApiTafsir }) {
  const [expanded, setExpanded] = useState(false);
  const long = (t.fullText ?? "").length > 700;
  const body = !long || expanded ? t.fullText : `${t.fullText?.slice(0, 700)}…`;

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SchoolChip school={t.school} />
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {t.bookTitle}
        </h3>
      </div>
      {t.author ? (
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          লেখক: {t.author}
        </p>
      ) : null}
      {t.mentionsAliAhlulBayt !== undefined ? (
        <p
          className={`mb-3 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            t.mentionsAliAhlulBayt
              ? "border-pine-600/40 bg-pine-50 text-pine-700 dark:border-pine-500/40 dark:bg-pine-500/10 dark:text-pine-300"
              : "border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
          }`}
        >
          {t.mentionsAliAhlulBayt
            ? "আলী/আহলুল বাইত উল্লেখ আছে"
            : "আলী/আহলুল বাইত উল্লেখ নেই"}
        </p>
      ) : null}
      {t.mentionNote ? (
        <p className="mb-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {t.mentionNote}
        </p>
      ) : null}
      {t.summary ? (
        <p className="text-[15px] font-medium leading-relaxed text-neutral-800 dark:text-neutral-100">
          {t.summary}
        </p>
      ) : null}
      {body ? (
        <div className="mt-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {body}
          </p>
          {long ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-pine-700 underline underline-offset-2 dark:text-pine-400"
            >
              {expanded ? "সংক্ষেপ করুন" : "পুরো পড়ুন"}
            </button>
          ) : null}
        </div>
      ) : null}
      {t.keyPoints && t.keyPoints.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-1.5">
          {t.keyPoints.map((k, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-300"
            >
              <span aria-hidden className="text-gold-600 dark:text-gold-400">
                •
              </span>
              <span>{k}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-900">
        <CitationLine
          bookTitle={t.bookTitle}
          author={t.author}
          volume={t.volume}
          page={t.page}
          publisher={t.publisher}
          publicationYear={t.publicationYear}
          sourceUrl={t.sourceUrl}
        />
      </div>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
          <span aria-hidden className="mt-0.5 text-gold-600 dark:text-gold-400">
            ◆
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function HadithCard({ h }: { h: ApiHadith }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {h.collectionName}
          {h.hadithNumber ? ` · ${h.hadithNumber}` : ""}
        </p>
        {h.evidenceTier ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
              h.evidenceTier === "primary"
                ? "border-pine-600/40 bg-pine-50 text-pine-700 dark:border-pine-500/40 dark:bg-pine-500/10 dark:text-pine-300"
                : "border-gold-600/40 bg-gold-50 text-gold-700 dark:border-gold-500/40 dark:bg-gold-500/10 dark:text-gold-300"
            }`}
          >
            {h.evidenceTier === "primary" ? "প্রাইমারি প্রমাণ" : "বিতর্কিত/প্রাসঙ্গিক"}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        {h.narrator ? <span>বর্ণনাকারী: {h.narrator}</span> : null}
        {h.grading ? <span>মান: {h.grading}</span> : null}
        {h.book ? <span>গ্রন্থ: {h.book}</span> : null}
      </div>
      {h.arabicText ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic mt-3 text-right text-lg leading-loose text-neutral-900 dark:text-neutral-50"
        >
          {h.arabicText}
        </p>
      ) : null}
      {h.bengaliTranslation ? (
        <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
          {h.bengaliTranslation}
        </p>
      ) : null}
      {h.englishTranslation ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {h.englishTranslation}
        </p>
      ) : null}
      {h.relevanceNote ? (
        <p className="mt-2 text-xs leading-relaxed text-pine-700 dark:text-pine-400">
          {h.relevanceNote}
        </p>
      ) : null}
      {h.notes ? (
        <p className="mt-2 text-xs italic text-neutral-400 dark:text-neutral-500">
          {h.notes}
        </p>
      ) : null}
    </article>
  );
}

function HadithTieredList({ hadiths }: { hadiths: ApiHadith[] }) {
  const primary = hadiths.filter(
    (h) => h.school === "sunni" && h.evidenceTier === "primary",
  );
  const disputed = hadiths.filter(
    (h) => h.school === "sunni" && h.evidenceTier === "disputed",
  );
  const shia = hadiths.filter((h) => h.school === "shia");
  const untiered = hadiths.filter(
    (h) => h.school !== "shia" && !h.evidenceTier,
  );
  const hasTiers = primary.length > 0 || disputed.length > 0;

  if (!hasTiers) {
    return (
      <div className="flex flex-col gap-4">
        {hadiths.map((h) => (
          <HadithCard key={h._id} h={h} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {primary.length > 0 ? (
        <section>
          <SectionLabel>প্রাইমারি সুন্নি প্রমাণ · Sahih/Hasan</SectionLabel>
          <div className="mt-3 flex flex-col gap-4">
            {primary.map((h) => (
              <HadithCard key={h._id} h={h} />
            ))}
          </div>
        </section>
      ) : null}
      {disputed.length > 0 ? (
        <section>
          <SectionLabel>বিতর্কিত / প্রাসঙ্গিক প্রমাণ · Disputed</SectionLabel>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            দুর্বল বা বিতর্কিত বর্ণনা — সুন্নি ও শিয়া উভয় অবস্থান সৎভাবে তুলে ধরা হয়েছে।
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {disputed.map((h) => (
              <HadithCard key={h._id} h={h} />
            ))}
          </div>
        </section>
      ) : null}
      {untiered.length > 0 ? (
        <section>
          <SectionLabel>অন্যান্য হাদিস</SectionLabel>
          <div className="mt-3 flex flex-col gap-4">
            {untiered.map((h) => (
              <HadithCard key={h._id} h={h} />
            ))}
          </div>
        </section>
      ) : null}
      {shia.length > 0 ? (
        <section>
          <SectionLabel>শিয়া হাদিস প্রমাণ</SectionLabel>
          <div className="mt-3 flex flex-col gap-4">
            {shia.map((h) => (
              <HadithCard key={h._id} h={h} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function VerseInteractive({
  verse,
  surahName,
  tafsirs,
  research,
  shareUrl,
}: {
  verse: ApiVerse;
  surahName: string;
  tafsirs: ApiTafsir[];
  research: ApiResearchNote | null;
  shareUrl: string;
}) {
  const [tab, setTab] = useState<TabId>("sunni");
  const [reading, setReading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState("");
  const [hadiths, setHadiths] = useState<ApiHadith[] | null>(null);

  const key = bookmarkKey(verse.surahNumber, verse.ayahNumber);
  const refLabel = `${verse.surahNumber}:${verse.ayahNumber}`;

  useEffect(() => {
    setBookmarked(readBookmarks().includes(key));
  }, [key]);

  useEffect(() => {
    if (tab !== "hadith" || hadiths !== null) return;
    let cancelled = false;
    fetch(`/api/verses/${verse.surahNumber}/${verse.ayahNumber}/hadiths`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (!cancelled) setHadiths(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        if (!cancelled) setHadiths([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, hadiths, verse.surahNumber, verse.ayahNumber]);

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const copyText = async () => {
    const text = `${verse.arabicText}\n\n${verse.bengaliTranslation}\n\n— সূরা ${surahName} ${refLabel} · তাফসীর তুলনা`;
    try {
      await navigator.clipboard.writeText(text);
      flash("কপি হয়েছে");
    } catch {
      flash("কপি করা যায়নি");
    }
  };

  const share = async () => {
    const data = {
      title: `সূরা ${surahName} ${refLabel} — তাফসীর তুলনা`,
      text: verse.bengaliTranslation,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      flash("লিংক কপি হয়েছে");
    } catch {
      /* user dismissed */
    }
  };

  const toggleBookmark = () => {
    const marks = readBookmarks();
    const next = marks.includes(key)
      ? marks.filter((m) => m !== key)
      : [...marks, key];
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setBookmarked(next.includes(key));
    flash(next.includes(key) ? "বুকমার্ক হয়েছে" : "বুকমার্ক সরানো হয়েছে");
  };

  const sunniTafsirs = useMemo(
    () => tafsirs.filter((t) => t.school === "sunni" || t.school === "shared"),
    [tafsirs],
  );
  const shiaTafsirs = useMemo(
    () => tafsirs.filter((t) => t.school === "shia" || t.school === "shared"),
    [tafsirs],
  );

  const refs = research?.references ?? [];
  const agreements = research?.comparison?.agreements ?? [];
  const differences = research?.comparison?.differences ?? [];

  return (
    <div>
      {/* Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="toolbar" aria-label="আয়াত অ্যাকশন">
        <ActionButton
          onClick={copyText}
          label="কপি"
          d="M8 8h12v12H8z M4 16V4h12"
        />
        <ActionButton
          onClick={share}
          label="শেয়ার"
          d="M12 3v12m0-12L8 7m4-4 4 4-4M5 12v8h14v-8"
        />
        <ActionButton
          onClick={toggleBookmark}
          label={bookmarked ? "বুকমার্কড" : "বুকমার্ক"}
          active={bookmarked}
          d="M6 3h12v18l-6-4-6 4z"
          activeD="M6 3h12v18l-6-4-6 4z"
        />
        <ActionButton
          onClick={() => setReading((v) => !v)}
          label={reading ? "সাধারণ মোড" : "পাঠ মোড"}
          active={reading}
          d="M4 5h16M4 12h16M4 19h10"
        />
        {notice ? (
          <span role="status" className="text-xs font-medium text-pine-700 dark:text-pine-400">
            {notice}
          </span>
        ) : null}
      </div>

      {reading ? (
        <div className="mx-auto max-w-2xl py-8">
          <p dir="rtl" className="font-arabic text-center text-3xl leading-loose text-neutral-900 sm:text-4xl dark:text-neutral-50">
            {verse.arabicText}
          </p>
          <p className="mt-8 text-center text-lg leading-relaxed text-neutral-700 dark:text-neutral-200">
            {verse.bengaliTranslation}
          </p>
          {verse.englishTranslation ? (
            <p className="mt-4 text-center text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
              {verse.englishTranslation}
            </p>
          ) : null}
          <p className="mt-8 text-center">
            <GoldAyahNumber n={refLabel} className="text-lg" />
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="তাফসীর ট্যাব"
              className="flex gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  title={t.en}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                    tab === t.id
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-50"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  {t.bn}
                </button>
              ))}
            </div>
            {research?.confidence ? <ConfidenceBadge level={research.confidence} /> : null}
          </div>

          <div role="tabpanel" className="mt-4">
            {tab === "sunni" &&
              (sunniTafsirs.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {sunniTafsirs.map((t) => (
                    <TafsirEntry key={t._id} t={t} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="এখনো কোনো সুন্নি তাফসীর প্রকাশিত হয়নি"
                  body="এই আয়াতের সুন্নি তাফসীর গবেষণাধীন আছে। যাচাই শেষে এখানে প্রকাশ করা হবে।"
                />
              ))}

            {tab === "shia" &&
              (shiaTafsirs.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {shiaTafsirs.map((t) => (
                    <TafsirEntry key={t._id} t={t} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="এখনো কোনো শিয়া তাফসীর প্রকাশিত হয়নি"
                  body="এই আয়াতের শিয়া তাফসীর গবেষণাধীন আছে। যাচাই শেষে এখানে প্রকাশ করা হবে।"
                />
              ))}

            {tab === "hadith" &&
              (hadiths === null ? (
                <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  লোড হচ্ছে…
                </p>
              ) : hadiths.length > 0 ? (
                <HadithTieredList hadiths={hadiths} />
              ) : (
                <EmptyState
                  title="এই আয়াতের সাথে যুক্ত কোনো হাদিস এখনো প্রকাশিত হয়নি"
                  body="গবেষণা নোটে হাদিসের সূত্র যুক্ত হলে সেগুলো এখানে সংকলন, গ্রন্থ, অধ্যায়, নম্বর, বর্ণনাকারী ও মানসহ দেখানো হবে।"
                />
              ))}

            {tab === "nuzul" &&
              (research?.shanENuzul &&
              (research.shanENuzul.sunni || research.shanENuzul.shia) ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
                    <SectionLabel>সুন্নি রিপোর্ট</SectionLabel>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                      {research.shanENuzul.sunni || "লিপিবদ্ধ হয়নি।"}
                    </p>
                  </section>
                  <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
                    <SectionLabel>শিয়া রিপোর্ট</SectionLabel>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                      {research.shanENuzul.shia || "লিপিবদ্ধ হয়নি।"}
                    </p>
                  </section>
                </div>
              ) : (
                <EmptyState
                  title="শান-এ-নুযূল এখনো প্রকাশিত হয়নি"
                  body="এই আয়াতের অবতরণ প্রেক্ষাপট গবেষণাধীন আছে। যাচাই শেষে এখানে প্রকাশ করা হবে।"
                />
              ))}

            {tab === "compare" &&
              (research ? (
                <div className="flex flex-col gap-6">
                  {research.context || (research.linguisticNotes ?? []).length > 0 || research.historicalContext ? (
                    <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
                      <SectionLabel>গবেষণা প্রেক্ষাপট · Research context</SectionLabel>
                      {research.context ? (
                        <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                          {research.context}
                        </p>
                      ) : null}
                      {(research.linguisticNotes ?? []).length > 0 ? (
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            ভাষাতাত্ত্বিক টীকা
                          </p>
                          <BulletList items={research.linguisticNotes ?? []} />
                        </div>
                      ) : null}
                      {research.historicalContext ? (
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            ঐতিহাসিক প্রেক্ষাপট
                          </p>
                          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                            {research.historicalContext}
                          </p>
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
                      <SectionLabel>যেখানে মিল · Agreements</SectionLabel>
                      <div className="mt-3">
                        {agreements.length > 0 ? (
                          <BulletList items={agreements} />
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            এখনো লিপিবদ্ধ হয়নি।
                          </p>
                        )}
                      </div>
                    </section>
                    <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-black">
                      <SectionLabel>যেখানে ভিন্নতা · Differences</SectionLabel>
                      <div className="mt-3">
                        {differences.length > 0 ? (
                          <BulletList items={differences} />
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            এখনো লিপিবদ্ধ হয়নি।
                          </p>
                        )}
                      </div>
                    </section>
                  </div>

                  {research.comparison?.neutralExplanation ? (
                    <section className="rounded-lg border border-pine-600/25 bg-pine-50/60 p-5 sm:p-6 dark:border-pine-500/25 dark:bg-pine-500/5">
                      <SectionLabel>নিরপেক্ষ ব্যাখ্যা · Neutral view</SectionLabel>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                        {research.comparison.neutralExplanation}
                      </p>
                    </section>
                  ) : null}

                  {research.comparisonTable &&
                  (research.comparisonTable.mainExplanation?.sunni ||
                    research.comparisonTable.mainExplanation?.shia ||
                    research.comparisonTable.aliConnection?.sunni ||
                    research.comparisonTable.aliConnection?.shia ||
                    research.comparisonTable.keyHadithEvidence?.sunni ||
                    research.comparisonTable.keyHadithEvidence?.shia ||
                    research.comparisonTable.wilayahConcept?.sunni ||
                    research.comparisonTable.wilayahConcept?.shia) ? (
                    <section className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
                      <div className="p-5 sm:p-6">
                        <SectionLabel>তুলনা টেবিল · Comparison table</SectionLabel>
                      </div>
                      <table className="w-full min-w-[560px] border-t border-neutral-200 text-sm dark:border-neutral-800">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-800">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                              বিষয়
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                              সুন্নি দৃষ্টিভঙ্গি
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                              শিয়া দৃষ্টিভঙ্গি
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              ["মূল তাফসীর ব্যাখ্যা", research.comparisonTable.mainExplanation],
                              ["আলী/আহলুল বাইত সংযোগ", research.comparisonTable.aliConnection],
                              ["মূল হাদিস প্রমাণ", research.comparisonTable.keyHadithEvidence],
                              ["উইলায়াহ ধারণা", research.comparisonTable.wilayahConcept],
                            ] as const
                          ).map(([label, pair]) =>
                            pair && (pair.sunni || pair.shia) ? (
                              <tr
                                key={label}
                                className="border-b border-neutral-100 align-top last:border-0 dark:border-neutral-900"
                              >
                                <td className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                                  {label}
                                </td>
                                <td className="whitespace-pre-line px-5 py-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                                  {pair.sunni || "—"}
                                </td>
                                <td className="whitespace-pre-line px-5 py-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                                  {pair.shia || "—"}
                                </td>
                              </tr>
                            ) : null,
                          )}
                        </tbody>
                      </table>
                    </section>
                  ) : null}

                  {(research.honestLimitations ?? []).length > 0 ? (
                    <section className="rounded-lg border border-gold-600/30 bg-gold-50/50 p-5 sm:p-6 dark:border-gold-500/30 dark:bg-gold-500/5">
                      <SectionLabel>সৎ সীমাবদ্ধতা · Honest limitations</SectionLabel>
                      <div className="mt-3">
                        <BulletList items={research.honestLimitations ?? []} />
                      </div>
                    </section>
                  ) : null}

                  {research.reviewer ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      পর্যালোচক: {research.reviewer}
                    </p>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="এই আয়াতের তুলনামূলক গবেষণা এখনো প্রকাশিত হয়নি"
                  body="সুন্নি ও শিয়া দৃষ্টিভঙ্গির নিরপেক্ষ তুলনা যাচাই শেষে এখানে প্রকাশ করা হবে।"
                />
              ))}

            {tab === "refs" &&
              (refs.length > 0 ? (
                <ol className="flex flex-col gap-3">
                  {refs.map((r, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                          {r.type}
                        </span>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                          {r.title}
                        </p>
                      </div>
                      <div className="mt-2">
                        <CitationLine
                          bookTitle=""
                          author={r.author}
                          volume={r.volume}
                          page={r.page}
                          publisher={r.publisher}
                          publicationYear={r.publicationYear}
                          sourceUrl={r.url}
                        />
                      </div>
                      {r.citationFormat ? (
                        <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {r.citationFormat}
                        </p>
                      ) : null}
                      {r.notes ? (
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {r.notes}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title="এখনো কোনো সূত্র প্রকাশিত হয়নি"
                  body="এই আয়াতের গবেষণার সব বই, লেখক, খণ্ড ও পৃষ্ঠার তথ্য যাচাই শেষে এখানে তালিকাভুক্ত হবে।"
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
