import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  collectionName: string;
  documentId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, trim: true, maxlength: 100, index: true },
    collectionName: { type: String, required: true, trim: true, maxlength: 100, index: true },
    documentId: { type: String, trim: true, maxlength: 100, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ipAddress: { type: String, trim: true, maxlength: 100 },
    userAgent: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog =
  models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
