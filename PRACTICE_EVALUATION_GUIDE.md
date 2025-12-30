# Practice Page Evaluation Guide

## Overview
This document explains how coding questions are evaluated in the practice page.

## Two Types of Questions

### 1. Regular Coding Problems (from `/api/coding-problems`)
These are standard coding problems with predefined test cases.

**Evaluation Process:**
1. **Code Submission**: User submits code via `/api/coding-problems/submit`
2. **Code Execution**: Code is executed in a sandboxed JavaScript environment
3. **Test Case Execution**: Each test case runs the code with specific inputs
4. **Output Comparison**: Actual output is compared with expected output using `compareResults()` function
5. **Result Calculation**: 
   - All tests must pass for the problem to be marked as "solved"
   - Points are awarded based on difficulty (Easy=20, Medium=30, Hard=50)
   - Points are only awarded on first successful solve

**Evaluation Function (`compareResults`):**
```javascript
function compareResults(actual: string, expected: string): boolean {
  // 1. Direct string comparison (trimmed)
  if (actual.trim() === expected.trim()) return true;
  
  // 2. JSON comparison (for arrays/objects)
  try {
    const actualParsed = JSON.parse(actual);
    const expectedParsed = JSON.parse(expected);
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch {
    // Not JSON, continue
  }
  
  // 3. Normalized whitespace comparison
  const normalizedActual = actual.replace(/\s+/g, ' ').trim();
  const normalizedExpected = expected.replace(/\s+/g, ' ').trim();
  return normalizedActual === normalizedExpected;
}
```

**Code Execution:**
- Code is wrapped in a function that looks for `solution()`, `main()`, or `solve()` functions
- Input is passed as a parameter
- Output is captured and compared

### 2. Lesson Coding Challenges (from Module Lessons)
These are extracted from lesson content's "Coding Challenge" section.

**Evaluation Process:**
1. **Challenge Extraction**: Coding challenges are extracted from lesson markdown content
2. **Temporary Problem Creation**: A temporary coding problem is created with the challenge description
3. **Code Execution**: Code is executed in the browser (client-side)
4. **Manual Verification**: Since there are no test cases, the user must manually verify their solution
5. **No Points Awarded**: Lesson challenges don't award points (they're for practice)

**How Coding Challenges are Extracted:**
- Looks for `## Coding Challenge` section in lesson content
- Extracts `**Task 1**` and `**Task 2**` from the markdown
- Creates a problem description with both tasks

## Flow Diagram

### Regular Coding Problem Flow:
```
User clicks "Run" 
  → POST /api/coding-problems/submit
    → Execute code with test cases
      → Compare outputs
        → Return results
          → Display pass/fail
            → Award points if solved
```

### Lesson Challenge Flow:
```
User clicks "Practice Code" in lesson
  → Extract Coding Challenge from content
    → Navigate to /dashboard/practice?fromLesson=true&task1=...&task2=...
      → Create temporary problem
        → User writes code
          → Click "Run"
            → Execute code client-side
              → Display execution result
                → User verifies manually
```

## Key Differences

| Feature | Regular Problems | Lesson Challenges |
|---------|-----------------|-------------------|
| Test Cases | Yes (predefined) | No |
| Evaluation | Automatic | Manual |
| Points | Yes (20/30/50) | No |
| Storage | Saved in DB | Temporary |
| Language | From problem | From module |

## Evaluation Criteria

### For Regular Problems:
- ✅ All test cases must pass
- ✅ Code must execute without errors
- ✅ Output must match expected output exactly (with normalization)

### For Lesson Challenges:
- ✅ Code must execute without syntax errors
- ✅ User manually verifies solution matches requirements
- ✅ No automatic pass/fail determination

## API Endpoints

### `/api/coding-problems/submit` (POST)
**Request Body:**
```json
{
  "problemId": "string",
  "code": "string",
  "language": "javascript" | "python" | "typescript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passed": boolean,
    "testsPassed": number,
    "totalTests": number,
    "testResults": Array<{
      "input": string,
      "expectedOutput": string,
      "actualOutput": string,
      "passed": boolean,
      "error": string (optional)
    }>,
    "pointsEarned": number,
    "executionError": string (optional)
  }
}
```

## Error Handling

1. **Syntax Errors**: Caught during execution, displayed to user
2. **Runtime Errors**: Caught and displayed with error message
3. **Timeout**: Not implemented (would need server-side execution)
4. **Invalid Input**: Handled by test case validation

## Security Considerations

- Code execution happens client-side (for lesson challenges)
- Server-side execution (for regular problems) uses Function constructor
- No network access or file system access
- Strict mode enabled for safer execution

