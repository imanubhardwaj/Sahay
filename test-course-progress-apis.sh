#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}🧪 Testing User Course Progress APIs${NC}"
echo "=================================="

# Test function
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        echo "Response: $body" | python3 -m json.tool 2>/dev/null || echo "Response: $body"
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
    fi
    
    # Return the response body for use in subsequent tests
    echo "$body"
}

# First, get a user ID from the database
echo -e "\n${BLUE}1. Getting Test User${NC}"
USER_RESPONSE=$(test_api "GET" "/api/users" "null" "200" "Get all users")
USER_ID=$(echo "$USER_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['users'][0]['_id'] if data.get('users') and len(data['users']) > 0 else '')" 2>/dev/null)

if [ -z "$USER_ID" ]; then
    echo -e "${RED}❌ No users found in database. Please seed the database first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using User ID: $USER_ID${NC}"

# Get a course ID
echo -e "\n${BLUE}2. Getting Test Course${NC}"
COURSE_RESPONSE=$(test_api "GET" "/api/courses" "null" "200" "Get all courses")
COURSE_ID=$(echo "$COURSE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['courses'][0]['_id'] if data.get('courses') and len(data['courses']) > 0 else '')" 2>/dev/null)

if [ -z "$COURSE_ID" ]; then
    echo -e "${RED}❌ No courses found in database. Please seed the database first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using Course ID: $COURSE_ID${NC}"

# Get a lesson ID
echo -e "\n${BLUE}3. Getting Test Lesson${NC}"
LESSON_RESPONSE=$(test_api "GET" "/api/lessons" "null" "200" "Get all lessons")
LESSON_ID=$(echo "$LESSON_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['lessons'][0]['_id'] if data.get('lessons') and len(data['lessons']) > 0 else '')" 2>/dev/null)

if [ -z "$LESSON_ID" ]; then
    echo -e "${YELLOW}⚠️  No lessons found. Tests will be limited.${NC}"
fi

# Test GET - Get all course progress for user (should be empty initially)
echo -e "\n${BLUE}4. Testing GET - Get User Course Progress${NC}"
test_api "GET" "/api/user-course-progress?userId=$USER_ID" "null" "200" "Get all course progress for user"

# Test POST - Start a new course
echo -e "\n${BLUE}5. Testing POST - Start New Course${NC}"
if [ -n "$LESSON_ID" ]; then
    PROGRESS_RESPONSE=$(test_api "POST" "/api/user-course-progress" "{\"userId\":\"$USER_ID\",\"courseId\":\"$COURSE_ID\",\"lessonId\":\"$LESSON_ID\"}" "200" "Start a new course with lesson")
else
    PROGRESS_RESPONSE=$(test_api "POST" "/api/user-course-progress" "{\"userId\":\"$USER_ID\",\"courseId\":\"$COURSE_ID\"}" "200" "Start a new course")
fi

# Test GET - Get specific course progress
echo -e "\n${BLUE}6. Testing GET - Get Specific Course Progress${NC}"
test_api "GET" "/api/user-course-progress?userId=$USER_ID&courseId=$COURSE_ID" "null" "200" "Get progress for specific course"

# Test POST - Update course progress (accessing the course again)
echo -e "\n${BLUE}7. Testing POST - Update Course Progress${NC}"
if [ -n "$LESSON_ID" ]; then
    test_api "POST" "/api/user-course-progress" "{\"userId\":\"$USER_ID\",\"courseId\":\"$COURSE_ID\",\"lessonId\":\"$LESSON_ID\"}" "200" "Update course progress"
fi

# Test PUT - Complete a lesson
echo -e "\n${BLUE}8. Testing PUT - Complete Lesson${NC}"
if [ -n "$LESSON_ID" ]; then
    test_api "PUT" "/api/user-course-progress" "{\"userId\":\"$USER_ID\",\"courseId\":\"$COURSE_ID\",\"lessonId\":\"$LESSON_ID\",\"pointsEarned\":50}" "200" "Complete lesson and earn points"
fi

# Test GET - Get updated progress after lesson completion
echo -e "\n${BLUE}9. Testing GET - Get Updated Progress${NC}"
test_api "GET" "/api/user-course-progress?userId=$USER_ID&courseId=$COURSE_ID" "null" "200" "Get updated course progress"

# Test GET - Get all progress for user
echo -e "\n${BLUE}10. Testing GET - Get All User Progress${NC}"
test_api "GET" "/api/user-course-progress?userId=$USER_ID" "null" "200" "Get all course progress for user"

echo -e "\n${GREEN}🎉 User Course Progress API Testing Complete!${NC}"
echo "=================================="
echo -e "\n${YELLOW}Summary:${NC}"
echo "- User ID: $USER_ID"
echo "- Course ID: $COURSE_ID"
echo "- Lesson ID: ${LESSON_ID:-N/A}"
echo ""
echo -e "${YELLOW}API Endpoints Tested:${NC}"
echo "1. GET  /api/user-course-progress?userId=<userId>"
echo "2. GET  /api/user-course-progress?userId=<userId>&courseId=<courseId>"
echo "3. POST /api/user-course-progress (Start/Update course)"
echo "4. PUT  /api/user-course-progress (Complete lesson)"

