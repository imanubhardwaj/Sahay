import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";

// GET /api/user/[id] - Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    // Try to find in both User and WorkingProfessional collections
    let user = await User.findById(id)
      .populate("college", "name")
      .populate("skills", "name")
      .populate("portfolio", "title description");
    if (!user) {
      const workingProfessional = await WorkingProfessional.findById(id)
        .populate("company", "name")
        .populate("skills", "name")
        .populate("portfolio", "title description");
      user = workingProfessional as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/user/[id] - Update a specific user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const updates = await req.json();

    const { id } = await params;
    // Try to find and update in both User and WorkingProfessional collections
    let user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      user = await WorkingProfessional.findByIdAndUpdate(id, updates, { new: true });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/[id] - Soft delete a specific user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    // Try to soft delete in both User and WorkingProfessional collections
    let user = await User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!user) {
      user = await WorkingProfessional.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
