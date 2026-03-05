import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { getUserTopics } from "@/lib/user-notification-topics-db";
import { getInitialTopicsForUser } from "@/lib/notification-topics";

export const runtime = "nodejs";

/**
 * GET /api/notifications/my-topics
 * Returns the user's subscribed topic list and available default topics.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId, user } = authResult;

    const subscribedTopics = await getUserTopics(userId);

    // Build the list of default/available topics for this user's role
    const defaultTopics = getInitialTopicsForUser({
      role: (user?.role as string) ?? "student",
      userId,
      organizationId:
        ((user as unknown as Record<string, unknown>)?.organizationId as
          | string
          | null) ?? null,
    });

    return NextResponse.json({
      success: true,
      subscribedTopics,
      defaultTopics,
      userId,
    });
  } catch (error) {
    console.error("Error fetching user topics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch topics" },
      { status: 500 },
    );
  }
}
