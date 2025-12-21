import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";

export async function POST() {
  try {
    await connectDB();
    console.log("🧹 Starting cleanup of duplicate modules...");

    // Find all modules
    const allModules = await Module.find({ deletedAt: null }).populate(
      "skillId"
    );

    // Group modules by name and skillId
    const moduleGroups = new Map<string, any[]>();

    for (const module of allModules) {
      const key = `${module.name}_${module.skillId?._id || "no-skill"}`;
      if (!moduleGroups.has(key)) {
        moduleGroups.set(key, []);
      }
      moduleGroups.get(key)!.push(module);
    }

    let deletedCount = 0;
    const duplicates = [];

    // Find and handle duplicates
    for (const [key, modules] of moduleGroups.entries()) {
      if (modules.length > 1) {
        // Sort by creation date (keep the oldest one)
        modules.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        });

        const keepModule = modules[0];
        const deleteModules = modules.slice(1);

        duplicates.push({
          name: keepModule.name,
          keepId: keepModule._id,
          deleteIds: deleteModules.map((m) => m._id),
          count: deleteModules.length,
        });

        // Delete duplicate modules and their related data
        for (const moduleToDelete of deleteModules) {
          // Delete related lessons
          await Lesson.deleteMany({ moduleId: moduleToDelete._id });

          // Delete related quizzes
          const quizzes = await Quiz.find({ moduleId: moduleToDelete._id });
          for (const quiz of quizzes) {
            await Question.deleteMany({ quizId: quiz._id });
          }
          await Quiz.deleteMany({ moduleId: moduleToDelete._id });

          // Delete the module
          await Module.findByIdAndDelete(moduleToDelete._id);
          deletedCount++;
          console.log(
            `🗑️  Deleted duplicate module: ${moduleToDelete.name} (${moduleToDelete._id})`
          );
        }

        console.log(
          `✅ Kept module: ${keepModule.name} (${keepModule._id}), deleted ${deleteModules.length} duplicates`
        );
      }
    }

    console.log(
      `🎉 Cleanup completed! Deleted ${deletedCount} duplicate modules`
    );

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      deletedCount,
      duplicates,
    });
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup duplicate modules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to preview duplicates without deleting
export async function GET() {
  try {
    await connectDB();
    console.log("🔍 Scanning for duplicate modules...");

    const allModules = await Module.find({ deletedAt: null }).populate(
      "skillId"
    );

    const moduleGroups = new Map<string, any[]>();

    for (const module of allModules) {
      const key = `${module.name}_${module.skillId?._id || "no-skill"}`;
      if (!moduleGroups.has(key)) {
        moduleGroups.set(key, []);
      }
      moduleGroups.get(key)!.push(module);
    }

    const duplicates = [];

    for (const [key, modules] of moduleGroups.entries()) {
      if (modules.length > 1) {
        modules.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        });

        duplicates.push({
          name: modules[0].name,
          skillName: modules[0].skillId?.name || "No skill",
          totalCount: modules.length,
          keepId: modules[0]._id,
          keepCreatedAt: modules[0].createdAt,
          duplicateIds: modules.slice(1).map((m) => ({
            id: m._id,
            createdAt: m.createdAt,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      duplicateCount: duplicates.length,
      totalDuplicates: duplicates.reduce((sum, d) => sum + d.totalCount - 1, 0),
      duplicates,
    });
  } catch (error) {
    console.error("❌ Error scanning for duplicates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to scan for duplicate modules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
