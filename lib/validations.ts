import { z } from "zod";

/** MongoDB ObjectId as a 24-hex-char string. Rejects operators like $gt. */
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const schoolEnum = z.enum(["sunni", "shia", "shared"]);
export const statusEnum = z.enum(["draft", "review", "published"]);
export const confidenceEnum = z.enum(["high", "medium", "low"]);
export const roleEnum = z.enum(["admin", "researcher", "reviewer", "viewer"]);
export const referenceTypeEnum = z.enum([
  "tafsir",
  "hadith",
  "book",
  "article",
  "dictionary",
  "manuscript",
]);

const optionalText = (max: number) => z.string().trim().max(max).optional();

/* ------------------------------ verses ------------------------------ */

export const verseCreateSchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  ayahNumber: z.number().int().min(1).max(300),
  globalAyahNumber: z.number().int().min(1).max(7000),
  arabicText: z.string().trim().min(1).max(20000),
  bengaliTranslation: z.string().trim().max(20000).optional().default(""),
  englishTranslation: z.string().trim().max(20000).optional().default(""),
  juz: z.number().int().min(1).max(30).optional(),
  page: z.number().int().min(1).max(604).optional(),
});

export const verseUpdateSchema = verseCreateSchema.partial();

/* ------------------------------ tafsirs ----------------------------- */

export const tafsirCreateSchema = z.object({
  verseId: objectId,
  school: schoolEnum,
  bookTitle: z.string().trim().min(1).max(300),
  author: z.string().trim().min(1).max(200),
  volume: optionalText(50),
  page: optionalText(50),
  language: z.string().trim().max(50).optional().default("bengali"),
  summary: z.string().trim().min(1).max(50000),
  fullText: z.string().trim().max(500000).optional().default(""),
  keyPoints: z.array(z.string().trim().max(2000)).max(50).optional().default([]),
  sourceUrl: z.string().trim().max(2000).optional(),
  publisher: optionalText(200),
  publicationYear: z.number().int().min(600).max(2100).optional(),
  verifiedBy: optionalText(200),
  status: statusEnum.optional().default("draft"),
});

export const tafsirUpdateSchema = tafsirCreateSchema.partial();

/* ------------------------------ hadiths ----------------------------- */

export const hadithCreateSchema = z.object({
  collectionName: z.string().trim().min(1).max(200),
  school: schoolEnum,
  book: optionalText(200),
  chapter: optionalText(200),
  hadithNumber: z.string().trim().max(100).optional(),
  narrator: optionalText(300),
  arabicText: z.string().trim().max(20000).optional().default(""),
  bengaliTranslation: z.string().trim().max(20000).optional().default(""),
  englishTranslation: z.string().trim().max(20000).optional().default(""),
  grading: optionalText(200),
  gradingSource: optionalText(300),
  sourceUrl: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(20000).optional().default(""),
  status: statusEnum.optional().default("draft"),
});

export const hadithUpdateSchema = hadithCreateSchema.partial();

/* ---------------------------- research notes ------------------------ */

const schoolViewSchema = z.object({
  summary: z.string().trim().max(50000).optional().default(""),
  tafsirIds: z.array(objectId).max(100).optional().default([]),
  hadithIds: z.array(objectId).max(100).optional().default([]),
});

const comparisonSchema = z.object({
  agreements: z.array(z.string().trim().max(5000)).max(50).optional().default([]),
  differences: z.array(z.string().trim().max(5000)).max(50).optional().default([]),
  neutralExplanation: z.string().trim().max(50000).optional().default(""),
});

const embeddedReferenceSchema = z.object({
  type: referenceTypeEnum,
  title: z.string().trim().min(1).max(500),
  author: optionalText(300),
  volume: optionalText(50),
  page: optionalText(50),
  publisher: optionalText(300),
  publicationYear: z.number().int().min(600).max(2100).optional(),
  url: z.string().trim().max(2000).optional(),
  citationFormat: optionalText(1000),
  notes: z.string().trim().max(10000).optional().default(""),
});

export const researchNoteCreateSchema = z.object({
  verseId: objectId,
  title: z.string().trim().min(1).max(500),
  language: z.string().trim().max(50).optional().default("bengali"),
  context: z.string().trim().max(50000).optional().default(""),
  linguisticNotes: z.array(z.string().trim().max(5000)).max(50).optional().default([]),
  historicalContext: z.string().trim().max(50000).optional().default(""),
  sunniView: schoolViewSchema
    .optional()
    .default({ summary: "", tafsirIds: [], hadithIds: [] }),
  shiaView: schoolViewSchema
    .optional()
    .default({ summary: "", tafsirIds: [], hadithIds: [] }),
  comparison: comparisonSchema
    .optional()
    .default({ agreements: [], differences: [], neutralExplanation: "" }),
  references: z.array(embeddedReferenceSchema).max(200).optional().default([]),
  confidence: confidenceEnum.optional().default("low"),
  reviewer: optionalText(200),
  status: statusEnum.optional().default("draft"),
});

export const researchNoteUpdateSchema = researchNoteCreateSchema.partial();

export const researchStatusPatchSchema = z.object({
  status: statusEnum,
});

/** Allowed editorial transitions: draft→review→published, review→draft. */
export function isAllowedTransition(from: string, to: string): boolean {
  return (
    (from === "draft" && to === "review") ||
    (from === "review" && to === "published") ||
    (from === "review" && to === "draft")
  );
}

/* ----------------------------- references --------------------------- */

export const referenceCreateSchema = z.object({
  researchNoteId: objectId.optional(),
  type: referenceTypeEnum,
  title: z.string().trim().min(1).max(500),
  author: optionalText(300),
  volume: optionalText(50),
  page: optionalText(50),
  publisher: optionalText(300),
  publicationYear: z.number().int().min(600).max(2100).optional(),
  url: z.string().trim().max(2000).optional(),
  citationFormat: optionalText(1000),
  notes: z.string().trim().max(10000).optional().default(""),
});

/* ------------------------------- users ------------------------------ */

export const userRoleUpdateSchema = z.object({
  role: roleEnum,
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  role: roleEnum.optional().default("viewer"),
});

/* ---------------------------- query params -------------------------- */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const schoolQuerySchema = z.object({
  school: schoolEnum.optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export const auditLogQuerySchema = paginationSchema.extend({
  action: z.string().trim().max(100).optional(),
  collection: z.string().trim().max(100).optional(),
});
