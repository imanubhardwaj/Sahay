/**
 * DB helpers for user_notification_topics collection.
 * Persists which topics a user is subscribed to (so new FCM tokens get same topics).
 */

import { getCollection } from "@/lib/mongodb";

const COLLECTION_NAME = "user_notification_topics";

export async function getUserTopics(userId: string): Promise<string[]> {
  const coll = await getCollection<{ userId: string; topics: string[] }>(
    COLLECTION_NAME
  );
  const doc = await coll.findOne({ userId });
  return doc?.topics ?? [];
}

export async function addUserTopics(
  userId: string,
  topics: string[]
): Promise<void> {
  if (topics.length === 0) return;
  const coll = await getCollection<{
    userId: string;
    topics: string[];
    updatedAt: Date;
  }>(COLLECTION_NAME);
  const existing = await coll.findOne({ userId });
  const currentTopics = existing?.topics ?? [];
  const merged = [...new Set([...currentTopics, ...topics])];
  await coll.updateOne(
    { userId },
    { $set: { topics: merged, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function removeUserTopics(
  userId: string,
  topics: string[]
): Promise<void> {
  if (topics.length === 0) return;
  const coll = await getCollection<{
    userId: string;
    topics: string[];
    updatedAt: Date;
  }>(COLLECTION_NAME);
  const existing = await coll.findOne({ userId });
  const currentTopics = existing?.topics ?? [];
  const toRemove = new Set(topics);
  const merged = currentTopics.filter((t) => !toRemove.has(t));
  await coll.updateOne(
    { userId },
    { $set: { topics: merged, updatedAt: new Date() } },
    { upsert: true }
  );
}
