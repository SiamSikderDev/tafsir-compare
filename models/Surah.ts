import { Schema, model, models, type Document } from "mongoose";

export type RevelationPlace = "makkah" | "madinah";

export interface ISurah extends Document {
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameBengali: string;
  nameEnglish: string;
  revelationPlace: RevelationPlace;
  totalAyahs: number;
  chronologicalOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SurahSchema = new Schema<ISurah>(
  {
    number: { type: Number, required: true, unique: true, min: 1, max: 114 },
    nameArabic: { type: String, required: true, trim: true },
    nameTransliterated: { type: String, required: true, trim: true },
    nameBengali: { type: String, required: true, trim: true },
    nameEnglish: { type: String, required: true, trim: true },
    revelationPlace: {
      type: String,
      enum: ["makkah", "madinah"],
      required: true,
    },
    totalAyahs: { type: Number, required: true, min: 1 },
    chronologicalOrder: { type: Number, required: true, min: 1, max: 114 },
  },
  { timestamps: true },
);

export const Surah = models.Surah || model<ISurah>("Surah", SurahSchema);
