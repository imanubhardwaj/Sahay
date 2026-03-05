import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectDB();

    // Create a test question to verify the model works
    const testQuestion = await Question.create({
      content:
        "What is the correct way to declare a string variable in TypeScript?",
      type: "mcq",
      quizId: new mongoose.Types.ObjectId(),
      lessonId: new mongoose.Types.ObjectId(),
      moduleId: new mongoose.Types.ObjectId(),
      points: 10,
      order: 1,
      options: [
        {
          id: "test1",
          type: "mcq",
          content: 'let name: string = "John";',
          isCorrect: true,
        },
        {
          id: "test2",
          type: "mcq",
          content: 'let name = string "John";',
          isCorrect: false,
        },
      ],
      answer: {
        type: "mcq",
        content: 'let name: string = "John";',
        optionId: "test1",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test question created successfully",
      data: {
        content: testQuestion.content,
        type: testQuestion.type,
        _id: testQuestion._id,
      },
    });
  } catch (error) {
    console.error("Error creating test question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test question",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
