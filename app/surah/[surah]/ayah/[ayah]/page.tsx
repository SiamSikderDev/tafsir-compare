import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { VerseInteractive } from "@/components/public/VerseInteractive";
import { GoldAyahNumber, SectionLabel } from "@/components/public/ui";
import { apiGet, siteUrl } from "@/components/public/api";
import type {
  ApiResearchNote,
  ApiSurah,
  ApiTafsir,
  ApiVerse,
} from "@/components/public/types";

export const dynamic = "force-dynamic";

interface Loaded {
  verse: ApiVerse;
  surah: ApiSurah;
  tafsirs: ApiTafsir[];
  research: ApiResearchNote | null;
}

async function load(s: number, a: number): Promise<Loaded | null> {
  const [verse, surahData, tafsirs, notes] = await Promise.all([
    apiGet<ApiVerse>(`/api/verses/${s}/${a}`),
    apiGet<{ surah: ApiSurah }>(`/api/surahs/${s}`),
    apiGet<ApiTafsir[]>(`/api/verses/${s}/${a}/tafsir`),
    apiGet<ApiResearchNote[]>(`/api/verses/${s}/${a}/research`),
  ]);
  if (!verse || !surahData?.surah) return null;
  return {
    verse,
    surah: surahData.surah,
    tafsirs: tafsirs ?? [],
    research: notes && notes.length > 0 ? notes[0] : null,
  };
}

function validRef(s: string, a: string): [number, number] | null {
  const sn = Number(s);
  const an = Number(a);
  if (!Number.isInteger(sn) || sn < 1 || sn > 114) return null;
  if (!Number.isInteger(an) || an < 1 || an > 300) return null;
  return [sn, an];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}): Promise<Metadata> {
  const { surah, ayah } = await params;
  const ref = validRef(surah, ayah);
  if (!ref) return { title: "আয়াত পাওয়া যায়নি" };
  const [s, a] = ref;
  const data = await load(s, a);
  if (!data) return { title: "আয়াত পাওয়া যায়নি" };
  const { verse, surah: sh } = data;
  const title = `সূরা ${sh.nameTransliterated} ${s}:${a} — তাফসীর তুলনা`;
  const description = `${verse.bengaliTranslation.slice(0, 150)}… — সূরা ${sh.nameTransliterated} (${sh.nameBengali}) আয়াত ${a}-এর সুন্নি ও শিয়া তাফসীর, সূত্রসহ।`;
  const url = `${siteUrl()}/surah/${s}/ayah/${a}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

function AyahNav({
  s,
  a,
  total,
}: {
  s: number;
  a: number;
  total: number;
}) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="আয়াত নেভিগেশন">
      {a > 1 ? (
        <Link
          href={`/surah/${s}/ayah/${a - 1}`}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
        >
          ← {a - 1}
        </Link>
      ) : (
        <span />
      )}
      <Link
        href={`/surah/${s}`}
        className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        সব আয়াত
      </Link>
      {a < total ? (
        <Link
          href={`/surah/${s}/ayah/${a + 1}`}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
        >
          {a + 1} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export default async function VerseDetailPage({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}) {
  const { surah, ayah } = await params;
  const ref = validRef(surah, ayah);
  if (!ref) notFound();
  const [s, a] = ref;

  const data = await load(s, a);
  if (!data) notFound();
  const { verse, surah: sh, tafsirs, research } = data;

  const surahName = `${sh.nameTransliterated}`;
  const shareUrl = `${siteUrl()}/surah/${s}/ayah/${a}`;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumb + nav */}
        <div className="mb-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            <Link href="/surah" className="hover:underline">
              সূরা তালিকা
            </Link>
            {" / "}
            <Link href={`/surah/${s}`} className="hover:underline">
              {sh.nameTransliterated}
            </Link>
            {" / "}
            <span className="text-neutral-700 dark:text-neutral-300">আয়াত {a}</span>
          </p>
        </div>

        <AyahNav s={s} a={a} total={sh.totalAyahs} />

        {/* Verse card */}
        <article className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 sm:p-10 dark:border-neutral-800 dark:bg-black">
          <div className="mb-6 flex items-center justify-between">
            <SectionLabel>
              সূরা {sh.nameBengali} · {sh.revelationPlace === "makkah" ? "মাক্কী" : "মাদানী"}
            </SectionLabel>
            <GoldAyahNumber n={`${s}:${a}`} className="text-lg" />
          </div>

          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-right text-2xl leading-loose text-neutral-900 sm:text-[2rem] dark:text-neutral-50"
          >
            {verse.arabicText}
          </p>

          <div className="mt-8 border-t border-neutral-100 pt-6 dark:border-neutral-900">
            <SectionLabel>বাংলা অনুবাদ · Bengali</SectionLabel>
            <p className="mt-2 text-[17px] leading-relaxed text-neutral-800 dark:text-neutral-100">
              {verse.bengaliTranslation}
            </p>
          </div>

          {verse.englishTranslation ? (
            <div className="mt-5">
              <SectionLabel>English translation</SectionLabel>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {verse.englishTranslation}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-400 dark:text-neutral-500">
            {typeof verse.juz === "number" ? <span>পারা {verse.juz}</span> : null}
            {typeof verse.page === "number" ? <span>পৃষ্ঠা {verse.page}</span> : null}
            {typeof verse.globalAyahNumber === "number" ? (
              <span>ক্রমিক নং {verse.globalAyahNumber}</span>
            ) : null}
          </div>
        </article>

        {/* Interactive: actions + tabs */}
        <div className="mt-8">
          <VerseInteractive
            verse={verse}
            surahName={surahName}
            tafsirs={tafsirs}
            research={research}
            shareUrl={shareUrl}
          />
        </div>

        <div className="mt-10">
          <AyahNav s={s} a={a} total={sh.totalAyahs} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
