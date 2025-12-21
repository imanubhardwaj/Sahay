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
    const { defaultAvailability, timezone, duration = 30, price = 100, maxBookings = 1, daysToGenerate = 7 } = body;

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

    // Generate slots for the next N days (default 7 days = 1 week)
    const generatedSlots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Track daily and weekly counts to enforce limits
    const dailyCounts: Record<string, number> = {};
    let weeklyTotal = 0;

    // Get start and end of the generation period
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + Math.min(daysToGenerate, 7)); // Max 1 week at a time
    endDate.setHours(23, 59, 59, 999);

    const existingSchedules = await Schedule.find({
      professionalId: userId,
      date: {
        $gte: today,
        $lte: endDate,
      },
      isActive: true,
    });

    // Count existing schedules per day and total for week
    existingSchedules.forEach((schedule) => {
      const scheduleDate = schedule.date.toISOString().split('T')[0];
      dailyCounts[scheduleDate] = (dailyCounts[scheduleDate] || 0) + 1;
      weeklyTotal++;
    });

    // Check if already at weekly limit
    if (weeklyTotal >= MAX_SLOTS_PER_WEEK) {
      return NextResponse.json({
        success: false,
        error: `Weekly limit of ${MAX_SLOTS_PER_WEEK} slots already reached. Please wait until next week or remove existing slots.`,
      }, { status: 400 });
    }

    for (let dayOffset = 0; dayOffset < Math.min(daysToGenerate, 7); dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayName = dayNames[date.getDay()];
      const dayAvailability = defaultAvailability[dayName] || [];

      // Check daily limit (max 12 slots per day)
      const currentDayCount = dailyCounts[dateKey] || 0;
      if (currentDayCount >= MAX_SLOTS_PER_DAY) {
        continue; // Skip this day, already at limit
      }

      // Generate slots for each time range on this day
      for (const timeSlot of dayAvailability) {
        const [startHour, startMin] = timeSlot.start.split(':').map(Number);
        const [endHour, endMin] = timeSlot.end.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Generate 30-minute slots based on the time range
        let currentStart = startMinutes;
        while (currentStart + sessionDuration <= endMinutes) {
          // Check weekly limit before creating (max 84 slots per week)
          if (weeklyTotal >= MAX_SLOTS_PER_WEEK) {
            break; // Stop generating if weekly limit reached
          }

          // Check daily limit (max 12 slots per day)
          if ((dailyCounts[dateKey] || 0) >= MAX_SLOTS_PER_DAY) {
            break; // Stop generating for this day if limit reached
          }

          const slotStart = new Date(date);
          slotStart.setHours(Math.floor(currentStart / 60), currentStart % 60, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + sessionDuration);

          const startTimeStr = `${Math.floor(currentStart / 60).toString().padStart(2, '0')}:${(currentStart % 60).toString().padStart(2, '0')}`;
          const endTimeStr = `${Math.floor((currentStart + sessionDuration) / 60).toString().padStart(2, '0')}:${((currentStart + sessionDuration) % 60).toString().padStart(2, '0')}`;

          // Check if slot already exists
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
              sessionType: 'one-on-one',
              isActive: true,
              location: 'online',
            });

            generatedSlots.push(newSlot);
            dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
            weeklyTotal++;
          }

          currentStart += sessionDuration;
        }

        // Break outer loop if weekly limit reached
        if (weeklyTotal >= MAX_SLOTS_PER_WEEK) {
          break;
        }
      }

      // Break main loop if weekly limit reached
      if (weeklyTotal >= MAX_SLOTS_PER_WEEK) {
        break;
      }
    }

    const limitMessage = weeklyTotal >= MAX_SLOTS_PER_WEEK 
      ? ` (Weekly limit of ${MAX_SLOTS_PER_WEEK} slots reached)`
      : generatedSlots.length === 0
      ? " (No new slots generated - daily/weekly limits may have been reached)"
      : "";

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedSlots.length} slots for the next ${daysToGenerate} days${limitMessage}`,
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

