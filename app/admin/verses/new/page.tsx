import { VerseForm } from "@/components/admin/VerseForm";

export const dynamic = "force-dynamic";

export default function NewVersePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        নতুন আয়াত
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Add a new verse · সব তথ্য সঠিকভাবে যাচাই করে দিন
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <VerseForm initial={null} />
      </div>
    </div>
  );
}
