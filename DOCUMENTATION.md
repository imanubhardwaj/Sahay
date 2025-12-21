# Sahay - Comprehensive Project Documentation

> **Sahay** (सहाय) - Sanskrit for "Help/Support" - A modern learning platform connecting students with mentors, providing interactive courses, coding practice, and a gamified learning experience.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [User Flow](#4-user-flow)
5. [Core Features](#5-core-features)
6. [Point System (Gamification)](#6-point-system-gamification)
7. [Database Models](#7-database-models)
8. [API Documentation](#8-api-documentation)
9. [Security Implementation](#9-security-implementation)
10. [Current Hacks & Technical Debt](#10-current-hacks--technical-debt)
11. [What's Done vs What's Left](#11-whats-done-vs-whats-left)
12. [Future Roadmap](#12-future-roadmap)
13. [Environment Variables](#13-environment-variables)
14. [Development Guide](#14-development-guide)

---

## 1. Project Overview

### What is Sahay?

Sahay is a comprehensive learning platform designed to help students and professionals:
- **Learn** through interactive modules, lessons, and quizzes
- **Practice** coding problems with an integrated code editor
- **Connect** with mentors for 1-on-1 sessions
- **Build** portfolios and showcase projects
- **Compete** on leaderboards with a points-based gamification system
- **Collaborate** through community Q&A

### Target Users

| User Type | Description | Access Level |
|-----------|-------------|--------------|
| `student_fresher` | Students just starting their tech journey | Beginner modules, community |
| `working_professional_2_3_yr` | Professionals with 2-3 years experience | Intermediate modules, mentoring |
| `experienced_professional_4_6_yr` | Senior professionals (4-6 years) | Advanced modules, can become mentors |
| `industry_expert_8_plus_yr` | Industry experts (8+ years) | All modules, mentor dashboard |
| `company` | Organizations for team training | Enterprise features (future) |

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.4 | React framework with App Router |
| React | 19.1.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Lucide React | 0.544.0 | Icons |
| Monaco Editor | 4.7.0 | Code editor for coding problems |
| Socket.io Client | 4.8.1 | Real-time features |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.5.4 | REST API endpoints |
| MongoDB | - | Database |
| Mongoose | 8.19.0 | ODM for MongoDB |
| Socket.io | 4.8.1 | Real-time server |
| Nodemailer | 7.0.10 | Email sending |
| JWT | 9.0.2 | Token authentication |
| WorkOS | 7.70.0 | Authentication provider |

### External Services
| Service | Purpose |
|---------|---------|
| WorkOS | Magic link authentication |
| Zoom API | Video meetings for mentor sessions |
| OpenAI API | Evaluating subjective/code quiz answers |
| Gmail SMTP | Email notifications |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           Frontend                               │
│   Next.js App Router (React 19 + TypeScript + Tailwind)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Pages   │  │Components│  │ Contexts │  │     Hooks        │ │
│  │ /app/*   │  │  /ui/*   │  │AuthContext│ │useAuth, useModules│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                        API Layer                                 │
│              Next.js API Routes (/app/api/*)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   /auth    │  │ /modules │  │/bookings │  │/community    │  │
│  │   /user    │  │ /lessons │  │/mentors  │  │/questions    │  │
│  │  /wallets  │  │ /quizzes │  │/schedules│  │  /posts      │  │
│  └────────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                  │
│                     MongoDB + Mongoose                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐│
│  │  User  │ │ Module │ │Booking │ │ Wallet │ │ModuleProgress  ││
│  │Wallet  │ │ Lesson │ │Schedule│ │Transact│ │LessonProgress  ││
│  │Mentor  │ │  Quiz  │ │Notif   │ │Question│ │CodingProgress  ││
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    External Services                             │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ WorkOS │  │  Zoom  │  │ OpenAI │  │  SMTP  │                │
│  │  Auth  │  │Meetings│  │ Eval   │  │ Email  │                │
│  └────────┘  └────────┘  └────────┘  └────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
sahay/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (81 endpoints)
│   │   │   ├── auth/           # Authentication (login, logout, verify-code, etc.)
│   │   │   ├── bookings/       # Mentor booking management
│   │   │   ├── modules/        # Learning modules CRUD
│   │   │   ├── get-lesson/     # Secure lesson fetching
│   │   │   ├── get-quiz/       # Secure quiz fetching
│   │   │   ├── submit-quiz/    # Quiz submission & evaluation
│   │   │   ├── save-progress/  # Lesson completion & progression
│   │   │   ├── coding-problems/# Coding practice problems
│   │   │   ├── community-questions/ # Q&A community
│   │   │   └── ...             # Many more endpoints
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── modules/        # Learning modules
│   │   │   ├── mentors/        # Mentor discovery & booking
│   │   │   ├── community/      # Community Q&A
│   │   │   ├── practice/       # Coding problems
│   │   │   ├── leaderboard/    # Rankings
│   │   │   ├── portfolio/      # Project showcase
│   │   │   └── ...
│   │   ├── login/              # Login page
│   │   ├── onboarding/         # User onboarding flow
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable components
│   │   ├── layout/             # DashboardLayout, Sidebar
│   │   └── ui/                 # Button, Input, Card, etc.
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useModules.ts
│   │   ├── useBookings.ts
│   │   ├── useCourses.ts
│   │   └── ...
│   ├── lib/                    # Utilities & services
│   │   ├── auth.ts             # Auth helpers
│   │   ├── email.ts            # Email templates & sending
│   │   ├── wallet.ts           # Wallet operations
│   │   ├── quiz-evaluation.ts  # Quiz grading logic
│   │   ├── mongodb.ts          # Database connection
│   │   └── zoom.ts             # Zoom API integration
│   └── models/                 # Mongoose models (44 models)
│       ├── User.ts
│       ├── Module.ts
│       ├── Lesson.ts
│       ├── Quiz.ts
│       ├── Booking.ts
│       └── ...
├── scripts/seed/               # Database seeding scripts
├── server.js                   # Custom server (Socket.io)
└── package.json
```

---

## 4. User Flow

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User enters email → Magic Link sent via WorkOS                  │
│         ↓                                                        │
│  User clicks link → Redirected to /auth/callback                │
│         ↓                                                        │
│  WorkOS validates → User created/fetched in MongoDB             │
│         ↓                                                        │
│  JWT token generated → Stored in cookie + localStorage          │
│         ↓                                                        │
│  Wallet created automatically (if new user)                     │
│         ↓                                                        │
│  if (!isOnboardingComplete) → /onboarding-simplified            │
│         ↓                                                        │
│  Onboarding complete → /dashboard                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Onboarding Flow

```
Step 1: User Type Selection
├── student_fresher
├── working_professional_2_3_yr
├── experienced_professional_4_6_yr
├── industry_expert_8_plus_yr
└── company

Step 2: Personal Information
├── Name, Location
├── College/University (students)
├── Company, Role, Experience (professionals)
└── Year/Major (students)

Step 3: Learning Goals
├── Primary Interest (Web Dev, ML, DevOps, etc.)
├── Experience Level
├── Time Commitment
└── Learning Style

Step 4: Skills & Interests
├── Current Skills (multi-select)
├── Interest Areas
├── Project Experience
├── Career Goals
└── Main Challenges

→ isOnboardingComplete = true
→ Redirect to Dashboard
```

### 4.3 Learning Flow (Secure Module System)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURE LEARNING FLOW                         │
│                                                                  │
│  Key Principle: Backend controls ALL progression                │
│  Client NEVER knows lesson order or can skip ahead              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Start Module                                                 │
│     └── GET /api/get-lesson?moduleId=X&userId=Y                 │
│         ├── Creates ModuleProgress if not exists                │
│         └── Returns current lesson (order determined by backend)│
│                                                                  │
│  2. Content Lesson                                              │
│     └── User reads content → Clicks "Complete"                  │
│         └── POST /api/save-progress                             │
│             ├── Validates lessonId matches current lesson       │
│             ├── Increments nextLessonOrder                      │
│             ├── Awards points to wallet                         │
│             └── Updates completionPercentage                    │
│                                                                  │
│  3. Quiz Lesson                                                 │
│     └── GET /api/get-quiz?lessonId=X                            │
│         └── Returns questions WITHOUT correct answers           │
│     └── User submits answers                                    │
│         └── POST /api/submit-quiz                               │
│             ├── Backend validates all answers                   │
│             ├── MCQ: Direct comparison                          │
│             ├── Subjective/Code: OpenAI API evaluation          │
│             └── Returns results with correct answers            │
│     └── User clicks "Next Lesson"                               │
│         └── POST /api/save-progress (same as content)           │
│                                                                  │
│  4. Module Complete                                             │
│     └── When completedLessonCount >= totalLessons               │
│         └── status = "completed"                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Security Features:**
- ✅ No lesson IDs exposed (only opaque identifiers)
- ✅ No order information sent to client
- ✅ Backend validates current lesson before completion
- ✅ Quiz answers validated server-side only
- ✅ Correct answers only sent AFTER submission

### 4.4 Mentor Booking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MENTOR BOOKING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STUDENT SIDE:                                                   │
│  1. Browse mentors at /dashboard/mentors                        │
│  2. View mentor profile (expertise, availability, pricing)      │
│  3. Select available time slot                                  │
│  4. Add notes about what to discuss                             │
│  5. Confirm booking                                             │
│     └── Points RESERVED from wallet                             │
│     └── Booking status: "pending"                               │
│     └── Approval email sent to mentor                           │
│     └── Confirmation email sent to student                      │
│                                                                  │
│  MENTOR SIDE:                                                    │
│  1. Receives email with Approve/Reject buttons                  │
│                                                                  │
│  IF APPROVED:                                                    │
│  ├── Booking status → "confirmed"                               │
│  ├── Zoom meeting created automatically                         │
│  ├── Meeting links emailed to both parties                      │
│  └── Points transferred after session completion                │
│                                                                  │
│  IF REJECTED:                                                    │
│  ├── Booking status → "cancelled"                               │
│  ├── Points REFUNDED to student                                 │
│  └── Cancellation email sent to student                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Features

### 5.1 Learning Modules

| Feature | Status | Description |
|---------|--------|-------------|
| Module Listing | ✅ Done | Browse all available modules |
| Module Progress | ✅ Done | Track completion per user |
| Sequential Lessons | ✅ Done | Enforced lesson order |
| Content Lessons | ✅ Done | Text/Code content display |
| Quiz Lessons | ✅ Done | MCQ, Subjective, Code questions |
| Quiz Evaluation | ✅ Done | MCQ auto-graded, Subjective via OpenAI |
| Points Award | ✅ Done | Points on lesson/quiz completion |
| Progress Persistence | ✅ Done | Resume from last position |

### 5.2 Mentor System

| Feature | Status | Description |
|---------|--------|-------------|
| Mentor Discovery | ✅ Done | Browse approved mentors |
| Mentor Profiles | ✅ Done | Bio, expertise, ratings |
| Schedule Management | ✅ Done | Mentors create available slots |
| Session Booking | ✅ Done | Students book slots |
| Email Approval | ✅ Done | Mentor approves via email |
| Zoom Integration | ✅ Done | Auto-create Zoom meetings |
| Points Payment | ✅ Done | Points deducted for sessions |
| Session Feedback | 🔄 Partial | Rating/review system basic |

### 5.3 Coding Practice

| Feature | Status | Description |
|---------|--------|-------------|
| Problem Listing | ✅ Done | Browse coding problems |
| Difficulty Levels | ✅ Done | Easy, Medium, Hard |
| Code Editor | ✅ Done | Monaco editor integration |
| Multi-Language | ✅ Done | JavaScript, Python, TypeScript |
| Test Cases | ✅ Done | Visible + hidden test cases |
| Auto Evaluation | ⚠️ Basic | Output comparison only |
| Progress Tracking | ✅ Done | Solved/Attempted status |

### 5.4 Community Q&A

| Feature | Status | Description |
|---------|--------|-------------|
| Ask Questions | ✅ Done | Title, body, tags |
| Answer Questions | ✅ Done | Community can answer |
| Upvote/Downvote | ✅ Done | Reputation system |
| Tags | ✅ Done | Organize by topic |
| Search | 🔄 Basic | Title search only |
| Mark Resolved | ✅ Done | Question resolution |

### 5.5 Portfolio

| Feature | Status | Description |
|---------|--------|-------------|
| Add Projects | ✅ Done | Title, description, links |
| Tech Stack | ✅ Done | Tag technologies used |
| GitHub Links | ✅ Done | Link to repositories |
| Live Demo | ✅ Done | Link to deployments |
| Public Profile | 🔄 Partial | Basic public view |

### 5.6 Leaderboard

| Feature | Status | Description |
|---------|--------|-------------|
| Points Ranking | ✅ Done | Sorted by total points |
| Achievement Levels | ✅ Done | Beginner → Master |
| Badges | ✅ Done | Visual achievements |
| User's Rank | ✅ Done | Show current user position |
| Timeframe Filter | 🔄 UI Only | All/Month/Week (not filtered) |

---

## 6. Point System (Gamification)

### 6.1 Earning Points

| Activity | Points | Frequency |
|----------|--------|-----------|
| Complete Content Lesson | 10-50 pts | Per lesson |
| Pass Quiz | 10-100 pts | Per quiz (based on score) |
| Solve Coding Problem (Easy) | 10 pts | Per problem |
| Solve Coding Problem (Medium) | 20 pts | Per problem |
| Solve Coding Problem (Hard) | 30 pts | Per problem |
| Complete Module | Bonus 50 pts | Per module |
| Answer Community Question | 5 pts | Per answer |
| Answer Upvoted | 2 pts | Per upvote |

### 6.2 Spending Points

| Activity | Cost | Description |
|----------|------|-------------|
| Book Mentor Session | 50-200 pts | Based on mentor rate |
| Quick Session (15 min) | ~50 pts | Short consultation |
| Detailed Session (60 min) | ~150 pts | Full mentoring |

### 6.3 Achievement Levels

| Level | Points Required | Badge |
|-------|-----------------|-------|
| Beginner | 0 | 🌱 |
| Intermediate | 100 | 📈 |
| Advanced | 200 | 🚀 |
| Expert | 500 | 🎯 |
| Master | 1000 | 👑 |

### 6.4 Wallet System

```typescript
// Wallet Schema
{
  userId: ObjectId,      // User reference
  balance: Number,       // Current available points
  totalEarned: Number,   // Lifetime earnings
  totalSpent: Number     // Lifetime spending
}

// Transaction Schema
{
  userId: ObjectId,
  walletId: ObjectId,
  type: "earn" | "redeem",
  points: Number,
  source: "quiz" | "lesson" | "mentor" | "referral" | "bonus",
  description: String,
  referenceId: String    // Related entity ID
}
```

---

## 7. Database Models

### 7.1 Core Models

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER MODELS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                    Wallet                  MentorProfile   │
│  ├── firstName           ├── userId             ├── userId      │
│  ├── lastName            ├── balance            ├── isMentor    │
│  ├── email              ├── totalEarned        ├── isApproved  │
│  ├── username           └── totalSpent         ├── bio         │
│  ├── workosId                                   ├── expertise   │
│  ├── userType           Transaction            ├── hourlyRate  │
│  ├── role               ├── userId             ├── sessionTypes│
│  ├── walletId           ├── type               ├── zoomConnected│
│  ├── isOnboardingComplete├── points             ├── averageRating│
│  └── selectedModules    ├── source             └── totalSessions│
│                         └── description                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING MODELS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Module                  Lesson                  Quiz            │
│  ├── name               ├── name                ├── name        │
│  ├── description        ├── content             ├── description │
│  ├── level              ├── contentArray        ├── duration    │
│  ├── skillId            ├── type (Text/Code)    ├── moduleId    │
│  ├── duration           ├── moduleId            ├── lessonId    │
│  ├── points             ├── order (INTERNAL)    └── points      │
│  └── lessonsCount       └── points                               │
│                                                                  │
│  Question                ModuleProgress          LessonProgress  │
│  ├── questionText        ├── userId             ├── userId      │
│  ├── type (mcq/subj/code)├── moduleId           ├── lessonId    │
│  ├── options []          ├── nextLessonOrder    ├── status      │
│  ├── answer              ├── completedLessons   ├── pointsEarned│
│  ├── explanation         ├── completionPercentage├── attempts   │
│  └── points              └── pointsEarned       └── completedAt │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING MODELS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Schedule                Booking                 Notification    │
│  ├── professionalId      ├── studentId          ├── userId      │
│  ├── title               ├── professionalId     ├── type        │
│  ├── date                ├── scheduleId         ├── title       │
│  ├── startTime           ├── status             ├── message     │
│  ├── endTime             ├── approvalStatus     ├── read        │
│  ├── duration            ├── sessionDate        └── createdAt   │
│  ├── price               ├── price                               │
│  ├── maxBookings         ├── zoomJoinUrl                        │
│  └── isActive            └── approvalToken                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   COMMUNITY MODELS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CommunityQuestion       CodingProblem          Post            │
│  ├── title               ├── title              ├── title       │
│  ├── body                ├── description        ├── body        │
│  ├── tags                ├── difficulty         ├── userId      │
│  ├── askedBy             ├── category           ├── communityId │
│  ├── answers []          ├── starterCode        └── reactions   │
│  ├── upvotes             ├── testCases []                       │
│  └── isResolved          └── points                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Complete Model List (44 Models)

| Model | Purpose |
|-------|---------|
| User | User accounts |
| Wallet | Points balance |
| Transaction | Point transactions |
| MentorProfile | Mentor-specific data |
| Module | Learning modules |
| Lesson | Module lessons |
| Quiz | Lesson quizzes |
| Question | Quiz questions |
| ModuleProgress | User's module progress |
| LessonProgress | User's lesson progress |
| Schedule | Mentor availability |
| Booking | Session bookings |
| Notification | User notifications |
| CommunityQuestion | Q&A questions |
| CodingProblem | Coding challenges |
| UserCodingProgress | Coding problem progress |
| Post | Community posts |
| PostComment | Post comments |
| PostReaction | Post reactions |
| Project | User projects |
| Skill | Skills/technologies |
| Community | Community groups |
| College | Educational institutions |
| Company | Companies |
| Attachment | File attachments |
| ...and more |

---

## 8. API Documentation

### 8.1 Authentication APIs

```
POST /api/auth/magiclink    - Send magic link email
GET  /api/auth/callback     - Handle WorkOS callback
POST /api/auth/verify-code  - Verify email code
GET  /api/auth/token        - Get JWT token
POST /api/auth/logout       - Clear session
```

### 8.2 User APIs

```
GET  /api/user?current=true - Get current user
PUT  /api/user              - Update user profile
GET  /api/user/points       - Get user's points
GET  /api/user/rank         - Get user's leaderboard rank
GET  /api/users             - List all users (admin)
```

### 8.3 Learning APIs (Secure)

```
# Module Management
GET  /api/modules           - List all modules
GET  /api/modules/:id       - Get module details

# Secure Learning Flow (NO ORDER EXPOSED)
GET  /api/get-lesson        - Get current lesson for user
GET  /api/get-quiz          - Get quiz questions (no answers)
POST /api/submit-quiz       - Submit quiz, get results
POST /api/save-progress     - Complete lesson, advance

# Progress Tracking
GET  /api/module-progress   - Get user's module progress
GET  /api/module-state      - Get current module state
```

### 8.4 Mentor APIs

```
GET  /api/mentor-profile    - Get mentor profiles
POST /api/mentor-profile    - Create mentor profile
PUT  /api/mentor-profile    - Update mentor profile
GET  /api/schedules         - Get mentor schedules
POST /api/schedules         - Create schedule slot
GET  /api/bookings          - Get bookings
POST /api/bookings          - Create booking
GET  /api/bookings/approve  - Approve/reject booking (email link)
```

### 8.5 Community APIs

```
GET  /api/community-questions     - List questions
POST /api/community-questions     - Ask question
GET  /api/community-questions/:id - Get question details
POST /api/community-questions/:id/comment - Answer question
POST /api/community-questions/:id/upvote  - Upvote question
```

### 8.6 Coding APIs

```
GET  /api/coding-problems   - List problems
POST /api/coding-problems/submit - Submit solution
```

---

## 9. Security Implementation

### 9.1 Authentication Security

```typescript
// JWT Token Validation (src/lib/auth.ts)
export async function getUserIdFromRequest(request: NextRequest) {
  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  }
  
  // 2. Fallback to cookie
  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  }
  
  return null;
}
```

### 9.2 Learning Flow Security

**Old System (INSECURE):**
```typescript
// ❌ Client could manipulate order
GET /api/lessons?orderNo=99  // Skip to any lesson
```

**New System (SECURE):**
```typescript
// ✅ Backend determines which lesson
GET /api/get-lesson?moduleId=X&userId=Y
// Returns lesson based on moduleProgress.nextLessonOrder

// ✅ Backend validates completion
POST /api/save-progress
// Only allows completing CURRENT lesson (validates lessonId)
```

### 9.3 Quiz Security

**Questions API (No answers exposed):**
```typescript
// Questions returned WITHOUT correct answers
const questions = quizQuestions.map((q) => ({
  _id: q._id,
  question: q.questionText,
  type: q.type,
  options: q.options?.map((opt) => ({
    _id: opt.id,
    text: opt.content,
    // NO isCorrect field!
  })),
}));
```

**Answer Validation (Server-side only):**
```typescript
// Backend compares answers
const isCorrect = userAnswer.optionId === question.answer.optionId;
```

### 9.4 Booking Security

```typescript
// Secure approval tokens
const approvalToken = crypto.randomBytes(32).toString('hex');

// One-time use validation
if (booking.approvalStatus !== 'pending') {
  return { error: 'Already processed' };
}
```

---

## 10. Current Hacks & Technical Debt

### 🔴 Critical - Should Fix Immediately

| Issue | Location | Description | Fix Priority |
|-------|----------|-------------|--------------|
| **TODO: Remove quiz bypass** | `src/app/api/get-quiz/route.ts:68` | Allows quiz access without module progress | **HIGH** |
| **Console logs in production** | 374 instances across 79 API files | Performance & security concern | **HIGH** |
| **Passing score = 0%** | `src/app/api/submit-quiz/route.ts:223` | Always passes quiz regardless of score | **MEDIUM** |

### 🟡 Medium - Technical Debt

| Issue | Location | Description |
|-------|----------|-------------|
| **Hardcoded default icon URL** | `src/app/dashboard/page.tsx:16` | External URL for missing icons |
| **Fallback to local modules** | `src/app/dashboard/page.tsx:140` | Redundant fallback logic |
| **Points polling every 30s** | `src/contexts/AuthContext.tsx:202` | Could use WebSocket instead |
| **Sleep for replication** | `src/app/api/save-progress/route.ts:252` | 100ms wait after save |
| **Missing validation** | Various | Some endpoints lack input validation |

### 🟢 Low - Improvements

| Issue | Description |
|-------|-------------|
| **No rate limiting** | APIs vulnerable to abuse |
| **No pagination** | Large lists load all at once |
| **No caching** | Every request hits database |
| **Timeframe filter UI only** | Leaderboard filters don't actually filter |

### Code to Remove

```typescript
// src/app/api/get-quiz/route.ts - Lines 67-74
// TODO: Remove this bypass in production
if (!moduleProgress) {
  console.log(
    "No module progress found, creating temporary progress for testing"
  );
  // Create a temporary module progress for testing
}

// src/app/api/submit-quiz/route.ts - Lines 223-224
const passingScore = 0; // REMOVED 70% requirement - any score passes
const isPassed = true; // Always pass - just completing the quiz is enough
```

---

## 11. What's Done vs What's Left

### ✅ Completed Features

#### Core Infrastructure
- [x] Next.js 15 with App Router
- [x] MongoDB with Mongoose ODM
- [x] WorkOS Magic Link Authentication
- [x] JWT Token Management
- [x] Custom server with Socket.io

#### User Management
- [x] User registration/login
- [x] Onboarding flow (5 user types)
- [x] User profiles
- [x] Wallet system
- [x] Points & transactions

#### Learning System
- [x] Module CRUD
- [x] Lesson CRUD
- [x] Quiz system (MCQ, Subjective, Code)
- [x] Secure sequential learning
- [x] Progress tracking
- [x] Points award on completion
- [x] OpenAI integration for subjective grading

#### Mentor System
- [x] Mentor profile creation
- [x] Schedule management
- [x] Booking system
- [x] Email notifications
- [x] Zoom meeting creation
- [x] Approval workflow

#### Community
- [x] Q&A questions/answers
- [x] Upvoting system
- [x] Tags
- [x] Posts & reactions

#### Coding Practice
- [x] Problem listing
- [x] Monaco code editor
- [x] Test case execution
- [x] Progress tracking

#### Gamification
- [x] Points system
- [x] Leaderboard
- [x] Achievement levels
- [x] Badges

### 🔄 Partially Done

| Feature | Status | Remaining Work |
|---------|--------|----------------|
| Session Feedback | 60% | Rating/review after session |
| Public Profiles | 40% | Shareable profile pages |
| Search | 30% | Advanced search across content |
| Notifications | 50% | Real-time via Socket.io |
| Admin Dashboard | 20% | User/content management |

### ❌ Not Started

#### Phase 2 Features
- [ ] Video content integration
- [ ] Live coding sessions
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered recommendations

#### Phase 3 Features
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Certification system
- [ ] Job placement integration
- [ ] Multi-language support

---

## 12. Future Roadmap

### Phase 1: Bug Fixes & Polish (1-2 weeks)
1. Remove quiz bypass hack
2. Implement proper passing score (70%)
3. Remove all console.log statements
4. Add proper error handling
5. Implement input validation
6. Add rate limiting

### Phase 2: Feature Completion (2-4 weeks)
1. Complete session feedback system
2. Real-time notifications via Socket.io
3. Public shareable profiles
4. Advanced search (Elasticsearch?)
5. Admin dashboard for content management
6. Session reminders (24h, 1h before)

### Phase 3: Scalability (1-2 months)
1. Add Redis caching
2. Implement pagination everywhere
3. Database indexing optimization
4. CDN for static assets
5. Serverless function optimization

### Phase 4: New Features (2-3 months)
1. Video lesson support
2. Live coding sessions
3. AI-powered recommendations
4. Certification system
5. Job board integration

### Phase 5: Mobile & Enterprise (3-6 months)
1. React Native mobile app
2. Enterprise team management
3. SSO integration
4. Analytics & reporting
5. White-label solution

---

## 13. Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication (WorkOS)
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...

# JWT
JWT_SECRET=your-super-secret-key

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# Zoom Integration
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# OpenAI (for quiz evaluation)
OPENAI_API_KEY=sk-...
# or
NEXT_OPEN_AI_API_KEY=sk-...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 14. Development Guide

### Getting Started

```bash
# Clone repository
git clone <repository-url>
cd sahay

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

### Database Seeding

```bash
# Seed all data
pnpm seed

# Clear and reseed
pnpm seed:clear
```

### API Testing

```bash
# Test authentication
curl http://localhost:3000/api/user?current=true

# Test modules
curl http://localhost:3000/api/modules

# Test with auth header
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/modules
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth state management |
| `src/lib/auth.ts` | JWT verification |
| `src/lib/wallet.ts` | Points operations |
| `src/lib/quiz-evaluation.ts` | Quiz grading logic |
| `src/app/api/get-lesson/route.ts` | Secure lesson fetch |
| `src/app/api/save-progress/route.ts` | Lesson completion |
| `src/app/api/submit-quiz/route.ts` | Quiz submission |

---

## Summary

**Sahay is a comprehensive learning platform with:**
- ✅ Secure learning system with backend-controlled progression
- ✅ Points-based gamification
- ✅ Mentor booking with email approval
- ✅ Community Q&A
- ✅ Coding practice

**Key Technical Decisions:**
- Sequential learning enforced by backend (not client)
- Quiz answers validated server-side only
- Points system integrated with wallet
- Email-based mentor approval flow
- OpenAI for subjective answer evaluation

**Main Technical Debt:**
- Quiz bypass for testing (must remove)
- 374 console.log statements
- No passing score for quizzes
- Polling instead of WebSocket for real-time

**Next Steps:**
1. Fix critical security issues
2. Complete partial features
3. Add missing validations
4. Implement caching & pagination
5. Build mobile app

---

*Documentation last updated: December 2024*
*Project Version: 0.1.0*


