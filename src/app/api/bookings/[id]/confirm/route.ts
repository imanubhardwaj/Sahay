import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

// POST /api/bookings/[id]/confirm - Confirm a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { professionalId, professionalNotes, meetingLink } =
      await request.json();

    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is the professional for this booking
    if (booking.professionalId.toString() !== professionalId) {
      return NextResponse.json(
        { error: "Unauthorized to confirm this booking" },
        { status: 403 }
      );
    }

    // Check if booking is in pending status
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be confirmed" },
        { status: 409 }
      );
    }

    // Update booking status and professional notes
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "confirmed",
        professionalNotes,
        meetingLink: meetingLink || booking.meetingLink,
      },
      { new: true }
    ).populate([
      { path: "studentId", select: "name email avatar college year" },
      {
        path: "professionalId",
        select: "name email avatar company experience domain",
      },
      { path: "scheduleId", select: "title description sessionType location" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      { error: "Failed to confirm booking" },
      { status: 500 }
    );
  }
}
