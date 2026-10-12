import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { EmptyState, GoldAyahNumber, SectionLabel } from "@/components/public/ui";
import { apiGet } from "@/components/public/api";
import type { ApiSurah, ApiVerse } from "@/components/public/types";

export const dynamic = "force-dynamic";

interface SurahDetail {
  surah: ApiSurah;
  verses: ApiVerse[];
}

async function getSurah(n: number): Promise<SurahDetail | null> {
  return apiGet<SurahDetail>(`/api/surahs/${n}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string }>;
}): Promise<Metadata> {
  const { surah } = await params;
  const data = await getSurah(Number(surah));
  if (!data) return { title: "সূরা পাওয়া যায়নি" };
  const s = data.surah;
  return {
    title: `সূরা ${s.nameTransliterated} (${s.nameBengali})`,
    description: `সূরা ${s.nameTransliterated} — ${s.totalAyahs} আয়াত, ${s.revelationPlace === "makkah" ? "মাক্কী" : "মাদানী"}। আরবি পাঠ, বাংলা অনুবাদ, সুন্নি ও শিয়া তাফসীর। Surah ${s.nameEnglish} with Bengali translation and Sunni/Shia tafsir.`,
  };
}

function SurahNav({ n }: { n: number }) {
  return (
    <nav className="mt-10 flex items-center justify-between gap-3" aria-label="সূরা নেভিগেশন">
      {n > 1 ? (
        <Link
          href={`/surah/${n - 1}`}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
        >
          ← পূর্ববর্তী সূরা
        </Link>
      ) : (
        <span />
      )}
      {n < 114 ? (
        <Link
          href={`/surah/${n + 1}`}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
        >
          পরবর্তী সূরা →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export default async function SurahDetailPage({
  params,
}: {
  params: Promise<{ surah: string }>;
}) {
  const { surah } = await params;
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();

  const data = await getSurah(n);
  if (!data) notFound();
  const { surah: s, verses } = data;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <SectionLabel>
            সূরা {n} · {s.revelationPlace === "makkah" ? "মাক্কী" : "মাদানী"} ·{" "}
            {s.totalAyahs} আয়াত
          </SectionLabel>
          <p dir="rtl" className="font-arabic mt-4 text-4xl text-neutral-900 sm:text-5xl dark:text-neutral-50">
            {s.nameArabic}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {s.nameTransliterated} · {s.nameBengali}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {s.nameEnglish}
          </p>
        </div>

        <div className="mt-10">
          {verses.length === 0 ? (
            <EmptyState
              title="এই সূরার আয়াত এখনো যোগ হয়নি"
              body="আয়াতের আরবি পাঠ ও অনুবাদ যাচাই করে ডাটাবেজে যোগ করা হচ্ছে। শীঘ্রই এখানে দেখা যাবে।"
            />
          ) : (
            <ol className="flex flex-col gap-4">
              {verses.map((v) => (
                <li key={v.ayahNumber}>
                  <Link
                    href={`/surah/${n}/ayah/${v.ayahNumber}`}
                    className="block rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-600"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <GoldAyahNumber n={`${n}:${v.ayahNumber}`} className="text-sm" />
                      {typeof v.juz === "number" ? (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          পারা {v.juz}
                        </span>
                      ) : null}
                    </div>
                    <p dir="rtl" className="font-arabic text-right text-xl leading-loose text-neutral-900 sm:text-2xl dark:text-neutral-50">
                      {v.arabicText}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {v.bengaliTranslation}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <SurahNav n={n} />
      </main>
      <PublicFooter />
    </div>
  );
}
