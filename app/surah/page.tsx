import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SurahList } from "@/components/public/SurahList";
import { EmptyState, SectionLabel } from "@/components/public/ui";
import { apiGet } from "@/components/public/api";
import type { ApiSurah } from "@/components/public/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সূরা তালিকা",
  description:
    "১১৪ সূরার তালিকা — আরবি নাম, বাংলা নাম, আয়াত সংখ্যা, মাক্কী/মাদানী। Browse all 114 surahs with Arabic names and ayah counts.",
};

export default async function SurahIndexPage() {
  const surahs = await apiGet<ApiSurah[]>("/api/surahs");

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <SectionLabel>১১৪ সূরা · All surahs</SectionLabel>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          সূরা তালিকা
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          সূরায় ক্লিক করে সব আয়াত, অনুবাদ ও তাফসীর পড়ুন।
        </p>

        <div className="mt-8">
          {!surahs || surahs.length === 0 ? (
            <EmptyState
              title="সূরার তথ্য এখনো যোগ হয়নি"
              body="গবেষণা দল ১১৪ সূরার তথ্য যাচাই করে ডাটাবেজে যোগ করছে। শীঘ্রই এখানে তালিকা দেখা যাবে।"
            />
          ) : (
            <SurahList surahs={surahs} />
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
