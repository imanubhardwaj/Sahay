import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Wallet } from "@/models";
import mongoose from "mongoose";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only check their own rank
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only check your own rank" },
        { status: 403 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's wallet
    const userWallet = await Wallet.findOne({ userId: userObjectId });
    const userPoints = userWallet?.balance || userWallet?.points || 0;

    // Count users with more points
    const usersWithMorePoints = await Wallet.countDocuments({
      $or: [{ balance: { $gt: userPoints } }, { points: { $gt: userPoints } }],
    });

    // User's rank is count of users with more points + 1
    const rank = usersWithMorePoints + 1;

    // Get total users
    const totalUsers = await Wallet.countDocuments();

    return NextResponse.json({
      rank,
      totalUsers,
      points: userPoints,
    });
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return NextResponse.json(
      { error: "Failed to fetch user rank" },
      { status: 500 }
    );
  }
}
