#!/bin/bash

# Test script to verify user course progress API works correctly
# This tests the fixes for the "Cannot read properties of undefined (reading 'find')" error

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Testing User Course Progress API Fix"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        echo "Response: $body" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
    fi
    
    return 0
}

# Test 1: Get user progress (should create new user progress if doesn't exist)
echo -e "\n${BLUE}Test 1: GET user progress (new user)${NC}"
test_api "GET" "/api/user-course-progress?userId=507f1f77bcf86cd799439011" "null" "200" "Get user progress for new user"

# Test 2: Start a module (should create course progress)
echo -e "\n${BLUE}Test 2: POST start module${NC}"
test_api "POST" "/api/user-course-progress" '{"userId":"507f1f77bcf86cd799439011","moduleId":"507f1f77bcf86cd799439012"}' "200" "Start module for user"

# Test 3: Get specific module progress
echo -e "\n${BLUE}Test 3: GET module progress${NC}"
test_api "GET" "/api/user-course-progress?userId=507f1f77bcf86cd799439011&moduleId=507f1f77bcf86cd799439012" "null" "200" "Get specific module progress"

# Test 4: Complete a lesson
echo -e "\n${BLUE}Test 4: PUT complete lesson${NC}"
test_api "PUT" "/api/user-course-progress" '{"userId":"507f1f77bcf86cd799439011","moduleId":"507f1f77bcf86cd799439012","lessonId":"507f1f77bcf86cd799439013","pointsEarned":50}' "200" "Complete lesson"

# Test 5: Get user progress again (should show updated progress)
echo -e "\n${BLUE}Test 5: GET user progress (after lesson completion)${NC}"
test_api "GET" "/api/user-course-progress?userId=507f1f77bcf86cd799439011" "null" "200" "Get updated user progress"

echo -e "\n${GREEN}🎉 User Course Progress API Testing Complete!${NC}"
echo "======================================"
echo -e "\n${YELLOW}Key Fixes Applied:${NC}"
echo "1. Added null checks for completedCourses array"
echo "2. Added proper error handling for empty arrays"
echo "3. Added logging for debugging"
echo "4. Ensured completedCourses array is always initialized"
echo ""
echo -e "${YELLOW}The API should now handle new users gracefully without the 'find' error.${NC}"
