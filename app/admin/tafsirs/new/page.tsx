import { TafsirForm } from "@/components/admin/TafsirForm";

export const dynamic = "force-dynamic";

export default function NewTafsirPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        নতুন তাফসীর
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Add a new tafsir entry · সূরা:আয়াত দিয়ে সংশ্লিষ্ট আয়াত বাছুন
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <TafsirForm initial={null} initialSurah="" initialAyah="" />
      </div>
    </div>
  );
}
