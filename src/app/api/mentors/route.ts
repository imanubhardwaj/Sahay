import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import { getUserIdFromRequest } from "@/lib/auth";

// GET - Get all mentors (for students and mentors to view)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simple query: get all mentors, no level filter, no approval filter
    const query: Record<string, unknown> = { isMentor: true };

    const mentors = await MentorProfile.find(query)
      .select("+level") // Include level field if needed
      .populate(
        "userId",
        "firstName lastName email avatar bio title yoe currentCompany",
      )
      .sort({ averageRating: -1, totalSessions: -1 })
      .limit(100); // Increased limit to show more mentors

    // Transform mentors to ensure firstName/lastName are available
    const mentorsWithNames = mentors.map((mentor) => {
      const mentorObj = mentor.toObject ? mentor.toObject() : mentor;

      // If userId is populated, use those fields; otherwise use direct fields
      if (mentorObj.userId && typeof mentorObj.userId === "object") {
        // userId is populated
        return {
          ...mentorObj,
          firstName: mentorObj.userId.firstName || mentorObj.firstName,
          lastName: mentorObj.userId.lastName || mentorObj.lastName,
          email: mentorObj.userId.email || mentorObj.email,
          avatar: mentorObj.userId.avatar || mentorObj.avatar,
        };
      } else {
        // userId is null or not populated, use direct fields
        return mentorObj;
      }
    });

    return NextResponse.json({
      success: true,
      data: mentorsWithNames,
      total: mentorsWithNames.length,
    });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentors" },
      { status: 500 },
    );
  }
}
