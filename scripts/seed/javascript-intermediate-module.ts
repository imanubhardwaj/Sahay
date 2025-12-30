import connectDB from "../../src/lib/mongodb";
import Module from "../../src/models/Module";
import Lesson from "../../src/models/Lesson";
import Quiz from "../../src/models/Quiz";
import Question from "../../src/models/Question";
import Skill from "../../src/models/Skill";

// Lesson data with content, practice questions, and quiz questions
const intermediateLessons = [
  {
    order: 1,
    name: "Numbers & Primitives",
    content: `# Numbers & Primitives

## Primitives as Objects
Primitives (string, number, boolean) are simple values, but JavaScript allows you to access methods on them (e.g., str.toUpperCase()). It creates a temporary "wrapper object" that provides the method, then destroys it.

\`\`\`javascript
let str = "Hello";
str.toUpperCase(); // JavaScript creates a temporary String object
\`\`\`

## Numbers
JS numbers are 64-bit floating point (IEEE-754). This causes precision issues (e.g., 0.1 + 0.2 !== 0.3).

### Number Methods
- \`num.toString(base)\`: Convert to string (base 2 for binary, 16 for hex)
- \`Math.floor()\`, \`Math.ceil()\`, \`Math.round()\`, \`Math.trunc()\`: Rounding methods
- \`num.toFixed(n)\`: Rounds to n digits and returns a string

### Imprecise Calculations
\`\`\`javascript
0.1 + 0.2 == 0.30000000000000004 // true
// Solution: +sum.toFixed(2)
\`\`\`

### Parsing
- \`parseInt("100px")\` -> 100
- \`parseFloat("12.5em")\` -> 12.5

### Math Object
- \`Math.random()\`: Returns random number between 0 and 1
- \`Math.max()\`, \`Math.min()\`: Find max/min values
- \`Math.pow()\`: Exponentiation

## Mini Practice
1. Calculate the sum of 0.1 + 0.2 and use toFixed(1) to make it "0.3"
2. Use parseInt to extract the number from the string "120px"
3. Generate a random number between 0 and 1 using Math.random()`,
    practiceQuestions: [
      "Calculate the sum of 0.1 + 0.2 and use toFixed(1) to make it '0.3'",
      "Use parseInt to extract the number from the string '120px'",
      "Generate a random number between 0 and 1 using Math.random()",
    ],
    quizQuestions: [
      {
        questionText: "What is 0.1 + 0.2 == 0.3?",
        options: ["true", "false"],
        correctAnswer: 1,
        explanation:
          "Due to floating-point precision, 0.1 + 0.2 equals approximately 0.30000000000000004, not exactly 0.3.",
      },
      {
        questionText:
          "Which method returns a string representation with fixed decimals?",
        options: ["round()", "toFixed()", "precision()"],
        correctAnswer: 1,
        explanation:
          "toFixed(n) rounds to n decimal places and returns a string.",
      },
      {
        questionText: "What does parseInt('12px') return?",
        options: ["12", "NaN", "'12px'"],
        correctAnswer: 0,
        explanation:
          "parseInt extracts the numeric part from the beginning of the string.",
      },
      {
        questionText: "What does parseInt('a12') return?",
        options: ["12", "NaN", "0"],
        correctAnswer: 1,
        explanation:
          "parseInt returns NaN when it cannot parse a number from the start of the string.",
      },
      {
        questionText: "Which rounds DOWN to the nearest integer?",
        options: ["Math.ceil", "Math.floor", "Math.round"],
        correctAnswer: 1,
        explanation: "Math.floor() rounds down to the nearest integer.",
      },
      {
        questionText: "What is isFinite('15')?",
        options: ["true (it converts to number)", "false"],
        correctAnswer: 0,
        explanation:
          "isFinite converts the string to a number first, then checks if it's finite.",
      },
      {
        questionText: "What is the internal storage format of JS numbers?",
        options: ["Integer", "64-bit Float", "32-bit Float"],
        correctAnswer: 1,
        explanation:
          "JavaScript uses IEEE-754 double precision (64-bit floating point) for all numbers.",
      },
      {
        questionText: "How do you write 1 billion succinctly?",
        options: ["1bn", "1e9", "10^9"],
        correctAnswer: 1,
        explanation: "1e9 is scientific notation for 1 billion (1 × 10^9).",
      },
      {
        questionText: "What does Math.random() return?",
        options: ["Integer 0-100", "Float between 0 and 1", "Any integer"],
        correctAnswer: 1,
        explanation:
          "Math.random() returns a floating-point number between 0 (inclusive) and 1 (exclusive).",
      },
      {
        questionText:
          "Do primitive values actually have methods stored in them?",
        options: ["Yes", "No, a temporary wrapper object is created"],
        correctAnswer: 1,
        explanation:
          "Primitives don't have methods. JavaScript creates a temporary wrapper object, calls the method, then discards it.",
      },
    ],
    codingChallenge:
      "Task 1: Create a function randomInteger(min, max) that generates a random integer from min to max (inclusive). Task 2: Write a script that prompts the user for two numbers and adds them. If the user enters text like '100px', it should still work (use parseFloat). If the result is not a number, alert 'Error'.",
    points: 32,
    duration: 30,
  },
  {
    order: 2,
    name: "Strings",
    content: `# Strings

## Immutability
Strings cannot be changed. You can only create new strings. \`str[0] = 'A'\` works but doesn't change the string.

\`\`\`javascript
let s = "hello";
s[0] = 'H'; // Doesn't work
console.log(s); // Still "hello"
\`\`\`

## Length
\`str.length\` - Returns the number of characters

## Access
- \`str[0]\` - Access by index
- \`str.charAt(0)\` - Alternative method

## Searching
- \`str.indexOf(text, pos)\`: Returns position or -1
- \`str.includes(text)\`: Returns true/false
- \`str.startsWith()\`, \`str.endsWith()\`: Check prefix/suffix

## Slicing (Extracting)
- \`str.slice(start, end)\`: Returns part of the string. Allows negatives (count from end). Best practice.
- \`str.substring(start, end)\`: Similar, but swaps start/end if start>end. No negatives.
- \`str.substr(start, length)\`: Legacy method.

## Case
- \`toLowerCase()\`: Convert to lowercase
- \`toUpperCase()\`: Convert to uppercase

## Mini Practice
1. Check if "Widget with id" includes "Widget"
2. Extract "id" from "Widget with id" using slice
3. Try to change the first letter of let s = "hello" to 'H' directly (s[0] = 'H'). Log s to see if it changed.`,
    practiceQuestions: [
      "Check if 'Widget with id' includes 'Widget'",
      "Extract 'id' from 'Widget with id' using slice",
      "Try to change the first letter of let s = 'hello' to 'H' directly (s[0] = 'H'). Log s to see if it changed.",
    ],
    quizQuestions: [
      {
        questionText: "Can you change a character in a string directly?",
        options: ["Yes", "No (Strings are immutable)"],
        correctAnswer: 1,
        explanation:
          "Strings are immutable in JavaScript. You can only create new strings.",
      },
      {
        questionText: "Which property gives string length?",
        options: ["size", "length", "count"],
        correctAnswer: 1,
        explanation:
          "The length property returns the number of characters in a string.",
      },
      {
        questionText: "What does indexOf return if not found?",
        options: ["0", "null", "-1", "false"],
        correctAnswer: 2,
        explanation: "indexOf returns -1 when the substring is not found.",
      },
      {
        questionText: "'Hello'.slice(1, 3) returns:",
        options: ["'He'", "'el'", "'ell'"],
        correctAnswer: 1,
        explanation:
          "slice(1, 3) extracts characters from index 1 to 3 (exclusive), so 'el'.",
      },
      {
        questionText: "'Hello'.slice(-1) returns:",
        options: ["'H'", "'o' (last char)", "Error"],
        correctAnswer: 1,
        explanation:
          "Negative indices count from the end. slice(-1) gets the last character.",
      },
      {
        questionText: "Which is modern: includes or indexOf?",
        options: ["indexOf", "includes"],
        correctAnswer: 1,
        explanation:
          "includes() is more modern and readable for simple existence checks.",
      },
      {
        questionText: "What is the difference between slice and substring?",
        options: ["slice supports negatives", "substring supports negatives"],
        correctAnswer: 0,
        explanation: "slice() supports negative indices, substring() does not.",
      },
      {
        questionText: "How to trim spaces from start/end?",
        options: ["strip()", "trim()", "cut()"],
        correctAnswer: 1,
        explanation: "trim() removes whitespace from both ends of a string.",
      },
      {
        questionText: "'a' > 'Z' is...",
        options: ["true", "false (Unicode order)"],
        correctAnswer: 0,
        explanation:
          "In Unicode, lowercase letters come after uppercase letters, so 'a' > 'Z' is true.",
      },
      {
        questionText: "How do you perform a correct locale-aware comparison?",
        options: ["a > b", "a.localeCompare(b)"],
        correctAnswer: 1,
        explanation: "localeCompare() performs locale-aware string comparison.",
      },
    ],
    codingChallenge:
      "Task 1: Write a function checkSpam(str) that returns true if str contains 'viagra' or 'XXX' (case-insensitive). Task 2: Write a function truncate(str, maxlength) that checks the length of the string. If it exceeds maxlength, replace the end of str with '...' so the length matches maxlength.",
    points: 32,
    duration: 30,
  },
  {
    order: 3,
    name: "Arrays I (Basic Methods)",
    content: `# Arrays I (Basic Methods)

## Queue/Stack Operations
Arrays work as Deque (Double ended queue).

### End Operations (Fast)
- \`push()\`: Add to end
- \`pop()\`: Remove from end

### Start Operations (Slow - reindexes everything)
- \`shift()\`: Remove from start
- \`unshift()\`: Add to start

## Splice
The "Swiss Army Knife" for arrays. \`arr.splice(index, deleteCount, elem1, ...)\`
- Can add, remove, and replace
- Modifies array in-place

\`\`\`javascript
let arr = [1, 2, 3];
arr.splice(1, 1, 'a', 'b'); // Remove 1 element at index 1, add 'a' and 'b'
// Result: [1, 'a', 'b', 3]
\`\`\`

## Slice
\`arr.slice(start, end)\`: Creates a new subarray (doesn't modify original)

## Concat
\`arr.concat(arg1, arg2)\`: Joins arrays

## ForEach
\`arr.forEach((item, index, array) => { ... })\`: Iterates elements. Cannot break.

## Mini Practice
1. Create an array ["I", "study", "JavaScript"]. Use splice to remove "study".
2. Use slice to copy the whole array.
3. Iterate over ["Bilbo", "Gandalf"] using forEach and alert each name.`,
    practiceQuestions: [
      "Create an array ['I', 'study', 'JavaScript']. Use splice to remove 'study'.",
      "Use slice to copy the whole array.",
      "Iterate over ['Bilbo', 'Gandalf'] using forEach and alert each name.",
    ],
    quizQuestions: [
      {
        questionText: "Which method modifies the array in-place?",
        options: ["slice", "splice", "concat"],
        correctAnswer: 1,
        explanation:
          "splice() modifies the original array, while slice() and concat() return new arrays.",
      },
      {
        questionText: "Which operation is slower?",
        options: ["push", "shift (removes first)"],
        correctAnswer: 1,
        explanation:
          "shift() is slower because it needs to reindex all elements.",
      },
      {
        questionText: "Does forEach return a new array?",
        options: ["Yes", "No, it returns undefined"],
        correctAnswer: 1,
        explanation:
          "forEach() returns undefined. Use map() if you need a new array.",
      },
      {
        questionText: "How to remove the 2nd element?",
        options: ["delete arr[1] (leaves a hole)", "arr.splice(1, 1)"],
        correctAnswer: 1,
        explanation:
          "splice(1, 1) properly removes the element and reindexes the array.",
      },
      {
        questionText: "What does arr.push(1) return?",
        options: ["The new array", "The new length"],
        correctAnswer: 1,
        explanation: "push() returns the new length of the array.",
      },
      {
        questionText: "Can you resize an array by setting arr.length = 0?",
        options: ["Yes (It clears it)", "No"],
        correctAnswer: 0,
        explanation: "Setting length to 0 clears the array.",
      },
      {
        questionText: "arr.at(-1) gets:",
        options: ["First item", "Last item", "Error"],
        correctAnswer: 1,
        explanation:
          "at(-1) gets the last element, similar to arr[arr.length - 1].",
      },
      {
        questionText: "Can slice take negative arguments?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation: "slice() supports negative indices to count from the end.",
      },
      {
        questionText: "If arr = [1, 2], what is String(arr)?",
        options: ["'[1, 2]'", "'1,2'"],
        correctAnswer: 1,
        explanation: "String() converts array to comma-separated string '1,2'.",
      },
      {
        questionText: "Can you chain forEach?",
        options: ["Yes", "No (it returns undefined)"],
        correctAnswer: 1,
        explanation: "forEach() returns undefined, so it cannot be chained.",
      },
    ],
    codingChallenge:
      "Task 1: Write a function camelize(str) that changes dash-separated words like 'my-short-string' into camel-cased 'myShortString'. (Hint: split into array, map, then join). Task 2: Create a function filterRangeInPlace(arr, a, b) that gets an array arr and removes from it all values except those that are between a and b. The test is: a ≤ arr[i] ≤ b. (Use splice).",
    points: 32,
    duration: 30,
  },
  {
    order: 4,
    name: "Arrays II (High-Order Methods)",
    content: `# Arrays II (High-Order Methods)

## Find
\`arr.find(fn)\`: Returns the first object/value where the function returns true.

\`\`\`javascript
let users = [{id:1, name:"John"}, {id:2, name:"Pete"}];
users.find(u => u.id === 1); // {id:1, name:"John"}
\`\`\`

## Filter
\`arr.filter(fn)\`: Returns a new array of ALL items where function returns true.

\`\`\`javascript
[1, 5, 12, 19].filter(n => n > 10); // [12, 19]
\`\`\`

## Map
\`arr.map(fn)\`: Returns a new array of results of calling fn on every element. Transform data.

\`\`\`javascript
["Bilbo", "Gandalf"].map(name => name.length); // [5, 7]
\`\`\`

## Sort
\`arr.sort(fn)\`: Sorts in-place.

**Important**: Default sort converts to string! \`[1, 15, 2].sort()\` becomes \`[1, 15, 2]\` (lexicographical).

Use numeric comparator: \`(a, b) => a - b\`

## Reduce
\`arr.reduce((acc, item) => ..., initial)\`: Calculates a single value based on the array.

\`\`\`javascript
[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6
\`\`\`

## Split/Join
String <-> Array conversion:
- \`str.split(',')\`: String to array
- \`arr.join(';')\`: Array to string`,
    practiceQuestions: [
      "let users = [{id:1, name:'John'}, {id:2, name:'Pete'}]. Use find to get the object with id 1.",
      "Use filter to get numbers > 10 from [1, 5, 12, 19].",
      "Use map to turn ['Bilbo', 'Gandalf'] into lengths [5, 7].",
    ],
    quizQuestions: [
      {
        questionText: "Does map modify the original array?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation:
          "map() returns a new array without modifying the original.",
      },
      {
        questionText: "What does find return if no match?",
        options: ["null", "undefined", "[]"],
        correctAnswer: 1,
        explanation:
          "find() returns undefined when no element matches the condition.",
      },
      {
        questionText: "What is the result of [1, 2, 15].sort()?",
        options: ["[1, 2, 15]", "[1, 15, 2] (Lexicographical)"],
        correctAnswer: 1,
        explanation:
          "Without a comparator, sort() converts to strings and sorts lexicographically.",
      },
      {
        questionText: "To sort numbers correctly, you need...",
        options: ["A compare function", "sortNumbers()", "Nothing"],
        correctAnswer: 0,
        explanation:
          "You need a compare function like (a, b) => a - b for numeric sorting.",
      },
      {
        questionText: "What is the acc in reduce?",
        options: ["Accessor", "Accumulator (result of previous call)"],
        correctAnswer: 1,
        explanation:
          "acc is the accumulator that holds the result from previous iterations.",
      },
      {
        questionText: "str.split(',') returns:",
        options: ["String", "Array", "Object"],
        correctAnswer: 1,
        explanation: "split() converts a string into an array of substrings.",
      },
      {
        questionText: "arr.join(';') returns:",
        options: ["String", "Array"],
        correctAnswer: 0,
        explanation:
          "join() converts an array into a string with the specified separator.",
      },
      {
        questionText: "Can you chain these methods? (e.g., filter().map())",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, you can chain array methods since they return arrays.",
      },
      {
        questionText: "Array.isArray({}) is:",
        options: ["true", "false"],
        correctAnswer: 1,
        explanation: "Array.isArray() returns false for objects.",
      },
      {
        questionText: "Which method is best to sum all numbers in an array?",
        options: ["map", "forEach", "reduce"],
        correctAnswer: 2,
        explanation:
          "reduce() is designed to accumulate values into a single result.",
      },
    ],
    codingChallenge:
      "Task 1: You have an array of user objects {name: '...', age: ...}. Write code that creates an array of names from it (using map). Task 2: Write the function sortByAge(users) that gets an array of objects with the age property and sorts them by age.",
    points: 33,
    duration: 35,
  },
  {
    order: 5,
    name: "Keyed Collections (Map & Set)",
    content: `# Keyed Collections (Map & Set)

## Map
A collection of keyed data items, like an Object. But keys can be any type (even objects).

\`\`\`javascript
let map = new Map();
map.set(key, value);
map.get(key);
map.has(key);
\`\`\`

**Features:**
- Preserves insertion order
- Keys can be any type (objects, functions, primitives)
- Has a \`size\` property

## Set
A collection of unique values. No duplicates.

\`\`\`javascript
let set = new Set();
set.add(value);
set.delete(value);
set.has(value);
\`\`\`

**Features:**
- Only stores unique values
- Preserves insertion order
- Has a \`size\` property

## Iterables
\`Object.entries(obj)\` creates an iterable from an object to use with Map.

\`\`\`javascript
let map = new Map(Object.entries({name: "John", age: 30}));
\`\`\`

## WeakMap/WeakSet
- Don't prevent garbage collection
- Used for caching or storing data for objects managed by another script
- Keys must be objects
- Not iterable`,
    practiceQuestions: [
      "Create a Map. Use an object {name: 'John'} as a key.",
      "Create a Set. Add values 1, 2, 2, 3. Check the size (Should be 3).",
    ],
    quizQuestions: [
      {
        questionText: "Can an Object key be a number in a standard Object?",
        options: ["Yes", "No, it converts to string"],
        correctAnswer: 1,
        explanation: "Object keys are always converted to strings.",
      },
      {
        questionText: "Can a Map key be a number?",
        options: ["Yes, type is preserved", "No, converts to string"],
        correctAnswer: 0,
        explanation:
          "Map preserves the type of keys, so numbers remain numbers.",
      },
      {
        questionText: "Does a Set allow duplicates?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation: "Set only stores unique values, duplicates are ignored.",
      },
      {
        questionText: "How do you check size of Map/Set?",
        options: [".length", ".size", ".count"],
        correctAnswer: 1,
        explanation: "Map and Set use the size property, not length.",
      },
      {
        questionText: "Is Map iterable?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation: "Map is iterable and can be used with for...of loops.",
      },
      {
        questionText: "What happens if you add the same value to a Set twice?",
        options: ["Error", "Nothing happens"],
        correctAnswer: 1,
        explanation: "Adding a duplicate value to a Set is silently ignored.",
      },
      {
        questionText: "Main use case for WeakMap?",
        options: ["Extra memory", "Caching/Side-data without memory leaks"],
        correctAnswer: 1,
        explanation:
          "WeakMap allows garbage collection of keys, preventing memory leaks.",
      },
      {
        questionText: "Does WeakMap support iteration (looping)?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation:
          "WeakMap is not iterable because keys can be garbage collected.",
      },
      {
        questionText: "Method to remove all elements from a Map?",
        options: ["delete()", "clear()", "empty()"],
        correctAnswer: 1,
        explanation: "clear() removes all key-value pairs from a Map.",
      },
      {
        questionText: "Object.fromEntries does what?",
        options: ["Map -> Object", "Object -> Map"],
        correctAnswer: 0,
        explanation:
          "Object.fromEntries() converts a Map or array of entries to an object.",
      },
    ],
    codingChallenge:
      "Task 1: Let arr = ['nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares'];. Write a function aclean(arr) that returns an array cleaned from anagrams. (Hint: Sort letters to make a Map key). Task 2: Create a function unique(arr) that returns an array with unique items using Set.",
    points: 32,
    duration: 30,
  },
  {
    order: 6,
    name: "Destructuring Assignment",
    content: `# Destructuring Assignment

## Array Destructuring
\`\`\`javascript
let [a, b] = ["Hello", "World"];
\`\`\`

### Skip items
\`\`\`javascript
let [,,title] = arr;
\`\`\`

### Rest
\`\`\`javascript
let [name1, name2, ...rest] = names;
\`\`\`

## Object Destructuring
\`\`\`javascript
let {var1, var2} = {var1:..., var2:...};
\`\`\`

### Renaming
\`\`\`javascript
let {width: w, height: h} = options;
\`\`\`

### Defaults
\`\`\`javascript
let {width = 100} = options;
\`\`\`

## Nested Destructuring
Unpacking complex structures:

\`\`\`javascript
let {user: {name, age}} = {user: {name: "John", age: 30}};
\`\`\`

## Smart Function Parameters
\`\`\`javascript
function showMenu({title = "Menu", width = 100, height = 200}) {
  // ...
}
\`\`\`

Pass an object, get variables.`,
    practiceQuestions: [
      "Destructure user = { name: 'John', years: 30 } into variables name and age.",
      "Swap variables a and b using destructuring: [a, b] = [b, a].",
    ],
    quizQuestions: [
      {
        questionText: "Does destructuring delete the original array/object?",
        options: ["Yes", "No, it just copies values"],
        correctAnswer: 1,
        explanation:
          "Destructuring only extracts values, it doesn't modify the original.",
      },
      {
        questionText: "let [a, b] = [1] -> what is b?",
        options: ["null", "undefined", "0"],
        correctAnswer: 1,
        explanation:
          "If there's no value to destructure, the variable becomes undefined.",
      },
      {
        questionText: "How to set a default value?",
        options: ["[a:1] = []", "[a=1] = []"],
        correctAnswer: 1,
        explanation: "Use = to set default values: [a=1] = []",
      },
      {
        questionText: "Syntax to capture remaining items?",
        options: ["&rest", "...rest", "$rest"],
        correctAnswer: 1,
        explanation: "Use ...rest to capture remaining items in destructuring.",
      },
      {
        questionText: "Can you destructure inside a function argument?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, destructuring in function parameters is a common pattern.",
      },
      {
        questionText: "let {w} = {width: 10} -> what is w?",
        options: ["10", "undefined (Key name must match, or be renamed)"],
        correctAnswer: 1,
        explanation:
          "The variable name must match the key name, or you need to rename it.",
      },
      {
        questionText: "let {width: w} = {width: 10} -> what is w?",
        options: ["10", "undefined"],
        correctAnswer: 0,
        explanation:
          "Renaming syntax {width: w} extracts width and assigns it to w.",
      },
      {
        questionText: "Order matters in...",
        options: ["Object destructuring", "Array destructuring"],
        correctAnswer: 1,
        explanation:
          "Array destructuring is positional, object destructuring is by key name.",
      },
      {
        questionText: "Can you destructure nested objects?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, nested destructuring is supported for both arrays and objects.",
      },
      {
        questionText: "Is let [a, b, c] = 'abc' valid?",
        options: ["Yes (Strings are iterable)", "No"],
        correctAnswer: 0,
        explanation:
          "Strings are iterable, so you can destructure them into arrays.",
      },
    ],
    codingChallenge:
      "Task 1: We have an object: let salaries = { 'John': 100, 'Pete': 300, 'Mary': 250 };. Create a function topSalary(salaries) that returns the name of the top-paid person using Object.entries and destructuring. Task 2: Write a function that accepts an object options, but only extracts title and width variables, setting a default width of 100 if missing.",
    points: 32,
    duration: 30,
  },
  {
    order: 7,
    name: "Date & Time",
    content: `# Date & Time

## Creation
- \`new Date()\`: Current date/time
- \`new Date("2025-01-01")\`: From string
- \`new Date(year, month, date, hours...)\`: From components

**Important**: Month counts from 0 (Jan is 0)!

\`\`\`javascript
new Date(2025, 0, 1); // January 1, 2025
new Date(2025, 1, 1); // February 1, 2025
\`\`\`

## Methods
- \`getFullYear()\`: Get year (4 digits)
- \`getMonth()\`: Get month (0-11)
- \`getDate()\`: Day of month (1-31)
- \`getDay()\`: Day of week (0-6, Sunday = 0)
- \`getHours()\`: Hours (0-23)

## Autocorrection
\`new Date(2025, 0, 32)\` becomes Feb 1st. Useful for adding days.

\`\`\`javascript
let date = new Date(2025, 0, 32);
console.log(date); // Feb 1, 2025
\`\`\`

## Performance
\`Date.now()\` returns current timestamp (number) without creating an object. Faster.

\`\`\`javascript
let start = Date.now();
// ... do something ...
let elapsed = Date.now() - start; // milliseconds
\`\`\`

## Timestamps
Date stores time as milliseconds since Jan 1, 1970 UTC (Unix epoch).`,
    practiceQuestions: [
      "Create a date object for 'Feb 20, 2012, 3:12am'.",
      "Get the current day of the week (0-6).",
    ],
    quizQuestions: [
      {
        questionText: "What is the month number for January?",
        options: ["1", "0"],
        correctAnswer: 1,
        explanation: "Months are 0-indexed in JavaScript, so January is 0.",
      },
      {
        questionText: "getDate() returns:",
        options: ["Day of week", "Day of month (1-31)"],
        correctAnswer: 1,
        explanation: "getDate() returns the day of the month (1-31).",
      },
      {
        questionText: "getDay() returns:",
        options: ["Day of week (0-6)", "Day of month"],
        correctAnswer: 0,
        explanation:
          "getDay() returns the day of the week (0 = Sunday, 6 = Saturday).",
      },
      {
        questionText: "Which method gets the year?",
        options: ["getYear()", "getFullYear()"],
        correctAnswer: 1,
        explanation:
          "getFullYear() returns the full 4-digit year. getYear() is deprecated.",
      },
      {
        questionText: "Does Date store timezone?",
        options: [
          "Yes",
          "No, it stores UTC timestamp, methods convert to local",
        ],
        correctAnswer: 1,
        explanation:
          "Date stores UTC timestamp internally, but methods return local time.",
      },
      {
        questionText: "What is a timestamp?",
        options: ["String date", "Milliseconds since 1970"],
        correctAnswer: 1,
        explanation:
          "A timestamp is milliseconds since January 1, 1970 UTC (Unix epoch).",
      },
      {
        questionText: "Result of date1 - date2?",
        options: ["Error", "Difference in milliseconds"],
        correctAnswer: 1,
        explanation: "Subtracting dates gives the difference in milliseconds.",
      },
      {
        questionText: "new Date(2025, 1, 1) is...",
        options: ["Jan 1", "Feb 1"],
        correctAnswer: 1,
        explanation:
          "Month 1 is February (0-indexed), so this is February 1st.",
      },
      {
        questionText: "How to measure how long code takes?",
        options: ["Date.now() before and after", "stopwatch()"],
        correctAnswer: 0,
        explanation:
          "Use Date.now() to get timestamps and calculate the difference.",
      },
      {
        questionText: "Date.parse takes a string format:",
        options: ["'YYYY-MM-DDTHH:mm:ss.sssZ'", "Any format"],
        correctAnswer: 0,
        explanation:
          "Date.parse() expects ISO 8601 format: 'YYYY-MM-DDTHH:mm:ss.sssZ'.",
      },
    ],
    codingChallenge:
      "Task 1: Write a function getWeekDay(date) to show the weekday in short format: 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'. Task 2: Write a function getLastDayOfMonth(year, month) that returns the last day of month. Sometimes it is 30th, 31st or even 28/29th for Feb. (Hint: create a date for the next month day 0).",
    points: 32,
    duration: 30,
  },
  {
    order: 8,
    name: "JSON (Data Formats)",
    content: `# JSON (Data Formats)

## JSON (JavaScript Object Notation)
A standard text-based format for representing structured data. It looks like a JS object but keys must be double-quoted strings.

## Serialization (JSON.stringify)
Converts a JavaScript object into a JSON string.

\`\`\`javascript
let user = { name: "John", age: 30 };
JSON.stringify(user); // '{"name":"John","age":30}'
\`\`\`

**Features:**
- Skips functions, Symbols, and undefined properties
- Supports a replacer function to filter properties

\`\`\`javascript
JSON.stringify(user, ['name']); // Only include 'name'
\`\`\`

## Parsing (JSON.parse)
Converts a JSON string back into a JavaScript object.

\`\`\`javascript
let json = '{"name":"Alice","age":25}';
let user = JSON.parse(json);
\`\`\`

**Features:**
- Supports a reviver function to transform values (e.g., converting date strings back to real Date objects)

## Usage
Essential for APIs (sending/receiving data from a server).`,
    practiceQuestions: [
      "Create an object user = { name: 'John', age: 30 }. Convert it to a JSON string.",
      'Take the string \'{"name":"Alice","age":25}\' and convert it back to an object.',
    ],
    quizQuestions: [
      {
        questionText: "What does JSON stand for?",
        options: [
          "Java Standard Object Notation",
          "JavaScript Object Notation",
        ],
        correctAnswer: 1,
        explanation: "JSON stands for JavaScript Object Notation.",
      },
      {
        questionText: "Which method converts Object -> JSON?",
        options: ["JSON.to()", "JSON.parse()", "JSON.stringify()"],
        correctAnswer: 2,
        explanation:
          "JSON.stringify() converts JavaScript objects to JSON strings.",
      },
      {
        questionText: "Which method converts JSON -> Object?",
        options: ["JSON.from()", "JSON.parse()", "JSON.stringify()"],
        correctAnswer: 1,
        explanation:
          "JSON.parse() converts JSON strings to JavaScript objects.",
      },
      {
        questionText: "Are comments allowed in standard JSON?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation: "Standard JSON does not support comments.",
      },
      {
        questionText: "Which quotes must be used for keys in JSON?",
        options: ["Single '", 'Double "', "Backticks `"],
        correctAnswer: 1,
        explanation:
          "JSON requires double quotes for both keys and string values.",
      },
      {
        questionText: "What happens to functions when stringifying an object?",
        options: [
          "They are converted to strings",
          "They are skipped/ignored",
          "Error",
        ],
        correctAnswer: 1,
        explanation:
          "Functions are skipped during JSON.stringify() because JSON doesn't support functions.",
      },
      {
        questionText: "What data type is the output of JSON.stringify?",
        options: ["Object", "String", "Binary"],
        correctAnswer: 1,
        explanation:
          "JSON.stringify() returns a string representation of the object.",
      },
      {
        questionText:
          "Can you handle circular references (A references B, B references A) in standard JSON?",
        options: ["Yes", "No, it throws an error"],
        correctAnswer: 1,
        explanation:
          "Circular references cause JSON.stringify() to throw an error.",
      },
      {
        questionText: "What is the reviver argument in JSON.parse used for?",
        options: [
          "Fixing errors",
          "Transforming values (e.g., Strings to Dates)",
        ],
        correctAnswer: 1,
        explanation:
          "The reviver function can transform values during parsing, like converting date strings to Date objects.",
      },
      {
        questionText: "Is JSON language-independent?",
        options: ["Yes, used by Python, Java, etc.", "No, only JS"],
        correctAnswer: 0,
        explanation:
          "JSON is language-independent and used by many programming languages.",
      },
    ],
    codingChallenge:
      "Task 1: Turn the object user = { name: 'John Smith', age: 35 } into JSON and back into a new variable user2. Task 2: Write a replacer function for JSON.stringify that removes properties named 'password' from the output.",
    points: 32,
    duration: 30,
  },
  {
    order: 9,
    name: "Recursion",
    content: `# Recursion

## Concept
A function calls itself to solve a smaller instance of the problem.

\`\`\`javascript
function factorial(n) {
  if (n === 0) return 1; // Base case
  return n * factorial(n - 1); // Recursive step
}
\`\`\`

## Base Case
The condition to stop recursion. Without it, you get infinite recursion.

## Recursive Step
The logic where the function calls itself with a smaller problem.

## The Stack
Every function call uses memory (Execution Context). Deep recursion can cause a "Stack Overflow" error.

## Traversal
Recursion is perfect for traversing tree-like structures (e.g., file folders, HTML DOM, organizational charts).

\`\`\`javascript
function traverseTree(node) {
  console.log(node.value);
  node.children.forEach(child => traverseTree(child));
}
\`\`\`

## Recursion vs. Loops
Anything done with recursion can be done with a loop (iteration), but recursion is often cleaner for complex structures.`,
    practiceQuestions: [
      "Write a recursive function pow(x, n) that calculates x to the power of n.",
      "Identify the base case in your function.",
    ],
    quizQuestions: [
      {
        questionText: "What is a recursive function?",
        options: ["A function that loops", "A function that calls itself"],
        correctAnswer: 1,
        explanation:
          "A recursive function calls itself to solve smaller instances of the problem.",
      },
      {
        questionText: "What is a 'Base Case'?",
        options: ["The initial value", "The condition to stop recursion"],
        correctAnswer: 1,
        explanation: "The base case is the condition that stops the recursion.",
      },
      {
        questionText: "What happens if you forget the base case?",
        options: ["Syntax Error", "Infinite loop / Stack Overflow"],
        correctAnswer: 1,
        explanation:
          "Without a base case, recursion continues infinitely until stack overflow.",
      },
      {
        questionText: "Which uses more memory usually?",
        options: ["Loops", "Recursion (due to stack contexts)"],
        correctAnswer: 1,
        explanation:
          "Recursion uses stack memory for each call, which can be more memory-intensive.",
      },
      {
        questionText: "What data structure is best traversed recursively?",
        options: ["Simple Array", "Tree / Nested Objects"],
        correctAnswer: 1,
        explanation:
          "Trees and nested structures are naturally traversed with recursion.",
      },
      {
        questionText: "What is the 'Execution Context'?",
        options: [
          "The variable scope",
          "Internal data structure storing function details",
        ],
        correctAnswer: 1,
        explanation:
          "Execution context stores function details, variables, and the call stack.",
      },
      {
        questionText: "Maximum recursion depth in browsers is roughly...",
        options: ["10", "100", "10,000", "Infinite"],
        correctAnswer: 2,
        explanation:
          "Most browsers limit recursion depth to around 10,000 calls.",
      },
      {
        questionText: "Can you rewrite any recursion as a loop?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, any recursive algorithm can be converted to an iterative one.",
      },
      {
        questionText: "What is a 'Tail Call Optimization'?",
        options: [
          "Removing unused variables",
          "Engine optimization to save stack space (rarely supported)",
        ],
        correctAnswer: 1,
        explanation:
          "Tail call optimization reuses stack frames, but it's rarely supported in JavaScript.",
      },
      {
        questionText: "Is 5! (Factorial) a good candidate for recursion?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Factorial is a classic recursive problem with a clear base case.",
      },
    ],
    codingChallenge:
      "Task 1: Write a function sumTo(n) that calculates the sum of numbers 1 + 2 + ... + n using recursion. Task 2: Calculate Fibonacci numbers fib(n) where fib(n) = fib(n-1) + fib(n-2). (Note: This is slow without optimization, but good for practice).",
    points: 32,
    duration: 35,
  },
  {
    order: 10,
    name: "Rest Parameters & Spread",
    content: `# Rest Parameters & Spread

## Rest Parameters (...args)
Collects "the rest" of the arguments into an array.

\`\`\`javascript
function sumAll(...args) {
  return args.reduce((sum, num) => sum + num, 0);
}
sumAll(1, 2, 3, 4); // 10
\`\`\`

**Rules:**
- Must be the last parameter
- \`function(a, b, ...others)\`

## The arguments object
An old-school array-like object containing all arguments. Does not work in Arrow Functions. Prefer \`...args\`.

## Spread Syntax (...)
The opposite of Rest. It expands an array into a list of arguments.

\`\`\`javascript
Math.max(...[1, 2, 3]); // 3
Math.max([1, 2, 3]); // NaN (expects numbers, not array)
\`\`\`

## Copying arrays/objects
\`let copy = [...arr]\` - Creates a shallow copy.

\`\`\`javascript
let arr1 = [1, 2];
let arr2 = [3, 4];
let merged = [...arr1, ...arr2]; // [1, 2, 3, 4]
\`\`\`

**Shallow copy**: Nested objects/arrays are still referenced.`,
    practiceQuestions: [
      "Write a function sumAll(...args) that sums any number of arguments.",
      "Use spread to merge two arrays [1,2] and [3,4].",
    ],
    quizQuestions: [
      {
        questionText:
          "What does ... do in a function definition function(...args)?",
        options: ["Spreads array", "Collects arguments into an array (Rest)"],
        correctAnswer: 1,
        explanation:
          "In function parameters, ... collects remaining arguments into an array (Rest).",
      },
      {
        questionText: "What does ... do in a function call func(...arr)?",
        options: [
          "Spreads array into arguments (Spread)",
          "Collects arguments",
        ],
        correctAnswer: 0,
        explanation:
          "In function calls, ... spreads the array into individual arguments.",
      },
      {
        questionText: "Can ...rest be the first parameter?",
        options: ["Yes", "No, must be last"],
        correctAnswer: 1,
        explanation:
          "Rest parameters must be the last parameter in the function.",
      },
      {
        questionText: "Is arguments a real array?",
        options: ["Yes", "No, it's array-like (iterable but no map/filter)"],
        correctAnswer: 1,
        explanation:
          "arguments is array-like but not a real array, so it lacks array methods.",
      },
      {
        questionText: "Do arrow functions have arguments?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation: "Arrow functions don't have their own arguments object.",
      },
      {
        questionText: "How to copy an object obj easily?",
        options: ["obj.copy()", "{...obj}"],
        correctAnswer: 1,
        explanation:
          "Spread syntax {...obj} creates a shallow copy of the object.",
      },
      {
        questionText: "Math.max([1, 2, 3]) returns:",
        options: ["3", "NaN (Math.max expects numbers, not an array)"],
        correctAnswer: 1,
        explanation: "Math.max expects individual numbers, not an array.",
      },
      {
        questionText: "Math.max(...[1, 2, 3]) returns:",
        options: ["3", "NaN"],
        correctAnswer: 0,
        explanation:
          "Spread syntax expands the array into individual arguments.",
      },
      {
        questionText: "Is [...arr] a deep copy?",
        options: ["Yes", "No, shallow copy"],
        correctAnswer: 1,
        explanation:
          "Spread creates a shallow copy. Nested objects/arrays are still referenced.",
      },
      {
        questionText: "Can you use spread with strings?",
        options: ["Yes (\"...hi\" -> ['h', 'i'])", "No"],
        correctAnswer: 0,
        explanation:
          "Strings are iterable, so spread works: [...'hi'] = ['h', 'i'].",
      },
    ],
    codingChallenge:
      "Task 1: Write a function showName(firstName, lastName, ...titles) that alerts the name and then prints all titles in a loop. Task 2: Use the spread syntax to concatenate two arrays and then add a new element to the end, all in one line.",
    points: 32,
    duration: 30,
  },
  {
    order: 11,
    name: "Scope & Closures",
    content: `# Scope & Closures

## Scope
Variables are visible depending on where they are defined.

### Global Scope
Visible everywhere.

### Function Scope
Visible in the function.

### Block Scope
Visible in \`{ ... }\` (loops, if). Only with \`let\` and \`const\`.

## Lexical Environment
An internal object that stores local variables and function references.

## Closure
A function that "remembers" its outer variables and can access them.

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return function() {
    return count++;
  };
}
let counter = makeCounter();
counter(); // 0
counter(); // 1
\`\`\`

**In JS, all functions are naturally closures** (except \`new Function\`).

## Use Cases
- **Data privacy**: Hiding variables
- **Factory functions**: Creating functions with shared state

## Garbage Collection
A variable remains in memory as long as it is reachable. A closure keeps outer variables alive!`,
    practiceQuestions: [
      "Create a 'counter' function. makeCounter() returns a function that, when called, increments and returns a number.",
      "Test if two counters created separately share the same count or have their own.",
    ],
    quizQuestions: [
      {
        questionText: "What is a closure?",
        options: [
          "A function ending",
          "A function + its surrounding state (lexical env)",
        ],
        correctAnswer: 1,
        explanation:
          "A closure is a function that retains access to its lexical environment.",
      },
      {
        questionText:
          "If a function accesses an outer variable, where does it look?",
        options: ["Global scope only", "The outer Lexical Environment"],
        correctAnswer: 1,
        explanation:
          "Functions look in their lexical environment (where they were defined).",
      },
      {
        questionText: "Are variables in a loop block {...} visible outside?",
        options: ["Yes", "No (if using let/const)"],
        correctAnswer: 1,
        explanation:
          "Block-scoped variables (let/const) are not visible outside the block.",
      },
      {
        questionText:
          "Does a function keep outer variables in memory after the outer function finishes?",
        options: ["Yes (Closure)", "No"],
        correctAnswer: 0,
        explanation:
          "Closures keep outer variables in memory even after the outer function returns.",
      },
      {
        questionText: "Can you access a let variable before declaration?",
        options: ["Yes", "No (Dead Zone)"],
        correctAnswer: 1,
        explanation:
          "let/const variables are in a 'temporal dead zone' before declaration.",
      },
      {
        questionText: "What is the 'Global' object in browsers?",
        options: ["global", "window", "root"],
        correctAnswer: 1,
        explanation: "In browsers, the global object is 'window'.",
      },
      {
        questionText: "Why use closures?",
        options: ["To save memory", "Encapsulation / Private variables"],
        correctAnswer: 1,
        explanation:
          "Closures enable encapsulation and private variables in JavaScript.",
      },
      {
        questionText:
          "If let x = 1 inside a function, does it overwrite global x?",
        options: ["Yes", "No, it shadows it"],
        correctAnswer: 1,
        explanation:
          "Local variables shadow (hide) global variables with the same name.",
      },
      {
        questionText: "Do 'nested' functions work in JS?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, nested functions are fully supported and create closures.",
      },
      {
        questionText: "Is var block scoped?",
        options: ["Yes", "No (Function scoped)"],
        correctAnswer: 1,
        explanation: "var is function-scoped, not block-scoped like let/const.",
      },
    ],
    codingChallenge:
      "Task 1: Write function sum(a)(b) that works like this: sum(1)(2) = 3. (Hint: The first function must return a second function). Task 2: Filter through function. Make a set of 'ready to use' filters: arr.filter(inBetween(3, 6)). You need to create the function inBetween.",
    points: 33,
    duration: 35,
  },
  {
    order: 12,
    name: "The Old 'var'",
    content: `# The Old "var"

## No Block Scope
\`var\` variables declared inside \`if\` or \`for\` blocks pierce through and are visible outside. They are only contained by Functions.

\`\`\`javascript
if (true) {
  var x = 5;
}
console.log(x); // 5 (visible!)
\`\`\`

## Redeclaration
You can declare \`var x\` multiple times without error.

\`\`\`javascript
var x = 1;
var x = 2; // No error
\`\`\`

## Hoisting
\`var\` declarations are processed at function start.

\`\`\`javascript
console.log(x); // undefined (not error!)
var x = 5;
\`\`\`

The declaration is hoisted, not the assignment.

## IIFE (Immediately Invoked Function Expressions)
An old pattern \`(function() { ... })()\` used to create local scope before \`let\`/\`const\` existed.

\`\`\`javascript
(function() {
  var x = 5; // Local scope
})();
console.log(x); // Error: x is not defined
\`\`\`

## Why Avoid var Today?
Scoping rules are confusing and bug-prone. Use \`let\` and \`const\` instead.`,
    practiceQuestions: [
      "Write a loop with var i. Check the value of i after the loop. (It exists!).",
      "Try the same with let i. (Error, as expected).",
    ],
    quizQuestions: [
      {
        questionText: "Does var have block scope?",
        options: ["Yes", "No"],
        correctAnswer: 1,
        explanation: "var is function-scoped, not block-scoped.",
      },
      {
        questionText: "Does var have function scope?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation: "Yes, var is scoped to the function.",
      },
      {
        questionText: "Can you redeclare var?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation: "var allows redeclaration without error.",
      },
      {
        questionText: "What is Hoisting?",
        options: [
          "Moving declarations to the top",
          "Moving code to the bottom",
        ],
        correctAnswer: 0,
        explanation:
          "Hoisting moves variable declarations to the top of their scope.",
      },
      {
        questionText: "If you access var before definition, you get:",
        options: ["Error", "undefined"],
        correctAnswer: 1,
        explanation:
          "var declarations are hoisted, so accessing before assignment gives undefined.",
      },
      {
        questionText: "If you access let before definition, you get:",
        options: ["Error", "undefined"],
        correctAnswer: 0,
        explanation:
          "let/const throw ReferenceError if accessed before declaration (temporal dead zone).",
      },
      {
        questionText: "What is an IIFE?",
        options: ["If-If-Else", "Immediately Invoked Function Expression"],
        correctAnswer: 1,
        explanation: "IIFE is an Immediately Invoked Function Expression.",
      },
      {
        questionText: "Why do we avoid var today?",
        options: ["It's slow", "Scoping rules are confusing/bug-prone"],
        correctAnswer: 1,
        explanation: "var's scoping behavior leads to bugs and confusion.",
      },
      {
        questionText: "Is var deprecated (removed)?",
        options: ["Yes", "No, it still works"],
        correctAnswer: 1,
        explanation:
          "var is not deprecated, it still works but is not recommended.",
      },
      {
        questionText: "var variables become properties of window if global?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Global var declarations become properties of the window object.",
      },
    ],
    codingChallenge:
      "Task 1: Create an IIFE that alerts 'I am hidden' immediately. Task 2: 'Fix' a loop using var that sets timeouts. (Classic interview question). Code to fix: for (var i=0; i<3; i++) setTimeout(()=>console.log(i), 100); (Prints 3, 3, 3). Fix it to print 0, 1, 2 (using let or a closure).",
    points: 32,
    duration: 30,
  },
  {
    order: 13,
    name: "Scheduling (setTimeout/Interval)",
    content: `# Scheduling (setTimeout/Interval)

## setTimeout
\`setTimeout(func, delay, ...args)\`: Runs a function once after delay (ms).

\`\`\`javascript
setTimeout(() => alert('Hello'), 2000); // After 2 seconds
\`\`\`

- Returns a \`timerId\`
- \`clearTimeout(timerId)\` cancels it

## setInterval
\`setInterval(func, delay)\`: Runs a function repeatedly, every delay ms.

\`\`\`javascript
let timerId = setInterval(() => console.log('Tick'), 1000);
clearInterval(timerId); // Stop it
\`\`\`

## Zero Delay
\`setTimeout(func, 0)\` doesn't run immediately. It runs "as soon as possible" after the current script finishes (Asynchronous Event Loop).

\`\`\`javascript
setTimeout(() => console.log('Second'), 0);
console.log('First');
// Output: First, Second
\`\`\`

## Nested Timeout
A flexible alternative to \`setInterval\` for precise timing.

\`\`\`javascript
function tick() {
  console.log('Tick');
  setTimeout(tick, 1000);
}
tick();
\`\`\`

This allows adjusting delay between calls dynamically.`,
    practiceQuestions: [
      "Use setTimeout to show an alert after 2 seconds.",
      "Use setInterval to log 'Tick' every second, then stop it after 5 seconds using setTimeout + clearInterval.",
    ],
    quizQuestions: [
      {
        questionText: "Unit of time in setTimeout?",
        options: ["Seconds", "Milliseconds"],
        correctAnswer: 1,
        explanation: "setTimeout delay is specified in milliseconds.",
      },
      {
        questionText: "Does setTimeout pause the code execution?",
        options: ["Yes", "No (it's async)"],
        correctAnswer: 1,
        explanation:
          "setTimeout is asynchronous and doesn't block code execution.",
      },
      {
        questionText: "How to cancel a timeout?",
        options: ["stopTimeout", "clearTimeout"],
        correctAnswer: 1,
        explanation: "clearTimeout() cancels a scheduled timeout.",
      },
      {
        questionText: "setInterval runs...",
        options: ["Once", "Repeatedly"],
        correctAnswer: 1,
        explanation:
          "setInterval runs the function repeatedly at specified intervals.",
      },
      {
        questionText: "Does setTimeout(f, 0) run immediately (synchronously)?",
        options: ["Yes", "No, runs after current script"],
        correctAnswer: 1,
        explanation:
          "setTimeout(f, 0) schedules execution after the current script finishes.",
      },
      {
        questionText: "Can you pass arguments to the function inside timeout?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, setTimeout(func, delay, arg1, arg2, ...) passes arguments to the function.",
      },
      {
        questionText:
          "If the CPU is overloaded, will the timer run exactly on time?",
        options: ["Yes", "No, it may delay"],
        correctAnswer: 1,
        explanation:
          "Timers are not guaranteed to run exactly on time if the CPU is busy.",
      },
      {
        questionText: "Which allows more flexible delay changes?",
        options: ["setInterval", "Recursive setTimeout"],
        correctAnswer: 1,
        explanation:
          "Recursive setTimeout allows changing delay between calls dynamically.",
      },
      {
        questionText: "Is the timer ID a number?",
        options: ["Yes (usually)", "String"],
        correctAnswer: 0,
        explanation: "Timer IDs are usually numbers (browser-dependent).",
      },
      {
        questionText:
          "If you alert inside an interval, does the interval pause?",
        options: ["Yes (in most browsers)", "No"],
        correctAnswer: 0,
        explanation:
          "Modal dialogs like alert() pause timers in most browsers.",
      },
    ],
    codingChallenge:
      "Task 1: Write a function printNumbers(from, to) that outputs a number every second, starting from from and ending with to. Task 2: Implement the same function using nested setTimeout instead of setInterval.",
    points: 32,
    duration: 30,
  },
  {
    order: 14,
    name: "Decorators & Forwarding (Call/Apply)",
    content: `# Decorators & Forwarding (Call/Apply)

## Decorator
A wrapper function that alters the behavior of another function (e.g., adds logging or caching) without changing its code.

\`\`\`javascript
function cachingDecorator(func) {
  let cache = new Map();
  return function(x) {
    if (cache.has(x)) {
      return cache.get(x);
    }
    let result = func(x);
    cache.set(x, result);
    return result;
  };
}
\`\`\`

## func.call(context, arg1, arg2...)
Calls func explicitly setting \`this\` to context.

\`\`\`javascript
function sayHi() {
  alert(this.name);
}
let user = {name: "John"};
sayHi.call(user); // "John"
\`\`\`

## func.apply(context, [args])
Same as call, but takes arguments as an array.

\`\`\`javascript
Math.max.apply(null, [1, 2, 3]); // 3
\`\`\`

## Forwarding
Passing all arguments and context to another function: \`func.apply(this, arguments)\`

## Method Borrowing
Using array methods on array-like objects: \`[].join.call(arguments)\`

\`\`\`javascript
function showArgs() {
  alert([].join.call(arguments, '-'));
}
showArgs(1, 2, 3); // "1-2-3"
\`\`\``,
    practiceQuestions: [
      "Given object user = {name: 'John'}, and function sayHi() { alert(this.name) }. Use call to run sayHi in the context of user.",
      "Use apply to pass an array of numbers [1, 2, 3] to a function sum(a, b, c).",
    ],
    quizQuestions: [
      {
        questionText: "What is a Decorator?",
        options: ["A CSS style", "A function wrapper that adds functionality"],
        correctAnswer: 1,
        explanation:
          "A decorator is a wrapper function that enhances another function's behavior.",
      },
      {
        questionText: "What is the first argument of call?",
        options: ["The function", "The this context", "The arguments"],
        correctAnswer: 1,
        explanation:
          "The first argument of call() is the context (this value).",
      },
      {
        questionText: "Difference between call and apply?",
        options: [
          "call takes array, apply takes list",
          "call takes list, apply takes array",
        ],
        correctAnswer: 1,
        explanation:
          "call() takes arguments as a list, apply() takes them as an array.",
      },
      {
        questionText: "What is 'Method Borrowing'?",
        options: ["Copying code", "Using a method from one object on another"],
        correctAnswer: 1,
        explanation:
          "Method borrowing uses call/apply to use a method from one object on another.",
      },
      {
        questionText: "If you lose this inside a callback, how can you fix it?",
        options: ["call/apply or bind", "return"],
        correctAnswer: 0,
        explanation: "Use call(), apply(), or bind() to fix the this context.",
      },
      {
        questionText: "Does call run the function immediately?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "call() immediately invokes the function with the specified context.",
      },
      {
        questionText: "Math.max.apply(null, [1, 2, 3]) is equivalent to...",
        options: ["Math.max(1, 2, 3)", "Error"],
        correctAnswer: 0,
        explanation: "apply() spreads the array into individual arguments.",
      },
      {
        questionText: "Can decorators be reused?",
        options: ["Yes", "No"],
        correctAnswer: 0,
        explanation:
          "Yes, decorators are reusable functions that can wrap any function.",
      },
      {
        questionText: "What is caching?",
        options: ["Deleting data", "Storing results to avoid recalculating"],
        correctAnswer: 1,
        explanation:
          "Caching stores computed results to avoid recalculating them.",
      },
      {
        questionText: "func.call(this, ...arguments) is essentially...",
        options: ["Forwarding the call", "Recursion"],
        correctAnswer: 0,
        explanation:
          "This pattern forwards all arguments and context to another function.",
      },
    ],
    codingChallenge:
      "Task 1: Create a decorator spy(func) that saves all calls to the function in a calls property. Task 2: Create a 'caching' decorator. If the function is called with the same argument x again, return the saved result instead of calculating it.",
    points: 32,
    duration: 35,
  },
];

export async function seedJavaScriptIntermediateModule() {
  try {
    await connectDB();
    console.log("🌱 Seeding JavaScript Intermediate Module...");

    // Find JavaScript skill
    const javascriptSkill = await Skill.findOne({ name: "JavaScript" });
    if (!javascriptSkill) {
      throw new Error("JavaScript skill not found. Please seed skills first.");
    }

    // Find or create the module
    let newModule = await Module.findOne({ name: "JavaScript Intermediate" });

    if (!newModule) {
      newModule = await Module.create({
        name: "JavaScript Intermediate",
        description:
          "Intermediate JavaScript concepts including closures, prototypes, async/await, and ES6+ features",
        level: "Intermediate",
        skillId: javascriptSkill._id,
        duration: 420, // 7 hours total (30-35 min per lesson)
        points: 750, // Total points: 60% lessons (450) + 40% completion (300)
        lessonsCount: 14,
      });
      console.log("✅ Created JavaScript Intermediate module");
    } else {
      console.log("✅ Found existing JavaScript Intermediate module");
    }

    // Clear existing lessons, quizzes, and questions for this module

    await Quiz.deleteMany({ moduleId: newModule._id });
    await Question.deleteMany({ moduleId: newModule._id });
    await Lesson.deleteMany({ moduleId: newModule._id });
    console.log("🗑️  Cleared existing lessons, quizzes, and questions");

    // Create lessons
    const createdLessons = [];
    let totalLessonPoints = 0;

    for (const lessonData of intermediateLessons) {
      const lesson = await Lesson.create({
        name: lessonData.name,
        content: lessonData.content,
        contentArray: lessonData.content
          .split("\n")
          .filter((line) => line.trim()),
        type: "Code",
        moduleId: newModule._id,
        skillId: javascriptSkill._id,
        duration: lessonData.duration,
        points: lessonData.points,
        order: lessonData.order,
      });

      createdLessons.push(lesson);
      totalLessonPoints += lessonData.points;
      console.log(
        `  ✅ Created lesson ${lessonData.order}: ${lessonData.name}`
      );

      // Create quiz for this lesson
      const quiz = await Quiz.create({
        name: `${lessonData.name} Quiz`,
        description: `Test your knowledge of ${lessonData.name}`,
        duration: 15, // 15 minutes
        moduleId: newModule._id,
        lessonId: lesson._id,
        lessonOrder: lessonData.order,
        numberOfQuestions: lessonData.quizQuestions.length,
        points: Math.floor(lessonData.points * 0.3), // 30% of lesson points for quiz
      });

      // Create questions for the quiz
      for (let i = 0; i < lessonData.quizQuestions.length; i++) {
        const q = lessonData.quizQuestions[i];

        const options = q.options.map((option, index) => ({
          id: `option_${index + 1}`,
          type: "mcq",
          content: option,
        }));

        await Question.create({
          questionText: q.questionText,
          type: "mcq",
          quizId: quiz._id,
          lessonId: lesson._id,
          moduleId: newModule._id,
          points: Math.floor(quiz.points / quiz.numberOfQuestions),
          order: i + 1,
          options: options,
          answer: {
            type: "mcq",
            content: q.options[q.correctAnswer],
            optionId: `option_${q.correctAnswer + 1}`,
          },
          explanation: q.explanation,
        });
      }

      console.log(
        `    ✅ Created quiz with ${lessonData.quizQuestions.length} questions`
      );
    }

    // Update module with actual lesson count
    newModule.lessonsCount = createdLessons.length;
    await newModule.save();

    console.log(`\n✅ Successfully seeded JavaScript Intermediate Module!`);
    console.log(`   - ${createdLessons.length} lessons created`);
    console.log(`   - Total lesson points: ${totalLessonPoints}`);
    console.log(`   - Completion bonus: 300 points`);
    console.log(`   - Total module points: 750`);

    return {
      newModule,
      lessons: createdLessons,
    };
  } catch (error) {
    console.error("❌ Error seeding JavaScript Intermediate Module:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedJavaScriptIntermediateModule()
    .then(() => {
      console.log("✅ Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
