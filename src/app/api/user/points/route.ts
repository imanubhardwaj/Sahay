import { NextRequest, NextResponse } from "next/server";
import { getUserPoints } from "@/lib/wallet";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const points = await getUserPoints(userId);
    
    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Failed to fetch user points" },
      { status: 500 }
    );
  }
}
