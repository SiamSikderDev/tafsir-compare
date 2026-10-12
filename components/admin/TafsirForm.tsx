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
import type { PublishStatus, School, SerializedTafsir } from "./types";
import {
  errorMessage,
  toLines,
  toOptionalInt,
  toRequiredInt,
} from "./utils";

interface TafsirFormState {
  surah: string;
  ayah: string;
  school: School;
  bookTitle: string;
  author: string;
  volume: string;
  page: string;
  language: string;
  summary: string;
  fullText: string;
  keyPoints: string;
  sourceUrl: string;
  publisher: string;
  publicationYear: string;
  verifiedBy: string;
  status: PublishStatus;
}

/** Resolve a verse's ObjectId from surah:ayah via the public verse lookup. */
async function resolveVerseId(
  surah: number,
  ayah: number,
): Promise<{ ok: true; verseId: string } | { ok: false }> {
  const res = await fetch(
    `/api/verses/${surah}/${ayah}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return { ok: false };
  const data: unknown = await res.json().catch(() => null);
  if (!data || typeof data !== "object") return { ok: false };
  const rec = data as { _id?: unknown; verse?: { _id?: unknown } };
  const verseId =
    typeof rec._id === "string"
      ? rec._id
      : typeof rec.verse?._id === "string"
        ? rec.verse._id
        : null;
  return verseId ? { ok: true, verseId } : { ok: false };
}

export function TafsirForm({
  initial,
  initialSurah,
  initialAyah,
}: {
  initial: SerializedTafsir | null;
  initialSurah: string;
  initialAyah: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<TafsirFormState>({
    surah: initialSurah,
    ayah: initialAyah,
    school: initial?.school ?? "sunni",
    bookTitle: initial?.bookTitle ?? "",
    author: initial?.author ?? "",
    volume: initial?.volume ?? "",
    page: initial?.page ?? "",
    language: initial?.language ?? "bengali",
    summary: initial?.summary ?? "",
    fullText: initial?.fullText ?? "",
    keyPoints: initial?.keyPoints?.join("\n") ?? "",
    sourceUrl: initial?.sourceUrl ?? "",
    publisher: initial?.publisher ?? "",
    publicationYear: initial?.publicationYear?.toString() ?? "",
    verifiedBy: initial?.verifiedBy ?? "",
    status: initial?.status ?? "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof TafsirFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const surah = toRequiredInt(form.surah);
    const ayah = toRequiredInt(form.ayah);
    if (surah === null || surah < 1 || surah > 114 || ayah === null || ayah < 1) {
      setError("সূরা:আয়াত সঠিকভাবে দিন (যেমন 2:255)");
      return;
    }
    if (!form.bookTitle.trim()) {
      setError("তাফসীর গ্রন্থের নাম আবশ্যক");
      return;
    }
    if (!form.author.trim()) {
      setError("লেখকের নাম আবশ্যক");
      return;
    }
    if (!form.summary.trim()) {
      setError("সারসংক্ষেপ আবশ্যক");
      return;
    }
    const publicationYear = toOptionalInt(form.publicationYear);
    if (publicationYear === null) {
      setError("প্রকাশনা বছর সঠিক নয়");
      return;
    }

    setSaving(true);
    try {
      const resolved = await resolveVerseId(surah, ayah);
      if (!resolved.ok) {
        setError("এই আয়াত ডাটাবেজে নেই — আগে আয়াত যোগ করুন");
        setSaving(false);
        return;
      }

      const payload = {
        verseId: resolved.verseId,
        school: form.school,
        bookTitle: form.bookTitle.trim(),
        author: form.author.trim(),
        volume: form.volume.trim(),
        page: form.page.trim(),
        language: form.language.trim() || "bengali",
        summary: form.summary.trim(),
        fullText: form.fullText.trim(),
        keyPoints: toLines(form.keyPoints),
        sourceUrl: form.sourceUrl.trim(),
        publisher: form.publisher.trim(),
        ...(publicationYear !== undefined ? { publicationYear } : {}),
        verifiedBy: form.verifiedBy.trim(),
        status: form.status,
      };
      const url = initial
        ? `/api/admin/tafsirs/${initial._id}`
        : "/api/admin/tafsirs";
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
      router.push("/admin/tafsirs");
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
        <FormField
          label="সূরা নম্বর"
          english="Surah"
          required
          hint="আয়াতটি ডাটাবেজে থাকতে হবে"
        >
          <TextInput
            type="number"
            min={1}
            max={114}
            value={form.surah}
            onChange={(e) => set("surah", e.target.value)}
            placeholder="2"
            required
          />
        </FormField>
        <FormField label="আয়াত নম্বর" english="Ayah" required>
          <TextInput
            type="number"
            min={1}
            value={form.ayah}
            onChange={(e) => set("ayah", e.target.value)}
            placeholder="255"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
        <FormField label="ভাষা" english="Language">
          <TextInput
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            placeholder="bengali"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="গ্রন্থের নাম" english="Book title" required>
          <TextInput
            value={form.bookTitle}
            onChange={(e) => set("bookTitle", e.target.value)}
            placeholder="তাফসীর গ্রন্থের নাম"
            required
          />
        </FormField>
        <FormField label="লেখক" english="Author" required>
          <TextInput
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="লেখকের নাম"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="খণ্ড" english="Volume">
          <TextInput
            value={form.volume}
            onChange={(e) => set("volume", e.target.value)}
            placeholder="খণ্ড"
          />
        </FormField>
        <FormField label="পৃষ্ঠা" english="Page">
          <TextInput
            value={form.page}
            onChange={(e) => set("page", e.target.value)}
            placeholder="পৃষ্ঠা"
          />
        </FormField>
      </div>

      <FormField label="সারসংক্ষেপ" english="Summary" required>
        <TextArea
          rows={4}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="তাফসীরের সারসংক্ষেপ…"
          required
        />
      </FormField>

      <FormField label="পূর্ণ পাঠ" english="Full text">
        <TextArea
          rows={8}
          value={form.fullText}
          onChange={(e) => set("fullText", e.target.value)}
          placeholder="সম্পূর্ণ তাফসীর পাঠ…"
        />
      </FormField>

      <FormField
        label="মূল পয়েন্টসমূহ"
        english="Key points"
        hint="প্রতি লাইনে একটি পয়েন্ট"
      >
        <TextArea
          rows={4}
          value={form.keyPoints}
          onChange={(e) => set("keyPoints", e.target.value)}
          placeholder={"পয়েন্ট ১\nপয়েন্ট ২"}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="উৎস লিংক" english="Source URL">
          <TextInput
            type="url"
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            placeholder="https://…"
          />
        </FormField>
        <FormField label="প্রকাশক" english="Publisher">
          <TextInput
            value={form.publisher}
            onChange={(e) => set("publisher", e.target.value)}
            placeholder="প্রকাশকের নাম"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="প্রকাশনা বছর" english="Publication year">
          <TextInput
            type="number"
            min={600}
            max={2100}
            value={form.publicationYear}
            onChange={(e) => set("publicationYear", e.target.value)}
            placeholder="2001"
          />
        </FormField>
        <FormField label="যাচাইকারী" english="Verified by">
          <TextInput
            value={form.verifiedBy}
            onChange={(e) => set("verifiedBy", e.target.value)}
            placeholder="যাচাইকারীর নাম"
          />
        </FormField>
      </div>

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
        <Link href="/admin/tafsirs" className={secondaryButtonClass}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
