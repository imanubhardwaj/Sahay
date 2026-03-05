import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import User from "@/models/User";

/**
 * GET /api/auth/me - Get current user for FCM and other client needs
 * Returns { success, user: { id, role, organizationId?, ... } }
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        role: user.role ?? "student",
        organizationId: (user as Record<string, unknown>).organizationId ?? null,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get user" },
      { status: 500 }
    );
  }
}
