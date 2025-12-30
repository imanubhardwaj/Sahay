import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import mongoose from "mongoose";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: moduleId } = await params;

    // Convert to ObjectId
    let moduleObjectId;
    try {
      moduleObjectId = new mongoose.Types.ObjectId(moduleId);
    } catch (error) {
      console.error("Invalid ObjectId format for moduleId:", {
        moduleId,
        error,
      });
      return NextResponse.json(
        { success: false, error: "Invalid Module ID format" },
        { status: 400 }
      );
    }

    // Get the module
    const moduleData = await Module.findById(moduleObjectId);

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ moduleId: moduleObjectId }).sort({
      order: 1,
    });

    return NextResponse.json({
      success: true,
      module: {
        ...moduleData.toObject(),
        lessons,
      },
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const { id: moduleId } = await params;
    const body = await request.json();

    const moduleData = await Module.findByIdAndUpdate(moduleId, body, {
      new: true,
      runValidators: true,
    }).populate("skillId", "name description");

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      module: moduleData,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const { id: moduleId } = await params;

    // Delete related lessons and quizzes first
    await Lesson.deleteMany({ moduleId });
    await Quiz.deleteMany({ moduleId });
    await Question.deleteMany({ moduleId });

    // Delete the module
    const moduleData = await Module.findByIdAndDelete(moduleId);

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
