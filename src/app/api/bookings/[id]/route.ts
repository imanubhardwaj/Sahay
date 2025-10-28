import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate("studentId", "name email avatar college year")
      .populate("professionalId", "name email avatar company experience domain")
      .populate("scheduleId", "title description sessionType location");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const updateData = await request.json();
    const { userId, userRole, ...otherData } = updateData;

    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    const isStudent =
      userRole === "student" && booking.studentId.toString() === userId;
    const isProfessional =
      userRole === "mentor" && booking.professionalId.toString() === userId;

    if (!isStudent && !isProfessional) {
      return NextResponse.json(
        { error: "Unauthorized to update this booking" },
        { status: 403 }
      );
    }

    // Students can only update certain fields
    if (
      isStudent &&
      otherData.status &&
      !["cancelled"].includes(otherData.status)
    ) {
      return NextResponse.json(
        { error: "Students can only cancel bookings" },
        { status: 403 }
      );
    }

    // Handle cancellation
    if (otherData.status === "cancelled") {
      otherData.cancelledAt = new Date();
      otherData.cancelledBy = isStudent ? "student" : "professional";

      // Update schedule current bookings count
      await Schedule.findByIdAndUpdate(booking.scheduleId, {
        $inc: { currentBookings: -1 },
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      otherData,
      { new: true }
    ).populate([
      { path: "studentId", select: "name email avatar college year" },
      {
        path: "professionalId",
        select: "name email avatar company experience domain",
      },
      { path: "scheduleId", select: "title description sessionType location" },
    ]);

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { userId, userRole } = await request.json();

    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    const isStudent =
      userRole === "student" && booking.studentId.toString() === userId;
    const isProfessional =
      userRole === "mentor" && booking.professionalId.toString() === userId;

    if (!isStudent && !isProfessional) {
      return NextResponse.json(
        { error: "Unauthorized to delete this booking" },
        { status: 403 }
      );
    }

    // Only allow deletion of pending or cancelled bookings
    if (!["pending", "cancelled"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Cannot delete confirmed or completed bookings" },
        { status: 409 }
      );
    }

    // Update schedule current bookings count if booking was active
    if (booking.status === "pending") {
      await Schedule.findByIdAndUpdate(booking.scheduleId, {
        $inc: { currentBookings: -1 },
      });
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
