import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Module from '../../src/models/Module';
import Lesson from '../../src/models/Lesson';
import Quiz from '../../src/models/Quiz';
import Question from '../../src/models/Question';
import Skill from '../../src/models/Skill';
import CodingProblem from '../../src/models/CodingProblem';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Type definitions for question and coding problem data
interface QuestionData {
  questionText: string;
  options: Array<{
    id: string;
    type: string;
    content: string;
  }>;
  answer: {
    type: string;
    content: string;
    optionId: string;
  };
  explanation: string;
  points?: number;
  order?: number;
}

interface CodingProblemData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starterCode: {
    javascript?: string;
    python?: string;
    typescript?: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  hints: string[];
  points?: number;
  solvedCount?: number;
  attemptCount?: number;
}

// Organize topics by level
const TOPICS_BY_LEVEL = {
  Beginner: [
    'An Introduction to JavaScript',
    'Manuals and specifications',
    'Code editors',
    'Developer console',
    'Hello, world!',
    'Code structure',
    'The modern mode, "use strict"',
    'Variables',
    'Data types',
    'Interaction: alert, prompt, confirm',
    'Type Conversions',
    'Basic operators, maths',
    'Comparisons',
    'Conditional branching: if, \'?\'',
    'Logical operators',
    'Loops: while and for',
    'The "switch" statement',
    'Functions',
    'Function expressions',
    'Arrow functions, the basics',
    'Objects',
    'Object references and copying',
    'Object methods, "this"',
    'Methods of primitives',
    'Numbers',
    'Strings',
    'Arrays',
    'Array methods',
    'Browser environment, specs',
    'DOM tree',
    'Searching: getElement*, querySelector*',
    'Introduction to browser events',
  ],
  Intermediate: [
    'Nullish coalescing operator \'??\'',
    'Code quality',
    'Debugging in the browser',
    'Coding Style',
    'Comments',
    'Garbage collection',
    'Constructor, operator "new"',
    'Optional chaining \'?.\'',
    'Object to primitive conversion',
    'Iterables',
    'Map and Set',
    'WeakMap and WeakSet',
    'Object.keys, values, entries',
    'Destructuring assignment',
    'Date and time',
    'JSON methods, toJSON',
    'Recursion and stack',
    'Rest parameters and spread syntax',
    'Variable scope, closure',
    'The old "var"',
    'Global object',
    'Function object, NFE',
    'The "new Function" syntax',
    'Scheduling: setTimeout and setInterval',
    'Decorators and forwarding, call/apply',
    'Function binding',
    'Arrow functions revisited',
    'Property flags and descriptors',
    'Property getters and setters',
    'Prototypal inheritance',
    'F.prototype',
    'Native prototypes',
    'Class basic syntax',
    'Class inheritance',
    'Static properties and methods',
    'Error handling, "try...catch"',
    'Custom errors, extending Error',
    'Introduction: callbacks',
    'Promise',
    'Promises chaining',
    'Error handling with promises',
    'Promise API',
    'Async/await',
    'Walking the DOM',
    'Node properties: type, tag and contents',
    'Attributes and properties',
    'Modifying the document',
    'Styles and classes',
    'Element size and scrolling',
    'Window sizes and scrolling',
    'Coordinates',
    'Bubbling and capturing',
    'Event delegation',
    'Browser default actions',
    'Dispatching custom events',
    'Mouse events',
    'Moving the mouse: mouseover/out, mouseenter/leave',
    'Keyboard: keydown and keyup',
    'Scrolling',
    'Form properties and methods',
    'Focusing: focus/blur',
    'Events: change, input, cut, copy, paste',
    'Forms: event and method submit',
  ],
  Advanced: [
    'Polyfills and transpilers',
    'Symbol type',
    'Generators',
    'Async iteration and generators',
    'Modules, introduction',
    'Export and Import',
    'Dynamic imports',
    'Proxy and Reflect',
    'Eval: run a code string',
    'Currying',
    'Reference Type',
    'BigInt',
    'Unicode, String internals',
    'WeakRef and FinalizationRegistry',
    'Prototype methods, objects without __proto__',
    'Private and protected properties and methods',
    'Extending built-in classes',
    'Class checking: "instanceof"',
    'Mixins',
    'Promisification',
    'Microtasks',
    'Drag\'n\'Drop with mouse events',
    'Pointer events',
    'Page: DOMContentLoaded, load, beforeunload, unload',
    'Scripts: async, defer',
    'Resource loading: onload and onerror',
    'Mutation observer',
    'Selection and Range',
    'Event loop: microtasks and macrotasks',
  ]
};

// Generate quiz questions for a topic
function generateQuizQuestions(topic: string): QuestionData[] {
  const questions: QuestionData[] = [];
  
  // Generate 10+ MCQ questions based on topic
  const questionTemplates: Record<string, QuestionData[]> = {
    'Variables': [
      {
        questionText: 'Which keyword is used to declare a variable that can be reassigned?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'const' },
          { id: 'opt2', type: 'mcq', content: 'let' },
          { id: 'opt3', type: 'mcq', content: 'var' },
          { id: 'opt4', type: 'mcq', content: 'Both let and var' }
        ],
        answer: { type: 'mcq', content: 'Both let and var', optionId: 'opt4' },
        explanation: 'Both let and var can be reassigned, but const cannot.'
      },
      {
        questionText: 'What is the scope of a variable declared with let?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Global scope' },
          { id: 'opt2', type: 'mcq', content: 'Function scope' },
          { id: 'opt3', type: 'mcq', content: 'Block scope' },
          { id: 'opt4', type: 'mcq', content: 'Module scope' }
        ],
        answer: { type: 'mcq', content: 'Block scope', optionId: 'opt3' },
        explanation: 'Variables declared with let have block scope.'
      },
      {
        questionText: 'What happens if you try to access a let variable before it is declared?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Returns undefined' },
          { id: 'opt2', type: 'mcq', content: 'Returns null' },
          { id: 'opt3', type: 'mcq', content: 'Throws ReferenceError' },
          { id: 'opt4', type: 'mcq', content: 'Returns 0' }
        ],
        answer: { type: 'mcq', content: 'Throws ReferenceError', optionId: 'opt3' },
        explanation: 'Accessing a let variable before declaration causes a ReferenceError due to temporal dead zone.'
      },
      {
        questionText: 'Which of the following is a valid variable name in JavaScript?',
        options: [
          { id: 'opt1', type: 'mcq', content: '2variable' },
          { id: 'opt2', type: 'mcq', content: 'my-variable' },
          { id: 'opt3', type: 'mcq', content: 'myVariable' },
          { id: 'opt4', type: 'mcq', content: 'my variable' }
        ],
        answer: { type: 'mcq', content: 'myVariable', optionId: 'opt3' },
        explanation: 'Variable names must start with a letter, underscore, or dollar sign, and can contain letters, digits, underscores, and dollar signs.'
      },
      {
        questionText: 'What is the difference between let and const?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'let is block-scoped, const is function-scoped' },
          { id: 'opt2', type: 'mcq', content: 'const cannot be reassigned, let can be reassigned' },
          { id: 'opt3', type: 'mcq', content: 'let is hoisted, const is not' },
          { id: 'opt4', type: 'mcq', content: 'There is no difference' }
        ],
        answer: { type: 'mcq', content: 'const cannot be reassigned, let can be reassigned', optionId: 'opt2' },
        explanation: 'The main difference is that const variables cannot be reassigned after declaration.'
      },
      {
        questionText: 'What is hoisting in JavaScript?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Moving variables to the top of their scope' },
          { id: 'opt2', type: 'mcq', content: 'A way to optimize code' },
          { id: 'opt3', type: 'mcq', content: 'A type of loop' },
          { id: 'opt4', type: 'mcq', content: 'A way to import modules' }
        ],
        answer: { type: 'mcq', content: 'Moving variables to the top of their scope', optionId: 'opt1' },
        explanation: 'Hoisting is JavaScript\'s behavior of moving declarations to the top of their scope.'
      },
      {
        questionText: 'Which statement about var is true?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'var is block-scoped' },
          { id: 'opt2', type: 'mcq', content: 'var is function-scoped' },
          { id: 'opt3', type: 'mcq', content: 'var cannot be hoisted' },
          { id: 'opt4', type: 'mcq', content: 'var is the same as const' }
        ],
        answer: { type: 'mcq', content: 'var is function-scoped', optionId: 'opt2' },
        explanation: 'Variables declared with var are function-scoped, not block-scoped.'
      },
      {
        questionText: 'What is the value of a variable that is declared but not initialized?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'null' },
          { id: 'opt2', type: 'mcq', content: 'undefined' },
          { id: 'opt3', type: 'mcq', content: '0' },
          { id: 'opt4', type: 'mcq', content: '""' }
        ],
        answer: { type: 'mcq', content: 'undefined', optionId: 'opt2' },
        explanation: 'A variable that is declared but not initialized has the value undefined.'
      },
      {
        questionText: 'Can you redeclare a variable with let in the same scope?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Yes, always' },
          { id: 'opt2', type: 'mcq', content: 'No, it will cause an error' },
          { id: 'opt3', type: 'mcq', content: 'Only in strict mode' },
          { id: 'opt4', type: 'mcq', content: 'Only if it was previously declared with var' }
        ],
        answer: { type: 'mcq', content: 'No, it will cause an error', optionId: 'opt2' },
        explanation: 'You cannot redeclare a variable with let in the same scope.'
      },
      {
        questionText: 'What is the temporal dead zone?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A period before a variable is declared where it cannot be accessed' },
          { id: 'opt2', type: 'mcq', content: 'A type of error' },
          { id: 'opt3', type: 'mcq', content: 'A JavaScript feature' },
          { id: 'opt4', type: 'mcq', content: 'A way to optimize code' }
        ],
        answer: { type: 'mcq', content: 'A period before a variable is declared where it cannot be accessed', optionId: 'opt1' },
        explanation: 'The temporal dead zone is the period between entering scope and the declaration where the variable cannot be accessed.'
      },
      {
        questionText: 'Which keyword creates a constant that cannot be reassigned?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'let' },
          { id: 'opt2', type: 'mcq', content: 'var' },
          { id: 'opt3', type: 'mcq', content: 'const' },
          { id: 'opt4', type: 'mcq', content: 'final' }
        ],
        answer: { type: 'mcq', content: 'const', optionId: 'opt3' },
        explanation: 'const creates a constant that cannot be reassigned.'
      },
      {
        questionText: 'What happens when you declare a const object and try to modify its properties?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'It throws an error' },
          { id: 'opt2', type: 'mcq', content: 'Properties can be modified' },
          { id: 'opt3', type: 'mcq', content: 'The object becomes read-only' },
          { id: 'opt4', type: 'mcq', content: 'Nothing happens' }
        ],
        answer: { type: 'mcq', content: 'Properties can be modified', optionId: 'opt2' },
        explanation: 'const prevents reassignment of the variable, but object properties can still be modified.'
      }
    ],
    'Functions': [
      {
        questionText: 'What is a function declaration?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function assigned to a variable' },
          { id: 'opt2', type: 'mcq', content: 'A function defined with the function keyword' },
          { id: 'opt3', type: 'mcq', content: 'An arrow function' },
          { id: 'opt4', type: 'mcq', content: 'A method' }
        ],
        answer: { type: 'mcq', content: 'A function defined with the function keyword', optionId: 'opt2' },
        explanation: 'A function declaration uses the function keyword and is hoisted.'
      },
      {
        questionText: 'What is a function expression?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function assigned to a variable' },
          { id: 'opt2', type: 'mcq', content: 'A function declaration' },
          { id: 'opt3', type: 'mcq', content: 'An arrow function only' },
          { id: 'opt4', type: 'mcq', content: 'A method' }
        ],
        answer: { type: 'mcq', content: 'A function assigned to a variable', optionId: 'opt1' },
        explanation: 'A function expression is when a function is assigned to a variable.'
      },
      {
        questionText: 'What is the main difference between function declarations and function expressions?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Function declarations are hoisted, expressions are not' },
          { id: 'opt2', type: 'mcq', content: 'Function expressions are hoisted, declarations are not' },
          { id: 'opt3', type: 'mcq', content: 'There is no difference' },
          { id: 'opt4', type: 'mcq', content: 'Function declarations cannot have parameters' }
        ],
        answer: { type: 'mcq', content: 'Function declarations are hoisted, expressions are not', optionId: 'opt1' },
        explanation: 'Function declarations are hoisted and can be called before they are defined.'
      },
      {
        questionText: 'What is an arrow function?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function with arrow syntax =>' },
          { id: 'opt2', type: 'mcq', content: 'A function declaration' },
          { id: 'opt3', type: 'mcq', content: 'A type of loop' },
          { id: 'opt4', type: 'mcq', content: 'A method' }
        ],
        answer: { type: 'mcq', content: 'A function with arrow syntax =>', optionId: 'opt1' },
        explanation: 'Arrow functions use the => syntax and have lexical this binding.'
      },
      {
        questionText: 'What is the main difference between arrow functions and regular functions?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Arrow functions have their own this context' },
          { id: 'opt2', type: 'mcq', content: 'Arrow functions inherit this from the enclosing scope' },
          { id: 'opt3', type: 'mcq', content: 'There is no difference' },
          { id: 'opt4', type: 'mcq', content: 'Arrow functions cannot have parameters' }
        ],
        answer: { type: 'mcq', content: 'Arrow functions inherit this from the enclosing scope', optionId: 'opt2' },
        explanation: 'Arrow functions do not have their own this, they inherit it from the enclosing scope.'
      },
      {
        questionText: 'Can arrow functions be used as constructors?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Yes' },
          { id: 'opt2', type: 'mcq', content: 'No' },
          { id: 'opt3', type: 'mcq', content: 'Only in strict mode' },
          { id: 'opt4', type: 'mcq', content: 'Only with new keyword' }
        ],
        answer: { type: 'mcq', content: 'No', optionId: 'opt2' },
        explanation: 'Arrow functions cannot be used as constructors and will throw an error if used with new.'
      },
      {
        questionText: 'What is a callback function?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function passed as an argument to another function' },
          { id: 'opt2', type: 'mcq', content: 'A function that returns a function' },
          { id: 'opt3', type: 'mcq', content: 'An arrow function' },
          { id: 'opt4', type: 'mcq', content: 'A function declaration' }
        ],
        answer: { type: 'mcq', content: 'A function passed as an argument to another function', optionId: 'opt1' },
        explanation: 'A callback function is a function passed as an argument to another function.'
      },
      {
        questionText: 'What is a higher-order function?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function that takes other functions as arguments or returns functions' },
          { id: 'opt2', type: 'mcq', content: 'A function with many parameters' },
          { id: 'opt3', type: 'mcq', content: 'An arrow function' },
          { id: 'opt4', type: 'mcq', content: 'A function declaration' }
        ],
        answer: { type: 'mcq', content: 'A function that takes other functions as arguments or returns functions', optionId: 'opt1' },
        explanation: 'Higher-order functions are functions that operate on other functions.'
      },
      {
        questionText: 'What is a closure?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A function that has access to variables in its outer scope' },
          { id: 'opt2', type: 'mcq', content: 'A way to close a function' },
          { id: 'opt3', type: 'mcq', content: 'An arrow function' },
          { id: 'opt4', type: 'mcq', content: 'A type of loop' }
        ],
        answer: { type: 'mcq', content: 'A function that has access to variables in its outer scope', optionId: 'opt1' },
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.'
      },
      {
        questionText: 'What is the difference between function parameters and arguments?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'Parameters are the values passed, arguments are the variables' },
          { id: 'opt2', type: 'mcq', content: 'Arguments are the values passed, parameters are the variables' },
          { id: 'opt3', type: 'mcq', content: 'There is no difference' },
          { id: 'opt4', type: 'mcq', content: 'Parameters are only in arrow functions' }
        ],
        answer: { type: 'mcq', content: 'Arguments are the values passed, parameters are the variables', optionId: 'opt2' },
        explanation: 'Parameters are the variables in the function definition, arguments are the values passed when calling the function.'
      },
      {
        questionText: 'What is a default parameter?',
        options: [
          { id: 'opt1', type: 'mcq', content: 'A parameter with a default value' },
          { id: 'opt2', type: 'mcq', content: 'A required parameter' },
          { id: 'opt3', type: 'mcq', content: 'A parameter that cannot be changed' },
          { id: 'opt4', type: 'mcq', content: 'A type of function' }
        ],
        answer: { type: 'mcq', content: 'A parameter with a default value', optionId: 'opt1' },
        explanation: 'Default parameters allow you to set default values for function parameters.'
      },
      {
        questionText: 'What is the rest parameter syntax?',
        options: [
          { id: 'opt1', type: 'mcq', content: '...args - allows a function to accept an indefinite number of arguments' },
          { id: 'opt2', type: 'mcq', content: 'A way to stop a function' },
          { id: 'opt3', type: 'mcq', content: 'A type of loop' },
          { id: 'opt4', type: 'mcq', content: 'A way to declare variables' }
        ],
        answer: { type: 'mcq', content: '...args - allows a function to accept an indefinite number of arguments', optionId: 'opt1' },
        explanation: 'The rest parameter syntax allows a function to accept an indefinite number of arguments as an array.'
      }
    ]
  };

  // Use topic-specific questions if available, otherwise generate generic ones
  const topicKey = topic.split(':')[0].trim();
  const specificQuestions = questionTemplates[topicKey] || [];
  
  if (specificQuestions.length > 0) {
    return specificQuestions.slice(0, 12); // Return up to 12 questions
  }

  // Generate generic questions
  for (let i = 1; i <= 12; i++) {
    questions.push({
      questionText: `Question ${i} about ${topic}: What is a key concept?`,
      options: [
        { id: 'opt1', type: 'mcq', content: 'Option A' },
        { id: 'opt2', type: 'mcq', content: 'Option B' },
        { id: 'opt3', type: 'mcq', content: 'Option C' },
        { id: 'opt4', type: 'mcq', content: 'Option D' }
      ],
      answer: { type: 'mcq', content: 'Option A', optionId: 'opt1' },
      explanation: `This is question ${i} about ${topic}.`
    });
  }

  return questions;
}

// Generate coding problems for a topic
function generateCodingProblems(topic: string, level: string): CodingProblemData[] {
  const problemTemplates: Record<string, CodingProblemData[]> = {
    'Variables': [
      {
        title: 'Variable Declaration Practice',
        description: 'Declare three variables: name (string), age (number), and isStudent (boolean). Assign appropriate values to each.',
        difficulty: 'easy',
        category: 'Variables',
        starterCode: {
          javascript: `// Declare your variables here\nlet name;\nlet age;\nlet isStudent;\n\n// Assign values\n\n// Return an object with all three variables\nreturn { name, age, isStudent };`,
          python: `# Declare your variables here\nname = None\nage = None\nis_student = None\n\n# Assign values\n\n# Return a dictionary with all three variables\nreturn {"name": name, "age": age, "is_student": is_student}`
        },
        testCases: [
          { input: 'none', expectedOutput: '{"name":"John","age":25,"is_student":true}', isHidden: false }
        ],
        hints: ['Use let or const for variable declaration', 'Assign string values with quotes', 'Numbers don\'t need quotes']
      },
      {
        title: 'Variable Reassignment',
        description: 'Create a variable count initialized to 0, then increment it by 5, then multiply by 2. Return the final value.',
        difficulty: 'easy',
        category: 'Variables',
        starterCode: {
          javascript: `let count = 0;\n\n// Your code here\n\nreturn count;`,
          python: `count = 0\n\n# Your code here\n\nreturn count`
        },
        testCases: [
          { input: 'none', expectedOutput: '10', isHidden: false }
        ],
        hints: ['Start with count = 0', 'Increment by 5: count = count + 5', 'Multiply by 2: count = count * 2']
      }
    ],
    'Functions': [
      {
        title: 'Create a Simple Function',
        description: 'Write a function called greet that takes a name parameter and returns "Hello, [name]!"',
        difficulty: 'easy',
        category: 'Functions',
        starterCode: {
          javascript: `function greet(name) {\n  // Your code here\n}`,
          python: `def greet(name):\n    # Your code here\n    pass`
        },
        testCases: [
          { input: '"John"', expectedOutput: '"Hello, John!"', isHidden: false },
          { input: '"Alice"', expectedOutput: '"Hello, Alice!"', isHidden: true }
        ],
        hints: ['Use string concatenation or template literals', 'Return the greeting string']
      },
      {
        title: 'Function with Multiple Parameters',
        description: 'Write a function called add that takes two numbers and returns their sum.',
        difficulty: 'easy',
        category: 'Functions',
        starterCode: {
          javascript: `function add(a, b) {\n  // Your code here\n}`,
          python: `def add(a, b):\n    # Your code here\n    pass`
        },
        testCases: [
          { input: '5, 3', expectedOutput: '8', isHidden: false },
          { input: '10, 20', expectedOutput: '30', isHidden: true }
        ],
        hints: ['Simply return a + b', 'Make sure to return the result']
      }
    ]
  };

  const topicKey = topic.split(':')[0].trim();
  const specificProblems = problemTemplates[topicKey] || [];

  if (specificProblems.length >= 2) {
    return specificProblems;
  }

  // Generate generic coding problems
  return [
    {
      title: `${topic} - Practice Problem 1`,
      description: `Write code to solve a problem related to ${topic}.`,
      difficulty: level === 'Beginner' ? 'easy' : level === 'Intermediate' ? 'medium' : 'hard',
      category: topic,
      starterCode: {
        javascript: `function solution(input) {\n  // Your code here\n  return result;\n}`,
        python: `def solution(input):\n    # Your code here\n    return result`
      },
      testCases: [
        { input: 'test', expectedOutput: 'result', isHidden: false }
      ],
      hints: [`Think about ${topic} concepts`, 'Break down the problem into steps']
    },
    {
      title: `${topic} - Practice Problem 2`,
      description: `Write code to solve another problem related to ${topic}.`,
      difficulty: level === 'Beginner' ? 'easy' : level === 'Intermediate' ? 'medium' : 'hard',
      category: topic,
      starterCode: {
        javascript: `function solution(input) {\n  // Your code here\n  return result;\n}`,
        python: `def solution(input):\n    # Your code here\n    return result`
      },
      testCases: [
        { input: 'test', expectedOutput: 'result', isHidden: false }
      ],
      hints: [`Apply ${topic} principles`, 'Test your solution with different inputs']
    }
  ];
}


async function seedJavaScriptFullCourse() {
  try {
    await connectDB();

    // Find JavaScript skill
    let jsSkill = await Skill.findOne({ name: 'JavaScript' });
    if (!jsSkill) {
      jsSkill = await Skill.create({
        name: 'JavaScript',
        description: 'JavaScript is a high-level, interpreted programming language used to create dynamic and interactive web pages'
      });
      console.log('✅ Created JavaScript skill');
    } else {
      console.log('✅ Found JavaScript skill');
    }

    // Delete existing JavaScript modules and related data
    console.log('🗑️  Cleaning up existing JavaScript modules...');
    const existingModules = await Module.find({ skillId: jsSkill._id });
    const moduleIds = existingModules.map(m => m._id);
    
    await Question.deleteMany({ moduleId: { $in: moduleIds } });
    await Quiz.deleteMany({ moduleId: { $in: moduleIds } });
    await CodingProblem.deleteMany({ category: { $in: ['Variables', 'Functions', 'Arrays', 'Objects', 'DOM', 'Events'] } });
    await Lesson.deleteMany({ moduleId: { $in: moduleIds } });
    await Module.deleteMany({ skillId: jsSkill._id });
    console.log('✅ Cleaned up existing JavaScript modules');

    const createdModules: Array<{ _id: unknown; name: string }> = [];

    // Create modules for each level
    for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
      const topics = TOPICS_BY_LEVEL[level as keyof typeof TOPICS_BY_LEVEL];
      const moduleName = level === 'Beginner' ? 'JavaScript Beginner' : `JavaScript ${level}`;
      
      console.log(`\n🌱 Creating ${moduleName} module with ${topics.length} lessons...`);

      // Calculate total duration (aim for 15-20 hours total, distribute across levels)
      const hoursPerLevel = level === 'Beginner' ? 8 : level === 'Intermediate' ? 6 : 6;
      const totalMinutes = hoursPerLevel * 60;
      const avgLessonDuration = Math.round(totalMinutes / topics.length);

      const newModule = await Module.create({
        name: moduleName,
        description: `${level} level JavaScript course covering ${topics.length} essential topics`,
        level: level,
        skillId: jsSkill._id,
        duration: totalMinutes,
        points: topics.length * 100, // 100 points per lesson
        lessonsCount: topics.length,
        icon: 'https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop'
      });

      createdModules.push(newModule);
      console.log(`✅ Created ${moduleName} module`);

      // Create lessons for each topic
      const createdLessons: Array<{ _id: unknown; name: string; order: number }> = [];
      
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        const lessonNumber = i + 1;
        
        const lesson = await Lesson.create({
          name: `Lesson ${lessonNumber}: ${topic}`,
          content: `# ${topic}\n\n## Introduction\n\nThis lesson covers ${topic} in detail.\n\n## Key Concepts\n\n- Concept 1\n- Concept 2\n- Concept 3\n\n## Examples\n\n\`\`\`javascript\n// Example code\nconsole.log("Hello World");\n\`\`\`\n\n## Summary\n\nIn this lesson, you learned about ${topic}.`,
          contentArray: [
            `Introduction to ${topic}`,
            `Key concepts and principles`,
            `Practical examples`,
            `Best practices`,
            `Common pitfalls`
          ],
          type: i % 2 === 0 ? 'Text' : 'Code',
          moduleId: newModule._id,
          skillId: jsSkill._id,
          duration: avgLessonDuration,
          points: 100,
          order: lessonNumber
        });

        createdLessons.push(lesson);
        console.log(`  ✅ Created lesson: ${topic}`);

        // Create quiz for each lesson (skip first lesson)
        if (lessonNumber > 1) {
          const quizQuestions = generateQuizQuestions(topic);
          
          const quiz = await Quiz.create({
            name: `Quiz: ${topic}`,
            description: `Test your knowledge of ${topic}`,
            duration: 30,
            moduleId: newModule._id,
            lessonId: lesson._id,
            numberOfQuestions: quizQuestions.length + 2, // +2 for coding questions
            points: (quizQuestions.length * 10) + 20 // 10 points per MCQ + 20 for coding
          });

          // Create quiz questions
          for (let q = 0; q < quizQuestions.length; q++) {
            await new Question({
              ...quizQuestions[q],
              quizId: quiz._id,
              lessonId: lesson._id,
              moduleId: newModule._id
            }).save();
          }

          // Create coding problems for the lesson
          const codingProblems = generateCodingProblems(topic, level);
          for (const problem of codingProblems) {
            await CodingProblem.create({
              ...problem,
              category: problem.category,
              tags: [topic.toLowerCase().replace(/\s+/g, '-'), level.toLowerCase()],
              solvedCount: problem.solvedCount || 0,
              attemptCount: problem.attemptCount || 0,
              points: problem.points || 10
            });
          }

          console.log(`    ✅ Created quiz with ${quizQuestions.length} questions and 2 coding problems`);
        }
      }

      // Update module with actual lessons count
      await Module.findByIdAndUpdate(newModule._id, {
        lessonsCount: createdLessons.length
      });
    }

    console.log('\n🎉 JavaScript full course seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- Modules created: ${createdModules.length}`);
    for (const newModule of createdModules) { 
      const lessons = await Lesson.countDocuments({ moduleId: newModule._id });
      const quizzes = await Quiz.countDocuments({ moduleId: newModule._id });
      console.log(`  - ${newModule.name}: ${lessons} lessons, ${quizzes} quizzes`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding JavaScript course:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedJavaScriptFullCourse();
}

export { seedJavaScriptFullCourse };

