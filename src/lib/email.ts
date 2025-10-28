import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface BookingEmailData {
  studentName: string;
  studentEmail: string;
  mentorName: string;
  mentorEmail: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  zoomJoinUrl: string;
  sessionType: string;
  price: number;
}

interface CancellationEmailData {
  recipientName: string;
  recipientEmail: string;
  sessionDate: string;
  sessionTime: string;
  cancelledBy: string;
  reason?: string;
}

interface ApprovalRequestEmailData {
  mentorName: string;
  mentorEmail: string;
  studentName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  price: number;
  studentNotes?: string;
  bookingId: string;
  approvalToken: string;
}

interface BookingRequestConfirmationData {
  studentName: string;
  studentEmail: string;
  mentorName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  price: number;
}

interface ReminderEmailData {
  recipientName: string;
  recipientEmail: string;
  sessionDate: string;
  sessionTime: string;
  zoomJoinUrl: string;
  duration: number;
  role: 'student' | 'mentor';
}

// Email Templates
const bookingConfirmationStudentTemplate = (data: BookingEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #667eea; margin: 0; font-size: 28px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: 600; color: #6c757d; }
    .detail-value { color: #212529; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your mentorship session is scheduled</p>
      </div>
      
      <p>Hi ${data.studentName},</p>
      <p>Great news! Your mentorship session with <strong>${data.mentorName}</strong> has been confirmed.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${data.sessionDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${data.sessionTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Session Type:</span>
          <span class="detail-value">${data.sessionType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Points Deducted:</span>
          <span class="detail-value">${data.price} points</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.zoomJoinUrl}" class="button">Join Zoom Meeting</a>
      </div>
      
      <p><strong>Meeting Link:</strong> <a href="${data.zoomJoinUrl}">${data.zoomJoinUrl}</a></p>
      
      <p><strong>Tips for a great session:</strong></p>
      <ul>
        <li>Join 5 minutes early to test your audio/video</li>
        <li>Prepare any questions you want to discuss</li>
        <li>Have a notebook ready for notes</li>
        <li>Be in a quiet environment</li>
      </ul>
      
      <div class="footer">
        <p>Need to cancel? Please do so at least 24 hours in advance.</p>
        <p>Questions? Contact us at support@sahay.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const bookingConfirmationMentorTemplate = (data: BookingEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #11998e; margin: 0; font-size: 28px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: 600; color: #6c757d; }
    .detail-value { color: #212529; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>💼 New Session Booked!</h1>
        <p>You have a new mentorship session</p>
      </div>
      
      <p>Hi ${data.mentorName},</p>
      <p>A new mentorship session has been booked with <strong>${data.studentName}</strong>.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">👤 Student:</span>
          <span class="detail-value">${data.studentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${data.sessionDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${data.sessionTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Session Type:</span>
          <span class="detail-value">${data.sessionType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Earnings:</span>
          <span class="detail-value">${data.price} points</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.zoomJoinUrl}" class="button">Start Zoom Meeting</a>
      </div>
      
      <p><strong>Host Meeting Link:</strong> <a href="${data.zoomJoinUrl}">${data.zoomJoinUrl}</a></p>
      
      <p><strong>Session preparation:</strong></p>
      <ul>
        <li>Review the student's profile and goals</li>
        <li>Prepare relevant materials or resources</li>
        <li>Join 5 minutes early</li>
        <li>Create a welcoming environment</li>
      </ul>
      
      <div class="footer">
        <p>Earnings will be credited to your wallet after session completion.</p>
        <p>Questions? Contact us at support@sahay.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const reminderTemplate = (data: ReminderEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #f5576c; margin: 0; font-size: 28px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>⏰ Session Reminder</h1>
        <p>Your session is coming up soon!</p>
      </div>
      
      <p>Hi ${data.recipientName},</p>
      
      <div class="alert">
        <strong>📅 Date:</strong> ${data.sessionDate}<br>
        <strong>🕐 Time:</strong> ${data.sessionTime}<br>
        <strong>⏱️ Duration:</strong> ${data.duration} minutes
      </div>
      
      <div style="text-align: center;">
        <a href="${data.zoomJoinUrl}" class="button">Join Now</a>
      </div>
      
      <p><strong>Quick reminders:</strong></p>
      <ul>
        <li>Test your audio and video before joining</li>
        <li>Be in a quiet environment</li>
        <li>Have your questions/materials ready</li>
      </ul>
      
      <div class="footer">
        <p>See you soon! 👋</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const cancellationTemplate = (data: CancellationEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #6c757d; }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #dc3545; margin: 0; font-size: 28px; }
    .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; color: #721c24; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>❌ Session Cancelled</h1>
      </div>
      
      <p>Hi ${data.recipientName},</p>
      <p>We're writing to inform you that your mentorship session has been cancelled.</p>
      
      <div class="alert">
        <strong>📅 Session Date:</strong> ${data.sessionDate}<br>
        <strong>🕐 Session Time:</strong> ${data.sessionTime}<br>
        <strong>🔄 Cancelled by:</strong> ${data.cancelledBy}
        ${data.reason ? `<br><strong>📝 Reason:</strong> ${data.reason}` : ''}
      </div>
      
      <p>If applicable, your points have been refunded to your wallet.</p>
      
      <div class="footer">
        <p>Feel free to book another session anytime!</p>
        <p>Questions? Contact us at support@sahay.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const approvalRequestTemplate = (data: ApprovalRequestEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #667eea; margin: 0; font-size: 28px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: 600; color: #6c757d; }
    .detail-value { color: #212529; }
    .button { display: inline-block; padding: 14px 32px; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; text-align: center; }
    .button-approve { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .button-reject { background: linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%); }
    .button-container { text-align: center; margin: 30px 0; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #856404; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>📬 New Session Request</h1>
        <p>You have a new mentorship session booking!</p>
      </div>
      
      <p>Hi ${data.mentorName},</p>
      <p><strong>${data.studentName}</strong> has requested a mentorship session with you. Please review the details and approve or decline.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">👤 Student:</span>
          <span class="detail-value">${data.studentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${data.sessionDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${data.sessionTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Session Type:</span>
          <span class="detail-value">${data.sessionType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Earnings:</span>
          <span class="detail-value">${data.price} points</span>
        </div>
      </div>
      
      ${data.studentNotes ? `
        <div class="alert">
          <strong>📝 Student's Message:</strong><br>
          ${data.studentNotes}
        </div>
      ` : ''}
      
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bookings/approve?bookingId=${data.bookingId}&token=${data.approvalToken}&action=approve" class="button button-approve">
          ✓ Approve Session
        </a>
        <br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bookings/approve?bookingId=${data.bookingId}&token=${data.approvalToken}&action=reject" class="button button-reject">
          ✗ Decline Session
        </a>
      </div>
      
      <div class="alert">
        <strong>⚠️ Important:</strong> If you approve, a Zoom meeting will be automatically created and the meeting link will be sent to both you and the student. Earnings will be credited after session completion.
      </div>
      
      <div class="footer">
        <p>This is an automated request. Please respond by clicking one of the buttons above.</p>
        <p>Questions? Contact us at support@sahay.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email sending functions
export async function sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Send to student
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.studentEmail,
      subject: '🎉 Your Mentorship Session is Confirmed!',
      html: bookingConfirmationStudentTemplate(data),
    });

    // Send to mentor
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.mentorEmail,
      subject: '💼 New Session Booked!',
      html: bookingConfirmationMentorTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendSessionReminder(data: ReminderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.recipientEmail,
      subject: '⏰ Your Session Starts Soon!',
      html: reminderTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending reminder:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendCancellationEmail(data: CancellationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.recipientEmail,
      subject: '❌ Session Cancelled',
      html: cancellationTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: (error as Error).message };
  }
}

const bookingRequestConfirmationTemplate = (data: BookingRequestConfirmationData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #667eea; margin: 0; font-size: 28px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: 600; color: #6c757d; }
    .detail-value { color: #212529; }
    .alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px; color: #0c5460; }
    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>📝 Booking Request Sent!</h1>
        <p>Your session request is pending mentor approval</p>
      </div>
      
      <p>Hi ${data.studentName},</p>
      <p>Your mentorship session request with <strong>${data.mentorName}</strong> has been successfully sent!</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">👤 Mentor:</span>
          <span class="detail-value">${data.mentorName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${data.sessionDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${data.sessionTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Session Type:</span>
          <span class="detail-value">${data.sessionType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Points Reserved:</span>
          <span class="detail-value">${data.price} points</span>
        </div>
      </div>
      
      <div class="alert">
        <strong>⏳ What's Next?</strong><br>
        • The mentor will review your request<br>
        • You'll receive an email notification with the decision<br>
        • If approved, you'll get the Zoom meeting link<br>
        • If declined, your points will be automatically refunded
      </div>
      
      <p><strong>Note:</strong> ${data.price} points have been reserved from your wallet. They will be refunded if the mentor declines your request.</p>
      
      <div class="footer">
        <p>We'll notify you as soon as the mentor responds!</p>
        <p>Questions? Contact us at support@sahay.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendApprovalRequest(data: ApprovalRequestEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.mentorEmail,
      subject: '📬 New Session Request - Action Required',
      html: approvalRequestTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending approval request:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendBookingRequestConfirmation(data: BookingRequestConfirmationData): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Sahay Mentorship" <${process.env.EMAIL_USER}>`,
      to: data.studentEmail,
      subject: '✅ Session Request Sent - Pending Approval',
      html: bookingRequestConfirmationTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending booking request confirmation:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server verification failed:', error);
    return false;
  }
}

