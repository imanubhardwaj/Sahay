import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Wallet, Transaction } from "@/models";
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

    // Find wallet
    const wallet = await Wallet.findOne({ userId: userObjectId });
    
    // Find transactions
    const transactions = await Transaction.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({
      wallet,
      transactions,
      walletExists: !!wallet,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error("Error debugging wallet:", error);
    return NextResponse.json(
      { error: "Failed to debug wallet", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
