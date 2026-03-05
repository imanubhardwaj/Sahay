import CodingProblem from "../../src/models/CodingProblem";

export const seedCodingProblems = async () => {
  // Clear existing problems
  await CodingProblem.deleteMany({});

  const problems = [
    // ========== DSA - ARRAY PROBLEMS ==========
    {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      difficulty: "easy",
      category: "Array",
      tags: ["array", "hash-table"],
      starterCode: {
        javascript: `function solution(input) {
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
      hints: [
        "Use a hash map to store seen numbers",
        "For each number, check if target - num exists in map",
      ],
      points: 10,
    },
    // DSA - Array Problems (continued)
    {
      title: "Best Time to Buy and Sell Stock",
      description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example:
Input: [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.`,
      difficulty: "easy",
      category: "Array",
      tags: ["array", "dynamic-programming"],
      starterCode: {
        javascript: `function solution(input) {
  const prices = JSON.parse(input);
  // Find maximum profit
  
  return result.toString();
}`,
        python: `def solution(input):
    prices = eval(input)
    # Find maximum profit
    
    return str(result)`,
      },
      testCases: [
        { input: "[7,1,5,3,6,4]", expectedOutput: "5", isHidden: false },
        { input: "[7,6,4,3,1]", expectedOutput: "0", isHidden: false },
        { input: "[2,4,1]", expectedOutput: "2", isHidden: true },
      ],
      hints: [
        "Track minimum price seen so far",
        "Calculate profit for each day",
        "Keep track of maximum profit",
      ],
      points: 10,
    },
    {
      title: "Contains Duplicate",
      description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example:
Input: [1,2,3,1]
Output: "true"`,
      difficulty: "easy",
      category: "Array",
      tags: ["array", "hash-table"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Check for duplicates
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    nums = eval(input)
    # Check for duplicates
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "[1,2,3,1]", expectedOutput: "true", isHidden: false },
        { input: "[1,2,3,4]", expectedOutput: "false", isHidden: false },
        {
          input: "[1,1,1,3,3,4,3,2,4,2]",
          expectedOutput: "true",
          isHidden: true,
        },
      ],
      hints: [
        "Use a Set or hash map",
        "If element already exists, return true",
        "Time complexity O(n), space O(n)",
      ],
      points: 10,
    },
    {
      title: "Product of Array Except Self",
      description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operator.

Example:
Input: [1,2,3,4]
Output: [24,12,8,6]`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "prefix-sum"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Calculate product except self
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    nums = eval(input)
    # Calculate product except self
    
    return str(result)`,
      },
      testCases: [
        { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]", isHidden: false },
        {
          input: "[-1,1,0,-3,3]",
          expectedOutput: "[0,0,9,0,0]",
          isHidden: false,
        },
        { input: "[2,3,4,5]", expectedOutput: "[60,40,30,24]", isHidden: true },
      ],
      hints: [
        "Use prefix and suffix products",
        "First pass: calculate left products",
        "Second pass: multiply by right products",
      ],
      points: 20,
    },
    {
      title: "Maximum Product Subarray",
      description: `Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.

Example:
Input: [2,3,-2,4]
Output: 6
Explanation: [2,3] has the largest product 6.`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "dynamic-programming"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Find maximum product subarray
  
  return result.toString();
}`,
        python: `def solution(input):
    nums = eval(input)
    # Find maximum product subarray
    
    return str(result)`,
      },
      testCases: [
        { input: "[2,3,-2,4]", expectedOutput: "6", isHidden: false },
        { input: "[-2,0,-1]", expectedOutput: "0", isHidden: false },
        { input: "[-2,3,-4]", expectedOutput: "24", isHidden: true },
      ],
      hints: [
        "Track both max and min product",
        "Negative numbers can flip min to max",
        "Reset when encountering zero",
      ],
      points: 20,
    },
    {
      title: "Find Minimum in Rotated Sorted Array",
      description: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array.

Example:
Input: [3,4,5,1,2]
Output: 1`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "binary-search"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Find minimum in rotated sorted array
  
  return result.toString();
}`,
        python: `def solution(input):
    nums = eval(input)
    # Find minimum in rotated sorted array
    
    return str(result)`,
      },
      testCases: [
        { input: "[3,4,5,1,2]", expectedOutput: "1", isHidden: false },
        { input: "[4,5,6,7,0,1,2]", expectedOutput: "0", isHidden: false },
        { input: "[11,13,15,17]", expectedOutput: "11", isHidden: true },
      ],
      hints: [
        "Use binary search",
        "Compare mid with right element",
        "If nums[mid] > nums[right], search right half",
      ],
      points: 20,
    },
    {
      title: "3Sum",
      description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Example:
Input: [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "two-pointers", "sorting"],
      starterCode: {
        javascript: `function solution(input) {
  const nums = JSON.parse(input);
  // Find all unique triplets that sum to zero
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    nums = eval(input)
    # Find all unique triplets that sum to zero
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[-1,0,1,2,-1,-4]",
          expectedOutput: "[[-1,-1,2],[-1,0,1]]",
          isHidden: false,
        },
        { input: "[0,1,1]", expectedOutput: "[]", isHidden: false },
        { input: "[0,0,0]", expectedOutput: "[[0,0,0]]", isHidden: true },
      ],
      hints: [
        "Sort the array first",
        "Fix one element, use two pointers for the rest",
        "Skip duplicates",
      ],
      points: 20,
    },
    {
      title: "Container With Most Water",
      description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Example:
Input: [1,8,6,2,5,4,8,3,7]
Output: 49`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "two-pointers", "greedy"],
      starterCode: {
        javascript: `function solution(input) {
  const height = JSON.parse(input);
  // Find container with most water
  
  return result.toString();
}`,
        python: `def solution(input):
    height = eval(input)
    # Find container with most water
    
    return str(result)`,
      },
      testCases: [
        { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49", isHidden: false },
        { input: "[1,1]", expectedOutput: "1", isHidden: false },
        { input: "[4,3,2,1,4]", expectedOutput: "16", isHidden: true },
      ],
      hints: [
        "Use two pointers at both ends",
        "Calculate area = min(height[left], height[right]) * width",
        "Move pointer with smaller height",
      ],
      points: 20,
    },
    {
      title: "Rotate Array",
      description: `Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.

Example:
Input: nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "math", "two-pointers"],
      starterCode: {
        javascript: `function solution(input) {
  const [numsStr, kStr] = input.split('\\n');
  const nums = JSON.parse(numsStr);
  const k = parseInt(kStr);
  // Rotate array to the right by k steps
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    nums = eval(lines[0])
    k = int(lines[1])
    # Rotate array to the right by k steps
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5,6,7]\n3",
          expectedOutput: "[5,6,7,1,2,3,4]",
          isHidden: false,
        },
        {
          input: "[-1,-100,3,99]\n2",
          expectedOutput: "[3,99,-1,-100]",
          isHidden: false,
        },
        { input: "[1,2]\n1", expectedOutput: "[2,1]", isHidden: true },
      ],
      hints: [
        "Reverse entire array",
        "Reverse first k elements",
        "Reverse remaining elements",
      ],
      points: 20,
    },
    {
      title: "Merge Intervals",
      description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example:
Input: [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "sorting"],
      starterCode: {
        javascript: `function solution(input) {
  const intervals = JSON.parse(input);
  // Merge overlapping intervals
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    intervals = eval(input)
    # Merge overlapping intervals
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[[1,3],[2,6],[8,10],[15,18]]",
          expectedOutput: "[[1,6],[8,10],[15,18]]",
          isHidden: false,
        },
        { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]", isHidden: false },
        { input: "[[1,4],[2,3]]", expectedOutput: "[[1,4]]", isHidden: true },
      ],
      hints: [
        "Sort intervals by start time",
        "Check if current interval overlaps with previous",
        "Merge if overlapping, otherwise add new",
      ],
      points: 20,
    },
    {
      title: "Spiral Matrix",
      description: `Given an m x n matrix, return all elements of the matrix in spiral order.

Example:
Input: [[1,2,3],[4,5,6],[7,8,9]]
Output: [1,2,3,6,9,8,7,4,5]`,
      difficulty: "medium",
      category: "Array",
      tags: ["array", "matrix", "simulation"],
      starterCode: {
        javascript: `function solution(input) {
  const matrix = JSON.parse(input);
  // Return elements in spiral order
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    matrix = eval(input)
    # Return elements in spiral order
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[[1,2,3],[4,5,6],[7,8,9]]",
          expectedOutput: "[1,2,3,6,9,8,7,4,5]",
          isHidden: false,
        },
        {
          input: "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
          expectedOutput: "[1,2,3,4,8,12,11,10,9,5,6,7]",
          isHidden: false,
        },
        { input: "[[1]]", expectedOutput: "[1]", isHidden: true },
      ],
      hints: [
        "Use four boundaries: top, bottom, left, right",
        "Traverse right, down, left, up",
        "Update boundaries after each direction",
      ],
      points: 20,
    },
    // ========== DSA - LINKED LIST PROBLEMS ==========
    {
      title: "Reverse Linked List",
      description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

For simplicity, input/output are arrays.

Example:
Input: [1,2,3,4,5]
Output: [5,4,3,2,1]`,
      difficulty: "easy",
      category: "Linked List",
      tags: ["linked-list"],
      starterCode: {
        javascript: `function solution(input) {
  const head = JSON.parse(input);
  // Reverse the linked list
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    head = eval(input)
    # Reverse the linked list
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]",
          expectedOutput: "[5,4,3,2,1]",
          isHidden: false,
        },
        { input: "[1,2]", expectedOutput: "[2,1]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: true },
      ],
      hints: [
        "Use three pointers: prev, curr, next",
        "Iterate and reverse links",
        "Return the new head",
      ],
      points: 10,
    },
    {
      title: "Merge Two Sorted Lists",
      description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists in a sorted order. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

Example:
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]`,
      difficulty: "easy",
      category: "Linked List",
      tags: ["linked-list", "recursion"],
      starterCode: {
        javascript: `function solution(input) {
  const [list1Str, list2Str] = input.split('\\n');
  const list1 = JSON.parse(list1Str);
  const list2 = JSON.parse(list2Str);
  // Merge two sorted lists
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    list1 = eval(lines[0])
    list2 = eval(lines[1])
    # Merge two sorted lists
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,4]\n[1,3,4]",
          expectedOutput: "[1,1,2,3,4,4]",
          isHidden: false,
        },
        { input: "[]\n[]", expectedOutput: "[]", isHidden: false },
        { input: "[]\n[0]", expectedOutput: "[0]", isHidden: true },
      ],
      hints: [
        "Use a dummy node",
        "Compare values and link smaller one",
        "Append remaining list at the end",
      ],
      points: 10,
    },
    {
      title: "Linked List Cycle",
      description: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.

Return true if there is a cycle in the linked list. Otherwise, return false.

Example:
Input: head = [3,2,0,-4], pos = 1 (cycle at index 1)
Output: "true"`,
      difficulty: "easy",
      category: "Linked List",
      tags: ["linked-list", "two-pointers", "hash-table"],
      starterCode: {
        javascript: `function solution(input) {
  const [values, pos] = JSON.parse(input);
  // Detect cycle in linked list
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    values, pos = eval(input)
    # Detect cycle in linked list
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "[[3,2,0,-4],1]", expectedOutput: "true", isHidden: false },
        { input: "[[1,2],0]", expectedOutput: "true", isHidden: false },
        { input: "[[1],-1]", expectedOutput: "false", isHidden: true },
      ],
      hints: [
        "Use Floyd's cycle detection (tortoise and hare)",
        "Two pointers: slow moves 1 step, fast moves 2 steps",
        "If they meet, there's a cycle",
      ],
      points: 10,
    },
    {
      title: "Remove Nth Node From End",
      description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

Example:
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]`,
      difficulty: "medium",
      category: "Linked List",
      tags: ["linked-list", "two-pointers"],
      starterCode: {
        javascript: `function solution(input) {
  const [headStr, nStr] = input.split('\\n');
  const head = JSON.parse(headStr);
  const n = parseInt(nStr);
  // Remove nth node from end
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    head = eval(lines[0])
    n = int(lines[1])
    # Remove nth node from end
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]\n2",
          expectedOutput: "[1,2,3,5]",
          isHidden: false,
        },
        { input: "[1]\n1", expectedOutput: "[]", isHidden: false },
        { input: "[1,2]\n1", expectedOutput: "[1]", isHidden: true },
      ],
      hints: [
        "Use two pointers",
        "Move first pointer n steps ahead",
        "Then move both until first reaches end",
      ],
      points: 20,
    },
    {
      title: "Add Two Numbers",
      description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

Example:
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.`,
      difficulty: "medium",
      category: "Linked List",
      tags: ["linked-list", "math", "recursion"],
      starterCode: {
        javascript: `function solution(input) {
  const [l1Str, l2Str] = input.split('\\n');
  const l1 = JSON.parse(l1Str);
  const l2 = JSON.parse(l2Str);
  // Add two numbers represented as linked lists
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    l1 = eval(lines[0])
    l2 = eval(lines[1])
    # Add two numbers represented as linked lists
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[2,4,3]\n[5,6,4]",
          expectedOutput: "[7,0,8]",
          isHidden: false,
        },
        { input: "[0]\n[0]", expectedOutput: "[0]", isHidden: false },
        {
          input: "[9,9,9,9,9,9,9]\n[9,9,9,9]",
          expectedOutput: "[8,9,9,9,0,0,0,1]",
          isHidden: true,
        },
      ],
      hints: [
        "Simulate addition digit by digit",
        "Handle carry",
        "Create new nodes for result",
      ],
      points: 20,
    },
    {
      title: "Copy List with Random Pointer",
      description: `A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null.

Construct a deep copy of the list.

Example:
Input: [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]`,
      difficulty: "medium",
      category: "Linked List",
      tags: ["linked-list", "hash-table"],
      starterCode: {
        javascript: `function solution(input) {
  const head = JSON.parse(input);
  // Deep copy linked list with random pointers
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    head = eval(input)
    # Deep copy linked list with random pointers
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
          expectedOutput: "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
          isHidden: false,
        },
        {
          input: "[[1,1],[2,1]]",
          expectedOutput: "[[1,1],[2,1]]",
          isHidden: false,
        },
        {
          input: "[[3,null],[3,0],[3,null]]",
          expectedOutput: "[[3,null],[3,0],[3,null]]",
          isHidden: true,
        },
      ],
      hints: [
        "Use hash map to store old -> new node mapping",
        "First pass: create all nodes",
        "Second pass: set next and random pointers",
      ],
      points: 20,
    },
    {
      title: "Reorder List",
      description: `You are given the head of a singly linked-list. The list can be represented as:

L0 → L1 → … → Ln - 1 → Ln

Reorder the list to be on the following form:

L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …

Example:
Input: [1,2,3,4]
Output: [1,4,2,3]`,
      difficulty: "medium",
      category: "Linked List",
      tags: ["linked-list", "two-pointers", "stack", "recursion"],
      starterCode: {
        javascript: `function solution(input) {
  const head = JSON.parse(input);
  // Reorder the list
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    head = eval(input)
    # Reorder the list
    
    return str(result)`,
      },
      testCases: [
        { input: "[1,2,3,4]", expectedOutput: "[1,4,2,3]", isHidden: false },
        {
          input: "[1,2,3,4,5]",
          expectedOutput: "[1,5,2,4,3]",
          isHidden: false,
        },
        { input: "[1]", expectedOutput: "[1]", isHidden: true },
      ],
      hints: ["Find middle of list", "Reverse second half", "Merge two halves"],
      points: 20,
    },
    {
      title: "LRU Cache",
      description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache.

Example:
Input: ["LRUCache","put","put","get","put","get","put","get","get","get"]
[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
Output: [null,null,null,1,null,-1,null,-1,3,4]`,
      difficulty: "hard",
      category: "Linked List",
      tags: ["linked-list", "design", "hash-table", "doubly-linked-list"],
      starterCode: {
        javascript: `function solution(input) {
  const [operations, values] = JSON.parse(input);
  // Implement LRU Cache
  // Return array of results
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    operations, values = eval(input)
    # Implement LRU Cache
    # Return list of results
    
    return str(result)`,
      },
      testCases: [
        {
          input:
            '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
          expectedOutput: "[null,null,null,1,null,-1,null,-1,3,4]",
          isHidden: false,
        },
        {
          input: '["LRUCache","put","get"]\n[[1],[1,1],[1]]',
          expectedOutput: "[null,null,1]",
          isHidden: false,
        },
      ],
      hints: [
        "Use doubly linked list + hash map",
        "Move accessed items to front",
        "Remove from end when capacity exceeded",
      ],
      points: 30,
    },
    {
      title: "Reverse Nodes in k-Group",
      description: `Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.

k is a positive integer and is less than or equal to the length of the linked list.

Example:
Input: head = [1,2,3,4,5], k = 2
Output: [2,1,4,3,5]`,
      difficulty: "hard",
      category: "Linked List",
      tags: ["linked-list", "recursion"],
      starterCode: {
        javascript: `function solution(input) {
  const [headStr, kStr] = input.split('\\n');
  const head = JSON.parse(headStr);
  const k = parseInt(kStr);
  // Reverse nodes in k-group
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    head = eval(lines[0])
    k = int(lines[1])
    # Reverse nodes in k-group
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]\n2",
          expectedOutput: "[2,1,4,3,5]",
          isHidden: false,
        },
        {
          input: "[1,2,3,4,5]\n3",
          expectedOutput: "[3,2,1,4,5]",
          isHidden: false,
        },
        { input: "[1]\n1", expectedOutput: "[1]", isHidden: true },
      ],
      hints: [
        "Check if k nodes exist",
        "Reverse k nodes",
        "Recursively process remaining",
      ],
      points: 30,
    },
    // ========== DSA - TREE PROBLEMS ==========
    {
      title: "Maximum Depth of Binary Tree",
      description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

Example:
Input: [3,9,20,null,null,15,7]
Output: 3`,
      difficulty: "easy",
      category: "Tree",
      tags: [
        "tree",
        "depth-first-search",
        "breadth-first-search",
        "binary-tree",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Find maximum depth of binary tree
  
  return result.toString();
}`,
        python: `def solution(input):
    root = eval(input)
    # Find maximum depth of binary tree
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[3,9,20,null,null,15,7]",
          expectedOutput: "3",
          isHidden: false,
        },
        { input: "[1,null,2]", expectedOutput: "2", isHidden: false },
        { input: "[]", expectedOutput: "0", isHidden: true },
      ],
      hints: [
        "Use recursion",
        "Base case: null node returns 0",
        "Return 1 + max(left depth, right depth)",
      ],
      points: 10,
    },
    {
      title: "Same Tree",
      description: `Given the roots of two binary trees p and q, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

Example:
Input: p = [1,2,3], q = [1,2,3]
Output: "true"`,
      difficulty: "easy",
      category: "Tree",
      tags: [
        "tree",
        "depth-first-search",
        "breadth-first-search",
        "binary-tree",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const [pStr, qStr] = input.split('\\n');
  const p = JSON.parse(pStr);
  const q = JSON.parse(qStr);
  // Check if two trees are same
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    p = eval(lines[0])
    q = eval(lines[1])
    # Check if two trees are same
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "[1,2,3]\n[1,2,3]", expectedOutput: "true", isHidden: false },
        {
          input: "[1,2]\n[1,null,2]",
          expectedOutput: "false",
          isHidden: false,
        },
        { input: "[1,2,1]\n[1,1,2]", expectedOutput: "false", isHidden: true },
      ],
      hints: [
        "Both null: return true",
        "One null: return false",
        "Check values and recurse on children",
      ],
      points: 10,
    },
    {
      title: "Invert Binary Tree",
      description: `Given the root of a binary tree, invert the tree, and return its root.

Example:
Input: [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]`,
      difficulty: "easy",
      category: "Tree",
      tags: [
        "tree",
        "depth-first-search",
        "breadth-first-search",
        "binary-tree",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Invert the binary tree
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    root = eval(input)
    # Invert the binary tree
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[4,2,7,1,3,6,9]",
          expectedOutput: "[4,7,2,9,6,3,1]",
          isHidden: false,
        },
        { input: "[2,1,3]", expectedOutput: "[2,3,1]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: true },
      ],
      hints: [
        "Swap left and right children",
        "Recursively invert left and right subtrees",
        "Return root",
      ],
      points: 10,
    },
    {
      title: "Binary Tree Level Order Traversal",
      description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

Example:
Input: [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]`,
      difficulty: "medium",
      category: "Tree",
      tags: ["tree", "breadth-first-search", "binary-tree"],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Return level order traversal
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    root = eval(input)
    # Return level order traversal
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[3,9,20,null,null,15,7]",
          expectedOutput: "[[3],[9,20],[15,7]]",
          isHidden: false,
        },
        { input: "[1]", expectedOutput: "[[1]]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: true },
      ],
      hints: [
        "Use BFS with queue",
        "Process nodes level by level",
        "Track current level size",
      ],
      points: 20,
    },
    {
      title: "Validate Binary Search Tree",
      description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.

Example:
Input: [2,1,3]
Output: "true"`,
      difficulty: "medium",
      category: "Tree",
      tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Validate if tree is BST
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    root = eval(input)
    # Validate if tree is BST
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "[2,1,3]", expectedOutput: "true", isHidden: false },
        {
          input: "[5,1,4,null,null,3,6]",
          expectedOutput: "false",
          isHidden: false,
        },
        { input: "[2,2,2]", expectedOutput: "false", isHidden: true },
      ],
      hints: [
        "Pass min and max bounds",
        "Left child: max = node.val",
        "Right child: min = node.val",
      ],
      points: 20,
    },
    {
      title: "Kth Smallest Element in BST",
      description: `Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

Example:
Input: root = [3,1,4,null,2], k = 1
Output: 1`,
      difficulty: "medium",
      category: "Tree",
      tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
      starterCode: {
        javascript: `function solution(input) {
  const [rootStr, kStr] = input.split('\\n');
  const root = JSON.parse(rootStr);
  const k = parseInt(kStr);
  // Find kth smallest element
  
  return result.toString();
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    root = eval(lines[0])
    k = int(lines[1])
    # Find kth smallest element
    
    return str(result)`,
      },
      testCases: [
        { input: "[3,1,4,null,2]\n1", expectedOutput: "1", isHidden: false },
        {
          input: "[5,3,6,2,4,null,null,1]\n3",
          expectedOutput: "3",
          isHidden: false,
        },
        { input: "[1]\n1", expectedOutput: "1", isHidden: true },
      ],
      hints: [
        "In-order traversal gives sorted order",
        "Count nodes during traversal",
        "Return when count equals k",
      ],
      points: 20,
    },
    {
      title: "Lowest Common Ancestor",
      description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.

The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants.

Example:
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6`,
      difficulty: "medium",
      category: "Tree",
      tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
      starterCode: {
        javascript: `function solution(input) {
  const [rootStr, pStr, qStr] = input.split('\\n');
  const root = JSON.parse(rootStr);
  const p = parseInt(pStr);
  const q = parseInt(qStr);
  // Find lowest common ancestor
  
  return result.toString();
}`,
        python: `def solution(input):
    lines = input.strip().split('\\n')
    root = eval(lines[0])
    p = int(lines[1])
    q = int(lines[2])
    # Find lowest common ancestor
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[6,2,8,0,4,7,9,null,null,3,5]\n2\n8",
          expectedOutput: "6",
          isHidden: false,
        },
        {
          input: "[6,2,8,0,4,7,9,null,null,3,5]\n2\n4",
          expectedOutput: "2",
          isHidden: false,
        },
        { input: "[2,1]\n2\n1", expectedOutput: "2", isHidden: true },
      ],
      hints: [
        "Use BST property",
        "If both values < root, go left",
        "If both values > root, go right",
        "Otherwise root is LCA",
      ],
      points: 20,
    },
    {
      title: "Serialize and Deserialize Binary Tree",
      description: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored or transmitted.

Design an algorithm to serialize and deserialize a binary tree.

Example:
Input: [1,2,3,null,null,4,5]
Output: [1,2,3,null,null,4,5]`,
      difficulty: "hard",
      category: "Tree",
      tags: [
        "tree",
        "depth-first-search",
        "breadth-first-search",
        "design",
        "binary-tree",
        "string",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Serialize and then deserialize
  // Return the deserialized tree
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    root = eval(input)
    # Serialize and then deserialize
    # Return the deserialized tree
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1,2,3,null,null,4,5]",
          expectedOutput: "[1,2,3,null,null,4,5]",
          isHidden: false,
        },
        { input: "[]", expectedOutput: "[]", isHidden: false },
        { input: "[1]", expectedOutput: "[1]", isHidden: true },
      ],
      hints: [
        "Use pre-order traversal for serialization",
        "Use queue for deserialization",
        "Handle null nodes",
      ],
      points: 30,
    },
    {
      title: "Binary Tree Maximum Path Sum",
      description: `A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.

The path sum of a path is the sum of the node's values in the path.

Given the root of a binary tree, return the maximum path sum of any non-empty path.

Example:
Input: [1,2,3]
Output: 6`,
      difficulty: "hard",
      category: "Tree",
      tags: [
        "tree",
        "depth-first-search",
        "dynamic-programming",
        "binary-tree",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const root = JSON.parse(input);
  // Find maximum path sum
  
  return result.toString();
}`,
        python: `def solution(input):
    root = eval(input)
    # Find maximum path sum
    
    return str(result)`,
      },
      testCases: [
        { input: "[1,2,3]", expectedOutput: "6", isHidden: false },
        {
          input: "[-10,9,20,null,null,15,7]",
          expectedOutput: "42",
          isHidden: false,
        },
        { input: "[-3]", expectedOutput: "-3", isHidden: true },
      ],
      hints: [
        "For each node, calculate max path through it",
        "Path can go through node or stop at node",
        "Track global maximum",
      ],
      points: 30,
    },
    // ========== DSA - GRAPH PROBLEMS ==========
    {
      title: "Number of Islands",
      description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

Example:
Input: [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
Output: 1`,
      difficulty: "medium",
      category: "Graph",
      tags: [
        "array",
        "depth-first-search",
        "breadth-first-search",
        "union-find",
        "matrix",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const grid = JSON.parse(input);
  // Count number of islands
  
  return result.toString();
}`,
        python: `def solution(input):
    grid = eval(input)
    # Count number of islands
    
    return str(result)`,
      },
      testCases: [
        {
          input:
            '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          expectedOutput: "1",
          isHidden: false,
        },
        {
          input:
            '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
          expectedOutput: "3",
          isHidden: false,
        },
        {
          input: '[["0","0","0"],["0","0","0"],["0","0","0"]]',
          expectedOutput: "0",
          isHidden: true,
        },
      ],
      hints: [
        "Use DFS or BFS",
        "Mark visited cells",
        "Count connected components",
      ],
      points: 20,
    },
    {
      title: "Clone Graph",
      description: `Given a reference of a node in a connected undirected graph.

Return a deep copy (clone) of the graph.

Example:
Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]`,
      difficulty: "medium",
      category: "Graph",
      tags: [
        "hash-table",
        "depth-first-search",
        "breadth-first-search",
        "graph",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const adjList = JSON.parse(input);
  // Clone the graph
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    adjList = eval(input)
    # Clone the graph
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[[2,4],[1,3],[2,4],[1,3]]",
          expectedOutput: "[[2,4],[1,3],[2,4],[1,3]]",
          isHidden: false,
        },
        { input: "[[]]", expectedOutput: "[[]]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: true },
      ],
      hints: [
        "Use hash map to store old -> new node mapping",
        "Use DFS or BFS",
        "Create nodes and connect them",
      ],
      points: 20,
    },
    {
      title: "Course Schedule",
      description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return true if you can finish all courses. Otherwise, return false.

Example:
Input: numCourses = 2, prerequisites = [[1,0]]
Output: "true"`,
      difficulty: "medium",
      category: "Graph",
      tags: [
        "depth-first-search",
        "breadth-first-search",
        "graph",
        "topological-sort",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const [numCourses, prerequisites] = JSON.parse(input);
  // Check if can finish all courses
  // Return "true" or "false"
  
  return result;
}`,
        python: `def solution(input):
    numCourses, prerequisites = eval(input)
    # Check if can finish all courses
    # Return "true" or "false"
    
    return result`,
      },
      testCases: [
        { input: "[2,[[1,0]]]", expectedOutput: "true", isHidden: false },
        {
          input: "[2,[[1,0],[0,1]]]",
          expectedOutput: "false",
          isHidden: false,
        },
        { input: "[1,[]]", expectedOutput: "true", isHidden: true },
      ],
      hints: [
        "Detect cycle in directed graph",
        "Use DFS with visited states",
        "Three states: unvisited, visiting, visited",
      ],
      points: 20,
    },
    {
      title: "Pacific Atlantic Water Flow",
      description: `There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.

Water can only flow in four directions. Find all cells that can flow to both oceans.

Example:
Input: [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`,
      difficulty: "medium",
      category: "Graph",
      tags: ["array", "depth-first-search", "breadth-first-search", "matrix"],
      starterCode: {
        javascript: `function solution(input) {
  const heights = JSON.parse(input);
  // Find cells that can flow to both oceans
  
  return JSON.stringify(result);
}`,
        python: `def solution(input):
    heights = eval(input)
    # Find cells that can flow to both oceans
    
    return str(result)`,
      },
      testCases: [
        {
          input:
            "[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
          expectedOutput: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
          isHidden: false,
        },
        { input: "[[1]]", expectedOutput: "[[0,0]]", isHidden: false },
      ],
      hints: [
        "Start DFS from ocean edges",
        "Mark cells reachable from Pacific",
        "Mark cells reachable from Atlantic",
        "Find intersection",
      ],
      points: 20,
    },
    {
      title: "Word Ladder",
      description: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:

- Every adjacent pair of words differs by a single letter.
- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.
- sk == endWord

Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.

Example:
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5`,
      difficulty: "hard",
      category: "Graph",
      tags: ["breadth-first-search", "hash-table", "string"],
      starterCode: {
        javascript: `function solution(input) {
  const [beginWord, endWord, wordList] = JSON.parse(input);
  // Find shortest transformation sequence length
  
  return result.toString();
}`,
        python: `def solution(input):
    beginWord, endWord, wordList = eval(input)
    # Find shortest transformation sequence length
    
    return str(result)`,
      },
      testCases: [
        {
          input: '["hit","cog",["hot","dot","dog","lot","log","cog"]]',
          expectedOutput: "5",
          isHidden: false,
        },
        {
          input: '["hit","cog",["hot","dot","dog","lot","log"]]',
          expectedOutput: "0",
          isHidden: false,
        },
        {
          input: '["a","c",["a","b","c"]]',
          expectedOutput: "2",
          isHidden: true,
        },
      ],
      hints: [
        "Use BFS",
        "For each word, generate all possible transformations",
        "Use queue and visited set",
      ],
      points: 30,
    },
    {
      title: "Alien Dictionary",
      description: `There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you.

You are given a list of strings words from the alien language's dictionary, where the strings are sorted lexicographically by the rules of this new language.

Derive the order of letters in this alien language.

Example:
Input: ["wrt","wrf","er","ett","rftt"]
Output: "wertf"`,
      difficulty: "hard",
      category: "Graph",
      tags: [
        "array",
        "string",
        "depth-first-search",
        "breadth-first-search",
        "graph",
        "topological-sort",
      ],
      starterCode: {
        javascript: `function solution(input) {
  const words = JSON.parse(input);
  // Derive alien dictionary order
  
  return result;
}`,
        python: `def solution(input):
    words = eval(input)
    # Derive alien dictionary order
    
    return result`,
      },
      testCases: [
        {
          input: '["wrt","wrf","er","ett","rftt"]',
          expectedOutput: "wertf",
          isHidden: false,
        },
        { input: '["z","x"]', expectedOutput: "zx", isHidden: false },
        { input: '["abc","ab"]', expectedOutput: "invalid", isHidden: true },
      ],
      hints: [
        "Build graph from word comparisons",
        "Find topological order",
        "Detect cycles",
      ],
      points: 30,
    },
    // ========== JAVASCRIPT - ARRAY PROBLEMS ==========
    {
      title: "Array Map Implementation",
      description: `Implement a function that mimics the behavior of Array.prototype.map().

The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.

Example:
Input: [1,2,3] and function (x) => x * 2
Output: [2,4,6]`,
      difficulty: "easy",
      category: "Array",
      tags: ["javascript", "array", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const [arrStr, funcStr] = input.split('\\n');
  const arr = JSON.parse(arrStr);
  const func = eval(funcStr);
  // Implement array map
  
  return JSON.stringify(result);
}`,
      },
      testCases: [
        {
          input: "[1,2,3]\n(x => x * 2)",
          expectedOutput: "[2,4,6]",
          isHidden: false,
        },
        {
          input: "[1,2,3]\n(x => x + 1)",
          expectedOutput: "[2,3,4]",
          isHidden: false,
        },
        {
          input: "[5,10,15]\n(x => x / 5)",
          expectedOutput: "[1,2,3]",
          isHidden: true,
        },
      ],
      hints: [
        "Create a new array",
        "Iterate through original array",
        "Apply function to each element",
        "Push result to new array",
      ],
      points: 10,
    },
    {
      title: "Array Filter Implementation",
      description: `Implement a function that mimics the behavior of Array.prototype.filter().

The filter() method creates a new array with all elements that pass the test implemented by the provided function.

Example:
Input: [1,2,3,4,5] and function (x) => x > 2
Output: [3,4,5]`,
      difficulty: "easy",
      category: "Array",
      tags: ["javascript", "array", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const [arrStr, funcStr] = input.split('\\n');
  const arr = JSON.parse(arrStr);
  const func = eval(funcStr);
  // Implement array filter
  
  return JSON.stringify(result);
}`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]\n(x => x > 2)",
          expectedOutput: "[3,4,5]",
          isHidden: false,
        },
        {
          input: "[1,2,3,4,5]\n(x => x % 2 === 0)",
          expectedOutput: "[2,4]",
          isHidden: false,
        },
        {
          input: "[10,20,30]\n(x => x >= 20)",
          expectedOutput: "[20,30]",
          isHidden: true,
        },
      ],
      hints: [
        "Create a new array",
        "Iterate through original array",
        "Test each element with function",
        "Push if test passes",
      ],
      points: 10,
    },
    {
      title: "Array Reduce Implementation",
      description: `Implement a function that mimics the behavior of Array.prototype.reduce().

The reduce() method executes a reducer function on each element of the array, resulting in a single output value.

Example:
Input: [1,2,3,4] and function (acc, x) => acc + x, initialValue = 0
Output: 10`,
      difficulty: "medium",
      category: "Array",
      tags: ["javascript", "array", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const [arrStr, funcStr, initStr] = input.split('\\n');
  const arr = JSON.parse(arrStr);
  const func = eval(funcStr);
  const initialValue = JSON.parse(initStr);
  // Implement array reduce
  
  return result.toString();
}`,
      },
      testCases: [
        {
          input: "[1,2,3,4]\n((acc, x) => acc + x)\n0",
          expectedOutput: "10",
          isHidden: false,
        },
        {
          input: "[1,2,3]\n((acc, x) => acc * x)\n1",
          expectedOutput: "6",
          isHidden: false,
        },
        {
          input: "[5,10,15]\n((acc, x) => Math.max(acc, x))\n0",
          expectedOutput: "15",
          isHidden: true,
        },
      ],
      hints: [
        "Start with initial value",
        "Iterate through array",
        "Apply reducer function",
        "Update accumulator",
      ],
      points: 20,
    },
    {
      title: "Flatten Nested Array",
      description: `Given a nested array, flatten it to a single level array.

Example:
Input: [1, [2, 3], [4, [5, 6]]]
Output: [1, 2, 3, 4, 5, 6]`,
      difficulty: "medium",
      category: "Array",
      tags: ["javascript", "array", "recursion"],
      starterCode: {
        javascript: `function solution(input) {
  const arr = JSON.parse(input);
  // Flatten nested array
  
  return JSON.stringify(result);
}`,
      },
      testCases: [
        {
          input: "[1, [2, 3], [4, [5, 6]]]",
          expectedOutput: "[1,2,3,4,5,6]",
          isHidden: false,
        },
        {
          input: "[[1,2], [3,4], [5,6]]",
          expectedOutput: "[1,2,3,4,5,6]",
          isHidden: false,
        },
        {
          input: "[1, [2, [3, [4]]]]",
          expectedOutput: "[1,2,3,4]",
          isHidden: true,
        },
      ],
      hints: [
        "Use recursion",
        "Check if element is array",
        "If array, recursively flatten",
        "Otherwise add to result",
      ],
      points: 20,
    },
    {
      title: "Array Chunk",
      description: `Given an array and chunk size, divide the array into many subarrays where each subarray is of length size.

Example:
Input: [1,2,3,4,5], size = 2
Output: [[1,2], [3,4], [5]]`,
      difficulty: "medium",
      category: "Array",
      tags: ["javascript", "array"],
      starterCode: {
        javascript: `function solution(input) {
  const [arrStr, sizeStr] = input.split('\\n');
  const arr = JSON.parse(arrStr);
  const size = parseInt(sizeStr);
  // Chunk array into subarrays
  
  return JSON.stringify(result);
}`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]\n2",
          expectedOutput: "[[1,2],[3,4],[5]]",
          isHidden: false,
        },
        {
          input: "[1,2,3,4,5,6,7]\n3",
          expectedOutput: "[[1,2,3],[4,5,6],[7]]",
          isHidden: false,
        },
        {
          input: "[1,2,3,4]\n5",
          expectedOutput: "[[1,2,3,4]]",
          isHidden: true,
        },
      ],
      hints: [
        "Create result array",
        "Iterate with step size",
        "Slice array into chunks",
        "Push chunks to result",
      ],
      points: 20,
    },
    {
      title: "Array Intersection",
      description: `Given two arrays, return an array containing the elements that appear in both arrays.

Example:
Input: [1,2,3,4,5] and [3,4,5,6,7]
Output: [3,4,5]`,
      difficulty: "easy",
      category: "Array",
      tags: ["javascript", "array"],
      starterCode: {
        javascript: `function solution(input) {
  const [arr1Str, arr2Str] = input.split('\\n');
  const arr1 = JSON.parse(arr1Str);
  const arr2 = JSON.parse(arr2Str);
  // Find intersection of two arrays
  
  return JSON.stringify(result);
}`,
      },
      testCases: [
        {
          input: "[1,2,3,4,5]\n[3,4,5,6,7]",
          expectedOutput: "[3,4,5]",
          isHidden: false,
        },
        { input: "[1,2,3]\n[4,5,6]", expectedOutput: "[]", isHidden: false },
        {
          input: "[1,1,2,3]\n[1,2,2,3]",
          expectedOutput: "[1,2,3]",
          isHidden: true,
        },
      ],
      hints: [
        "Use Set for O(1) lookup",
        "Filter first array",
        "Check if element exists in second array",
      ],
      points: 10,
    },
    // ========== JAVASCRIPT - FUNCTIONS PROBLEMS ==========
    {
      title: "Function Currying",
      description: `Implement a function that takes a function and returns a curried version of that function.

Currying is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument.

Example:
Input: function add(a, b, c) { return a + b + c; }
Call: curriedAdd(1)(2)(3)
Output: 6`,
      difficulty: "medium",
      category: "Functions",
      tags: ["javascript", "functions", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const funcStr = input;
  const func = eval(funcStr);
  // Implement function currying
  
  // Return curried function that can be called as: curried(1)(2)(3)
  return JSON.stringify("curried function");
}`,
      },
      testCases: [
        {
          input: "((a, b, c) => a + b + c)",
          expectedOutput: '"curried function"',
          isHidden: false,
        },
        {
          input: "((a, b) => a * b)",
          expectedOutput: '"curried function"',
          isHidden: false,
        },
      ],
      hints: [
        "Return a function that takes one argument",
        "If all arguments collected, call original function",
        "Otherwise return another curried function",
      ],
      points: 20,
    },
    {
      title: "Function Memoization",
      description: `Implement a memoization function that caches the results of function calls.

Memoization is an optimization technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again.

Example:
Input: function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }
After memoization, repeated calls with same n should return cached result.`,
      difficulty: "medium",
      category: "Functions",
      tags: ["javascript", "functions", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const funcStr = input;
  const func = eval(funcStr);
  // Implement memoization
  
  // Return memoized function
  return JSON.stringify("memoized function");
}`,
      },
      testCases: [
        {
          input: "((n) => n * 2)",
          expectedOutput: '"memoized function"',
          isHidden: false,
        },
        {
          input: "((a, b) => a + b)",
          expectedOutput: '"memoized function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use closure to store cache",
        "Create cache object/Map",
        "Check cache before executing",
        "Store result in cache",
      ],
      points: 20,
    },
    {
      title: "Function Composition",
      description: `Implement function composition. Function composition is the process of combining two or more functions to produce a new function.

Example:
Input: f(x) = x + 1, g(x) = x * 2
Compose: compose(f, g)(5) = f(g(5)) = f(10) = 11`,
      difficulty: "easy",
      category: "Functions",
      tags: ["javascript", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const [func1Str, func2Str, valueStr] = input.split('\\n');
  const func1 = eval(func1Str);
  const func2 = eval(func2Str);
  const value = JSON.parse(valueStr);
  // Compose functions and apply to value
  
  return result.toString();
}`,
      },
      testCases: [
        {
          input: "(x => x + 1)\n(x => x * 2)\n5",
          expectedOutput: "11",
          isHidden: false,
        },
        {
          input: "(x => x * 3)\n(x => x + 2)\n4",
          expectedOutput: "18",
          isHidden: false,
        },
        {
          input: "(x => x - 1)\n(x => x / 2)\n10",
          expectedOutput: "4",
          isHidden: true,
        },
      ],
      hints: [
        "Apply functions from right to left",
        "Result of inner function is input to outer",
        "Return final result",
      ],
      points: 10,
    },
    {
      title: "Debounce Function",
      description: `Implement a debounce function that delays invoking a function until after wait milliseconds have elapsed since the last time the debounced function was invoked.

Example:
debounced function should only execute after wait time has passed since last call.`,
      difficulty: "medium",
      category: "Functions",
      tags: ["javascript", "functions", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const [funcStr, waitStr] = input.split('\\n');
  const func = eval(funcStr);
  const wait = parseInt(waitStr);
  // Implement debounce
  
  // Return debounced function
  return JSON.stringify("debounced function");
}`,
      },
      testCases: [
        {
          input: "(x => x * 2)\n100",
          expectedOutput: '"debounced function"',
          isHidden: false,
        },
        {
          input: "(() => console.log('called'))\n200",
          expectedOutput: '"debounced function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use closure to store timeout",
        "Clear previous timeout on each call",
        "Set new timeout",
        "Execute function after wait time",
      ],
      points: 20,
    },
    {
      title: "Throttle Function",
      description: `Implement a throttle function that limits how often a function can be called. A throttled function will only execute at most once per specified time period.

Example:
throttled function should execute immediately, then ignore calls until time period passes.`,
      difficulty: "medium",
      category: "Functions",
      tags: ["javascript", "functions", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const [funcStr, limitStr] = input.split('\\n');
  const func = eval(funcStr);
  const limit = parseInt(limitStr);
  // Implement throttle
  
  // Return throttled function
  return JSON.stringify("throttled function");
}`,
      },
      testCases: [
        {
          input: "(x => x * 2)\n100",
          expectedOutput: '"throttled function"',
          isHidden: false,
        },
        {
          input: "(() => console.log('called'))\n200",
          expectedOutput: '"throttled function"',
          isHidden: false,
        },
      ],
      hints: [
        "Track last execution time",
        "If enough time passed, execute immediately",
        "Otherwise ignore the call",
      ],
      points: 20,
    },
    {
      title: "Higher Order Function - Once",
      description: `Implement a function that ensures a function can only be called once. Subsequent calls should return the result from the first call.

Example:
once(function add(a, b) { return a + b; })
Calling add(1, 2) returns 3
Calling add(3, 4) again still returns 3`,
      difficulty: "easy",
      category: "Functions",
      tags: ["javascript", "functions", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const funcStr = input;
  const func = eval(funcStr);
  // Implement once wrapper
  
  // Return function that can only be called once
  return JSON.stringify("once function");
}`,
      },
      testCases: [
        {
          input: "((a, b) => a + b)",
          expectedOutput: '"once function"',
          isHidden: false,
        },
        {
          input: "(() => Math.random())",
          expectedOutput: '"once function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use closure to track if called",
        "Store result on first call",
        "Return stored result on subsequent calls",
      ],
      points: 10,
    },
    // ========== JAVASCRIPT - PROMISES PROBLEMS ==========
    {
      title: "Promise All Implementation",
      description: `Implement Promise.all() that takes an array of promises and returns a single promise that resolves when all input promises resolve, or rejects if any promise rejects.

Example:
Input: [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
Output: Promise resolves with [1, 2, 3]`,
      difficulty: "medium",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const promisesStr = input;
  // Implement Promise.all
  
  // Return promise that resolves with array of results
  return JSON.stringify("Promise.all implementation");
}`,
      },
      testCases: [
        {
          input: "[Promise.resolve(1), Promise.resolve(2)]",
          expectedOutput: '"Promise.all implementation"',
          isHidden: false,
        },
        {
          input: "[Promise.resolve('a'), Promise.resolve('b')]",
          expectedOutput: '"Promise.all implementation"',
          isHidden: false,
        },
      ],
      hints: [
        "Create new Promise",
        "Track resolved count",
        "Store results in array",
        "Reject if any promise rejects",
      ],
      points: 20,
    },
    {
      title: "Promise Race Implementation",
      description: `Implement Promise.race() that takes an array of promises and returns a promise that resolves or rejects as soon as one of the promises resolves or rejects.

Example:
Input: [slowPromise, fastPromise]
Output: Promise resolves/rejects with result of fastPromise`,
      difficulty: "medium",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const promisesStr = input;
  // Implement Promise.race
  
  // Return promise that resolves/rejects with first result
  return JSON.stringify("Promise.race implementation");
}`,
      },
      testCases: [
        {
          input: "[Promise.resolve(1), Promise.resolve(2)]",
          expectedOutput: '"Promise.race implementation"',
          isHidden: false,
        },
        {
          input: "[Promise.reject('error'), Promise.resolve('success')]",
          expectedOutput: '"Promise.race implementation"',
          isHidden: false,
        },
      ],
      hints: [
        "Create new Promise",
        "Iterate through promises",
        "Call then/catch on each",
        "Resolve/reject with first result",
      ],
      points: 20,
    },
    {
      title: "Promise Retry",
      description: `Implement a function that retries a promise-returning function a specified number of times if it fails.

Example:
retry(fetchData, 3) should try fetchData up to 3 times before giving up.`,
      difficulty: "medium",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const [funcStr, retriesStr] = input.split('\\n');
  const func = eval(funcStr);
  const retries = parseInt(retriesStr);
  // Implement retry logic
  
  // Return promise that retries on failure
  return JSON.stringify("retry function");
}`,
      },
      testCases: [
        {
          input: "(() => Promise.resolve('success'))\n3",
          expectedOutput: '"retry function"',
          isHidden: false,
        },
        {
          input: "(() => Promise.reject('error'))\n2",
          expectedOutput: '"retry function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use recursion or loop",
        "Call function",
        "On failure, decrement retries",
        "Retry if retries > 0",
      ],
      points: 20,
    },
    {
      title: "Promise Timeout",
      description: `Implement a function that wraps a promise with a timeout. If the promise doesn't resolve/reject within the timeout, reject with a timeout error.

Example:
timeout(fetchData(), 5000) should reject if fetchData doesn't complete in 5 seconds.`,
      difficulty: "medium",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const [promiseStr, timeoutStr] = input.split('\\n');
  const promise = eval(promiseStr);
  const timeout = parseInt(timeoutStr);
  // Implement timeout wrapper
  
  // Return promise with timeout
  return JSON.stringify("timeout function");
}`,
      },
      testCases: [
        {
          input: "Promise.resolve('success')\n1000",
          expectedOutput: '"timeout function"',
          isHidden: false,
        },
        {
          input: "new Promise(() => {})\n500",
          expectedOutput: '"timeout function"',
          isHidden: false,
        },
      ],
      hints: [
        "Create timeout promise",
        "Use Promise.race",
        "Race between original promise and timeout",
        "Reject on timeout",
      ],
      points: 20,
    },
    {
      title: "Sequential Promise Execution",
      description: `Implement a function that executes an array of promise-returning functions sequentially (one after another), not in parallel.

Example:
sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)])
Should execute in order and return [1, 2, 3]`,
      difficulty: "medium",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const funcsStr = input;
  const funcs = eval(funcsStr);
  // Execute promises sequentially
  
  // Return promise that resolves with array of results
  return JSON.stringify("sequential function");
}`,
      },
      testCases: [
        {
          input: "[() => Promise.resolve(1), () => Promise.resolve(2)]",
          expectedOutput: '"sequential function"',
          isHidden: false,
        },
        {
          input: "[() => Promise.resolve('a'), () => Promise.resolve('b')]",
          expectedOutput: '"sequential function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use reduce or loop",
        "Chain promises",
        "Wait for each to complete before next",
        "Accumulate results",
      ],
      points: 20,
    },
    {
      title: "Promise Finally Implementation",
      description: `Implement Promise.prototype.finally() that schedules a function to be called when the promise is settled (either fulfilled or rejected).

Example:
promise.finally(() => cleanup()) should always call cleanup regardless of resolve/reject.`,
      difficulty: "easy",
      category: "Promises",
      tags: ["javascript", "promises", "async"],
      starterCode: {
        javascript: `function solution(input) {
  const [promiseStr, finallyFuncStr] = input.split('\\n');
  const promise = eval(promiseStr);
  const finallyFunc = eval(finallyFuncStr);
  // Implement finally
  
  // Return promise with finally handler
  return JSON.stringify("finally implementation");
}`,
      },
      testCases: [
        {
          input: "Promise.resolve('success')\n(() => 'cleanup')",
          expectedOutput: '"finally implementation"',
          isHidden: false,
        },
        {
          input: "Promise.reject('error')\n(() => 'cleanup')",
          expectedOutput: '"finally implementation"',
          isHidden: false,
        },
      ],
      hints: [
        "Call finally function in both then and catch",
        "Return original value/error",
        "Ensure finally always executes",
      ],
      points: 10,
    },
    // ========== JAVASCRIPT - CLOSURES PROBLEMS ==========
    {
      title: "Counter with Closure",
      description: `Create a counter function using closures that returns an object with increment, decrement, and getValue methods.

Example:
const counter = createCounter(5);
counter.increment(); // 6
counter.decrement(); // 5
counter.getValue(); // 5`,
      difficulty: "easy",
      category: "Closures",
      tags: ["javascript", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  const initialValue = JSON.parse(input);
  // Create counter with closure
  
  // Return counter object with methods
  return JSON.stringify("counter object");
}`,
      },
      testCases: [
        { input: "5", expectedOutput: '"counter object"', isHidden: false },
        { input: "0", expectedOutput: '"counter object"', isHidden: false },
        { input: "-10", expectedOutput: '"counter object"', isHidden: true },
      ],
      hints: [
        "Use closure to store count",
        "Return object with methods",
        "Methods access count from closure",
      ],
      points: 10,
    },
    {
      title: "Private Variables with Closure",
      description: `Create a function that uses closures to create private variables. The returned object should have methods to access/modify the private variable.

Example:
const obj = createPrivateObject();
obj.setValue(10);
obj.getValue(); // 10
obj.value; // undefined (private)`,
      difficulty: "medium",
      category: "Closures",
      tags: ["javascript", "closures"],
      starterCode: {
        javascript: `function solution(input) {
  // Create object with private variables using closure
  
  // Return object with public methods
  return JSON.stringify("private object");
}`,
      },
      testCases: [
        { input: "none", expectedOutput: '"private object"', isHidden: false },
      ],
      hints: [
        "Use closure to store private data",
        "Return object with methods",
        "Methods access closure variables",
      ],
      points: 20,
    },
    {
      title: "Function Factory with Closure",
      description: `Create a function factory that generates functions with different multipliers using closures.

Example:
const multiplyBy2 = createMultiplier(2);
const multiplyBy5 = createMultiplier(5);
multiplyBy2(10); // 20
multiplyBy5(10); // 50`,
      difficulty: "easy",
      category: "Closures",
      tags: ["javascript", "closures", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const multiplier = JSON.parse(input);
  // Create multiplier function using closure
  
  // Return function that multiplies by multiplier
  return JSON.stringify("multiplier function");
}`,
      },
      testCases: [
        {
          input: "2",
          expectedOutput: '"multiplier function"',
          isHidden: false,
        },
        {
          input: "5",
          expectedOutput: '"multiplier function"',
          isHidden: false,
        },
        {
          input: "10",
          expectedOutput: '"multiplier function"',
          isHidden: true,
        },
      ],
      hints: [
        "Return function that captures multiplier",
        "Inner function accesses outer multiplier",
        "Return multiplied value",
      ],
      points: 10,
    },
    {
      title: "Module Pattern with Closure",
      description: `Implement a module pattern using closures that creates a private namespace and exposes a public API.

Example:
const module = createModule();
module.publicMethod(); // Can access private variables
module.privateVar; // undefined`,
      difficulty: "medium",
      category: "Closures",
      tags: ["javascript", "closures", "design-patterns"],
      starterCode: {
        javascript: `function solution(input) {
  // Create module with private and public members
  
  // Return module object
  return JSON.stringify("module object");
}`,
      },
      testCases: [
        { input: "none", expectedOutput: '"module object"', isHidden: false },
      ],
      hints: [
        "Use IIFE (Immediately Invoked Function Expression)",
        "Return object with public methods",
        "Private variables stay in closure",
      ],
      points: 20,
    },
    {
      title: "Event Emitter with Closure",
      description: `Create an event emitter using closures that can subscribe to events and emit events.

Example:
const emitter = createEventEmitter();
emitter.on('click', (data) => console.log(data));
emitter.emit('click', 'button clicked');`,
      difficulty: "hard",
      category: "Closures",
      tags: ["javascript", "closures", "events"],
      starterCode: {
        javascript: `function solution(input) {
  // Create event emitter using closure
  
  // Return emitter object with on and emit methods
  return JSON.stringify("event emitter");
}`,
      },
      testCases: [
        { input: "none", expectedOutput: '"event emitter"', isHidden: false },
      ],
      hints: [
        "Store event handlers in closure",
        "on() adds handler to array",
        "emit() calls all handlers for event",
      ],
      points: 30,
    },
    {
      title: "Memoization with Closure",
      description: `Create a memoization function using closures that caches function results based on arguments.

Example:
const memoizedAdd = memoize((a, b) => a + b);
memoizedAdd(1, 2); // Computes and caches
memoizedAdd(1, 2); // Returns cached result`,
      difficulty: "medium",
      category: "Closures",
      tags: ["javascript", "closures", "functions"],
      starterCode: {
        javascript: `function solution(input) {
  const funcStr = input;
  const func = eval(funcStr);
  // Create memoized function using closure
  
  // Return memoized function
  return JSON.stringify("memoized function");
}`,
      },
      testCases: [
        {
          input: "((a, b) => a + b)",
          expectedOutput: '"memoized function"',
          isHidden: false,
        },
        {
          input: "((n) => n * 2)",
          expectedOutput: '"memoized function"',
          isHidden: false,
        },
      ],
      hints: [
        "Use closure to store cache",
        "Create cache key from arguments",
        "Check cache before executing",
        "Store result in cache",
      ],
      points: 20,
    },
    // ========== PYTHON - ARRAY PROBLEMS ==========
    {
      title: "List Comprehension - Squares",
      description: `Use list comprehension to create a list of squares of numbers from 1 to n.

Example:
Input: 5
Output: [1, 4, 9, 16, 25]`,
      difficulty: "easy",
      category: "Array",
      tags: ["python", "list", "comprehension"],
      starterCode: {
        python: `def solution(input):
    n = int(input)
    # Use list comprehension to create squares
    
    return str(result)`,
      },
      testCases: [
        { input: "5", expectedOutput: "[1, 4, 9, 16, 25]", isHidden: false },
        { input: "3", expectedOutput: "[1, 4, 9]", isHidden: false },
        {
          input: "10",
          expectedOutput: "[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]",
          isHidden: true,
        },
      ],
      hints: [
        "Use [x**2 for x in range(1, n+1)]",
        "List comprehension syntax: [expression for item in iterable]",
      ],
      points: 10,
    },
    {
      title: "List Filter - Even Numbers",
      description: `Use list comprehension or filter to get only even numbers from a list.

Example:
Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Output: [2, 4, 6, 8, 10]`,
      difficulty: "easy",
      category: "Array",
      tags: ["python", "list", "filter"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Filter even numbers
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
          expectedOutput: "[2, 4, 6, 8, 10]",
          isHidden: false,
        },
        { input: "[1, 3, 5, 7]", expectedOutput: "[]", isHidden: false },
        {
          input: "[2, 4, 6, 8]",
          expectedOutput: "[2, 4, 6, 8]",
          isHidden: true,
        },
      ],
      hints: [
        "Use [x for x in arr if x % 2 == 0]",
        "Or use filter() function",
        "Check modulo 2",
      ],
      points: 10,
    },
    {
      title: "List Map - Double Values",
      description: `Use list comprehension or map to double all values in a list.

Example:
Input: [1, 2, 3, 4, 5]
Output: [2, 4, 6, 8, 10]`,
      difficulty: "easy",
      category: "Array",
      tags: ["python", "list", "map"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Double all values
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "[2, 4, 6, 8, 10]",
          isHidden: false,
        },
        {
          input: "[10, 20, 30]",
          expectedOutput: "[20, 40, 60]",
          isHidden: false,
        },
        { input: "[0, -1, -2]", expectedOutput: "[0, -2, -4]", isHidden: true },
      ],
      hints: [
        "Use [x * 2 for x in arr]",
        "Or use map(lambda x: x * 2, arr)",
        "List comprehension is more Pythonic",
      ],
      points: 10,
    },
    {
      title: "List Reduce - Sum",
      description: `Use reduce (from functools) to calculate the sum of all elements in a list.

Example:
Input: [1, 2, 3, 4, 5]
Output: 15`,
      difficulty: "medium",
      category: "Array",
      tags: ["python", "list", "reduce"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Calculate sum using reduce
    
    return str(result)`,
      },
      testCases: [
        { input: "[1, 2, 3, 4, 5]", expectedOutput: "15", isHidden: false },
        { input: "[10, 20, 30]", expectedOutput: "60", isHidden: false },
        { input: "[5]", expectedOutput: "5", isHidden: true },
      ],
      hints: [
        "from functools import reduce",
        "reduce(lambda acc, x: acc + x, arr, 0)",
        "Or use sum() built-in",
      ],
      points: 20,
    },
    {
      title: "List Flatten",
      description: `Flatten a nested list to a single level list.

Example:
Input: [[1, 2], [3, 4], [5, 6]]
Output: [1, 2, 3, 4, 5, 6]`,
      difficulty: "medium",
      category: "Array",
      tags: ["python", "list", "recursion"],
      starterCode: {
        python: `def solution(input):
    nested_list = eval(input)
    # Flatten nested list
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[[1, 2], [3, 4], [5, 6]]",
          expectedOutput: "[1, 2, 3, 4, 5, 6]",
          isHidden: false,
        },
        {
          input: "[[1, [2, 3]], [4, 5]]",
          expectedOutput: "[1, 2, 3, 4, 5]",
          isHidden: false,
        },
        {
          input: "[[1], [2], [3]]",
          expectedOutput: "[1, 2, 3]",
          isHidden: true,
        },
      ],
      hints: [
        "Use list comprehension with nested loops",
        "[item for sublist in nested_list for item in sublist]",
        "Or use recursion for deeper nesting",
      ],
      points: 20,
    },
    {
      title: "List Chunk",
      description: `Split a list into chunks of specified size.

Example:
Input: [1, 2, 3, 4, 5, 6, 7], size = 3
Output: [[1, 2, 3], [4, 5, 6], [7]]`,
      difficulty: "medium",
      category: "Array",
      tags: ["python", "list"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    arr = eval(lines[0])
    size = int(lines[1])
    # Split list into chunks
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5, 6, 7]\n3",
          expectedOutput: "[[1, 2, 3], [4, 5, 6], [7]]",
          isHidden: false,
        },
        {
          input: "[1, 2, 3, 4]\n2",
          expectedOutput: "[[1, 2], [3, 4]]",
          isHidden: false,
        },
        {
          input: "[1, 2, 3]\n5",
          expectedOutput: "[[1, 2, 3]]",
          isHidden: true,
        },
      ],
      hints: [
        "Use range(0, len(arr), size)",
        "Slice list: arr[i:i+size]",
        "List comprehension: [arr[i:i+size] for i in range(0, len(arr), size)]",
      ],
      points: 20,
    },
    // ========== PYTHON - TUPLE PROBLEMS ==========
    {
      title: "Tuple Unpacking",
      description: `Unpack a tuple and swap two variables.

Example:
Input: a = 5, b = 10
Output: a = 10, b = 5`,
      difficulty: "easy",
      category: "Tuple",
      tags: ["python", "tuple", "unpacking"],
      starterCode: {
        python: `def solution(input):
    a, b = eval(input)
    # Swap using tuple unpacking
    
    return str((result_a, result_b))`,
      },
      testCases: [
        { input: "(5, 10)", expectedOutput: "(10, 5)", isHidden: false },
        { input: "(1, 2)", expectedOutput: "(2, 1)", isHidden: false },
        { input: "(100, 200)", expectedOutput: "(200, 100)", isHidden: true },
      ],
      hints: [
        "Use tuple unpacking: a, b = b, a",
        "Python allows multiple assignment",
        "No temporary variable needed",
      ],
      points: 10,
    },
    {
      title: "Tuple as Dictionary Key",
      description: `Create a dictionary where tuples are used as keys, then retrieve values.

Example:
Input: {(1, 2): 'a', (3, 4): 'b'}
Get value for key (1, 2)
Output: 'a'`,
      difficulty: "easy",
      category: "Tuple",
      tags: ["python", "tuple", "dictionary"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    dict_data = eval(lines[0])
    key = eval(lines[1])
    # Get value from dictionary using tuple key
    
    return str(result)`,
      },
      testCases: [
        {
          input: "{(1, 2): 'a', (3, 4): 'b'}\n(1, 2)",
          expectedOutput: "'a'",
          isHidden: false,
        },
        {
          input: "{(1, 2): 'x', (3, 4): 'y'}\n(3, 4)",
          expectedOutput: "'y'",
          isHidden: false,
        },
        {
          input: "{(0, 0): 'origin'}\n(0, 0)",
          expectedOutput: "'origin'",
          isHidden: true,
        },
      ],
      hints: [
        "Tuples are hashable and can be dictionary keys",
        "Access: dict_data[key]",
        "Tuples must be immutable",
      ],
      points: 10,
    },
    {
      title: "Tuple Zip",
      description: `Use zip() to combine two lists into a list of tuples.

Example:
Input: [1, 2, 3] and ['a', 'b', 'c']
Output: [(1, 'a'), (2, 'b'), (3, 'c')]`,
      difficulty: "easy",
      category: "Tuple",
      tags: ["python", "tuple", "zip"],
      starterCode: {
        python: `def solution(input):
    list1, list2 = eval(input)
    # Zip two lists into tuples
    
    return str(result)`,
      },
      testCases: [
        {
          input: "([1, 2, 3], ['a', 'b', 'c'])",
          expectedOutput: "[(1, 'a'), (2, 'b'), (3, 'c')]",
          isHidden: false,
        },
        {
          input: "([10, 20], ['x', 'y'])",
          expectedOutput: "[(10, 'x'), (20, 'y')]",
          isHidden: false,
        },
        { input: "([1], ['z'])", expectedOutput: "[(1, 'z')]", isHidden: true },
      ],
      hints: [
        "Use zip(list1, list2)",
        "Convert to list: list(zip(...))",
        "zip() returns iterator of tuples",
      ],
      points: 10,
    },
    {
      title: "Tuple Unzip",
      description: `Unzip a list of tuples into separate lists.

Example:
Input: [(1, 'a'), (2, 'b'), (3, 'c')]
Output: ([1, 2, 3], ['a', 'b', 'c'])`,
      difficulty: "easy",
      category: "Tuple",
      tags: ["python", "tuple", "zip"],
      starterCode: {
        python: `def solution(input):
    tuples = eval(input)
    # Unzip tuples into separate lists
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[(1, 'a'), (2, 'b'), (3, 'c')]",
          expectedOutput: "([1, 2, 3], ['a', 'b', 'c'])",
          isHidden: false,
        },
        {
          input: "[(10, 'x'), (20, 'y')]",
          expectedOutput: "([10, 20], ['x', 'y'])",
          isHidden: false,
        },
        { input: "[(1, 'z')]", expectedOutput: "([1], ['z'])", isHidden: true },
      ],
      hints: [
        "Use zip(*tuples) to unzip",
        "Convert to lists: [list(x) for x in zip(*tuples)]",
        "Or use tuple unpacking",
      ],
      points: 10,
    },
    {
      title: "Named Tuple",
      description: `Use collections.namedtuple to create a Point with x and y coordinates, then create instances.

Example:
Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
Output: Point(x=1, y=2)`,
      difficulty: "medium",
      category: "Tuple",
      tags: ["python", "tuple", "namedtuple"],
      starterCode: {
        python: `def solution(input):
    x, y = eval(input)
    # Create named tuple Point and instance
    
    return str(result)`,
      },
      testCases: [
        { input: "(1, 2)", expectedOutput: "Point(x=1, y=2)", isHidden: false },
        {
          input: "(5, 10)",
          expectedOutput: "Point(x=5, y=10)",
          isHidden: false,
        },
        { input: "(0, 0)", expectedOutput: "Point(x=0, y=0)", isHidden: true },
      ],
      hints: [
        "from collections import namedtuple",
        "Point = namedtuple('Point', ['x', 'y'])",
        "p = Point(x, y)",
      ],
      points: 20,
    },
    {
      title: "Tuple Comparison",
      description: `Compare two tuples lexicographically.

Example:
Input: (1, 2, 3) and (1, 2, 4)
Output: (1, 2, 3) < (1, 2, 4) -> True`,
      difficulty: "easy",
      category: "Tuple",
      tags: ["python", "tuple", "comparison"],
      starterCode: {
        python: `def solution(input):
    tuple1, tuple2 = eval(input)
    # Compare tuples
    
    return str(result)`,
      },
      testCases: [
        {
          input: "((1, 2, 3), (1, 2, 4))",
          expectedOutput: "True",
          isHidden: false,
        },
        {
          input: "((5, 10), (5, 5))",
          expectedOutput: "False",
          isHidden: false,
        },
        { input: "((1,), (2,))", expectedOutput: "True", isHidden: true },
      ],
      hints: [
        "Tuples compare element by element",
        "First differing element determines result",
        "Use <, >, == operators",
      ],
      points: 10,
    },
    // ========== PYTHON - DICTIONARY PROBLEMS ==========
    {
      title: "Dictionary Comprehension",
      description: `Create a dictionary using dictionary comprehension that maps numbers to their squares.

Example:
Input: range(1, 6)
Output: {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}`,
      difficulty: "easy",
      category: "Dictionary",
      tags: ["python", "dictionary", "comprehension"],
      starterCode: {
        python: `def solution(input):
    n = int(input)
    # Create dictionary using comprehension
    
    return str(result)`,
      },
      testCases: [
        {
          input: "5",
          expectedOutput: "{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}",
          isHidden: false,
        },
        { input: "3", expectedOutput: "{1: 1, 2: 4, 3: 9}", isHidden: false },
        {
          input: "10",
          expectedOutput:
            "{1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64, 9: 81, 10: 100}",
          isHidden: true,
        },
      ],
      hints: [
        "Use {x: x**2 for x in range(1, n+1)}",
        "Dictionary comprehension: {key: value for item in iterable}",
      ],
      points: 10,
    },
    {
      title: "Dictionary Merge",
      description: `Merge two dictionaries. If keys overlap, values from second dictionary should take precedence.

Example:
Input: {'a': 1, 'b': 2} and {'b': 3, 'c': 4}
Output: {'a': 1, 'b': 3, 'c': 4}`,
      difficulty: "easy",
      category: "Dictionary",
      tags: ["python", "dictionary", "merge"],
      starterCode: {
        python: `def solution(input):
    dict1, dict2 = eval(input)
    # Merge dictionaries
    
    return str(result)`,
      },
      testCases: [
        {
          input: "({'a': 1, 'b': 2}, {'b': 3, 'c': 4})",
          expectedOutput: "{'a': 1, 'b': 3, 'c': 4}",
          isHidden: false,
        },
        {
          input: "({'x': 1}, {'y': 2})",
          expectedOutput: "{'x': 1, 'y': 2}",
          isHidden: false,
        },
        { input: "({}, {'a': 1})", expectedOutput: "{'a': 1}", isHidden: true },
      ],
      hints: [
        "Use {**dict1, **dict2}",
        "Or dict1.update(dict2)",
        "Python 3.5+ supports ** unpacking",
      ],
      points: 10,
    },
    {
      title: "Dictionary Default Values",
      description: `Use defaultdict or get() method to handle missing keys with default values.

Example:
Input: {'a': 1, 'b': 2}
Get value for 'c' with default 0
Output: 0`,
      difficulty: "easy",
      category: "Dictionary",
      tags: ["python", "dictionary", "defaultdict"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    dict_data = eval(lines[0])
    key = lines[1].strip("'\"")
    # Get value with default
    
    return str(result)`,
      },
      testCases: [
        { input: "{'a': 1, 'b': 2}\nc", expectedOutput: "0", isHidden: false },
        { input: "{'x': 10}\ny", expectedOutput: "0", isHidden: false },
        { input: "{'a': 1}\na", expectedOutput: "1", isHidden: true },
      ],
      hints: [
        "Use dict.get(key, default)",
        "Or from collections import defaultdict",
        "defaultdict(int) returns 0 for missing keys",
      ],
      points: 10,
    },
    {
      title: "Dictionary Invert",
      description: `Invert a dictionary (swap keys and values). Handle duplicate values appropriately.

Example:
Input: {'a': 1, 'b': 2, 'c': 1}
Output: {1: ['a', 'c'], 2: ['b']} or {1: 'a', 2: 'b'} (handle duplicates)`,
      difficulty: "medium",
      category: "Dictionary",
      tags: ["python", "dictionary"],
      starterCode: {
        python: `def solution(input):
    dict_data = eval(input)
    # Invert dictionary
    
    return str(result)`,
      },
      testCases: [
        {
          input: "{'a': 1, 'b': 2, 'c': 1}",
          expectedOutput: "{1: ['a', 'c'], 2: ['b']}",
          isHidden: false,
        },
        {
          input: "{'x': 10, 'y': 20}",
          expectedOutput: "{10: ['x'], 20: ['y']}",
          isHidden: false,
        },
        { input: "{'a': 1}", expectedOutput: "{1: ['a']}", isHidden: true },
      ],
      hints: [
        "Use defaultdict(list)",
        "Iterate through items",
        "Append keys to value lists",
      ],
      points: 20,
    },
    {
      title: "Dictionary Sort by Value",
      description: `Sort a dictionary by its values and return as list of tuples.

Example:
Input: {'a': 3, 'b': 1, 'c': 2}
Output: [('b', 1), ('c', 2), ('a', 3)]`,
      difficulty: "medium",
      category: "Dictionary",
      tags: ["python", "dictionary", "sort"],
      starterCode: {
        python: `def solution(input):
    dict_data = eval(input)
    # Sort dictionary by values
    
    return str(result)`,
      },
      testCases: [
        {
          input: "{'a': 3, 'b': 1, 'c': 2}",
          expectedOutput: "[('b', 1), ('c', 2), ('a', 3)]",
          isHidden: false,
        },
        {
          input: "{'x': 10, 'y': 5}",
          expectedOutput: "[('y', 5), ('x', 10)]",
          isHidden: false,
        },
        { input: "{'z': 0}", expectedOutput: "[('z', 0)]", isHidden: true },
      ],
      hints: [
        "Use sorted(dict_data.items(), key=lambda x: x[1])",
        "items() returns (key, value) pairs",
        "key parameter specifies sort criteria",
      ],
      points: 20,
    },
    {
      title: "Dictionary Group By",
      description: `Group a list of dictionaries by a common key value.

Example:
Input: [{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 25}, {'name': 'Charlie', 'age': 30}]
Group by 'age'
Output: {25: [{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 25}], 30: [{'name': 'Charlie', 'age': 30}]}`,
      difficulty: "medium",
      category: "Dictionary",
      tags: ["python", "dictionary", "groupby"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    list_data = eval(lines[0])
    key = lines[1].strip("'\"")
    # Group dictionaries by key
    
    return str(result)`,
      },
      testCases: [
        {
          input:
            "[{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 25}, {'name': 'Charlie', 'age': 30}]\nage",
          expectedOutput:
            "{25: [{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 25}], 30: [{'name': 'Charlie', 'age': 30}]}",
          isHidden: false,
        },
        {
          input: "[{'x': 1}, {'x': 1}, {'x': 2}]\nx",
          expectedOutput: "{1: [{'x': 1}, {'x': 1}], 2: [{'x': 2}]}",
          isHidden: false,
        },
      ],
      hints: [
        "Use defaultdict(list)",
        "Iterate through list",
        "Group by dict_item[key]",
      ],
      points: 20,
    },
    // ========== PYTHON - LIST PROBLEMS ==========
    {
      title: "List Slicing",
      description: `Use list slicing to reverse a list and get every nth element.

Example:
Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Reverse: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
Every 2nd: [1, 3, 5, 7, 9]`,
      difficulty: "easy",
      category: "List",
      tags: ["python", "list", "slicing"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Reverse list and get every 2nd element
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
          expectedOutput: "[1, 3, 5, 7, 9]",
          isHidden: false,
        },
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "[1, 3, 5]",
          isHidden: false,
        },
        { input: "[10, 20, 30]", expectedOutput: "[10, 30]", isHidden: true },
      ],
      hints: [
        "Use slicing: arr[::2] for every 2nd",
        "Reverse: arr[::-1]",
        "Combine: arr[::-1][::2]",
      ],
      points: 10,
    },
    {
      title: "List Methods - Append vs Extend",
      description: `Demonstrate the difference between append() and extend() methods.

Example:
list1 = [1, 2, 3]
list1.append([4, 5]) -> [1, 2, 3, [4, 5]]
list2 = [1, 2, 3]
list2.extend([4, 5]) -> [1, 2, 3, 4, 5]`,
      difficulty: "easy",
      category: "List",
      tags: ["python", "list", "methods"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    arr = eval(lines[0])
    items = eval(lines[1])
    # Use extend to add items
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3]\n[4, 5]",
          expectedOutput: "[1, 2, 3, 4, 5]",
          isHidden: false,
        },
        { input: "[]\n[1, 2]", expectedOutput: "[1, 2]", isHidden: false },
        {
          input: "[10]\n[20, 30]",
          expectedOutput: "[10, 20, 30]",
          isHidden: true,
        },
      ],
      hints: [
        "extend() adds elements individually",
        "append() adds the whole object",
        "Use arr.extend(items)",
      ],
      points: 10,
    },
    {
      title: "List Remove Duplicates",
      description: `Remove duplicates from a list while preserving order.

Example:
Input: [1, 2, 2, 3, 3, 3, 4, 5]
Output: [1, 2, 3, 4, 5]`,
      difficulty: "easy",
      category: "List",
      tags: ["python", "list", "set"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Remove duplicates preserving order
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 2, 3, 3, 3, 4, 5]",
          expectedOutput: "[1, 2, 3, 4, 5]",
          isHidden: false,
        },
        { input: "[1, 1, 1]", expectedOutput: "[1]", isHidden: false },
        {
          input: "[5, 4, 3, 2, 1]",
          expectedOutput: "[5, 4, 3, 2, 1]",
          isHidden: true,
        },
      ],
      hints: [
        "Use seen = set()",
        "Check if item in seen",
        "Or use dict.fromkeys(arr) which preserves order",
      ],
      points: 10,
    },
    {
      title: "List Rotation",
      description: `Rotate a list to the right by k positions.

Example:
Input: [1, 2, 3, 4, 5], k = 2
Output: [4, 5, 1, 2, 3]`,
      difficulty: "medium",
      category: "List",
      tags: ["python", "list"],
      starterCode: {
        python: `def solution(input):
    lines = input.strip().split('\\n')
    arr = eval(lines[0])
    k = int(lines[1])
    # Rotate list to the right by k
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]\n2",
          expectedOutput: "[4, 5, 1, 2, 3]",
          isHidden: false,
        },
        { input: "[1, 2, 3]\n1", expectedOutput: "[3, 1, 2]", isHidden: false },
        { input: "[1, 2]\n1", expectedOutput: "[2, 1]", isHidden: true },
      ],
      hints: [
        "Use negative indexing: arr[-k:] + arr[:-k]",
        "Or use collections.deque.rotate()",
        "Handle k > len(arr)",
      ],
      points: 20,
    },
    {
      title: "List Intersection and Union",
      description: `Find intersection and union of two lists.

Example:
Input: [1, 2, 3, 4] and [3, 4, 5, 6]
Intersection: [3, 4]
Union: [1, 2, 3, 4, 5, 6]`,
      difficulty: "medium",
      category: "List",
      tags: ["python", "list", "set"],
      starterCode: {
        python: `def solution(input):
    list1, list2 = eval(input)
    # Find intersection and union
    
    return str((intersection, union))`,
      },
      testCases: [
        {
          input: "([1, 2, 3, 4], [3, 4, 5, 6])",
          expectedOutput: "([3, 4], [1, 2, 3, 4, 5, 6])",
          isHidden: false,
        },
        {
          input: "([1, 2], [3, 4])",
          expectedOutput: "([], [1, 2, 3, 4])",
          isHidden: false,
        },
        {
          input: "([1, 2, 3], [1, 2, 3])",
          expectedOutput: "([1, 2, 3], [1, 2, 3])",
          isHidden: true,
        },
      ],
      hints: [
        "Use set operations",
        "Intersection: list(set(list1) & set(list2))",
        "Union: list(set(list1) | set(list2))",
      ],
      points: 20,
    },
    {
      title: "List Partition",
      description: `Partition a list into two lists based on a condition.

Example:
Input: [1, 2, 3, 4, 5, 6], condition: even
Output: ([2, 4, 6], [1, 3, 5])`,
      difficulty: "medium",
      category: "List",
      tags: ["python", "list", "filter"],
      starterCode: {
        python: `def solution(input):
    arr = eval(input)
    # Partition into evens and odds
    
    return str(result)`,
      },
      testCases: [
        {
          input: "[1, 2, 3, 4, 5, 6]",
          expectedOutput: "([2, 4, 6], [1, 3, 5])",
          isHidden: false,
        },
        {
          input: "[10, 15, 20]",
          expectedOutput: "([10, 20], [15])",
          isHidden: false,
        },
        {
          input: "[1, 3, 5]",
          expectedOutput: "([], [1, 3, 5])",
          isHidden: true,
        },
      ],
      hints: [
        "Use list comprehensions",
        "[x for x in arr if x % 2 == 0]",
        "[x for x in arr if x % 2 != 0]",
      ],
      points: 20,
    },
    // ========== PYTHON - ASYNC/AWAIT PROBLEMS ==========
    {
      title: "Async Function Basics",
      description: `Create an async function that simulates an asynchronous operation using asyncio.sleep().

Example:
async def fetch_data():
    await asyncio.sleep(1)
    return "data"

Call and get result.`,
      difficulty: "easy",
      category: "Async/Await",
      tags: ["python", "async", "await", "asyncio"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    # Create and run async function
    
    return str(result)`,
      },
      testCases: [{ input: "none", expectedOutput: '"data"', isHidden: false }],
      hints: [
        "Define async def fetch_data():",
        "Use await asyncio.sleep(1)",
        "Run with asyncio.run(fetch_data())",
      ],
      points: 10,
    },
    {
      title: "Async Function with Return",
      description: `Create an async function that returns a value after a delay.

Example:
async def get_value(n):
    await asyncio.sleep(0.1)
    return n * 2

Call with n=5, should return 10.`,
      difficulty: "easy",
      category: "Async/Await",
      tags: ["python", "async", "await"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    n = int(input)
    # Create async function and get result
    
    return str(result)`,
      },
      testCases: [
        { input: "5", expectedOutput: "10", isHidden: false },
        { input: "10", expectedOutput: "20", isHidden: false },
        { input: "0", expectedOutput: "0", isHidden: true },
      ],
      hints: [
        "async def get_value(n):",
        "await asyncio.sleep(0.1)",
        "return n * 2",
        "result = asyncio.run(get_value(n))",
      ],
      points: 10,
    },
    {
      title: "Multiple Async Functions",
      description: `Run multiple async functions concurrently using asyncio.gather().

Example:
async def task1(): return 1
async def task2(): return 2
async def task3(): return 3

Run all concurrently and get [1, 2, 3].`,
      difficulty: "medium",
      category: "Async/Await",
      tags: ["python", "async", "await", "asyncio"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    # Create multiple async functions and run concurrently
    
    return str(result)`,
      },
      testCases: [
        { input: "none", expectedOutput: "[1, 2, 3]", isHidden: false },
      ],
      hints: [
        "Define multiple async functions",
        "Use asyncio.gather(task1(), task2(), task3())",
        "Returns list of results",
      ],
      points: 20,
    },
    {
      title: "Async with Timeout",
      description: `Create an async function with a timeout using asyncio.wait_for().

Example:
async def slow_task():
    await asyncio.sleep(2)
    return "done"

Wrap with timeout of 1 second, should raise TimeoutError.`,
      difficulty: "medium",
      category: "Async/Await",
      tags: ["python", "async", "await", "timeout"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    # Create async function with timeout
    
    # Return "timeout" if timeout occurs, else return result
    return str(result)`,
      },
      testCases: [
        { input: "none", expectedOutput: '"timeout"', isHidden: false },
      ],
      hints: [
        "Use asyncio.wait_for(slow_task(), timeout=1)",
        "Wrap in try/except asyncio.TimeoutError",
        "Return 'timeout' on exception",
      ],
      points: 20,
    },
    {
      title: "Async Generator",
      description: `Create an async generator that yields values asynchronously.

Example:
async def async_range(n):
    for i in range(n):
        await asyncio.sleep(0.1)
        yield i

Collect all values: [0, 1, 2, ..., n-1].`,
      difficulty: "medium",
      category: "Async/Await",
      tags: ["python", "async", "generator"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    n = int(input)
    # Create async generator and collect values
    
    return str(result)`,
      },
      testCases: [
        { input: "5", expectedOutput: "[0, 1, 2, 3, 4]", isHidden: false },
        { input: "3", expectedOutput: "[0, 1, 2]", isHidden: false },
        { input: "1", expectedOutput: "[0]", isHidden: true },
      ],
      hints: [
        "Define async def async_range(n):",
        "Use async for to iterate",
        "Collect values in list: [x async for x in async_range(n)]",
      ],
      points: 20,
    },
    {
      title: "Async Context Manager",
      description: `Create an async context manager using async with statement.

Example:
class AsyncContext:
    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass

Use with async with statement.`,
      difficulty: "hard",
      category: "Async/Await",
      tags: ["python", "async", "context-manager"],
      starterCode: {
        python: `def solution(input):
    import asyncio
    # Create and use async context manager
    
    return str(result)`,
      },
      testCases: [
        { input: "none", expectedOutput: '"context used"', isHidden: false },
      ],
      hints: [
        "Define class with __aenter__ and __aexit__",
        "Both must be async",
        "Use async with AsyncContext() as ctx:",
      ],
      points: 30,
    },
  ];

  await CodingProblem.insertMany(problems);
  console.log(`✅ Seeded ${problems.length} coding problems`);

  return problems;
};
