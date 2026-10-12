"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import {
  Select,
  TextArea,
  TextInput,
  secondaryButtonClass,
  submitButtonClass,
} from "./fields";
import type { PublishStatus, School, SerializedHadith } from "./types";
import { errorMessage } from "./utils";

interface HadithFormState {
  collectionName: string;
  school: School;
  book: string;
  chapter: string;
  hadithNumber: string;
  narrator: string;
  arabicText: string;
  bengaliTranslation: string;
  englishTranslation: string;
  grading: string;
  gradingSource: string;
  sourceUrl: string;
  notes: string;
  status: PublishStatus;
}

export function HadithForm({ initial }: { initial: SerializedHadith | null }) {
  const router = useRouter();
  const [form, setForm] = useState<HadithFormState>({
    collectionName: initial?.collectionName ?? "",
    school: initial?.school ?? "sunni",
    book: initial?.book ?? "",
    chapter: initial?.chapter ?? "",
    hadithNumber: initial?.hadithNumber ?? "",
    narrator: initial?.narrator ?? "",
    arabicText: initial?.arabicText ?? "",
    bengaliTranslation: initial?.bengaliTranslation ?? "",
    englishTranslation: initial?.englishTranslation ?? "",
    grading: initial?.grading ?? "",
    gradingSource: initial?.gradingSource ?? "",
    sourceUrl: initial?.sourceUrl ?? "",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof HadithFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.collectionName.trim()) {
      setError("হাদিস সংকলনের নাম আবশ্যক");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        collectionName: form.collectionName.trim(),
        school: form.school,
        book: form.book.trim(),
        chapter: form.chapter.trim(),
        hadithNumber: form.hadithNumber.trim(),
        narrator: form.narrator.trim(),
        arabicText: form.arabicText.trim(),
        bengaliTranslation: form.bengaliTranslation.trim(),
        englishTranslation: form.englishTranslation.trim(),
        grading: form.grading.trim(),
        gradingSource: form.gradingSource.trim(),
        sourceUrl: form.sourceUrl.trim(),
        notes: form.notes.trim(),
        status: form.status,
      };
      const url = initial
        ? `/api/admin/hadiths/${initial._id}`
        : "/api/admin/hadiths";
      const res = await fetch(url, {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(data, "সংরক্ষণ ব্যর্থ হয়েছে"));
        return;
      }
      router.push("/admin/hadiths");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="সংকলনের নাম" english="Collection name" required>
          <TextInput
            value={form.collectionName}
            onChange={(e) => set("collectionName", e.target.value)}
            placeholder="যেমন: সহীহ বুখারী"
            required
          />
        </FormField>
        <FormField label="মাযহাব/ধারা" english="School" required>
          <Select
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
          >
            <option value="sunni">সুন্নি (Sunni)</option>
            <option value="shia">শিয়া (Shia)</option>
            <option value="shared">যৌথ (Shared)</option>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="কিতাব" english="Book">
          <TextInput
            value={form.book}
            onChange={(e) => set("book", e.target.value)}
            placeholder="কিতাব"
          />
        </FormField>
        <FormField label="অধ্যায়" english="Chapter">
          <TextInput
            value={form.chapter}
            onChange={(e) => set("chapter", e.target.value)}
            placeholder="অধ্যায়"
          />
        </FormField>
        <FormField label="হাদিস নম্বর" english="Hadith number">
          <TextInput
            value={form.hadithNumber}
            onChange={(e) => set("hadithNumber", e.target.value)}
            placeholder="নম্বর"
          />
        </FormField>
      </div>

      <FormField label="বর্ণনাকারী" english="Narrator">
        <TextInput
          value={form.narrator}
          onChange={(e) => set("narrator", e.target.value)}
          placeholder="বর্ণনাকারীর নাম"
        />
      </FormField>

      <FormField label="আরবি পাঠ" english="Arabic text">
        <TextArea
          dir="rtl"
          rows={4}
          value={form.arabicText}
          onChange={(e) => set("arabicText", e.target.value)}
          className="font-arabic text-lg"
          placeholder="الحديث…"
        />
      </FormField>

      <FormField label="বাংলা অনুবাদ" english="Bengali translation">
        <TextArea
          rows={3}
          value={form.bengaliTranslation}
          onChange={(e) => set("bengaliTranslation", e.target.value)}
          placeholder="বাংলা অনুবাদ…"
        />
      </FormField>

      <FormField label="ইংরেজি অনুবাদ" english="English translation">
        <TextArea
          rows={3}
          value={form.englishTranslation}
          onChange={(e) => set("englishTranslation", e.target.value)}
          placeholder="English translation…"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="মান" english="Grading">
          <TextInput
            value={form.grading}
            onChange={(e) => set("grading", e.target.value)}
            placeholder="যেমন: সহীহ"
          />
        </FormField>
        <FormField label="মানের উৎস" english="Grading source">
          <TextInput
            value={form.gradingSource}
            onChange={(e) => set("gradingSource", e.target.value)}
            placeholder="যিনি মান নির্ধারণ করেছেন"
          />
        </FormField>
      </div>

      <FormField label="উৎস লিংক" english="Source URL">
        <TextInput
          type="url"
          value={form.sourceUrl}
          onChange={(e) => set("sourceUrl", e.target.value)}
          placeholder="https://…"
        />
      </FormField>

      <FormField label="নোট" english="Notes">
        <TextArea
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="অতিরিক্ত নোট…"
        />
      </FormField>

      <FormField
        label="অবস্থা"
        english="Status"
        hint="প্রকাশ করতে রিভিউ প্রয়োজন — সার্ভার ভূমিকা অনুযায়ী যাচাই করবে"
      >
        <Select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="draft">খসড়া (Draft)</option>
          <option value="review">পর্যালোচনাধীন (Review)</option>
          <option value="published">প্রকাশিত (Published)</option>
        </Select>
      </FormField>

      {error ? (
        <p className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClass}>
          {saving ? "সংরক্ষণ হচ্ছে…" : initial ? "আপডেট করুন" : "সংরক্ষণ করুন"}
        </button>
        <Link href="/admin/hadiths" className={secondaryButtonClass}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
