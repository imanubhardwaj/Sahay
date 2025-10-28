#!/bin/bash

# Test script to verify the UserCourseProgress API fix
# This tests that the courseId validation error is resolved

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Testing UserCourseProgress API Fix"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Wait for server to start
echo -e "${BLUE}Waiting for server to start...${NC}"
sleep 5

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

# Test 1: Create user progress without courseId (should work now)
echo -e "\n${BLUE}Test 1: POST user progress without courseId${NC}"
test_api "POST" "/api/user-course-progress" '{"userId":"507f1f77bcf86cd799439011","moduleId":"507f1f77bcf86cd799439012"}' "200" "Create user progress without courseId"

# Test 2: Create user progress with courseId (should also work)
echo -e "\n${BLUE}Test 2: POST user progress with courseId${NC}"
test_api "POST" "/api/user-course-progress" '{"userId":"507f1f77bcf86cd799439011","moduleId":"507f1f77bcf86cd799439012","courseId":"507f1f77bcf86cd799439013"}' "200" "Create user progress with courseId"

# Test 3: Get user progress
echo -e "\n${BLUE}Test 3: GET user progress${NC}"
test_api "GET" "/api/user-course-progress?userId=507f1f77bcf86cd799439011" "null" "200" "Get user progress"

echo -e "\n${GREEN}🎉 UserCourseProgress API Testing Complete!${NC}"
echo "======================================"
echo -e "\n${YELLOW}Key Fixes Applied:${NC}"
echo "1. Made courseId optional in UserCourseProgress model"
echo "2. Clear model cache to ensure schema updates"
echo "3. Only set courseId when provided"
echo "4. Better error handling"
echo ""
echo -e "${YELLOW}The validation error should now be resolved!${NC}"
