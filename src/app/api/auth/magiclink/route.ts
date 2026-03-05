import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists in database
    await connectDB();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User exists - send magic auth code for login
      await workos.userManagement.sendMagicAuthCode({
        email,
      });

      return NextResponse.json({
        message: `Verification code sent to ${email}! Check your inbox.`,
        userExists: true,
      });
    } else {
      // User doesn't exist - send magic auth code for registration
      await workos.userManagement.sendMagicAuthCode({
        email,
      });

      return NextResponse.json({
        message: `Verification code sent to ${email}! Check your inbox to create your account.`,
        userExists: false,
      });
    }
  } catch (error) {
    console.error("Magic Auth error:", error);
    return NextResponse.json(
      {
        error: "Failed to send verification code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
