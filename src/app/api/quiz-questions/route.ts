import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Question } from "@/models";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");
    const lessonId = searchParams.get("lessonId");

    if (!quizId && !lessonId) {
      return NextResponse.json(
        { error: "quizId or lessonId is required" },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {};

    if (quizId) {
      try {
        const quizObjectId = new mongoose.Types.ObjectId(quizId);
        query.quizId = quizObjectId;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid quizId format" },
          { status: 400 }
        );
      }
    }

    if (lessonId) {
      try {
        const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
        query.lessonId = lessonObjectId;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid lessonId format" },
          { status: 400 }
        );
      }
    }

    const questions = await Question.find(query).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      questions: questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        answer: q.answer,
        order: q.order,
        points: q.points,
      })),
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz questions" },
      { status: 500 }
    );
  }
}
