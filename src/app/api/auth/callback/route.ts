import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    
    // Parse state to get redirect URL
    let redirectTo = "/dashboard";
    if (stateParam) {
      try {
        const state = JSON.parse(decodeURIComponent(stateParam));
        if (state.redirectTo) {
          redirectTo = state.redirectTo;
        }
      } catch {
        console.log("Failed to parse state parameter");
      }
    }

    console.log("Callback received with code:", code ? "present" : "missing");
    console.log("Redirect to:", redirectTo);

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
      try {
        // Create new user with proper schema
        dbUser = await User.create({
          firstName: user.firstName || user.email.split("@")[0],
          lastName: user.lastName || "",
          email: user.email,
          username:
            user.email.split("@")[0] +
            "_" +
            Math.random().toString(36).substr(2, 5),
          workosId: user.id,
          role: "student", // Default role
          userType: "student_fresher", // Default user type
          isOnboardingComplete: true, // Skip onboarding flow
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
            completionRate: 0,
          },
          completionRate: 0,
          selectedModules: [],
        });
        isNewUser = true;
        console.log("New user created:", dbUser._id);
      } catch (createError: any) {
        console.error("Error creating user:", createError);
        // If username conflict, try with different random suffix
        if (createError.code === 11000 && createError.keyPattern?.username) {
          console.log("Username conflict, retrying with different username...");
          dbUser = await User.create({
            firstName: user.firstName || user.email.split("@")[0],
            lastName: user.lastName || "",
            email: user.email,
            username:
              user.email.split("@")[0] +
              "_" +
              Math.random().toString(36).substr(2, 8),
            workosId: user.id,
            role: "student",
            userType: "student_fresher",
            isOnboardingComplete: true,
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
              completionRate: 0,
            },
            completionRate: 0,
            selectedModules: [],
          });
          isNewUser = true;
          console.log("New user created with retry:", dbUser._id);
        } else {
          throw createError;
        }
      }
    } else {
      console.log("Existing user found:", dbUser._id);
    }

    // Generate JWT token
    const token = generateToken({
      userId: dbUser._id.toString(),
      email: dbUser.email,
      role: dbUser.role,
    });

    // Create response and set session cookie
    // All users go to dashboard or their intended destination
    const finalRedirectUrl = redirectTo || "/dashboard";
    console.log("Redirecting to:", finalRedirectUrl);
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}${finalRedirectUrl}`
    );

    // Set secure session cookie (for backward compatibility)
    response.cookies.set("user_id", dbUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set token in cookie (optional, for easier access)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("Session cookie and token set for user:", dbUser._id);
    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`
    );
  }
}
