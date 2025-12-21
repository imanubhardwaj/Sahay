import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";

export async function GET() {
  try {
    await connectDB();

    const module = await Module.findOne({ name: "JavaScript Beginner" });
    
    if (!module) {
      return NextResponse.json({
        seeded: false,
        message: "JavaScript module not found in database",
      });
    }

    const lessons = await Lesson.find({ moduleId: module._id });
    const quizzes = await Quiz.find({ moduleId: module._id });

    return NextResponse.json({
      seeded: true,
      module: {
        id: module._id,
        name: module.name,
        icon: module.icon,
        image: module.image,
        points: module.points,
        lessonsCount: module.lessonsCount,
        duration: module.duration,
      },
      stats: {
        lessons: lessons.length,
        quizzes: quizzes.length,
      },
      iconUrl: module.icon || "No icon set",
      expectedIcon: "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      iconMatches: module.icon === "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      currentIcon: module.icon,
    });
  } catch (error) {
    console.error("Error verifying seed:", error);
    return NextResponse.json(
      {
        seeded: false,
        error: "Failed to verify seed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

