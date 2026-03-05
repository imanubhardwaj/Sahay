import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";

export async function GET() {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    provider: "Google", // for Google OAuth
  });

  return NextResponse.redirect(authorizationUrl);
}

// Alternative route for magic link authentication
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await workos.userManagement.sendMagicAuthCode({
      email,
    });

    return NextResponse.json({ message: "Magic link sent to your email!" });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 },
    );
  }
}
