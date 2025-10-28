#!/bin/bash

# Simple manual test for User Course Progress API
# Make sure the dev server is running: npm run dev or pnpm dev

BASE_URL="http://localhost:3000"

echo "======================================"
echo "User Course Progress API Manual Test"
echo "======================================"
echo ""
echo "Prerequisites:"
echo "1. Dev server should be running (npm run dev)"
echo "2. Database should be seeded (curl -X POST $BASE_URL/api/seed-essential)"
echo ""

# Test 1: Check if server is running
echo "Test 1: Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run dev"
    exit 1
fi

# Test 2: Get users
echo ""
echo "Test 2: Getting users from database..."
USERS=$(curl -s "$BASE_URL/api/users")
echo "$USERS" | python3 -m json.tool 2>/dev/null | head -20

# Test 3: Get courses
echo ""
echo "Test 3: Getting courses from database..."
COURSES=$(curl -s "$BASE_URL/api/courses")
echo "$COURSES" | python3 -m json.tool 2>/dev/null | head -20

# Test 4: Test course progress API structure
echo ""
echo "Test 4: Testing API endpoint availability..."
echo "Testing: GET /api/user-course-progress?userId=test"
RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/user-course-progress?userId=test")
echo "$RESULT"

echo ""
echo "======================================"
echo "Manual Testing Instructions:"
echo "======================================"
echo ""
echo "1. Get a valid User ID from the users list above"
echo "2. Get a valid Course ID from the courses list above"
echo "3. Get a valid Lesson ID from a lesson query"
echo ""
echo "Then run these commands:"
echo ""
echo "# Get all course progress for a user"
echo "curl \"$BASE_URL/api/user-course-progress?userId=YOUR_USER_ID\""
echo ""
echo "# Start a course"
echo "curl -X POST $BASE_URL/api/user-course-progress \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"userId\":\"YOUR_USER_ID\",\"courseId\":\"YOUR_COURSE_ID\"}'"
echo ""
echo "# Complete a lesson"
echo "curl -X PUT $BASE_URL/api/user-course-progress \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"userId\":\"YOUR_USER_ID\",\"courseId\":\"YOUR_COURSE_ID\",\"lessonId\":\"YOUR_LESSON_ID\",\"pointsEarned\":50}'"
echo ""
echo "For more details, see USER_COURSE_PROGRESS_API.md"

