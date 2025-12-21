import { NextRequest, NextResponse } from "next/server";
import { getUserPoints } from "@/lib/wallet";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    // Use authenticated user's ID if not provided
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only access their own points
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own points" },
        { status: 403 }
      );
    }

    const points = await getUserPoints(userId);

    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Failed to fetch user points" },
      { status: 500 }
    );
  }
}
