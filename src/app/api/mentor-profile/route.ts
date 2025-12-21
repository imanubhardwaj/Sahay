import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET - Get mentor profile (requires auth)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const mentorId = searchParams.get("mentorId");
    const approved = searchParams.get("approved");

    // Get all approved mentors (if no specific userId or mentorId requested)
    if (!requestedUserId && !mentorId) {
      const query: Record<string, unknown> = { isMentor: true };
      if (approved === "true") {
        query.isApproved = true;
      }

      const mentors = await MentorProfile.find(query)
        .populate("userId", "firstName lastName email avatar bio")
        .sort({ averageRating: -1, totalSessions: -1 })
        .limit(50);

      return NextResponse.json({
        success: true,
        data: mentors,
      });
    }

    // Get specific mentor profile
    const query = requestedUserId
      ? { userId: requestedUserId }
      : { _id: mentorId };
    const mentorProfile = await MentorProfile.findOne(query).populate(
      "userId",
      "firstName lastName email avatar bio title yoe"
    );

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mentorProfile,
    });
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentor profile" },
      { status: 500 }
    );
  }
}

// POST - Create or update mentor profile (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    console.log("Starting mentor profile creation...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

    await connectDB();
    console.log("Database connection established");

    const body = await request.json();
    const { userId, ...profileData } = body;

    // Filter out any undefined or null values
    const cleanProfileData = Object.fromEntries(
      Object.entries(profileData).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );

    // Ensure sessionTypes is properly formatted
    if (
      cleanProfileData.sessionTypes &&
      Array.isArray(cleanProfileData.sessionTypes)
    ) {
      cleanProfileData.sessionTypes = cleanProfileData.sessionTypes.filter(
        (session) =>
          session && session.name && session.duration && session.price
      );
    }

    console.log("Received profile data:", cleanProfileData);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if profile exists
    let mentorProfile = await MentorProfile.findOne({ userId });

    if (mentorProfile) {
      // Update existing profile
      console.log("Updating existing mentor profile:", mentorProfile._id);
      Object.assign(mentorProfile, cleanProfileData);
      await mentorProfile.save();
    } else {
      // Create new profile
      console.log("Creating new mentor profile for user:", userId);
      console.log("Profile data:", profileData);

      try {
        mentorProfile = await MentorProfile.create({
          userId,
          isMentor: true,
          ...cleanProfileData,
        });
        console.log("Mentor profile created successfully:", mentorProfile._id);
      } catch (createError) {
        console.error("Error creating mentor profile:", createError);
        throw createError;
      }
    }

    await mentorProfile.populate(
      "userId",
      "firstName lastName email avatar bio"
    );

    return NextResponse.json({
      success: true,
      data: mentorProfile,
      message: mentorProfile
        ? "Profile updated successfully"
        : "Profile created successfully",
    });
  } catch (error) {
    console.error("Error creating/updating mentor profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save mentor profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update specific fields (requires auth)
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const { userId, mentorId, ...updates } = body;

    if (!userId && !mentorId) {
      return NextResponse.json(
        { success: false, error: "User ID or Mentor ID is required" },
        { status: 400 }
      );
    }

    const query = userId ? { userId } : { _id: mentorId };
    const mentorProfile = await MentorProfile.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email avatar bio");

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mentorProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update mentor profile" },
      { status: 500 }
    );
  }
}

// DELETE - Delete mentor profile (soft delete - set isMentor to false) (requires auth)
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { userId },
      { $set: { isMentor: false, isApproved: false } },
      { new: true }
    );

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mentor profile deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating mentor profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate mentor profile" },
      { status: 500 }
    );
  }
}
