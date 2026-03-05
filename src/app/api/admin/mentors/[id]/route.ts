import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import { authenticateAdminRequest } from "@/lib/auth";
import { MENTOR_LEVEL, MENTOR_LEVEL_RATES } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific mentor with admin fields
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await authenticateAdminRequest(request);
    await connectDB();

    const { id } = await params;

    const mentor = await (
      MentorProfile as {
        findById: (id: string) => {
          select: (fields: string) => {
            populate: (
              ...args: string[]
            ) => Promise<{ toObject: () => Record<string, unknown> } | null>;
          };
        };
      }
    )
      .findById(id)
      .select("+level +customPointRate")
      .populate(
        "userId",
        "firstName lastName email avatar bio title yoe currentCompany",
      );

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 },
      );
    }

    const mentorObj = mentor.toObject();
    const level = mentorObj.level || MENTOR_LEVEL.L3;
    const effectiveRate =
      mentorObj.customPointRate ??
      MENTOR_LEVEL_RATES[level as keyof typeof MENTOR_LEVEL_RATES];

    return NextResponse.json({
      success: true,
      data: {
        ...mentorObj,
        level,
        effectiveRate,
        levelDescription: getLevelDescription(level as string),
      },
    });
  } catch (error) {
    console.error("Error fetching mentor:", error);

    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch mentor" },
      { status: 500 },
    );
  }
}

// PATCH - Update mentor level or custom point rate (Admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await authenticateAdminRequest(request);
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { level, customPointRate, isApproved } = body;

    // Validate level if provided
    if (level && !Object.values(MENTOR_LEVEL).includes(level)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid level. Must be one of: ${Object.values(MENTOR_LEVEL).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (level !== undefined) {
      updateData.level = level;
    }

    if (customPointRate !== undefined) {
      // Allow null to reset to default rate
      updateData.customPointRate =
        customPointRate === null ? null : Number(customPointRate);
    }

    if (isApproved !== undefined) {
      updateData.isApproved = Boolean(isApproved);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Update mentor profile
    const mentor = await (
      MentorProfile as {
        findByIdAndUpdate: (
          id: string,
          update: Record<string, unknown>,
          options: Record<string, unknown>,
        ) => {
          select: (fields: string) => {
            populate: (...args: string[]) => Promise<{ toObject: () => Record<string, unknown> } | null>;
          };
        };
      }
    )
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .select("+level +customPointRate")
      .populate(
        "userId",
        "firstName lastName email avatar bio title yoe currentCompany",
      );

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 },
      );
    }

    const mentorObj = mentor.toObject();
    const updatedLevel = mentorObj.level || MENTOR_LEVEL.L3;
    const effectiveRate =
      mentorObj.customPointRate ??
      MENTOR_LEVEL_RATES[updatedLevel as keyof typeof MENTOR_LEVEL_RATES];

    return NextResponse.json({
      success: true,
      data: {
        ...mentorObj,
        level: updatedLevel,
        effectiveRate,
        levelDescription: getLevelDescription(updatedLevel as string),
      },
      message: "Mentor updated successfully",
    });
  } catch (error) {
    console.error("Error updating mentor:", error);

    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update mentor" },
      { status: 500 },
    );
  }
}

function getLevelDescription(level: string): string {
  switch (level) {
    case MENTOR_LEVEL.L1:
      return "Elite/Consultant - High-net-worth individuals, investors, founders (>1 Cr packages)";
    case MENTOR_LEVEL.L2:
      return "Top Tier Tech - High earners at FAANG/Top Product Companies";
    case MENTOR_LEVEL.L3:
      return "Standard - Regular employees, startup ecosystem";
    default:
      return "Unknown level";
  }
}
