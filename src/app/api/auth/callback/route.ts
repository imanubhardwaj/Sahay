import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    console.log("Callback received with code:", code ? "present" : "missing");
    console.log("Full URL:", req.url);

    if (!code) {
      console.log("No code provided, redirecting to login");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`
      );
    }

    console.log("Authenticating with WorkOS...");
    // Authenticate with WorkOS - try both OAuth and Magic Auth
    let user;
    try {
      // Try OAuth authentication first
      const authResponse = await workos.userManagement.authenticateWithCode({
        code,
        clientId: process.env.WORKOS_CLIENT_ID!,
      });
      user = authResponse.user;
    } catch {
      console.log("OAuth failed, trying Magic Auth...");
      // If OAuth fails, try Magic Auth
      const authResponse =
        await workos.userManagement.authenticateWithMagicAuth({
          code,
          clientId: process.env.WORKOS_CLIENT_ID!,
          email: "", // Magic Auth requires email parameter
        });
      user = authResponse.user;
    }

    console.log("WorkOS user authenticated:", user.email);

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB();

    // Check if user exists
    let dbUser = await User.findOne({ workosId: user.id });
    let isNewUser = false;

    if (!dbUser) {
      console.log("Creating new user...");
      // Create new user with proper schema
      dbUser = await User.create({
        firstName: user.firstName || user.email.split("@")[0],
        lastName: user.lastName || "",
        email: user.email,
        username: user.email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 5),
        workosId: user.id,
        role: "student", // Default role
        userType: "student_fresher", // Default user type
        isOnboardingComplete: false,
        status: "active",
        bio: "",
        yoe: 0,
        title: "",
        location: "",
        visibility: "public",
        skills: [],
        portfolio: [],
        mentors: [],
        progress: {
          currentGoal: "",
          completionRate: 0
        },
        completionRate: 0,
        selectedModules: []
      });
      isNewUser = true;
      console.log("New user created:", dbUser._id);
    } else {
      console.log("Existing user found:", dbUser._id);
    }

    // Create response and set session cookie
    const redirectUrl = isNewUser ? "/onboarding" : "/dashboard";
    console.log("Redirecting to:", redirectUrl);
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`
    );

    // Set secure session cookie
    response.cookies.set("user_id", dbUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("Session cookie set for user:", dbUser._id);
    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`
    );
  }
}
