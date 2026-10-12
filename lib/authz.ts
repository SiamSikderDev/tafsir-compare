import { auth } from "./auth";
import type { UserRole } from "@/models/User";

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Returns the signed-in user's context, or null when unauthenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role ?? "viewer",
  };
}

const WRITE_ROLES: UserRole[] = ["admin", "researcher"];
const REVIEW_ROLES: UserRole[] = ["admin", "reviewer"];
const ADMIN_ROLES: UserRole[] = ["admin"];

/**
 * Guards an admin API route. Throws a Response (401/403) when the caller
 * lacks the required capability — route handlers should let it propagate
 * or catch it and return it.
 *
 * Capabilities:
 * - "write":   admin + researcher (create / update content)
 * - "review":  admin + reviewer  (approve / send back for changes)
 * - "admin":   admin only        (user management)
 * - "read":    any authenticated user (viewer included)
 */
export async function requireRole(
  capability: "write" | "review" | "admin" | "read",
): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw Response.json({ error: "Unauthorized — please sign in." }, { status: 401 });
  }
  const allowed =
    capability === "write"
      ? WRITE_ROLES
      : capability === "review"
        ? REVIEW_ROLES
        : capability === "admin"
          ? ADMIN_ROLES
          : ["admin", "researcher", "reviewer", "viewer"];
  if (!allowed.includes(ctx.role)) {
    throw Response.json(
      { error: "Forbidden — your role cannot perform this action." },
      { status: 403 },
    );
  }
  return ctx;
}
