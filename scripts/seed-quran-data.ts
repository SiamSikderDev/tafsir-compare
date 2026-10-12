/**
 * ⚠️ DEPRECATED — do not use for final content.
 * This script pulls Quran text and translations from a third-party API at
 * seed time, which conflicts with the platform's non-negotiable rule:
 * final content must come from verified sources into our own database
 * (no external Quran/Tafsir/Hadith APIs), and Arabic text must never be
 * auto-imported without mushaf verification.
 *
 * Use instead:
 *   - bun scripts/seed-surahs.ts            (114 surah metadata, embedded)
 *   - bun scripts/seed-verses.ts            (verses from verified mushaf via scripts/data/verses.json)
 * See scripts/README.md for the verification policy.
 *
 * Kept for reference only.
 */

/**
 * Seed script for Tafsir Compare: 114 surah metadata + all 6,236 verses
 * (Arabic Uthmani text + Bengali (Taisirul Quran, resource 161) +
 *  English (Abdel Haleem, resource 85) translations).
 *
 * Source: Quran.com API v4 (free, no auth). Checked live 2026-10-12:
 *   GET /api/v4/chapters                     -> 114 chapters (200 OK)
 *   GET /api/v4/verses/by_chapter/{id}?words=false&text_uthmani=true&translations=161,85&per_page=500
 *
 * Idempotent: upserts on Surah.number and Verse(surahNumber, ayahNumber).
 * Dry run:  bun scripts/seed-quran-data.ts --dry-run
 * Live run: bun scripts/seed-quran-data.ts
 * MONGODB_URI comes from .env (bun loads it automatically).
 *
 * NOTE: this seeds structural Quran data only. Tafsir/Hadith content is
 * editorial and must go through the admin draft -> review -> published
 * workflow with exact book/volume/page citations — never auto-seeded.
 */

import mongoose from "mongoose";
import { Surah } from "../models/Surah";
import { Verse } from "../models/Verse";

const API = "https://api.quran.com/api/v4";
const BN_TRANSLATION = 161; // Taisirul Quran (Tawheed Publication)
const EN_TRANSLATION = 85; // M.A.S. Abdel Haleem

// Standard Bengali surah names (Taisirul Quran convention). index 0 = surah 1.
const SURAH_BN = [
  "আল-ফাতিহা","আল-বাকারা","আলে-ইমরান","আন-নিসা","আল-মায়েদা","আল-আন'আম",
  "আল-আ'রাফ","আল-আনফাল","আত-তাওবা","ইউনুস","হূদ","ইউসুফ","আর-রা'দ",
  "ইবরাহীম","আল-হিজর","আন-নাহল","বনি ইসরাঈল","আল-কাহফ","মারইয়াম",
  "ত্বোয়া-হা","আল-আম্বিয়া","আল-হজ্জ","আল-মুমিনূন","আন-নূর","আল-ফুরকান",
  "আশ-শু'আরা","আন-নামল","আল-কাসাস","আল-আনকাবূত","আর-রূম","লুকমান",
  "আস-সাজদা","আল-আহযাব","সাবা","ফাতির","ইয়া-সীন","আস-সাফফাত","সোয়াদ",
  "আয-যুমার","গাফির","ফুসসিলাত","আশ-শূরা","আয-যুখরুফ","আদ-দুখান",
  "আল-জাসিয়া","আল-আহকাফ","মুহাম্মদ","আল-ফাতহ","আল-হুজুরাত","ক্বাফ",
  "আয-যারিয়াত","আত-তূর","আন-নাজম","আল-কামার","আর-রাহমান","আল-ওয়াকিআ",
  "আল-হাদীদ","আল-মুজাদালা","আল-হাশর","আল-মুমতাহিনা","আস-সফ","আল-জুমুআ",
  "আল-মুনাফিকূন","আত-তাগাবুন","আত-তালাক","আত-তাহরীম","আল-মুলক","আল-কলম",
  "আল-হাক্কা","আল-মা'আরিজ","নূহ","আল-জিন","আল-মুযযম্মিল","আল-মুদ্দাসসির",
  "আল-কিয়ামা","আল-ইনসান","আল-মুরসালাত","আন-নাবা","আন-নাযিআত","আবাসা",
  "আত-তাকবীর","আল-ইনফিতার","আল-মুতাফফিফীন","আল-ইনশিকাক","আল-বুরুজ",
  "আত-তারিক","আল-আ'লা","আল-গাশিয়া","আল-ফাজর","আল-বালাদ","আশ-শামস",
  "আল-লাইল","আদ-দুহা","আশ-শারহ","আত-তীন","আল-আলাক","আল-কদর",
  "আল-বাইয়্যিনা","আয-যিলযাল","আল-আদিয়াত","আল-ক্বারিআ","আত-তাকাসুর",
  "আল-আসর","আল-হুমাযা","আল-ফীল","কুরাইশ","আল-মাউন","আল-কাউসার",
  "আল-কাফিরূন","আন-নাসর","আল-মাসাদ","আল-ইখলাস","আল-ফালাক","আন-নাস",
];

const dryRun = process.argv.includes("--dry-run");

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri && !dryRun) throw new Error("MONGODB_URI is not set");

  const chaptersRes = await fetchJson("/chapters?language=en");
  const chapters = chaptersRes.chapters as any[];
  console.log(`Fetched ${chapters.length} chapters from API`);

  let globalAyah = 0;
  let surahsUpserted = 0;
  let versesUpserted = 0;

  if (!dryRun) await mongoose.connect(uri!, { bufferCommands: false });

  for (const ch of chapters) {
    const n: number = ch.id;
    const surahDoc = {
      number: n,
      nameArabic: ch.name_arabic as string,
      nameTransliterated: ch.name_simple as string,
      nameEnglish: ch.translated_name?.name as string,
      nameBengali: SURAH_BN[n - 1],
      revelationPlace: ch.revelation_place as "makkah" | "madinah",
      totalAyahs: ch.verses_count as number,
      chronologicalOrder: ch.revelation_order as number,
    };
    if (!dryRun) {
      await Surah.findOneAndUpdate({ number: n }, surahDoc, {
        upsert: true,
        new: true,
      });
      surahsUpserted++;
    }

    const versesRes = await fetchJson(
      `/verses/by_chapter/${n}?words=false&text_uthmani=true&translations=${BN_TRANSLATION},${EN_TRANSLATION}&per_page=500`,
    );
    const verses = versesRes.verses as any[];
    for (const v of verses) {
      const ayahNumber = parseInt(
        String(v.verse_key).split(":")[1] ?? "0",
        10,
      );
      globalAyah++;
      const tr = v.translations ?? [];
      const bn = tr.find((t: any) => t.resource_id === BN_TRANSLATION);
      const en = tr.find((t: any) => t.resource_id === EN_TRANSLATION);
      const verseDoc = {
        surahNumber: n,
        ayahNumber,
        globalAyahNumber: globalAyah,
        arabicText: v.text_uthmani as string,
        bengaliTranslation: bn ? stripTags(bn.text) : "",
        englishTranslation: en ? stripTags(en.text) : "",
        juz: v.juz_number ?? undefined,
        page: v.page_number ?? undefined,
      };
      if (!dryRun) {
        await Verse.findOneAndUpdate(
          { surahNumber: n, ayahNumber },
          verseDoc,
          { upsert: true, new: true },
        );
        versesUpserted++;
      }
    }
    console.log(`  surah ${n}/114 seeded (${verses.length} ayahs)`);
  }

  if (!dryRun) await mongoose.disconnect();

  console.log(
    dryRun
      ? `DRY RUN complete: would seed ${chapters.length} surahs, ${globalAyah} verses`
      : `Done: ${surahsUpserted} surahs, ${versesUpserted} verses upserted`,
  );
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
