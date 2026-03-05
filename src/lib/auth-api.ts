import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest, getAuthenticatedUser } from "@/lib/auth";

export interface AuthResult {
  userId: string;
  user: Awaited<ReturnType<typeof getAuthenticatedUser>>;
}

/**
 * Require authentication for API routes.
 * Returns AuthResult if authenticated, or NextResponse with 401 if not.
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 401 }
    );
  }

  return { userId, user };
}
