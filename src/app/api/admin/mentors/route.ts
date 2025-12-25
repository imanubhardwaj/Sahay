import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
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

// POST - Add a user as a mentor (Admin only)
// Creates a new user if they don't exist
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await authenticateAdminRequest(request);

    await connectDB();

    const body = await request.json();
    const { 
      userId, 
      email, // Can search by email if userId not provided
      level = MENTOR_LEVEL.L3,
      isApproved = false,
      customPointRate,
      headline,
      bio,
      expertise = [],
      currentRole,
      currentCompany,
      yearsOfExperience,
      // New fields for user creation
      firstName,
      lastName,
    } = body;

    // Find user by ID or email
    let user = null;
    let isNewUser = false;
    
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    // If user not found, create a new user
    if (!user && email) {
      const emailLower = email.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      
      // Generate a unique workosId for admin-created users
      const uniqueId = `admin-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate username from email
      const baseUsername = emailPrefix.replace(/[^a-z0-9]/gi, '');
      const randomSuffix = Math.random().toString(36).substr(2, 5);
      const username = `${baseUsername}_${randomSuffix}`;
      
      // Create new user
      user = await User.create({
        firstName: firstName || emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1),
        lastName: lastName || 'Mentor',
        email: emailLower,
        username: username,
        workosId: uniqueId, // Placeholder workosId for admin-created users
        role: 'mentor',
        userType: 'working_professional',
        isOnboardingComplete: true, // Skip onboarding for admin-created mentors
        status: 'active',
        bio: bio || '',
        yoe: yearsOfExperience || 0,
        title: currentRole || '',
        location: '',
        visibility: 'public',
        skills: [],
        portfolio: [],
        mentors: [],
        progress: {
          currentGoal: '',
          completionRate: 0
        },
        completionRate: 0,
        selectedModules: []
      });
      
      isNewUser = true;
      console.log(`Admin created new user: ${user.email} with ID: ${user._id}`);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found and could not be created. Please provide a valid email." },
        { status: 404 }
      );
    }

    // Check if mentor profile already exists
    let mentorProfile = await MentorProfile.findOne({ userId: user._id });

    if (mentorProfile) {
      // Update existing mentor profile
      mentorProfile.isMentor = true;
      mentorProfile.level = level;
      mentorProfile.isApproved = isApproved;
      
      if (customPointRate !== undefined) {
        mentorProfile.customPointRate = customPointRate;
      }
      if (headline) mentorProfile.headline = headline;
      if (bio) mentorProfile.bio = bio;
      if (expertise.length > 0) mentorProfile.expertise = expertise;
      if (currentRole) mentorProfile.currentRole = currentRole;
      if (currentCompany) mentorProfile.currentCompany = currentCompany;
      if (yearsOfExperience) mentorProfile.yearsOfExperience = yearsOfExperience;
      
      await mentorProfile.save();
    } else {
      // Create new mentor profile
      mentorProfile = await MentorProfile.create({
        userId: user._id,
        isMentor: true,
        isApproved,
        level,
        customPointRate: customPointRate || null,
        headline: headline || `${user.title || 'Professional'} at ${user.company || 'a leading company'}`,
        bio: bio || user.bio || '',
        expertise: expertise.length > 0 ? expertise : [],
        currentRole: currentRole || user.title || '',
        currentCompany: currentCompany || user.company || '',
        yearsOfExperience: yearsOfExperience || user.yoe || 0,
        averageRating: 0,
        totalReviews: 0,
        completedSessions: 0,
        totalSessions: 0,
        sessionTypes: [
          {
            name: 'One-on-One Session',
            duration: 30,
            price: MENTOR_LEVEL_RATES[level as keyof typeof MENTOR_LEVEL_RATES] || 1000,
            description: '30 minute one-on-one mentoring session',
          },
        ],
      });
    }

    // Also update the user's userType to working_professional if not already (skip if newly created)
    if (!isNewUser && user.userType !== 'working_professional') {
      user.userType = 'working_professional';
      user.role = 'mentor';
      await user.save();
    }

    // Populate and return the mentor profile
    await mentorProfile.populate('userId', 'firstName lastName email avatar bio title yoe currentCompany');
    
    const mentorObj = mentorProfile.toObject();
    const effectiveRate = mentorObj.customPointRate ?? MENTOR_LEVEL_RATES[level as keyof typeof MENTOR_LEVEL_RATES];

    return NextResponse.json({
      success: true,
      message: isNewUser 
        ? "New user created and registered as mentor successfully" 
        : "Mentor added/updated successfully",
      isNewUser,
      data: {
        ...mentorObj,
        effectiveRate,
        levelDescription: getLevelDescription(level),
      },
    });
  } catch (error) {
    console.error("Error adding mentor:", error);
    
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
      { success: false, error: "Failed to add mentor" },
      { status: 500 }
    );
  }
}

