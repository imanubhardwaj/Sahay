import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MentorProfile from "@/models/MentorProfile";
import Schedule from "@/models/Schedule";
import { authenticateRequest } from "@/lib/auth";

// GET - Get mentor availability
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId") || userId;

    const mentorProfile = await MentorProfile.findOne({ userId: mentorId });

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        defaultAvailability: mentorProfile.defaultAvailability || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
        timezone: mentorProfile.timezone || "Asia/Kolkata",
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST - Save weekly availability and generate slots
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      defaultAvailability,
      timezone,
      price = 100,
      maxBookings = 1,
      daysToGenerate = 7,
    } = body;

    // Enforce session constraints
    const sessionDuration = 30; // Fixed 30 minutes per session
    const MAX_SLOTS_PER_DAY = 12;
    const MAX_SLOTS_PER_WEEK = 84;

    if (!defaultAvailability) {
      return NextResponse.json(
        { success: false, error: "Availability data is required" },
        { status: 400 }
      );
    }

    // Update mentor profile
    const mentorProfile = await MentorProfile.findOne({ userId });
    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    mentorProfile.defaultAvailability = defaultAvailability;
    if (timezone) mentorProfile.timezone = timezone;
    await mentorProfile.save();

    // Generate slots by weekday: every Monday gets the same slots, every Tuesday, etc., for the next N weeks
    const WEEKS_TO_GENERATE = 4; // e.g. next 4 Mondays, 4 Tuesdays, ...
    const generatedSlots: unknown[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + WEEKS_TO_GENERATE * 7);
    endDate.setHours(23, 59, 59, 999);

    const existingSchedules = await Schedule.find({
      professionalId: userId,
      date: { $gte: today, $lte: endDate },
      isActive: true,
    });

    const dailyCounts: Record<string, number> = {};
    const weeklyCounts: Record<string, number> = {};

    function getWeekKey(d: Date): string {
      const d2 = new Date(d);
      const day = d2.getDay();
      const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
      d2.setDate(diff);
      return d2.toISOString().split("T")[0];
    }

    existingSchedules.forEach((schedule) => {
      const scheduleDate = schedule.date.toISOString().split("T")[0];
      dailyCounts[scheduleDate] = (dailyCounts[scheduleDate] || 0) + 1;
      const wk = getWeekKey(schedule.date);
      weeklyCounts[wk] = (weeklyCounts[wk] || 0) + 1;
    });

    // For each weekday (0–6), get the next N occurrences of that day on or after today
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const dayName = dayNames[dayOfWeek];
      const dayAvailability = defaultAvailability[dayName] || [];
      if (dayAvailability.length === 0) continue;

      const date = new Date(today);
      const currentDay = date.getDay();
      let daysUntil = (dayOfWeek - currentDay + 7) % 7;
      date.setDate(date.getDate() + daysUntil);

      for (let week = 0; week < WEEKS_TO_GENERATE; week++) {
        const slotDate = new Date(date);
        slotDate.setDate(slotDate.getDate() + week * 7);
        if (slotDate > endDate) break;

        const dateKey = slotDate.toISOString().split("T")[0];
        const weekKey = getWeekKey(slotDate);
        const currentDayCount = dailyCounts[dateKey] || 0;
        const currentWeekCount = weeklyCounts[weekKey] || 0;

        if (currentDayCount >= MAX_SLOTS_PER_DAY) continue;
        if (currentWeekCount >= MAX_SLOTS_PER_WEEK) continue;

        for (const timeSlot of dayAvailability) {
          const [startHour, startMin] = timeSlot.start.split(":").map(Number);
          const [endHour, endMin] = timeSlot.end.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          let currentStart = startMinutes;
          while (currentStart + sessionDuration <= endMinutes) {
            if ((dailyCounts[dateKey] || 0) >= MAX_SLOTS_PER_DAY) break;
            if ((weeklyCounts[weekKey] || 0) >= MAX_SLOTS_PER_WEEK) break;

            const slotStart = new Date(slotDate);
            slotStart.setHours(
              Math.floor(currentStart / 60),
              currentStart % 60,
              0,
              0
            );

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + sessionDuration);

            const startTimeStr = `${Math.floor(currentStart / 60)
              .toString()
              .padStart(2, "0")}:${(currentStart % 60)
              .toString()
              .padStart(2, "0")}`;
            const endTimeStr = `${Math.floor(
              (currentStart + sessionDuration) / 60
            )
              .toString()
              .padStart(2, "0")}:${((currentStart + sessionDuration) % 60)
              .toString()
              .padStart(2, "0")}`;

            const existingSlot = await Schedule.findOne({
              professionalId: userId,
              date: slotStart,
              startTime: startTimeStr,
              isActive: true,
            });

            if (!existingSlot) {
              const newSlot = await Schedule.create({
                professionalId: userId,
                title: `30-min Session`,
                description: `30-minute mentoring session`,
                date: slotStart,
                startTime: startTimeStr,
                endTime: endTimeStr,
                duration: sessionDuration,
                maxBookings,
                price,
                sessionType: "one-on-one",
                isActive: true,
                location: "online",
              });

              generatedSlots.push(newSlot);
              dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
              weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
            }

            currentStart += sessionDuration;
          }
        }
      }
    }

    const weeklyTotal = Object.values(weeklyCounts).reduce((a, b) => a + b, 0);

    const hasNoAvailability = Object.values(defaultAvailability || {}).every(
      (slots: unknown) => !Array.isArray(slots) || slots.length === 0
    );
    const limitMessage =
      weeklyTotal >= MAX_SLOTS_PER_WEEK
        ? ` (Weekly limit of ${MAX_SLOTS_PER_WEEK} slots reached)`
        : generatedSlots.length === 0 && hasNoAvailability
        ? " No availability set — select at least one day and set your hours, then try again."
        : generatedSlots.length === 0
        ? " No new slots (daily/weekly limits may have been reached or slots already exist)."
        : "";

    return NextResponse.json({
      success: true,
      message:
        generatedSlots.length > 0
          ? `Generated ${generatedSlots.length} slots for the next ${WEEKS_TO_GENERATE} weeks (same times every week — e.g. every Monday, every Tuesday)`
          : `Generated 0 slots${limitMessage}`,
      data: {
        slotsGenerated: generatedSlots.length,
        availability: defaultAvailability,
        timezone: timezone || mentorProfile.timezone,
        weeklyTotal,
      },
    });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
