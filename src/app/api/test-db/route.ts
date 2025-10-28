import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Lesson, Module } from "@/models";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing database connection...");
    await connectDB();
    console.log("Database connected successfully");

    // Test basic queries
    const moduleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    
    console.log(`Found ${moduleCount} modules and ${lessonCount} lessons`);

    return NextResponse.json({
      success: true,
      moduleCount,
      lessonCount,
      message: "Database connection successful"
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
