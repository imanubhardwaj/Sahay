import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

// GET - Get Google authorization URL
export async function GET(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Google OAuth is not configured. Add GOOGLE_CLIENT_ID (and GOOGLE_CLIENT_SECRET) to your .env. See Google Cloud Console to create OAuth credentials.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const authUrl = getGoogleAuthUrl(userId);

    return NextResponse.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate authorization URL",
      },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect Google account
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          googleConnected: false,
          googleAccessToken: null,
          googleRefreshToken: null,
          googleTokenExpiry: null,
        },
      },
      { new: true }
    );

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting Google account:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect Google account" },
      { status: 500 }
    );
  }
}
