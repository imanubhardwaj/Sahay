import { Lesson } from '../../src/models';
import { comprehensiveLessonsData } from './comprehensive-lessons-data';

export const seedLessons = async (modules: any[], skills: any[]) => {
  console.log('🌱 Seeding lessons...');
  
  const findModule = (name: string) => modules.find(m => m.name === name)?._id;
  const findSkill = (name: string) => skills.find(s => s.name === name)?._id;
  
  const lessonsData = [
    // JavaScript Fundamentals - 15 lessons
    {
      name: 'Introduction to JavaScript',
      contentArray: ['What is JavaScript', 'History and evolution', 'JavaScript environments', 'ECMAScript versions'],
      type: 'Text',
      content: 'JavaScript is a versatile programming language that powers the web. Learn about its origins, how it evolved from a simple scripting language to a powerful programming language used for both frontend and backend development.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 20,
      points: 20,
      order: 1
    },
    {
      name: 'Variables and Data Types',
      contentArray: ['var, let, const', 'Primitive types', 'Type coercion', 'Template literals'],
      type: 'Code',
      content: 'Learn how to declare variables using var, let, and const. Understand primitive data types including strings, numbers, booleans, null, undefined, and symbols. Master type coercion and template literals for string manipulation.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 2
    },
    {
      name: 'Operators and Expressions',
      contentArray: ['Arithmetic operators', 'Comparison operators', 'Logical operators', 'Ternary operator'],
      type: 'Code',
      content: 'Master JavaScript operators including arithmetic (+, -, *, /), comparison (==, ===, !=, !==), logical (&&, ||, !) and the powerful ternary operator for concise conditional expressions.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 20,
      points: 20,
      order: 3
    },
    {
      name: 'Control Structures: Conditionals',
      contentArray: ['if-else statements', 'switch statements', 'Guard clauses', 'Best practices'],
      type: 'Code',
      content: 'Learn to control program flow using if-else statements and switch cases. Understand when to use each construct and discover guard clauses for cleaner code.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 4
    },
    {
      name: 'Loops and Iteration',
      contentArray: ['for loops', 'while loops', 'do-while loops', 'break and continue'],
      type: 'Code',
      content: 'Master iteration in JavaScript with for, while, and do-while loops. Learn when to use each type and how to control loop execution with break and continue statements.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 30,
      points: 30,
      order: 5
    },
    {
      name: 'Functions Basics',
      contentArray: ['Function declarations', 'Function expressions', 'Arrow functions', 'Return values'],
      type: 'Code',
      content: 'Understand the different ways to create functions in JavaScript. Learn about function declarations, expressions, and ES6 arrow functions. Master return values and implicit returns.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 30,
      points: 30,
      order: 6
    },
    {
      name: 'Function Parameters and Arguments',
      contentArray: ['Parameters vs arguments', 'Default parameters', 'Rest parameters', 'Spread operator'],
      type: 'Code',
      content: 'Deep dive into function parameters and arguments. Learn about default parameters, rest parameters for variable arguments, and the spread operator for array manipulation.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 7
    },
    {
      name: 'Scope and Closures',
      contentArray: ['Global scope', 'Function scope', 'Block scope', 'Closures explained'],
      type: 'Text',
      content: 'Understand JavaScript scope including global, function, and block scope. Master closures - one of JavaScript\'s most powerful features for data privacy and functional programming.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 35,
      points: 35,
      order: 8
    },
    {
      name: 'Arrays Fundamentals',
      contentArray: ['Creating arrays', 'Accessing elements', 'Array length', 'Multi-dimensional arrays'],
      type: 'Code',
      content: 'Learn array basics in JavaScript. Create arrays, access elements using indices, understand the length property, and work with multi-dimensional arrays.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 9
    },
    {
      name: 'Array Methods',
      contentArray: ['map, filter, reduce', 'forEach, find, findIndex', 'some, every', 'sort, reverse'],
      type: 'Code',
      content: 'Master essential array methods: map for transformation, filter for selection, reduce for aggregation. Learn forEach, find, some, every, sort, and reverse for array manipulation.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 40,
      points: 40,
      order: 10
    },
    {
      name: 'Objects Fundamentals',
      contentArray: ['Object literals', 'Properties and methods', 'this keyword', 'Object references'],
      type: 'Code',
      content: 'Understand JavaScript objects - the foundation of the language. Create object literals, add properties and methods, understand the this keyword and object references.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 30,
      points: 30,
      order: 11
    },
    {
      name: 'Object Destructuring',
      contentArray: ['Object destructuring', 'Nested destructuring', 'Default values', 'Renaming properties'],
      type: 'Code',
      content: 'Master ES6 object destructuring for cleaner code. Learn nested destructuring, setting default values, and renaming properties during destructuring.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 12
    },
    {
      name: 'Error Handling',
      contentArray: ['try-catch blocks', 'throw statements', 'Error types', 'Best practices'],
      type: 'Code',
      content: 'Learn proper error handling in JavaScript using try-catch-finally blocks. Understand how to throw custom errors and handle different error types gracefully.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 25,
      points: 25,
      order: 13
    },
    {
      name: 'Asynchronous JavaScript: Callbacks',
      contentArray: ['Callback functions', 'Callback hell', 'Event loop', 'setTimeout and setInterval'],
      type: 'Code',
      content: 'Introduction to asynchronous programming in JavaScript. Understand callbacks, the event loop, and timer functions like setTimeout and setInterval.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 30,
      points: 30,
      order: 14
    },
    {
      name: 'Promises Basics',
      contentArray: ['Creating promises', 'then and catch', 'Promise chaining', 'Promise.all'],
      type: 'Code',
      content: 'Master Promises for handling asynchronous operations. Learn to create promises, chain them, handle errors, and use Promise.all for parallel operations.',
      moduleId: findModule('JavaScript Fundamentals'),
      skillId: findSkill('JavaScript'),
      duration: 35,
      points: 35,
      order: 15
    },

    // React Components - 15 lessons
    {
      name: 'Introduction to React',
      contentArray: ['What is React', 'Virtual DOM', 'Component-based architecture', 'React ecosystem'],
      type: 'Text',
      content: 'React is a JavaScript library for building user interfaces. Learn about its component-based architecture, the virtual DOM for efficient updates, and the rich React ecosystem.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 20,
      points: 20,
      order: 1
    },
    {
      name: 'Setting Up React',
      contentArray: ['Create React App', 'Project structure', 'Development server', 'Build process'],
      type: 'Code',
      content: 'Set up your React development environment using Create React App. Understand the project structure, development server, and build process.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 25,
      points: 25,
      order: 2
    },
    {
      name: 'JSX Fundamentals',
      contentArray: ['JSX syntax', 'Expressions in JSX', 'JSX attributes', 'JSX vs HTML'],
      type: 'Code',
      content: 'Learn JSX - JavaScript XML. Understand how to write JSX, embed expressions, use attributes, and recognize differences between JSX and HTML.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 25,
      points: 25,
      order: 3
    },
    {
      name: 'Creating Functional Components',
      contentArray: ['Functional components', 'Component naming', 'Exporting components', 'Component composition'],
      type: 'Code',
      content: 'Create your first functional components in React. Learn naming conventions, how to export and import components, and compose them together.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 4
    },
    {
      name: 'Props: Passing Data',
      contentArray: ['What are props', 'Passing props', 'Props destructuring', 'Children prop'],
      type: 'Code',
      content: 'Master props - the way to pass data between React components. Learn to pass props, destructure them, and use the special children prop.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 5
    },
    {
      name: 'State with useState',
      contentArray: ['useState hook', 'State updates', 'Multiple state variables', 'State best practices'],
      type: 'Code',
      content: 'Learn state management with the useState hook. Understand how to update state, manage multiple state variables, and follow best practices.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 35,
      points: 35,
      order: 6
    },
    {
      name: 'Event Handling in React',
      contentArray: ['onClick events', 'onChange events', 'Event objects', 'Preventing defaults'],
      type: 'Code',
      content: 'Handle user interactions in React. Learn about onClick, onChange, and other events. Understand event objects and how to prevent default behaviors.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 7
    },
    {
      name: 'Conditional Rendering',
      contentArray: ['if-else in JSX', 'Ternary operators', 'Logical && operator', 'Switch statements'],
      type: 'Code',
      content: 'Master conditional rendering in React. Learn different techniques including ternary operators, logical && operator, and when to use each approach.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 25,
      points: 25,
      order: 8
    },
    {
      name: 'Lists and Keys',
      contentArray: ['Rendering lists', 'map function', 'Key prop', 'List best practices'],
      type: 'Code',
      content: 'Learn to render lists in React using the map function. Understand the importance of keys for efficient re-rendering and list management.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 9
    },
    {
      name: 'Forms and Controlled Components',
      contentArray: ['Controlled inputs', 'Form submission', 'Multiple inputs', 'Form validation'],
      type: 'Code',
      content: 'Master forms in React using controlled components. Learn to handle form submission, manage multiple inputs, and implement basic validation.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 35,
      points: 35,
      order: 10
    },
    {
      name: 'useEffect Hook',
      contentArray: ['Side effects', 'useEffect basics', 'Dependency array', 'Cleanup functions'],
      type: 'Code',
      content: 'Learn the useEffect hook for handling side effects in React. Understand dependencies, cleanup functions, and common use cases.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 40,
      points: 40,
      order: 11
    },
    {
      name: 'Component Lifecycle',
      contentArray: ['Mounting', 'Updating', 'Unmounting', 'Lifecycle with hooks'],
      type: 'Text',
      content: 'Understand the React component lifecycle: mounting, updating, and unmounting phases. Learn how hooks like useEffect map to lifecycle methods.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 12
    },
    {
      name: 'Component Styling',
      contentArray: ['Inline styles', 'CSS modules', 'Styled-components', 'Tailwind CSS'],
      type: 'Code',
      content: 'Explore different styling approaches in React: inline styles, CSS modules, CSS-in-JS libraries like styled-components, and utility frameworks like Tailwind CSS.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 13
    },
    {
      name: 'Props Validation with PropTypes',
      contentArray: ['PropTypes library', 'Type checking', 'Required props', 'Custom validators'],
      type: 'Code',
      content: 'Learn to validate props using PropTypes. Ensure your components receive the correct data types and catch errors early in development.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 25,
      points: 25,
      order: 14
    },
    {
      name: 'Component Best Practices',
      contentArray: ['Component structure', 'Code organization', 'Performance tips', 'Testing basics'],
      type: 'Text',
      content: 'Learn React component best practices: proper structure, code organization, performance optimization tips, and introduction to testing.',
      moduleId: findModule('React Components'),
      skillId: findSkill('React'),
      duration: 30,
      points: 30,
      order: 15
    },

    // Node.js Backend Development - 15 lessons
    {
      name: 'Introduction to Node.js',
      contentArray: ['What is Node.js', 'V8 engine', 'Event-driven architecture', 'Node.js use cases'],
      type: 'Text',
      content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. Learn about its event-driven, non-blocking I/O model that makes it lightweight and efficient.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 25,
      points: 25,
      order: 1
    },
    {
      name: 'Node.js Setup and NPM',
      contentArray: ['Installing Node.js', 'NPM basics', 'package.json', 'Node modules'],
      type: 'Code',
      content: 'Set up Node.js development environment. Learn NPM (Node Package Manager), create package.json files, and understand the Node module system.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 25,
      points: 25,
      order: 2
    },
    {
      name: 'Core Node.js Modules',
      contentArray: ['fs module', 'path module', 'os module', 'http module'],
      type: 'Code',
      content: 'Explore core Node.js modules: fs for file system operations, path for file paths, os for operating system info, and http for creating servers.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 35,
      points: 35,
      order: 3
    },
    {
      name: 'Creating HTTP Servers',
      contentArray: ['http.createServer', 'Request handling', 'Response objects', 'Status codes'],
      type: 'Code',
      content: 'Learn to create HTTP servers using Node.js built-in http module. Handle requests, send responses, and understand HTTP status codes.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 30,
      points: 30,
      order: 4
    },
    {
      name: 'Express.js Framework',
      contentArray: ['Installing Express', 'Creating Express app', 'Routing basics', 'Response methods'],
      type: 'Code',
      content: 'Master Express.js, the most popular Node.js web framework. Learn to create Express applications, define routes, and send responses.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 35,
      points: 35,
      order: 5
    },
    {
      name: 'Express Routing',
      contentArray: ['Route methods', 'Route parameters', 'Query strings', 'Route handlers'],
      type: 'Code',
      content: 'Deep dive into Express routing. Learn about HTTP methods, route parameters, query strings, and creating modular route handlers.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 35,
      points: 35,
      order: 6
    },
    {
      name: 'Middleware in Express',
      contentArray: ['What is middleware', 'Built-in middleware', 'Custom middleware', 'Error handling middleware'],
      type: 'Code',
      content: 'Understand Express middleware - functions that have access to request and response objects. Create custom middleware and handle errors.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 40,
      points: 40,
      order: 7
    },
    {
      name: 'Working with MongoDB',
      contentArray: ['MongoDB basics', 'Mongoose ODM', 'Schema definition', 'CRUD operations'],
      type: 'Code',
      content: 'Integrate MongoDB with Node.js using Mongoose. Define schemas, create models, and perform CRUD operations on your database.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 45,
      points: 45,
      order: 8
    },
    {
      name: 'RESTful API Design',
      contentArray: ['REST principles', 'HTTP methods', 'Status codes', 'API endpoints'],
      type: 'Text',
      content: 'Learn RESTful API design principles. Understand proper use of HTTP methods (GET, POST, PUT, DELETE), status codes, and endpoint naming.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 30,
      points: 30,
      order: 9
    },
    {
      name: 'Authentication with JWT',
      contentArray: ['JWT tokens', 'Password hashing', 'bcrypt library', 'Authentication middleware'],
      type: 'Code',
      content: 'Implement secure authentication using JSON Web Tokens (JWT). Learn password hashing with bcrypt and create authentication middleware.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 50,
      points: 50,
      order: 10
    },
    {
      name: 'Error Handling',
      contentArray: ['Try-catch blocks', 'Express error handlers', 'Async error handling', 'Custom errors'],
      type: 'Code',
      content: 'Master error handling in Node.js and Express. Learn to handle synchronous and asynchronous errors, create custom error classes.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 35,
      points: 35,
      order: 11
    },
    {
      name: 'Input Validation',
      contentArray: ['Joi validation', 'express-validator', 'Custom validators', 'Sanitization'],
      type: 'Code',
      content: 'Learn to validate and sanitize user input using libraries like Joi and express-validator. Protect your API from invalid or malicious data.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 40,
      points: 40,
      order: 12
    },
    {
      name: 'File Uploads',
      contentArray: ['Multer middleware', 'File validation', 'Storage configuration', 'Cloud storage'],
      type: 'Code',
      content: 'Handle file uploads in Express using Multer. Configure storage, validate files, and integrate with cloud storage services.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 40,
      points: 40,
      order: 13
    },
    {
      name: 'API Documentation',
      contentArray: ['Swagger/OpenAPI', 'Documentation tools', 'API testing', 'Postman collections'],
      type: 'Text',
      content: 'Learn to document your APIs using Swagger/OpenAPI. Create comprehensive documentation and Postman collections for API testing.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 30,
      points: 30,
      order: 14
    },
    {
      name: 'Deployment Basics',
      contentArray: ['Environment variables', 'Production setup', 'Deployment platforms', 'Best practices'],
      type: 'Text',
      content: 'Prepare your Node.js application for deployment. Learn about environment variables, production configurations, and deployment platforms.',
      moduleId: findModule('Node.js Backend Development'),
      skillId: findSkill('Node.js'),
      duration: 35,
      points: 35,
      order: 15
    },

    // Python Basics - 15 lessons
    {
      name: 'Introduction to Python',
      contentArray: ['What is Python', 'Python history', 'Python philosophy', 'Use cases'],
      type: 'Text',
      content: 'Python is a high-level, interpreted programming language known for its simplicity and readability. Learn about Python\'s philosophy, history, and diverse applications.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 20,
      points: 20,
      order: 1
    },
    {
      name: 'Python Installation and Setup',
      contentArray: ['Installing Python', 'Python IDLE', 'Virtual environments', 'pip package manager'],
      type: 'Code',
      content: 'Set up your Python development environment. Install Python, learn to use IDLE, create virtual environments, and manage packages with pip.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 20,
      points: 20,
      order: 2
    },
    {
      name: 'Python Syntax and Indentation',
      contentArray: ['Python syntax', 'Indentation rules', 'Comments', 'Code style (PEP 8)'],
      type: 'Code',
      content: 'Learn Python\'s unique syntax and the importance of indentation. Understand commenting, and follow PEP 8 style guidelines for clean code.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 25,
      points: 25,
      order: 3
    },
    {
      name: 'Variables and Data Types',
      contentArray: ['Variable assignment', 'Numbers', 'Strings', 'Booleans', 'Type conversion'],
      type: 'Code',
      content: 'Master Python variables and basic data types: integers, floats, strings, and booleans. Learn dynamic typing and type conversion.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 30,
      points: 30,
      order: 4
    },
    {
      name: 'Strings and String Methods',
      contentArray: ['String creation', 'String indexing', 'String slicing', 'String methods'],
      type: 'Code',
      content: 'Deep dive into Python strings. Learn indexing, slicing, and powerful string methods for manipulation and formatting.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 35,
      points: 35,
      order: 5
    },
    {
      name: 'Lists and List Operations',
      contentArray: ['Creating lists', 'List indexing', 'List methods', 'List comprehensions'],
      type: 'Code',
      content: 'Master Python lists - versatile, ordered collections. Learn list operations, methods like append, extend, pop, and powerful list comprehensions.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 40,
      points: 40,
      order: 6
    },
    {
      name: 'Tuples and Sets',
      contentArray: ['Tuples', 'Tuple operations', 'Sets', 'Set operations'],
      type: 'Code',
      content: 'Learn about tuples (immutable sequences) and sets (unordered unique collections). Understand when to use each data structure.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 30,
      points: 30,
      order: 7
    },
    {
      name: 'Dictionaries',
      contentArray: ['Creating dictionaries', 'Accessing values', 'Dictionary methods', 'Dict comprehensions'],
      type: 'Code',
      content: 'Master Python dictionaries - key-value pairs for efficient data lookup. Learn dictionary methods and dictionary comprehensions.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 35,
      points: 35,
      order: 8
    },
    {
      name: 'Conditional Statements',
      contentArray: ['if statements', 'elif and else', 'Nested conditions', 'Ternary operator'],
      type: 'Code',
      content: 'Learn conditional execution in Python using if, elif, and else statements. Master nested conditions and the ternary operator.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 25,
      points: 25,
      order: 9
    },
    {
      name: 'Loops in Python',
      contentArray: ['for loops', 'while loops', 'range function', 'break and continue'],
      type: 'Code',
      content: 'Master iteration in Python with for and while loops. Learn the range function and control loop execution with break and continue.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 35,
      points: 35,
      order: 10
    },
    {
      name: 'Functions in Python',
      contentArray: ['Defining functions', 'Parameters', 'Return values', 'Default arguments'],
      type: 'Code',
      content: 'Learn to define and use functions in Python. Understand parameters, return values, default arguments, and function scope.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 35,
      points: 35,
      order: 11
    },
    {
      name: 'Lambda Functions and Map/Filter',
      contentArray: ['Lambda functions', 'map function', 'filter function', 'reduce function'],
      type: 'Code',
      content: 'Master lambda functions for quick anonymous functions. Learn functional programming with map, filter, and reduce.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 30,
      points: 30,
      order: 12
    },
    {
      name: 'Modules and Imports',
      contentArray: ['Importing modules', 'from import', 'Creating modules', 'Standard library'],
      type: 'Code',
      content: 'Learn Python\'s module system. Import built-in and third-party modules, create your own modules, and explore the standard library.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 30,
      points: 30,
      order: 13
    },
    {
      name: 'File Handling',
      contentArray: ['Opening files', 'Reading files', 'Writing files', 'with statement'],
      type: 'Code',
      content: 'Learn to work with files in Python. Read from and write to files, understand file modes, and use the with statement for proper resource management.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 35,
      points: 35,
      order: 14
    },
    {
      name: 'Exception Handling',
      contentArray: ['try-except blocks', 'Exception types', 'finally clause', 'Raising exceptions'],
      type: 'Code',
      content: 'Master exception handling in Python. Use try-except blocks, handle specific exceptions, use finally for cleanup, and raise custom exceptions.',
      moduleId: findModule('Python Basics'),
      skillId: findSkill('Python'),
      duration: 30,
      points: 30,
      order: 15
    },
  ];

  // Add comprehensive lessons for remaining modules
  const comprehensiveData = comprehensiveLessonsData(modules, skills);
  lessonsData.push(
    ...comprehensiveData.reactHooks,
    ...comprehensiveData.redux,
    ...comprehensiveData.typescript,
    ...comprehensiveData.mongodb,
    ...comprehensiveData.postgresql,
    ...comprehensiveData.aws,
    ...comprehensiveData.docker,
    ...comprehensiveData.git,
    ...comprehensiveData.html,
    ...comprehensiveData.css,
    ...comprehensiveData.dataStructures,
    ...comprehensiveData.algorithms,
    ...comprehensiveData.machineLearning,
    ...comprehensiveData.ai,
    ...comprehensiveData.blockchain
  );

  // Add Java OOP lessons
  const javaLessons = [
    { name: 'Introduction to OOP', content: 'Learn object-oriented programming fundamentals and principles', duration: 25, order: 1 },
    { name: 'Classes and Objects', content: 'Define classes and create objects in Java with proper syntax', duration: 30, order: 2 },
    { name: 'Constructors', content: 'Master Java constructors and object initialization', duration: 25, order: 3 },
    { name: 'Instance Variables and Methods', content: 'Work with instance variables and methods effectively', duration: 30, order: 4 },
    { name: 'Access Modifiers', content: 'Understand public, private, protected, and default access', duration: 25, order: 5 },
    { name: 'Static Members', content: 'Learn static variables and methods in Java', duration: 30, order: 6 },
    { name: 'Inheritance', content: 'Master class inheritance and code reuse', duration: 35, order: 7 },
    { name: 'Method Overriding', content: 'Override methods in subclasses for polymorphism', duration: 30, order: 8 },
    { name: 'Polymorphism', content: 'Understand polymorphism and dynamic method binding', duration: 35, order: 9 },
    { name: 'Abstract Classes', content: 'Create and use abstract classes and methods', duration: 30, order: 10 },
    { name: 'Interfaces', content: 'Define and implement interfaces for abstraction', duration: 35, order: 11 },
    { name: 'Encapsulation', content: 'Apply encapsulation principles for data hiding', duration: 25, order: 12 },
    { name: 'Packages', content: 'Organize code with packages and imports', duration: 25, order: 13 },
    { name: 'Exception Handling in Java', content: 'Handle exceptions effectively with try-catch', duration: 30, order: 14 },
    { name: 'OOP Design Patterns', content: 'Learn common object-oriented design patterns', duration: 40, order: 15 }
  ].map(l => ({
    ...l,
    moduleId: findModule('Java Object-Oriented Programming'),
    skillId: findSkill('Java'),
    contentArray: [l.content],
    type: 'Code' as const,
    points: l.duration
  }));

  lessonsData.push(...javaLessons);

  const lessons = await Lesson.insertMany(lessonsData);
  console.log(`✅ Seeded ${lessons.length} lessons`);
  
  // Update modules with lessonsCount
  for (const module of modules) {
    const lessonCount = lessons.filter(l => l.moduleId.toString() === module._id.toString()).length;
    module.lessonsCount = lessonCount;
    await module.save();
  }
  
  console.log('✅ Updated modules with lesson counts');
  
  return lessons;
};
