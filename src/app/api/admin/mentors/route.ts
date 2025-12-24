import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import { authenticateAdminRequest } from "@/lib/auth";
import { MENTOR_LEVEL, MENTOR_LEVEL_RATES } from "@/lib/constants";

// GET - Get all mentors with their admin-only fields (level, customPointRate)
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await authenticateAdminRequest(request);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level"); // Filter by level: L1, L2, L3, or "none" for unassigned
    const approved = searchParams.get("approved"); // Filter by approval status
    const search = searchParams.get("search"); // Search query

    // Build query
    const query: Record<string, unknown> = { isMentor: true };
    
    if (level) {
      if (level === "none") {
        // Find mentors without a level assigned
        query.level = { $exists: false };
      } else {
        query.level = level;
      }
    }
    
    if (approved === "true") {
      query.isApproved = true;
    } else if (approved === "false") {
      query.isApproved = false;
    }

    // Use select('+level +customPointRate') to include hidden fields
    const mentors = await MentorProfile.find(query)
      .select('+level +customPointRate')
      .populate("userId", "firstName lastName email avatar bio title yoe currentCompany")
      .sort({ createdAt: -1 });

    // Calculate effective rate for each mentor and convert to plain objects
    let mentorsWithRates = mentors.map((mentor) => {
      const mentorObj = mentor.toObject();
      const level = mentorObj.level || MENTOR_LEVEL.L3;
      const effectiveRate = mentorObj.customPointRate ?? MENTOR_LEVEL_RATES[level as keyof typeof MENTOR_LEVEL_RATES];
      
      return {
        ...mentorObj,
        level,
        effectiveRate,
        levelDescription: getLevelDescription(level),
      };
    });

    // Apply search filter if provided (after converting to plain objects)
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      mentorsWithRates = mentorsWithRates.filter((mentor) => {
        const userId = mentor.userId as any;
        
        // Search in various fields
        const searchFields = [
          userId?.firstName || '',
          userId?.lastName || '',
          userId?.email || '',
          userId?.title || '',
          userId?.currentCompany || '',
          mentor.currentRole || '',
          mentor.currentCompany || '',
          mentor.headline || '',
          (mentor.expertise || []).join(' '),
        ];
        
        // Check if any field contains the search term
        return searchFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: mentorsWithRates,
      total: mentorsWithRates.length,
    });
  } catch (error) {
    console.error("Error fetching mentors for admin:", error);
    
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }
    
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch mentors" },
      { status: 500 }
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

