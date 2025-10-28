import connectDB from '@/lib/mongodb';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Skill from '@/models/Skill';

export async function seedTypeScriptModule() {
  try {
    await connectDB();
    console.log('🌱 Starting TypeScript module seeding...');

    // Find or create TypeScript skill
    let typescriptSkill = await Skill.findOne({ name: 'TypeScript' });
    if (!typescriptSkill) {
      typescriptSkill = await Skill.create({
        name: 'TypeScript',
        description: 'TypeScript is a strongly typed programming language that builds on JavaScript',
        category: 'Programming Language',
        difficulty: 'Intermediate',
        prerequisites: ['JavaScript'],
        estimatedTime: 40,
        tags: ['typescript', 'javascript', 'programming', 'web-development']
      });
      console.log('✅ Created TypeScript skill');
    }

    // Create TypeScript module
    const typescriptModule = await Module.create({
      name: 'TypeScript Fundamentals',
      description: 'Learn TypeScript from basics to advanced concepts including types, interfaces, generics, and more.',
      level: 'Intermediate',
      skillId: typescriptSkill._id,
      duration: 300, // 5 hours
      points: 500,
      lessonsCount: 5
    });
    console.log('✅ Created TypeScript module');

    // Create lessons
    const lessons = [
      {
        name: 'Introduction to TypeScript',
        content: `# Introduction to TypeScript

TypeScript is a programming language developed by Microsoft. It is a strict syntactical superset of JavaScript and adds optional static type checking to the language.

## Key Features:
- **Static Type Checking**: Catch errors at compile time
- **Enhanced IDE Support**: Better autocomplete and refactoring
- **Modern JavaScript Features**: Use latest ES features
- **Gradual Adoption**: Can be adopted incrementally

## Why TypeScript?
- Reduces runtime errors
- Improves code maintainability
- Better developer experience
- Large-scale application support

## Basic Syntax:
\`\`\`typescript
let message: string = "Hello, TypeScript!";
let count: number = 42;
let isActive: boolean = true;
\`\`\`

TypeScript compiles to plain JavaScript, making it compatible with any JavaScript environment.`,
        contentArray: [
          'TypeScript is a programming language developed by Microsoft',
          'It is a strict syntactical superset of JavaScript',
          'Adds optional static type checking',
          'Compiles to plain JavaScript'
        ],
        type: 'Text',
        moduleId: typescriptModule._id,
        skillId: typescriptSkill._id,
        duration: 60,
        points: 100,
        order: 1
      },
      {
        name: 'TypeScript Types and Interfaces',
        content: `# TypeScript Types and Interfaces

## Basic Types
TypeScript provides several basic types:

\`\`\`typescript
// Primitive types
let name: string = "John";
let age: number = 30;
let isStudent: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// Objects
let person: { name: string; age: number } = {
  name: "John",
  age: 30
};
\`\`\`

## Interfaces
Interfaces define the structure of objects:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

let user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
\`\`\`

## Union Types
Union types allow a variable to be one of several types:

\`\`\`typescript
let id: string | number;
id = "123"; // OK
id = 123;   // OK
\`\`\``,
        contentArray: [
          'Basic types: string, number, boolean',
          'Arrays and objects',
          'Interfaces define object structure',
          'Union types allow multiple types'
        ],
        type: 'Text',
        moduleId: typescriptModule._id,
        skillId: typescriptSkill._id,
        duration: 60,
        points: 100,
        order: 2
      },
      {
        name: 'Functions and Classes',
        content: `# Functions and Classes in TypeScript

## Typed Functions
Functions can have typed parameters and return types:

\`\`\`typescript
function add(a: number, b: number): number {
  return a + b;
}

// Arrow functions
const multiply = (a: number, b: number): number => {
  return a * b;
};

// Optional parameters
function greet(name: string, greeting?: string): string {
  return \`\${greeting || "Hello"}, \${name}!\`;
}
\`\`\`

## Classes
TypeScript classes support access modifiers and type annotations:

\`\`\`typescript
class Person {
  private name: string;
  public age: number;
  protected email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }

  public getName(): string {
    return this.name;
  }

  private validateEmail(): boolean {
    return this.email.includes("@");
  }
}
\`\`\`

## Inheritance
Classes can extend other classes:

\`\`\`typescript
class Student extends Person {
  private studentId: string;

  constructor(name: string, age: number, email: string, studentId: string) {
    super(name, age, email);
    this.studentId = studentId;
  }

  public getStudentId(): string {
    return this.studentId;
  }
}
\`\`\``,
        contentArray: [
          'Functions can have typed parameters and return types',
          'Classes support access modifiers',
          'Inheritance with extends keyword',
          'Constructor functions'
        ],
        type: 'Text',
        moduleId: typescriptModule._id,
        skillId: typescriptSkill._id,
        duration: 60,
        points: 100,
        order: 3
      },
      {
        name: 'Generics and Advanced Types',
        content: `# Generics and Advanced Types

## Generics
Generics allow you to create reusable components:

\`\`\`typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("hello");
let number = identity<number>(42);

// Generic interface
interface Container<T> {
  value: T;
  getValue(): T;
}

let stringContainer: Container<string> = {
  value: "Hello",
  getValue() { return this.value; }
};
\`\`\`

## Advanced Types
TypeScript provides several advanced type features:

\`\`\`typescript
// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

// Mapped types
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Utility types
type User = {
  id: number;
  name: string;
  email: string;
};

type PartialUser = Partial<User>; // All properties optional
type UserEmail = Pick<User, 'email'>; // Only email property
\`\`\`

## Type Guards
Type guards help narrow types:

\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  }
}
\`\`\``,
        contentArray: [
          'Generics create reusable components',
          'Conditional and mapped types',
          'Utility types: Partial, Pick, Omit',
          'Type guards narrow types'
        ],
        type: 'Text',
        moduleId: typescriptModule._id,
        skillId: typescriptSkill._id,
        duration: 60,
        points: 100,
        order: 4
      },
      {
        name: 'TypeScript Best Practices',
        content: `# TypeScript Best Practices

## Configuration
Use \`tsconfig.json\` to configure TypeScript:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
\`\`\`

## Best Practices

### 1. Use Strict Mode
Always enable strict mode for better type checking.

### 2. Prefer Interfaces over Types
Use interfaces for object shapes, types for unions and primitives.

### 3. Avoid \`any\` Type
Use specific types instead of \`any\` when possible.

### 4. Use Type Assertions Carefully
\`\`\`typescript
// Good
let value = (someValue as string).toUpperCase();

// Better - use type guards
if (typeof someValue === 'string') {
  let value = someValue.toUpperCase();
}
\`\`\`

### 5. Leverage Type Inference
Let TypeScript infer types when possible:

\`\`\`typescript
// Good - TypeScript infers the type
const numbers = [1, 2, 3, 4, 5];

// Unnecessary
const numbers: number[] = [1, 2, 3, 4, 5];
\`\`\`

## Common Patterns
- Use enums for constants
- Implement proper error handling
- Use readonly for immutable data
- Leverage utility types`,
        contentArray: [
          'Use strict mode configuration',
          'Prefer interfaces over types',
          'Avoid any type',
          'Use type assertions carefully',
          'Leverage type inference'
        ],
        type: 'Text',
        moduleId: typescriptModule._id,
        skillId: typescriptSkill._id,
        duration: 60,
        points: 100,
        order: 5
      }
    ];

    const createdLessons = [];
    for (const lessonData of lessons) {
      const lesson = await Lesson.create(lessonData);
      createdLessons.push(lesson);
      console.log(`✅ Created lesson: ${lesson.name}`);
    }

    // Create quizzes for lessons 2, 3, 4, and 5 (skip lesson 1)
    const quizLessons = createdLessons.slice(1); // Skip first lesson

    for (let i = 0; i < quizLessons.length; i++) {
      const lesson = quizLessons[i];
      
      // Create quiz
      const quiz = await Quiz.create({
        lessonId: lesson._id,
        title: `Quiz: ${lesson.name}`,
        description: `Test your knowledge of ${lesson.name.toLowerCase()}`,
        passingScore: 70,
        timeLimit: 30,
        attempts: 3
      });

      // Create questions for each quiz
      const questions = [];
      
      if (lesson.order === 2) { // Types and Interfaces
        questions.push(
          {
            lessonId: lesson._id,
            content: "What is the correct way to declare a string variable in TypeScript?",
            type: 'mcq',
            order: 1,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75da', content: 'let name: string = "John";', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75db', content: 'let name = string "John";', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75dc', content: 'string name = "John";', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75dd', content: 'let name: "John" = string;', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75da' },
            explanation: "In TypeScript, you declare a variable with type annotation using the syntax: let variableName: type = value;"
          },
          {
            lessonId: lesson._id,
            content: "Which keyword is used to define an interface in TypeScript?",
            type: 'mcq',
            order: 2,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75de', content: 'interface', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75df', content: 'class', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e0', content: 'type', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e1', content: 'struct', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75de' },
            explanation: "The 'interface' keyword is used to define interfaces in TypeScript."
          },
          {
            lessonId: lesson._id,
            content: "Write a TypeScript interface for a User object with id (number), name (string), and email (string) properties.",
            type: 'subjective',
            order: 3,
            points: 20,
            evaluationCriteria: "Should include 'interface User' declaration with proper property types",
            explanation: "The interface should define the structure with correct TypeScript syntax."
          }
        );
      } else if (lesson.order === 3) { // Functions and Classes
        questions.push(
          {
            lessonId: lesson._id,
            content: "What is the correct syntax for a function with typed parameters and return type?",
            type: 'mcq',
            order: 1,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75e2', content: 'function add(a: number, b: number): number { return a + b; }', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75e3', content: 'function add(a, b): number { return a + b; }', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e4', content: 'function add(a: number, b: number) { return a + b; }', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e5', content: 'add(a: number, b: number): number { return a + b; }', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75e2' },
            explanation: "TypeScript functions require type annotations for parameters and can specify return types."
          },
          {
            lessonId: lesson._id,
            content: "Which access modifier makes a class property accessible only within the class?",
            type: 'mcq',
            order: 2,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75e6', content: 'private', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75e7', content: 'public', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e8', content: 'protected', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75e9', content: 'internal', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75e6' },
            explanation: "The 'private' access modifier restricts access to only within the class."
          },
          {
            lessonId: lesson._id,
            content: "Create a TypeScript class called 'Car' with properties: brand (string), model (string), year (number), and a method 'getInfo()' that returns a string with all car details.",
            type: 'subjective',
            order: 3,
            points: 20,
            evaluationCriteria: "Should include class declaration, constructor, properties, and getInfo method",
            explanation: "The class should demonstrate proper TypeScript class syntax with typed properties and methods."
          }
        );
      } else if (lesson.order === 4) { // Generics and Advanced Types
        questions.push(
          {
            lessonId: lesson._id,
            content: "What is the correct syntax for a generic function?",
            type: 'mcq',
            order: 1,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75ea', content: 'function identity<T>(arg: T): T { return arg; }', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75eb', content: 'function identity(arg: T): T { return arg; }', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75ec', content: 'function identity<T>(arg): T { return arg; }', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75ed', content: 'function identity(arg: T): T { return arg; }', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75ea' },
            explanation: "Generic functions use angle brackets <T> to define type parameters."
          },
          {
            lessonId: lesson._id,
            content: "Which utility type makes all properties of an interface optional?",
            type: 'mcq',
            order: 2,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75ee', content: 'Partial<T>', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75ef', content: 'Required<T>', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f0', content: 'Pick<T>', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f1', content: 'Omit<T>', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75ee' },
            explanation: "Partial<T> makes all properties of type T optional."
          },
          {
            lessonId: lesson._id,
            content: "Create a generic interface called 'Container<T>' with a property 'value' of type T and a method 'getValue()' that returns T.",
            type: 'subjective',
            order: 3,
            points: 20,
            evaluationCriteria: "Should include generic interface declaration with proper syntax",
            explanation: "The interface should demonstrate generic type usage with proper TypeScript syntax."
          }
        );
      } else if (lesson.order === 5) { // Best Practices
        questions.push(
          {
            lessonId: lesson._id,
            content: "What should you avoid using in TypeScript for better type safety?",
            type: 'mcq',
            order: 1,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75f2', content: 'any type', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75f3', content: 'string type', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f4', content: 'number type', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f5', content: 'boolean type', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75f2' },
            explanation: "The 'any' type should be avoided as it defeats the purpose of TypeScript's type checking."
          },
          {
            lessonId: lesson._id,
            content: "Which configuration option enables strict type checking in TypeScript?",
            type: 'mcq',
            order: 2,
            points: 10,
            options: [
              { id: '68f89e453c7450ea2f1d75f6', content: 'strict: true', isCorrect: true },
              { id: '68f89e453c7450ea2f1d75f7', content: 'strictMode: true', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f8', content: 'typeCheck: true', isCorrect: false },
              { id: '68f89e453c7450ea2f1d75f9', content: 'strictTypes: true', isCorrect: false }
            ],
            answer: { optionId: '68f89e453c7450ea2f1d75f6' },
            explanation: "The 'strict: true' option enables strict type checking in tsconfig.json."
          },
          {
            lessonId: lesson._id,
            content: "Write a TypeScript function that takes an array of numbers and returns the sum of all even numbers. Include proper type annotations.",
            type: 'subjective',
            order: 3,
            points: 20,
            evaluationCriteria: "Should include function declaration, parameter types, return type, and logic to filter and sum even numbers",
            explanation: "The function should demonstrate proper TypeScript syntax with array methods and type safety."
          }
        );
      }

      // Create questions in database
      for (const questionData of questions) {
        await Question.create(questionData);
      }
      
      console.log(`✅ Created quiz with ${questions.length} questions for lesson: ${lesson.name}`);
    }

    console.log('🎉 TypeScript module seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - 1 Module: ${typescriptModule.name}`);
    console.log(`   - ${createdLessons.length} Lessons`);
    console.log(`   - ${quizLessons.length} Quizzes`);
    console.log(`   - ${quizLessons.reduce((sum, _, i) => sum + (lesson.order === 2 ? 3 : lesson.order === 3 ? 3 : lesson.order === 4 ? 3 : 3), 0)} Questions`);

  } catch (error) {
    console.error('❌ Error seeding TypeScript module:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedTypeScriptModule()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
