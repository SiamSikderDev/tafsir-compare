import { Schema, model, models, type Document, type Types } from "mongoose";
import type { ReferenceType } from "./ResearchNote";

export interface IReference extends Document {
  researchNoteId?: Types.ObjectId;
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
  createdAt: Date;
}

const ReferenceSchema = new Schema<IReference>(
  {
    researchNoteId: {
      type: Schema.Types.ObjectId,
      ref: "ResearchNote",
      index: true,
    },
    type: {
      type: String,
      enum: ["tafsir", "hadith", "book", "article", "dictionary", "manuscript"],
      required: true,
      index: true,
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
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Reference =
  models.Reference || model<IReference>("Reference", ReferenceSchema);
