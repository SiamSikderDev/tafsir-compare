import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration (no Node-only imports).
 * Used by middleware.ts. The full config with the Credentials provider
 * lives in lib/auth.ts (Node runtime only).
 */
export const authConfig = {
  trustHost: true,
  // No sign-in providers here: middleware only reads the session cookie.
  // Real providers are added in lib/auth.ts (Node runtime).
  providers: [],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12h, httpOnly cookie
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? "");
        session.user.role = token.role ?? "viewer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
