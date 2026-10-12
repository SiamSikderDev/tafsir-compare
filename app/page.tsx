import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SearchBar } from "@/components/public/SearchBar";
import { LogoMark, SectionLabel } from "@/components/public/ui";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "১",
    bn: "আয়াত বেছে নিন",
    en: "Pick a verse",
    body: "১১৪ সূরার তালিকা থেকে সূরা ও আয়াত খুলুন — আরবি পাঠ, বাংলা ও ইংরেজি অনুবাদসহ।",
  },
  {
    n: "২",
    bn: "দুই দৃষ্টিভঙ্গি পড়ুন",
    en: "Read both views",
    body: "সুন্নি ও শিয়া তাফসীর পাশাপাশি ট্যাবে — প্রতিটি ব্যাখ্যার পেছনে কোন বই, কোন পৃষ্ঠা, তা স্পষ্ট।",
  },
  {
    n: "৩",
    bn: "সূত্র যাচাই করুন",
    en: "Verify the source",
    body: "তুলনা ও সূত্র ট্যাবে মিল-অমিল এবং পূর্ণাঙ্গ উদ্ধৃতি দেখুন — দাবি থেকে উৎস পর্যন্ত পথ খোলা।",
  },
];

const PERSPECTIVES = [
  {
    title: "সুন্নি দৃষ্টিভঙ্গি",
    en: "Sunni perspective",
    body: "ইবনে কাসীর, তাবারী, কুরতুবীসহ ধ্রুপদী সুন্নি তাফসীর গ্রন্থের ব্যাখ্যা — গ্রন্থ, লেখক, খণ্ড ও পৃষ্ঠাসহ উদ্ধৃত।",
  },
  {
    title: "শিয়া দৃষ্টিভঙ্গি",
    en: "Shia perspective",
    body: "আল-মিযান, মাজমা‘উল বায়ান, আত-তিবইয়ানসহ শিয়া তাফসীর ঐতিহ্যের ব্যাখ্যা — একই নির্ভুলতায় উদ্ধৃত।",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="mb-6 flex justify-center">
            <LogoMark size="lg" />
          </div>
          <SectionLabel>গবেষণাভিত্তিক কুরআন তাফসীর · Research-based Quran tafsir</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
            তাফসীর তুলনা
          </h1>
          <p className="mt-1 text-lg text-neutral-500 dark:text-neutral-400">
            Tafsir Compare — Sunni &amp; Shia Perspectives
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
            প্রতিটি আয়াতের সুন্নি ও শিয়া ব্যাখ্যা — নিরপেক্ষভাবে, যাচাইকৃত
            সূত্রসহ। কোনো দাবি উৎস ছাড়া প্রকাশ হয় না।
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/surah"
              className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
            >
              সূরা তালিকা দেখুন
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
            >
              আমাদের পদ্ধতি
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionLabel>যেভাবে কাজ করে · How it works</SectionLabel>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black"
                >
                  <p className="font-arabic text-2xl font-bold text-gold-600 dark:text-gold-400">
                    {s.n}
                  </p>
                  <h2 className="mt-2 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {s.bn}
                  </h2>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{s.en}</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perspectives */}
        <section className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionLabel>দুই দৃষ্টিভঙ্গি, এক মানদণ্ড · Two views, one standard</SectionLabel>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {PERSPECTIVES.map((p) => (
                <div
                  key={p.title}
                  className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black"
                >
                  <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {p.title}
                  </h2>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{p.en}</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              নিরপেক্ষতার নীতি: দুই পক্ষের বক্তব্য সমান গুরুত্ব ও সম্মানের সাথে
              উপস্থাপন করা হয়। কোনো মাযহাব, আলেম বা সম্প্রদায়ের প্রতি
              অবমাননাকর ভাষা ব্যবহার করা হয় না — বিস্তারিত{" "}
              <Link href="/about" className="underline underline-offset-2">
                পদ্ধতি পাতায়
              </Link>
              ।
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              পড়া শুরু করুন
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              ১১৪ সূরা · প্রতিটি আয়াতে আরবি, বাংলা, ইংরেজি
            </p>
            <Link
              href="/surah"
              className="mt-6 inline-block rounded-md bg-pine-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-pine-600 dark:bg-pine-600 dark:hover:bg-pine-500"
            >
              সূরা তালিকা →
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
