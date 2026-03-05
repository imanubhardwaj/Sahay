import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Skill, Module, Lesson } from "@/models";

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Skill.deleteMany({});

    // Seed skills
    const skillsData = [
      {
        name: "JavaScript",
        description: "Programming language for web development",
      },
      {
        name: "React",
        description: "JavaScript library for building user interfaces",
      },
      {
        name: "Node.js",
        description: "JavaScript runtime for server-side development",
      },
      { name: "Python", description: "High-level programming language" },
      { name: "Java", description: "Object-oriented programming language" },
      { name: "TypeScript", description: "Typed superset of JavaScript" },
      { name: "MongoDB", description: "NoSQL database" },
      {
        name: "PostgreSQL",
        description: "Relational database management system",
      },
      { name: "AWS", description: "Amazon Web Services cloud platform" },
      { name: "Docker", description: "Containerization platform" },
      { name: "Git", description: "Version control system" },
      { name: "HTML", description: "HyperText Markup Language" },
      { name: "CSS", description: "Cascading Style Sheets" },
      { name: "Data Structures", description: "Organizing and storing data" },
      {
        name: "Algorithms",
        description: "Step-by-step procedures for solving problems",
      },
      {
        name: "Machine Learning",
        description: "AI technique for pattern recognition",
      },
      {
        name: "Artificial Intelligence",
        description: "Simulation of human intelligence",
      },
      { name: "Blockchain", description: "Distributed ledger technology" },
      {
        name: "React Hooks",
        description: "React state and lifecycle features",
      },
      {
        name: "Redux",
        description: "Predictable state container for JavaScript",
      },
    ];

    const skills = await Skill.insertMany(skillsData);

    // Seed modules
    const modulesData = [
      {
        name: "JavaScript Fundamentals",
        description: "Learn the basics of JavaScript programming language",
        level: "Beginner",
        skillId: skills.find((s) => s.name === "JavaScript")?._id,
        duration: 120,
        points: 100,
      },
      {
        name: "React Components",
        description: "Understanding React components and their lifecycle",
        level: "Beginner",
        skillId: skills.find((s) => s.name === "React")?._id,
        duration: 180,
        points: 150,
      },
      {
        name: "Node.js Backend Development",
        description: "Building server-side applications with Node.js",
        level: "Intermediate",
        skillId: skills.find((s) => s.name === "Node.js")?._id,
        duration: 240,
        points: 200,
      },
    ];

    const modules = await Module.insertMany(modulesData);

    // Seed lessons for each module
    const allLessons = [];

    // JavaScript Fundamentals - 15 lessons
    for (let i = 1; i <= 15; i++) {
      allLessons.push({
        name: `JavaScript Lesson ${i}`,
        content: `This is lesson ${i} of JavaScript Fundamentals. Learn about JavaScript concepts, syntax, and best practices.`,
        contentArray: [`Topic ${i}.1`, `Topic ${i}.2`, `Topic ${i}.3`],
        type: i % 2 === 0 ? "Code" : "Text",
        moduleId: modules[0]._id,
        skillId: skills.find((s) => s.name === "JavaScript")?._id,
        duration: 20 + i * 2,
        points: 20 + i * 2,
        order: i,
      });
    }

    // React Components - 15 lessons
    for (let i = 1; i <= 15; i++) {
      allLessons.push({
        name: `React Lesson ${i}`,
        content: `This is lesson ${i} of React Components. Learn about React components, JSX, and state management.`,
        contentArray: [
          `React Topic ${i}.1`,
          `React Topic ${i}.2`,
          `React Topic ${i}.3`,
        ],
        type: i % 2 === 0 ? "Code" : "Text",
        moduleId: modules[1]._id,
        skillId: skills.find((s) => s.name === "React")?._id,
        duration: 25 + i * 2,
        points: 25 + i * 2,
        order: i,
      });
    }

    // Node.js Backend Development - 15 lessons
    for (let i = 1; i <= 15; i++) {
      allLessons.push({
        name: `Node.js Lesson ${i}`,
        content: `This is lesson ${i} of Node.js Backend Development. Learn about server-side JavaScript, Express, and APIs.`,
        contentArray: [
          `Node.js Topic ${i}.1`,
          `Node.js Topic ${i}.2`,
          `Node.js Topic ${i}.3`,
        ],
        type: i % 2 === 0 ? "Code" : "Text",
        moduleId: modules[2]._id,
        skillId: skills.find((s) => s.name === "Node.js")?._id,
        duration: 30 + i * 2,
        points: 30 + i * 2,
        order: i,
      });
    }

    const lessons = await Lesson.insertMany(allLessons);

    // Update modules with lesson counts
    for (const moduleItem of modules) {
      const lessonCount = lessons.filter(
        (l) => l.moduleId.toString() === moduleItem._id.toString(),
      ).length;
      moduleItem.lessonsCount = lessonCount;
      await moduleItem.save();
    }

    return NextResponse.json({
      success: true,
      message: "Essential database seeded successfully!",
      stats: {
        skills: skills.length,
        modules: modules.length,
        lessons: lessons.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error seeding essential data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
