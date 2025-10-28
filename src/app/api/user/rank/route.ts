import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Wallet } from "@/models";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's wallet
    const userWallet = await Wallet.findOne({ userId: userObjectId });
    const userPoints = userWallet?.balance || userWallet?.points || 0;

    // Count users with more points
    const usersWithMorePoints = await Wallet.countDocuments({
      $or: [
        { balance: { $gt: userPoints } },
        { points: { $gt: userPoints } }
      ]
    });

    // User's rank is count of users with more points + 1
    const rank = usersWithMorePoints + 1;

    // Get total users
    const totalUsers = await Wallet.countDocuments();

    return NextResponse.json({
      rank,
      totalUsers,
      points: userPoints
    });
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return NextResponse.json(
      { error: "Failed to fetch user rank" },
      { status: 500 }
    );
  }
}

