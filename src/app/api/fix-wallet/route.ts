import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Wallet, Transaction } from "@/models";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
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

    // Calculate total earned from transactions
    const transactions = await Transaction.find({ 
      userId: userObjectId, 
      type: 'earn' 
    });
    
    const totalEarned = transactions.reduce((sum, tx) => sum + tx.points, 0);
    const totalSpent = 0; // No spending transactions yet

    // Delete old wallet and create new one
    await Wallet.deleteOne({ userId: userObjectId });

    const newWallet = await Wallet.create({
      userId: userObjectId,
      balance: totalEarned,
      totalEarned: totalEarned,
      totalSpent: totalSpent
    });

    return NextResponse.json({
      success: true,
      wallet: newWallet,
      totalEarned,
      totalSpent,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error("Error fixing wallet:", error);
    return NextResponse.json(
      { error: "Failed to fix wallet", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
