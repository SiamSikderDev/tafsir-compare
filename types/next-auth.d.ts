import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "@auth/core/jwt";
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
  }
}
