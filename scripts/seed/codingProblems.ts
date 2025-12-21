import CodingProblem from "../../src/models/CodingProblem";

export const seedCodingProblems = async () => {
  console.log("🌱 Seeding coding problems...");

  // Clear existing problems
  await CodingProblem.deleteMany({});
  console.log("🗑️ Cleared existing coding problems.");

  const problems = [
    // Easy Problems
    {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      difficulty: "easy",
      category: "Arrays",
      tags: ["array", "hash-table"],
      starterCode: {
        javascript: `function solution(input) {
  // Parse input
  const [numsStr, targetStr] = input.split('\\n');
  const nums = JSON.parse(numsStr);
  const target = parseInt(targetStr);
  
  // Your solution here
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    nums = eval(lines[0])
    target = int(lines[1])
    
    # Your solution here
    
    return str(result)`,
      },
      testCases: [
        { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isHidden: false },
        { input: "[3,2,4]\n6", expectedOutput: "[1,2]", isHidden: false },
        { input: "[3,3]\n6", expectedOutput: "[0,1]", isHidden: true },
      ],
      hints: ["Use a hash map to store seen numbers", "For each number, check if target - num exists in map"],
      points: 10,
    },
    {
      title: "Reverse String",
      description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: "hello"
Output: "olleh"`,
      difficulty: "easy",
      category: "Strings",
      tags: ["string", "two-pointers"],
      starterCode: {
        javascript: `function solution(input) {
  // Your solution here
  // Reverse the input string
  
  return result;
}`,
        python: `def solution(input):
    # Your solution here
    # Reverse the input string
    
    return result`,
      },
      testCases: [
        { input: "hello", expectedOutput: "olleh", isHidden: false },
        { input: "world", expectedOutput: "dlrow", isHidden: false },
        { input: "a", expectedOutput: "a", isHidden: true },
      ],
      hints: ["Use two pointers, one at start and one at end", "Swap characters until pointers meet"],
      points: 10,
    },
    {
      title: "Palindrome Check",
      description: `Given a string s, return true if it is a palindrome, or false otherwise.

A string is a palindrome if it reads the same forward and backward.

Example:
Input: "racecar"
Output: "true"`,
      difficulty: "easy",
      category: "Strings",
      tags: ["string", "two-pointers"],
      starterCode: {
        javascript: `function solution(input) {
  // Check if input is a palindrome
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    # Check if input is a palindrome
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "racecar", expectedOutput: "true", isHidden: false },
        { input: "hello", expectedOutput: "false", isHidden: false },
        { input: "a", expectedOutput: "true", isHidden: true },
      ],
      hints: ["Compare string with its reverse", "Or use two pointers from both ends"],
      points: 10,
    },
    {
      title: "FizzBuzz",
      description: `Given an integer n, return a string array answer where:
- answer[i] == "FizzBuzz" if i is divisible by 3 and 5
- answer[i] == "Fizz" if i is divisible by 3
- answer[i] == "Buzz" if i is divisible by 5
- answer[i] == i (as a string) if none of the above

Example:
Input: 5
Output: ["1","2","Fizz","4","Buzz"]`,
      difficulty: "easy",
      category: "Basic",
      tags: ["math", "string"],
      starterCode: {
        javascript: `function solution(input) {
  const n = parseInt(input);
  // Generate FizzBuzz array from 1 to n
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    n = int(input)
    # Generate FizzBuzz list from 1 to n
    
    return str(result)`,
      },
      testCases: [
        { input: "5", expectedOutput: '["1","2","Fizz","4","Buzz"]', isHidden: false },
        { input: "15", expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isHidden: false },
      ],
      hints: ["Check divisibility by 15 first (3 and 5)", "Use modulo operator %"],
      points: 10,
    },
    // Medium Problems
    {
      title: "Valid Parentheses",
      description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example:
Input: "()[]{}"
Output: "true"`,
      difficulty: "medium",
      category: "Stack",
      tags: ["string", "stack"],
      starterCode: {
        javascript: `function solution(input) {
  // Check if parentheses are valid
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    # Check if parentheses are valid
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "()[]{}", expectedOutput: "true", isHidden: false },
        { input: "(]", expectedOutput: "false", isHidden: false },
        { input: "([)]", expectedOutput: "false", isHidden: true },
        { input: "{[]}", expectedOutput: "true", isHidden: true },
      ],
      hints: ["Use a stack data structure", "Push opening brackets, pop for closing", "Check if popped bracket matches"],
      points: 20,
    },
    {
      title: "Maximum Subarray",
      description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example:
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.`,
      difficulty: "medium",
      category: "Dynamic Programming",
      tags: ["array", "dynamic-programming", "divide-and-conquer"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Find maximum subarray sum
  
  return result.toString();
}`,
        python: `def solution(input):
    nums = eval(input)
    # Find maximum subarray sum
    
    return str(result)`,
      },
      testCases: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false },
        { input: "[1]", expectedOutput: "1", isHidden: false },
        { input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: true },
      ],
      hints: ["Kadane's algorithm is optimal", "Track current sum and max sum", "Reset current sum when it goes negative"],
      points: 20,
    },
    {
      title: "Binary Search",
      description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.

If target exists, return its index. Otherwise, return -1.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4`,
      difficulty: "medium",
      category: "Binary Search",
      tags: ["array", "binary-search"],
      starterCode: {
        javascript: `function solution(input) {
  const [numsStr, targetStr] = input.split('\\n');
  const nums = JSON.parse(numsStr);
  const target = parseInt(targetStr);
  
  // Implement binary search
  
  return result.toString();
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    nums = eval(lines[0])
    target = int(lines[1])
    
    # Implement binary search
    
    return str(result)`,
      },
      testCases: [
        { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4", isHidden: false },
        { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1", isHidden: false },
        { input: "[5]\n5", expectedOutput: "0", isHidden: true },
      ],
      hints: ["Use two pointers: left and right", "Calculate mid = (left + right) / 2", "Adjust pointers based on comparison"],
      points: 20,
    },
    // Hard Problems
    {
      title: "Longest Palindromic Substring",
      description: `Given a string s, return the longest palindromic substring in s.

Example:
Input: "babad"
Output: "bab" (or "aba" is also acceptable)`,
      difficulty: "hard",
      category: "Dynamic Programming",
      tags: ["string", "dynamic-programming"],
      starterCode: {
        javascript: `function solution(input) {
  // Find longest palindromic substring
  
  return result;
}`,
        python: `def solution(input):
    # Find longest palindromic substring
    
    return result`,
      },
      testCases: [
        { input: "babad", expectedOutput: "bab", isHidden: false },
        { input: "cbbd", expectedOutput: "bb", isHidden: false },
        { input: "a", expectedOutput: "a", isHidden: true },
      ],
      hints: ["Expand around center approach", "Consider both odd and even length palindromes", "Track the start and max length"],
      points: 30,
    },
    {
      title: "Merge K Sorted Lists",
      description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

For simplicity, input/output are arrays of arrays.

Example:
Input: [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]`,
      difficulty: "hard",
      category: "Linked Lists",
      tags: ["linked-list", "divide-and-conquer", "heap"],
      starterCode: {
        javascript: `function solution(input) {
  const lists = JSON.parse(input);
  // Merge k sorted lists
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lists = eval(input)
    # Merge k sorted lists
    
    return str(result)`,
      },
      testCases: [
        { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: false },
        { input: "[[]]", expectedOutput: "[]", isHidden: true },
      ],
      hints: ["Use a min-heap/priority queue", "Or use divide and conquer to merge pairs", "Flatten all lists and sort is O(N log N)"],
      points: 30,
    },
    {
      title: "Trapping Rain Water",
      description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example:
Input: [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6`,
      difficulty: "hard",
      category: "Two Pointers",
      tags: ["array", "two-pointers", "dynamic-programming", "stack"],
      starterCode: {
        javascript: `function solution(input) {
  const height = JSON.parse(input);
  // Calculate trapped rain water
  
  return result.toString();
}`,
        python: `def solution(input):
    height = eval(input)
    # Calculate trapped rain water
    
    return str(result)`,
      },
      testCases: [
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false },
        { input: "[4,2,0,3,2,5]", expectedOutput: "9", isHidden: false },
        { input: "[1,2,3,4,5]", expectedOutput: "0", isHidden: true },
      ],
      hints: ["Two pointer approach is O(n) space O(1)", "Water at position i = min(maxLeft, maxRight) - height[i]", "Track max from left and right as you go"],
      points: 30,
    },
  ];

  await CodingProblem.insertMany(problems);
  console.log(`✅ Seeded ${problems.length} coding problems`);

  return problems;
};

