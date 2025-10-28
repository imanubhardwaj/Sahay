import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

// POST /api/user/[id]/points - Add points to a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { points, source = 'quiz', description, referenceId } = await request.json();
    const { id: userId } = await params;

    if (!points || points <= 0) {
      return NextResponse.json(
        { error: "Points must be a positive number" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find or create wallet for user
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        points: 0
      });
      await wallet.save();
      
      // Update user with wallet reference
      user.walletId = wallet._id;
      await user.save();
    }

    // Update wallet points
    wallet.points += points;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      walletId: wallet._id,
      type: 'earn',
      points: points,
      source: source,
      description: description || `Earned ${points} points`,
      referenceId: referenceId
    });
    await transaction.save();

    return NextResponse.json({
      success: true,
      newPoints: wallet.points,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }
}

// GET /api/user/[id]/points - Get user points
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: userId } = await params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wallet points
    const wallet = await Wallet.findOne({ userId: user._id });
    const points = wallet ? wallet.points : 0;

    return NextResponse.json({
      userId: user._id,
      points: points,
      walletId: wallet?._id
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
