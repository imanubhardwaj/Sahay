import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import MentorProfile from '@/models/MentorProfile';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { createZoomMeeting } from '@/lib/zoom';
import { sendBookingConfirmation, sendCancellationEmail } from '@/lib/email';
import { notifyBookingEvent } from '@/lib/notification-service';
import { TRANSACTION_TYPE, TRANSACTION_SOURCE } from '@/lib/constants';

// GET - Handle approval/rejection from email link
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const token = searchParams.get('token');
    const action = searchParams.get('action'); // 'approve' or 'reject'

    if (!bookingId || !token || !action) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Request</h1>
            <p>The booking approval link is invalid or expired.</p>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'firstName lastName email')
      .populate('professionalId', 'firstName lastName email');

    if (!booking) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Booking Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Booking Not Found</h1>
            <p>The requested booking does not exist.</p>
          </div>
        </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify token
    if (booking.approvalToken !== token) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Token</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Token</h1>
            <p>The approval token is invalid. Please use the link from your email.</p>
          </div>
        </body>
        </html>
        `,
        { status: 403, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check if already processed
    if (booking.approvalStatus !== 'pending') {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Processed</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Already Processed</h1>
            <p>This booking has already been ${booking.approvalStatus}.</p>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action === 'approve') {
      // Approve the booking
      try {
        // Get mentor profile for Zoom access
        const mentorProfile = await MentorProfile.findOne({ 
          userId: booking.professionalId._id 
        }).select('+zoomAccessToken +zoomRefreshToken');

        if (!mentorProfile) {
          throw new Error('Mentor profile not found');
        }

        // Create Zoom meeting
        const sessionDateTime = new Date(`${booking.sessionDate.toISOString().split('T')[0]}T${booking.sessionTime}`);
        const zoomMeeting = await createZoomMeeting({
          topic: `Mentorship Session: ${booking.professionalId.firstName} ${booking.professionalId.lastName} & ${booking.studentId.firstName} ${booking.studentId.lastName}`,
          startTime: sessionDateTime,
          duration: booking.duration,
          timezone: mentorProfile.timezone || 'Asia/Kolkata',
          agenda: booking.studentNotes || 'Mentorship session',
          accessToken: mentorProfile.zoomAccessToken,
        });

        if (!zoomMeeting) {
          throw new Error('Failed to create Zoom meeting');
        }

        // Update booking
        booking.approvalStatus = 'approved';
        booking.approvedAt = new Date();
        booking.status = 'confirmed';
        booking.zoomMeetingId = zoomMeeting.id.toString();
        booking.zoomJoinUrl = zoomMeeting.join_url;
        booking.zoomStartUrl = zoomMeeting.start_url;
        booking.zoomPassword = zoomMeeting.password;
        await booking.save();

        // Send confirmation emails to both parties
        const emailData = {
          studentName: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          studentEmail: booking.studentId.email,
          mentorName: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
          mentorEmail: booking.professionalId.email,
          sessionDate: new Date(booking.sessionDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          sessionTime: booking.sessionTime,
          duration: booking.duration,
          zoomJoinUrl: zoomMeeting.join_url,
          sessionType: booking.sessionType || 'one-on-one',
          price: booking.price,
        };

        await sendBookingConfirmation(emailData);

        // Update email tracking
        booking.emailSentToStudent = true;
        booking.emailSentToMentor = true;
        await booking.save();

        // Send real-time notifications
        try {
          await Promise.all([
            notifyBookingEvent(booking.studentId._id.toString(), "booking_confirmed", {
              bookingId: booking._id.toString(),
              mentorName: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
              sessionDate: new Date(booking.sessionDate).toLocaleDateString(),
              sessionTime: booking.sessionTime,
              price: booking.price,
            }),
            notifyBookingEvent(booking.professionalId._id.toString(), "booking_confirmed", {
              bookingId: booking._id.toString(),
              studentName: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
              sessionDate: new Date(booking.sessionDate).toLocaleDateString(),
              sessionTime: booking.sessionTime,
              price: booking.price,
            }),
          ]);
        } catch (notifError) {
          console.error("Error sending notifications:", notifError);
        }

        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Session Approved</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
              .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
              h1 { color: #11998e; }
              .icon { font-size: 64px; margin-bottom: 20px; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✅</div>
              <h1>Session Approved!</h1>
              <p>You've successfully approved the mentorship session with <strong>${booking.studentId.firstName} ${booking.studentId.lastName}</strong>.</p>
              <p>A Zoom meeting has been created and the meeting link has been sent to both you and the student via email.</p>
              <p><strong>Session Date:</strong> ${new Date(booking.sessionDate).toLocaleDateString()}</p>
              <p><strong>Session Time:</strong> ${booking.sessionTime}</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sessions" class="button">View Your Sessions</a>
            </div>
          </body>
          </html>
          `,
          { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
      } catch (error) {
        console.error('Error approving booking:', error);
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Approval Failed</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Approval Failed</h1>
              <p>An error occurred while approving the session. Please try again or contact support.</p>
              <p><small>${(error as Error).message}</small></p>
            </div>
          </body>
          </html>
          `,
          { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
      }
    } else if (action === 'reject') {
      // Reject the booking
      try {
        // Points were already debited when booking was created
        // Refund full amount to student when mentor rejects
        if (booking.paymentStatus === 'paid') {
          const studentWallet = await Wallet.findOne({ userId: booking.studentId._id });
          if (studentWallet) {
            studentWallet.balance += booking.price;
            await studentWallet.save();

            // Create refund transaction (student earns points back)
            await Transaction.create({
              userId: booking.studentId._id,
              walletId: studentWallet._id,
              type: TRANSACTION_TYPE.Earn,
              points: booking.price,
              source: TRANSACTION_SOURCE.Mentor,
              description: `Refund for declined session with ${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
              referenceId: booking._id.toString(),
            });
          }
        }

        // Update booking
        booking.approvalStatus = 'rejected';
        booking.rejectedAt = new Date();
        booking.status = 'cancelled';
        // Only mark as refunded if payment was already processed
        if (booking.paymentStatus === 'paid') {
          booking.paymentStatus = 'refunded';
        }
        booking.cancelledBy = 'professional';
        booking.cancellationReason = 'Mentor declined the session';
        await booking.save();

        // Send rejection email to student
        await sendCancellationEmail({
          recipientName: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          recipientEmail: booking.studentId.email,
          sessionDate: new Date(booking.sessionDate).toLocaleDateString(),
          sessionTime: booking.sessionTime,
          cancelledBy: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
          reason: 'The mentor was unable to accept this session at the requested time.',
        });

        // Send real-time notification
        try {
          await notifyBookingEvent(booking.studentId._id.toString(), "booking_cancelled", {
            bookingId: booking._id.toString(),
            mentorName: `${booking.professionalId.firstName} ${booking.professionalId.lastName}`,
            sessionDate: new Date(booking.sessionDate).toLocaleDateString(),
            sessionTime: booking.sessionTime,
            price: booking.price,
          });
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
        }

        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Session Declined</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%); }
              .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
              h1 { color: #fc5c7d; }
              .icon { font-size: 64px; margin-bottom: 20px; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Session Declined</h1>
              <p>You've declined the mentorship session with <strong>${booking.studentId.firstName} ${booking.studentId.lastName}</strong>.</p>
              <p>The student has been notified and their points have been refunded.</p>
              <p><strong>Session Date:</strong> ${new Date(booking.sessionDate).toLocaleDateString()}</p>
              <p><strong>Session Time:</strong> ${booking.sessionTime}</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sessions" class="button">View Your Sessions</a>
            </div>
          </body>
          </html>
          `,
          { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
      } catch (error) {
        console.error('Error rejecting booking:', error);
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Rejection Failed</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Rejection Failed</h1>
              <p>An error occurred while declining the session. Please try again or contact support.</p>
              <p><small>${(error as Error).message}</small></p>
            </div>
          </body>
          </html>
          `,
          { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
      }
    } else {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Action</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Action</h1>
            <p>The requested action is not valid.</p>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Error processing booking approval:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
          h1 { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <p>An unexpected error occurred. Please try again later.</p>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

