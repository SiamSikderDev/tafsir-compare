/** Shared TypeScript types for the public API payloads. */

export interface ApiSurah {
  _id: string;
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameBengali: string;
  nameEnglish: string;
  revelationPlace: "makkah" | "madinah";
  totalAyahs: number;
}

export interface ApiVerse {
  _id: string;
  surahNumber: number;
  ayahNumber: number;
  globalAyahNumber?: number;
  arabicText: string;
  bengaliTranslation: string;
  englishTranslation?: string;
  juz?: number;
  page?: number;
}

export type TafsirSchool = "sunni" | "shia" | "shared";

export interface ApiTafsir {
  _id: string;
  verseId: string;
  school: TafsirSchool;
  bookTitle: string;
  author?: string;
  volume?: string;
  page?: string;
  language?: string;
  summary?: string;
  fullText?: string;
  keyPoints?: string[];
  sourceUrl?: string;
  publisher?: string;
  publicationYear?: number;
}

export interface ApiHadith {
  _id: string;
  collectionName: string;
  school: string;
  book?: string;
  chapter?: string;
  hadithNumber?: string;
  narrator?: string;
  arabicText?: string;
  bengaliTranslation?: string;
  englishTranslation?: string;
  grading?: string;
  gradingSource?: string;
  sourceUrl?: string;
  notes?: string;
}

export interface ApiReference {
  type: "tafsir" | "hadith" | "book" | "article" | "dictionary" | "manuscript";
  title: string;
  author?: string;
  volume?: string;
  page?: string;
  publisher?: string;
  publicationYear?: number;
  url?: string;
  citationFormat?: string;
  notes?: string;
}

export type Confidence = "high" | "medium" | "low";

export interface ApiResearchNote {
  _id: string;
  verseId: string;
  title: string;
  language?: string;
  context?: string;
  linguisticNotes?: string[];
  historicalContext?: string;
  sunniView?: { summary?: string };
  shiaView?: { summary?: string };
  comparison?: {
    agreements?: string[];
    differences?: string[];
    neutralExplanation?: string;
  };
  references?: ApiReference[];
  confidence?: Confidence;
  reviewer?: string;
}

export interface ApiSearchItem {
  type: "verse" | "tafsir" | "hadith" | "research";
  surahNumber?: number;
  ayahNumber?: number;
  snippet: string;
  school?: string;
  sourceBook?: string;
  confidence?: string;
  link: string | null;
}

export function ayahRef(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}
