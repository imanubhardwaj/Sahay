import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getUserIdFromRequest, isAdmin } from "@/lib/auth";

// GET - Check if current user is an admin
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, isAdmin: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const adminStatus = await isAdmin(request);

    return NextResponse.json({
      success: true,
      isAdmin: adminStatus,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { success: false, isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}

