import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { unsubscribeTokenFromTopics } from "@/lib/firebase-admin";
import { removeUserTopics } from "@/lib/user-notification-topics-db";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";

const TOPIC_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * POST /api/notifications/unsubscribe-topics
 * Unsubscribe the user's FCM tokens from the given topics and remove them from persisted list.
 * Body: { topics: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const rawTopics = Array.isArray(body?.topics) ? body.topics : [];

    const topics = rawTopics.filter(
      (t: unknown): t is string =>
        typeof t === "string" && t.length > 0 && TOPIC_REGEX.test(t),
    );

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        unsubscribed: [],
        failed: [],
        message: "No valid topics",
      });
    }

    // Get all FCM tokens for this user so we can unsubscribe each from these topics
    const tokensColl = await getCollection<{ token: string }>("fcm_tokens");
    const userTokenDocs = await tokensColl.find({ userId }).toArray();
    const tokens = userTokenDocs.map((d: { token: string }) => d.token);

    const allUnsubscribed: string[] = [];
    const allFailed: string[] = [];

    for (const token of tokens) {
      const { unsubscribed, failed } = await unsubscribeTokenFromTopics(
        token,
        topics,
      );
      for (const t of unsubscribed) {
        if (!allUnsubscribed.includes(t)) allUnsubscribed.push(t);
      }
      for (const t of failed) {
        if (!allFailed.includes(t) && !allUnsubscribed.includes(t))
          allFailed.push(t);
      }
    }

    // Remove from persisted list so new tokens don't re-subscribe
    await removeUserTopics(userId, topics);

    return NextResponse.json({
      success: true,
      unsubscribed: allUnsubscribed,
      failed: allFailed,
    });
  } catch (error) {
    console.error("Error unsubscribing from topics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe from topics" },
      { status: 500 },
    );
  }
}
