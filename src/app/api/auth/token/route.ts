import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";
import User from "@/models/User";

/**
 * GET /api/auth/token - Get or generate token for authenticated user
 * This endpoint allows the frontend to get the token from the cookie
 * and store it in localStorage
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get userId from cookie (set during OAuth callback)
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if token exists in cookie
    const existingToken = req.cookies.get("auth_token")?.value;

    if (existingToken) {
      // Return existing token
      return NextResponse.json({
        token: existingToken,
        userId: user._id.toString(),
      });
    }

    // Generate new token if not found
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set token in cookie
    const response = NextResponse.json({
      token,
      userId: user._id.toString(),
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error getting token:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
