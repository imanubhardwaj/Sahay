import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CodingProblem from "@/models/CodingProblem";
import UserCodingProgress from "@/models/UserCodingProgress";
import { authenticateRequest } from "@/lib/auth";
import { awardPracticeQuestionPoints } from "@/lib/wallet";
import { getPracticeQuestionPoints, type QuestionDifficulty } from "@/lib/points-economy";

// Safely execute JavaScript code with the given input
function executeJavaScript(
  code: string,
  testInput: string
): { output: string; error?: string } {
  try {
    // Create a function from the code and call it
    const wrappedCode = `
      "use strict";
      ${code}
      
      // Execute the solution function
      const __input__ = ${JSON.stringify(testInput)};
      let __result__;
      
      if (typeof solution === 'function') {
        __result__ = solution(__input__);
      } else if (typeof main === 'function') {
        __result__ = main(__input__);
      } else if (typeof solve === 'function') {
        __result__ = solve(__input__);
      } else {
        throw new Error('No solution, main, or solve function found');
      }
      
      __result__;
    `;

    // Execute with timeout protection
    const fn = new Function(wrappedCode);
    const result = fn();
    
    // Handle different result types
    if (result === undefined || result === null) {
      return { output: String(result) };
    }
    if (typeof result === 'object') {
      return { output: JSON.stringify(result) };
    }
    return { output: String(result) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { output: "", error: `SyntaxError: ${errorMessage}` };
  }
}

// Parse and compare results with flexibility
function compareResults(actual: string, expected: string): boolean {
  // Direct comparison
  if (actual.trim() === expected.trim()) return true;
  
  // Try to normalize JSON arrays/objects
  try {
    const actualParsed = JSON.parse(actual);
    const expectedParsed = JSON.parse(expected);
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch {
    // Not JSON, continue with string comparison
  }
  
  // Normalize whitespace and compare
  const normalizedActual = actual.replace(/\s+/g, ' ').trim();
  const normalizedExpected = expected.replace(/\s+/g, ' ').trim();
  
  return normalizedActual === normalizedExpected;
}

// POST - Submit solution for a problem
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { problemId, code, language } = body;

    if (!problemId || !code || !language) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { success: false, error: "Problem not found" },
        { status: 404 }
      );
    }

    // Run test cases
    interface TestResult {
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
      error?: string;
      isHidden: boolean;
    }
    
    const testResults: TestResult[] = [];
    let passedCount = 0;
    let hasExecutionError = false;
    let executionErrorMessage = "";

    // Check language support
    if (language === "python") {
      return NextResponse.json({
        success: true,
        data: {
          passed: false,
          testsPassed: 0,
          totalTests: problem.testCases.length,
          testResults: [{
            input: "N/A",
            expectedOutput: "N/A",
            actualOutput: "",
            passed: false,
            error: "Python execution is not supported in the browser. Please use JavaScript or TypeScript.",
            isHidden: false,
          }],
          pointsEarned: 0,
        },
      });
    }

    for (const testCase of problem.testCases) {
      let result: { output: string; error?: string };
      
      if (language === "javascript" || language === "typescript") {
        result = executeJavaScript(code, testCase.input);
      } else {
        result = { output: "", error: `Unsupported language: ${language}` };
      }

      if (result.error && !hasExecutionError) {
        hasExecutionError = true;
        executionErrorMessage = result.error;
      }

      const passed = !result.error && compareResults(result.output, testCase.expectedOutput);
      if (passed) passedCount++;

      testResults.push({
        input: testCase.isHidden ? "Hidden" : testCase.input,
        expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
        actualOutput: result.error ? "" : result.output,
        passed,
        error: result.error,
        isHidden: testCase.isHidden,
      });
    }

    const allPassed = passedCount === problem.testCases.length;

    // Update or create user progress
    let progress = await UserCodingProgress.findOne({ userId, problemId });
    let isFirstAttempt = false;

    if (!progress) {
      progress = new UserCodingProgress({
        userId,
        problemId,
        status: "attempted",
        submissions: [],
      });
      isFirstAttempt = true;

      // Increment attempt count for problem
      problem.attemptCount += 1;
    }

    // Add submission
    progress.submissions.push({
      code,
      language,
      passed: allPassed,
      testsPassed: passedCount,
      totalTests: problem.testCases.length,
      submittedAt: new Date(),
    });

    let pointsEarned = 0;

    // If all tests passed and not already solved
    if (allPassed && progress.status !== "solved") {
      progress.status = "solved";
      progress.solvedAt = new Date();
      progress.bestSubmission = {
        code,
        language,
        submittedAt: new Date(),
      };

      // Increment solved count
      problem.solvedCount += 1;

      // Award points based on difficulty using the Sahay economy system
      // Points: Easy=20, Medium=30, Hard=50
      const difficulty = problem.difficulty as QuestionDifficulty;
      pointsEarned = getPracticeQuestionPoints(difficulty);
      
      // Award points to user's wallet
      await awardPracticeQuestionPoints(
        userId,
        problem._id.toString(),
        difficulty
      );
    }

    await progress.save();
    await problem.save();

    return NextResponse.json({
      success: true,
      data: {
        passed: allPassed,
        testsPassed: passedCount,
        totalTests: problem.testCases.length,
        testResults: testResults.filter((t) => !t.isHidden),
        pointsEarned,
        executionError: hasExecutionError ? executionErrorMessage : null,
        isFirstAttempt,
      },
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit solution. Please check your code syntax." },
      { status: 500 }
    );
  }
}
