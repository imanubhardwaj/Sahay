import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import MentorProfile from '@/models/MentorProfile';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { createZoomMeeting, deleteZoomMeeting } from '@/lib/zoom';
import { sendBookingConfirmation, sendCancellationEmail, sendApprovalRequest, sendBookingRequestConfirmation } from '@/lib/email';
import crypto from 'crypto';

// GET - Get bookings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const studentId = searchParams.get('studentId');
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get specific booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId)
        .populate('studentId', 'firstName lastName email avatar')
        .populate('professionalId', 'firstName lastName email avatar title')
        .populate('scheduleId');

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: booking,
      });
    }

    // Build query
    const query: Record<string, unknown> = {};
    
    if (studentId) query.studentId = studentId;
    if (professionalId) query.professionalId = professionalId;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.sessionDate = {} as Record<string, Date>;
      if (startDate) (query.sessionDate as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (query.sessionDate as Record<string, Date>).$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('studentId', 'firstName lastName email avatar')
      .populate('professionalId', 'firstName lastName email avatar title')
      .populate('scheduleId')
      .sort({ sessionDate: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      studentId,
      professionalId,
      scheduleId,
      sessionDate,
      sessionTime,
      duration,
      price,
      studentNotes,
      sessionType,
    } = body;

    // Validate required fields
    if (!studentId || !professionalId || !scheduleId || !sessionDate || !sessionTime || !duration || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get student and mentor info
    const [student, professional, schedule, mentorProfile] = await Promise.all([
      User.findById(studentId),
      User.findById(professionalId),
      Schedule.findById(scheduleId),
      MentorProfile.findOne({ userId: professionalId }).select('+zoomAccessToken +zoomRefreshToken'),
    ]);

    if (!student || !professional || !schedule || !mentorProfile) {
      return NextResponse.json(
        { success: false, error: 'Student, professional, schedule, or mentor profile not found' },
        { status: 404 }
      );
    }

    // Check if schedule is available
    if (!schedule.isActive || schedule.currentBookings >= schedule.maxBookings) {
      return NextResponse.json(
        { success: false, error: 'Schedule is not available' },
        { status: 400 }
      );
    }

    // Check student wallet balance
    const studentWallet = await Wallet.findOne({ userId: studentId });
    if (!studentWallet || studentWallet.balance < price) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct points from student (will be refunded if mentor rejects)
    studentWallet.balance -= price;
    studentWallet.totalSpent += price;
    await studentWallet.save();

    // Create student transaction
    await Transaction.create({
      userId: studentId,
      type: 'debit',
      amount: price,
      description: `Booking request with ${professional.firstName} ${professional.lastName} (Pending approval)`,
      status: 'completed',
      category: 'mentorship_booking',
    });

    // Generate approval token
    const approvalToken = crypto.randomBytes(32).toString('hex');

    // Create booking with pending status
    const booking = await Booking.create({
      studentId,
      professionalId,
      scheduleId,
      sessionDate: new Date(sessionDate),
      sessionTime,
      duration,
      price,
      studentNotes,
      sessionType: sessionType || 'one-on-one',
      status: 'pending',
      paymentStatus: 'paid',
      approvalStatus: 'pending',
      approvalToken,
    });

    // Update schedule booking count (tentative)
    schedule.currentBookings += 1;
    await schedule.save();

    // Send approval request email to mentor
    const approvalEmailData = {
      mentorName: `${professional.firstName} ${professional.lastName}`,
      mentorEmail: professional.email,
      studentName: `${student.firstName} ${student.lastName}`,
      sessionDate: new Date(sessionDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      sessionTime,
      duration,
      sessionType: sessionType || 'one-on-one',
      price,
      studentNotes,
      bookingId: booking._id.toString(),
      approvalToken,
    };

    const approvalEmailResult = await sendApprovalRequest(approvalEmailData);

    // Send confirmation email to student
    const studentConfirmationData = {
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      mentorName: `${professional.firstName} ${professional.lastName}`,
      sessionDate: new Date(sessionDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      sessionTime,
      duration,
      sessionType: sessionType || 'one-on-one',
      price,
    };

    const studentEmailResult = await sendBookingRequestConfirmation(studentConfirmationData);

    // Update email tracking
    if (approvalEmailResult.success) {
      booking.approvalEmailSent = true;
    }
    if (studentEmailResult.success) {
      booking.emailSentToStudent = true;
    }
    await booking.save();

    await booking.populate([
      { path: 'studentId', select: 'firstName lastName email avatar' },
      { path: 'professionalId', select: 'firstName lastName email avatar title' },
      { path: 'scheduleId' },
    ]);

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking request sent! The mentor will review and approve your session.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (complete, cancel, etc.)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { bookingId, status, cancelledBy, cancellationReason, feedback } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'firstName lastName email')
      .populate('professionalId', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Handle cancellation
    if (status === 'cancelled') {
      // Refund logic (if cancelled 24 hours before)
      const sessionDateTime = new Date(`${booking.sessionDate.toISOString().split('T')[0]}T${booking.sessionTime}`);
      const hoursUntilSession = (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

      let refundAmount = 0;
      if (hoursUntilSession >= 24) {
        refundAmount = booking.price; // Full refund
      } else if (hoursUntilSession >= 12) {
        refundAmount = booking.price * 0.5; // 50% refund
      }

      if (refundAmount > 0) {
        const studentWallet = await Wallet.findOne({ userId: booking.studentId._id });
        if (studentWallet) {
          studentWallet.balance += refundAmount;
          await studentWallet.save();

          await Transaction.create({
            userId: booking.studentId._id,
            type: 'credit',
            amount: refundAmount,
            description: `Refund for cancelled booking`,
            status: 'completed',
            category: 'refund',
          });

          booking.paymentStatus = 'refunded';
        }
      }

      // Delete Zoom meeting
      if (booking.zoomMeetingId) {
        const mentorProfile = await MentorProfile.findOne({ 
          userId: booking.professionalId._id 
        }).select('+zoomAccessToken');
        
        if (mentorProfile?.zoomAccessToken) {
          await deleteZoomMeeting(booking.zoomMeetingId, mentorProfile.zoomAccessToken);
        }
      }

      // Update schedule
      const schedule = await Schedule.findById(booking.scheduleId);
      if (schedule) {
        schedule.currentBookings = Math.max(0, schedule.currentBookings - 1);
        await schedule.save();
      }

      // Update mentor stats
      const mentorProfile = await MentorProfile.findOne({ userId: booking.professionalId._id });
      if (mentorProfile) {
        mentorProfile.cancelledSessions += 1;
        await mentorProfile.save();
      }

      // Send cancellation emails
      await Promise.all([
        sendCancellationEmail({
          recipientName: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          recipientEmail: booking.studentId.email,
          sessionDate: booking.sessionDate.toLocaleDateString(),
          sessionTime: booking.sessionTime,
          cancelledBy: cancelledBy || 'system',
          reason: cancellationReason,
        }),
        sendCancellationEmail({
          recipientName: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
          recipientEmail: booking.professionalId.email,
          sessionDate: booking.sessionDate.toLocaleDateString(),
          sessionTime: booking.sessionTime,
          cancelledBy: cancelledBy || 'system',
          reason: cancellationReason,
        }),
      ]);

      booking.status = 'cancelled';
      booking.cancelledBy = cancelledBy;
      booking.cancellationReason = cancellationReason;
      booking.cancelledAt = new Date();
    }

    // Handle completion
    if (status === 'completed') {
      // Credit mentor
      const mentorWallet = await Wallet.findOne({ userId: booking.professionalId._id });
      if (mentorWallet) {
        mentorWallet.balance += booking.price;
        mentorWallet.totalEarned += booking.price;
        await mentorWallet.save();

        await Transaction.create({
          userId: booking.professionalId._id,
          type: 'credit',
          amount: booking.price,
          description: `Payment from ${booking.studentId.firstName} ${booking.studentId.lastName}`,
          status: 'completed',
          category: 'mentorship_earnings',
        });
      }

      // Update mentor stats
      const mentorProfile = await MentorProfile.findOne({ userId: booking.professionalId._id });
      if (mentorProfile) {
        mentorProfile.completedSessions += 1;
        mentorProfile.totalEarnings += booking.price;
        
        // Update rating if feedback provided
        if (feedback?.studentRating) {
          const totalRating = mentorProfile.averageRating * mentorProfile.totalReviews;
          mentorProfile.totalReviews += 1;
          mentorProfile.averageRating = (totalRating + feedback.studentRating) / mentorProfile.totalReviews;
        }
        
        await mentorProfile.save();
      }

      booking.status = 'completed';
      if (feedback) {
        booking.feedback = {
          ...booking.feedback,
          ...feedback,
          submittedAt: new Date(),
        };
      }
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
