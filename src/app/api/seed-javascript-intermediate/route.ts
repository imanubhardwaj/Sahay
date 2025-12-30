import { NextResponse } from "next/server";
import { seedJavaScriptIntermediateModule } from "../../../../scripts/seed/javascript-intermediate-module";

export async function POST() {
  try {
    console.log("🌱 Starting JavaScript Intermediate module seeding...");

    const result = await seedJavaScriptIntermediateModule();

    return NextResponse.json({
      success: true,
      message: "JavaScript Intermediate module seeded successfully",
      data: {
        module: result.newModule,
        lessonsCount: result.lessons.length,
      },
    });
  } catch (error) {
    console.error("❌ Error seeding JavaScript Intermediate module:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to seed JavaScript Intermediate module",
      },
      { status: 500 }
    );
  }
}
