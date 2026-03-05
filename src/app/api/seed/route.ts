import { NextResponse } from "next/server";
import { seedDatabase } from "../../../../scripts/seed";

export async function POST() {
  try {
    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
