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
import {
  notifyBookingEvent,
  getFCMTokensForUser,
} from "@/lib/notification-service";
import { subscribeTokenToTopics } from "@/lib/firebase-admin";
import { addUserTopics } from "@/lib/user-notification-topics-db";
import { getMentorTopic } from "@/lib/notification-topics";
import { TRANSACTION_SOURCE, MENTOR_LEVEL } from "@/lib/constants";
import {
  deductMentorshipPoints,
  creditMentorEarnings,
  processRefund,
  validateWalletBalance,
} from "@/lib/wallet";
import {
  getMentorshipCallCost,
  calculateFirstCallPrice,
  isEligibleForFirstCallDiscount,
  type MentorLevel,
} from "@/lib/points-economy";

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
    await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const {
      studentId,
      professionalId,
      scheduleId,
      sessionDate,
      sessionTime,
      duration,
      studentNotes,
      sessionType,
    } = body;

    // Validate required fields (price is now calculated based on mentor level)
    if (
      !studentId ||
      !professionalId ||
      !scheduleId ||
      !sessionDate ||
      !sessionTime ||
      !duration
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

    // Get mentor profile with level info (required for pricing)
    const mentorProfile = await MentorProfile.findOne({
      userId: professionalId,
    }).select("+zoomAccessToken +zoomRefreshToken +level +customPointRate");

    if (!student) {
      return NextResponse.json(
        { success: false, error: `Student not found with ID: ${studentId}` },
        { status: 404 }
      );
    }

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          error: `Professional not found with ID: ${professionalId}`,
        },
        { status: 404 }
      );
    }

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: `Schedule not found with ID: ${scheduleId}` },
        { status: 404 }
      );
    }

    // Mentor profile is required for pricing calculation
    if (!mentorProfile) {
      console.warn(
        `Mentor profile not found for professional ${professionalId}. Using default L3 pricing.`
      );
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

    // Determine mentor level and calculate price
    // Mentor levels: L1 = 3000 points, L2 = 2000 points, L3 = 1000 points
    const mentorLevel = (mentorProfile?.level ||
      MENTOR_LEVEL.L3) as MentorLevel;
    const customRate = mentorProfile?.customPointRate;

    // Get base price based on mentor level
    const basePrice = customRate || getMentorshipCallCost(mentorLevel);

    // Check if this is student's first mentorship call (50% discount)
    const studentBookings = await Booking.find({
      studentId,
      status: { $in: ["confirmed", "completed"] },
    });
    const isFirstCall = isEligibleForFirstCallDiscount(
      studentBookings.map((b) => ({ status: b.status }))
    );

    // Calculate final price
    let finalPrice: number;
    let mentorReceives: number;
    let isDiscounted = false;

    if (isFirstCall) {
      const pricing = calculateFirstCallPrice(mentorLevel);
      finalPrice = customRate ? Math.floor(customRate * 0.5) : pricing.userPays;
      mentorReceives = customRate || pricing.mentorReceives;
      isDiscounted = true;
    } else {
      finalPrice = basePrice;
      mentorReceives = basePrice;
    }

    // CRITICAL VALIDATION: Validate wallet balance BEFORE any transaction
    const walletValidation = await validateWalletBalance(studentId, finalPrice);

    if (!walletValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: walletValidation.error,
          requiredPoints: finalPrice,
          currentBalance: walletValidation.currentBalance,
          shortfall: walletValidation.shortfall,
          isFirstCall,
          mentorLevel,
          pricingInfo: {
            basePrice,
            finalPrice,
            isDiscounted,
          },
        },
        { status: 400 }
      );
    }

    // Deduct points using the new economy system
    const deductResult = await deductMentorshipPoints(
      studentId,
      "", // Will be updated with booking ID
      `${professional.firstName} ${professional.lastName}`,
      mentorLevel,
      isFirstCall
    );

    if (!deductResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult.error || "Failed to process payment",
        },
        { status: 400 }
      );
    }

    // Mark student as having completed first mentorship (if applicable)
    if (isFirstCall) {
      await User.findByIdAndUpdate(studentId, {
        hasCompletedFirstMentorship: true,
      });
    }

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
      price: finalPrice, // Store the discounted price (what student paid)
      studentNotes,
      sessionType: sessionType || "one-on-one",
      status: "pending",
      paymentStatus: "paid", // Points already debited, so payment is processed
      approvalStatus: "pending",
      approvalToken,
      // Store additional pricing info for reference
      mentorLevel,
      mentorReceivesPoints: mentorReceives, // What mentor will receive on completion
      isFirstCallDiscount: isDiscounted,
    });

    // Update transaction with booking ID
    await Transaction.findOneAndUpdate(
      { userId: studentId, referenceId: "", source: TRANSACTION_SOURCE.Mentor },
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
        price: finalPrice,
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
        price: finalPrice,
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
      const dummyMeetingLink = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/meeting/${booking._id}`;
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
          price: finalPrice,
        }),
        notifyBookingEvent(studentId, "booking_request", {
          bookingId: booking._id.toString(),
          mentorName: `${professional.firstName} ${professional.lastName}`,
          sessionDate: new Date(sessionDate).toLocaleDateString(),
          sessionTime,
          price: finalPrice,
        }),
      ]);
    } catch (notifError) {
      console.error("Error sending notifications:", notifError);
      // Don't fail the booking if notifications fail
    }

    // Subscribe student to mentor topic for meeting schedule notifications
    try {
      const mentorTopic = getMentorTopic(professionalId);
      await addUserTopics(studentId, [mentorTopic]);
      const studentTokens = await getFCMTokensForUser(studentId);
      for (const { token } of studentTokens) {
        if (token) {
          await subscribeTokenToTopics(token, [mentorTopic]);
        }
      }
    } catch (subError) {
      console.error("Error subscribing student to mentor topic:", subError);
    }

    await booking.populate([
      { path: "studentId", select: "firstName lastName email avatar" },
      {
        path: "professionalId",
        select: "firstName lastName email avatar title",
      },
      { path: "scheduleId" },
    ]);

    // Build response message
    let bookingMessage =
      "Booking request sent! The mentor will review and approve your session.";
    if (isDiscounted) {
      bookingMessage = `🎉 First mentorship call! You saved ${
        basePrice - finalPrice
      } points (50% discount). ${bookingMessage}`;
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: bookingMessage,
        pricingInfo: {
          mentorLevel,
          basePrice,
          finalPrice,
          mentorReceives,
          isFirstCallDiscount: isDiscounted,
          pointsSaved: isDiscounted ? basePrice - finalPrice : 0,
        },
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

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to create booking",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
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
        const refundReason = isStudentCancellation
          ? `Cancelled mentorship session (student cancellation)`
          : `Cancelled mentorship session by mentor`;

        await processRefund(
          booking.studentId._id.toString(),
          booking._id.toString(),
          refundAmount,
          refundReason
        );

        booking.paymentStatus = "refunded";
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
        // Determine how much mentor receives
        // If first call discount was applied, mentor still receives full value
        const mentorReceivesPoints =
          (booking as unknown as { mentorReceivesPoints: number })
            .mentorReceivesPoints || booking.price;

        // Credit to mentor using the economy system
        await creditMentorEarnings(
          booking.professionalId._id.toString(),
          booking._id.toString(),
          `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          mentorReceivesPoints
        );
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
        mentorWallet: updatedMentorWallet
          ? {
              balance: updatedMentorWallet.balance,
              totalEarned: updatedMentorWallet.totalEarned,
            }
          : null,
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
