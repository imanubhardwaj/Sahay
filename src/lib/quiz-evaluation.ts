// Quiz evaluation utilities

interface MCQEvaluationResult {
  isCorrect: boolean;
  earnedPoints: number;
  correctAnswer: string;
  userAnswer: string;
  suggestedTopics: string[];
  explanation?: string;
}

interface SubjectiveEvaluationResult {
  isCorrect: boolean | null;
  earnedPoints: number;
  correctAnswer: string;
  userAnswer: string;
  feedback: string;
  improvements: string[];
}

/**
 * Evaluate MCQ question and suggest topics for wrong answers
 */
export function evaluateMCQ(
  questionText: string,
  userOptionId: string | undefined,
  correctOptionId: string,
  options: Array<{ id: string; content: string }>,
  lessonTopics: string[] = [],
  points: number = 10,
): MCQEvaluationResult {
  const isCorrect = userOptionId === correctOptionId;
  const correctOption = options.find((opt) => opt.id === correctOptionId);
  const userOption = options.find((opt) => opt.id === userOptionId);

  // Map question to relevant topics for wrong answers
  const suggestedTopics = isCorrect
    ? []
    : mapQuestionToTopics(questionText, lessonTopics);

  return {
    isCorrect,
    earnedPoints: isCorrect ? points : 0,
    correctAnswer: correctOption?.content || "",
    userAnswer: userOption?.content || "",
    suggestedTopics,
  };
}

/**
 * Map question text to relevant topics from lesson
 */
function mapQuestionToTopics(
  questionText: string,
  lessonTopics: string[],
): string[] {
  if (!lessonTopics || lessonTopics.length === 0) {
    return [];
  }

  const questionLower = questionText.toLowerCase();
  const suggestedTopics: string[] = [];

  // Simple keyword matching - can be enhanced with more sophisticated logic
  for (const topic of lessonTopics) {
    const topicLower = topic.toLowerCase();
    const topicKeywords = topicLower.split(/[\s,]+/);

    // Check if any keyword from the topic appears in the question
    const hasMatch = topicKeywords.some(
      (keyword) => keyword.length > 3 && questionLower.includes(keyword),
    );

    if (hasMatch) {
      suggestedTopics.push(topic);
    }
  }

  // If no specific match, return first 2 topics as general suggestions
  if (suggestedTopics.length === 0 && lessonTopics.length > 0) {
    return lessonTopics.slice(0, 2);
  }

  return suggestedTopics.slice(0, 3); // Return max 3 topics
}

/**
 * Discover available Gemini models by calling ListModels API
 */
async function discoverAvailableModels(
  apiKey: string,
): Promise<{ model: string; version: string } | null> {
  const apiVersions = ["v1beta", "v1"];

  for (const version of apiVersions) {
    try {
      const listUrl = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;

      const response = await fetch(listUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];

        // Find first model that supports generateContent
        for (const model of models) {
          const modelName = model.name?.replace(`models/`, "") || "";
          const supportedMethods = model.supportedGenerationMethods || [];

          if (supportedMethods.includes("generateContent") && modelName) {
            return { model: modelName, version };
          }
        }
      }
    } catch (error) {
      console.warn(
        `[GEMINI] ⚠️ Failed to list models with ${version}:`,
        (error as Error).message,
      );
      // Continue to next version
    }
  }

  return null;
}

/**
 * Evaluate subjective or code question using Google Gemini API
 * Returns isCorrect (true/false) and points (0 to maxPoints) from Gemini
 */
export async function evaluateSubjectiveOrCode(
  questionText: string,
  userAnswer: string,
  correctAnswer: string,
  questionType: "subjective" | "code",
  points: number = 10,
): Promise<SubjectiveEvaluationResult> {
  // IMMEDIATE LOG - This should show up FIRST to confirm function is called

  // Log to both console (server) and stderr for visibility
  // Use process.stdout.write for immediate output
  process.stdout.write("\n\n");
  process.stdout.write("========================================\n");
  process.stdout.write("[GEMINI] 🚀🚀🚀 STARTING EVALUATION 🚀🚀🚀\n");
  process.stdout.write(`[GEMINI] Type: ${questionType}\n`);
  process.stdout.write(`[GEMINI] Points: ${points}\n`);
  process.stdout.write(
    `[GEMINI] Question text length: ${questionText?.length || 0}\n`,
  );
  process.stdout.write(
    `[GEMINI] User answer length: ${userAnswer?.length || 0}\n`,
  );
  process.stdout.write(
    `[GEMINI] Question preview: ${questionText?.substring(0, 150) || "EMPTY"}\n`,
  );
  process.stdout.write(
    `[GEMINI] User answer preview: ${userAnswer?.substring(0, 150) || "EMPTY"}\n`,
  );
  process.stdout.write("========================================\n");

  // Check for API key - try multiple possible env var names
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    const errorMsg = "[GEMINI] ❌❌❌ API KEY NOT FOUND!";
    process.stdout.write(`\n${errorMsg}\n`);
    process.stdout.write("========================================\n");
    console.error(errorMsg);
    console.error("[GEMINI] Environment check:", {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasNextPublicGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      hasGoogleGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env)
        .filter(
          (k) => k.includes("API") || k.includes("KEY") || k.includes("GEMINI"),
        )
        .slice(0, 10), // Limit to first 10 to avoid spam
    });
    console.error(
      "[GEMINI] ❌ Make sure GEMINI_API_KEY is in .env.local (not .env)",
    );
    return {
      isCorrect: null,
      earnedPoints: 0,
      correctAnswer,
      userAnswer,
      feedback: "Automatic evaluation unavailable. Please review manually.",
      improvements: ["Gemini API key not configured - check server logs"],
    };
  }

  process.stdout.write(`[GEMINI] ✅ API key found!\n`);
  process.stdout.write(`[GEMINI] ✅ API key length: ${apiKey.length}\n`);
  process.stdout.write(
    `[GEMINI] ✅ API key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`,
  );

  try {
    // Validate inputs
    if (!questionText || questionText.trim().length === 0) {
      console.error("[GEMINI] ❌ Empty question text");
      throw new Error("Question text is required");
    }

    if (!userAnswer || userAnswer.trim().length === 0) {
      console.error("[GEMINI] ❌ Empty user answer");
      throw new Error("User answer is required");
    }

    // Short prompt asking for isCorrect (true/false) and points (0 to maxPoints)
    const prompt =
      questionType === "code"
        ? `Q: ${questionText}\nA: ${userAnswer}\nMax: ${points}\nEvaluate code correctness. Return JSON only: {"isCorrect": true/false, "points": 0-${points}}`
        : `Q: ${questionText}\nA: ${userAnswer}\nMax: ${points}\nEvaluate answer. Return JSON only: {"isCorrect": true/false, "points": 0-${points}}`;

    console.error("[GEMINI] 📝 Making API request to Gemini..."); // Log to stderr for visibility

    // First, try to discover available models
    const discoveredModel = await discoverAvailableModels(apiKey);

    // Build list of models to try: discovered model first, then fallbacks
    const modelConfigs: Array<{ model: string; version: string }> = [];

    if (discoveredModel) {
      modelConfigs.push(discoveredModel);
    }

    // Add fallback models
    modelConfigs.push(
      { model: "gemini-1.5-flash", version: "v1beta" },
      { model: "gemini-1.5-flash", version: "v1" },
      { model: "gemini-pro", version: "v1beta" },
      { model: "gemini-pro", version: "v1" },
    );

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
        maxOutputTokens: 500, // Increased from 100 to ensure full JSON response
      },
    };

    let response;
    let lastError: Error | null = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Try each model/API combination
    for (const config of modelConfigs) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;

        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (response.ok) {
          clearTimeout(timeoutId);
          break; // Success! Exit loop
        } else {
          const errorText = await response.text();
          console.warn(
            `[GEMINI] ⚠️ ${config.model}/${config.version} failed: ${response.status} - ${errorText.substring(0, 100)}`,
          );
          lastError = new Error(
            `Gemini API error: ${response.statusText} - ${errorText.substring(0, 200)}`,
          );
          // Continue to next config
        }
      } catch (fetchError: unknown) {
        const error = fetchError as Error;
        if (error.name === "AbortError") {
          clearTimeout(timeoutId);
          console.error("[GEMINI] ❌ Request timeout after 30 seconds");
          throw new Error("Gemini API request timed out. Please try again.");
        }
        console.warn(
          `[GEMINI] ⚠️ ${config.model}/${config.version} fetch error:`,
          error.message,
        );
        lastError = error as Error;
        // Continue to next config
      }
    }

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      const errorDetails = lastError
        ? { error: lastError.message }
        : { error: "All model/API combinations failed" };
      console.error("[GEMINI] ❌ All API attempts failed:", errorDetails);
      throw (
        lastError ||
        new Error(
          "All Gemini API model/version combinations failed. Please check your API key and model availability.",
        )
      );
    }

    const data = await response.json();
    console.error("[GEMINI] ✅ Response received"); // Also to stderr

    // Check if response was truncated
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
      console.warn(
        "[GEMINI] ⚠️ Response was truncated! finishReason:",
        finishReason,
      );
    }

    // Extract content from Gemini response
    let content = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      if (parts && Array.isArray(parts)) {
        // Combine all text parts (in case response is split)
        content = parts
          .map((part: { text?: string }) => part?.text || "")
          .join("")
          .trim();
      } else {
        console.warn("[GEMINI] No text in parts:", parts);
      }
    } else {
      console.warn(
        "[GEMINI] Unexpected response structure:",
        Object.keys(data),
      );
    }

    if (!content) {
      console.error("[GEMINI] No content received:", data);
      throw new Error("No content received from Gemini API");
    }

    // Clean content: remove markdown code blocks if present
    // Gemini sometimes returns JSON wrapped in ```json ... ```
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```")) {
      // Remove opening ```json or ```
      cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, "");
      // Remove closing ```
      cleanedContent = cleanedContent.replace(/\s*```\s*$/, "");
      cleanedContent = cleanedContent.trim();
    }

    // Parse JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(cleanedContent);
      console.error(
        "[GEMINI] ✅ Parsed evaluation:",
        JSON.stringify(evaluation),
      ); // Also to stderr
    } catch (parseError) {
      console.error("[GEMINI] ❌ Failed to parse JSON response:", {
        content: cleanedContent,
        error: parseError,
      });
      console.error(
        "[GEMINI] ❌ Parse error details:",
        JSON.stringify({ content: cleanedContent, error: String(parseError) }),
      ); // Also to stderr
      // Fallback: try to extract isCorrect and points from text
      const contentLower = cleanedContent.toLowerCase();
      let extractedIsCorrect = null;
      let extractedPoints = 0;

      if (
        contentLower.includes("true") ||
        contentLower.includes('"isCorrect":true')
      ) {
        extractedIsCorrect = true;
      } else if (
        contentLower.includes("false") ||
        contentLower.includes('"isCorrect":false')
      ) {
        extractedIsCorrect = false;
      }

      // Try to extract points number
      const pointsMatch = cleanedContent.match(/"points"\s*:\s*(\d+)/i);
      if (pointsMatch) {
        extractedPoints = parseInt(pointsMatch[1], 10);
      } else if (extractedIsCorrect === true) {
        extractedPoints = points; // If correct but no points specified, give full points
      }

      evaluation = {
        isCorrect: extractedIsCorrect,
        points: extractedPoints,
      };
      console.error("[GEMINI] Fallback: extracted", JSON.stringify(evaluation)); // Also to stderr
    }

    // Ensure isCorrect is boolean or null
    const isCorrect =
      evaluation.isCorrect === true
        ? true
        : evaluation.isCorrect === false
          ? false
          : null;

    // Get points from Gemini response, validate it's within 0 to maxPoints range
    let earnedPoints = 0;
    if (
      evaluation.points !== undefined &&
      typeof evaluation.points === "number"
    ) {
      // Clamp points between 0 and maxPoints
      earnedPoints = Math.max(
        0,
        Math.min(points, Math.round(evaluation.points)),
      );
    } else if (isCorrect === true) {
      // Fallback: if correct but no points specified, give full points
      earnedPoints = points;
    } else {
      // Fallback: if incorrect or unclear, give 0 points
      earnedPoints = 0;
    }

    // Ensure minimum 1 point for code/subjective questions (attempt credit)
    // Only if user provided an answer (which we already validated earlier)
    if (earnedPoints === 0 && userAnswer && userAnswer.trim().length > 0) {
      earnedPoints = Math.min(1, points); // At least 1 point, but not more than max
    }
    console.error(
      `[GEMINI] ✅✅✅ FINAL RESULT: isCorrect=${isCorrect}, earnedPoints=${earnedPoints}, maxPoints=${points}`,
    ); // Also to stderr

    return {
      isCorrect,
      earnedPoints,
      correctAnswer,
      userAnswer,
      feedback:
        isCorrect === true
          ? "Your answer is correct!"
          : isCorrect === false
            ? "Your answer is incorrect. Please review the solution."
            : "Unable to evaluate answer. Please review manually.",
      improvements:
        isCorrect === false
          ? [
              "Review the question requirements",
              "Compare your answer with the expected solution",
            ]
          : [],
    };
  } catch (error) {
    const errorDetails = {
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error("[GEMINI] ❌❌❌ ERROR EVALUATING:", errorDetails);
    console.error(
      "[GEMINI] ❌❌❌ ERROR:",
      JSON.stringify(errorDetails, null, 2),
    ); // Also to stderr with full details

    // Give at least 1 point for attempt if user provided an answer
    const errorEarnedPoints =
      userAnswer && userAnswer.trim().length > 0 ? Math.min(1, points) : 0;

    return {
      isCorrect: null,
      earnedPoints: errorEarnedPoints,
      correctAnswer,
      userAnswer,
      feedback:
        "Evaluation service temporarily unavailable. Please review manually.",
      improvements: ["Check your answer against the lesson content"],
    };
  }
}
