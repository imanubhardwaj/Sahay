import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import College from "@/models/College";
import Skill from "@/models/Skill";

// GET /api/users - Get all users (with optional filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const college = searchParams.get("college");
    const company = searchParams.get("company");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = {};
    
    if (userType) query.userType = userType;
    if (role) query.role = role;
    if (status) query.status = status;
    if (college) query.college = college;
    if (company) query.company = company;

    const skip = (page - 1) * limit;

    // Get users based on type
    let users;
    if (userType === "working_professional") {
      users = await WorkingProfessional.find(query)
        .populate("company", "name")
        .populate("skills", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      users = await User.find(query)
        .populate("college", "name")
        .populate("skills", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const total = userType === "working_professional" 
      ? await WorkingProfessional.countDocuments(query)
      : await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const userData = await req.json();
    const { userType, ...otherData } = userData;

    if (!userType) {
      return NextResponse.json(
        { error: "User type is required" },
        { status: 400 }
      );
    }

    let user;
    if (userType === "working_professional") {
      user = new WorkingProfessional(otherData);
    } else {
      user = new User(otherData);
    }

    await user.save();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
