import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";
import mongoose from "mongoose";

// GET /api/community-questions/[id] - Get a single community question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const question = await CommunityQuestion.findById(id)
      .populate("askedBy", "firstName lastName email")
      .populate("answers.userId", "firstName lastName email")
      .populate("skillId", "name");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error fetching community question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch community question" },
      { status: 500 }
    );
  }
}

// PUT /api/community-questions/[id] - Update a community question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await request.json();

    const question = await CommunityQuestion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate("askedBy", "firstName lastName email")
      .populate("skillId", "name");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error updating community question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update community question" },
      { status: 500 }
    );
  }
}

// DELETE /api/community-questions/[id] - Delete a community question (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const question = await CommunityQuestion.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting community question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete community question" },
      { status: 500 }
    );
  }
}

