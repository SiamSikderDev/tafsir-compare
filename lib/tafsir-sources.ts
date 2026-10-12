/**
 * Canonical tafsir source bibliography — the single source of truth for the
 * tafsir books researchers cite from.
 *
 * Used by `app/api/tafsir-sources/route.ts` (public catalog),
 * `app/sources/page.tsx` (Tafsir Library section), and the admin tafsir
 * form's Source dropdown (auto-fills bookTitle/author/school).
 *
 * BIBLIOGRAPHIC FACTS ONLY. No commentary, no interpretive content, no
 * AI-generated religious claims. Volume counts appear ONLY where they are
 * universally established (currently: Al-Mizan, 20 volumes); everything
 * else is null rather than guessed.
 *
 * NOTE: a task document listed "20 Shia sources" that were all the same
 * book (Tafsir al-Mizan repeated) — deduplicated here to ONE canonical
 * Al-Mizan entry.
 */

export type TafsirSchool = "sunni" | "shia";

export interface TafsirSourceEntry {
  /** kebab-case id, e.g. "ibn-kathir" */
  id: string;
  /** Common transliterated title */
  title: string;
  /** Full transliterated title with Arabic script */
  fullTitle: string;
  author: string;
  school: TafsirSchool;
  /** Original language of the work */
  language: string;
  /** Neutral 1–2 line methodology/use description. No interpretive content. */
  description: string;
  /** Century of composition, e.g. "14th century" */
  era: string;
  /** Volume count ONLY where universally known, else null (never guessed). */
  volumes: number | null;
}

export const TAFSIR_SOURCES: TafsirSourceEntry[] = [
  // ── Sunni (7) ──────────────────────────────────────────────
  {
    id: "ibn-kathir",
    title: "Tafsir Ibn Kathir",
    fullTitle: "Tafsir al-Qur'an al-Azim / تفسير القرآن العظيم",
    author: "Imad al-Din Isma'il ibn Kathir",
    school: "sunni",
    language: "Arabic",
    description:
      "Hadith-based exegesis; explains verses through Quranic cross-references, prophetic traditions, and reports of the Companions. Widely studied in the Sunni tradition.",
    era: "14th century",
    volumes: null,
  },
  {
    id: "al-tabari",
    title: "Tafsir al-Tabari",
    fullTitle: "Jami' al-Bayan 'an Ta'wil Ay al-Qur'an / جامع البيان عن تأويل آي القرآن",
    author: "Muhammad ibn Jarir al-Tabari",
    school: "sunni",
    language: "Arabic",
    description:
      "Narration-based commentary; collects chains of transmission and early exegetical reports verse by verse. Among the earliest complete tafsirs.",
    era: "10th century",
    volumes: null,
  },
  {
    id: "al-qurtubi",
    title: "Tafsir al-Qurtubi",
    fullTitle: "Al-Jami' li Ahkam al-Qur'an / الجامع لأحكام القرآن",
    author: "Abu Abdallah Muhammad ibn Ahmad al-Qurtubi",
    school: "sunni",
    language: "Arabic",
    description:
      "Jurisprudence-oriented commentary; derives legal rulings from verses alongside linguistic and theological discussion.",
    era: "13th century",
    volumes: null,
  },
  {
    id: "al-jalalayn",
    title: "Tafsir al-Jalalayn",
    fullTitle: "Tafsir al-Jalalayn / تفسير الجلالين",
    author: "Jalal al-Din al-Mahalli and Jalal al-Din al-Suyuti",
    school: "sunni",
    language: "Arabic",
    description:
      "Concise commentary known for brief explanations of words and phrases. One of the most widely read short tafsirs.",
    era: "15th century",
    volumes: null,
  },
  {
    id: "al-sadi",
    title: "Tafsir al-Sa'di",
    fullTitle:
      "Taysir al-Karim al-Rahman fi Tafsir Kalam al-Mannan / تيسير الكريم الرحمن في تفسير كلام المنان",
    author: "Abd al-Rahman ibn Nasir al-Sa'di",
    school: "sunni",
    language: "Arabic",
    description:
      "Modern plain-language commentary; focuses on the apparent meaning of verses in an accessible style without heavy technical apparatus.",
    era: "20th century",
    volumes: null,
  },
  {
    id: "al-baghawi",
    title: "Tafsir al-Baghawi",
    fullTitle: "Ma'alim al-Tanzil / معالم التنزيل",
    author: "Al-Husayn ibn Mas'ud al-Baghawi",
    school: "sunni",
    language: "Arabic",
    description:
      "Narration-based commentary drawing on hadith and early reports; presents transmitted material with minimal personal commentary.",
    era: "12th century",
    volumes: null,
  },
  {
    id: "al-mawardi",
    title: "Tafsir al-Mawardi",
    fullTitle: "Al-Nukat wa al-'Uyun / النكت والعيون",
    author: "Ali ibn Muhammad al-Mawardi",
    school: "sunni",
    language: "Arabic",
    description:
      "Literary and interpretive commentary; gathers multiple exegetical views on verses with linguistic analysis.",
    era: "11th century",
    volumes: null,
  },
  // ── Shia (6) ───────────────────────────────────────────────
  {
    id: "al-mizan",
    title: "Tafsir al-Mizan",
    fullTitle: "Al-Mizan fi Tafsir al-Qur'an / الميزان في تفسير القرآن",
    author: "Allamah Sayyid Muhammad Husayn Tabatabai",
    school: "shia",
    language: "Arabic",
    description:
      "Philosophical and theological commentary; interprets the Quran through the Quran itself with rational and doctrinal analysis. The central modern Shia tafsir.",
    era: "20th century",
    volumes: 20,
  },
  {
    id: "nur-al-thaqalayn",
    title: "Tafsir Nur al-Thaqalayn",
    fullTitle: "Nur al-Thaqalayn / نور الثقلين",
    author: "Abd Ali ibn Jum'a al-Huwayzi",
    school: "shia",
    language: "Arabic",
    description:
      "Narration-based compilation; gathers traditions of the Ahl al-Bayt on verses of the Quran.",
    era: "17th century",
    volumes: null,
  },
  {
    id: "al-tibyan",
    title: "Tafsir al-Tibyan",
    fullTitle: "Al-Tibyan fi Tafsir al-Qur'an / التبيان في تفسير القرآن",
    author: "Muhammad ibn al-Hasan al-Tusi (Shaykh al-Tusi)",
    school: "shia",
    language: "Arabic",
    description:
      "Early Imami commentary; combines transmitted reports with theological and linguistic discussion.",
    era: "11th century",
    volumes: null,
  },
  {
    id: "majma-al-bayan",
    title: "Majma' al-Bayan",
    fullTitle: "Majma' al-Bayan fi Tafsir al-Qur'an / مجمع البيان في تفسير القرآن",
    author: "Amin al-Din al-Tabrisi",
    school: "shia",
    language: "Arabic",
    description:
      "Comprehensive commentary covering language, jurisprudence, and theology; among the most celebrated Shia tafsirs.",
    era: "12th century",
    volumes: null,
  },
  {
    id: "al-qummi",
    title: "Tafsir al-Qummi",
    fullTitle: "Tafsir al-Qummi / تفسير القمي",
    author: "Ali ibn Ibrahim al-Qummi",
    school: "shia",
    language: "Arabic",
    description:
      "Early narration-based tafsir; transmits exegetical traditions attributed to the Imams.",
    era: "10th century",
    volumes: null,
  },
  {
    id: "al-ayyashi",
    title: "Tafsir al-Ayyashi",
    fullTitle: "Tafsir al-Ayyashi / تفسير العياشي",
    author: "Muhammad ibn Mas'ud al-Ayyashi",
    school: "shia",
    language: "Arabic",
    description:
      "Early narration-based tafsir; a collection of traditions on Quranic verses.",
    era: "10th century",
    volumes: null,
  },
];

/** Look up a catalog entry by its kebab-case id. */
export function getTafsirSource(id: string): TafsirSourceEntry | undefined {
  return TAFSIR_SOURCES.find((s) => s.id === id);
}

/**
 * Assert catalog integrity: exactly 13 entries, unique ids,
 * 7 sunni + 6 shia, and no commentary content beyond the description field.
 * Throws on any violation.
 */
export function validateTafsirSources(): void {
  if (TAFSIR_SOURCES.length !== 13) {
    throw new Error(
      `TAFSIR_SOURCES must have exactly 13 entries, found ${TAFSIR_SOURCES.length}`,
    );
  }
  const ids = TAFSIR_SOURCES.map((s) => s.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate tafsir source ids: ${dupes.join(", ")}`);
  }
  const sunni = TAFSIR_SOURCES.filter((s) => s.school === "sunni").length;
  const shia = TAFSIR_SOURCES.filter((s) => s.school === "shia").length;
  if (sunni !== 7 || shia !== 6) {
    throw new Error(
      `Expected 7 sunni + 6 shia sources, found ${sunni} + ${shia}`,
    );
  }
  for (const s of TAFSIR_SOURCES) {
    if (!s.id || !s.title || !s.fullTitle || !s.author || !s.description || !s.era) {
      throw new Error(`Tafsir source entry missing required field: ${s.id || "?"}`);
    }
    if (s.language !== "Arabic") {
      throw new Error(`Unexpected language for ${s.id}: ${s.language}`);
    }
  }
}
