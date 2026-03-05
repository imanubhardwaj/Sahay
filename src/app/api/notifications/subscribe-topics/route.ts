import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { subscribeTokenToTopics } from "@/lib/firebase-admin";
import { addUserTopics } from "@/lib/user-notification-topics-db";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";

/** Topic names: alphanumeric + underscore (e.g. gig_123_creators, organizations) */
const TOPIC_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * POST /api/notifications/subscribe-topics
 * Subscribe the given FCM token (or all user tokens) to the given topics and persist them.
 * Body: { token?: string, topics: string[] }
 * - If token is provided, subscribe that single token.
 * - If token is omitted or empty, subscribe ALL user tokens (for settings toggle use-case).
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const rawToken = typeof body?.token === "string" ? body.token.trim() : null;
    const rawTopics = Array.isArray(body?.topics) ? body.topics : [];

    const topics = rawTopics.filter(
      (t: unknown): t is string =>
        typeof t === "string" && t.length > 0 && TOPIC_REGEX.test(t),
    );

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        subscribed: [],
        failed: [],
        message: "No valid topics",
      });
    }

    // Decide which tokens to subscribe
    let tokens: string[] = [];
    if (rawToken && rawToken !== "__server_only__") {
      tokens = [rawToken];
    } else {
      // No specific token – subscribe all user tokens
      const tokensColl = await getCollection<{ token: string }>("fcm_tokens");
      const userTokenDocs = await tokensColl.find({ userId }).toArray();
      tokens = userTokenDocs.map((d: { token: string }) => d.token);
    }

    const allSubscribed: string[] = [];
    const allFailed: string[] = [];

    for (const token of tokens) {
      const { subscribed, failed } = await subscribeTokenToTopics(
        token,
        topics,
      );
      for (const t of subscribed) {
        if (!allSubscribed.includes(t)) allSubscribed.push(t);
      }
      for (const t of failed) {
        if (!allFailed.includes(t) && !allSubscribed.includes(t))
          allFailed.push(t);
      }
    }

    // Persist these topics for this user so new tokens get them automatically
    await addUserTopics(userId, topics);

    return NextResponse.json({
      success: true,
      subscribed: allSubscribed,
      failed: allFailed,
    });
  } catch (error) {
    console.error("Error subscribing to topics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe to topics" },
      { status: 500 },
    );
  }
}
