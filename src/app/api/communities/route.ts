import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Community from "@/models/Community";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import Skill from "@/models/Skill";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/communities - Get all communities (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");
    const skillId = searchParams.get("skillId");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (createdBy) query.createdBy = createdBy;
    if (skillId) query.skillId = skillId;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const communities = await Community.find(query)
      .populate("createdBy", "firstName lastName email avatar userType")
      .populate("skillId", "name")
      .populate("members", "firstName lastName email avatar")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Community.countDocuments(query);

    return NextResponse.json({
      communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);
    
    await connectDB();
    
    const communityData = await request.json();
    const { createdBy, skillId, ...otherData } = communityData;

    if (!createdBy) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Verify creator exists
    let creator = await User.findById(createdBy);
    if (!creator) {
      creator = await WorkingProfessional.findById(createdBy);
    }

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Verify skill exists if provided
    if (skillId) {
      const skill = await Skill.findById(skillId);
      if (!skill) {
        return NextResponse.json(
          { error: "Skill not found" },
          { status: 404 }
        );
      }
    }

    const community = new Community({
      ...otherData,
      createdBy,
      skillId: skillId || null,
      members: [createdBy], // Creator is automatically a member
      memberCount: 1
    });

    await community.save();

    // Populate the related data for the response
    await community.populate("createdBy", "firstName lastName email avatar userType");
    if (skillId) {
      await community.populate("skillId", "name");
    }

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
