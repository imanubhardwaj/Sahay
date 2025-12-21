import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import Skill from "@/models/Skill";
import ModuleProgress from "@/models/ModuleProgress";

export async function POST() {
  try {
    await connectDB();
    console.log("🌱 Starting JavaScript module seeding...");

    // Delete all existing modules and related data
    console.log("🗑️  Removing all existing modules...");
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    // Also clean up orphaned progress records
    await ModuleProgress.deleteMany({});
    console.log("✅ Cleared all existing modules and progress records");

    // Find or create JavaScript skill
    let jsSkill = await Skill.findOne({ name: "JavaScript" });
    if (!jsSkill) {
      jsSkill = await Skill.create({
        name: "JavaScript",
        description:
          "JavaScript is a high-level, interpreted programming language used to create dynamic and interactive web pages",
      });
      console.log("✅ Created JavaScript skill");
    } else {
      console.log("✅ Found existing JavaScript skill");
    }

    // Create JavaScript Beginner module
    const jsModule = await Module.create({
      name: "JavaScript Beginner",
      description:
        "Learn JavaScript from scratch. Master the fundamentals including variables, data types, operators, conditionals, loops, functions, arrays, objects, DOM manipulation, and more.",
      level: "Beginner",
      skillId: jsSkill._id,
      duration: 1020, // ~17 hours (17 lessons * 60 min avg)
      points: 1700, // 100 points per lesson average
      lessonsCount: 17,
      icon: "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
    });
    console.log("✅ Created JavaScript Beginner module");

    // Define all 17 lessons with complete content
    const lessonsData = [
      {
        name: "Lesson 1: Introduction to JavaScript",
        content: `# Introduction to JavaScript

## What is JavaScript?

JavaScript is a high-level, interpreted programming language used to create dynamic and interactive web pages.

It is one of the core technologies of the web:

- **HTML** → Structure
- **CSS** → Presentation  
- **JavaScript** → Behavior

JavaScript runs in every modern browser and on servers using Node.js.

## Where JavaScript Runs

### Browser (Client-Side JS)
- Chrome (V8 Engine)
- Firefox (SpiderMonkey)
- Safari (JavaScriptCore)

### Server (Node.js)
JavaScript can handle backend logic, API routes, files, databases.

## Adding JavaScript to HTML

### 1. Internal Script
\`\`\`html
<script>
  console.log("Hello JavaScript");
</script>
\`\`\`

### 2. External Script
\`\`\`html
<script src="app.js"></script>
\`\`\`

### 3. Inline Script
\`\`\`html
<button onclick="alert('Clicked')">Click</button>
\`\`\`

## Comments

\`\`\`javascript
// Single line comment

/*
Multi-line comment
*/
\`\`\`

## Statements & Semicolons

JavaScript statements are usually separated by semicolons but optional due to Automatic Semicolon Insertion (ASI).

## Mini Exercise

Open browser console → type:

\`\`\`javascript
console.log("JS is working!");
\`\`\`

This will display "JS is working!" in the console.`,
        contentArray: [
          "JavaScript is a high-level, interpreted programming language",
          "Core technology of the web alongside HTML and CSS",
          "Runs in browsers and on servers (Node.js)",
          "Can be added via internal, external, or inline scripts",
          "Uses // for single-line and /* */ for multi-line comments",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 1,
      },
      {
        name: "Lesson 2: Variables",
        content: `# Variables

## What Are Variables?

Variables store data values that can be used throughout your program.

## Keywords

| Keyword | Scope | Reassign | Hoisted | Notes |
|---------|-------|----------|---------|-------|
| \`var\` | Function | Yes | Yes | Avoid in modern JS |
| \`let\` | Block | Yes | No | Best for changing data |
| \`const\` | Block | No | No | Best for constants |

## Examples

\`\`\`javascript
var x = 10;
let name = "John";
const PI = 3.14;
\`\`\`

## Rules for Naming Variables

- Must start with letter, \`_\`, or \`$\`
- Cannot start with number
- Cannot use reserved keywords (if, else, function, etc.)
- Case-sensitive (myVar ≠ myvar)

## Dynamic Typing

JavaScript variables can change type at runtime:

\`\`\`javascript
let x = 10;      // number
x = "Hello";     // now string - Valid!
x = true;        // now boolean - Valid!
\`\`\`

## Best Practices

- Use \`const\` by default
- Use \`let\` when you need to reassign
- Avoid \`var\` in modern JavaScript
- Use descriptive names: \`userName\` not \`u\`

## Mini Exercise

Declare:
- Your name (use const)
- Your age (use let)
- A constant for country`,
        contentArray: [
          "Variables store data values",
          "var: function scoped, avoid in modern JS",
          "let: block scoped, can be reassigned",
          "const: block scoped, cannot be reassigned",
          "JavaScript is dynamically typed",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 2,
      },
      {
        name: "Lesson 3: Data Types",
        content: `# Data Types

JavaScript supports two categories of data types:

## 1. Primitive Data Types

Primitive values are immutable and stored directly in memory.

- **String** – \`"Hello"\`, \`'World'\`
- **Number** – integers or floats: \`10\`, \`20.5\`
- **Boolean** – \`true\`, \`false\`
- **Undefined** – variable declared but not assigned
- **Null** – intentional empty value
- **BigInt** – very large integers: \`10n\`
- **Symbol** – unique identifiers

## Examples

\`\`\`javascript
let name = "John";      // string
let age = 20;           // number
let married = false;    // boolean
let x;                  // undefined
let y = null;           // null
let bigNum = 9007199254740991n; // BigInt
let sym = Symbol("id"); // Symbol
\`\`\`

## 2. Reference Types

Stored as memory references:

- **Objects** – \`{ name: "John", age: 20 }\`
- **Arrays** – \`[1, 2, 3]\`
- **Functions** – \`function greet() { ... }\`

\`\`\`javascript
let person = { name: "John", age: 20 };
let arr = [1, 2, 3];
function greet() { console.log("Hi"); }
\`\`\`

## typeof Operator

\`\`\`javascript
typeof "Hi"        // "string"
typeof 10          // "number"
typeof null        // "object" (JS bug!)
typeof []          // "object"
typeof function(){} // "function"
typeof undefined   // "undefined"
\`\`\`

## Type Conversion

### Implicit Conversion
\`\`\`javascript
"5" + 2  // "52" (string concatenation)
"5" * 2  // 10 (number multiplication)
\`\`\`

### Explicit Conversion
\`\`\`javascript
Number("10")     // 10
String(20)       // "20"
Boolean(1)       // true
Boolean(0)       // false
Boolean("")      // false
\`\`\`

## Mini Exercise

Write and log all primitive data types.`,
        contentArray: [
          "Primitive types: string, number, boolean, undefined, null, BigInt, Symbol",
          "Reference types: objects, arrays, functions",
          "typeof operator checks data type",
          "Type conversion can be implicit or explicit",
          "null has typeof 'object' (JavaScript bug)",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 3,
      },
      {
        name: "Lesson 4: Operators",
        content: `# Operators

Operators perform operations on values and variables.

## Types of Operators

### 1. Arithmetic Operators

\`\`\`javascript
let result = 10 + 5;   // Addition: 15
result = 10 - 5;       // Subtraction: 5
result = 10 * 5;       // Multiplication: 50
result = 10 / 5;       // Division: 2
result = 10 % 3;       // Modulus: 1
result = 2 ** 3;       // Exponentiation: 8
\`\`\`

### 2. Assignment Operators

\`\`\`javascript
let x = 10;
x += 5;  // x = x + 5 → 15
x -= 3;  // x = x - 3 → 12
x *= 2;  // x = x * 2 → 24
x /= 4;  // x = x / 4 → 6
\`\`\`

### 3. Comparison Operators

\`\`\`javascript
5 == "5"   // true (loose equality)
5 === "5"  // false (strict equality)
5 != "5"   // false
5 !== "5"  // true
5 > 3      // true
5 < 3      // false
5 >= 5     // true
5 <= 4     // false
\`\`\`

**Always use \`===\` and \`!==\` for strict comparison!**

### 4. Logical Operators

\`\`\`javascript
true && true   // true (AND)
true && false  // false
true || false  // true (OR)
false || false // false
!true          // false (NOT)
!false         // true
\`\`\`

### 5. Ternary Operator

\`\`\`javascript
let msg = age > 18 ? "Adult" : "Minor";
\`\`\`

## Operator Precedence

1. Parentheses: \`()\`
2. Exponentiation: \`**\`
3. Multiplication/Division: \`*\`, \`/\`, \`%\`
4. Addition/Subtraction: \`+\`, \`-\`
5. Comparison: \`>\`, \`<\`, \`>=\`, \`<=\`
6. Equality: \`==\`, \`===\`, \`!=\`, \`!==\`
7. Logical AND: \`&&\`
8. Logical OR: \`||\`

## Mini Exercise

Write expressions using \`&&\` and \`||\` operators.`,
        contentArray: [
          "Arithmetic: +, -, *, /, %, **",
          "Assignment: =, +=, -=, *=, /=",
          "Comparison: ==, ===, !=, !==, >, <, >=, <=",
          "Logical: &&, ||, !",
          "Ternary: condition ? value1 : value2",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 4,
      },
      {
        name: "Lesson 5: Conditionals",
        content: `# Conditionals

Used for decision making in your code.

## if / else

\`\`\`javascript
if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
\`\`\`

## else if

\`\`\`javascript
if (score > 90) {
  console.log("Grade A");
} else if (score > 80) {
  console.log("Grade B");
} else if (score > 70) {
  console.log("Grade C");
} else {
  console.log("Grade D");
}
\`\`\`

## switch Statement

\`\`\`javascript
switch (day) {
  case 1:
    console.log("Monday");
    break;
  case 2:
    console.log("Tuesday");
    break;
  default:
    console.log("Other day");
}
\`\`\`

**Don't forget \`break\` statements!**

## Truthy & Falsy Values

### Falsy Values
- \`0\`
- \`""\` (empty string)
- \`null\`
- \`undefined\`
- \`NaN\`
- \`false\`

### Truthy Values
Everything else is truthy, including:
- \`"0"\` (string)
- \`[]\` (empty array)
- \`{}\` (empty object)
- \`"false"\` (string)

## Examples

\`\`\`javascript
if (0) {
  // Won't execute (falsy)
}

if ("hello") {
  // Will execute (truthy)
}

if (user && user.name) {
  // Safe property access
  console.log(user.name);
}
\`\`\`

## Mini Exercise

Build a grade calculator using if/else statements.`,
        contentArray: [
          "if/else for decision making",
          "else if for multiple conditions",
          "switch for multiple cases",
          "Truthy values execute, falsy values don't",
          "Common falsy: 0, '', null, undefined, NaN, false",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 5,
      },
      {
        name: "Lesson 6: Loops",
        content: `# Loops

Used for repetition and iteration.

## for Loop

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

## while Loop

\`\`\`javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
\`\`\`

## do...while Loop

\`\`\`javascript
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);
\`\`\`

**Executes at least once!**

## for...of Loop (Arrays)

\`\`\`javascript
let fruits = ["apple", "banana", "orange"];
for (let fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## for...in Loop (Objects)

\`\`\`javascript
let person = { name: "John", age: 30 };
for (let key in person) {
  console.log(key + ": " + person[key]);
}
\`\`\`

## Loop Control

### break
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) break; // Exit loop
  console.log(i);
}
\`\`\`

### continue
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue; // Skip even numbers
  console.log(i); // Only odd numbers
}
\`\`\`

## Nested Loops

\`\`\`javascript
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    console.log(\`\${i}, \${j}\`);
  }
}
\`\`\`

## Mini Exercise

Print numbers 1–10 using different loop types.`,
        contentArray: [
          "for: fixed iterations",
          "while: condition-based",
          "do...while: executes at least once",
          "for...of: iterate arrays",
          "for...in: iterate object properties",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 6,
      },
      {
        name: "Lesson 7: Functions",
        content: `# Functions

Functions are reusable blocks of code that perform specific tasks.

## Function Declaration

\`\`\`javascript
function greet() {
  console.log("Hello");
}
greet(); // Call the function
\`\`\`

## Function Expression

\`\`\`javascript
let sum = function(a, b) {
  return a + b;
};
console.log(sum(5, 3)); // 8
\`\`\`

## Arrow Function

\`\`\`javascript
let multiply = (a, b) => a * b;
console.log(multiply(4, 5)); // 20

// With multiple statements
let greet = (name) => {
  let message = "Hello, " + name;
  return message;
};
\`\`\`

## Parameters & Defaults

\`\`\`javascript
function hello(name = "User") {
  console.log("Hello, " + name);
}
hello();        // "Hello, User"
hello("John");  // "Hello, John"
\`\`\`

## Return Statement

\`\`\`javascript
function add(a, b) {
  return a + b;
}
let result = add(10, 20); // 30
\`\`\`

## Scope

### Global Scope
\`\`\`javascript
let globalVar = "I'm global";

function test() {
  console.log(globalVar); // Accessible
}
\`\`\`

### Function Scope
\`\`\`javascript
function test() {
  let localVar = "I'm local";
  console.log(localVar); // Accessible
}
console.log(localVar); // Error!
\`\`\`

### Block Scope
\`\`\`javascript
if (true) {
  let blockVar = "I'm in block";
}
console.log(blockVar); // Error!
\`\`\`

## Mini Exercise

Create functions using all three methods.`,
        contentArray: [
          "Function declaration: function keyword",
          "Function expression: assigned to variable",
          "Arrow function: => syntax",
          "Parameters can have default values",
          "Scope: global, function, block",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 7,
      },
      {
        name: "Lesson 8: Strings",
        content: `# Strings

Strings are sequences of characters used to represent text.

## Creating Strings

\`\`\`javascript
let str1 = "Double quotes";
let str2 = 'Single quotes';
let str3 = \`Template literal\`;
\`\`\`

## Common Methods

### Length
\`\`\`javascript
let name = "John";
console.log(name.length); // 4
\`\`\`

### toUpperCase() / toLowerCase()
\`\`\`javascript
let text = "Hello";
console.log(text.toUpperCase()); // "HELLO"
console.log(text.toLowerCase()); // "hello"
\`\`\`

### includes()
\`\`\`javascript
let text = "Hello World";
console.log(text.includes("World")); // true
\`\`\`

### slice()
\`\`\`javascript
let text = "Hello World";
console.log(text.slice(0, 5)); // "Hello"
console.log(text.slice(6));    // "World"
\`\`\`

### replace()
\`\`\`javascript
let text = "Hello World";
console.log(text.replace("World", "JavaScript")); // "Hello JavaScript"
\`\`\`

### indexOf()
\`\`\`javascript
let text = "Hello World";
console.log(text.indexOf("World")); // 6
\`\`\`

### split()
\`\`\`javascript
let text = "apple,banana,orange";
let fruits = text.split(",");
console.log(fruits); // ["apple", "banana", "orange"]
\`\`\`

## Template Literals

\`\`\`javascript
let name = "John";
let age = 30;
let message = \`Hello, my name is \${name} and I'm \${age} years old\`;
console.log(message);
\`\`\`

## String Concatenation

\`\`\`javascript
let firstName = "John";
let lastName = "Doe";
let fullName = firstName + " " + lastName; // "John Doe"
\`\`\`

## Mini Exercise

Create a function that formats a name using template literals.`,
        contentArray: [
          "Strings can use '', \"\", or ``",
          "Common methods: length, toUpperCase, includes, slice, replace",
          "Template literals use ${} for interpolation",
          "Strings are immutable (methods return new strings)",
          "split() converts string to array",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 8,
      },
      {
        name: "Lesson 9: Arrays",
        content: `# Arrays

Arrays are ordered collections of values.

## Creating Arrays

\`\`\`javascript
let arr = [10, 20, 30];
let fruits = ["apple", "banana", "orange"];
let mixed = [1, "hello", true, null];
\`\`\`

## Accessing Elements

\`\`\`javascript
let arr = [10, 20, 30];
console.log(arr[0]); // 10 (first element)
console.log(arr[1]); // 20
console.log(arr.length); // 3
\`\`\`

## Common Methods

### push() - Add to end
\`\`\`javascript
let arr = [1, 2];
arr.push(3);
console.log(arr); // [1, 2, 3]
\`\`\`

### pop() - Remove from end
\`\`\`javascript
let arr = [1, 2, 3];
arr.pop();
console.log(arr); // [1, 2]
\`\`\`

### shift() - Remove from beginning
\`\`\`javascript
let arr = [1, 2, 3];
arr.shift();
console.log(arr); // [2, 3]
\`\`\`

### unshift() - Add to beginning
\`\`\`javascript
let arr = [2, 3];
arr.unshift(1);
console.log(arr); // [1, 2, 3]
\`\`\`

### indexOf() - Find index
\`\`\`javascript
let arr = ["apple", "banana", "orange"];
console.log(arr.indexOf("banana")); // 1
\`\`\`

### includes() - Check existence
\`\`\`javascript
let arr = [1, 2, 3];
console.log(arr.includes(2)); // true
\`\`\`

### slice() - Extract portion
\`\`\`javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.slice(1, 3)); // [2, 3]
\`\`\`

### splice() - Add/Remove elements
\`\`\`javascript
let arr = [1, 2, 3, 4, 5];
arr.splice(2, 1, 99); // Remove 1 element at index 2, add 99
console.log(arr); // [1, 2, 99, 4, 5]
\`\`\`

## Iterating Arrays

\`\`\`javascript
let arr = [1, 2, 3];

// for loop
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// for...of
for (let item of arr) {
  console.log(item);
}

// forEach
arr.forEach((item) => {
  console.log(item);
});
\`\`\`

## Mini Exercise

Create an array and practice all methods.`,
        contentArray: [
          "Arrays store ordered collections",
          "Access with index: arr[0]",
          "push/pop: end of array",
          "shift/unshift: beginning of array",
          "slice: extract, splice: modify",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 9,
      },
      {
        name: "Lesson 10: Objects",
        content: `# Objects

Objects store collections of key-value pairs.

## Creating Objects

\`\`\`javascript
let student = {
  name: "John",
  age: 20,
  marks: 90
};
\`\`\`

## Accessing Properties

\`\`\`javascript
// Dot notation
console.log(student.name); // "John"

// Bracket notation
console.log(student["age"]); // 20

// Dynamic key
let key = "marks";
console.log(student[key]); // 90
\`\`\`

## Adding Properties

\`\`\`javascript
student.city = "Delhi";
student["country"] = "India";
\`\`\`

## Removing Properties

\`\`\`javascript
delete student.age;
\`\`\`

## Nested Objects

\`\`\`javascript
let person = {
  name: "John",
  address: {
    city: "Delhi",
    country: "India"
  }
};
console.log(person.address.city); // "Delhi"
\`\`\`

## Object Methods

\`\`\`javascript
let person = {
  name: "John",
  age: 30,
  greet: function() {
    return "Hello, I'm " + this.name;
  }
};
console.log(person.greet()); // "Hello, I'm John"
\`\`\`

## Object.keys() / Object.values()

\`\`\`javascript
let obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj));   // ["a", "b", "c"]
console.log(Object.values(obj)); // [1, 2, 3]
\`\`\`

## Iterating Objects

\`\`\`javascript
let obj = { name: "John", age: 30 };

// for...in loop
for (let key in obj) {
  console.log(key + ": " + obj[key]);
}
\`\`\`

## Mini Exercise

Create an object representing a book with properties and methods.`,
        contentArray: [
          "Objects store key-value pairs",
          "Access: obj.key or obj['key']",
          "Add: obj.newKey = value",
          "Remove: delete obj.key",
          "Objects can contain nested objects and methods",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 10,
      },
      {
        name: "Lesson 11: Math & Date",
        content: `# Math & Date

Built-in objects for mathematical operations and date handling.

## Math Methods

### Math.round()
\`\`\`javascript
Math.round(4.7);  // 5
Math.round(4.4);  // 4
\`\`\`

### Math.ceil()
\`\`\`javascript
Math.ceil(4.2);   // 5 (rounds up)
\`\`\`

### Math.floor()
\`\`\`javascript
Math.floor(4.9);  // 4 (rounds down)
\`\`\`

### Math.random()
\`\`\`javascript
Math.random();              // 0 to 1 (exclusive)
Math.random() * 10;         // 0 to 10
Math.floor(Math.random() * 10); // 0 to 9 (integer)
\`\`\`

### Math.max() / Math.min()
\`\`\`javascript
Math.max(10, 20, 30); // 30
Math.min(10, 20, 30); // 10
\`\`\`

### Math.abs()
\`\`\`javascript
Math.abs(-5); // 5
\`\`\`

## Date Object

### Creating Dates
\`\`\`javascript
let now = new Date();
let specific = new Date(2024, 0, 15); // Jan 15, 2024
let fromString = new Date("2024-01-15");
\`\`\`

### Date Methods
\`\`\`javascript
let d = new Date();
d.getFullYear();  // 2024
d.getMonth();     // 0-11 (0 = January)
d.getDate();      // 1-31
d.getDay();       // 0-6 (0 = Sunday)
d.getHours();     // 0-23
d.getMinutes();   // 0-59
d.getSeconds();   // 0-59
\`\`\`

### Formatting Dates
\`\`\`javascript
let d = new Date();
d.toDateString();     // "Mon Jan 15 2024"
d.toISOString();      // "2024-01-15T10:30:00.000Z"
d.toLocaleDateString(); // "1/15/2024"
\`\`\`

## Mini Exercise

Create a function that generates a random number between 1 and 100.`,
        contentArray: [
          "Math: round, ceil, floor, random, max, min, abs",
          "Date: new Date() creates date object",
          "getFullYear, getMonth, getDate, getHours, etc.",
          "toDateString, toISOString for formatting",
          "Math.random() returns 0 to 1 (exclusive)",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 11,
      },
      {
        name: "Lesson 12: DOM Basics",
        content: `# DOM Basics

DOM = Document Object Model. It represents the HTML document as a tree of nodes.

## Selecting Elements

### getElementById()
\`\`\`javascript
let element = document.getElementById("myId");
\`\`\`

### querySelector()
\`\`\`javascript
let element = document.querySelector("#myId");      // ID
let element = document.querySelector(".myClass");   // Class
let element = document.querySelector("p");          // Tag
\`\`\`

### querySelectorAll()
\`\`\`javascript
let elements = document.querySelectorAll(".myClass"); // Returns NodeList
\`\`\`

## Modifying Content

### textContent
\`\`\`javascript
element.textContent = "New text";
\`\`\`

### innerHTML
\`\`\`javascript
element.innerHTML = "<strong>Bold text</strong>";
\`\`\`

**Warning: innerHTML can be unsafe!**

### Modifying Styles
\`\`\`javascript
element.style.color = "red";
element.style.backgroundColor = "blue";
element.style.fontSize = "20px";
\`\`\`

### Adding/Removing Classes
\`\`\`javascript
element.classList.add("new-class");
element.classList.remove("old-class");
element.classList.toggle("active");
\`\`\`

## Creating Elements

\`\`\`javascript
let newDiv = document.createElement("div");
newDiv.textContent = "Hello";
document.body.appendChild(newDiv);
\`\`\`

## Mini Exercise

Select an element and change its text and color.`,
        contentArray: [
          "DOM represents HTML as tree structure",
          "getElementById: select by ID",
          "querySelector: select first matching element",
          "querySelectorAll: select all matching elements",
          "Modify: textContent, innerHTML, style, classList",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 12,
      },
      {
        name: "Lesson 13: Events",
        content: `# Events

Events are actions that happen in the browser (clicks, keypresses, etc.).

## addEventListener()

\`\`\`javascript
button.addEventListener("click", function() {
  alert("Clicked!");
});
\`\`\`

## Common Events

### click
\`\`\`javascript
button.addEventListener("click", function() {
  console.log("Button clicked");
});
\`\`\`

### input
\`\`\`javascript
input.addEventListener("input", function(e) {
  console.log("Input value:", e.target.value);
});
\`\`\`

### keydown / keyup
\`\`\`javascript
document.addEventListener("keydown", function(e) {
  console.log("Key pressed:", e.key);
});
\`\`\`

### mouseover / mouseout
\`\`\`javascript
element.addEventListener("mouseover", function() {
  element.style.backgroundColor = "yellow";
});
\`\`\`

### submit
\`\`\`javascript
form.addEventListener("submit", function(e) {
  e.preventDefault(); // Prevent form submission
  console.log("Form submitted");
});
\`\`\`

## Event Object

\`\`\`javascript
button.addEventListener("click", function(event) {
  console.log(event.type);      // "click"
  console.log(event.target);   // Element that triggered event
  console.log(event.clientX);  // Mouse X position
  console.log(event.clientY);  // Mouse Y position
});
\`\`\`

## Event Propagation

Events bubble up from child to parent elements.

\`\`\`javascript
// Stop propagation
button.addEventListener("click", function(e) {
  e.stopPropagation();
});
\`\`\`

## Mini Exercise

Create a button that changes color when clicked.`,
        contentArray: [
          "addEventListener: attach event handlers",
          "Common events: click, input, keydown, submit",
          "Event object contains event information",
          "e.preventDefault() stops default behavior",
          "Events bubble up the DOM tree",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 13,
      },
      {
        name: "Lesson 14: Forms",
        content: `# Forms

Working with HTML forms and form validation.

## Getting Input Value

\`\`\`javascript
let nameInput = document.querySelector("#name");
let name = nameInput.value;
console.log(name);
\`\`\`

## Form Elements

\`\`\`javascript
let form = document.querySelector("form");
let nameInput = form.querySelector("#name");
let emailInput = form.querySelector("#email");
let checkbox = form.querySelector("#agree");
\`\`\`

## Basic Validation

\`\`\`javascript
form.addEventListener("submit", function(e) {
  e.preventDefault();
  
  let name = nameInput.value.trim();
  
  if (name === "") {
    alert("Name is required");
    return;
  }
  
  if (name.length < 3) {
    alert("Name must be at least 3 characters");
    return;
  }
  
  // Form is valid, submit it
  console.log("Form submitted:", name);
});
\`\`\`

## Checkbox & Radio Buttons

\`\`\`javascript
let checkbox = document.querySelector("#agree");
if (checkbox.checked) {
  console.log("Checkbox is checked");
}

let radio = document.querySelector('input[name="gender"]:checked');
if (radio) {
  console.log("Selected:", radio.value);
}
\`\`\`

## Select Dropdown

\`\`\`javascript
let select = document.querySelector("#country");
let selectedValue = select.value;
let selectedText = select.options[select.selectedIndex].text;
\`\`\`

## Mini Exercise

Create a form with validation.`,
        contentArray: [
          "Get input value: element.value",
          "Form validation checks user input",
          "trim() removes whitespace",
          "Checkbox: element.checked",
          "Select: element.value for selected option",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 14,
      },
      {
        name: "Lesson 15: JSON",
        content: `# JSON

JSON (JavaScript Object Notation) is a lightweight data format.

## JSON.stringify()

Converts JavaScript object to JSON string.

\`\`\`javascript
let person = {
  name: "John",
  age: 30,
  city: "Delhi"
};

let jsonString = JSON.stringify(person);
console.log(jsonString);
// '{"name":"John","age":30,"city":"Delhi"}'
\`\`\`

## JSON.parse()

Converts JSON string to JavaScript object.

\`\`\`javascript
let jsonString = '{"name":"John","age":30}';
let person = JSON.parse(jsonString);
console.log(person.name); // "John"
\`\`\`

## Common Use Cases

### Storing in localStorage
\`\`\`javascript
let data = { name: "John", age: 30 };
localStorage.setItem("user", JSON.stringify(data));

// Retrieve
let stored = JSON.parse(localStorage.getItem("user"));
\`\`\`

### API Data Exchange
\`\`\`javascript
// Sending data to server
fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John" })
});

// Receiving data from server
fetch("/api/users")
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

## Mini Exercise

Create an object, convert to JSON, then parse it back.`,
        contentArray: [
          "JSON: JavaScript Object Notation",
          "JSON.stringify(): object to string",
          "JSON.parse(): string to object",
          "Used for data storage (localStorage)",
          "Used for API data exchange",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 15,
      },
      {
        name: "Lesson 16: Error Handling",
        content: `# Error Handling

Handling errors gracefully prevents your program from crashing.

## try...catch

\`\`\`javascript
try {
  // Code that might throw an error
  let result = 10 / 0;
  console.log(result);
} catch (error) {
  // Handle the error
  console.log("An error occurred:", error.message);
}
\`\`\`

## finally Block

\`\`\`javascript
try {
  // Code
} catch (error) {
  // Handle error
} finally {
  // Always runs
  console.log("Cleanup code");
}
\`\`\`

## Common Errors

### TypeError
\`\`\`javascript
try {
  let x = null;
  x.property; // TypeError
} catch (error) {
  console.log("TypeError:", error.message);
}
\`\`\`

### ReferenceError
\`\`\`javascript
try {
  console.log(undefinedVar); // ReferenceError
} catch (error) {
  console.log("ReferenceError:", error.message);
}
\`\`\`

### SyntaxError
\`\`\`javascript
try {
  eval("let x = ;"); // SyntaxError
} catch (error) {
  console.log("SyntaxError:", error.message);
}
\`\`\`

## Throwing Errors

\`\`\`javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.log(error.message); // "Cannot divide by zero"
}
\`\`\`

## Mini Exercise

Create a function with error handling.`,
        contentArray: [
          "try...catch: handle errors gracefully",
          "finally: always executes",
          "Common errors: TypeError, ReferenceError, SyntaxError",
          "throw: create custom errors",
          "Error handling prevents crashes",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 16,
      },
      {
        name: "Lesson 17: Debugging",
        content: `# Debugging

Debugging is finding and fixing errors in your code.

## console.log()

\`\`\`javascript
let x = 10;
console.log("Value of x:", x);
\`\`\`

## Other Console Methods

### console.error()
\`\`\`javascript
console.error("This is an error message");
\`\`\`

### console.warn()
\`\`\`javascript
console.warn("This is a warning");
\`\`\`

### console.table()
\`\`\`javascript
let data = [
  { name: "John", age: 30 },
  { name: "Jane", age: 25 }
];
console.table(data);
\`\`\`

## Chrome Developer Tools

### Opening DevTools
- **Windows/Linux**: \`F12\` or \`Ctrl+Shift+I\`
- **Mac**: \`Cmd+Option+I\`

### Console Tab
- View console.log output
- Execute JavaScript code
- See errors and warnings

### Sources Tab
- View your JavaScript files
- Set breakpoints
- Step through code line by line

## Breakpoints

Set breakpoints in DevTools to pause execution:

1. Open Sources tab
2. Click line number to set breakpoint
3. Code pauses when it reaches that line
4. Inspect variables and step through code

## Call Stack

Shows the sequence of function calls that led to the current point.

## Debugging Tips

1. **Use console.log()** to track variable values
2. **Check the Console** for error messages
3. **Use breakpoints** to pause execution
4. **Read error messages** carefully
5. **Check data types** with typeof
6. **Use debugger statement**: \`debugger;\` pauses execution

## Mini Exercise

Add console.log statements to debug a function.`,
        contentArray: [
          "console.log: output values",
          "console.error, console.warn: different log levels",
          "Chrome DevTools: F12 or Cmd+Option+I",
          "Breakpoints: pause execution",
          "Call stack: shows function call sequence",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 17,
      },
    ];

    // Create lessons
    const lessons = [];
    for (const lessonData of lessonsData) {
      const lesson = await Lesson.create({
        ...lessonData,
        moduleId: jsModule._id,
        skillId: jsSkill._id,
      });
      lessons.push(lesson);
    }
    console.log(`✅ Created ${lessons.length} lessons`);

    // Create quizzes for lessons that need them (Lessons 1, 3, 5, 7, 9, 11, 13, 15, 17)
    const quizLessons = [0, 2, 4, 6, 8, 10, 12, 14, 16]; // Indices for lessons 1, 3, 5, 7, 9, 11, 13, 15, 17

    for (const lessonIndex of quizLessons) {
      const lesson = lessons[lessonIndex];
      const quiz = await Quiz.create({
        name: `${lesson.name} - Quiz`,
        description: `Test your knowledge of ${lesson.name}`,
        moduleId: jsModule._id,
        lessonId: lesson._id,
        lessonOrder: lesson.order,
        duration: 10,
        numberOfQuestions: 10,
        points: 50,
      });

      // Create questions based on lesson content
      let questions = [];
      
      // Helper function to add coding questions with difficulty levels
      const addCodingQuestions = (baseQuestions: any[], lessonName: string, lessonOrder: number) => {
        // Determine difficulty based on lesson order
        // Early lessons (1-5): Easy to Medium
        // Middle lessons (6-10): Medium to Hard
        // Later lessons (11+): Hard
        let difficulty1 = "Easy";
        let difficulty2 = "Medium";
        let points1 = 15;
        let points2 = 20;
        
        if (lessonOrder > 5 && lessonOrder <= 10) {
          difficulty1 = "Medium";
          difficulty2 = "Hard";
          points1 = 20;
          points2 = 25;
        } else if (lessonOrder > 10) {
          difficulty1 = "Hard";
          difficulty2 = "Hard";
          points1 = 25;
          points2 = 30;
        }

        // Generate coding questions based on lesson content
        const codingQuestions = [
          {
            questionText: `[${difficulty1} Level] Write a JavaScript function that demonstrates a key concept from "${lessonName}". Your solution should be clean, well-commented, and follow best practices.\n\nExample: If the lesson is about variables, write a function that uses different variable declarations (var, let, const) appropriately.`,
            type: "code",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: points1,
            order: baseQuestions.length + 1,
            evaluationCriteria: `Code should be syntactically correct, demonstrate understanding of ${lessonName} concepts, include proper variable naming, and follow JavaScript best practices.`,
            answer: { 
              type: "code", 
              content: `// Sample solution for ${lessonName}\nfunction demonstrateConcept() {\n  // Your implementation here\n  // Make sure to use the concepts from the lesson\n  return result;\n}` 
            },
            explanation: `This ${difficulty1.toLowerCase()} level coding question tests your practical implementation of concepts from ${lessonName}.`,
          },
          {
            questionText: `[${difficulty2} Level] Implement a more complex solution that applies multiple concepts from "${lessonName}". Your code should handle edge cases, include error handling where appropriate, and demonstrate advanced understanding.\n\nRequirements:\n- Use the concepts covered in this lesson\n- Include proper error handling\n- Add comments explaining your approach\n- Consider edge cases`,
            type: "code",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: points2,
            order: baseQuestions.length + 2,
            evaluationCriteria: `Code should demonstrate advanced understanding of ${lessonName}, include error handling, handle edge cases, use appropriate data structures/algorithms, and be well-structured with clear logic flow.`,
            answer: { 
              type: "code", 
              content: `// Advanced solution for ${lessonName}\nfunction advancedImplementation(input) {\n  try {\n    // Validate input\n    if (!input) throw new Error('Invalid input');\n    \n    // Your advanced implementation here\n    // Apply multiple concepts from the lesson\n    \n    return result;\n  } catch (error) {\n    console.error('Error:', error.message);\n    throw error;\n  }\n}` 
            },
            explanation: `This ${difficulty2.toLowerCase()} level coding question tests your ability to combine multiple concepts from ${lessonName} and write production-ready code.`,
          },
        ];
        return [...baseQuestions, ...codingQuestions];
      };
      
      if (lessonIndex === 0) {
        // Lesson 1: Introduction to JavaScript
        questions = [
          {
            questionText: "JavaScript is a ___ language.",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 1,
            options: [
              { id: "opt1", type: "mcq", content: "Compiled" },
              { id: "opt2", type: "mcq", content: "Interpreted" },
              { id: "opt3", type: "mcq", content: "Machine" },
            ],
            answer: { type: "mcq", content: "Interpreted", optionId: "opt2" },
            explanation: "JavaScript is an interpreted language, meaning it's executed line by line at runtime.",
          },
          {
            questionText: "Which tag embeds JavaScript in HTML?",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 2,
            options: [
              { id: "opt1", type: "mcq", content: "<js>" },
              { id: "opt2", type: "mcq", content: "<script>" },
              { id: "opt3", type: "mcq", content: "<javascript>" },
            ],
            answer: { type: "mcq", content: "<script>", optionId: "opt2" },
            explanation: "The <script> tag is used to embed JavaScript code in HTML documents.",
          },
          {
            questionText: "JavaScript is primarily used for:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 3,
            options: [
              { id: "opt1", type: "mcq", content: "Styling" },
              { id: "opt2", type: "mcq", content: "Structure" },
              { id: "opt3", type: "mcq", content: "Interactivity" },
            ],
            answer: { type: "mcq", content: "Interactivity", optionId: "opt3" },
            explanation: "JavaScript adds interactivity and dynamic behavior to web pages.",
          },
          {
            questionText: "Browsers run JavaScript using ___",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 4,
            options: [
              { id: "opt1", type: "mcq", content: "Engines" },
              { id: "opt2", type: "mcq", content: "OS" },
              { id: "opt3", type: "mcq", content: "Compiler" },
            ],
            answer: { type: "mcq", content: "Engines", optionId: "opt1" },
            explanation: "JavaScript engines (like V8, SpiderMonkey) execute JavaScript code in browsers.",
          },
          {
            questionText: "Inline JavaScript is written inside:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 5,
            options: [
              { id: "opt1", type: "mcq", content: "HTML tags" },
              { id: "opt2", type: "mcq", content: "CSS" },
              { id: "opt3", type: "mcq", content: "PHP" },
            ],
            answer: { type: "mcq", content: "HTML tags", optionId: "opt1" },
            explanation: "Inline JavaScript is written directly in HTML tag attributes like onclick.",
          },
          {
            questionText: "console.log() is used for:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 6,
            options: [
              { id: "opt1", type: "mcq", content: "Alerts" },
              { id: "opt2", type: "mcq", content: "Logging" },
              { id: "opt3", type: "mcq", content: "Styling" },
            ],
            answer: { type: "mcq", content: "Logging", optionId: "opt2" },
            explanation: "console.log() outputs messages to the browser console for debugging.",
          },
          {
            questionText: "The extension for JavaScript file is:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 7,
            options: [
              { id: "opt1", type: "mcq", content: ".jss" },
              { id: "opt2", type: "mcq", content: ".js" },
              { id: "opt3", type: "mcq", content: ".javascript" },
            ],
            answer: { type: "mcq", content: ".js", optionId: "opt2" },
            explanation: "JavaScript files use the .js extension.",
          },
          {
            questionText: "JavaScript comments use:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 8,
            options: [
              { id: "opt1", type: "mcq", content: "<!-- -->" },
              { id: "opt2", type: "mcq", content: "//" },
              { id: "opt3", type: "mcq", content: "##" },
            ],
            answer: { type: "mcq", content: "//", optionId: "opt2" },
            explanation: "JavaScript uses // for single-line and /* */ for multi-line comments.",
          },
          {
            questionText: "External JavaScript is loaded using:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 9,
            options: [
              { id: "opt1", type: "mcq", content: "href" },
              { id: "opt2", type: "mcq", content: "src" },
              { id: "opt3", type: "mcq", content: "link" },
            ],
            answer: { type: "mcq", content: "src", optionId: "opt2" },
            explanation: "The src attribute in <script> tag loads external JavaScript files.",
          },
          {
            questionText: "JavaScript runs on server using:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 10,
            options: [
              { id: "opt1", type: "mcq", content: "Python" },
              { id: "opt2", type: "mcq", content: "PHP" },
              { id: "opt3", type: "mcq", content: "Node.js" },
            ],
            answer: { type: "mcq", content: "Node.js", optionId: "opt3" },
            explanation: "Node.js allows JavaScript to run on servers, not just in browsers.",
          },
        ];
      } else if (lessonIndex === 2) {
        // Lesson 3: Data Types
        questions = [
          {
            questionText: "What does typeof null return?",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 1,
            options: [
              { id: "opt1", type: "mcq", content: "null" },
              { id: "opt2", type: "mcq", content: "object" },
              { id: "opt3", type: "mcq", content: "undefined" },
            ],
            answer: { type: "mcq", content: "object", optionId: "opt2" },
            explanation: "typeof null returns 'object' - this is a known JavaScript bug.",
          },
          {
            questionText: "Which is NOT a primitive data type?",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 2,
            options: [
              { id: "opt1", type: "mcq", content: "Array" },
              { id: "opt2", type: "mcq", content: "String" },
              { id: "opt3", type: "mcq", content: "Number" },
            ],
            answer: { type: "mcq", content: "Array", optionId: "opt1" },
            explanation: "Array is a reference type, not a primitive type.",
          },
          {
            questionText: "Symbol is used for:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 3,
            options: [
              { id: "opt1", type: "mcq", content: "Unique identifiers" },
              { id: "opt2", type: "mcq", content: "Strings" },
              { id: "opt3", type: "mcq", content: "Numbers" },
            ],
            answer: { type: "mcq", content: "Unique identifiers", optionId: "opt1" },
            explanation: "Symbol creates unique identifiers that cannot be duplicated.",
          },
          {
            questionText: "BigInt is written using:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 4,
            options: [
              { id: "opt1", type: "mcq", content: "n suffix" },
              { id: "opt2", type: "mcq", content: "b prefix" },
              { id: "opt3", type: "mcq", content: "B suffix" },
            ],
            answer: { type: "mcq", content: "n suffix", optionId: "opt1" },
            explanation: "BigInt values are created by appending 'n' to the end of an integer.",
          },
          {
            questionText: "typeof [] returns:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 5,
            options: [
              { id: "opt1", type: "mcq", content: "array" },
              { id: "opt2", type: "mcq", content: "object" },
              { id: "opt3", type: "mcq", content: "undefined" },
            ],
            answer: { type: "mcq", content: "object", optionId: "opt2" },
            explanation: "Arrays are objects in JavaScript, so typeof [] returns 'object'.",
          },
          {
            questionText: "typeof function(){} returns:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 6,
            options: [
              { id: "opt1", type: "mcq", content: "function" },
              { id: "opt2", type: "mcq", content: "object" },
              { id: "opt3", type: "mcq", content: "undefined" },
            ],
            answer: { type: "mcq", content: "function", optionId: "opt1" },
            explanation: "Functions have their own type in JavaScript.",
          },
          {
            questionText: '"5" + 3 gives:',
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 7,
            options: [
              { id: "opt1", type: "mcq", content: "8" },
              { id: "opt2", type: "mcq", content: '"53"' },
              { id: "opt3", type: "mcq", content: "Error" },
            ],
            answer: { type: "mcq", content: '"53"', optionId: "opt2" },
            explanation: "The + operator concatenates strings, so '5' + 3 becomes '53'.",
          },
          {
            questionText: "Boolean(0) is:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 8,
            options: [
              { id: "opt1", type: "mcq", content: "true" },
              { id: "opt2", type: "mcq", content: "false" },
              { id: "opt3", type: "mcq", content: "0" },
            ],
            answer: { type: "mcq", content: "false", optionId: "opt2" },
            explanation: "0 is a falsy value, so Boolean(0) returns false.",
          },
          {
            questionText: "Number('20a') gives:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 9,
            options: [
              { id: "opt1", type: "mcq", content: "20" },
              { id: "opt2", type: "mcq", content: "NaN" },
              { id: "opt3", type: "mcq", content: "Error" },
            ],
            answer: { type: "mcq", content: "NaN", optionId: "opt2" },
            explanation: "Number() returns NaN when it cannot convert the string to a number.",
          },
          {
            questionText: "typeof undefined is:",
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 10,
            options: [
              { id: "opt1", type: "mcq", content: "undefined" },
              { id: "opt2", type: "mcq", content: "null" },
              { id: "opt3", type: "mcq", content: "object" },
            ],
            answer: { type: "mcq", content: "undefined", optionId: "opt1" },
            explanation: "typeof undefined correctly returns 'undefined'.",
          },
        ];
      } else {
        // Generic questions for other lessons - create some basic MCQ questions
        questions = [
          {
            questionText: `What is a key concept in ${lesson.name}?`,
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: 1,
            options: [
              { id: "opt1", type: "mcq", content: "Option A" },
              { id: "opt2", type: "mcq", content: "Option B" },
              { id: "opt3", type: "mcq", content: "Option C" },
            ],
            answer: { type: "mcq", content: "Option A", optionId: "opt1" },
            explanation: "This is a sample question for the lesson.",
          },
        ];
      }

      // Add coding questions with difficulty levels to all quizzes
      questions = addCodingQuestions(questions, lesson.name, lesson.order);

      // Update quiz numberOfQuestions to reflect total
      await Quiz.findByIdAndUpdate(quiz._id, {
        numberOfQuestions: questions.length,
      });

      // Create questions
      for (const questionData of questions) {
        await Question.create(questionData);
      }
      console.log(`✅ Created quiz with ${questions.length} questions (including 2 coding questions with difficulty levels) for ${lesson.name}`);
    }

    // Update module lessonsCount
    await Module.findByIdAndUpdate(jsModule._id, {
      lessonsCount: lessons.length,
    });

    return NextResponse.json({
      success: true,
      message: "JavaScript module seeded successfully",
      module: jsModule,
      lessonsCount: lessons.length,
      quizzesCount: quizLessons.length,
    });
  } catch (error) {
    console.error("Error seeding JavaScript module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed JavaScript module",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

