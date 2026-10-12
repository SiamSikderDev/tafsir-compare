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
import type {
  Confidence,
  PublishStatus,
  SerializedResearchNote,
} from "./types";
import {
  errorMessage,
  toLines,
  toObjectIds,
  toRequiredInt,
} from "./utils";

interface ResearchFormState {
  surah: string;
  ayah: string;
  title: string;
  language: string;
  context: string;
  linguisticNotes: string;
  historicalContext: string;
  sunniSummary: string;
  sunniTafsirIds: string;
  sunniHadithIds: string;
  shiaSummary: string;
  shiaTafsirIds: string;
  shiaHadithIds: string;
  agreements: string;
  differences: string;
  neutralExplanation: string;
  confidence: Confidence;
  reviewer: string;
  status: PublishStatus;
}

async function resolveVerseId(
  surah: number,
  ayah: number,
): Promise<{ ok: true; verseId: string } | { ok: false }> {
  const res = await fetch(`/api/verses/${surah}/${ayah}`, {
    headers: { Accept: "application/json" },
  });
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

function SectionHeading({
  bn,
  en,
}: {
  bn: string;
  en: string;
}) {
  return (
    <h2 className="border-b border-neutral-200 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      {bn}
      <span className="ml-2 font-normal normal-case tracking-normal">
        {en}
      </span>
    </h2>
  );
}

export function ResearchForm({
  initial,
  initialSurah,
  initialAyah,
}: {
  initial: SerializedResearchNote | null;
  initialSurah: string;
  initialAyah: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ResearchFormState>({
    surah: initialSurah,
    ayah: initialAyah,
    title: initial?.title ?? "",
    language: initial?.language ?? "bengali",
    context: initial?.context ?? "",
    linguisticNotes: initial?.linguisticNotes?.join("\n") ?? "",
    historicalContext: initial?.historicalContext ?? "",
    sunniSummary: initial?.sunniView?.summary ?? "",
    sunniTafsirIds: initial?.sunniView?.tafsirIds?.join(", ") ?? "",
    sunniHadithIds: initial?.sunniView?.hadithIds?.join(", ") ?? "",
    shiaSummary: initial?.shiaView?.summary ?? "",
    shiaTafsirIds: initial?.shiaView?.tafsirIds?.join(", ") ?? "",
    shiaHadithIds: initial?.shiaView?.hadithIds?.join(", ") ?? "",
    agreements: initial?.comparison?.agreements?.join("\n") ?? "",
    differences: initial?.comparison?.differences?.join("\n") ?? "",
    neutralExplanation: initial?.comparison?.neutralExplanation ?? "",
    confidence: initial?.confidence ?? "low",
    reviewer: initial?.reviewer ?? "",
    status: initial?.status ?? "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof ResearchFormState, value: string) =>
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
    if (!form.title.trim()) {
      setError("শিরোনাম আবশ্যক");
      return;
    }

    const idFields: [keyof ResearchFormState, string][] = [
      ["sunniTafsirIds", "সুন্নি দৃষ্টিভঙ্গি — তাফসীর ID"],
      ["sunniHadithIds", "সুন্নি দৃষ্টিভঙ্গি — হাদিস ID"],
      ["shiaTafsirIds", "শিয়া দৃষ্টিভঙ্গি — তাফসীর ID"],
      ["shiaHadithIds", "শিয়া দৃষ্টিভঙ্গি — হাদিস ID"],
    ];
    const parsedIds: Record<string, string[]> = {};
    for (const [key, label] of idFields) {
      const ids = toObjectIds(form[key]);
      if (ids === null) {
        setError(`${label}: সবগুলো ২৪-অক্ষরের ObjectId হতে হবে`);
        return;
      }
      parsedIds[key] = ids;
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
        title: form.title.trim(),
        language: form.language.trim() || "bengali",
        context: form.context.trim(),
        linguisticNotes: toLines(form.linguisticNotes),
        historicalContext: form.historicalContext.trim(),
        sunniView: {
          summary: form.sunniSummary.trim(),
          tafsirIds: parsedIds.sunniTafsirIds,
          hadithIds: parsedIds.sunniHadithIds,
        },
        shiaView: {
          summary: form.shiaSummary.trim(),
          tafsirIds: parsedIds.shiaTafsirIds,
          hadithIds: parsedIds.shiaHadithIds,
        },
        comparison: {
          agreements: toLines(form.agreements),
          differences: toLines(form.differences),
          neutralExplanation: form.neutralExplanation.trim(),
        },
        confidence: form.confidence,
        reviewer: form.reviewer.trim(),
        status: form.status,
      };
      const url = initial
        ? `/api/admin/research/${initial._id}`
        : "/api/admin/research";
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
      router.push("/admin/research");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7">
      <section className="flex flex-col gap-5">
        <SectionHeading bn="মৌলিক তথ্য" en="Basic info" />
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
          <FormField label="শিরোনাম" english="Title" required>
            <TextInput
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="গবেষণা নোটের শিরোনাম"
              required
            />
          </FormField>
          <FormField label="ভাষা" english="Language">
            <TextInput
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
              placeholder="bengali"
            />
          </FormField>
        </div>
        <FormField label="প্রেক্ষাপট" english="Context">
          <TextArea
            rows={4}
            value={form.context}
            onChange={(e) => set("context", e.target.value)}
            placeholder="আয়াতের প্রেক্ষাপট…"
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading
          bn="ভাষাগত ও ঐতিহাসিক প্রেক্ষাপট"
          en="Linguistic & historical context"
        />
        <FormField
          label="ভাষাগত নোট"
          english="Linguistic notes"
          hint="প্রতি লাইনে একটি নোট"
        >
          <TextArea
            rows={4}
            value={form.linguisticNotes}
            onChange={(e) => set("linguisticNotes", e.target.value)}
            placeholder={"নোট ১\nনোট ২"}
          />
        </FormField>
        <FormField label="ঐতিহাসিক প্রেক্ষাপট" english="Historical context">
          <TextArea
            rows={4}
            value={form.historicalContext}
            onChange={(e) => set("historicalContext", e.target.value)}
            placeholder="ঐতিহাসিক প্রেক্ষাপট…"
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading bn="সুন্নি দৃষ্টিভঙ্গি" en="Sunni view" />
        <FormField label="সারসংক্ষেপ" english="Summary">
          <TextArea
            rows={5}
            value={form.sunniSummary}
            onChange={(e) => set("sunniSummary", e.target.value)}
            placeholder="সুন্নি দৃষ্টিভঙ্গির সারসংক্ষেপ…"
          />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="তাফসীর ID"
            english="Tafsir ObjectIds"
            hint="কমা দিয়ে আলাদা করুন (ঐচ্ছিক)"
          >
            <TextInput
              value={form.sunniTafsirIds}
              onChange={(e) => set("sunniTafsirIds", e.target.value)}
              placeholder="64f…, 64f…"
            />
          </FormField>
          <FormField
            label="হাদিস ID"
            english="Hadith ObjectIds"
            hint="কমা দিয়ে আলাদা করুন (ঐচ্ছিক)"
          >
            <TextInput
              value={form.sunniHadithIds}
              onChange={(e) => set("sunniHadithIds", e.target.value)}
              placeholder="64f…, 64f…"
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading bn="শিয়া দৃষ্টিভঙ্গি" en="Shia view" />
        <FormField label="সারসংক্ষেপ" english="Summary">
          <TextArea
            rows={5}
            value={form.shiaSummary}
            onChange={(e) => set("shiaSummary", e.target.value)}
            placeholder="শিয়া দৃষ্টিভঙ্গির সারসংক্ষেপ…"
          />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="তাফসীর ID"
            english="Tafsir ObjectIds"
            hint="কমা দিয়ে আলাদা করুন (ঐচ্ছিক)"
          >
            <TextInput
              value={form.shiaTafsirIds}
              onChange={(e) => set("shiaTafsirIds", e.target.value)}
              placeholder="64f…, 64f…"
            />
          </FormField>
          <FormField
            label="হাদিস ID"
            english="Hadith ObjectIds"
            hint="কমা দিয়ে আলাদা করুন (ঐচ্ছিক)"
          >
            <TextInput
              value={form.shiaHadithIds}
              onChange={(e) => set("shiaHadithIds", e.target.value)}
              placeholder="64f…, 64f…"
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading bn="তুলনা" en="Comparison" />
        <FormField
          label="ঐকমত্যের বিষয়"
          english="Agreements"
          hint="প্রতি লাইনে একটি"
        >
          <TextArea
            rows={3}
            value={form.agreements}
            onChange={(e) => set("agreements", e.target.value)}
            placeholder={"বিষয় ১\nবিষয় ২"}
          />
        </FormField>
        <FormField
          label="পার্থক্য"
          english="Differences"
          hint="প্রতি লাইনে একটি"
        >
          <TextArea
            rows={3}
            value={form.differences}
            onChange={(e) => set("differences", e.target.value)}
            placeholder={"পার্থক্য ১\nপার্থক্য ২"}
          />
        </FormField>
        <FormField label="নিরপেক্ষ ব্যাখ্যা" english="Neutral explanation">
          <TextArea
            rows={4}
            value={form.neutralExplanation}
            onChange={(e) => set("neutralExplanation", e.target.value)}
            placeholder="নিরপেক্ষ ব্যাখ্যা…"
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading bn="পর্যালোচনা" en="Review" />
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="আস্থা" english="Confidence">
            <Select
              value={form.confidence}
              onChange={(e) => set("confidence", e.target.value)}
            >
              <option value="high">উচ্চ (High)</option>
              <option value="medium">মাঝারি (Medium)</option>
              <option value="low">নিম্ন (Low)</option>
            </Select>
          </FormField>
          <FormField label="পর্যালোচক" english="Reviewer">
            <TextInput
              value={form.reviewer}
              onChange={(e) => set("reviewer", e.target.value)}
              placeholder="পর্যালোচকের নাম"
            />
          </FormField>
          <FormField
            label="অবস্থা"
            english="Status"
            hint="সার্ভার ভূমিকা অনুযায়ী যাচাই করবে"
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
        </div>
      </section>

      {error ? (
        <p className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClass}>
          {saving ? "সংরক্ষণ হচ্ছে…" : initial ? "আপডেট করুন" : "সংরক্ষণ করুন"}
        </button>
        <Link href="/admin/research" className={secondaryButtonClass}>
          বাতিল
        </Link>
      </div>
    </form>
  );
}
