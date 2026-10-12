import { Schema, model, models, type Document, type Types } from "mongoose";
import type { PublishStatus } from "./Tafsir";

export type Confidence = "high" | "medium" | "low";
export type ReferenceType =
  | "tafsir"
  | "hadith"
  | "book"
  | "article"
  | "dictionary"
  | "manuscript";

export interface IEmbeddedReference {
  type: ReferenceType;
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

export interface ISchoolView {
  summary?: string;
  tafsirIds: Types.ObjectId[];
  hadithIds: Types.ObjectId[];
}

export interface IComparison {
  agreements: string[];
  differences: string[];
  neutralExplanation?: string;
}

export interface IResearchNote extends Document {
  verseId: Types.ObjectId;
  title: string;
  language: string;
  context?: string;
  linguisticNotes: string[];
  historicalContext?: string;
  sunniView: ISchoolView;
  shiaView: ISchoolView;
  comparison: IComparison;
  references: IEmbeddedReference[];
  confidence: Confidence;
  reviewer?: string;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolViewSchema = new Schema<ISchoolView>(
  {
    summary: { type: String, default: "" },
    tafsirIds: [{ type: Schema.Types.ObjectId, ref: "Tafsir" }],
    hadithIds: [{ type: Schema.Types.ObjectId, ref: "Hadith" }],
  },
  { _id: false },
);

const ComparisonSchema = new Schema<IComparison>(
  {
    agreements: { type: [String], default: [] },
    differences: { type: [String], default: [] },
    neutralExplanation: { type: String, default: "" },
  },
  { _id: false },
);

const EmbeddedReferenceSchema = new Schema<IEmbeddedReference>(
  {
    type: {
      type: String,
      enum: ["tafsir", "hadith", "book", "article", "dictionary", "manuscript"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    author: { type: String, trim: true, maxlength: 300 },
    volume: { type: String, trim: true, maxlength: 50 },
    page: { type: String, trim: true, maxlength: 50 },
    publisher: { type: String, trim: true, maxlength: 300 },
    publicationYear: { type: Number, min: 600, max: 2100 },
    url: { type: String, trim: true, maxlength: 2000 },
    citationFormat: { type: String, trim: true, maxlength: 1000 },
    notes: { type: String, default: "" },
  },
  { _id: false },
);

const ResearchNoteSchema = new Schema<IResearchNote>(
  {
    verseId: {
      type: Schema.Types.ObjectId,
      ref: "Verse",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    language: { type: String, trim: true, maxlength: 50, default: "bengali" },
    context: { type: String, default: "" },
    linguisticNotes: { type: [String], default: [] },
    historicalContext: { type: String, default: "" },
    sunniView: { type: SchoolViewSchema, default: () => ({}) },
    shiaView: { type: SchoolViewSchema, default: () => ({}) },
    comparison: { type: ComparisonSchema, default: () => ({}) },
    references: { type: [EmbeddedReferenceSchema], default: [] },
    confidence: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
      required: true,
      index: true,
    },
    reviewer: { type: String, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["draft", "review", "published"],
      default: "draft",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

ResearchNoteSchema.index({ verseId: 1, status: 1 });
ResearchNoteSchema.index(
  { title: "text", context: "text", historicalContext: "text" },
  { language_override: "xTextLanguage" },
);
// NOTE: same as Tafsir — the `language` field must not be treated as the
// text-index language_override.

export const ResearchNote =
  models.ResearchNote || model<IResearchNote>("ResearchNote", ResearchNoteSchema);
