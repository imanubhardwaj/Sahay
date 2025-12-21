import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import { deleteZoomMeeting } from "@/lib/zoom";
import {
  sendCancellationEmail,
  sendApprovalRequest,
  sendBookingRequestConfirmation,
  sendBookingCreatedEmail,
} from "@/lib/email";
import crypto from "crypto";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";
import { notifyBookingEvent } from "@/lib/notifications";
import { TRANSACTION_TYPE, TRANSACTION_SOURCE } from "@/lib/constants";

// GET - Get bookings (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const studentId = searchParams.get("studentId");
    const professionalId = searchParams.get("professionalId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get specific booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId)
        .populate("studentId", "firstName lastName email avatar")
        .populate("professionalId", "firstName lastName email avatar title")
        .populate("scheduleId");

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
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
      if (startDate)
        (query.sessionDate as Record<string, Date>).$gte = new Date(startDate);
      if (endDate)
        (query.sessionDate as Record<string, Date>).$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("studentId", "firstName lastName email avatar")
      .populate("professionalId", "firstName lastName email avatar title")
      .populate("scheduleId")
      .sort({ sessionDate: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create booking (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await authenticateRequest(request);

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
    if (
      !studentId ||
      !professionalId ||
      !scheduleId ||
      !sessionDate ||
      !sessionTime ||
      !duration ||
      !price
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get student and mentor info
    const [student, professional, schedule] = await Promise.all([
      User.findById(studentId),
      User.findById(professionalId),
      Schedule.findById(scheduleId),
    ]);

    // Get mentor profile (optional for booking creation, required for Zoom meeting creation later)
    const mentorProfile = await MentorProfile.findOne({ userId: professionalId }).select(
      "+zoomAccessToken +zoomRefreshToken"
    );

    if (!student) {
      return NextResponse.json(
        { success: false, error: `Student not found with ID: ${studentId}` },
        { status: 404 }
      );
    }
    
    if (!professional) {
      return NextResponse.json(
        { success: false, error: `Professional not found with ID: ${professionalId}` },
        { status: 404 }
      );
    }
    
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: `Schedule not found with ID: ${scheduleId}` },
        { status: 404 }
      );
    }
    
    // Mentor profile is optional for booking creation
    // It will be required when the mentor approves the booking (for Zoom meeting creation)
    if (!mentorProfile) {
      console.warn(`Mentor profile not found for professional ${professionalId}. Booking will be created but Zoom meeting will need to be set up manually.`);
    }

    // Check if schedule is available
    if (
      !schedule.isActive ||
      schedule.currentBookings >= schedule.maxBookings
    ) {
      return NextResponse.json(
        { success: false, error: "Schedule is not available" },
        { status: 400 }
      );
    }

    // Check student wallet balance
    const studentWallet = await Wallet.findOne({ userId: studentId });
    if (!studentWallet) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Student wallet not found. Please contact support." 
        },
        { status: 400 }
      );
    }
    
    if (studentWallet.balance < price) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. You have ${studentWallet.balance} points, but need ${price} points.` 
        },
        { status: 400 }
      );
    }

    // Debit points from student when booking is created
    studentWallet.balance -= price;
    studentWallet.totalSpent += price;
    await studentWallet.save();

    // Create transaction for student (redeem points)
    await Transaction.create({
      userId: studentId,
      walletId: studentWallet._id,
      type: TRANSACTION_TYPE.Redeem,
      points: price,
      source: TRANSACTION_SOURCE.Mentor,
      description: `Session booking with ${professional.firstName} ${professional.lastName}`,
      referenceId: null, // Will be updated with booking ID after creation
    });

    // Generate approval token
    const approvalToken = crypto.randomBytes(32).toString("hex");

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
      sessionType: sessionType || "one-on-one",
      status: "pending",
      paymentStatus: "paid", // Points already debited, so payment is processed
      approvalStatus: "pending",
      approvalToken,
    });

    // Update transaction with booking ID
    await Transaction.findOneAndUpdate(
      { userId: studentId, referenceId: null, points: price },
      { referenceId: booking._id.toString() },
      { sort: { createdAt: -1 } }
    );

    // Update schedule booking count (tentative)
    schedule.currentBookings += 1;
    await schedule.save();

    // Send approval request email to mentor (don't fail if email fails)
    let approvalEmailResult = { success: false };
    try {
      const approvalEmailData = {
        mentorName: `${professional.firstName} ${professional.lastName}`,
        mentorEmail: professional.email,
        studentName: `${student.firstName} ${student.lastName}`,
        sessionDate: new Date(sessionDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        sessionTime,
        duration,
        sessionType: sessionType || "one-on-one",
        price,
        studentNotes,
        bookingId: booking._id.toString(),
        approvalToken,
      };
      approvalEmailResult = await sendApprovalRequest(approvalEmailData);
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // Continue with booking creation even if email fails
    }

    // Send confirmation email to student (don't fail if email fails)
    let studentEmailResult = { success: false };
    try {
      const studentConfirmationData = {
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        mentorName: `${professional.firstName} ${professional.lastName}`,
        sessionDate: new Date(sessionDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        sessionTime,
        duration,
        sessionType: sessionType || "one-on-one",
        price,
      };
      studentEmailResult = await sendBookingRequestConfirmation(
        studentConfirmationData
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue with booking creation even if email fails
    }

    // Send booking created emails to both student and mentor (don't fail if email fails)
    try {
      const dummyMeetingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meeting/${booking._id}`;
      await sendBookingCreatedEmail({
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        mentorName: `${professional.firstName} ${professional.lastName}`,
        mentorEmail: professional.email,
        sessionDate: new Date(sessionDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        sessionTime,
        meetingLink: dummyMeetingLink,
      });
    } catch (emailError) {
      console.error("Error sending booking created email:", emailError);
      // Continue with booking creation even if email fails
    }

    // Update email tracking
    if (approvalEmailResult.success) {
      booking.approvalEmailSent = true;
    }
    if (studentEmailResult.success) {
      booking.emailSentToStudent = true;
    }
    await booking.save();

    // Send real-time notifications
    try {
      await Promise.all([
        notifyBookingEvent(professionalId, "booking_request", {
          bookingId: booking._id.toString(),
          studentName: `${student.firstName} ${student.lastName}`,
          sessionDate: new Date(sessionDate).toLocaleDateString(),
          sessionTime,
          price,
        }),
        notifyBookingEvent(studentId, "booking_request", {
          bookingId: booking._id.toString(),
          mentorName: `${professional.firstName} ${professional.lastName}`,
          sessionDate: new Date(sessionDate).toLocaleDateString(),
          sessionTime,
          price,
        }),
      ]);
    } catch (notifError) {
      console.error("Error sending notifications:", notifError);
      // Don't fail the booking if notifications fail
    }

    await booking.populate([
      { path: "studentId", select: "firstName lastName email avatar" },
      {
        path: "professionalId",
        select: "firstName lastName email avatar title",
      },
      { path: "scheduleId" },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message:
          "Booking request sent! The mentor will review and approve your session.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body: JSON.stringify(request.body || {}),
    });
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "Failed to create booking",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (complete, cancel, etc.) - requires auth
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const { bookingId, status, cancelledBy, cancellationReason, feedback } =
      body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId)
      .populate("studentId", "firstName lastName email")
      .populate("professionalId", "firstName lastName email");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Handle cancellation
    if (status === "cancelled") {
      // Refund logic (points were already debited when booking was created)
      // If student cancels, always give full refund
      // If mentor cancels, refund based on timing
      const isStudentCancellation = cancelledBy === "student";
      let refundAmount = 0;

      if (isStudentCancellation) {
        // Full refund when student cancels
        refundAmount = booking.price;
      } else {
        // Refund based on cancellation timing for mentor cancellations
        const sessionDateTime = new Date(
          `${booking.sessionDate.toISOString().split("T")[0]}T${
            booking.sessionTime
          }`
        );
        const hoursUntilSession =
          (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursUntilSession >= 24) {
          refundAmount = booking.price; // Full refund
        } else if (hoursUntilSession >= 12) {
          refundAmount = booking.price * 0.5; // 50% refund
        }
      }

      // Only refund if payment was already processed (points were debited)
      if (refundAmount > 0 && booking.paymentStatus === "paid") {
        const studentWallet = await Wallet.findOne({
          userId: booking.studentId._id,
        });
        if (studentWallet) {
          studentWallet.balance += refundAmount;
          await studentWallet.save();

          await Transaction.create({
            userId: booking.studentId._id,
            walletId: studentWallet._id,
            type: TRANSACTION_TYPE.Earn,
            points: refundAmount,
            source: TRANSACTION_SOURCE.Mentor,
            description: isStudentCancellation 
              ? `Full refund for cancelled booking (student cancellation)`
              : `Refund for cancelled booking`,
            referenceId: booking._id.toString(),
          });

          booking.paymentStatus = "refunded";
        }
      }

      // Delete Zoom meeting
      if (booking.zoomMeetingId) {
        const mentorProfile = await MentorProfile.findOne({
          userId: booking.professionalId._id,
        }).select("+zoomAccessToken");

        if (mentorProfile?.zoomAccessToken) {
          await deleteZoomMeeting(
            booking.zoomMeetingId,
            mentorProfile.zoomAccessToken
          );
        }
      }

      // Update schedule
      const schedule = await Schedule.findById(booking.scheduleId);
      if (schedule) {
        schedule.currentBookings = Math.max(0, schedule.currentBookings - 1);
        await schedule.save();
      }

      // Update mentor stats
      const mentorProfile = await MentorProfile.findOne({
        userId: booking.professionalId._id,
      });
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
          cancelledBy: cancelledBy || "system",
          reason: cancellationReason,
        }),
        sendCancellationEmail({
          recipientName: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
          recipientEmail: booking.professionalId.email,
          sessionDate: booking.sessionDate.toLocaleDateString(),
          sessionTime: booking.sessionTime,
          cancelledBy: cancelledBy || "system",
          reason: cancellationReason,
        }),
      ]);

      booking.status = "cancelled";
      booking.cancelledBy = cancelledBy;
      booking.cancellationReason = cancellationReason;
      booking.cancelledAt = new Date();
    }

    // Handle completion
    if (status === "completed") {
      // Points were already debited when booking was created
      // Now credit points to mentor when session is marked as complete
      if (booking.paymentStatus === "paid") {
        // Credit to mentor
        let mentorWallet = await Wallet.findOne({
          userId: booking.professionalId._id,
        });
        if (!mentorWallet) {
          const { createUserWallet } = await import("@/lib/wallet");
          mentorWallet = await createUserWallet(booking.professionalId._id);
        }
        mentorWallet.balance += booking.price;
        mentorWallet.totalEarned += booking.price;
        await mentorWallet.save();

        // Create mentor transaction (earn points)
        await Transaction.create({
          userId: booking.professionalId._id,
          walletId: mentorWallet._id,
          type: TRANSACTION_TYPE.Earn,
          points: booking.price,
          source: TRANSACTION_SOURCE.Mentor,
          description: `Payment from ${booking.studentId.firstName} ${booking.studentId.lastName} for completed session`,
          referenceId: booking._id.toString(),
        });
      }

      // Update mentor stats
      const mentorProfile = await MentorProfile.findOne({
        userId: booking.professionalId._id,
      });
      if (mentorProfile) {
        mentorProfile.completedSessions += 1;
        mentorProfile.totalEarnings += booking.price;

        // Update rating if feedback provided
        if (feedback?.studentRating) {
          const totalRating =
            mentorProfile.averageRating * mentorProfile.totalReviews;
          mentorProfile.totalReviews += 1;
          mentorProfile.averageRating =
            (totalRating + feedback.studentRating) / mentorProfile.totalReviews;
        }

        await mentorProfile.save();
      }

      booking.status = "completed";
      if (feedback) {
        booking.feedback = {
          ...booking.feedback,
          ...feedback,
          submittedAt: new Date(),
        };
      }

      // Return updated mentor wallet info in response
      const updatedMentorWallet = await Wallet.findOne({
        userId: booking.professionalId._id,
      });

      await booking.save();

      // Populate booking data
      await booking.populate([
        { path: "studentId", select: "firstName lastName email avatar" },
        {
          path: "professionalId",
          select: "firstName lastName email avatar title",
        },
        { path: "scheduleId" },
      ]);

      return NextResponse.json({
        success: true,
        data: booking,
        mentorWallet: updatedMentorWallet ? {
          balance: updatedMentorWallet.balance,
          totalEarned: updatedMentorWallet.totalEarned,
        } : null,
        message: `Booking ${status} successfully. Points credited to mentor wallet.`,
      });
    }

    await booking.save();

    // Populate booking data
    await booking.populate([
      { path: "studentId", select: "firstName lastName email avatar" },
      {
        path: "professionalId",
        select: "firstName lastName email avatar title",
      },
      { path: "scheduleId" },
    ]);

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
