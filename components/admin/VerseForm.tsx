"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import {
  TextArea,
  TextInput,
  secondaryButtonClass,
  submitButtonClass,
} from "./fields";
import type { SerializedVerse } from "./types";
import { errorMessage, toOptionalInt, toRequiredInt } from "./utils";

interface VerseFormState {
  surahNumber: string;
  ayahNumber: string;
  globalAyahNumber: string;
  arabicText: string;
  bengaliTranslation: string;
  englishTranslation: string;
  juz: string;
  page: string;
}

export function VerseForm({ initial }: { initial: SerializedVerse | null }) {
  const router = useRouter();
  const [form, setForm] = useState<VerseFormState>({
    surahNumber: initial?.surahNumber?.toString() ?? "",
    ayahNumber: initial?.ayahNumber?.toString() ?? "",
    globalAyahNumber: initial?.globalAyahNumber?.toString() ?? "",
    arabicText: initial?.arabicText ?? "",
    bengaliTranslation: initial?.bengaliTranslation ?? "",
    englishTranslation: initial?.englishTranslation ?? "",
    juz: initial?.juz?.toString() ?? "",
    page: initial?.page?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof VerseFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const surahNumber = toRequiredInt(form.surahNumber);
    const ayahNumber = toRequiredInt(form.ayahNumber);
    const globalAyahNumber = toRequiredInt(form.globalAyahNumber);
    const juz = toOptionalInt(form.juz);
    const page = toOptionalInt(form.page);

    if (surahNumber === null || surahNumber < 1 || surahNumber > 114) {
      setError("সূরা নম্বর ১–১১৪ এর মধ্যে হতে হবে");
      return;
    }
    if (ayahNumber === null || ayahNumber < 1) {
      setError("আয়াত নম্বর সঠিক নয়");
      return;
    }
    if (globalAyahNumber === null || globalAyahNumber < 1) {
      setError("গ্লোবাল আয়াত নম্বর সঠিক নয়");
      return;
    }
    if (juz === null || (juz !== undefined && (juz < 1 || juz > 30))) {
      setError("পারা (জুজ) ১–৩০ এর মধ্যে হতে হবে");
      return;
    }
    if (page === null || (page !== undefined && (page < 1 || page > 604))) {
      setError("পৃষ্ঠা নম্বর ১–৬০৪ এর মধ্যে হতে হবে");
      return;
    }
    if (!form.arabicText.trim()) {
      setError("আরবি পাঠ আবশ্যক");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        surahNumber,
        ayahNumber,
        globalAyahNumber,
        arabicText: form.arabicText.trim(),
        bengaliTranslation: form.bengaliTranslation.trim(),
        englishTranslation: form.englishTranslation.trim(),
        ...(juz !== undefined ? { juz } : {}),
        ...(page !== undefined ? { page } : {}),
      };
      const url = initial
        ? `/api/admin/verses/${initial._id}`
        : "/api/admin/verses";
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
      router.push("/admin/verses");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="সূরা নম্বর" english="Surah number" required>
          <TextInput
            type="number"
            min={1}
            max={114}
            value={form.surahNumber}
            onChange={(e) => set("surahNumber", e.target.value)}
            placeholder="2"
            required
          />
        </FormField>
        <FormField label="আয়াত নম্বর" english="Ayah number" required>
          <TextInput
            type="number"
            min={1}
            value={form.ayahNumber}
            onChange={(e) => set("ayahNumber", e.target.value)}
            placeholder="255"
            required
          />
        </FormField>
        <FormField label="গ্লোবাল আয়াত নম্বর" english="Global ayah number" required>
          <TextInput
            type="number"
            min={1}
            value={form.globalAyahNumber}
            onChange={(e) => set("globalAyahNumber", e.target.value)}
            placeholder="262"
            required
          />
        </FormField>
      </div>

      <FormField label="আরবি পাঠ" english="Arabic text" required>
        <TextArea
          dir="rtl"
          rows={4}
          value={form.arabicText}
          onChange={(e) => set("arabicText", e.target.value)}
          className="font-arabic text-lg"
          placeholder="ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ…"
          required
        />
      </FormField>

      <FormField label="বাংলা অনুবাদ" english="Bengali translation">
        <TextArea
          rows={3}
          value={form.bengaliTranslation}
          onChange={(e) => set("bengaliTranslation", e.target.value)}
          placeholder="বাংলা অনুবাদ লিখুন…"
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
        <FormField label="পারা" english="Juz (1–30)">
          <TextInput
            type="number"
            min={1}
            max={30}
            value={form.juz}
            onChange={(e) => set("juz", e.target.value)}
            placeholder="3"
          />
        </FormField>
        <FormField label="পৃষ্ঠা" english="Mushaf page (1–604)">
          <TextInput
            type="number"
            min={1}
            max={604}
            value={form.page}
            onChange={(e) => set("page", e.target.value)}
            placeholder="42"
          />
        </FormField>
      </div>

      {error ? (
        <p className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClass}>
          {saving ? "সংরক্ষণ হচ্ছে…" : initial ? "আপডেট করুন" : "সংরক্ষণ করুন"}
        </button>
        <Link href="/admin/verses" className={secondaryButtonClass}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
