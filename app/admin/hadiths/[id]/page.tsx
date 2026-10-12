import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Hadith } from "@/models/Hadith";
import { HadithForm } from "@/components/admin/HadithForm";
import type { SerializedHadith } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function EditHadithPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Hadith.findById(id).lean();
  if (!doc) notFound();
  const hadith = JSON.parse(JSON.stringify(doc)) as SerializedHadith;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        হাদিস সম্পাদনা
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Edit hadith · {hadith.collectionName}
        {hadith.hadithNumber ? ` · ${hadith.hadithNumber}` : ""}
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <HadithForm initial={hadith} />
      </div>
    </div>
  );
}
