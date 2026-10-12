import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Tafsir } from "@/models/Tafsir";
import { TafsirForm } from "@/components/admin/TafsirForm";
import {
  verseRefOf,
  type SerializedTafsir,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function EditTafsirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Tafsir.findById(id)
    .populate("verseId", "surahNumber ayahNumber")
    .lean();
  if (!doc) notFound();
  const tafsir = JSON.parse(JSON.stringify(doc)) as SerializedTafsir;
  const ref = verseRefOf(tafsir.verseId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        তাফসীর সম্পাদনা
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Edit tafsir · {tafsir.bookTitle}
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <TafsirForm
          initial={tafsir}
          initialSurah={ref?.surahNumber?.toString() ?? ""}
          initialAyah={ref?.ayahNumber?.toString() ?? ""}
        />
      </div>
    </div>
  );
}
