# Mentor Booking Flow Guide

## Overview
This document explains the complete mentor discovery and booking flow with email verification.

## Flow Diagram

```
Student → Browse Mentors → Select Mentor → Choose Time Slot → Book Session
    ↓
Points Deducted (Reserved)
    ↓
Approval Email Sent to Mentor → Mentor Receives Email
    ↓                                      ↓
Student Gets Confirmation          Mentor Clicks Approve/Reject
    ↓                                      ↓
                                    ┌─────┴─────┐
                                    ↓           ↓
                              APPROVE       REJECT
                                    ↓           ↓
                          Zoom Meeting      Points
                          Created          Refunded
                                ↓               ↓
                          Meeting Link     Cancellation
                          Sent to Both     Email Sent
```

## Setup Instructions

### 1. Email Configuration (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
3. Add to your `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   ```

### 2. Zoom Configuration

#### Option A: Server-to-Server OAuth (Recommended)

1. Go to https://marketplace.zoom.us/develop/create
2. Select "Server-to-Server OAuth"
3. Fill in app details
4. Add required scopes:
   - `meeting:write:admin`
   - `meeting:read:admin`
   - `user:read:admin`
5. Get your credentials and add to `.env`:
   ```
   ZOOM_ACCOUNT_ID=your_account_id
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ```

#### Option B: OAuth Flow (User-specific)

1. Create OAuth app in Zoom Marketplace
2. Set redirect URI to: `http://localhost:3000/api/mentor-profile/zoom/callback`
3. Add to `.env`:
   ```
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ZOOM_REDIRECT_URI=http://localhost:3000/api/mentor-profile/zoom/callback
   ```

### 3. Application URL

Set your application URL for email links:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, change to your actual domain.

## Testing the Booking Flow

### Step 1: Create a Mentor Profile

1. Log in as a user
2. Go to `/dashboard/mentor-setup`
3. Fill in mentor profile details:
   - Bio and expertise
   - Session types and pricing
   - Availability schedule
4. Connect Zoom (if using OAuth flow)
5. Submit profile

### Step 2: Approve Mentor (Admin)

In MongoDB, set the mentor profile to approved:
```javascript
db.mentorprofiles.updateOne(
  { userId: ObjectId("your_user_id") },
  { $set: { isApproved: true, isMentor: true } }
)
```

### Step 3: Create Available Slots

1. Log in as mentor
2. Go to `/dashboard/mentor-schedule`
3. Create available time slots
4. Make sure slots are:
   - In the future
   - `isActive: true`
   - Have available bookings

### Step 4: Student Books a Session

1. Log in as a different user (student)
2. Go to `/dashboard/mentors`
3. Browse and select a mentor
4. Choose a time slot
5. Add optional notes
6. Click "Confirm Booking"

**What happens:**
- Points are deducted from student wallet
- Booking created with status: `pending`
- Student receives confirmation email
- Mentor receives approval request email

### Step 5: Mentor Approval

The mentor receives an email with two buttons:
- ✓ **Approve Session** - Creates Zoom meeting and sends links
- ✗ **Decline Session** - Refunds points and notifies student

**If Approved:**
1. Booking status changes to `confirmed`
2. Zoom meeting is created
3. Both parties receive meeting details via email
4. Mentor earns points after session completion

**If Rejected:**
1. Booking status changes to `cancelled`
2. Student points are refunded
3. Student receives cancellation notification

## Email Templates

The system sends these emails:

### 1. Student Booking Confirmation
- **When:** Immediately after booking
- **To:** Student
- **Content:** Request sent, waiting for approval

### 2. Mentor Approval Request
- **When:** Immediately after booking
- **To:** Mentor
- **Content:** Session details with Approve/Reject buttons

### 3. Session Confirmed
- **When:** Mentor approves
- **To:** Both student and mentor
- **Content:** Zoom meeting link, session details

### 4. Session Cancelled
- **When:** Mentor rejects
- **To:** Student
- **Content:** Cancellation notice, refund confirmation

## API Endpoints

### Get Approved Mentors
```bash
GET /api/mentor-profile?approved=true
```

### Get Mentor Schedules
```bash
GET /api/schedules?professionalId={mentorId}&startDate={today}&isActive=true
```

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "studentId": "student_id",
  "professionalId": "mentor_id",
  "scheduleId": "schedule_id",
  "sessionDate": "2024-01-15",
  "sessionTime": "10:00",
  "duration": 60,
  "price": 100,
  "studentNotes": "I want to discuss...",
  "sessionType": "one-on-one"
}
```

### Approve/Reject Booking (via Email)
```bash
GET /api/bookings/approve?bookingId={id}&token={token}&action=approve
GET /api/bookings/approve?bookingId={id}&token={token}&action=reject
```

## Database Models

### Booking Model
```javascript
{
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  approvalStatus: 'pending' | 'approved' | 'rejected',
  approvalToken: 'unique-token',
  zoomMeetingId: 'zoom-meeting-id',
  zoomJoinUrl: 'https://zoom.us/j/...',
  emailSentToStudent: true/false,
  approvalEmailSent: true/false,
  // ... other fields
}
```

## Troubleshooting

### Emails Not Sending
1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. For Gmail, ensure App Password is used (not regular password)
3. Check spam folder
4. Verify email service is not blocking Node.js

### Zoom Meeting Not Created
1. Verify ZOOM credentials in .env
2. Check Zoom account has meeting creation permissions
3. For Server-to-Server: Check account ID is correct
4. For OAuth: Ensure mentor has connected Zoom account

### Approval Links Not Working
1. Check NEXT_PUBLIC_APP_URL is set correctly
2. Verify booking has approvalToken in database
3. Check if booking is already processed

### Mentor Not Showing
1. Check mentor profile: `isApproved: true` and `isMentor: true`
2. Verify user data is populated in profile
3. Check API response at `/api/mentor-profile?approved=true`

## Security Considerations

1. **Approval Tokens:** Generated with crypto.randomBytes(32) for security
2. **One-Time Use:** Tokens are validated and marked as processed
3. **Email Validation:** Only valid booking IDs and tokens work
4. **Refund Protection:** Automatic refund on rejection
5. **Token Expiry:** Consider adding expiry time for approval tokens

## Future Enhancements

- [ ] Add approval token expiry (e.g., 48 hours)
- [ ] Send reminder emails for pending approvals
- [ ] Add mentor dashboard for pending requests
- [ ] Implement calendar integration
- [ ] Add session rescheduling flow
- [ ] Add rating/review system after sessions
- [ ] Add automated session reminders (24h, 1h before)

## Support

For issues or questions, contact: support@sahay.com

