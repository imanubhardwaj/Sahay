import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
// Import models to ensure they're registered
import "@/models/Skill";
import "@/models/Wallet";
import { getUserIdFromRequest } from "@/lib/auth";

// GET /api/user - Get current user or all users (with optional filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Ensure models are registered before populate
    if (!mongoose.models.Skill) {
      await import("@/models/Skill");
    }
    if (!mongoose.models.Wallet) {
      await import("@/models/Wallet");
    }

    const { searchParams } = new URL(req.url);
    const getCurrentUser = searchParams.get("current") === "true";

    // If requesting current user, get from session (token or cookie)
    if (getCurrentUser) {
      const userId = await getUserIdFromRequest(req);

      if (!userId) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 },
        );
      }

      const user = await User.findById(userId)
        .populate("skills", "name")
        .populate("walletId")
        .lean();

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user });
    }

    // Otherwise, get all users with filters
    const userType = searchParams.get("userType");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const college = searchParams.get("college");
    const company = searchParams.get("company");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = {};

    if (userType) query.userType = userType;
    if (role) query.role = role;
    if (status) query.status = status;
    if (college) query.college = college;
    if (company) query.company = company;

    const skip = (page - 1) * limit;

    // Get users based on type
    let users;
    if (userType === "working_professional") {
      users = await WorkingProfessional.find(query)
        .populate("company", "name")
        .populate("skills", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      users = await User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const total =
      userType === "working_professional"
        ? await WorkingProfessional.countDocuments(query)
        : await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/user - Create a new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userData = await req.json();
    const { userType, ...otherData } = userData;

    if (!userType) {
      return NextResponse.json(
        { error: "User type is required" },
        { status: 400 },
      );
    }

    let user;
    if (userType === "working_professional") {
      user = new WorkingProfessional(otherData);
    } else {
      user = new User(otherData);
    }

    await user.save();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// PUT /api/user - Update current user
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await req.json();

    await connectDB();

    // Ensure models are registered before populate
    if (!mongoose.models.Skill) {
      await import("@/models/Skill");
    }
    if (!mongoose.models.Wallet) {
      await import("@/models/Wallet");
    }

    // Try to find in both User and WorkingProfessional collections
    let user = await User.findById(userId);
    if (!user) {
      user = await WorkingProfessional.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields manually to trigger pre-save hooks
    // Use set method for proper Mongoose handling
    for (const [key, value] of Object.entries(updates)) {
      if (key !== "_id" && key !== "__v" && value !== undefined) {
        user.set(key, value);
      }
    }

    // Save to trigger pre-save hook which recalculates profileCompletionPercentage
    await user.save();

    // Fetch fresh user data with populated fields
    const updatedUser = await User.findById(userId)
      .populate("skills", "name")
      .populate("walletId")
      .lean();

    if (!updatedUser) {
      const userObj = user.toObject();
      return NextResponse.json({ user: userObj });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE /api/user - Soft delete current user
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    // Try to soft delete in both User and WorkingProfessional collections
    let user = await User.findByIdAndUpdate(
      userId,
      { deletedAt: new Date() },
      { new: true },
    );
    if (!user) {
      user = await WorkingProfessional.findByIdAndUpdate(
        userId,
        { deletedAt: new Date() },
        { new: true },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
