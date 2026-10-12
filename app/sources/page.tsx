import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SectionLabel } from "@/components/public/ui";

export const metadata: Metadata = {
  title: "সূত্র তালিকা",
  description:
    "তাফসীর তুলনায় ব্যবহৃত সুন্নি ও শিয়া তাফসীর গ্রন্থ এবং হাদিস সংকলনের তালিকা। Authoritative tafsir and hadith sources used on this platform.",
};

interface Source {
  title: string;
  detail: string;
}

const GROUPS: { heading: string; en: string; note: string; sources: Source[] }[] = [
  {
    heading: "সুন্নি তাফসীর গ্রন্থ",
    en: "Sunni tafsir works",
    note: "ধ্রুপদী সুন্নি তাফসীর ঐতিহ্যের স্বীকৃত গ্রন্থাবলি।",
    sources: [
      { title: "তাফসীর ইবনে কাসীর", detail: "ইমাদুদ্দীন ইবনে কাসীর (মৃ. ৭৭৪ হি.) — হাদিসভিত্তিক প্রসিদ্ধ তাফসীর।" },
      { title: "তাফসীর আত-তাবারী (জামি‘উল বায়ান)", detail: "মুহাম্মদ ইবনে জারীর আত-তাবারী (মৃ. ৩১০ হি.) — বর্ণনানির্ভর সর্বপ্রাচীন পূর্ণাঙ্গ তাফসীর।" },
      { title: "তাফসীর আল-কুরতুবী (আল-জামি‘)", detail: "আবু আবদুল্লাহ আল-কুরতুবী (মৃ. ৬৭১ হি.) — ফিকহি আলোচনাসমৃদ্ধ তাফসীর।" },
      { title: "তাফসীর আল-জালালাইন", detail: "জালালুদ্দীন আল-মাহাল্লী ও জালালুদ্দীন আস-সুয়ূতী — সংক্ষিপ্ত, বহুলপঠিত তাফসীর।" },
      { title: "তাফসীর আস-সা‘দী (তাইসীরুল কারীমির রাহমান)", detail: "আবদুর রাহমান আস-সা‘দী (মৃ. ১৩৭৬ হি.) — সহজবোধ্য আধুনিক তাফসীর।" },
    ],
  },
  {
    heading: "শিয়া তাফসীর গ্রন্থ",
    en: "Shia tafsir works",
    note: "শিয়া তাফসীর ঐতিহ্যের স্বীকৃত গ্রন্থাবলি।",
    sources: [
      { title: "তাফসীর আল-মিযান", detail: "আল্লামা সাইয়্যেদ মুহাম্মদ হুসাইন তাবাতাবাঈ — কুরআন-দিয়ে-কুরআনের ব্যাখ্যায় প্রসিদ্ধ দার্শনিক তাফসীর।" },
      { title: "তাফসীর নূরুস সাকালাইন", detail: "আবদ আলী আল-হুওয়াইযী — আহলে বাইতের বর্ণনানির্ভর তাফসীর সংকলন।" },
      { title: "তাফসীর আত-তিবইয়ান", detail: "শাইখ আত-তূসী (মৃ. ৪৬০ হি.) — প্রাচীন ইমামী তাফসীর।" },
      { title: "মাজমা‘উল বায়ান", detail: "আমীনুদ্দীন আত-তাবরিসী (মৃ. ৫৪৮ হি.) — ভাষা, ফিকহ ও কালাম-সমৃদ্ধ প্রসিদ্ধ তাফসীর।" },
      { title: "তাফসীর আল-কুম্মী", detail: "আলী ইবনে ইবরাহীম আল-কুম্মী — প্রাচীন বর্ণনানির্ভর তাফসীর।" },
    ],
  },
  {
    heading: "সুন্নি হাদিস সংকলন",
    en: "Sunni hadith collections",
    note: "সুন্নি ঐতিহ্যের প্রধান হাদিস গ্রন্থাবলি।",
    sources: [
      { title: "সহীহ আল-বুখারী", detail: "মুহাম্মদ ইবনে ইসমাঈল আল-বুখারী — সর্বাধিক নির্ভরযোগ্য সংকলন হিসেবে স্বীকৃত।" },
      { title: "সহীহ মুসলিম", detail: "মুসলিম ইবনে হাজ্জাজ — বুখারীর পরেই মর্যাদাপূর্ণ সংকলন।" },
      { title: "সুনান আবু দাউদ", detail: "আবু দাউদ আস-সিজিসতানী — ফিকহি হাদিসের প্রসিদ্ধ সংকলন।" },
      { title: "জামি‘ আত-তিরমিযী", detail: "আবু ঈসা আত-তিরমিযী — হাদিসের মান-নির্ণয়ে গুরুত্বপূর্ণ।" },
      { title: "সুনান আন-নাসাঈ", detail: "আহমদ ইবনে শু‘আইব আন-নাসাঈ — ছয় প্রধান গ্রন্থের অন্যতম।" },
      { title: "সুনান ইবনে মাজাহ", detail: "মুহাম্মদ ইবনে ইয়াযীদ ইবনে মাজাহ — ছয় প্রধান গ্রন্থের অন্যতম।" },
      { title: "মুসনাদ আহমদ", detail: "আহমদ ইবনে হাম্বল — সাহাবীভিত্তিক বিশাল হাদিস সংকলন।" },
    ],
  },
  {
    heading: "শিয়া হাদিস সংকলন",
    en: "Shia hadith collections",
    note: "শিয়া ঐতিহ্যের প্রধান হাদিস গ্রন্থাবলি।",
    sources: [
      { title: "আল-কাফী", detail: "মুহাম্মদ ইবনে ইয়া‘কূব আল-কুলাইনী — শিয়া ঐতিহ্যের প্রধান হাদিস সংকলন।" },
      { title: "মান লা ইয়াহদুরুহুল ফাকীহ", detail: "ইবনে বাবাওয়াইহ আল-কুম্মী (শাইখ আস-সাদূক) — চার প্রধান গ্রন্থের অন্যতম।" },
      { title: "তাহযীবুল আহকাম", detail: "শাইখ আত-তূসী — ফিকহি হাদিসের প্রামাণ্য সংকলন।" },
      { title: "আল-ইসতিবসার", detail: "শাইখ আত-তূসী — আপাত-বিরোধী বর্ণনার সমন্বয়ে রচিত।" },
      { title: "বিহারুল আনওয়ার", detail: "আল্লামা মুহাম্মদ বাকির আল-মাজলিসী — বিশ্বকোষতুল্য বিশাল সংকলন।" },
      { title: "ওয়াসাইলুশ শিয়া", detail: "মুহাম্মদ ইবনে হাসান আল-হুরর আল-আমিলী — ফিকহি হাদিসের প্রসিদ্ধ সংকলন।" },
    ],
  },
];

export default function SourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <SectionLabel>সূত্র তালিকা · Source library</SectionLabel>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          আমাদের সূত্রসমূহ
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          নিচের গ্রন্থগুলো এই প্ল্যাটফর্মের স্বীকৃত উৎস-ভাণ্ডার। কোনো গ্রন্থের
          নাম এখানে থাকা মানেই তার সব বক্তব্য প্রকাশিত — এমন নয়; প্রতিটি
          উদ্ধৃতি আলাদাভাবে যাচাই করে, গ্রন্থ-লেখক-খণ্ড-পৃষ্ঠাসহ প্রকাশ করা
          হয়।
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {GROUPS.map((g) => (
            <section key={g.heading}>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {g.heading}
              </h2>
              <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                {g.en} — {g.note}
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {g.sources.map((s) => (
                  <li
                    key={s.title}
                    className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black"
                  >
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {s.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
