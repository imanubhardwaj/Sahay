import { NextRequest, NextResponse } from "next/server";
import connectDB, { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-api";
import { getInitialTopicsForUser } from "@/lib/notification-topics";
import { subscribeTokenToTopics } from "@/lib/firebase-admin";
import {
  getUserTopics,
  addUserTopics,
} from "@/lib/user-notification-topics-db";

export const runtime = "nodejs";

/** Body for POST /api/notifications/fcm-token */
interface FCMTokenBody {
  token: string;
  deviceInfo?: Record<string, unknown>;
  platform?: string;
}

/**
 * POST /api/notifications/fcm-token
 * Register or update the current user's FCM token in MongoDB (idempotent).
 * Then subscribe the token to all topics saved for this user (user_notification_topics).
 * If the user has no saved topics yet, use default topics (role + userId/org), subscribe,
 * and persist them so future tokens get the same list.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, user } = authResult;

    const body = (await request.json()) as FCMTokenBody;
    const token = typeof body?.token === "string" ? body.token.trim() : null;
    if (!token || token.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid token" },
        { status: 400 },
      );
    }

    const deviceInfo =
      body.deviceInfo && typeof body.deviceInfo === "object"
        ? body.deviceInfo
        : {};
    const platform = typeof body.platform === "string" ? body.platform : "web";

    const coll = await getCollection("fcm_tokens");

    const now = new Date();

    const existing = await coll.findOne({ userId, token });
    if (existing) {
      await coll.updateOne(
        { userId, token },
        { $set: { deviceInfo, platform, updatedAt: now } },
      );
    } else {
      await coll.insertOne({
        userId,
        token,
        deviceInfo,
        platform,
        createdAt: now,
        updatedAt: now,
      } as unknown as Parameters<typeof coll.insertOne>[0]);
    }

    // Subscribe this token to the user's topic list (from DB). New device = same topics.
    let topics = await getUserTopics(userId);
    if (topics.length === 0) {
      topics = getInitialTopicsForUser({
        role: (user?.role as string) ?? "student",
        userId,
        organizationId:
          ((user as unknown as Record<string, unknown>)?.organizationId as
            | string
            | null) ?? null,
      });
      if (topics.length > 0) await addUserTopics(userId, topics);
    }
    if (topics.length > 0) {
      const { failed } = await subscribeTokenToTopics(token, topics);
      if (failed.length > 0) {
        console.warn(
          "[FCM] Token saved but some topic subscriptions failed:",
          failed,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save FCM token" },
      { status: 500 },
    );
  }
}
