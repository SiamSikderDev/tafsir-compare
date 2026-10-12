import { Schema, model, models, type Document } from "mongoose";

export interface IVerse extends Document {
  surahNumber: number;
  ayahNumber: number;
  globalAyahNumber: number;
  arabicText: string;
  bengaliTranslation?: string;
  englishTranslation?: string;
  juz?: number;
  page?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VerseSchema = new Schema<IVerse>(
  {
    surahNumber: { type: Number, required: true, min: 1, max: 114, index: true },
    ayahNumber: { type: Number, required: true, min: 1 },
    globalAyahNumber: { type: Number, required: true, unique: true, min: 1 },
    arabicText: { type: String, required: true },
    bengaliTranslation: { type: String, default: "" },
    englishTranslation: { type: String, default: "" },
    juz: { type: Number, min: 1, max: 30 },
    page: { type: Number, min: 1, max: 604 },
  },
  { timestamps: true },
);

VerseSchema.index({ surahNumber: 1, ayahNumber: 1 }, { unique: true });
VerseSchema.index({
  arabicText: "text",
  bengaliTranslation: "text",
  englishTranslation: "text",
});

export const Verse = models.Verse || model<IVerse>("Verse", VerseSchema);
