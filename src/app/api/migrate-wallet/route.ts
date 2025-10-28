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

    // Find wallet
    const wallet = await Wallet.findOne({ userId: userObjectId });
    
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Calculate total earned from transactions
    const transactions = await Transaction.find({ 
      userId: userObjectId, 
      type: 'earn' 
    });
    
    const totalEarned = transactions.reduce((sum, tx) => sum + tx.points, 0);
    const totalSpent = 0; // No spending transactions yet

    // Update wallet with new schema
    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      {
        $set: {
          balance: totalEarned,
          totalEarned: totalEarned,
          totalSpent: totalSpent
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
      totalEarned,
      totalSpent,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error("Error migrating wallet:", error);
    return NextResponse.json(
      { error: "Failed to migrate wallet", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
