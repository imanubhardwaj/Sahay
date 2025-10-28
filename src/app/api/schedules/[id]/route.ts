import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import Booking from "@/models/Booking";

// GET /api/schedules/[id] - Get a specific schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const schedule = await Schedule.findById(id).populate(
      "professionalId",
      "name email avatar company experience domain"
    );

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PUT /api/schedules/[id] - Update a schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const updateData = await request.json();
    const { professionalId, ...otherData } = updateData;

    const { id } = await params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the schedule
    if (schedule.professionalId.toString() !== professionalId) {
      return NextResponse.json(
        { error: "Unauthorized to update this schedule" },
        { status: 403 }
      );
    }

    // Check for time conflicts if time is being updated
    if (otherData.date || otherData.startTime || otherData.endTime) {
      const existingSchedule = await Schedule.findOne({
        _id: { $ne: id },
        professionalId: schedule.professionalId,
        date: otherData.date || schedule.date,
        $or: [
          {
            startTime: { $lt: otherData.endTime || schedule.endTime },
            endTime: { $gt: otherData.startTime || schedule.startTime },
          },
        ],
        isActive: true,
      });

      if (existingSchedule) {
        return NextResponse.json(
          { error: "Time slot conflicts with existing schedule" },
          { status: 409 }
        );
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      otherData,
      { new: true }
    ).populate("professionalId", "name email avatar company experience domain");

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete a schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { professionalId } = await request.json();

    const { id } = await params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the schedule
    if (schedule.professionalId.toString() !== professionalId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this schedule" },
        { status: 403 }
      );
    }

    // Check if there are any pending or confirmed bookings
    const activeBookings = await Booking.find({
      scheduleId: id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete schedule with active bookings",
          activeBookings: activeBookings.length,
        },
        { status: 409 }
      );
    }

    await Schedule.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
