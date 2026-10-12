import mongoose from "mongoose";

// Register every model exactly once, as a side effect, so that
// .populate() of cross-collection refs never throws MissingSchemaError
// in a serverless bundle that didn't directly import the target model.
// (Models guard with `models.X || model()`, so repeated imports are safe.)
import "@/models/User";
import "@/models/Surah";
import "@/models/Verse";
import "@/models/Tafsir";
import "@/models/Hadith";
import "@/models/ResearchNote";
import "@/models/Reference";
import "@/models/AuditLog";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

/**
 * Lazily connects to MongoDB and caches the connection on the global object
 * so hot-reloads / serverless invocations reuse a single connection.
 * Throws only when actually called without MONGODB_URI set — `next build`
 * never triggers a connection, so builds succeed with no database present.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file (see .env.example).",
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/** True when a live connection already exists (never initiates one). */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
