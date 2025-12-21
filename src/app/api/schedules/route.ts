import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import MentorProfile from "@/models/MentorProfile";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET - Get schedules (requires auth)
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
    const professionalId = searchParams.get("professionalId");
    const scheduleId = searchParams.get("scheduleId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isActive = searchParams.get("isActive");

    // Get specific schedule
    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId).populate(
        "professionalId",
        "firstName lastName email avatar"
      );

      if (!schedule) {
        return NextResponse.json(
          { success: false, error: "Schedule not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: schedule,
      });
    }

    // Build query
    const query: Record<string, unknown> = {};

    if (professionalId) {
      query.professionalId = professionalId;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    const schedules = await Schedule.find(query)
      .populate("professionalId", "firstName lastName email avatar title")
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST - Create schedule (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const { professionalId, ...scheduleData } = body;

    if (!professionalId) {
      return NextResponse.json(
        { success: false, error: "Professional ID is required" },
        { status: 400 }
      );
    }

    // Validate duration (max 30 minutes)
    if (scheduleData.duration && scheduleData.duration > 30) {
      return NextResponse.json(
        { success: false, error: "Maximum session duration is 30 minutes" },
        { status: 400 }
      );
    }

    // Verify mentor profile exists
    const mentorProfile = await MentorProfile.findOne({
      userId: professionalId,
      isMentor: true,
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Check for overlapping schedules
    const overlapping = await Schedule.findOne({
      professionalId,
      date: scheduleData.date,
      isActive: true,
      $or: [
        {
          startTime: { $lte: scheduleData.startTime },
          endTime: { $gt: scheduleData.startTime },
        },
        {
          startTime: { $lt: scheduleData.endTime },
          endTime: { $gte: scheduleData.endTime },
        },
        {
          startTime: { $gte: scheduleData.startTime },
          endTime: { $lte: scheduleData.endTime },
        },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: "This time slot overlaps with an existing schedule",
        },
        { status: 400 }
      );
    }

    // Check daily limit (max 6 schedules per day)
    const scheduleDate = new Date(scheduleData.date);
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);

    const schedulesOnDay = await Schedule.countDocuments({
      professionalId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isActive: true,
    });

    if (schedulesOnDay >= 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Daily limit reached. You can only create 6 schedules per day.",
        },
        { status: 400 }
      );
    }

    // Check weekly limit (max 40 schedules per week)
    const startOfWeek = new Date(scheduleDate);
    startOfWeek.setDate(scheduleDate.getDate() - scheduleDate.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    const schedulesThisWeek = await Schedule.countDocuments({
      professionalId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
      isActive: true,
    });

    if (schedulesThisWeek >= 40) {
      return NextResponse.json(
        {
          success: false,
          error: "Weekly limit reached. You can only create 40 schedules per week.",
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create({
      professionalId,
      ...scheduleData,
    });

    await schedule.populate(
      "professionalId",
      "firstName lastName email avatar"
    );

    return NextResponse.json(
      {
        success: true,
        data: schedule,
        message: "Schedule created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

// PATCH - Update schedule (requires auth)
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const { scheduleId, ...updates } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // If updating time, check for overlaps
    if (updates.startTime || updates.endTime || updates.date) {
      const currentSchedule = await Schedule.findById(scheduleId);

      if (!currentSchedule) {
        return NextResponse.json(
          { success: false, error: "Schedule not found" },
          { status: 404 }
        );
      }

      const checkDate = updates.date || currentSchedule.date;
      const checkStartTime = updates.startTime || currentSchedule.startTime;
      const checkEndTime = updates.endTime || currentSchedule.endTime;

      const overlapping = await Schedule.findOne({
        _id: { $ne: scheduleId },
        professionalId: currentSchedule.professionalId,
        date: checkDate,
        isActive: true,
        $or: [
          {
            startTime: { $lte: checkStartTime },
            endTime: { $gt: checkStartTime },
          },
          {
            startTime: { $lt: checkEndTime },
            endTime: { $gte: checkEndTime },
          },
          {
            startTime: { $gte: checkStartTime },
            endTime: { $lte: checkEndTime },
          },
        ],
      });

      if (overlapping) {
        return NextResponse.json(
          {
            success: false,
            error: "This time slot overlaps with an existing schedule",
          },
          { status: 400 }
        );
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("professionalId", "firstName lastName email avatar");

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE - Delete schedule (requires auth)
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Check if there are any bookings
    const Booking = (await import("@/models/Booking")).default;
    const hasBookings = await Booking.countDocuments({
      scheduleId,
      status: { $in: ["pending", "confirmed"] },
    });

    if (hasBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete schedule with active bookings. Please cancel bookings first.",
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findByIdAndDelete(scheduleId);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
