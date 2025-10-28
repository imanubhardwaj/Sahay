import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";

// GET /api/colleges - Get all colleges
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const location = searchParams.get("location");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (name) query.name = { $regex: name, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    const skip = (page - 1) * limit;

    const colleges = await College.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await College.countDocuments(query);

    return NextResponse.json({
      colleges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

// POST /api/colleges - Create a new college
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const collegeData = await request.json();

    const college = new College(collegeData);
    await college.save();

    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 }
    );
  }
}
