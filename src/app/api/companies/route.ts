import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Company from "@/models/Company";

// GET /api/companies - Get all companies
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (name) query.name = { $regex: name, $options: "i" };
    if (industry) query.industry = { $regex: industry, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    const skip = (page - 1) * limit;

    const companies = await Company.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Company.countDocuments(query);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const companyData = await request.json();

    const company = new Company(companyData);
    await company.save();

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
