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
import { errorMessage, toOptionalInt } from "./utils";

const REFERENCE_TYPES = [
  { value: "tafsir", bn: "তাফসীর", en: "Tafsir" },
  { value: "hadith", bn: "হাদিস", en: "Hadith" },
  { value: "book", bn: "বই", en: "Book" },
  { value: "article", bn: "প্রবন্ধ", en: "Article" },
  { value: "dictionary", bn: "অভিধান", en: "Dictionary" },
  { value: "manuscript", bn: "পাণ্ডুলিপি", en: "Manuscript" },
] as const;

type ReferenceTypeValue = (typeof REFERENCE_TYPES)[number]["value"];

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export function ReferenceForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    researchNoteId: "",
    type: "book" as ReferenceTypeValue,
    title: "",
    author: "",
    volume: "",
    page: "",
    publisher: "",
    publicationYear: "",
    url: "",
    citationFormat: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("শিরোনাম আবশ্যক");
      return;
    }
    const researchNoteId = form.researchNoteId.trim();
    if (researchNoteId && !OBJECT_ID_RE.test(researchNoteId)) {
      setError("গবেষণা নোট ID সঠিক ২৪-অক্ষরের ObjectId হতে হবে");
      return;
    }
    const publicationYear = toOptionalInt(form.publicationYear);
    if (publicationYear === null) {
      setError("প্রকাশনা বছর সঠিক নয়");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(researchNoteId ? { researchNoteId } : {}),
        type: form.type,
        title: form.title.trim(),
        author: form.author.trim(),
        volume: form.volume.trim(),
        page: form.page.trim(),
        publisher: form.publisher.trim(),
        ...(publicationYear !== undefined ? { publicationYear } : {}),
        url: form.url.trim(),
        citationFormat: form.citationFormat.trim(),
        notes: form.notes.trim(),
      };
      const res = await fetch("/api/admin/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(data, "সংরক্ষণ ব্যর্থ হয়েছে"));
        return;
      }
      router.push("/admin/references");
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
        <FormField label="ধরন" english="Type" required>
          <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {REFERENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.bn} ({t.en})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="গবেষণা নোট ID"
          english="Research note ObjectId"
          hint="ঐচ্ছিক — কোনো নোটের সাথে যুক্ত করতে চাইলে"
        >
          <TextInput
            value={form.researchNoteId}
            onChange={(e) => set("researchNoteId", e.target.value)}
            placeholder="64f… (ঐচ্ছিক)"
          />
        </FormField>
      </div>

      <FormField label="শিরোনাম" english="Title" required>
        <TextInput
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="রেফারেন্সের শিরোনাম"
          required
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="লেখক" english="Author">
          <TextInput
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="লেখকের নাম"
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

      <div className="grid gap-5 sm:grid-cols-3">
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
      </div>

      <FormField label="লিংক" english="URL">
        <TextInput
          type="url"
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://…"
        />
      </FormField>

      <FormField label="উদ্ধৃতি ফরম্যাট" english="Citation format">
        <TextArea
          rows={2}
          value={form.citationFormat}
          onChange={(e) => set("citationFormat", e.target.value)}
          placeholder="উদ্ধৃতির ফরম্যাট…"
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

      {error ? (
        <p className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClass}>
          {saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
        </button>
        <Link href="/admin/references" className={secondaryButtonClass}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
