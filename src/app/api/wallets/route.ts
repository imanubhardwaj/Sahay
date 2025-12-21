import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/wallets - Get all wallets (requires auth)
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

    // Security: Ensure user can only access their own wallet
    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own wallet" },
        { status: 403 }
      );
    }

    const userId = requestedUserId || authenticatedUserId;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };

    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const wallets = await Wallet.find(query)
      .populate("userId", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Wallet.countDocuments(query);

    return NextResponse.json({
      wallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

// POST /api/wallets - Create a new wallet (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const walletData = await request.json();
    const { userId, ...otherData } = walletData;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    let user = await User.findById(userId);
    if (!user) {
      user = await WorkingProfessional.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ userId, deletedAt: null });
    if (existingWallet) {
      return NextResponse.json(
        { error: "User already has a wallet" },
        { status: 409 }
      );
    }

    const wallet = new Wallet({
      ...otherData,
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    });

    await wallet.save();

    // Populate the user data for the response
    await wallet.populate("userId", "firstName lastName email");

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
