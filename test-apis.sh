#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}🧪 Testing Sahay APIs${NC}"
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
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        echo "Response: $(echo "$body" | head -c 100)..."
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
    fi
}

# Test basic connectivity
echo -e "\n${BLUE}1. Testing Basic Connectivity${NC}"
test_api "GET" "/" "null" "200" "Homepage"

# Test User APIs
echo -e "\n${BLUE}2. Testing User APIs${NC}"
test_api "GET" "/api/user" "null" "200" "Get all users"
test_api "POST" "/api/user" '{"firstName":"Test","lastName":"User","email":"test@example.com","workosId":"test123","userType":"student_fresher","college":"Test College","year":2}' "201" "Create student user"
test_api "GET" "/api/user?userType=student_fresher" "null" "200" "Get students only"

# Test Working Professional APIs
echo -e "\n${BLUE}3. Testing Working Professional APIs${NC}"
test_api "POST" "/api/user" '{"firstName":"John","lastName":"Doe","email":"john@company.com","workosId":"john123","userType":"working_professional","company":"Test Company","experience":5,"domain":"Software Engineering","title":"Senior Developer"}' "201" "Create working professional"

# Test Post APIs
echo -e "\n${BLUE}4. Testing Post APIs${NC}"
test_api "GET" "/api/posts" "null" "200" "Get all posts"
test_api "POST" "/api/posts" '{"title":"Test Post","content":"This is a test post","authorId":"507f1f77bcf86cd799439011","tags":["test","demo"]}' "201" "Create post"

# Test Quiz APIs
echo -e "\n${BLUE}5. Testing Quiz APIs${NC}"
test_api "GET" "/api/quizzes" "null" "200" "Get all quizzes"
test_api "POST" "/api/quizzes" '{"title":"Test Quiz","description":"A test quiz","createdBy":"507f1f77bcf86cd799439011","difficulty":"beginner","questions":[{"questionText":"What is 2+2?","options":["3","4","5","6"],"correctAnswer":"4","points":10}]}' "201" "Create quiz"

# Test Module APIs
echo -e "\n${BLUE}6. Testing Module APIs${NC}"
test_api "GET" "/api/modules" "null" "200" "Get all modules"
test_api "POST" "/api/modules" '{"title":"Test Module","description":"A test module","createdBy":"507f1f77bcf86cd799439011","difficulty":"beginner","lessons":[{"title":"Lesson 1","content":"Test content","duration":30}]}' "201" "Create module"

# Test Project APIs
echo -e "\n${BLUE}7. Testing Project APIs${NC}"
test_api "GET" "/api/projects" "null" "200" "Get all projects"
test_api "POST" "/api/projects" '{"title":"Test Project","description":"A test project","createdBy":"507f1f77bcf86cd799439011","category":"Web Development","technologies":["React","Node.js"]}' "201" "Create project"

# Test College APIs
echo -e "\n${BLUE}8. Testing College APIs${NC}"
test_api "GET" "/api/colleges" "null" "200" "Get all colleges"
test_api "POST" "/api/colleges" '{"name":"Test University","location":"Test City","website":"https://test.edu"}' "201" "Create college"

# Test Company APIs
echo -e "\n${BLUE}9. Testing Company APIs${NC}"
test_api "GET" "/api/companies" "null" "200" "Get all companies"
test_api "POST" "/api/companies" '{"name":"Test Corp","industry":"Technology","location":"Test City","website":"https://testcorp.com"}' "201" "Create company"

# Test Skill APIs
echo -e "\n${BLUE}10. Testing Skill APIs${NC}"
test_api "GET" "/api/skills" "null" "200" "Get all skills"
test_api "POST" "/api/skills" '{"name":"JavaScript","category":"Programming","description":"A programming language"}' "201" "Create skill"

# Test Wallet APIs
echo -e "\n${BLUE}11. Testing Wallet APIs${NC}"
test_api "GET" "/api/wallets" "null" "200" "Get all wallets"
test_api "POST" "/api/wallets" '{"userId":"507f1f77bcf86cd799439011","currency":"USD"}' "201" "Create wallet"

# Test existing APIs
echo -e "\n${BLUE}12. Testing Existing APIs${NC}"
test_api "GET" "/api/schedules" "null" "200" "Get all schedules"
test_api "GET" "/api/bookings" "null" "200" "Get all bookings"
test_api "GET" "/api/questions" "null" "200" "Get all questions"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "=================================="
