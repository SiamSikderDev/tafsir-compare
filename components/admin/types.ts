/** Serialized (JSON-safe) shapes passed from server components to client forms. */

export type Role = "admin" | "researcher" | "reviewer" | "viewer";
export type PublishStatus = "draft" | "review" | "published";
export type School = "sunni" | "shia" | "shared";
export type Confidence = "high" | "medium" | "low";

export interface VerseRef {
  _id: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface SerializedVerse {
  _id: string;
  surahNumber: number;
  ayahNumber: number;
  globalAyahNumber: number;
  arabicText: string;
  bengaliTranslation: string;
  englishTranslation: string;
  juz?: number;
  page?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedTafsir {
  _id: string;
  verseId: string | VerseRef;
  school: School;
  bookTitle: string;
  author: string;
  volume?: string;
  page?: string;
  language?: string;
  summary: string;
  fullText?: string;
  keyPoints: string[];
  sourceUrl?: string;
  publisher?: string;
  publicationYear?: number;
  verifiedBy?: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedHadith {
  _id: string;
  collectionName: string;
  school: School;
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
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolViewData {
  summary?: string;
  tafsirIds: string[];
  hadithIds: string[];
}

export interface ComparisonData {
  agreements: string[];
  differences: string[];
  neutralExplanation?: string;
}

export interface SerializedResearchNote {
  _id: string;
  verseId: string | VerseRef;
  title: string;
  language?: string;
  context?: string;
  linguisticNotes: string[];
  historicalContext?: string;
  sunniView: SchoolViewData;
  shiaView: SchoolViewData;
  comparison: ComparisonData;
  confidence: Confidence;
  reviewer?: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedReference {
  _id: string;
  researchNoteId?: string;
  type: string;
  title: string;
  author?: string;
  volume?: string;
  page?: string;
  publisher?: string;
  publicationYear?: number;
  url?: string;
  citationFormat?: string;
  notes?: string;
  createdAt: string;
}

export interface SerializedUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedAuditLog {
  _id: string;
  userId?: { _id: string; name: string; email: string } | string;
  action: string;
  collectionName: string;
  documentId?: string;
  createdAt: string;
}

/** Extract the populated verse ref when verseId was populated, else null. */
export function verseRefOf(ref: string | VerseRef): VerseRef | null {
  return typeof ref === "object" && ref !== null ? ref : null;
}

/** "2:255" style label for a verse ref. */
export function verseLabel(ref: VerseRef | null): string {
  return ref ? `${ref.surahNumber}:${ref.ayahNumber}` : "—";
}

export const roleLabel: Record<Role, string> = {
  admin: "অ্যাডমিন",
  researcher: "গবেষক",
  reviewer: "পর্যালোচক",
  viewer: "দর্শক",
};

export const schoolLabel: Record<School, string> = {
  sunni: "সুন্নি",
  shia: "শিয়া",
  shared: "যৌথ",
};

export const statusLabel: Record<PublishStatus, string> = {
  draft: "খসড়া",
  review: "পর্যালোচনাধীন",
  published: "প্রকাশিত",
};

export const confidenceLabel: Record<Confidence, string> = {
  high: "উচ্চ",
  medium: "মাঝারি",
  low: "নিম্ন",
};
