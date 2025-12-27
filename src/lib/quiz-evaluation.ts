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
  points: number = 10
): MCQEvaluationResult {
  const isCorrect = userOptionId === correctOptionId;
  const correctOption = options.find(opt => opt.id === correctOptionId);
  const userOption = options.find(opt => opt.id === userOptionId);

  // Map question to relevant topics for wrong answers
  const suggestedTopics = isCorrect ? [] : mapQuestionToTopics(questionText, lessonTopics);

  return {
    isCorrect,
    earnedPoints: isCorrect ? points : 0,
    correctAnswer: correctOption?.content || '',
    userAnswer: userOption?.content || '',
    suggestedTopics,
  };
}

/**
 * Map question text to relevant topics from lesson
 */
function mapQuestionToTopics(questionText: string, lessonTopics: string[]): string[] {
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
    const hasMatch = topicKeywords.some(keyword => 
      keyword.length > 3 && questionLower.includes(keyword)
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
 * Evaluate subjective or code question using Google Gemini API
 * Returns only yes/no (true/false) response - no explanations
 */
export async function evaluateSubjectiveOrCode(
  questionText: string,
  userAnswer: string,
  correctAnswer: string,
  questionType: 'subjective' | 'code',
  points: number = 10
): Promise<SubjectiveEvaluationResult> {
  // Log to both console (server) and stderr for visibility
  // Use process.stdout.write for immediate output
  process.stdout.write('\n');
  process.stdout.write('========================================\n');
  process.stdout.write('[GEMINI] 🚀🚀🚀 STARTING EVALUATION 🚀🚀🚀\n');
  process.stdout.write(`[GEMINI] Type: ${questionType}\n`);
  process.stdout.write(`[GEMINI] Points: ${points}\n`);
  process.stdout.write(`[GEMINI] Question text length: ${questionText.length}\n`);
  process.stdout.write(`[GEMINI] User answer length: ${userAnswer.length}\n`);
  process.stdout.write(`[GEMINI] Question preview: ${questionText.substring(0, 150)}\n`);
  process.stdout.write(`[GEMINI] User answer preview: ${userAnswer.substring(0, 150)}\n`);
  process.stdout.write('========================================\n');
  
  console.log('========================================');
  console.log('[GEMINI] 🚀 STARTING EVALUATION');
  console.log('[GEMINI] Type:', questionType);
  console.log('[GEMINI] Points:', points);
  console.log('[GEMINI] Question text length:', questionText.length);
  console.log('[GEMINI] User answer length:', userAnswer.length);
  console.log('[GEMINI] Question preview:', questionText.substring(0, 150));
  console.log('[GEMINI] User answer preview:', userAnswer.substring(0, 150));
  console.error('[GEMINI] 🚀 STARTING EVALUATION - Type:', questionType); // Also to stderr

  // Check for API key - try multiple possible env var names
  const apiKey = process.env.GEMINI_API_KEY 
    || process.env.NEXT_PUBLIC_GEMINI_API_KEY 
    || process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    const errorMsg = '[GEMINI] ❌❌❌ API KEY NOT FOUND!';
    process.stdout.write(`\n${errorMsg}\n`);
    process.stdout.write('========================================\n');
    console.error(errorMsg);
    console.error('[GEMINI] Environment check:', {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasNextPublicGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      hasGoogleGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env)
        .filter(k => k.includes('API') || k.includes('KEY') || k.includes('GEMINI'))
        .slice(0, 10), // Limit to first 10 to avoid spam
    });
    console.error('[GEMINI] ❌ Make sure GEMINI_API_KEY is in .env.local (not .env)');
    return {
      isCorrect: null,
      earnedPoints: 0,
      correctAnswer,
      userAnswer,
      feedback: 'Automatic evaluation unavailable. Please review manually.',
      improvements: ['Gemini API key not configured - check server logs'],
    };
  }

  process.stdout.write(`[GEMINI] ✅ API key found!\n`);
  process.stdout.write(`[GEMINI] ✅ API key length: ${apiKey.length}\n`);
  process.stdout.write(`[GEMINI] ✅ API key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
  
  console.log('[GEMINI] ✅ API key found!');
  console.log('[GEMINI] ✅ API key length:', apiKey.length);
  console.log('[GEMINI] ✅ API key preview:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  console.error('[GEMINI] ✅ API key found, length:', apiKey.length); // Also log to stderr

  try {
    // Simplified prompt - only asking for correct/incorrect (yes/no)
    const prompt = questionType === 'code' 
      ? `Evaluate if the following coding answer is correct.

Question: ${questionText}

Expected Answer: ${correctAnswer}

User's Code Answer: ${userAnswer}

Check if the user's code is functionally correct and produces the expected result. Consider:
- Does it solve the problem correctly?
- Is the logic sound?
- Does it handle edge cases?

Respond ONLY with a JSON object in this exact format:
{"isCorrect": true}

or

{"isCorrect": false}

Use true if the answer is correct, false if incorrect. Do not provide any explanation, only the JSON response.`
      : `Evaluate if the following answer is correct.

Question: ${questionText}

Expected Answer: ${correctAnswer}

User's Answer: ${userAnswer}

Respond ONLY with a JSON object in this exact format:
{"isCorrect": true}

or

{"isCorrect": false}

Use true if the answer is correct, false if incorrect. Do not provide any explanation, only the JSON response.`;

    console.log('[GEMINI] 📝 Prompt created, length:', prompt.length);
    console.log('[GEMINI] 📝 Prompt preview:', prompt.substring(0, 200) + '...');
    console.error('[GEMINI] 📝 Making API request to Gemini...'); // Log to stderr for visibility

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    // Log masked URL for security
    const maskedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log('[GEMINI] 🌐 API URL (masked for logs):', maskedUrl);
    console.log('[GEMINI] 🌐 Full API URL length:', apiUrl.length);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a code evaluator. Respond only with JSON containing isCorrect (true/false). No explanations.

${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Very low temperature for consistent yes/no responses
        topK: 1,
        topP: 0.1,
        maxOutputTokens: 20, // Minimal tokens - just need true/false JSON
        responseMimeType: 'application/json', // Force JSON response
      },
    };

    console.log('[GEMINI] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[GEMINI] Response status:', response.status, response.statusText);
    console.error(`[GEMINI] Response status: ${response.status} ${response.statusText}`); // Also to stderr

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        errorText,
      };
      console.error('[GEMINI] ❌ API ERROR:', errorDetails);
      console.error('[GEMINI] ❌ API ERROR:', JSON.stringify(errorDetails, null, 2)); // Also to stderr
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('[GEMINI] ✅ Response received from Gemini API');
    console.log('[GEMINI] Response structure:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length || 0,
      firstCandidate: data.candidates?.[0] ? 'exists' : 'missing',
    });
    console.error('[GEMINI] ✅ Response received'); // Also to stderr
    
    // Extract content from Gemini response
    let content = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts[0] && parts[0].text) {
        content = parts[0].text.trim();
        console.log('[GEMINI] Extracted content:', content);
      } else {
        console.warn('[GEMINI] No text in parts:', parts);
      }
    } else {
      console.warn('[GEMINI] Unexpected response structure:', Object.keys(data));
    }

    if (!content) {
      console.error('[GEMINI] No content received:', data);
      throw new Error('No content received from Gemini API');
    }

    // Parse JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(content);
      console.log('[GEMINI] ✅ Parsed evaluation:', evaluation);
      console.error('[GEMINI] ✅ Parsed evaluation:', JSON.stringify(evaluation)); // Also to stderr
    } catch (parseError) {
      console.error('[GEMINI] ❌ Failed to parse JSON response:', {
        content,
        error: parseError,
      });
      console.error('[GEMINI] ❌ Parse error details:', JSON.stringify({ content, error: String(parseError) })); // Also to stderr
      // Fallback: try to extract true/false from text
      const contentLower = content.toLowerCase();
      if (contentLower.includes('true') || contentLower.includes('"isCorrect":true')) {
        evaluation = { isCorrect: true };
        console.log('[GEMINI] Fallback: extracted true');
        console.error('[GEMINI] Fallback: extracted true'); // Also to stderr
      } else if (contentLower.includes('false') || contentLower.includes('"isCorrect":false')) {
        evaluation = { isCorrect: false };
        console.log('[GEMINI] Fallback: extracted false');
        console.error('[GEMINI] Fallback: extracted false'); // Also to stderr
      } else {
        evaluation = { isCorrect: null };
        console.warn('[GEMINI] ⚠️ Fallback: could not extract boolean');
        console.error('[GEMINI] ⚠️ Fallback: could not extract boolean'); // Also to stderr
      }
    }

    // Ensure isCorrect is boolean or null
    const isCorrect = evaluation.isCorrect === true ? true : 
                     evaluation.isCorrect === false ? false : null;

    console.log('[GEMINI] ✅✅✅ FINAL RESULT:', {
      isCorrect,
      earnedPoints: isCorrect === true ? points : 0,
      points,
    });
    console.error(`[GEMINI] ✅✅✅ FINAL RESULT: isCorrect=${isCorrect}, earnedPoints=${isCorrect === true ? points : 0}`); // Also to stderr
    console.log('========================================');

    // Calculate points based on correctness
    let earnedPoints = 0;
    if (isCorrect === true) {
      earnedPoints = points;
    } else if (isCorrect === null) {
      earnedPoints = 0; // No partial credit for unclear answers
    }

    console.log('[GEMINI] Evaluation complete:', {
      isCorrect,
      earnedPoints,
      points,
    });

    return {
      isCorrect,
      earnedPoints,
      correctAnswer,
      userAnswer,
      feedback: isCorrect === true 
        ? 'Your answer is correct!' 
        : isCorrect === false 
        ? 'Your answer is incorrect. Please review the solution.'
        : 'Unable to evaluate answer. Please review manually.',
      improvements: isCorrect === false 
        ? ['Review the question requirements', 'Compare your answer with the expected solution']
        : [],
    };
  } catch (error) {
    const errorDetails = {
      error: String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('[GEMINI] ❌❌❌ ERROR EVALUATING:', errorDetails);
    console.error('[GEMINI] ❌❌❌ ERROR:', JSON.stringify(errorDetails, null, 2)); // Also to stderr with full details
    return {
      isCorrect: null,
      earnedPoints: 0,
      correctAnswer,
      userAnswer,
      feedback: 'Evaluation service temporarily unavailable. Please review manually.',
      improvements: ['Check your answer against the lesson content'],
    };
  }
}

