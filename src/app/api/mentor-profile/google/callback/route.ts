import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

const MENTOR_SETUP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// GET - OAuth callback from Google (receives code, exchanges for tokens, saves to DB)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    const redirectBase = `${MENTOR_SETUP_URL}/dashboard/mentor-setup`;

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${redirectBase}?google_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${redirectBase}?google_error=missing_code_or_state`
      );
    }

    const tokens = await exchangeCodeForTokens(code);
    if (!tokens) {
      return NextResponse.redirect(
        `${redirectBase}?google_error=token_exchange_failed`
      );
    }

    await connectDB();

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { userId: state },
      {
        $set: {
          googleConnected: true,
          googleAccessToken: tokens.accessToken,
          googleRefreshToken: tokens.refreshToken,
          googleTokenExpiry: tokens.expiryDate,
        },
      },
      { new: true }
    );

    if (!mentorProfile) {
      return NextResponse.redirect(
        `${redirectBase}?google_error=mentor_profile_not_found`
      );
    }

    return NextResponse.redirect(`${redirectBase}?google_connected=true`);
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    const redirectBase = `${MENTOR_SETUP_URL}/dashboard/mentor-setup`;
    return NextResponse.redirect(
      `${redirectBase}?google_error=callback_failed`
    );
  }
}
