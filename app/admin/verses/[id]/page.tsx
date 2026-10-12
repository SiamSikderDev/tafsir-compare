import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Verse } from "@/models/Verse";
import { VerseForm } from "@/components/admin/VerseForm";
import type { SerializedVerse } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function EditVersePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Verse.findById(id).lean();
  if (!doc) notFound();
  const verse = JSON.parse(JSON.stringify(doc)) as SerializedVerse;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        আয়াত সম্পাদনা
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Edit verse · {verse.surahNumber}:{verse.ayahNumber}
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <VerseForm initial={verse} />
      </div>
    </div>
  );
}
