import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest, extractTokenFromHeader } from "@/lib/auth";

/**
 * GET /api/auth/test - Test endpoint to verify token authentication
 * Returns information about the authentication status
 */
export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req);
    const userId = await getUserIdFromRequest(req);
    const cookieUserId = req.cookies.get("user_id")?.value;

    return NextResponse.json({
      authenticated: !!userId,
      userId: userId || null,
      hasTokenHeader: !!token,
      hasCookie: !!cookieUserId,
      method: token ? "token" : cookieUserId ? "cookie" : "none",
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 }
    );
  }
}
