import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";

export async function GET() {
  try {
    await connectDB();

    const moduleData = await Module.findOne({ name: "javascript_beginner" });

    if (!moduleData) {
      return NextResponse.json({
        seeded: false,
        message: "JavaScript module not found in database",
      });
    }

    const lessons = await Lesson.find({ moduleId: moduleData._id });
    const quizzes = await Quiz.find({ moduleId: moduleData._id });

    return NextResponse.json({
      seeded: true,
      module: {
        id: moduleData._id,
        name: moduleData.name,
        icon: moduleData.icon,
        image: moduleData.image,
        points: moduleData.points,
        lessonsCount: moduleData.lessonsCount,
        duration: moduleData.duration,
      },
      stats: {
        lessons: lessons.length,
        quizzes: quizzes.length,
      },
      iconUrl: moduleData.icon || "No icon set",
      expectedIcon:
        "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      iconMatches:
        moduleData.icon ===
        "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      currentIcon: moduleData.icon,
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
