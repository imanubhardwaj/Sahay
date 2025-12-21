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
 * Evaluate subjective or code question using OpenAI API
 * Simplified to only check if answer is correct or not
 */
export async function evaluateSubjectiveOrCode(
  questionText: string,
  userAnswer: string,
  correctAnswer: string,
  questionType: 'subjective' | 'code',
  points: number = 10
): Promise<SubjectiveEvaluationResult> {
  const apiKey = process.env.NEXT_OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not found. Returning default evaluation.');
    return {
      isCorrect: null,
      earnedPoints: 0,
      correctAnswer,
      userAnswer,
      feedback: 'Automatic evaluation unavailable. Please review manually.',
      improvements: ['OpenAI API key not configured'],
    };
  }

  try {
    // Simplified prompt - only asking for correct/incorrect
    const prompt = questionType === 'code' 
      ? `Check if the following coding answer is correct.

Question: ${questionText}

Expected Answer: ${correctAnswer}

User's Code Answer: ${userAnswer}

Evaluate if the user's code is functionally correct and produces the expected result. Consider:
- Does it solve the problem correctly?
- Is the logic sound?
- Does it handle edge cases?

Respond ONLY with a JSON object in this exact format:
{"isCorrect": true}

or

{"isCorrect": false}

Use true if the answer is correct, false if incorrect.`
      : `Check if the following answer is correct.

Question: ${questionText}

Expected Answer: ${correctAnswer}

User's Answer: ${userAnswer}

Respond ONLY with a JSON object in this exact format:
{"isCorrect": true}

or

{"isCorrect": false}

Use true if the answer is correct, false if incorrect.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a code evaluator. Respond only with JSON containing isCorrect (true/false).',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 50, // Much smaller response - just need true/false
        response_format: { type: 'json_object' }, // Force JSON response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content, parseError);
      // Fallback: try to extract true/false from text
      const contentLower = content.toLowerCase();
      if (contentLower.includes('true') || contentLower.includes('correct')) {
        evaluation = { isCorrect: true };
      } else if (contentLower.includes('false') || contentLower.includes('incorrect')) {
        evaluation = { isCorrect: false };
      } else {
        evaluation = { isCorrect: null };
      }
    }

    // Ensure isCorrect is boolean or null
    const isCorrect = evaluation.isCorrect === true ? true : 
                     evaluation.isCorrect === false ? false : null;

    // Calculate points based on correctness
    let earnedPoints = 0;
    if (isCorrect === true) {
      earnedPoints = points;
    } else if (isCorrect === null) {
      earnedPoints = 0; // No partial credit for unclear answers
    }

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
    console.error('Error evaluating with OpenAI:', error);
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

