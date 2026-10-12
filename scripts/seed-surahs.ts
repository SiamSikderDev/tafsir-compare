/**
 * Seed the 114 surah metadata documents.
 *
 * Idempotent: if the surahs collection already has any documents, the
 * script exits without writing (use --force to upsert instead).
 *
 * Usage:
 *   bun scripts/seed-surahs.ts            # insert only when collection is empty
 *   bun scripts/seed-surahs.ts --force    # upsert every surah by number
 *
 * Requires MONGODB_URI (bun loads .env automatically).
 */

import { connectDB } from "../lib/db";
import { Surah } from "../models/Surah";
import { SURAH_METADATA, validateSurahMetadata } from "../lib/surah-metadata";

const force = process.argv.includes("--force");

async function main(): Promise<void> {
  validateSurahMetadata();

  await connectDB();

  const existing = await Surah.countDocuments();
  if (existing > 0 && !force) {
    console.log(
      `Surahs already seeded (${existing} documents). Nothing to do. ` +
        `Pass --force to upsert by surah number.`,
    );
    process.exit(0);
  }

  let inserted = 0;
  let updated = 0;

  for (const entry of SURAH_METADATA) {
    const res = await Surah.updateOne(
      { number: entry.number },
      { $set: entry },
      { upsert: true },
    );
    if (res.upsertedCount > 0) inserted += 1;
    else if (res.modifiedCount > 0) updated += 1;
  }

  console.log(
    `Done. Inserted ${inserted}, updated ${updated} of ${SURAH_METADATA.length} surahs.`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("seed-surahs failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
