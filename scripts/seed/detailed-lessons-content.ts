// Detailed lesson content with real educational material
export const detailedLessonsContent = {
  // JavaScript Fundamentals Module
  "JavaScript Fundamentals": [
    {
      order: 1,
      name: "Introduction to JavaScript",
      content: `# Introduction to JavaScript

## What is JavaScript?
JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS. It enables interactive web pages and is an essential part of web applications.

## Key Features
- **Dynamic typing**: Variables don't need type declarations
- **Prototype-based**: Uses prototypes instead of classes for inheritance
- **First-class functions**: Functions are treated as first-class citizens
- **Event-driven**: Responds to user interactions and events

## History
JavaScript was created by Brendan Eich in 1995 at Netscape. It was originally called Mocha, then LiveScript, and finally JavaScript. Despite the name similarity, JavaScript is not related to Java.

## Where JavaScript Runs
- **Browsers**: Client-side web development
- **Node.js**: Server-side development
- **Mobile apps**: React Native, Ionic
- **Desktop apps**: Electron
- **IoT devices**: Raspberry Pi, Arduino

## Basic Syntax Example
\`\`\`javascript
// Variable declaration
let message = "Hello, World!";
const PI = 3.14159;

// Function definition
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Function call
console.log(greet("Developer"));
\`\`\`

## Learning Path
This module will cover:
1. Variables and data types
2. Functions and scope
3. Objects and arrays
4. DOM manipulation
5. Asynchronous programming
6. Modern ES6+ features`,
      keyTopics: [
        "JavaScript history and purpose",
        "Basic syntax and structure",
        "Variables and data types",
        "Functions and scope"
      ]
    },
    {
      order: 2,
      name: "Variables and Data Types",
      content: `# Variables and Data Types in JavaScript

## Variable Declarations
JavaScript has three ways to declare variables:

### 1. var (Function-scoped)
\`\`\`javascript
var name = "John";
var age = 25;
\`\`\`

### 2. let (Block-scoped)
\`\`\`javascript
let city = "New York";
let isActive = true;
\`\`\`

### 3. const (Block-scoped, immutable)
\`\`\`javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";
\`\`\`

## Data Types
JavaScript has 8 primitive data types:

### 1. String
\`\`\`javascript
let firstName = "John";
let lastName = 'Doe';
let fullName = \`\${firstName} \${lastName}\`;
\`\`\`

### 2. Number
\`\`\`javascript
let integer = 42;
let decimal = 3.14;
let scientific = 1e6; // 1,000,000
\`\`\`

### 3. Boolean
\`\`\`javascript
let isLoggedIn = true;
let hasPermission = false;
\`\`\`

### 4. Undefined
\`\`\`javascript
let notAssigned; // undefined
\`\`\`

### 5. Null
\`\`\`javascript
let emptyValue = null;
\`\`\`

### 6. BigInt
\`\`\`javascript
let bigNumber = 123456789012345678901234567890n;
\`\`\`

### 7. Symbol
\`\`\`javascript
let uniqueId = Symbol('id');
\`\`\`

## Type Checking
\`\`\`javascript
console.log(typeof "Hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" (quirk!)
\`\`\`

## Type Coercion
JavaScript automatically converts types when needed:
\`\`\`javascript
let result = "5" + 3;        // "53" (string)
let result2 = "5" - 3;       // 2 (number)
let result3 = "5" * 3;       // 15 (number)
\`\`\`

## Best Practices
- Use \`const\` by default, \`let\` when reassignment is needed
- Avoid \`var\` in modern JavaScript
- Use descriptive variable names
- Initialize variables when declaring them`,
      keyTopics: [
        "Variable declarations (var, let, const)",
        "Primitive data types",
        "Type checking and coercion",
        "Best practices for naming"
      ]
    },
    {
      order: 3,
      name: "Functions and Scope",
      content: `# Functions and Scope in JavaScript

## Function Declarations
\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Function Expressions
\`\`\`javascript
const greet = function(name) {
    return \`Hello, \${name}!\`;
};
\`\`\`

## Arrow Functions (ES6+)
\`\`\`javascript
const greet = (name) => {
    return \`Hello, \${name}!\`;
};

// Shorthand for single expression
const greet = name => \`Hello, \${name}!\`;
\`\`\`

## Function Parameters
\`\`\`javascript
// Default parameters
function greet(name = "Guest") {
    return \`Hello, \${name}!\`;
}

// Rest parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
\`\`\`

## Scope in JavaScript

### Global Scope
\`\`\`javascript
var globalVar = "I'm global";
let globalLet = "I'm also global";

function checkScope() {
    console.log(globalVar); // Accessible
    console.log(globalLet); // Accessible
}
\`\`\`

### Function Scope
\`\`\`javascript
function myFunction() {
    var functionScoped = "I'm function scoped";
    let alsoFunctionScoped = "Me too";
    
    if (true) {
        var stillFunctionScoped = "Still in function scope";
        let blockScoped = "I'm block scoped";
    }
    
    console.log(stillFunctionScoped); // Works
    // console.log(blockScoped); // Error!
}
\`\`\`

### Block Scope
\`\`\`javascript
if (true) {
    let blockScoped = "I'm block scoped";
    const alsoBlockScoped = "Me too";
    var functionScoped = "I'm function scoped";
}

// console.log(blockScoped); // Error!
// console.log(alsoBlockScoped); // Error!
console.log(functionScoped); // Works
\`\`\`

## Closures
\`\`\`javascript
function outerFunction(x) {
    return function innerFunction(y) {
        return x + y;
    };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8
\`\`\`

## Higher-Order Functions
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(n => n * 2);

// Filter
const evens = numbers.filter(n => n % 2 === 0);

// Reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);
\`\`\`

## Callback Functions
\`\`\`javascript
function processData(data, callback) {
    // Simulate async operation
    setTimeout(() => {
        const result = data * 2;
        callback(result);
    }, 1000);
}

processData(5, (result) => {
    console.log(result); // 10
});
\`\`\`

## Best Practices
- Use arrow functions for short, simple functions
- Use function declarations for main functions
- Avoid deep nesting
- Use meaningful parameter names
- Handle errors appropriately`,
      keyTopics: [
        "Function declarations vs expressions",
        "Arrow functions and ES6+ features",
        "Scope (global, function, block)",
        "Closures and higher-order functions"
      ]
    }
  ],

  // React Components Module
  "React Components": [
    {
      order: 1,
      name: "Introduction to React",
      content: `# Introduction to React

## What is React?
React is a JavaScript library for building user interfaces, particularly web applications. It was created by Facebook (now Meta) and is maintained by Facebook and the community.

## Key Features
- **Component-based**: Build encapsulated components that manage their own state
- **Virtual DOM**: Efficient updates and rendering
- **Declarative**: Describe what the UI should look like
- **One-way data flow**: Predictable state management
- **JSX**: JavaScript XML syntax for writing components

## Why React?
- **Reusable components**: Write once, use anywhere
- **Performance**: Virtual DOM makes updates efficient
- **Large ecosystem**: Rich library of tools and packages
- **Strong community**: Extensive documentation and support
- **Industry standard**: Used by major companies worldwide

## Setting Up React
\`\`\`bash
# Create a new React app
npx create-react-app my-app
cd my-app
npm start
\`\`\`

## Your First Component
\`\`\`jsx
import React from 'react';

function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}

export default Welcome;
\`\`\`

## JSX Syntax
\`\`\`jsx
const element = (
    <div>
        <h1>Hello, World!</h1>
        <p>This is JSX syntax</p>
        <button onClick={() => alert('Clicked!')}>
            Click me
        </button>
    </div>
);
\`\`\`

## Component Lifecycle
React components have several lifecycle methods:
- **Mounting**: componentDidMount()
- **Updating**: componentDidUpdate()
- **Unmounting**: componentWillUnmount()

## Modern React with Hooks
\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        document.title = \`Count: \${count}\`;
    });
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
\`\`\`

## Learning Path
This module covers:
1. Components and JSX
2. Props and state
3. Event handling
4. Lifecycle methods
5. Hooks
6. Context and routing`,
      keyTopics: [
        "What is React and why use it",
        "Component-based architecture",
        "JSX syntax and rules",
        "Modern React with hooks"
      ]
    },
    {
      order: 2,
      name: "Components and JSX",
      content: `# Components and JSX in React

## What are Components?
Components are the building blocks of React applications. They are like JavaScript functions that accept inputs (called props) and return React elements describing what should appear on the screen.

## Functional Components
\`\`\`jsx
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## Arrow Function Components
\`\`\`jsx
const Welcome = (props) => {
    return <h1>Hello, {props.name}!</h1>;
};
\`\`\`

## JSX Syntax Rules

### 1. Must Return a Single Root Element
\`\`\`jsx
// ❌ Wrong - multiple root elements
function App() {
    return (
        <h1>Hello</h1>
        <p>World</p>
    );
}

// ✅ Correct - single root element
function App() {
    return (
        <div>
            <h1>Hello</h1>
            <p>World</p>
        </div>
    );
}
\`\`\`

### 2. Use Fragment for Multiple Elements
\`\`\`jsx
function App() {
    return (
        <React.Fragment>
            <h1>Hello</h1>
            <p>World</p>
        </React.Fragment>
    );
}

// Or use shorthand
function App() {
    return (
        <>
            <h1>Hello</h1>
            <p>World</p>
        </>
    );
}
\`\`\`

### 3. Use className Instead of class
\`\`\`jsx
// ❌ Wrong
<div class="container">Content</div>

// ✅ Correct
<div className="container">Content</div>
\`\`\`

### 4. Use camelCase for Event Handlers
\`\`\`jsx
<button onClick={handleClick}>
    Click me
</button>
\`\`\`

### 5. Self-Closing Tags
\`\`\`jsx
// ❌ Wrong
<img src="image.jpg"></img>

// ✅ Correct
<img src="image.jpg" alt="Description" />
\`\`\`

## Embedding Expressions in JSX
\`\`\`jsx
function UserProfile(props) {
    const user = props.user;
    const isLoggedIn = props.isLoggedIn;
    
    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            {isLoggedIn ? (
                <p>You are logged in</p>
            ) : (
                <p>Please log in</p>
            )}
            <p>Your score: {user.score || 0}</p>
        </div>
    );
}
\`\`\`

## Conditional Rendering
\`\`\`jsx
function Greeting(props) {
    const isLoggedIn = props.isLoggedIn;
    
    if (isLoggedIn) {
        return <h1>Welcome back!</h1>;
    }
    return <h1>Please sign up.</h1>;
}
\`\`\`

## Lists and Keys
\`\`\`jsx
function TodoList(props) {
    const todos = props.todos;
    
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>
                    {todo.text}
                </li>
            ))}
        </ul>
    );
}
\`\`\`

## Component Composition
\`\`\`jsx
function Card(props) {
    return (
        <div className="card">
            {props.children}
        </div>
    );
}

function App() {
    return (
        <Card>
            <h2>Card Title</h2>
            <p>Card content goes here</p>
        </Card>
    );
}
\`\`\`

## Best Practices
- Keep components small and focused
- Use descriptive names
- Extract reusable logic
- Use PropTypes for type checking
- Write tests for your components`,
      keyTopics: [
        "Functional vs class components",
        "JSX syntax rules and best practices",
        "Conditional rendering techniques",
        "Component composition patterns"
      ]
    }
  ],

  // Node.js Backend Development Module
  "Node.js Backend Development": [
    {
      order: 1,
      name: "Introduction to Node.js",
      content: `# Introduction to Node.js

## What is Node.js?
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server side, enabling full-stack JavaScript development.

## Key Features
- **Asynchronous and Event-driven**: Non-blocking I/O operations
- **Single-threaded**: Uses event loop for concurrency
- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Large ecosystem**: npm package manager with millions of packages
- **Fast execution**: V8 engine provides high performance

## Why Node.js?
- **JavaScript everywhere**: Same language for frontend and backend
- **Fast development**: Rich ecosystem and community
- **Scalable**: Handles many concurrent connections
- **Real-time applications**: WebSockets and real-time features
- **Microservices**: Lightweight and modular architecture

## Installing Node.js
\`\`\`bash
# Download from nodejs.org or use a version manager
# Using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
\`\`\`

## Your First Node.js Application
\`\`\`javascript
// app.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Running the Application
\`\`\`bash
node app.js
\`\`\`

## Package Management with npm
\`\`\`bash
# Initialize a new project
npm init

# Install dependencies
npm install express

# Install dev dependencies
npm install --save-dev nodemon

# Run scripts
npm start
npm run dev
\`\`\`

## Common Node.js Modules
- **http**: Create HTTP servers and clients
- **fs**: File system operations
- **path**: File and directory path utilities
- **url**: URL parsing and formatting
- **crypto**: Cryptographic functionality
- **events**: Event emitter functionality

## Asynchronous Programming
\`\`\`javascript
const fs = require('fs');

// Callback style
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// Promise style
fs.promises.readFile('file.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// Async/await style
async function readFile() {
    try {
        const data = await fs.promises.readFile('file.txt', 'utf8');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}
\`\`\`

## Event Loop
Node.js uses an event loop to handle asynchronous operations:
1. **Call Stack**: Executes synchronous code
2. **Callback Queue**: Holds callbacks from completed async operations
3. **Event Loop**: Moves callbacks from queue to stack when stack is empty

## Learning Path
This module covers:
1. Node.js fundamentals
2. File system operations
3. HTTP servers and routing
4. Database integration
5. Authentication and security
6. Deployment and production`,
      keyTopics: [
        "What is Node.js and its benefits",
        "Asynchronous programming concepts",
        "npm package management",
        "Event loop and non-blocking I/O"
      ]
    }
  ]
};

// Quiz data for all lessons
export const quizData = {
  "JavaScript Fundamentals": [
    {
      lessonOrder: 1,
      questions: [
        {
          question: "What is JavaScript primarily used for?",
          options: [
            "Server-side programming only",
            "Database management",
            "Creating interactive web pages",
            "Mobile app development only"
          ],
          correctAnswer: 2,
          explanation: "JavaScript is primarily used for creating interactive web pages and web applications."
        },
        {
          question: "Which of the following is NOT a JavaScript data type?",
          options: [
            "String",
            "Number",
            "Character",
            "Boolean"
          ],
          correctAnswer: 2,
          explanation: "Character is not a JavaScript data type. JavaScript has String, Number, Boolean, Undefined, Null, BigInt, and Symbol."
        },
        {
          question: "What does the 'typeof' operator return for null?",
          options: [
            "null",
            "undefined",
            "object",
            "string"
          ],
          correctAnswer: 2,
          explanation: "typeof null returns 'object' - this is a known quirk in JavaScript."
        }
      ]
    },
    {
      lessonOrder: 2,
      questions: [
        {
          question: "Which variable declaration creates a block-scoped variable?",
          options: [
            "var",
            "let",
            "const",
            "Both let and const"
          ],
          correctAnswer: 3,
          explanation: "Both let and const create block-scoped variables, while var is function-scoped."
        },
        {
          question: "What will be the result of '5' + 3 in JavaScript?",
          options: [
            "8",
            "53",
            "Error",
            "undefined"
          ],
          correctAnswer: 1,
          explanation: "JavaScript performs type coercion, converting 3 to a string and concatenating: '5' + '3' = '53'."
        },
        {
          question: "Which is the correct way to declare a constant in JavaScript?",
          options: [
            "const PI = 3.14;",
            "var PI = 3.14;",
            "let PI = 3.14;",
            "constant PI = 3.14;"
          ],
          correctAnswer: 0,
          explanation: "const is the keyword for declaring constants in JavaScript."
        }
      ]
    },
    {
      lessonOrder: 3,
      questions: [
        {
          question: "What is the main difference between function declarations and function expressions?",
          options: [
            "No difference",
            "Function declarations are hoisted, expressions are not",
            "Function expressions are hoisted, declarations are not",
            "Only function declarations can have parameters"
          ],
          correctAnswer: 1,
          explanation: "Function declarations are hoisted and can be called before they are defined, while function expressions are not hoisted."
        },
        {
          question: "What is a closure in JavaScript?",
          options: [
            "A function that returns another function",
            "A function that has access to variables in its outer scope",
            "A function with no parameters",
            "A function that calls itself"
          ],
          correctAnswer: 1,
          explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function returns."
        },
        {
          question: "Which scope does 'var' have in JavaScript?",
          options: [
            "Block scope",
            "Function scope",
            "Global scope only",
            "Module scope"
          ],
          correctAnswer: 1,
          explanation: "var has function scope, meaning it's accessible throughout the entire function where it's declared."
        }
      ]
    }
  ],
  "React Components": [
    {
      lessonOrder: 1,
      questions: [
        {
          question: "What is React primarily used for?",
          options: [
            "Database management",
            "Building user interfaces",
            "Server-side programming",
            "Mobile app development only"
          ],
          correctAnswer: 1,
          explanation: "React is a JavaScript library for building user interfaces, particularly web applications."
        },
        {
          question: "What does JSX stand for?",
          options: [
            "JavaScript XML",
            "Java Script eXtension",
            "JSON XML Syntax",
            "JavaScript eXtension"
          ],
          correctAnswer: 0,
          explanation: "JSX stands for JavaScript XML, a syntax extension that allows you to write HTML-like code in JavaScript."
        },
        {
          question: "Which company created React?",
          options: [
            "Google",
            "Microsoft",
            "Facebook (Meta)",
            "Twitter"
          ],
          correctAnswer: 2,
          explanation: "React was created by Facebook (now Meta) and is maintained by Facebook and the community."
        }
      ]
    },
    {
      lessonOrder: 2,
      questions: [
        {
          question: "What is the correct way to write a functional component in React?",
          options: [
            "function MyComponent() { return <div>Hello</div>; }",
            "const MyComponent = () => { return <div>Hello</div>; }",
            "Both A and B are correct",
            "Neither A nor B"
          ],
          correctAnswer: 2,
          explanation: "Both function declarations and arrow function expressions are valid ways to create functional components in React."
        },
        {
          question: "What is the correct attribute name for CSS classes in JSX?",
          options: [
            "class",
            "className",
            "cssClass",
            "styleClass"
          ],
          correctAnswer: 1,
          explanation: "In JSX, you must use 'className' instead of 'class' because 'class' is a reserved keyword in JavaScript."
        },
        {
          question: "What is the purpose of keys in React lists?",
          options: [
            "To make the list look better",
            "To help React identify which items have changed",
            "To sort the list",
            "To filter the list"
          ],
          correctAnswer: 1,
          explanation: "Keys help React identify which items have changed, been added, or removed, making list updates more efficient."
        }
      ]
    }
  ],
  "Node.js Backend Development": [
    {
      lessonOrder: 1,
      questions: [
        {
          question: "What is Node.js built on?",
          options: [
            "Chrome's V8 JavaScript engine",
            "Mozilla's SpiderMonkey engine",
            "Microsoft's Chakra engine",
            "Apple's JavaScriptCore engine"
          ],
          correctAnswer: 0,
          explanation: "Node.js is built on Chrome's V8 JavaScript engine, the same engine that powers Google Chrome."
        },
        {
          question: "What is the main advantage of Node.js?",
          options: [
            "It's faster than other languages",
            "It allows JavaScript on the server side",
            "It has better memory management",
            "It's easier to learn"
          ],
          correctAnswer: 1,
          explanation: "The main advantage of Node.js is that it allows developers to use JavaScript on both the client and server side."
        },
        {
          question: "What does npm stand for?",
          options: [
            "Node Package Manager",
            "New Project Manager",
            "Node Project Manager",
            "Network Package Manager"
          ],
          correctAnswer: 0,
          explanation: "npm stands for Node Package Manager, which is used to install and manage JavaScript packages."
        }
      ]
    }
  ]
};
