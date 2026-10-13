import { Schema, model, models, type Document, type Types } from "mongoose";

export type School = "sunni" | "shia" | "shared";
export type PublishStatus = "draft" | "review" | "published";

export interface ITafsir extends Document {
  verseId: Types.ObjectId;
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
  mentionsAliAhlulBayt?: boolean;
  mentionNote?: string;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TafsirSchema = new Schema<ITafsir>(
  {
    verseId: {
      type: Schema.Types.ObjectId,
      ref: "Verse",
      required: true,
      index: true,
    },
    school: {
      type: String,
      enum: ["sunni", "shia", "shared"],
      required: true,
      index: true,
    },
    bookTitle: { type: String, required: true, trim: true, maxlength: 300 },
    author: { type: String, required: true, trim: true, maxlength: 200 },
    volume: { type: String, trim: true, maxlength: 50 },
    page: { type: String, trim: true, maxlength: 50 },
    language: { type: String, trim: true, maxlength: 50, default: "bengali" },
    summary: { type: String, required: true },
    fullText: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    sourceUrl: { type: String, trim: true, maxlength: 2000 },
    publisher: { type: String, trim: true, maxlength: 200 },
    publicationYear: { type: Number, min: 600, max: 2100 },
    verifiedBy: { type: String, trim: true, maxlength: 200 },
    mentionsAliAhlulBayt: { type: Boolean, default: undefined, index: true },
    mentionNote: { type: String, default: "" },
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

TafsirSchema.index({ verseId: 1, school: 1, status: 1 });
TafsirSchema.index(
  { summary: "text", fullText: "text", bookTitle: "text", author: "text" },
  { language_override: "xTextLanguage" },
);
// NOTE: documents carry a `language` field ("bengali"/"english") which MongoDB
// would otherwise treat as the text-index language_override ("bengali" is not a
// supported text language and breaks writes). Point the override at a field
// that never exists so the default language is always used.

export const Tafsir = models.Tafsir || model<ITafsir>("Tafsir", TafsirSchema);
