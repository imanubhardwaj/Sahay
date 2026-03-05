import mongoose from "mongoose";
import { Collection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose; // eslint-disable-line @typescript-eslint/no-explicit-any

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

async function connectDB() {
  try {
    if (cached.conn) {
      console.log("Using existing MongoDB connection");
      return cached.conn;
    }

    if (!cached.promise) {
      console.log("Creating new MongoDB connection...");
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose
        .connect(MONGODB_URI as string, opts)
        .then((mongoose) => {
          console.log("MongoDB connected successfully");
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("MongoDB connection error:", e);
    cached.promise = null;
    throw e;
  }
}

/**
 * Get a MongoDB collection by name. Use for raw collection access (e.g. fcm_tokens, notifications).
 */
export async function getCollection<T = Record<string, unknown>>(
  name: string,
): Promise<Collection<Document & T>> {
  const conn = await connectDB();
  return conn.connection.db.collection(name) as Collection<Document & T>;
}

export default connectDB;
