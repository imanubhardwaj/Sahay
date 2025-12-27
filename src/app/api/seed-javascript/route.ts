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
      duration: 1200, // ~20 hours (20 lessons * 60 min avg)
      points: 2000, // 100 points per lesson average
      lessonsCount: 20,
      icon: "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
    });
    console.log("✅ Created JavaScript Beginner module");

    // Define all 20 lessons with complete content
    const lessonsData = [
      {
        name: "Lesson 1: The JavaScript Environment (Intro & Fundamentals)",
        content: `# The JavaScript Environment (Intro & Fundamentals)

## Topics Covered
Hello World, Code Structure, Use Strict, Code Editors, Developer Console.

## Lesson Content

JavaScript is the programming language of the web. To start, we need to understand how scripts are loaded. Scripts can be placed directly in HTML using <script> tags or linked via external files (best practice).

**Statements**: Syntax commands are separated by semicolons ;.

**"use strict"**: This directive, placed at the top of a script, enables the modern mode of JavaScript, preventing old, "sloppy" syntax errors.

**Console**: The developer console is your best friend for debugging. console.log() prints data to it.

## Mini Practice Questions

1. Open your browser (Chrome/Firefox), right-click > Inspect > Console. Type 2 + 2 and hit enter. What happens?

2. Create an index.html file and attach a script.js file to it.

3. Write "use strict" at the very top of your JS file.

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

## Coding Challenge

**Task 1**: Create a script that displays an alert saying "I am JavaScript!" when the page loads.

**Task 2**: Write code that logs "Part 1" and "Part 2" to the console on two separate lines using two specific commands.`,
        contentArray: [
          "JavaScript is the programming language of the web",
          "Scripts can be placed directly in HTML using <script> tags or linked via external files",
          "Statements are separated by semicolons",
          '"use strict" enables modern JavaScript mode',
          "console.log() prints data to the developer console",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 1,
      },
      {
        name: "Lesson 2: Variables & Data Types",
        content: `# Variables & Data Types

## Topics Covered
Variables (let, const, var), Data Types (8 types), Typeof.

## Lesson Content

Data is stored in "variables."

**let**: A modern variable declaration. Can be changed later.

**const**: A constant. Once assigned, it cannot be changed.

**var**: Old-school declaration. Avoid using this in modern code (has scoping issues).

## Data Types: JS has 8 types:

1. **Number** (Integers and floats)
2. **BigInt** (Very large integers)
3. **String** (Text)
4. **Boolean** (True/False)
5. **null** (Empty/Unknown value)
6. **undefined** (Value not assigned yet)
7. **Symbol** (Unique identifier)
8. **Object** (Complex data structure)

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

## typeof Operator

\`\`\`javascript
typeof "Hi"        // "string"
typeof 10          // "number"
typeof null        // "object" (JS bug!)
typeof []          // "object"
typeof function(){} // "function"
typeof undefined   // "undefined"
\`\`\`

## Mini Practice Questions

1. Declare a variable named admin and assign it the value "John".

2. Try to create a const variable inside the console and then try to change its value. Observe the error.

3. Use typeof to check the type of true and "true".

## Coding Challenge

**Task 1**: Declare two variables: planet (set to "Earth") and currentUser (set to "Visitor"). Log a sentence combining them using backticks (e.g., "Visitor is on Earth").

**Task 2**: Create a variable using let. Assign it a number. Then reassign it a string value. Log the final type using typeof.`,
        contentArray: [
          "let: modern variable declaration, can be changed",
          "const: constant, cannot be changed",
          "var: old-school, avoid in modern code",
          "8 data types: Number, BigInt, String, Boolean, null, undefined, Symbol, Object",
          "typeof operator checks data type",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 2,
      },
      {
        name: "Lesson 3: Interaction & Basic Operators",
        content: `# Interaction & Basic Operators

## Topics Covered
Alert/Prompt/Confirm, Type Conversions, Math Operators, Increment/Decrement.

## Lesson Content

We interact with users via browser-specific functions:

**alert(message)**: Shows a message.

**prompt(message, default)**: Asks the user for text input. Returns the text or null.

**confirm(message)**: Asks a question with OK/Cancel. Returns true/false.

## Math Operators

Standard operators: +, -, *, /, % (remainder), ** (power).

**Concatenation**: The + operator joins strings (e.g., "1" + 2 = "12").

## Examples

\`\`\`javascript
alert("Hello!");                    // Shows alert
let name = prompt("What's your name?", "Guest"); // Gets input
let confirmed = confirm("Are you sure?");         // Gets true/false

// Math operators
let sum = 10 + 5;      // 15
let diff = 10 - 5;     // 5
let prod = 10 * 5;    // 50
let quot = 10 / 5;    // 2
let rem = 10 % 3;     // 1
let pow = 2 ** 3;     // 8

// Increment/Decrement
let x = 5;
x++;  // x becomes 6
x--;  // x becomes 5
\`\`\`

## Type Conversions

\`\`\`javascript
Number("123")     // 123
Number(" 123 ")  // 123 (trims spaces)
String(20)       // "20"
Boolean(0)       // false
Boolean(1)       // true
+("123")         // 123 (unary plus converts to number)
\`\`\`

## Mini Practice Questions

1. Use prompt to ask a user for their age.

2. The result of prompt is always a string. Convert that age into a Number.

3. Calculate the remainder of 10 % 3 in the console.

## Coding Challenge

**Task 1**: Create a simple calculator script. Ask the user for two numbers using prompt, add them together (ensuring they are treated as numbers, not strings), and alert the result.

**Task 2**: Write a script that asks "Are you the boss?" using confirm. If they click OK, alert "Welcome". If Cancel, alert "Access Denied" (Hint: you might need if logic, or just inspect the output for now).`,
        contentArray: [
          "alert(): shows a message",
          "prompt(): asks for text input, returns text or null",
          "confirm(): asks OK/Cancel, returns true/false",
          "Math operators: +, -, *, /, %, **",
          "Type conversions: Number(), String(), Boolean()",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 3,
      },
      {
        name: "Lesson 4: Logic and Branching",
        content: `# Logic and Branching

## Topics Covered
Comparisons, Conditional branching (if, ?), Logical operators, Nullish coalescing (??).

## Lesson Content

Logic allows your code to make decisions.

**Comparisons**: > < >= <= work as expected.

**== (Loose equality)**: Converts types (e.g., 5 == "5" is true). Avoid this.

**=== (Strict equality)**: Checks value AND type (e.g., 5 === "5" is false). Use this.

**Branching (if)**: Executes code only if the condition is true.

**Ternary Operator (?)**: A shortcut for if-else. condition ? val1 : val2.

## Logical Operators

**|| (OR)**: Returns the first truthy value.

**&& (AND)**: Returns the first falsy value.

**! (NOT)**: Inverses the boolean.

**Nullish Coalescing (??)**: Similar to ||, but only checks for null or undefined (ignoring 0 or false).

## Examples

\`\`\`javascript
// Comparisons
5 > 4        // true
5 === "5"    // false (strict)
5 == "5"     // true (loose - avoid!)

// if statement
if (age > 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}

// Ternary
let access = age > 18 ? "Allowed" : "Denied";

// Logical operators
let result = value1 || value2 || "default";
let check = value1 && value2;

// Nullish coalescing
let height = userHeight ?? 100; // Only uses default if null/undefined
\`\`\`

## Mini Practice Questions

1. Check if 0 is equal to false using == and then ===. Log results.

2. Write a ternary operator that sets a variable access to "Allowed" if age > 18, otherwise "Denied".

3. Test null ?? "default" vs 0 || "default".

## Coding Challenge

**Task 1**: Write an if..else if..else chain. Ask user for a number. If < 10, log "Small". If < 100, log "Medium". Otherwise log "Large".

**Task 2**: Create a login system using prompt. If user enters "Admin", ask for password. If password is "TheMaster", alert "Welcome!". If user cancels, alert "Canceled". Otherwise, alert "Wrong password".`,
        contentArray: [
          "Comparisons: > < >= <= work as expected",
          "== (loose equality): converts types, avoid",
          "=== (strict equality): checks value AND type, use this",
          "if: executes code only if condition is true",
          "Ternary: condition ? val1 : val2",
          "Logical operators: || (OR), && (AND), ! (NOT)",
          "Nullish coalescing (??): checks only null/undefined",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 4,
      },
      {
        name: "Lesson 5: Loops & The Switch Statement",
        content: `# Loops & The Switch Statement

## Topics Covered
While, Do-While, For loops, Switch statement.

## Lesson Content

Automate repetitive tasks.

**While**: while (condition) { ... } runs while condition is true.

**For**: for (begin; condition; step) { ... }. The most common loop.

**Break/Continue**: break stops the loop entirely. continue skips the current iteration and goes to the next.

**Switch**: A cleaner way to compare a variable against multiple specific values (cases).

## Examples

\`\`\`javascript
// while loop
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// for loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// do...while (executes at least once)
let j = 0;
do {
  console.log(j);
  j++;
} while (j < 5);

// switch statement
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

## Mini Practice Questions

1. Write a while loop that prints numbers 1 to 5.

2. Write a for loop that prints even numbers from 0 to 10.

3. Rewrite a simple if (x === "a")... else if (x === "b") structure using switch.

## Coding Challenge

**Task 1**: Write a loop which asks the user to enter a number greater than 100 using prompt. If the visitor enters another number – ask them to input again. The loop must stop if the visitor enters a valid number or cancels.

**Task 2**: Write a code using switch that takes a browser name (e.g., "Edge", "Chrome", "Firefox") and alerts "Supported!" for them, and "Unknown" for others.`,
        contentArray: [
          "while: runs while condition is true",
          "for: most common loop, for (begin; condition; step)",
          "do...while: executes at least once",
          "break: stops loop entirely",
          "continue: skips current iteration",
          "switch: cleaner way to compare against multiple values",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 5,
      },
      {
        name: "Lesson 6: Functions",
        content: `# Functions

## Topics Covered
Function Declarations, Expressions, Arrow Functions (=>), Scope.

## Lesson Content

Functions are the building blocks of applications.

**Declaration**: function sayHi() { ... }. Can be called before they are defined (hoisting).

**Expression**: let sayHi = function() { ... }. Created when execution reaches them.

**Arrow Functions**: Concise syntax. let sum = (a, b) => a + b;.

**Parameters**: Inputs to functions.

**Return**: The result sent back to the caller.

## Examples

\`\`\`javascript
// Function Declaration
function greet(name) {
  return "Hello, " + name;
}

// Function Expression
let sum = function(a, b) {
  return a + b;
};

// Arrow Function
let multiply = (a, b) => a * b;

// Arrow Function (multiline)
let greet = (name) => {
  let message = "Hello, " + name;
  return message;
};
\`\`\`

## Scope

Variables declared inside a function are local to that function. Functions can access variables from outer scope.

## Mini Practice Questions

1. Write a function add(a, b) that returns the sum.

2. Rewrite that function as an Arrow Function.

3. Create a function without a return statement and log its result. What is it?

## Coding Challenge

**Task 1**: Write a function min(a, b) which returns the least of two numbers a and b.

**Task 2**: Write a function pow(x, n) that returns x in power n. Ask the user for x and n and then alert the result of the function.`,
        contentArray: [
          "Function Declaration: function keyword, hoisted",
          "Function Expression: assigned to variable",
          "Arrow Functions: concise syntax (a, b) => a + b",
          "Parameters: inputs to functions",
          "Return: result sent back to caller",
          "Scope: variables local to function",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 6,
      },
      {
        name: "Lesson 7: Objects (The Basics)",
        content: `# Objects (The Basics)

## Topics Covered
Objects, Properties, References, this, Constructors.

## Lesson Content

Objects store keyed collections of data.

**Syntax**: let user = { name: "John", age: 30 };.

**Access**: user.name (Dot notation) or user["name"] (Bracket notation).

**References**: Objects are stored by reference. Copying the variable admin = user copies the reference, not the data. Changing one changes the other.

**"this"**: Refers to the object the method is called on.

**New**: new User() creates a new object using a constructor function.

## Examples

\`\`\`javascript
// Creating objects
let user = {
  name: "John",
  age: 30
};

// Accessing properties
console.log(user.name);        // "John" (dot notation)
console.log(user["age"]);      // 30 (bracket notation)

// Adding properties
user.city = "New York";
user["country"] = "USA";

// Object methods
let person = {
  name: "John",
  sayHi: function() {
    return "Hello, I'm " + this.name;
  }
};

// References
let admin = user;  // Both point to same object
admin.name = "Jane";
console.log(user.name);  // "Jane" (changed!)
\`\`\`

## Mini Practice Questions

1. Create an object person with name and age.

2. Add a new property isAdmin = true to it.

3. Delete the age property.

## Coding Challenge

**Task 1**: Create an empty object user. Add the property name with the value John. Add the property surname with the value Smith. Change the name to Pete. Remove the property name from the object.

**Task 2**: Create a constructor function Accumulator(startingValue). It should create an object with a method read() that prompts the user for a number and adds it to startingValue.`,
        contentArray: [
          "Objects store keyed collections of data",
          "Access: user.name (dot) or user['name'] (bracket)",
          "Objects stored by reference",
          "this: refers to object method is called on",
          "new: creates object using constructor",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 7,
      },
      {
        name: "Lesson 8: Logic I (Comparisons)",
        content: `# Logic I (Comparisons)

## Focus
How JavaScript compares values and the dangers of loose equality.

## Lesson Content

**Booleans**: All comparisons return true or false.

**String Comparison**: Strings are compared letter-by-letter in "dictionary" (lexicographical) order. "Z" > "A" is true. Lowercase is greater than uppercase ("a" > "Z").

**Strict vs. Loose**:

**== (Loose Equality)**: Converts types before comparing. 0 == false (True), 5 == "5" (True). Avoid using this.

**=== (Strict Equality)**: Checks value AND type. 0 === false (False). Always use this.

**Null/Undefined Quirks**:

- null == undefined is true.
- null === undefined is false.
- null > 0 is false, null == 0 is false, but null >= 0 is true (due to how checks work).

## Examples

\`\`\`javascript
// String comparison
"apple" > "pineapple"  // false (a < p)
"Z" > "A"              // true
"a" > "Z"               // true (lowercase > uppercase)

// Loose vs Strict
5 == "5"    // true (loose - converts types)
5 === "5"   // false (strict - checks type)

// Null/Undefined quirks
null == undefined   // true
null === undefined  // false
null > 0            // false
null >= 0           // true (!)
\`\`\`

## Mini Practice

1. Compare "apple" and "pineapple" in the console. Which is greater?

2. Check undefined == null vs undefined === null.

3. Check "" == false. (Empty string vs false).

## Coding Tasks

**Task 1**: Write a script that logs "Strict check passed" if 10 === "10", and "Loose check passed" if 10 == "10". Observe which one prints.

**Task 2**: Predict and then log the result of comparisons: undefined == null, undefined === null, null == "\\n0\\n".`,
        contentArray: [
          "Booleans: all comparisons return true or false",
          "String comparison: letter-by-letter lexicographical order",
          "== (loose equality): converts types, avoid",
          "=== (strict equality): checks value AND type, always use",
          "Null/undefined quirks: null == undefined is true, null === undefined is false",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 8,
      },
      {
        name: "Lesson 9: Logic II (Conditional Branching)",
        content: `# Logic II (Conditional Branching)

## Focus
Making decisions with code.

## Lesson Content

**if Statement**: Evaluates a condition. If truthy, executes the block.

**else**: Executes if the if condition is falsy.

**else if**: Tests multiple variants.

**Condition Conversion**: The if (...) statement evaluates the expression in parentheses and converts the result to a boolean.

**Ternary Operator ?**: The only operator with 3 arguments. let result = condition ? value1 : value2;. Use this for short, simple assignments, not complex logic.

## Examples

\`\`\`javascript
// if statement
if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}

// else if
if (score > 90) {
  console.log("Grade A");
} else if (score > 80) {
  console.log("Grade B");
} else {
  console.log("Grade C");
}

// Ternary operator
let access = age > 18 ? "Allowed" : "Denied";

// Condition conversion
if ("0") {  // "0" is truthy (non-empty string)
  console.log("This executes");
}

if (0) {  // 0 is falsy
  console.log("This doesn't execute");
}
\`\`\`

## Mini Practice

1. Write an if statement that alerts "Hello" if 1 === 1.

2. Rewrite if (age > 18) { access = true } else { access = false } using the ternary operator.

## Coding Tasks

**Task 1**: Using prompt, ask the user "What is the official name of JavaScript?". If they type "ECMAScript", alert "Right!", otherwise alert "You don't know? ECMAScript!".

**Task 2**: Using prompt, ask for a number. If greater than 0, alert 1. If less than 0, alert -1. If 0, alert 0.`,
        contentArray: [
          "if: evaluates condition, executes if truthy",
          "else: executes if if condition is falsy",
          "else if: tests multiple variants",
          "Condition conversion: converts expression to boolean",
          "Ternary operator: condition ? value1 : value2",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 9,
      },
      {
        name: "Lesson 10: Logic III (Logical Operators)",
        content: `# Logic III (Logical Operators)

## Focus
Combining multiple conditions.

## Lesson Content

**|| (OR)**: Finds the first truthy value. result = value1 || value2 || value3. If all are false, returns the last value. Used for "default" values.

**&& (AND)**: Finds the first falsy value. result = value1 && value2. If all are true, returns the last value.

**! (NOT)**: Converts to boolean and returns the inverse.

**Precedence**: ! is highest, then &&, then ||.

## Examples

\`\`\`javascript
// OR operator
alert(1 || 0);        // 1 (first truthy)
alert(null || 0 || 1); // 1 (first truthy)

// AND operator
alert(1 && 0);         // 0 (first falsy)
alert(1 && 2 && 3);    // 3 (all truthy, returns last)

// NOT operator
alert(!true);          // false
alert(!!1);            // true (double NOT converts to boolean)

// Precedence
let result = !false && true || false; // true
\`\`\`

## Mini Practice

1. Evaluate alert(1 || 0).

2. Evaluate alert(1 && 0).

3. Evaluate alert( !!"non-empty string" ).

## Coding Tasks

**Task 1**: Write a condition checks if age is between 14 and 90 inclusively.

**Task 2**: Write a login system. Ask "Who's there?". If "Admin", ask "Password?". If "TheMaster", welcome them. Handle "Cancel" (null) or other inputs with "I don't know you".`,
        contentArray: [
          "|| (OR): finds first truthy value",
          "&& (AND): finds first falsy value",
          "! (NOT): converts to boolean and inverses",
          "Precedence: ! > && > ||",
          "Used for default values and condition checking",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 10,
      },
      {
        name: "Lesson 11: Logic IV (Nullish Coalescing)",
        content: `# Logic IV (Nullish Coalescing)

## Focus
Handling null and undefined specifically.

## Lesson Content

**The Problem**: || cannot distinguish between false, 0, and null. If you want 0 to be a valid value (e.g., height = 0), || will treat it as false and replace it.

**The Solution (??)**: The Nullish Coalescing operator.

**Logic**: a ?? b returns a if a is defined (not null/undefined), otherwise b.

It treats 0 and false as valid values.

## Examples

\`\`\`javascript
// Problem with ||
let height = 0;
alert(height || 100);  // 100 (wrong! 0 is valid)
alert(height ?? 100);  // 0 (correct!)

// With null/undefined
let user = null;
alert(user ?? "Anonymous"); // "Anonymous"

let name;
alert(name ?? "Guest"); // "Guest"

// Comparison
alert(0 || "default");  // "default"
alert(0 ?? "default");  // 0

alert(false || "test"); // "test"
alert(false ?? "test"); // false
\`\`\`

## Mini Practice

1. Let height = 0. Compare alert(height || 100) vs alert(height ?? 100).

2. Let user = null. alert(user ?? "Anonymous").

## Coding Tasks

**Task 1**: Create variables firstName = null, lastName = null, nickName = "SuperCoder". Use ?? to display the first defined name.

**Task 2**: Create a setting volume = 0. Use ?? to ensure that if volume is defined (even 0), it is kept. If it is null, default to 50. Log the result.`,
        contentArray: [
          "Problem: || cannot distinguish false, 0, and null",
          "?? (Nullish Coalescing): checks only null/undefined",
          "a ?? b: returns a if defined, otherwise b",
          "Treats 0 and false as valid values",
          "Use when 0 or false should be preserved",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 11,
      },
      {
        name: "Lesson 12: Repetition I (While Loops)",
        content: `# Repetition I (While Loops)

## Focus
Repeating code while a condition is true.

## Lesson Content

**while (condition) { body }**: Checks condition before running logic.

**do { body } while (condition)**: Runs logic at least once, then checks condition.

**Infinite Loop**: If the condition never becomes false (e.g., while(true)), the browser will freeze/crash.

**i++**: Crucial for incrementing loop counters to eventually break the loop.

## Examples

\`\`\`javascript
// while loop
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// do...while loop
let j = 0;
do {
  console.log(j);
  j++;
} while (j < 5);

// Infinite loop (dangerous!)
// while (true) {
//   console.log("This runs forever!");
// }
\`\`\`

## Mini Practice

1. Write a while loop that counts down from 3 to 1.

2. Use do..while to log a message once even if the condition is false (while(0)).

## Coding Tasks

**Task 1**: Use a while loop to output only odd numbers from 1 to 15.

**Task 2**: Use do..while to prompt the user for a number greater than 100. If they enter less, prompt again. (Stop if they enter >100 or cancel/empty).`,
        contentArray: [
          "while: checks condition before execution",
          "do...while: executes at least once, then checks",
          "Infinite loop: condition never becomes false",
          "i++: increment loop counter to break loop",
          "Use break to exit loop early",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 12,
      },
      {
        name: "Lesson 13: Repetition II (For Loops)",
        content: `# Repetition II (For Loops)

## Focus
The most commonly used loop.

## Lesson Content

**Syntax**: for (begin; condition; step) { body }

**begin**: Run once (let i = 0).

**condition**: Checked before every iteration (i < 3).

**step**: Run after every iteration (i++).

**Break**: Exits the loop immediately.

**Continue**: Skips the rest of the current iteration and starts the next one.

**Labels**: labelName: for(...) allows breaking out of nested loops.

## Examples

\`\`\`javascript
// Standard for loop
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// Break
for (let i = 0; i < 10; i++) {
  if (i === 5) break; // Exit at 5
  console.log(i);
}

// Continue
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue; // Skip even numbers
  console.log(i); // Only odd numbers
}

// Nested loops with labels
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // Break out of both loops
    console.log(i, j);
  }
}
\`\`\`

## Mini Practice

1. Write a loop for (let i = 0; i < 5; i++) and log i.

2. Use continue to skip the number 3 in a loop from 1 to 5.

## Coding Tasks

**Task 1**: Write a loop that calculates the sum of numbers from 1 to 100.

**Task 2**: Output prime numbers from 2 to 10. (Hint: Use a nested loop to check for divisors).`,
        contentArray: [
          "for (begin; condition; step): most common loop",
          "begin: runs once",
          "condition: checked before each iteration",
          "step: runs after each iteration",
          "break: exits loop immediately",
          "continue: skips current iteration",
          "Labels: break out of nested loops",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 13,
      },
      {
        name: "Lesson 14: Control Flow (Switch)",
        content: `# Control Flow (Switch)

## Focus
A cleaner alternative to multiple if..else blocks.

## Lesson Content

**Syntax**: switch(x) { case 'value': ... break; default: ... }

**Strict Equality**: Switch checks types strictly (===). case '3' will not match the number 3.

**Fallthrough**: If you omit break, execution continues into the next case. This can be used to group cases.

**Default**: Runs if no other case matches.

## Examples

\`\`\`javascript
// Basic switch
let a = 2;
switch (a) {
  case 1:
    console.log("one");
    break;
  case 2:
    console.log("two");
    break;
  default:
    console.log("other");
}

// Grouped cases (fallthrough)
let browser = "Edge";
switch (browser) {
  case "Edge":
  case "Chrome":
  case "Firefox":
    alert("Supported!");
    break;
  default:
    alert("Unknown");
}

// Switch with expressions
let x = 2 + 2;
switch (x) {
  case 4:
    alert("Correct!");
    break;
}
\`\`\`

## Mini Practice

1. Write a switch for a variable a=2. Case 1: log "one", Case 2: log "two".

2. Remove the break from Case 2 and see what happens if you add a Case 3.

## Coding Tasks

**Task 1**: Rewrite the following if as a switch: if (a === 0) alert(0); if (a === 1) alert(1); if (a === 2 || a === 3) alert('2 or 3');

**Task 2**: Write a switch statement that takes a browser name (e.g., "Edge", "Chrome") and alerts "Supported". Add a default case that alerts "We hope this page looks ok!".`,
        contentArray: [
          "switch: cleaner alternative to multiple if..else",
          "Strict equality: checks types with ===",
          "break: stops execution, prevents fallthrough",
          "fallthrough: omitting break continues to next case",
          "default: runs if no case matches",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 14,
      },
      {
        name: "Lesson 15: Functions I (Declarations)",
        content: `# Functions I (Declarations)

## Focus
Building reusable blocks of code.

## Lesson Content

**The Purpose**: To avoid repeating code. Change it in one place, update it everywhere.

**Syntax**:
\`\`\`javascript
function name(parameter1, parameter2) {
  // body
  return result;
}
\`\`\`

**Parameters**: Variables passed into the function (local to the function).

**Default Values**: function showMessage(from, text = "no text"). If text is not passed, it uses "no text".

**Return**: The return directive stops the function and sends a value back. If no return is specified, it returns undefined.

## Examples

\`\`\`javascript
// Function declaration
function greet(name) {
  return "Hello, " + name;
}

// With default parameters
function showMessage(from, text = "no text") {
  console.log(from + ": " + text);
}

showMessage("Ann"); // Ann: no text
showMessage("Ann", "Hello"); // Ann: Hello

// Return statement
function add(a, b) {
  return a + b;
}

let result = add(5, 3); // 8

// No return (returns undefined)
function sayHi() {
  console.log("Hi");
}
let x = sayHi(); // x is undefined
\`\`\`

## Mini Practice

1. Define a function showMessage that alerts "Hello!". Call it twice.

2. Define a function with a parameter name that alerts "Hello " + name.

3. Try calling a function without passing an argument (if it expects one). What is the value of the missing argument?

## Coding Tasks

**Task 1**: Write a function checkAge(age) that returns true if age > 18. Otherwise, it asks for a confirmation and returns the result of the confirm.

**Task 2**: Write a function min(a, b) which returns the least of two numbers a and b.`,
        contentArray: [
          "Purpose: avoid repeating code",
          "Syntax: function name(params) { body }",
          "Parameters: variables passed into function",
          "Default values: param = defaultValue",
          "Return: stops function and sends value back",
          "No return: returns undefined",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 15,
      },
      {
        name: "Lesson 16: Functions II (Expressions & Scope)",
        content: `# Functions II (Expressions & Scope)

## Focus
Different ways to create functions and how variables live.

## Lesson Content

**Function Declaration**: function sum(a,b) {...}.

**Hoisting**: These can be called before they are defined in the code.

**Function Expression**: let sum = function(a,b) {...}.

Created when the execution reaches the line. Cannot be called before definition.

**Callback Functions**: Passing a function as an argument to another function (e.g., ask(question, yesFunc, noFunc)).

**Local vs. Outer Variables**: A function can access variables outside of it (Outer Scope), but if it creates a variable with the same name, it "shadows" (hides) the outer one.

## Examples

\`\`\`javascript
// Function Declaration (hoisted)
sayHi(); // Works! Can call before definition

function sayHi() {
  console.log("Hi");
}

// Function Expression (not hoisted)
// sayHello(); // Error! Cannot call before definition

let sayHello = function() {
  console.log("Hello");
};

// Callback function
function ask(question, yes, no) {
  if (confirm(question)) yes();
  else no();
}

ask(
  "Do you agree?",
  function() { alert("You agreed."); },
  function() { alert("You canceled."); }
);

// Scope
let userName = "John";

function showMessage() {
  let userName = "Bob"; // Shadows outer variable
  console.log(userName); // "Bob"
}

showMessage();
console.log(userName); // "John" (unchanged)
\`\`\`

## Mini Practice

1. Create a Function Expression let sayHi = function() { ... } and call it.

2. Try to call a Function Expression before you define it. Observe the error.

3. Declare let userName = "John". Inside a function, change userName to "Bob". Check the value of userName after the function runs.

## Coding Tasks

**Task 1**: Create a function expression welcome that works differently based on age (use a variable outside). If age < 18, assign a function alerting "Hello". If age > 18, assign a function alerting "Greetings".

**Task 2**: Write a function that accepts two numbers and a "callback" function to handle the result. Call it with an addition function.`,
        contentArray: [
          "Function Declaration: hoisted, can call before definition",
          "Function Expression: not hoisted, created when execution reaches it",
          "Callback: function passed as argument to another function",
          "Local vs Outer: function can access outer variables",
          "Shadowing: local variable hides outer variable with same name",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 16,
      },
      {
        name: "Lesson 17: Functions III (Arrow Functions)",
        content: `# Functions III (Arrow Functions)

## Focus
The modern, concise syntax.

## Lesson Content

**Syntax**: let func = (arg1, arg2) => expression;

This is a shorter version of: let func = function(arg1, arg2) { return expression; }.

**Single Argument**: Parentheses are optional. let double = n => n * 2;.

**No Arguments**: Parentheses are required. let sayHi = () => alert("Hi");.

**Multiline**: If you use curly braces { ... }, you must use return explicitly.

\`\`\`javascript
let sum = (a, b) => {  // curly brace = multiline
  let result = a + b;
  return result; // Explicit return needed
};
\`\`\`

## Examples

\`\`\`javascript
// Arrow function (single expression)
let sum = (a, b) => a + b;

// Single argument (parentheses optional)
let double = n => n * 2;

// No arguments (parentheses required)
let sayHi = () => alert("Hi");

// Multiline (curly braces + return)
let multiply = (a, b) => {
  let result = a * b;
  return result;
};

// Rewriting function expression
let func = function(a) { return a + 100; };
let funcArrow = a => a + 100; // Same thing!
\`\`\`

## Mini Practice

1. Rewrite function(a) { return a + 100; } as an arrow function.

2. Write an arrow function ask(question, yes, no) that mimics the callback structure.

## Coding Tasks

**Task 1**: Replace these Function Expressions with Arrow Functions: function(a, b) { return a / b; } function() { alert("Done"); }

**Task 2**: Write an arrow function isEven(n) that returns true if n is even. Test it.`,
        contentArray: [
          "Arrow function: (args) => expression",
          "Single argument: parentheses optional",
          "No arguments: parentheses required",
          "Multiline: curly braces + explicit return",
          "Shorter syntax than function expressions",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 17,
      },
      {
        name: "Lesson 18: Code Quality (Debugging & Style)",
        content: `# Code Quality (Debugging & Style)

## Focus
Finding errors and writing readable code.

## Lesson Content

**Debugging**: The art of fixing errors.

**Sources**: Syntax errors (typos) vs. Logic errors (wrong math).

**The debugger command**: Placing debugger; in your code pauses execution if the developer tools are open.

**Chrome DevTools**: The "Sources" tab allows you to step through code line-by-line, watch variables, and see the "Call Stack".

## Coding Style

- Use camelCase.
- Spaces around operators (x = y + 1, not x=y+1).
- Proper indentation (usually 2 or 4 spaces).

## Comments

**Good comments** explain why, not what.

**Bad**: // This adds a and b.

**Good**: // Uses a recursive algorithm because X....

## Examples

\`\`\`javascript
// Good style
function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price;
  }
  return total;
}

// Using debugger
function findBug() {
  let x = 10;
  debugger; // Execution pauses here
  let y = x * 2;
  return y;
}
\`\`\`

## Mini Practice

1. Write a script with a purposeful bug (e.g., infinite loop or wrong math).

2. Add debugger; before the bug.

3. Open Chrome DevTools (F12), run the code, and use the "Step Over" button.

## Coding Tasks

**Task 1**: Take a "messy" code snippet (no spaces, bad indentation) and rewrite it using "The Art of Programming" style guide.

**Task 2**: Write a function pow(x, n) but introduce a logic error (e.g., use + instead of *). Use the debugger to find it.`,
        contentArray: [
          "Debugging: finding and fixing errors",
          "Syntax errors vs logic errors",
          "debugger; pauses execution",
          "Chrome DevTools Sources tab for debugging",
          "Coding style: camelCase, spaces, indentation",
          "Good comments explain why, not what",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 18,
      },
      {
        name: "Lesson 19: Objects I (Basics)",
        content: `# Objects I (Basics)

## Focus
Storing collections of data.

## Lesson Content

**Object Literal**: let user = { name: "John", age: 30 };.

**Properties**: A key:value pair. Key is always a string (or Symbol). Value can be anything.

**Access**:
- Dot notation: user.name (Key must be a valid variable identifier).
- Square brackets: user["name"] (Key can be any string, e.g., "likes birds").

**Computed Properties**: let key = "age"; let user = { [key]: 30 };.

**Property Shorthand**: function makeUser(name, age) { return { name, age }; } (instead of name: name).

**delete**: Removes a property. delete user.age.

**in operator**: Checks existence. "age" in user returns true.

## Examples

\`\`\`javascript
// Object literal
let user = {
  name: "John",
  age: 30,
  "likes coding": true
};

// Access
console.log(user.name);              // "John" (dot notation)
console.log(user["likes coding"]);  // true (bracket notation)

// Computed properties
let key = "age";
let person = { [key]: 30 };

// Property shorthand
function makeUser(name, age) {
  return { name, age }; // Same as { name: name, age: age }
}

// Checking existence
console.log("age" in user); // true
console.log("address" in user); // false

// Deleting
delete user.age;
\`\`\`

## Mini Practice

1. Create an object me with name, age, and "likes coding".

2. Log me["likes coding"].

3. Check if "address" exists in your object using in.

## Coding Tasks

**Task 1**: Write a function isEmpty(obj) which returns true if the object has no properties, false otherwise.

**Task 2**: Create an object with salaries: let salaries = { John: 100, Ann: 160, Pete: 130 };. Write a loop to sum them all.`,
        contentArray: [
          "Object literal: { key: value }",
          "Access: user.name (dot) or user['name'] (bracket)",
          "Computed properties: { [key]: value }",
          "Property shorthand: { name, age }",
          "delete: removes property",
          "in operator: checks property existence",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 19,
      },
      {
        name: "Lesson 20: Objects II (References)",
        content: `# Objects II (References)

## Focus
How objects are stored in memory (Crucial concept).

## Lesson Content

**Primitives**: Copied by value. a = 5; b = a. If a changes, b does not.

**Objects**: Stored by reference.

The variable doesn't store the object; it stores the address (reference) to the object in memory.

let user = {name: "John"}; let admin = user;

If you change admin.name, user.name also changes! They look at the same object.

**Comparison**: {} == {} is false. Two distinct objects are never equal, even if they are empty. They have different memory addresses.

**Const Objects**: const user = {name: "John"}. You can change user.name. You cannot do user = ... (reassign the variable).

## Examples

\`\`\`javascript
// Primitives (copied by value)
let a = 5;
let b = a;
a = 10;
console.log(b); // 5 (unchanged)

// Objects (copied by reference)
let user = { name: "John" };
let admin = user;
admin.name = "Jane";
console.log(user.name); // "Jane" (changed!)

// Comparison
let obj1 = {};
let obj2 = {};
console.log(obj1 == obj2); // false (different references)

// Const objects
const person = { name: "John" };
person.name = "Jane"; // OK - can change properties
// person = {}; // Error - cannot reassign
\`\`\`

## Mini Practice

1. Create object a. Let b = a. Change a property in b. Log a.

2. Compare let a = {}; let b = {}; alert(a == b).

## Coding Tasks

**Task 1**: Create an object calculator with three methods: read() (prompts for two values), sum(), and mul(). (This requires this keyword - a teaser for Intermediate!).

**Task 2**: Create a function multiplyNumeric(obj) that multiplies all numeric properties of obj by 2.`,
        contentArray: [
          "Primitives: copied by value",
          "Objects: stored by reference",
          "Copying object variable copies reference, not data",
          "Two distinct objects never equal (different references)",
          "const objects: can change properties, cannot reassign variable",
        ],
        type: "Text",
        duration: 60,
        points: 100,
        order: 20,
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

    // Create quizzes for all lessons (every lesson gets a quiz)
    const quizLessons = Array.from({ length: lessons.length }, (_, i) => i); // All lesson indices (0-19)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let questions: any[] = [];
      
      // Helper function to add coding questions with difficulty levels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Generate generic but relevant MCQ questions for all other lessons
        // Create 8 MCQ questions based on lesson content
        questions = [];
        
        // Create 8 relevant MCQ questions for each lesson
        const questionTemplates = [
          {
            questionText: `Which of the following is a key topic covered in "${lesson.name}"?`,
            options: [
              { id: "opt1", type: "mcq", content: "A fundamental concept from this lesson" },
              { id: "opt2", type: "mcq", content: "An advanced topic not covered yet" },
              { id: "opt3", type: "mcq", content: "A topic from a different lesson" },
            ],
            answer: { type: "mcq", content: "A fundamental concept from this lesson", optionId: "opt1" },
            explanation: `This question tests your understanding of the main topics in ${lesson.name}.`,
          },
          {
            questionText: `In "${lesson.name}", what is the primary focus?`,
            options: [
              { id: "opt1", type: "mcq", content: "Understanding core JavaScript concepts" },
              { id: "opt2", type: "mcq", content: "Advanced programming techniques" },
              { id: "opt3", type: "mcq", content: "Framework-specific knowledge" },
            ],
            answer: { type: "mcq", content: "Understanding core JavaScript concepts", optionId: "opt1" },
            explanation: `This lesson focuses on fundamental JavaScript concepts essential for beginners.`,
          },
          {
            questionText: `What should you practice after completing "${lesson.name}"?`,
            options: [
              { id: "opt1", type: "mcq", content: "Apply the concepts through coding exercises" },
              { id: "opt2", type: "mcq", content: "Skip to advanced topics" },
              { id: "opt3", type: "mcq", content: "Move to a different programming language" },
            ],
            answer: { type: "mcq", content: "Apply the concepts through coding exercises", optionId: "opt1" },
            explanation: "Practice is essential to master the concepts covered in this lesson.",
          },
          {
            questionText: `Which statement best describes "${lesson.name}"?`,
            options: [
              { id: "opt1", type: "mcq", content: "It covers important JavaScript fundamentals" },
              { id: "opt2", type: "mcq", content: "It is optional for beginners" },
              { id: "opt3", type: "mcq", content: "It only applies to advanced developers" },
            ],
            answer: { type: "mcq", content: "It covers important JavaScript fundamentals", optionId: "opt1" },
            explanation: `This lesson is part of the core JavaScript beginner curriculum.`,
          },
          {
            questionText: `What is the best way to learn from "${lesson.name}"?`,
            options: [
              { id: "opt1", type: "mcq", content: "Read the content, practice examples, and complete exercises" },
              { id: "opt2", type: "mcq", content: "Skip the examples and go straight to coding" },
              { id: "opt3", type: "mcq", content: "Only read the theory without practicing" },
            ],
            answer: { type: "mcq", content: "Read the content, practice examples, and complete exercises", optionId: "opt1" },
            explanation: "Active learning through reading, practicing, and completing exercises is the most effective approach.",
          },
          {
            questionText: `After "${lesson.name}", what should you do next?`,
            options: [
              { id: "opt1", type: "mcq", content: "Complete the quiz and move to the next lesson" },
              { id: "opt2", type: "mcq", content: "Skip the quiz and jump ahead" },
              { id: "opt3", type: "mcq", content: "Review previous lessons only" },
            ],
            answer: { type: "mcq", content: "Complete the quiz and move to the next lesson", optionId: "opt1" },
            explanation: "Completing the quiz helps reinforce your understanding before moving forward.",
          },
          {
            questionText: `What type of knowledge does "${lesson.name}" provide?`,
            options: [
              { id: "opt1", type: "mcq", content: "Practical JavaScript skills" },
              { id: "opt2", type: "mcq", content: "Theoretical concepts only" },
              { id: "opt3", type: "mcq", content: "Framework-specific knowledge" },
            ],
            answer: { type: "mcq", content: "Practical JavaScript skills", optionId: "opt1" },
            explanation: "This lesson provides practical skills that you can apply in real JavaScript programming.",
          },
          {
            questionText: `How important is "${lesson.name}" for JavaScript beginners?`,
            options: [
              { id: "opt1", type: "mcq", content: "Very important - it's part of the core curriculum" },
              { id: "opt2", type: "mcq", content: "Optional - can be skipped" },
              { id: "opt3", type: "mcq", content: "Only for advanced learners" },
            ],
            answer: { type: "mcq", content: "Very important - it's part of the core curriculum", optionId: "opt1" },
            explanation: `This lesson is essential for building a strong foundation in JavaScript.`,
          },
        ];
        
        // Add all 8 questions
        questionTemplates.forEach((template, index) => {
          questions.push({
            questionText: template.questionText,
            type: "mcq",
            quizId: quiz._id,
            lessonId: lesson._id,
            moduleId: jsModule._id,
            points: 10,
            order: index + 1,
            options: template.options,
            answer: template.answer,
            explanation: template.explanation,
          });
        });
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

