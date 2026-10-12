import { Schema, model, models, type Document } from "mongoose";
import type { PublishStatus, School } from "./Tafsir";

export interface IHadith extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const HadithSchema = new Schema<IHadith>(
  {
    collectionName: { type: String, required: true, trim: true, maxlength: 200, index: true },
    school: {
      type: String,
      enum: ["sunni", "shia", "shared"],
      required: true,
      index: true,
    },
    book: { type: String, trim: true, maxlength: 200 },
    chapter: { type: String, trim: true, maxlength: 200 },
    hadithNumber: { type: String, trim: true, maxlength: 100, index: true },
    narrator: { type: String, trim: true, maxlength: 300 },
    arabicText: { type: String, default: "" },
    bengaliTranslation: { type: String, default: "" },
    englishTranslation: { type: String, default: "" },
    grading: { type: String, trim: true, maxlength: 200 },
    gradingSource: { type: String, trim: true, maxlength: 300 },
    sourceUrl: { type: String, trim: true, maxlength: 2000 },
    notes: { type: String, default: "" },
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

HadithSchema.index({ collectionName: 1, hadithNumber: 1 });
HadithSchema.index({
  arabicText: "text",
  bengaliTranslation: "text",
  englishTranslation: "text",
  narrator: "text",
});

export const Hadith = models.Hadith || model<IHadith>("Hadith", HadithSchema);
