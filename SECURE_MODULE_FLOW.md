# Secure Module-Lesson-Quiz Flow

## Overview

This document describes the secure implementation of the module learning flow where **all progression logic is handled on the backend** and **no order or sequential information is exposed to the client**.

## Security Principles

1. **No Order Exposure**: The frontend never knows or sends lesson order numbers
2. **Backend-Controlled Progression**: The backend determines which lesson to show next based on user progress
3. **Opaque Identifiers**: Only MongoDB ObjectIds are shared with the frontend (lessonId, moduleId)
4. **Validated State Transitions**: The backend validates that users can only complete the current lesson

## API Flow

### 1. Get Current Lesson (`GET /api/get-lesson`)

**Purpose**: Fetch the current lesson based on user's progress

**Request Parameters**:
- `moduleId`: The module ID
- `userId`: The user ID

**Backend Logic**:
```typescript
// Backend determines which lesson to return
const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
const currentLessonOrder = moduleProgress.nextLessonOrder; // Backend only

// Find lesson by order (not exposed to client)
const lesson = await Lesson.findOne({ moduleId, order: currentLessonOrder });

// Return lesson WITHOUT order information
return {
  module: { _id, name, description, level, totalLessons },
  lesson: { _id, title, type, content, hasQuiz, isCompleted },
  progress: { completedLessonCount, completionPercentage, pointsEarned }
};
```

**Response**:
```json
{
  "success": true,
  "data": {
    "module": {
      "_id": "...",
      "name": "Learn React",
      "description": "...",
      "level": "Beginner",
      "totalLessons": 10
    },
    "lesson": {
      "_id": "...",
      "title": "Introduction to React",
      "type": "Text",
      "content": "...",
      "hasQuiz": true,
      "isCompleted": false
    },
    "progress": {
      "completedLessonCount": 3,
      "completionPercentage": 30,
      "pointsEarned": 150
    },
    "hasMoreLessons": true
  }
}
```

**Security**: No `order`, `nextOrder`, or sequential information is exposed.

---

### 2. Get Quiz Questions (`GET /api/get-quiz`)

**Purpose**: Fetch quiz questions for a specific lesson

**Request Parameters**:
- `lessonId`: The lesson ID (opaque identifier)
- `userId`: The user ID

**Backend Logic**:
```typescript
// Find lesson by lessonId (NOT by order)
const lesson = await Lesson.findById(lessonId);

// Get quiz questions WITHOUT correct answers
const questions = await Question.find({ lessonId }).select('-answer.optionId');

return {
  quiz: { _id, title, description, totalQuestions, totalPoints },
  questions: [{ _id, question, type, points, options }], // No correct answers
  lesson: { _id, title, type }
};
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "...",
      "title": "React Basics Quiz",
      "totalQuestions": 5,
      "totalPoints": 50
    },
    "questions": [
      {
        "_id": "...",
        "question": "What is JSX?",
        "type": "mcq",
        "points": 10,
        "options": [
          { "_id": "opt1", "text": "JavaScript XML" },
          { "_id": "opt2", "text": "Java Syntax Extension" }
        ]
      }
    ]
  }
}
```

**Security**: Correct answers are NOT sent to the client. Validation happens on the backend.

---

### 3. Submit Quiz (`POST /api/submit-quiz`)

**Purpose**: Validate quiz answers and return results (does NOT advance progress)

**Request Body**:
```json
{
  "userId": "...",
  "moduleId": "...",
  "lessonId": "...",
  "answers": [
    { "questionId": "...", "optionId": "..." },
    { "questionId": "...", "content": "..." }
  ]
}
```

**Backend Logic**:
```typescript
// Validate answers on backend
const questions = await Question.find({ lessonId });
const results = questions.map(question => {
  const userAnswer = answers.find(a => a.questionId === question._id);
  const isCorrect = validateAnswer(question, userAnswer); // Backend validation
  return { isCorrect, earnedPoints, explanation, correctAnswer };
});

// Save attempt but DON'T advance progress yet
await LessonProgress.updateOne({ userId, lessonId }, {
  attempts: $inc(1),
  pointsEarned: Math.max(earnedPoints)
});

// Return results WITHOUT advancing to next lesson
return { quizResults, questionResults, feedback };
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quizResults": {
      "totalQuestions": 5,
      "totalPoints": 50,
      "earnedPoints": 40,
      "scorePercentage": 80,
      "isPassed": true,
      "attempts": 1
    },
    "questionResults": [
      {
        "questionId": "...",
        "question": "What is JSX?",
        "isCorrect": true,
        "earnedPoints": 10,
        "userAnswer": "JavaScript XML",
        "correctAnswer": "JavaScript XML",
        "explanation": "JSX stands for JavaScript XML..."
      }
    ],
    "feedback": "🎉 Congratulations! You passed the quiz!",
    "message": "Quiz completed! Click 'Next Lesson' to continue."
  }
}
```

**Security**: 
- Answers are validated on the backend, not the client
- Progress is NOT advanced yet (user must explicitly continue)
- No order information is exposed

---

### 4. Save Progress (`POST /api/save-progress`)

**Purpose**: Mark lesson as complete and advance to next lesson

**Request Body**:
```json
{
  "userId": "...",
  "moduleId": "...",
  "lessonId": "..."
}
```

**Backend Logic**:
```typescript
// Verify lesson is the CURRENT lesson (security check)
const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
const currentLesson = await Lesson.findOne({ 
  moduleId, 
  order: moduleProgress.nextLessonOrder 
});

if (currentLesson._id.toString() !== lessonId) {
  throw new Error('Invalid lesson. You can only complete the current lesson.');
}

// Mark lesson as complete
if (!moduleProgress.completedLessons.includes(lessonId)) {
  moduleProgress.completedLessons.push(lessonId);
  moduleProgress.completedLessonCount += 1;
  
  // Award points to wallet
  const pointsAwarded = lessonProgress?.pointsEarned || lesson.points;
  await awardPoints(userId, pointsAwarded);
}

// Advance to next lesson
moduleProgress.nextLessonOrder = currentLesson.order + 1;

// Update completion percentage
moduleProgress.completionPercentage = 
  (moduleProgress.completedLessonCount / totalLessons) * 100;

await moduleProgress.save();

return { 
  lessonCompleted, 
  pointsAwarded, 
  progress: { completedLessonCount, completionPercentage, moduleCompleted } 
};
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lessonCompleted": true,
    "pointsAwarded": 40,
    "progress": {
      "completedLessonCount": 4,
      "completionPercentage": 40,
      "pointsEarned": 190,
      "moduleCompleted": false
    },
    "message": "✅ Lesson completed! 40 points earned."
  }
}
```

**Security**:
- Backend validates that the lesson being completed is the current lesson
- Users cannot skip ahead or complete lessons out of order
- All progression logic is backend-controlled
- No order information is exposed in response

---

## Frontend Flow

### User Journey

1. **Load Module Page**
   - Frontend calls `GET /api/get-lesson?moduleId=X&userId=Y`
   - Backend returns current lesson (determined by `nextLessonOrder`)
   - Frontend displays lesson content

2. **Complete Content or Take Quiz**
   - If lesson has quiz: User clicks "Take Quiz"
   - Frontend calls `GET /api/get-quiz?lessonId=X&userId=Y`
   - User answers questions
   - Frontend calls `POST /api/submit-quiz` with answers
   - Backend validates and returns results

3. **View Results and Continue**
   - User sees quiz results/lesson completion
   - User clicks "Next Lesson" button
   - Frontend calls `POST /api/save-progress` with lessonId
   - Backend marks lesson complete and advances progress

4. **Load Next Lesson**
   - Frontend calls `GET /api/get-lesson` again (step 1)
   - Backend automatically returns the next lesson

### Key Frontend Changes

**Before (Insecure)**:
```typescript
// ❌ Frontend tracks order
const [currentOrder, setCurrentOrder] = useState(1);
await fetch(`/api/get-lesson?moduleId=${id}&orderNo=${currentOrder}`);

// ❌ Frontend increments order
setCurrentOrder(currentOrder + 1);
```

**After (Secure)**:
```typescript
// ✅ Frontend only tracks lessonId (opaque)
const [currentLesson, setCurrentLesson] = useState<{ _id: string }>(null);
await fetch(`/api/get-lesson?moduleId=${id}&userId=${userId}`);

// ✅ Backend determines next lesson
await fetch('/api/save-progress', { 
  body: { userId, moduleId, lessonId: currentLesson._id } 
});
```

---

## Security Benefits

### 1. No Order Manipulation
**Problem**: User could manipulate order numbers to skip lessons
```javascript
// ❌ Before: User could change URL
fetch('/api/get-lesson?moduleId=X&orderNo=99'); // Skip to lesson 99
```

**Solution**: Backend determines order internally
```javascript
// ✅ After: User can only get their current lesson
fetch('/api/get-lesson?moduleId=X&userId=Y'); // Backend picks lesson
```

### 2. No Answer Exposure
**Problem**: Correct answers were exposed in the response
```json
// ❌ Before: Answers visible in response
{
  "options": [
    { "text": "A", "isCorrect": true },
    { "text": "B", "isCorrect": false }
  ]
}
```

**Solution**: Answers only sent after submission
```json
// ✅ After: No correct answer info
{
  "options": [
    { "_id": "opt1", "text": "A" },
    { "_id": "opt2", "text": "B" }
  ]
}
```

### 3. Validated Progression
**Problem**: User could complete lessons out of order
```javascript
// ❌ Before: Could complete any lesson
fetch('/api/complete-lesson', { body: { orderNo: 10 } });
```

**Solution**: Backend validates current lesson
```typescript
// ✅ After: Can only complete current lesson
if (lesson.order !== moduleProgress.nextLessonOrder) {
  throw new Error('Invalid lesson');
}
```

---

## Database Schema

### ModuleProgress
```typescript
{
  userId: ObjectId,
  moduleId: ObjectId,
  completedLessons: [ObjectId], // Lesson IDs, not orders
  completedLessonCount: Number,
  nextLessonOrder: Number, // BACKEND ONLY - never exposed to client
  completionPercentage: Number,
  pointsEarned: Number,
  status: 'in_progress' | 'completed'
}
```

**Key Field**: `nextLessonOrder` is used internally but never sent to the client.

---

## Migration Notes

### APIs Changed

1. **`GET /api/get-lesson`** - Now uses moduleId + userId (no orderNo)
2. **`POST /api/submit-quiz`** - Now uses lessonId (no orderNo), doesn't advance progress
3. **`GET /api/get-quiz`** - Now uses lessonId (no orderNo)
4. **`POST /api/save-progress`** - NEW API to handle progression

### APIs Removed

1. **`POST /api/complete-lesson`** - Replaced by `/api/save-progress`

### Frontend Changes

- Removed all order tracking from state
- Changed from order-based navigation to progress-based navigation
- Added explicit "Next Lesson" flow after quiz completion

---

## Testing

### Test Scenarios

1. **Sequential Access**: User completes lessons 1, 2, 3 in order ✅
2. **Cannot Skip**: User cannot access lesson 5 before completing lesson 4 ✅
3. **Retry Quiz**: User can retake quiz without advancing ✅
4. **Progression**: Clicking "Next Lesson" properly advances to next lesson ✅
5. **Module Completion**: Last lesson properly marks module as complete ✅

### Security Tests

1. **Order Manipulation**: Try to access lesson by guessing order → Blocked ✅
2. **Answer Inspection**: Check API responses for correct answers → Not present ✅
3. **Skip Lessons**: Try to complete lesson 10 without completing 1-9 → Blocked ✅

---

## Summary

The new secure flow ensures:

✅ **Backend-Controlled**: All progression logic on backend  
✅ **No Order Exposure**: Order numbers never sent to client  
✅ **Validated Transitions**: Users can only complete current lesson  
✅ **Answer Security**: Correct answers only sent after submission  
✅ **Opaque Identifiers**: Only ObjectIds shared with client  
✅ **Clean Separation**: Quiz submission separate from progression  

This creates a secure, tamper-proof learning experience where users cannot skip ahead, manipulate progress, or view answers before submission.

