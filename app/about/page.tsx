import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SectionLabel } from "@/components/public/ui";

export const metadata: Metadata = {
  title: "পদ্ধতি ও নীতি",
  description:
    "তাফসীর তুলনার গবেষণা পদ্ধতি, সম্পাদকীয় নীতি, সূত্রের মানদণ্ড ও নিরপেক্ষতা নীতি। Methodology, editorial policy and neutrality standards.",
};

function Block({
  title,
  en,
  children,
}: {
  title: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-black">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{en}</p>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <SectionLabel>পদ্ধতি ও নীতি · Method & policy</SectionLabel>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          আমরা যেভাবে কাজ করি
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          তাফসীর তুলনা একটি গবেষণাভিত্তিক প্ল্যাটফর্ম। নিচে আমাদের পদ্ধতি,
          সম্পাদকীয় নীতি ও মানদণ্ড তুলে ধরা হলো — যাতে প্রতিটি পাঠক জানেন,
          এখানকার তথ্য কোথা থেকে এলো।
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <Block title="গবেষণা-প্রথম নীতি" en="Research-first">
            <p>
              যাচাইকৃত উৎস ছাড়া কোনো দাবি প্রকাশ করা হয় না। প্রতিটি তাফসীর
              ব্যাখ্যা, হাদিস ও তুলনামূলক মন্তব্যের পেছনে থাকতে হয় নির্দিষ্ট
              গ্রন্থ, লেখক, খণ্ড, পৃষ্ঠা বা হাদিস নম্বর।
            </p>
            <p>
              যাচাই করা না গেলে কনটেন্ট খসড়া (draft) হিসেবে থাকে — প্রকাশিত
              হয় না।
            </p>
          </Block>

          <Block title="সম্পাদকীয় কর্মপ্রবাহ" en="Editorial workflow">
            <p>
              প্রতিটি গবেষণা নোট তিন ধাপ পার হয়:{" "}
              <strong className="text-neutral-900 dark:text-neutral-100">
                খসড়া (draft) → পর্যালোচনা (review) → প্রকাশিত (published)
              </strong>
              । গবেষক তথ্য সংগ্রহ করেন, পর্যালোচক সূত্র, নির্ভুলতা, ভাষা ও
              নিরপেক্ষতা যাচাই করেন, তারপর অ্যাডমিন প্রকাশ করেন।
            </p>
            <p>
              প্রতিটি পরিবর্তন অডিট লগে সংরক্ষিত থাকে — কে, কখন, কী বদলালেন,
              তা ট্র্যাক করা যায়।
            </p>
          </Block>

          <Block title="সূত্রের মানদণ্ড" en="Source standards">
            <p>
              আমরা ধ্রুপদী ও স্বীকৃত গ্রন্থ ব্যবহার করি — সুন্নি পক্ষে ইবনে
              কাসীর, তাবারী, কুরতুবী; শিয়া পক্ষে আল-মিযান, মাজমা‘উল বায়ান,
              আত-তিবইয়ান; হাদিসে বুখারী, মুসলিম, আল-কাফী প্রভৃতি। পূর্ণ
              তালিকা <strong className="text-neutral-900 dark:text-neutral-100">সূত্র</strong> পাতায়।
            </p>
            <p>
              তথ্য (কুরআনের পাঠ, অনুবাদ), ভাষাতাত্ত্বিক টীকা, ঐতিহাসিক
              প্রেক্ষাপট, তাফসীর মতামত ও হাদিস প্রমাণ — এগুলো আলাদা করে
              চিহ্নিত থাকে, যাতে পাঠক বুঝতে পারেন কোনটি পাঠ আর কোনটি ব্যাখ্যা।
            </p>
          </Block>

          <Block title="নিরপেক্ষতা নীতি" en="Neutrality policy">
            <p>
              সুন্নি ও শিয়া — দুই দৃষ্টিভঙ্গিই সমান গুরুত্ব ও সম্মানের সাথে
              উপস্থাপন করা হয়। তুলনা অংশে মিল ও ভিন্নতা নিরপেক্ষ ভাষায়
              লিপিবদ্ধ থাকে।
            </p>
            <p>
              কোনো মাযহাব, আলেম, সম্প্রদায় বা ব্যক্তির প্রতি অবমাননাকর,
              বিদ্বেষমূলক বা উসকানিমূলক ভাষা কঠোরভাবে নিষিদ্ধ।
            </p>
          </Block>

          <Block title="স্বচ্ছতা: কোনো বাইরের API নয়" en="Transparency: no external APIs">
            <p>
              এই সাইটের কোনো কনটেন্ট বাইরের কুরআন, তাফসীর, হাদিস বা AI API
              থেকে সরাসরি নেওয়া হয় না। সব প্রকাশিত তথ্য আমাদের নিজস্ব
              ডাটাবেজে সংরক্ষিত, গবেষকদের যাচাইকৃত কাজ।
            </p>
            <p>
              আত্মবিশ্বাসের মাত্রা (উচ্চ / মাঝারি / প্রাথমিক) প্রতিটি গবেষণা
              নোটে দেখানো হয়, যাতে পাঠক বোঝেন তথ্যটি কতটা সুপ্রতিষ্ঠিত।
            </p>
          </Block>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
