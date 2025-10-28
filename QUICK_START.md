# 🚀 Quick Start - Mentor Booking System

## What's Been Implemented

You now have a complete mentor discovery and booking system with:
- ✅ Students can browse and book mentors
- ✅ Email approval workflow for mentors
- ✅ Automatic Zoom meeting creation
- ✅ Point-based payment system with refunds

## ⚡ Quick Setup (5 Minutes)

### 1. Add Environment Variables

Add these to your `.env` file:

```env
# Email (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Zoom
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Click "App passwords"
4. Generate password for "Mail"
5. Copy 16-digit password to `EMAIL_PASSWORD`

### 3. Get Zoom Credentials

1. Go to https://marketplace.zoom.us/develop/create
2. Create "Server-to-Server OAuth" app
3. Add scopes: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`
4. Copy credentials to .env

### 4. Create a Test Mentor

1. Start your app: `npm run dev`
2. Login as a user
3. Go to `/dashboard/mentor-setup`
4. Fill in profile details

### 5. Approve Mentor in Database

```javascript
// In MongoDB
db.mentorprofiles.updateOne(
  { userId: ObjectId("your_user_id") },
  { $set: { isApproved: true, isMentor: true } }
)
```

### 6. Create Time Slots

1. Login as mentor
2. Go to `/dashboard/mentor-schedule`
3. Create available slots

### 7. Test Booking

1. Login as different user (student)
2. Go to `/dashboard/mentors`
3. Click on mentor
4. Select time slot
5. Book session
6. **Check mentor's email** for approval request
7. Click "Approve Session" button
8. Both receive Zoom meeting links!

## 📧 The Email Flow

### When Student Books:
1. **Student receives:** "Booking request sent, pending approval"
2. **Mentor receives:** Email with Approve/Reject buttons

### When Mentor Approves:
1. Zoom meeting is created
2. **Both receive:** Email with meeting link
3. Booking status → `confirmed`

### When Mentor Rejects:
1. Points refunded to student
2. **Student receives:** Cancellation email
3. Booking status → `cancelled`

## 🔍 How to Test

### Test the Complete Flow:

```bash
# 1. Create mentor profile
→ /dashboard/mentor-setup

# 2. View all mentors (as student)
→ /dashboard/mentors

# 3. See mentor profile with available slots
→ Click on any mentor card

# 4. Book a session
→ Select slot → Add notes → Confirm

# 5. Check emails
→ Student: Confirmation email
→ Mentor: Approval request with buttons

# 6. Approve from email
→ Click "Approve Session" in email

# 7. Check emails again
→ Both: Meeting link and details
```

## 📱 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Mentors List | `/dashboard/mentors` | Browse all mentors |
| Mentor Setup | `/dashboard/mentor-setup` | Create mentor profile |
| Schedule | `/dashboard/mentor-schedule` | Create time slots |
| Sessions | `/dashboard/sessions` | View bookings |

## 🎯 Key API Endpoints

```bash
# Get approved mentors
GET /api/mentor-profile?approved=true

# Get mentor's schedules
GET /api/schedules?professionalId={id}&startDate={date}

# Create booking
POST /api/bookings

# Approve/Reject (from email)
GET /api/bookings/approve?bookingId={id}&token={token}&action=approve
```

## 🐛 Common Issues

### "Insufficient balance"
→ Check user's wallet has enough points

### "Mentor not showing"
→ Check `isApproved: true` and `isMentor: true` in database

### "Email not received"
→ Check spam folder
→ Verify EMAIL_USER and EMAIL_PASSWORD
→ For Gmail, use App Password (not regular password)

### "Zoom meeting not created"
→ Verify Zoom credentials
→ Check mentor has Zoom connected (for OAuth flow)

## 📚 Detailed Documentation

- **Complete Guide:** See `MENTOR_BOOKING_IMPLEMENTATION.md`
- **Troubleshooting:** See `BOOKING_FLOW_GUIDE.md`

## 💡 Pro Tips

1. **Test with two browser profiles:** One for mentor, one for student
2. **Use real email addresses:** To test the email flow
3. **Check database:** After each step to see changes
4. **Monitor console:** For any error messages
5. **Start simple:** Test with just one mentor first

## ✅ What's Working

- ✅ Mentor discovery and search
- ✅ Mentor profile display
- ✅ Time slot selection
- ✅ Booking creation
- ✅ Email notifications
- ✅ Approval workflow
- ✅ Zoom meeting creation
- ✅ Automatic refunds
- ✅ Beautiful email templates
- ✅ Responsive UI

## 🎉 You're Ready!

Everything is set up and ready to test. Just add your credentials and start the booking flow!

Need help? Check the detailed guides or the code comments.

