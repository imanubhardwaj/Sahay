// Full course content with detailed lessons for all courses
// This file contains comprehensive educational content for every module

interface LessonContent {
  name: string;
  content: string;
  contentArray: string[];
  type: 'Text' | 'Code';
  duration: number;
  points: number;
  order: number;
}

interface ModuleLessons {
  [moduleName: string]: LessonContent[];
}

export const fullCourseContent: ModuleLessons = {
  // ==================== JAVASCRIPT FUNDAMENTALS ====================
  'JavaScript Fundamentals': [
    {
      name: 'Introduction to JavaScript',
      content: `# Introduction to JavaScript

## What is JavaScript?

JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS. It enables interactive web pages and is an essential part of web applications.

## Key Features

- **Dynamic typing**: Variables don't need type declarations
- **Prototype-based**: Uses prototypes instead of classes for inheritance
- **First-class functions**: Functions are treated as first-class citizens
- **Event-driven**: Responds to user interactions and events

## History of JavaScript

JavaScript was created by Brendan Eich in 1995 at Netscape. Originally called Mocha, then LiveScript, it was finally renamed to JavaScript. Despite the name, JavaScript is not related to Java.

## Where JavaScript Runs

\`\`\`javascript
// Browser Console
console.log("Hello from the browser!");

// Node.js Environment
console.log("Hello from Node.js!");

// In HTML file
<script>
  console.log("Hello from HTML!");
</script>
\`\`\`

## ECMAScript Versions

JavaScript is standardized as ECMAScript:
- ES5 (2009): Added strict mode, JSON support
- ES6/ES2015: Classes, modules, arrow functions
- ES2016-2023: Async/await, optional chaining, and more

## Your First JavaScript Program

\`\`\`javascript
// This is a comment
let message = "Hello, World!";
console.log(message);

// Variables and operations
let x = 5;
let y = 10;
let sum = x + y;
console.log("Sum:", sum); // Output: Sum: 15
\`\`\``,
      contentArray: ['What is JavaScript', 'History and evolution', 'JavaScript environments', 'ECMAScript versions'],
      type: 'Text',
      duration: 20,
      points: 20,
      order: 1
    },
    {
      name: 'Variables and Data Types',
      content: `# Variables and Data Types

## Variable Declarations

JavaScript has three ways to declare variables:

### var (Function-scoped, hoisted)
\`\`\`javascript
var name = "John";
var age = 25;
console.log(name, age);
\`\`\`

### let (Block-scoped, not hoisted)
\`\`\`javascript
let city = "New York";
let isActive = true;
// Can be reassigned
city = "Los Angeles";
\`\`\`

### const (Block-scoped, constant)
\`\`\`javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";
// Cannot be reassigned
// PI = 3.14; // Error!
\`\`\`

## Primitive Data Types

### 1. String
\`\`\`javascript
let firstName = "John";
let lastName = 'Doe';
let fullName = \`\${firstName} \${lastName}\`; // Template literal
console.log(fullName); // "John Doe"
\`\`\`

### 2. Number
\`\`\`javascript
let integer = 42;
let decimal = 3.14;
let negative = -10;
let scientific = 1e6; // 1,000,000
let infinity = Infinity;
let notANumber = NaN;
\`\`\`

### 3. Boolean
\`\`\`javascript
let isLoggedIn = true;
let hasPermission = false;
let result = 5 > 3; // true
\`\`\`

### 4. Undefined and Null
\`\`\`javascript
let notAssigned; // undefined
let emptyValue = null;
console.log(typeof notAssigned); // "undefined"
console.log(typeof emptyValue); // "object" (quirk!)
\`\`\`

### 5. Symbol and BigInt
\`\`\`javascript
let uniqueId = Symbol('id');
let bigNumber = 123456789012345678901234567890n;
\`\`\`

## Type Checking
\`\`\`javascript
console.log(typeof "Hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"
console.log(typeof Symbol());    // "symbol"
\`\`\`

## Type Coercion
\`\`\`javascript
// Implicit coercion
let result1 = "5" + 3;      // "53" (string)
let result2 = "5" - 3;      // 2 (number)
let result3 = "5" * 3;      // 15 (number)

// Explicit conversion
let str = String(123);      // "123"
let num = Number("123");    // 123
let bool = Boolean(1);      // true
\`\`\``,
      contentArray: ['var, let, const', 'Primitive types', 'Type coercion', 'Template literals'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 2
    },
    {
      name: 'Operators and Expressions',
      content: `# Operators and Expressions

## Arithmetic Operators
\`\`\`javascript
let a = 10, b = 3;

console.log(a + b);  // 13 (Addition)
console.log(a - b);  // 7 (Subtraction)
console.log(a * b);  // 30 (Multiplication)
console.log(a / b);  // 3.333... (Division)
console.log(a % b);  // 1 (Modulus/Remainder)
console.log(a ** b); // 1000 (Exponentiation)

// Increment and Decrement
let x = 5;
console.log(x++); // 5 (post-increment)
console.log(++x); // 7 (pre-increment)
console.log(x--); // 7 (post-decrement)
console.log(--x); // 5 (pre-decrement)
\`\`\`

## Comparison Operators
\`\`\`javascript
let x = 5;

// Equality (loose vs strict)
console.log(5 == "5");   // true (loose equality)
console.log(5 === "5");  // false (strict equality)
console.log(5 != "5");   // false (loose inequality)
console.log(5 !== "5");  // true (strict inequality)

// Relational operators
console.log(5 > 3);   // true
console.log(5 < 3);   // false
console.log(5 >= 5);  // true
console.log(5 <= 4);  // false
\`\`\`

## Logical Operators
\`\`\`javascript
let a = true, b = false;

// AND (&&) - both must be true
console.log(a && b); // false
console.log(a && a); // true

// OR (||) - at least one must be true
console.log(a || b); // true
console.log(b || b); // false

// NOT (!) - inverts the value
console.log(!a); // false
console.log(!b); // true

// Short-circuit evaluation
let result = false && someFunction(); // someFunction never called
let value = null || "default";        // "default"
\`\`\`

## Nullish Coalescing and Optional Chaining
\`\`\`javascript
// Nullish coalescing (??)
let userInput = null;
let value = userInput ?? "default"; // "default"

// Different from OR (||)
let count = 0;
console.log(count || 10);  // 10 (0 is falsy)
console.log(count ?? 10);  // 0 (0 is not null/undefined)

// Optional chaining (?.)
let user = { name: "John" };
console.log(user?.address?.city); // undefined (no error)
\`\`\`

## Ternary Operator
\`\`\`javascript
let age = 20;
let status = age >= 18 ? "Adult" : "Minor";
console.log(status); // "Adult"

// Nested ternary (use sparingly)
let score = 85;
let grade = score >= 90 ? "A" 
          : score >= 80 ? "B" 
          : score >= 70 ? "C" 
          : "F";
console.log(grade); // "B"
\`\`\`

## Assignment Operators
\`\`\`javascript
let x = 10;

x += 5;  // x = x + 5;  => 15
x -= 3;  // x = x - 3;  => 12
x *= 2;  // x = x * 2;  => 24
x /= 4;  // x = x / 4;  => 6
x %= 4;  // x = x % 4;  => 2
x **= 3; // x = x ** 3; => 8
\`\`\``,
      contentArray: ['Arithmetic operators', 'Comparison operators', 'Logical operators', 'Ternary operator'],
      type: 'Code',
      duration: 20,
      points: 20,
      order: 3
    },
    {
      name: 'Control Structures: Conditionals',
      content: `# Control Structures: Conditionals

## if Statement
\`\`\`javascript
let temperature = 25;

if (temperature > 30) {
    console.log("It's hot!");
}

// With else
if (temperature > 30) {
    console.log("It's hot!");
} else {
    console.log("It's comfortable.");
}
\`\`\`

## if-else-if Chain
\`\`\`javascript
let score = 85;

if (score >= 90) {
    console.log("Grade: A");
} else if (score >= 80) {
    console.log("Grade: B");
} else if (score >= 70) {
    console.log("Grade: C");
} else if (score >= 60) {
    console.log("Grade: D");
} else {
    console.log("Grade: F");
}
\`\`\`

## switch Statement
\`\`\`javascript
let day = "Monday";

switch (day) {
    case "Monday":
        console.log("Start of work week");
        break;
    case "Friday":
        console.log("TGIF!");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend!");
        break;
    default:
        console.log("Regular day");
}
\`\`\`

## Guard Clauses
\`\`\`javascript
// Without guard clauses (nested)
function processUser(user) {
    if (user) {
        if (user.isActive) {
            if (user.hasPermission) {
                // Do something
                return "Success";
            }
        }
    }
    return "Error";
}

// With guard clauses (cleaner)
function processUserBetter(user) {
    if (!user) return "Error: No user";
    if (!user.isActive) return "Error: User inactive";
    if (!user.hasPermission) return "Error: No permission";
    
    // Do something
    return "Success";
}
\`\`\`

## Truthy and Falsy Values
\`\`\`javascript
// Falsy values (evaluate to false)
if (false) {}
if (0) {}
if ("") {}
if (null) {}
if (undefined) {}
if (NaN) {}

// Truthy values (evaluate to true)
if (true) {}
if (1) {}
if ("hello") {}
if ([]) {}    // Empty array is truthy!
if ({}) {}    // Empty object is truthy!

// Practical example
let username = "";
if (username) {
    console.log("Hello, " + username);
} else {
    console.log("Please enter a username");
}
\`\`\`

## Best Practices
\`\`\`javascript
// 1. Use strict equality (===)
if (x === 5) { } // Good
if (x == 5) { }  // Avoid

// 2. Avoid deeply nested conditions
// Bad
if (a) {
    if (b) {
        if (c) { }
    }
}

// Good
if (!a || !b || !c) return;
// proceed with logic

// 3. Use early returns for error handling
function validate(input) {
    if (!input) return false;
    if (input.length < 3) return false;
    return true;
}
\`\`\``,
      contentArray: ['if-else statements', 'switch statements', 'Guard clauses', 'Best practices'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 4
    },
    {
      name: 'Loops and Iteration',
      content: `# Loops and Iteration

## for Loop
\`\`\`javascript
// Basic for loop
for (let i = 0; i < 5; i++) {
    console.log(i); // 0, 1, 2, 3, 4
}

// Looping through arrays
const fruits = ["apple", "banana", "orange"];
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

// Counting backwards
for (let i = 10; i > 0; i--) {
    console.log(i);
}
\`\`\`

## while Loop
\`\`\`javascript
let count = 0;
while (count < 5) {
    console.log(count);
    count++;
}

// Useful when you don't know iterations
let num = 16;
while (num > 1) {
    console.log(num);
    num = num / 2;
}
// Output: 16, 8, 4, 2
\`\`\`

## do-while Loop
\`\`\`javascript
// Executes at least once
let i = 0;
do {
    console.log(i);
    i++;
} while (i < 5);

// Even if condition is false initially
let x = 10;
do {
    console.log("This runs once!");
} while (x < 5);
\`\`\`

## for...of Loop (Arrays)
\`\`\`javascript
const colors = ["red", "green", "blue"];

for (const color of colors) {
    console.log(color);
}

// With index using entries()
for (const [index, color] of colors.entries()) {
    console.log(\`\${index}: \${color}\`);
}
\`\`\`

## for...in Loop (Objects)
\`\`\`javascript
const person = {
    name: "John",
    age: 30,
    city: "New York"
};

for (const key in person) {
    console.log(\`\${key}: \${person[key]}\`);
}
\`\`\`

## break and continue
\`\`\`javascript
// break - exit the loop entirely
for (let i = 0; i < 10; i++) {
    if (i === 5) break;
    console.log(i); // 0, 1, 2, 3, 4
}

// continue - skip current iteration
for (let i = 0; i < 5; i++) {
    if (i === 2) continue;
    console.log(i); // 0, 1, 3, 4
}

// Labeled statements (rare but useful)
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) break outer;
        console.log(i, j);
    }
}
\`\`\`

## Array Iteration Methods
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// forEach - no return value
numbers.forEach((num, index) => {
    console.log(\`Index \${index}: \${num}\`);
});

// map - returns new array
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter - returns filtered array
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// find - returns first match
const found = numbers.find(num => num > 3);
console.log(found); // 4
\`\`\``,
      contentArray: ['for loops', 'while loops', 'do-while loops', 'break and continue'],
      type: 'Code',
      duration: 30,
      points: 30,
      order: 5
    },
    {
      name: 'Functions Basics',
      content: `# Functions Basics

## Function Declarations
\`\`\`javascript
// Basic function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("John")); // "Hello, John!"

// Function with multiple parameters
function add(a, b) {
    return a + b;
}

console.log(add(5, 3)); // 8
\`\`\`

## Function Expressions
\`\`\`javascript
// Named function expression
const multiply = function multiply(a, b) {
    return a * b;
};

// Anonymous function expression
const divide = function(a, b) {
    return a / b;
};

console.log(multiply(4, 5)); // 20
console.log(divide(20, 4));  // 5
\`\`\`

## Arrow Functions (ES6)
\`\`\`javascript
// Basic arrow function
const greet = (name) => {
    return "Hello, " + name;
};

// Single parameter (parentheses optional)
const double = num => num * 2;

// Single expression (implicit return)
const square = x => x * x;

// Multiple parameters
const sum = (a, b) => a + b;

// No parameters
const sayHello = () => "Hello!";

console.log(double(5));    // 10
console.log(square(4));    // 16
console.log(sum(3, 7));    // 10
\`\`\`

## Return Values
\`\`\`javascript
// Explicit return
function getFullName(first, last) {
    return first + " " + last;
}

// No return (returns undefined)
function logMessage(msg) {
    console.log(msg);
    // implicitly returns undefined
}

// Return early
function divide(a, b) {
    if (b === 0) {
        return "Cannot divide by zero";
    }
    return a / b;
}

// Return object (wrap in parentheses with arrow)
const createUser = (name, age) => ({ name, age });
console.log(createUser("John", 25)); // { name: "John", age: 25 }
\`\`\`

## Function Hoisting
\`\`\`javascript
// Function declarations are hoisted
console.log(greet("John")); // Works!

function greet(name) {
    return "Hello, " + name;
}

// Function expressions are NOT hoisted
// console.log(add(2, 3)); // Error!

const add = function(a, b) {
    return a + b;
};

console.log(add(2, 3)); // Works now
\`\`\`

## First-Class Functions
\`\`\`javascript
// Functions can be assigned to variables
const sayHi = function() { return "Hi!"; };

// Functions can be passed as arguments
function executeFunction(fn) {
    return fn();
}
console.log(executeFunction(sayHi)); // "Hi!"

// Functions can be returned from functions
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\``,
      contentArray: ['Function declarations', 'Function expressions', 'Arrow functions', 'Return values'],
      type: 'Code',
      duration: 30,
      points: 30,
      order: 6
    },
    {
      name: 'Function Parameters and Arguments',
      content: `# Function Parameters and Arguments

## Parameters vs Arguments
\`\`\`javascript
// Parameters are in function definition
function greet(name, greeting) { // name, greeting are parameters
    return \`\${greeting}, \${name}!\`;
}

// Arguments are values passed when calling
greet("John", "Hello"); // "John", "Hello" are arguments
\`\`\`

## Default Parameters
\`\`\`javascript
// ES6 default parameters
function greet(name = "Guest", greeting = "Hello") {
    return \`\${greeting}, \${name}!\`;
}

console.log(greet());              // "Hello, Guest!"
console.log(greet("John"));        // "Hello, John!"
console.log(greet("John", "Hi"));  // "Hi, John!"

// Default with expressions
function createDate(year = new Date().getFullYear()) {
    return year;
}

// Default referencing other parameters
function createRect(width, height = width) {
    return { width, height };
}
console.log(createRect(10)); // { width: 10, height: 10 }
\`\`\`

## Rest Parameters
\`\`\`javascript
// Collect remaining arguments into array
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Rest must be last parameter
function introduce(greeting, ...names) {
    return \`\${greeting}, \${names.join(" and ")}!\`;
}

console.log(introduce("Hello", "John", "Jane", "Bob"));
// "Hello, John and Jane and Bob!"
\`\`\`

## Spread Operator
\`\`\`javascript
// Spread array into arguments
const numbers = [5, 10, 15];
console.log(Math.max(...numbers)); // 15

// Combining arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4, 5, 6]

// Copying arrays
const original = [1, 2, 3];
const copy = [...original];

// Spread with objects
const user = { name: "John", age: 30 };
const updated = { ...user, age: 31 };
console.log(updated); // { name: "John", age: 31 }
\`\`\`

## Destructuring in Parameters
\`\`\`javascript
// Object destructuring
function displayUser({ name, age, city = "Unknown" }) {
    console.log(\`\${name}, \${age}, from \${city}\`);
}

const user = { name: "John", age: 30 };
displayUser(user); // "John, 30, from Unknown"

// Array destructuring
function getFirstTwo([first, second]) {
    return { first, second };
}

console.log(getFirstTwo([1, 2, 3])); // { first: 1, second: 2 }

// Combined with rest
function process([first, ...rest]) {
    console.log("First:", first);
    console.log("Rest:", rest);
}

process([1, 2, 3, 4]); // First: 1, Rest: [2, 3, 4]
\`\`\`

## Arguments Object (Legacy)
\`\`\`javascript
// Works in regular functions (not arrow functions)
function legacySum() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}

console.log(legacySum(1, 2, 3, 4)); // 10

// Prefer rest parameters in modern code
function modernSum(...nums) {
    return nums.reduce((a, b) => a + b, 0);
}
\`\`\``,
      contentArray: ['Parameters vs arguments', 'Default parameters', 'Rest parameters', 'Spread operator'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 7
    },
    {
      name: 'Scope and Closures',
      content: `# Scope and Closures

## Global Scope
\`\`\`javascript
// Variables declared outside any function
var globalVar = "I'm global";
let globalLet = "I'm also global";
const globalConst = "I'm global too";

function accessGlobals() {
    console.log(globalVar);   // Accessible
    console.log(globalLet);   // Accessible
    console.log(globalConst); // Accessible
}

accessGlobals();
\`\`\`

## Function Scope
\`\`\`javascript
function myFunction() {
    var functionScoped = "I'm function scoped";
    let alsoFunctionScoped = "Me too";
    
    console.log(functionScoped);      // Works
    console.log(alsoFunctionScoped);  // Works
}

myFunction();
// console.log(functionScoped);      // Error! Not accessible
// console.log(alsoFunctionScoped);  // Error! Not accessible
\`\`\`

## Block Scope
\`\`\`javascript
if (true) {
    var varVariable = "var is function scoped";
    let letVariable = "let is block scoped";
    const constVariable = "const is block scoped";
}

console.log(varVariable);     // Works (var ignores block)
// console.log(letVariable);     // Error!
// console.log(constVariable);   // Error!

// Block scope in loops
for (let i = 0; i < 3; i++) {
    // i is scoped to this block
}
// console.log(i); // Error!

for (var j = 0; j < 3; j++) {
    // j leaks out of the block
}
console.log(j); // 3
\`\`\`

## Lexical Scope
\`\`\`javascript
const outerVar = "outer";

function outer() {
    const middleVar = "middle";
    
    function inner() {
        const innerVar = "inner";
        
        // Can access all outer scopes
        console.log(outerVar);   // "outer"
        console.log(middleVar);  // "middle"
        console.log(innerVar);   // "inner"
    }
    
    inner();
    // console.log(innerVar); // Error! Can't access inner scope
}

outer();
\`\`\`

## Closures
\`\`\`javascript
// A closure is a function that remembers its outer scope
function createCounter() {
    let count = 0; // This variable is "enclosed"
    
    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// Each call creates a new closure
const counter2 = createCounter();
console.log(counter2()); // 1 (separate count)
\`\`\`

## Practical Closure Examples
\`\`\`javascript
// Private variables
function createBankAccount(initialBalance) {
    let balance = initialBalance; // Private
    
    return {
        deposit(amount) {
            balance += amount;
            return balance;
        },
        withdraw(amount) {
            if (amount > balance) {
                return "Insufficient funds";
            }
            balance -= amount;
            return balance;
        },
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
console.log(account.deposit(50));    // 150
console.log(account.withdraw(30));   // 120
console.log(account.getBalance());   // 120
// console.log(account.balance);     // undefined (private!)

// Function factories
function multiply(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
\`\`\`

## Common Closure Pitfall
\`\`\`javascript
// Problem with var in loops
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Logs: 3, 3, 3 (not 0, 1, 2!)

// Solution 1: Use let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2

// Solution 2: IIFE (Immediately Invoked Function Expression)
for (var i = 0; i < 3; i++) {
    ((j) => {
        setTimeout(() => console.log(j), 100);
    })(i);
}
// Logs: 0, 1, 2
\`\`\``,
      contentArray: ['Global scope', 'Function scope', 'Block scope', 'Closures explained'],
      type: 'Text',
      duration: 35,
      points: 35,
      order: 8
    },
    {
      name: 'Arrays Fundamentals',
      content: `# Arrays Fundamentals

## Creating Arrays
\`\`\`javascript
// Array literal (preferred)
const fruits = ["apple", "banana", "orange"];

// Array constructor
const numbers = new Array(1, 2, 3, 4, 5);

// Empty array
const empty = [];

// Array with mixed types
const mixed = [1, "hello", true, null, { name: "John" }];

// Array.from() - create from iterable
const chars = Array.from("hello"); // ["h", "e", "l", "l", "o"]

// Array.of() - create from arguments
const arr = Array.of(1, 2, 3); // [1, 2, 3]
\`\`\`

## Accessing Elements
\`\`\`javascript
const colors = ["red", "green", "blue", "yellow"];

// Index access (0-based)
console.log(colors[0]);  // "red"
console.log(colors[2]);  // "blue"

// Negative index doesn't work directly
console.log(colors[-1]); // undefined

// Use at() for negative indexing
console.log(colors.at(-1)); // "yellow"
console.log(colors.at(-2)); // "blue"

// Modifying elements
colors[1] = "lime";
console.log(colors); // ["red", "lime", "blue", "yellow"]
\`\`\`

## Array Length
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

console.log(numbers.length); // 5

// Length can be modified
numbers.length = 3;
console.log(numbers); // [1, 2, 3]

numbers.length = 5;
console.log(numbers); // [1, 2, 3, undefined, undefined]

// Get last element
const last = numbers[numbers.length - 1];
\`\`\`

## Adding and Removing Elements
\`\`\`javascript
const arr = [1, 2, 3];

// Add to end
arr.push(4);        // Returns new length: 4
console.log(arr);   // [1, 2, 3, 4]

// Add to beginning
arr.unshift(0);     // Returns new length: 5
console.log(arr);   // [0, 1, 2, 3, 4]

// Remove from end
const last = arr.pop();    // Returns removed element: 4
console.log(arr);          // [0, 1, 2, 3]

// Remove from beginning
const first = arr.shift(); // Returns removed element: 0
console.log(arr);          // [1, 2, 3]

// Splice - add/remove at specific index
const nums = [1, 2, 3, 4, 5];
nums.splice(2, 1);        // Remove 1 element at index 2
console.log(nums);        // [1, 2, 4, 5]

nums.splice(2, 0, 3);     // Insert 3 at index 2
console.log(nums);        // [1, 2, 3, 4, 5]

nums.splice(1, 2, 'a', 'b'); // Replace 2 elements
console.log(nums);          // [1, "a", "b", 4, 5]
\`\`\`

## Multi-dimensional Arrays
\`\`\`javascript
// 2D array (matrix)
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log(matrix[0][0]); // 1
console.log(matrix[1][2]); // 6
console.log(matrix[2][1]); // 8

// Iterating 2D array
for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        console.log(matrix[i][j]);
    }
}

// Using flat() to flatten
const flat = matrix.flat(); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

## Checking Arrays
\`\`\`javascript
const arr = [1, 2, 3];

// Check if array
console.log(Array.isArray(arr));     // true
console.log(Array.isArray("hello")); // false

// Check if element exists
console.log(arr.includes(2));  // true
console.log(arr.includes(5));  // false

// Find index
console.log(arr.indexOf(2));   // 1
console.log(arr.indexOf(5));   // -1 (not found)
\`\`\``,
      contentArray: ['Creating arrays', 'Accessing elements', 'Array length', 'Multi-dimensional arrays'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 9
    },
    {
      name: 'Array Methods',
      content: `# Array Methods

## Transformation Methods

### map()
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Extract property from objects
const users = [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
];
const names = users.map(user => user.name);
console.log(names); // ["John", "Jane"]

// With index
const indexed = numbers.map((num, index) => \`\${index}: \${num}\`);
\`\`\`

### filter()
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Get even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// Filter objects
const users = [
    { name: "John", age: 30, active: true },
    { name: "Jane", age: 25, active: false },
    { name: "Bob", age: 35, active: true }
];

const activeUsers = users.filter(user => user.active);
const adults = users.filter(user => user.age >= 30);
\`\`\`

### reduce()
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// Find maximum
const max = numbers.reduce((acc, num) => num > acc ? num : acc, numbers[0]);
console.log(max); // 5

// Group by property
const items = [
    { type: "fruit", name: "apple" },
    { type: "vegetable", name: "carrot" },
    { type: "fruit", name: "banana" }
];

const grouped = items.reduce((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
}, {});
\`\`\`

## Search Methods

### find() and findIndex()
\`\`\`javascript
const users = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "Bob" }
];

// Find first match
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, name: "Jane" }

// Find index of first match
const index = users.findIndex(u => u.name === "Bob");
console.log(index); // 2
\`\`\`

### some() and every()
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Check if any element matches
const hasEven = numbers.some(num => num % 2 === 0);
console.log(hasEven); // true

// Check if all elements match
const allPositive = numbers.every(num => num > 0);
console.log(allPositive); // true

const allEven = numbers.every(num => num % 2 === 0);
console.log(allEven); // false
\`\`\`

## Sorting and Ordering

### sort()
\`\`\`javascript
// Alphabetical sort (default)
const fruits = ["banana", "apple", "cherry"];
fruits.sort();
console.log(fruits); // ["apple", "banana", "cherry"]

// Numeric sort (need compare function)
const numbers = [10, 2, 30, 21, 1];
numbers.sort((a, b) => a - b); // Ascending
console.log(numbers); // [1, 2, 10, 21, 30]

numbers.sort((a, b) => b - a); // Descending
console.log(numbers); // [30, 21, 10, 2, 1]

// Sort objects by property
const users = [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 },
    { name: "Bob", age: 35 }
];

users.sort((a, b) => a.age - b.age);
\`\`\`

### reverse()
\`\`\`javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr); // [5, 4, 3, 2, 1]
\`\`\`

## Other Useful Methods

### forEach()
\`\`\`javascript
const numbers = [1, 2, 3];

numbers.forEach((num, index) => {
    console.log(\`Index \${index}: \${num}\`);
});
// forEach doesn't return anything
\`\`\`

### concat() and spread
\`\`\`javascript
const arr1 = [1, 2];
const arr2 = [3, 4];

const merged = arr1.concat(arr2);
const merged2 = [...arr1, ...arr2]; // Same result
console.log(merged); // [1, 2, 3, 4]
\`\`\`

### slice()
\`\`\`javascript
const arr = [1, 2, 3, 4, 5];

console.log(arr.slice(1, 3));  // [2, 3]
console.log(arr.slice(2));     // [3, 4, 5]
console.log(arr.slice(-2));    // [4, 5]
console.log(arr.slice());      // [1, 2, 3, 4, 5] (copy)
\`\`\``,
      contentArray: ['map, filter, reduce', 'forEach, find, findIndex', 'some, every', 'sort, reverse'],
      type: 'Code',
      duration: 40,
      points: 40,
      order: 10
    },
    {
      name: 'Objects Fundamentals',
      content: `# Objects Fundamentals

## Creating Objects
\`\`\`javascript
// Object literal (most common)
const person = {
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "john@example.com"
};

// Object constructor
const car = new Object();
car.brand = "Toyota";
car.model = "Camry";

// Object.create()
const proto = { greet() { return "Hello!"; } };
const obj = Object.create(proto);
\`\`\`

## Accessing Properties
\`\`\`javascript
const person = {
    name: "John",
    age: 30,
    "favorite-color": "blue" // Property with hyphen
};

// Dot notation
console.log(person.name); // "John"

// Bracket notation (required for special characters)
console.log(person["age"]); // 30
console.log(person["favorite-color"]); // "blue"

// Dynamic property access
const prop = "name";
console.log(person[prop]); // "John"
\`\`\`

## Modifying Objects
\`\`\`javascript
const user = {
    name: "John",
    age: 30
};

// Add property
user.email = "john@example.com";

// Modify property
user.age = 31;

// Delete property
delete user.email;

console.log(user); // { name: "John", age: 31 }
\`\`\`

## Methods
\`\`\`javascript
const person = {
    firstName: "John",
    lastName: "Doe",
    
    // Method definition
    getFullName: function() {
        return this.firstName + " " + this.lastName;
    },
    
    // Shorthand method syntax (ES6)
    greet() {
        return "Hello, I'm " + this.firstName;
    }
};

console.log(person.getFullName()); // "John Doe"
console.log(person.greet());       // "Hello, I'm John"
\`\`\`

## The 'this' Keyword
\`\`\`javascript
const person = {
    name: "John",
    greet() {
        console.log("Hello, " + this.name);
    },
    
    // Arrow function doesn't have its own 'this'
    arrowGreet: () => {
        console.log(this); // Window or undefined (not person)
    },
    
    // Nested function solution
    delayedGreet() {
        const self = this; // Save reference
        setTimeout(function() {
            console.log(self.name);
        }, 1000);
    },
    
    // Arrow function preserves 'this'
    betterDelayedGreet() {
        setTimeout(() => {
            console.log(this.name);
        }, 1000);
    }
};
\`\`\`

## Object References
\`\`\`javascript
// Objects are reference types
const obj1 = { name: "John" };
const obj2 = obj1; // Same reference!

obj2.name = "Jane";
console.log(obj1.name); // "Jane" (both changed)

// Creating a copy
const obj3 = { ...obj1 }; // Shallow copy
const obj4 = Object.assign({}, obj1); // Also shallow copy

obj3.name = "Bob";
console.log(obj1.name); // "Jane" (unchanged)
console.log(obj3.name); // "Bob"

// Deep copy (for nested objects)
const deep = {
    user: { name: "John" },
    scores: [1, 2, 3]
};
const deepCopy = JSON.parse(JSON.stringify(deep));
\`\`\`

## Shorthand Properties
\`\`\`javascript
const name = "John";
const age = 30;

// Without shorthand
const person1 = {
    name: name,
    age: age
};

// With shorthand (ES6)
const person2 = { name, age };
console.log(person2); // { name: "John", age: 30 }
\`\`\`

## Computed Property Names
\`\`\`javascript
const prop = "name";
const id = 123;

const obj = {
    [prop]: "John",
    ["user_" + id]: true,
    ["get" + prop.charAt(0).toUpperCase() + prop.slice(1)]() {
        return this.name;
    }
};

console.log(obj.name);      // "John"
console.log(obj.user_123);  // true
console.log(obj.getName()); // "John"
\`\`\``,
      contentArray: ['Object literals', 'Properties and methods', 'this keyword', 'Object references'],
      type: 'Code',
      duration: 30,
      points: 30,
      order: 11
    },
    {
      name: 'Object Destructuring',
      content: `# Object Destructuring

## Basic Destructuring
\`\`\`javascript
const person = {
    name: "John",
    age: 30,
    city: "New York"
};

// Extract properties
const { name, age, city } = person;
console.log(name); // "John"
console.log(age);  // 30
console.log(city); // "New York"

// Without destructuring
const name2 = person.name;
const age2 = person.age;
\`\`\`

## Renaming Variables
\`\`\`javascript
const user = {
    name: "John",
    email: "john@example.com"
};

// Rename during destructuring
const { name: userName, email: userEmail } = user;
console.log(userName);  // "John"
console.log(userEmail); // "john@example.com"

// Original names don't work
// console.log(name); // Error or undefined
\`\`\`

## Default Values
\`\`\`javascript
const person = {
    name: "John",
    age: 30
};

// Provide defaults for missing properties
const { name, age, country = "USA" } = person;
console.log(country); // "USA" (default)

// Default with rename
const { city: location = "Unknown" } = person;
console.log(location); // "Unknown"
\`\`\`

## Nested Destructuring
\`\`\`javascript
const user = {
    name: "John",
    address: {
        street: "123 Main St",
        city: "New York",
        coordinates: {
            lat: 40.7128,
            lng: -74.0060
        }
    }
};

// Destructure nested object
const { 
    name,
    address: { city, street }
} = user;

console.log(city);   // "New York"
console.log(street); // "123 Main St"
// console.log(address); // Error! address not defined

// Keep parent AND destructure
const {
    name: userName,
    address,
    address: { city: userCity }
} = user;

console.log(address); // { street: "123 Main St", city: "New York", ... }
console.log(userCity); // "New York"

// Deep nesting
const { address: { coordinates: { lat, lng } } } = user;
console.log(lat, lng); // 40.7128 -74.0060
\`\`\`

## Destructuring in Function Parameters
\`\`\`javascript
// Without destructuring
function displayUser(user) {
    console.log(user.name + " from " + user.city);
}

// With destructuring
function displayUserBetter({ name, city }) {
    console.log(name + " from " + city);
}

const user = { name: "John", city: "NYC", age: 30 };
displayUserBetter(user); // "John from NYC"

// With defaults and rename
function createUser({ 
    name = "Anonymous",
    age = 0,
    email: userEmail = "no-email"
} = {}) {
    return { name, age, email: userEmail };
}

console.log(createUser({ name: "John" }));
// { name: "John", age: 0, email: "no-email" }

console.log(createUser());
// { name: "Anonymous", age: 0, email: "no-email" }
\`\`\`

## Rest in Object Destructuring
\`\`\`javascript
const person = {
    name: "John",
    age: 30,
    city: "NYC",
    country: "USA",
    email: "john@example.com"
};

// Get specific props, rest goes to 'remaining'
const { name, age, ...remaining } = person;
console.log(name);      // "John"
console.log(remaining); // { city: "NYC", country: "USA", email: "john@example.com" }

// Useful for removing properties
const { email, ...withoutEmail } = person;
console.log(withoutEmail);
// { name: "John", age: 30, city: "NYC", country: "USA" }
\`\`\`

## Array Destructuring
\`\`\`javascript
const colors = ["red", "green", "blue"];

// Basic array destructuring
const [first, second, third] = colors;
console.log(first);  // "red"
console.log(second); // "green"

// Skip elements
const [, , third2] = colors;
console.log(third2); // "blue"

// With rest
const [head, ...tail] = colors;
console.log(head); // "red"
console.log(tail); // ["green", "blue"]

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1
\`\`\``,
      contentArray: ['Object destructuring', 'Nested destructuring', 'Default values', 'Renaming properties'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 12
    },
    {
      name: 'Error Handling',
      content: `# Error Handling

## try-catch Blocks
\`\`\`javascript
try {
    // Code that might throw an error
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    // Handle the error
    console.log("An error occurred:", error.message);
}

// Example with real error
try {
    JSON.parse("invalid json");
} catch (error) {
    console.log("Parse error:", error.message);
    // "Parse error: Unexpected token i in JSON at position 0"
}
\`\`\`

## finally Block
\`\`\`javascript
function fetchData() {
    let connection = null;
    try {
        connection = openConnection();
        return connection.getData();
    } catch (error) {
        console.log("Error:", error.message);
        return null;
    } finally {
        // Always runs, even after return
        if (connection) {
            connection.close();
        }
        console.log("Connection closed");
    }
}
\`\`\`

## Throwing Errors
\`\`\`javascript
function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

try {
    const result = divide(10, 0);
} catch (error) {
    console.log(error.message); // "Division by zero"
}

// Throwing different values
throw "Error string";      // Not recommended
throw 404;                 // Not recommended
throw { code: 500 };       // Not recommended
throw new Error("Better"); // Recommended
\`\`\`

## Error Types
\`\`\`javascript
// SyntaxError - parsing errors
// eval("var a = ");

// ReferenceError - undefined variable
try {
    console.log(undefinedVar);
} catch (e) {
    console.log(e.name); // "ReferenceError"
}

// TypeError - wrong type operation
try {
    null.foo();
} catch (e) {
    console.log(e.name); // "TypeError"
}

// RangeError - number out of range
try {
    const arr = new Array(-1);
} catch (e) {
    console.log(e.name); // "RangeError"
}
\`\`\`

## Custom Errors
\`\`\`javascript
// Simple custom error
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

// More detailed custom error
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}

function validateUser(user) {
    if (!user.email) {
        throw new ValidationError("Email is required");
    }
    if (!user.email.includes("@")) {
        throw new ValidationError("Invalid email format");
    }
}

try {
    validateUser({ name: "John" });
} catch (error) {
    if (error instanceof ValidationError) {
        console.log("Validation failed:", error.message);
    } else {
        throw error; // Re-throw unknown errors
    }
}
\`\`\`

## Error Properties
\`\`\`javascript
try {
    throw new Error("Something went wrong");
} catch (error) {
    console.log(error.name);    // "Error"
    console.log(error.message); // "Something went wrong"
    console.log(error.stack);   // Stack trace
}

// Augmenting errors
try {
    throw new Error("Database error");
} catch (error) {
    error.code = "DB_ERR";
    error.timestamp = new Date();
    throw error;
}
\`\`\`

## Best Practices
\`\`\`javascript
// 1. Be specific about what you catch
function processData(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("Invalid JSON");
            return null;
        }
        throw error; // Re-throw other errors
    }
}

// 2. Always handle errors
async function fetchUser(id) {
    try {
        const response = await fetch(\`/api/users/\${id}\`);
        if (!response.ok) {
            throw new HttpError(response.status, "Failed to fetch user");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

// 3. Clean up resources in finally
function readFile(path) {
    let file;
    try {
        file = openFile(path);
        return file.read();
    } finally {
        if (file) file.close();
    }
}
\`\`\``,
      contentArray: ['try-catch blocks', 'throw statements', 'Error types', 'Best practices'],
      type: 'Code',
      duration: 25,
      points: 25,
      order: 13
    },
    {
      name: 'Asynchronous JavaScript: Callbacks',
      content: `# Asynchronous JavaScript: Callbacks

## Understanding Asynchronous Code
\`\`\`javascript
console.log("1. Start");

// This is asynchronous
setTimeout(() => {
    console.log("3. Timeout completed");
}, 1000);

console.log("2. End");

// Output order:
// 1. Start
// 2. End
// 3. Timeout completed (after 1 second)
\`\`\`

## Callback Functions
\`\`\`javascript
// A callback is a function passed to another function
function greet(name, callback) {
    console.log("Hello, " + name);
    callback();
}

greet("John", function() {
    console.log("Greeting complete!");
});

// With parameters
function fetchData(callback) {
    setTimeout(() => {
        const data = { user: "John", age: 30 };
        callback(data);
    }, 1000);
}

fetchData(function(data) {
    console.log("Received:", data);
});
\`\`\`

## Timer Functions
\`\`\`javascript
// setTimeout - runs once after delay
const timeoutId = setTimeout(() => {
    console.log("Runs after 2 seconds");
}, 2000);

// Cancel timeout
clearTimeout(timeoutId);

// setInterval - runs repeatedly
let count = 0;
const intervalId = setInterval(() => {
    count++;
    console.log("Count:", count);
    
    if (count >= 5) {
        clearInterval(intervalId);
        console.log("Stopped!");
    }
}, 1000);
\`\`\`

## The Event Loop
\`\`\`javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Output: 1, 4, 3, 2
// Explanation:
// - Synchronous code runs first (1, 4)
// - Microtasks (Promises) run next (3)
// - Macrotasks (setTimeout) run last (2)
\`\`\`

## Error-First Callbacks
\`\`\`javascript
// Node.js convention
function readFile(path, callback) {
    setTimeout(() => {
        if (path === "invalid") {
            callback(new Error("File not found"), null);
        } else {
            callback(null, "File contents here");
        }
    }, 1000);
}

readFile("myfile.txt", (error, data) => {
    if (error) {
        console.error("Error:", error.message);
        return;
    }
    console.log("Data:", data);
});
\`\`\`

## Callback Hell
\`\`\`javascript
// The problem - nested callbacks
getUser(userId, (user) => {
    getOrders(user.id, (orders) => {
        getOrderDetails(orders[0].id, (details) => {
            getProductInfo(details.productId, (product) => {
                console.log(product);
                // This is getting hard to read!
            });
        });
    });
});

// Solution 1: Named functions
function handleUser(user) {
    getOrders(user.id, handleOrders);
}

function handleOrders(orders) {
    getOrderDetails(orders[0].id, handleDetails);
}

function handleDetails(details) {
    getProductInfo(details.productId, handleProduct);
}

function handleProduct(product) {
    console.log(product);
}

getUser(userId, handleUser);
\`\`\`

## Real-World Callback Example
\`\`\`javascript
// Simulating an API call
function fetchUser(userId, onSuccess, onError) {
    console.log("Fetching user...");
    
    setTimeout(() => {
        if (userId < 0) {
            onError(new Error("Invalid user ID"));
            return;
        }
        
        const user = {
            id: userId,
            name: "John Doe",
            email: "john@example.com"
        };
        
        onSuccess(user);
    }, 1500);
}

fetchUser(
    1,
    (user) => {
        console.log("User loaded:", user);
    },
    (error) => {
        console.error("Failed to load user:", error.message);
    }
);
\`\`\``,
      contentArray: ['Callback functions', 'Callback hell', 'Event loop', 'setTimeout and setInterval'],
      type: 'Code',
      duration: 30,
      points: 30,
      order: 14
    },
    {
      name: 'Promises Basics',
      content: `# Promises Basics

## What is a Promise?
\`\`\`javascript
// A Promise represents a value that may be available now, later, or never
const promise = new Promise((resolve, reject) => {
    // Async operation
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve("Operation completed!");
        } else {
            reject(new Error("Operation failed"));
        }
    }, 1000);
});
\`\`\`

## Promise States
\`\`\`javascript
// Pending - initial state
const pending = new Promise(() => {}); // Never resolves

// Fulfilled - operation completed successfully
const fulfilled = Promise.resolve("Success");

// Rejected - operation failed
const rejected = Promise.reject(new Error("Failed"));

// Once settled, a promise cannot change state
\`\`\`

## .then() and .catch()
\`\`\`javascript
const promise = new Promise((resolve) => {
    setTimeout(() => resolve("Data loaded"), 1000);
});

// Handle success
promise.then((result) => {
    console.log(result); // "Data loaded"
});

// Handle errors
const failingPromise = new Promise((resolve, reject) => {
    reject(new Error("Something went wrong"));
});

failingPromise.catch((error) => {
    console.log(error.message); // "Something went wrong"
});

// Both together
fetchData()
    .then((data) => {
        console.log("Success:", data);
    })
    .catch((error) => {
        console.log("Error:", error.message);
    });
\`\`\`

## Promise Chaining
\`\`\`javascript
// Each .then() returns a new promise
fetchUser(1)
    .then((user) => {
        console.log("User:", user.name);
        return fetchOrders(user.id);
    })
    .then((orders) => {
        console.log("Orders:", orders.length);
        return fetchOrderDetails(orders[0].id);
    })
    .then((details) => {
        console.log("Details:", details);
    })
    .catch((error) => {
        // Catches errors from any step
        console.error("Error:", error.message);
    });

// Returning values in chain
Promise.resolve(1)
    .then(x => x + 1)  // 2
    .then(x => x * 2)  // 4
    .then(x => x + 3)  // 7
    .then(console.log); // 7
\`\`\`

## Promise.all()
\`\`\`javascript
// Wait for all promises to complete
const promise1 = fetch("/api/users");
const promise2 = fetch("/api/posts");
const promise3 = fetch("/api/comments");

Promise.all([promise1, promise2, promise3])
    .then(([users, posts, comments]) => {
        console.log("All loaded!");
        console.log("Users:", users);
        console.log("Posts:", posts);
        console.log("Comments:", comments);
    })
    .catch((error) => {
        // If ANY promise fails, entire Promise.all fails
        console.error("One request failed:", error);
    });
\`\`\`

## Promise.race()
\`\`\`javascript
// Returns first promise to settle
const slow = new Promise(resolve => setTimeout(() => resolve("Slow"), 2000));
const fast = new Promise(resolve => setTimeout(() => resolve("Fast"), 500));

Promise.race([slow, fast])
    .then(winner => console.log(winner)); // "Fast"

// Useful for timeouts
function fetchWithTimeout(url, timeout = 5000) {
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), timeout);
    });
    
    return Promise.race([fetchPromise, timeoutPromise]);
}
\`\`\`

## Promise.allSettled()
\`\`\`javascript
// Wait for all promises, regardless of success/failure
const promises = [
    Promise.resolve("Success 1"),
    Promise.reject(new Error("Error")),
    Promise.resolve("Success 2")
];

Promise.allSettled(promises)
    .then((results) => {
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                console.log("Value:", result.value);
            } else {
                console.log("Reason:", result.reason);
            }
        });
    });
\`\`\`

## Converting Callbacks to Promises
\`\`\`javascript
// Old callback-based function
function oldFetch(url, callback) {
    setTimeout(() => callback(null, "data"), 1000);
}

// Promisified version
function promisifiedFetch(url) {
    return new Promise((resolve, reject) => {
        oldFetch(url, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
}

// Now you can use async/await!
async function getData() {
    const data = await promisifiedFetch("/api/data");
    return data;
}
\`\`\``,
      contentArray: ['Creating promises', 'then and catch', 'Promise chaining', 'Promise.all'],
      type: 'Code',
      duration: 35,
      points: 35,
      order: 15
    }
  ],

  // Additional modules content will be added here...
};

// Export a function to get lessons for a specific module
export function getLessonsForModule(moduleName: string): LessonContent[] {
  return fullCourseContent[moduleName] || [];
}

// Export module names that have content
export function getModulesWithContent(): string[] {
  return Object.keys(fullCourseContent);
}

