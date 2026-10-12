import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              তাফসীর তুলনা · Tafsir Compare
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              সুন্নি ও শিয়া দৃষ্টিকোণ থেকে গবেষণাভিত্তিক কুরআন তাফসীর — প্রতিটি
              দাবির পেছনে যাচাইকৃত সূত্র। কোনো কনটেন্ট বাইরের API থেকে নেওয়া
              হয় না।
            </p>
          </div>
          <nav className="flex gap-8 text-sm" aria-label="Footer">
            <div className="flex flex-col gap-2">
              <Link href="/surah" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">
                সূরা তালিকা
              </Link>
              <Link href="/search" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">
                অনুসন্ধান
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">
                পদ্ধতি ও নীতি
              </Link>
              <Link href="/sources" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">
                সূত্র তালিকা
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/admin/login" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">
                গবেষক লগইন
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-8 border-t border-neutral-100 pt-6 text-xs text-neutral-400 dark:border-neutral-900 dark:text-neutral-500">
          সব মতামত সম্মানের সাথে উপস্থাপন করা হয়। কোনো মাযহাব, আলেম বা
          সম্প্রদায়ের প্রতি অবমাননাকর ভাষা ব্যবহার করা হয় না।
        </p>
      </div>
    </footer>
  );
}
