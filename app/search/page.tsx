import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SearchClient } from "@/components/public/SearchClient";
import { SectionLabel } from "@/components/public/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনুসন্ধান",
  description:
    "আয়াত, তাফসীর, হাদিস ও গবেষণা নোটে অনুসন্ধান করুন। Search verses, tafsir, hadith and research notes.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initial = typeof q === "string" ? q.slice(0, 200) : "";

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <SectionLabel>অনুসন্ধান · Search</SectionLabel>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          খুঁজুন
        </h1>
        <div className="mt-6">
          <SearchClient initial={initial} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
