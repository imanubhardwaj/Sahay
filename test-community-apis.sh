#!/bin/bash

# Test Community APIs
# This script tests all community-related API endpoints

BASE_URL="http://localhost:3000"
USER_ID="68f8ba76ad90ee5a1627192a"  # Replace with actual user ID

echo "🧪 Testing Community APIs"
echo "========================="
echo ""

# Test 1: GET all community questions
echo "1️⃣ Testing GET /api/community-questions"
echo "-------------------------------------------"
curl -s "$BASE_URL/api/community-questions" | jq '{success, questionCount: (.questions | length), firstQuestion: .questions[0].title}'
echo ""
echo ""

# Test 2: POST a new question
echo "2️⃣ Testing POST /api/community-questions"
echo "-------------------------------------------"
QUESTION_DATA='{
  "title": "How to use React Hooks effectively?",
  "body": "I am trying to understand the best practices for using React Hooks in a large application. What are some common patterns?",
  "tags": ["React", "JavaScript", "Hooks"],
  "askedBy": "'$USER_ID'"
}'

RESPONSE=$(curl -s -X POST "$BASE_URL/api/community-questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION_DATA")

QUESTION_ID=$(echo "$RESPONSE" | jq -r '.question._id')
echo "$RESPONSE" | jq '{success, questionId: .question._id, title: .question.title}'
echo ""
echo ""

# Test 3: GET single question
if [ "$QUESTION_ID" != "null" ]; then
  echo "3️⃣ Testing GET /api/community-questions/$QUESTION_ID"
  echo "-------------------------------------------"
  curl -s "$BASE_URL/api/community-questions/$QUESTION_ID" | jq '{success, title: .question.title, upvotes: .question.upvotes}'
  echo ""
  echo ""
fi

# Test 4: Upvote a question
if [ "$QUESTION_ID" != "null" ]; then
  echo "4️⃣ Testing POST /api/community-questions/$QUESTION_ID/upvote"
  echo "-------------------------------------------"
  curl -s -X POST "$BASE_URL/api/community-questions/$QUESTION_ID/upvote" | jq '{success, upvotes: .question.upvotes}'
  echo ""
  echo ""
fi

# Test 5: Add a comment
if [ "$QUESTION_ID" != "null" ]; then
  echo "5️⃣ Testing POST /api/community-questions/$QUESTION_ID/comment"
  echo "-------------------------------------------"
  COMMENT_DATA='{
    "content": "You should use useEffect for side effects and useState for component state. Also consider useCallback and useMemo for performance optimization.",
    "userId": "'$USER_ID'"
  }'
  
  curl -s -X POST "$BASE_URL/api/community-questions/$QUESTION_ID/comment" \
    -H "Content-Type: application/json" \
    -d "$COMMENT_DATA" | jq '{success, answersCount: (.question.answers | length)}'
  echo ""
  echo ""
fi

# Test 6: Update a question
if [ "$QUESTION_ID" != "null" ]; then
  echo "6️⃣ Testing PUT /api/community-questions/$QUESTION_ID"
  echo "-------------------------------------------"
  UPDATE_DATA='{
    "title": "How to use React Hooks effectively? [Updated]"
  }'
  
  curl -s -X PUT "$BASE_URL/api/community-questions/$QUESTION_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA" | jq '{success, title: .question.title}'
  echo ""
  echo ""
fi

# Test 7: Delete a question (soft delete)
if [ "$QUESTION_ID" != "null" ]; then
  echo "7️⃣ Testing DELETE /api/community-questions/$QUESTION_ID"
  echo "-------------------------------------------"
  curl -s -X DELETE "$BASE_URL/api/community-questions/$QUESTION_ID" | jq '{success, message}'
  echo ""
  echo ""
fi

echo "✅ All Community API tests completed!"
echo "====================================="

