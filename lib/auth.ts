import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

/**
 * Full Auth.js v5 config (Node runtime only — used by API routes and
 * server components). The Credentials authorize() lazy-loads the database
 * so this module stays out of the Edge middleware bundle; middleware uses
 * lib/auth.config.ts instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email / ইমেইল", type: "email" },
        password: { label: "Password / পাসওয়ার্ড", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        // Lazy: keeps mongoose out of the Edge bundle.
        const { connectDB } = await import("./db");
        const { User } = await import("@/models/User");

        await connectDB();
        // +passwordHash: selected explicitly since schema sets select:false
        const user = (await User.findOne({ email: parsed.data.email })
          .select("+passwordHash")
          .lean()) as {
          _id: unknown;
          name: string;
          email: string;
          role: "admin" | "researcher" | "reviewer" | "viewer";
          passwordHash: string;
        } | null;
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
