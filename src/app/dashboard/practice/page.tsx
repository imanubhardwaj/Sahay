"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { Button } from "../../../../packages/ui";

interface CodingProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  starterCode: {
    javascript?: string;
    python?: string;
    typescript?: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  hints: string[];
  points: number;
  solvedCount: number;
  attemptCount: number;
  userStatus?: string;
}

interface Stats {
  total: number;
  solved: number;
  attempted: number;
  easy: number;
  medium: number;
  hard: number;
}

// Language/Tech to Categories mapping
const LANGUAGE_TECH_CATEGORIES: Record<string, string[]> = {
  DSA: ["Array", "Linked List", "Tree", "Graph"],
  JavaScript: ["Array", "Functions", "Promises", "Closures"],
  Python: ["Array", "Tuple", "Dictionary", "List", "Async/Await"],
};

function PracticePageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedLanguageTech, setSelectedLanguageTech] =
    useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<
    "javascript" | "python" | "typescript"
  >("javascript");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    testResults: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
      error?: string;
    }>;
  } | null>(null);
  const [isLessonChallenge, setIsLessonChallenge] = useState(false);

  // Filter problems based on selected language/tech and category
  const filteredProblems = useMemo(() => {
    let filtered = problems;

    // If a specific language/tech is selected and category is "all", filter by language/tech
    if (selectedLanguageTech !== "all" && selectedCategory === "all") {
      const techCategories =
        LANGUAGE_TECH_CATEGORIES[selectedLanguageTech] || [];
      filtered = filtered.filter((problem) =>
        techCategories.includes(problem.category)
      );
    }
    // If both language/tech and category are selected, the API already filtered by category
    // but we still need to ensure the category belongs to the selected language/tech
    else if (selectedLanguageTech !== "all" && selectedCategory !== "all") {
      const techCategories =
        LANGUAGE_TECH_CATEGORIES[selectedLanguageTech] || [];
      // Verify that the selected category belongs to the selected language/tech
      if (techCategories.includes(selectedCategory)) {
        // API already filtered by category, so we just verify
        filtered = filtered.filter(
          (problem) => problem.category === selectedCategory
        );
      } else {
        // Category doesn't belong to selected language/tech, return empty
        filtered = [];
      }
    }

    return filtered;
  }, [problems, selectedLanguageTech, selectedCategory]);

  // Reset category when language/tech changes
  useEffect(() => {
    setSelectedCategory("all");
  }, [selectedLanguageTech]);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { getAuthHeaders } = await import("@/lib/token-storage");

      let url = "/api/coding-problems";
      const params = new URLSearchParams();
      if (selectedDifficulty !== "all")
        params.append("difficulty", selectedDifficulty);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setProblems(result.data || []);
        setCategories(result.categories || []);
        setStats(result.stats || null);
      } else {
        setFetchError(result.error || "Failed to load problems");
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      setFetchError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [selectedDifficulty, selectedCategory]);

  // Check if coming from lesson page with coding challenge
  useEffect(() => {
    const fromLesson = searchParams.get("fromLesson");
    if (fromLesson === "true") {
      const task1 = searchParams.get("task1");
      const task2 = searchParams.get("task2");
      const lessonTitle = searchParams.get("lessonTitle") || "Coding Challenge";
      const moduleLanguage = searchParams.get("language") as
        | "javascript"
        | "python"
        | "typescript"
        | null;
      const moduleName = searchParams.get("moduleName") || "";

      if (task1 || task2) {
        setIsLessonChallenge(true);

        // Set language from module
        if (moduleLanguage) {
          setLanguage(moduleLanguage);
        }

        // Create a temporary coding problem from the lesson challenge
        const challengeDescription = `# ${lessonTitle}\n\n${
          task1 ? `## Task 1\n${task1}\n\n` : ""
        }${
          task2 ? `## Task 2\n${task2}\n\n` : ""
        }\n**Instructions:**\n- Write your solution in the code editor\n- Click "Run" to test your code\n- Make sure your code handles the requirements correctly`;

        const lessonProblem: CodingProblem = {
          _id: `lesson-challenge-${Date.now()}`,
          title: `${lessonTitle} - Coding Challenge`,
          description: challengeDescription,
          difficulty: "medium",
          category: moduleName || "Lesson Challenge",
          tags: ["lesson", "practice"],
          starterCode: {
            [moduleLanguage || "javascript"]:
              moduleLanguage === "python"
                ? `# Write your solution here\ndef solution():\n    # Your code here\n    pass`
                : `// Write your solution here\nfunction solution() {\n  // Your code here\n  return null;\n}`,
          },
          testCases: [
            {
              input: "",
              expectedOutput: "",
              isHidden: false,
            },
          ],
          hints: [
            "Review the lesson content for guidance",
            "Test your code step by step",
          ],
          points: 20,
          solvedCount: 0,
          attemptCount: 0,
        };

        setSelectedProblem(lessonProblem);
        setCode(
          lessonProblem.starterCode[moduleLanguage || "javascript"] || ""
        );
        setLoading(false);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user && !isLessonChallenge) {
      fetchProblems();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, fetchProblems, isLessonChallenge]);

  const selectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[language] || getDefaultCode(language));
    setOutput("");
    setTestResults(null);
  };

  const getDefaultCode = (lang: string) => {
    if (lang === "javascript") {
      return `// Write your solution here
function solution(input) {
  // Your code here
  return input;
}`;
    }
    if (lang === "python") {
      return `# Write your solution here
def solution(input):
    # Your code here
    return input`;
    }
    if (lang === "typescript") {
      return `// Write your solution here
function solution(input: string): string {
  // Your code here
  return input;
}`;
    }
    return "";
  };

  const handleLanguageChange = (
    newLang: "javascript" | "python" | "typescript"
  ) => {
    setLanguage(newLang);
    if (selectedProblem) {
      setCode(selectedProblem.starterCode[newLang] || getDefaultCode(newLang));
    }
  };

  const runCode = async () => {
    if (!selectedProblem) return;

    setIsRunning(true);
    setOutput("Running code...");
    setTestResults(null);

    try {
      // For lesson challenges (no test cases), just execute and show output
      if (
        isLessonChallenge &&
        selectedProblem._id.startsWith("lesson-challenge-")
      ) {
        try {
          // Simple execution for lesson challenges
          const wrappedCode = `
            "use strict";
            ${code}
            
            // Try to execute common function names
            let __result__ = null;
            try {
              if (typeof solution === 'function') {
                __result__ = solution();
              } else if (typeof main === 'function') {
                __result__ = main();
              } else {
                __result__ = "Code executed successfully. Review your solution against the requirements.";
              }
            } catch (e) {
              throw e;
            }
            __result__;
          `;

          const fn = new Function(wrappedCode);
          const result = fn();

          setOutput(
            `✅ Code executed successfully!\n\nOutput: ${
              result !== undefined && result !== null
                ? String(result)
                : "No return value"
            }\n\nNote: For lesson challenges, verify your solution matches the requirements manually.`
          );
          setTestResults({
            passed: true,
            testsPassed: 1,
            totalTests: 1,
            testResults: [
              {
                input: "N/A",
                expectedOutput: "N/A",
                actualOutput: String(result || "Code executed"),
                passed: true,
              },
            ],
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          setOutput(`⚠️ Code Error:\n${errorMessage}`);
          setTestResults({
            passed: false,
            testsPassed: 0,
            totalTests: 1,
            testResults: [
              {
                input: "N/A",
                expectedOutput: "N/A",
                actualOutput: "",
                passed: false,
                error: errorMessage,
              },
            ],
          });
        } finally {
          setIsRunning(false);
        }
        return;
      }

      // For regular coding problems with test cases
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/coding-problems/submit", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          problemId: selectedProblem._id,
          code,
          language,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResults(result.data);

        // Check for execution errors first
        if (result.data.executionError) {
          setOutput(`⚠️ Code Error:\n${result.data.executionError}`);
        } else if (result.data.passed) {
          let outputMsg = `✅ All tests passed! (${result.data.testsPassed}/${result.data.totalTests})`;
          if (result.data.pointsEarned > 0) {
            outputMsg += `\n🎉 +${result.data.pointsEarned} points earned!`;
          }
          setOutput(outputMsg);
          // Refresh problems to update status
          fetchProblems();
        } else {
          setOutput(
            `❌ ${result.data.testsPassed}/${result.data.totalTests} tests passed`
          );
        }
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput("Error running code. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "solved":
        return "✅";
      case "attempted":
        return "🔄";
      default:
        return "⬜";
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Login Required
            </h3>
            <p className="text-gray-400 mb-6">
              Please login to access coding practice
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {!selectedProblem ? (
          // Problem List View
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Practice Coding
              </h1>
              <p className="text-gray-400">
                Solve problems and improve your skills
              </p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-3xl font-bold text-white">
                    {stats.solved}
                  </div>
                  <div className="text-sm text-gray-400">Solved</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-3xl font-bold text-green-500">
                    {stats.easy}
                  </div>
                  <div className="text-sm text-gray-400">Easy</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-3xl font-bold text-yellow-500">
                    {stats.medium}
                  </div>
                  <div className="text-sm text-gray-400">Medium</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-3xl font-bold text-red-500">
                    {stats.hard}
                  </div>
                  <div className="text-sm text-gray-400">Hard</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-4 mb-6">
              {/* Language/Tech Filter - First Level */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 self-center">
                  Language/Tech:
                </span>
                {["all", "DSA", "JavaScript", "Python"].map((tech) => (
                  <Button
                    key={tech}
                    onClick={() => setSelectedLanguageTech(tech)}
                    className={`!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
                      selectedLanguageTech === tech
                        ? "!bg-gradient-to-r from-green-600 to-blue-600 !text-white !shadow-lg"
                        : "!bg-gray-800 !text-gray-300 !hover:bg-gray-700"
                    }`}
                  >
                    {tech === "all" ? "All" : tech}
                  </Button>
                ))}
              </div>

              {/* Category Filter - Second Level (Dynamic) */}
              {/* {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400 self-center">
                    Category:
                  </span>
                  <Button
                    onClick={() => setSelectedCategory("all")}
                    className={`!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
                      selectedCategory === "all"
                        ? "!bg-white !text-black"
                        : "!bg-gray-800 !text-gray-300 !hover:bg-gray-700"
                    }`}
                  >
                    All Categories
                  </Button>
                  {availableCategories.map((cat) => (
                    <Button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
                        selectedCategory === cat
                          ? "!bg-white !text-black"
                          : "!bg-gray-800 !text-gray-300 !hover:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )} */}

              {/* Difficulty Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 self-center">
                  Difficulty:
                </span>
                {["all", "easy", "medium", "hard"].map((diff) => (
                  <Button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
                      selectedDifficulty === diff
                        ? "!bg-white !text-black"
                        : "!bg-gray-800 !text-gray-300 !hover:bg-gray-700"
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Problems List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              </div>
            ) : fetchError ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error Loading Problems
                </h3>
                <p className="text-gray-400 mb-4">{fetchError}</p>
                <Button
                  onClick={fetchProblems}
                  className="!px-6 !py-2 !rounded-md !text-sm !font-medium !transition-colors !bg-white !text-black !hover:bg-gray-100"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">🧩</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Problems Found
                </h3>
                <p className="text-gray-400">
                  {selectedLanguageTech !== "all"
                    ? `No problems available for ${selectedLanguageTech}. Try selecting a different language/tech or category.`
                    : "Check back soon for coding challenges!"}
                </p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Difficulty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredProblems.map((problem) => (
                      <tr
                        key={problem._id}
                        onClick={() => selectProblem(problem)}
                        className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4 text-lg">
                          {getStatusIcon(problem.userStatus)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white font-medium">
                            {problem.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {problem.solvedCount} solved ·{" "}
                            {problem.attemptCount} attempts
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-400">
                          {problem.category}
                        </td>
                        <td className="px-4 py-4 text-right text-white font-medium">
                          {problem.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Code Editor View
          <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setSelectedProblem(null)}
                  className="!p-2 !rounded-md !transition-colors !cursor-pointer !hover:bg-gray-800"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
                <div>
                  <h2 className="text-white font-semibold">
                    {selectedProblem.title}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(
                      selectedProblem.difficulty
                    )}`}
                  >
                    {selectedProblem.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) =>
                    handleLanguageChange(
                      e.target.value as "javascript" | "python" | "typescript"
                    )
                  }
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                </select>
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors !bg-green-600 !hover:bg-green-700 !disabled:bg-gray-600 !text-white !flex !items-center !gap-2"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Running...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Run
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Problem Description */}
              <div className="w-2/5 bg-gray-900 border-r border-gray-800 overflow-y-auto p-6">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Description
                  </h3>
                  <div className="text-gray-300 whitespace-pre-wrap mb-6">
                    {selectedProblem.description}
                  </div>

                  {/* Test Cases */}
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Examples
                  </h3>
                  <div className="space-y-4">
                    {selectedProblem.testCases
                      .filter((tc) => !tc.isHidden)
                      .slice(0, 2)
                      .map((tc, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">
                            Input:
                          </div>
                          <pre className="text-white text-sm mb-3 font-mono">
                            {tc.input}
                          </pre>
                          <div className="text-sm text-gray-400 mb-1">
                            Expected Output:
                          </div>
                          <pre className="text-white text-sm font-mono">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      ))}
                  </div>

                  {/* Hints */}
                  {selectedProblem.hints.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Hints
                      </h3>
                      <ul className="list-disc list-inside text-gray-400 space-y-2">
                        {selectedProblem.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedProblem.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProblem.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor & Output */}
              <div className="flex-1 flex flex-col">
                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={language}
                  />
                </div>

                {/* Output Panel */}
                <div className="h-48 bg-gray-950 border-t border-gray-800">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <span className="text-sm font-medium text-gray-400">
                      Output
                    </span>
                    {testResults && (
                      <span
                        className={`text-sm font-medium ${
                          testResults.passed ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {testResults.testsPassed}/{testResults.totalTests} tests
                        passed
                      </span>
                    )}
                  </div>
                  <div className="p-4 overflow-y-auto h-36">
                    {output ? (
                      <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                        {output}
                      </pre>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Click &quot;Run&quot; to see output
                      </p>
                    )}

                    {testResults && testResults.testResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {testResults.testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              result.passed
                                ? "bg-green-500/10"
                                : "bg-red-500/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={
                                  result.passed
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {result.passed ? "✓" : "✗"}
                              </span>
                              <span className="text-sm text-gray-400">
                                Test Case {index + 1}
                              </span>
                            </div>
                            {!result.passed && result.error && (
                              <pre className="text-xs text-red-400 mt-1">
                                {result.error}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
          </div>
        </DashboardLayout>
      }
    >
      <PracticePageContent />
    </Suspense>
  );
}
