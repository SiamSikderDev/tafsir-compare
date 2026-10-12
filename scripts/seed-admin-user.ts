/**
 * Create the first admin user from environment variables.
 *
 * Idempotent: skips when a user with the given email already exists.
 *
 * Required env:
 *   SEED_ADMIN_EMAIL     admin email
 *   SEED_ADMIN_PASSWORD  admin password (min 8 chars) — never commit this
 * Optional env:
 *   SEED_ADMIN_NAME      display name (default "Admin")
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='...' bun scripts/seed-admin-user.ts
 *
 * Requires MONGODB_URI (bun loads .env automatically).
 */

import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";

  if (!email) {
    console.error("Refusing: SEED_ADMIN_EMAIL is not set.");
    process.exit(1);
  }
  if (!password) {
    console.error("Refusing: SEED_ADMIN_PASSWORD is not set.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Refusing: SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    console.log(`Admin user ${email} already exists. Nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: "admin" });

  console.log(`Created admin user: ${email}`);
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("seed-admin-user failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
