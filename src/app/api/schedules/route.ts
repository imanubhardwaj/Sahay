import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import MentorProfile from '@/models/MentorProfile';

// GET - Get schedules
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const scheduleId = searchParams.get('scheduleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isActive = searchParams.get('isActive');

    // Get specific schedule
    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId)
        .populate('professionalId', 'firstName lastName email avatar');

      if (!schedule) {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: schedule,
      });
    }

    // Build query
    const query: any = {};
    
    if (professionalId) {
      query.professionalId = professionalId;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const schedules = await Schedule.find(query)
      .populate('professionalId', 'firstName lastName email avatar title')
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST - Create schedule
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { professionalId, ...scheduleData } = body;

    if (!professionalId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      );
    }

    // Verify mentor profile exists
    const mentorProfile = await MentorProfile.findOne({ 
      userId: professionalId, 
      isMentor: true 
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile not found' },
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
          endTime: { $gt: scheduleData.startTime }
        },
        {
          startTime: { $lt: scheduleData.endTime },
          endTime: { $gte: scheduleData.endTime }
        },
        {
          startTime: { $gte: scheduleData.startTime },
          endTime: { $lte: scheduleData.endTime }
        }
      ]
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: 'This time slot overlaps with an existing schedule' },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create({
      professionalId,
      ...scheduleData,
    });

    await schedule.populate('professionalId', 'firstName lastName email avatar');

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// PATCH - Update schedule
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { scheduleId, ...updates } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // If updating time, check for overlaps
    if (updates.startTime || updates.endTime || updates.date) {
      const currentSchedule = await Schedule.findById(scheduleId);
      
      if (!currentSchedule) {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
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
            endTime: { $gt: checkStartTime }
          },
          {
            startTime: { $lt: checkEndTime },
            endTime: { $gte: checkEndTime }
          },
          {
            startTime: { $gte: checkStartTime },
            endTime: { $lte: checkEndTime }
          }
        ]
      });

      if (overlapping) {
        return NextResponse.json(
          { success: false, error: 'This time slot overlaps with an existing schedule' },
          { status: 400 }
        );
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('professionalId', 'firstName lastName email avatar');

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule updated successfully',
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if there are any bookings
    const Booking = (await import('@/models/Booking')).default;
    const hasBookings = await Booking.countDocuments({
      scheduleId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (hasBookings > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete schedule with active bookings. Please cancel bookings first.' 
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findByIdAndDelete(scheduleId);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
