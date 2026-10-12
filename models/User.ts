import { Schema, model, models, type Document, type Types } from "mongoose";

export type UserRole = "admin" | "researcher" | "reviewer" | "viewer";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "researcher", "reviewer", "viewer"],
      default: "viewer",
      required: true,
    },
  },
  { timestamps: true },
);

// Never serialize the password hash.
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const rest = { ...(ret as unknown as Record<string, unknown>) };
    delete rest.passwordHash;
    return rest;
  },
});

export const User = models.User || model<IUser>("User", UserSchema);
export type UserId = Types.ObjectId;
