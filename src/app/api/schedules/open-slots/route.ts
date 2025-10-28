import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import Booking from "@/models/Booking";

// GET /api/schedules/open-slots - Get available time slots
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get("professionalId");
    const date = searchParams.get("date");
    const sessionType = searchParams.get("sessionType");

    if (!professionalId || !date) {
      return NextResponse.json(
        { error: "Professional ID and date are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all schedules for the professional on the given date
    const schedules = await Schedule.find({
      professionalId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
      ...(sessionType && { sessionType }),
    }).sort({ startTime: 1 });

    // Get all bookings for these schedules
    const scheduleIds = schedules.map((s) => s._id);
    const bookings = await Booking.find({
      scheduleId: { $in: scheduleIds },
      status: { $in: ["pending", "confirmed"] },
    });

    // Group bookings by schedule
    const bookingsBySchedule = bookings.reduce((acc, booking) => {
      if (!acc[booking.scheduleId.toString()]) {
        acc[booking.scheduleId.toString()] = [];
      }
      acc[booking.scheduleId.toString()].push(booking);
      return acc;
    }, {} as Record<string, Array<typeof Booking>>);

    // Calculate available slots
    const availableSlots = schedules
      .filter((schedule) => {
        const bookings = bookingsBySchedule[schedule._id.toString()] || [];
        return bookings.length < schedule.maxBookings;
      })
      .map((schedule) => {
        const bookings = bookingsBySchedule[schedule._id.toString()] || [];
        const availableSpots = schedule.maxBookings - bookings.length;

        return {
          scheduleId: schedule._id,
          professionalId: schedule.professionalId,
          title: schedule.title,
          description: schedule.description,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
          price: schedule.price,
          sessionType: schedule.sessionType,
          location: schedule.location,
          meetingLink: schedule.meetingLink,
          address: schedule.address,
          requirements: schedule.requirements,
          skills: schedule.skills,
          availableSpots,
          totalSpots: schedule.maxBookings,
          isAvailable: availableSpots > 0,
        };
      })
      .filter((slot) => slot.isAvailable);

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      professionalId,
      availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("Error fetching open slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch open slots" },
      { status: 500 }
    );
  }
}
