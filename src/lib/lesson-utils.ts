/**
 * Utility functions for extracting coding challenges from lesson content
 */

export interface CodingChallenge {
  task1?: string;
  task2?: string;
  fullText: string;
}

/**
 * Extracts coding challenges from lesson markdown content
 * Looks for "## Coding Challenge" section and extracts Task 1 and Task 2
 */
export function extractCodingChallenge(
  content: string
): CodingChallenge | null {
  if (!content) return null;

  // Find the Coding Challenge section
  const challengeMatch = content.match(
    /## Coding Challenge\s*\n([\s\S]*?)(?=\n## |$)/i
  );
  if (!challengeMatch) return null;

  const challengeSection = challengeMatch[1];

  // Extract Task 1
  const task1Match = challengeSection.match(
    /\*\*Task 1\*\*:\s*(.+?)(?=\n\*\*Task 2\*\*:|$)/
  );
  const task1 = task1Match ? task1Match[1].trim() : undefined;

  // Extract Task 2
  const task2Match = challengeSection.match(
    /\*\*Task 2\*\*:\s*(.+?)(?=\n\*\*Task |$)/
  );
  const task2 = task2Match ? task2Match[1].trim() : undefined;

  if (!task1 && !task2) return null;

  return {
    task1,
    task2,
    fullText: challengeSection.trim(),
  };
}

/**
 * Determines the language for a module based on its name
 */
export function getModuleLanguage(
  moduleName: string
): "javascript" | "python" | "typescript" {
  const name = moduleName.toLowerCase();

  if (name.includes("python")) {
    return "python";
  }
  if (name.includes("typescript") || name.includes("ts")) {
    return "typescript";
  }
  // Default to JavaScript for JavaScript modules
  return "javascript";
}

/**
 * Creates a coding problem description from a coding challenge
 */
export function createProblemDescription(
  challenge: CodingChallenge,
  lessonTitle: string
): string {
  let description = `# ${lessonTitle} - Coding Challenge\n\n`;

  if (challenge.task1) {
    description += `## Task 1\n${challenge.task1}\n\n`;
  }

  if (challenge.task2) {
    description += `## Task 2\n${challenge.task2}\n\n`;
  }

  description += `\n**Instructions:**\n- Write your solution in the code editor\n- Click "Run" to test your code\n- Make sure your code handles the requirements correctly`;

  return description;
}
