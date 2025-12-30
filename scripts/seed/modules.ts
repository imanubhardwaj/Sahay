import { Module } from "../../src/models";

export const seedModules = async (
  skills: Array<{ _id: unknown; name: string }>
) => {
  console.log("🌱 Seeding modules...");

  const modulesData = [
    {
      name: "JavaScript Fundamentals",
      description: "Learn the basics of JavaScript programming language",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "JavaScript")?._id,
      duration: 120, // 2 hours
      points: 100,
    },
    {
      name: "React Components",
      description: "Understanding React components and their lifecycle",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "React")?._id,
      duration: 180, // 3 hours
      points: 150,
    },
    {
      name: "Node.js Backend Development",
      description: "Building server-side applications with Node.js",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Node.js")?._id,
      duration: 240, // 4 hours
      points: 200,
    },
    {
      name: "Python Basics",
      description: "Introduction to Python programming",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "Python")?._id,
      duration: 150, // 2.5 hours
      points: 125,
    },
    {
      name: "Java Object-Oriented Programming",
      description: "Learn OOP concepts in Java",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Java")?._id,
      duration: 200, // 3.33 hours
      points: 175,
    },
    {
      name: "React Hooks Deep Dive",
      description: "Master React Hooks for state management",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "React Hooks")?._id,
      duration: 160, // 2.67 hours
      points: 140,
    },
    {
      name: "Redux State Management",
      description: "Managing application state with Redux",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Redux")?._id,
      duration: 220, // 3.67 hours
      points: 180,
    },
    {
      name: "TypeScript Advanced",
      description: "Advanced TypeScript features and best practices",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "TypeScript")?._id,
      duration: 190, // 3.17 hours
      points: 160,
    },
    {
      name: "MongoDB Database Design",
      description: "Designing and working with MongoDB databases",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "MongoDB")?._id,
      duration: 180, // 3 hours
      points: 150,
    },
    {
      name: "PostgreSQL Queries",
      description: "Writing efficient SQL queries in PostgreSQL",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "PostgreSQL")?._id,
      duration: 170, // 2.83 hours
      points: 145,
    },
    {
      name: "AWS Cloud Services",
      description: "Introduction to Amazon Web Services",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "AWS")?._id,
      duration: 300, // 5 hours
      points: 250,
    },
    {
      name: "Docker Containerization",
      description: "Containerizing applications with Docker",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Docker")?._id,
      duration: 140, // 2.33 hours
      points: 120,
    },
    {
      name: "Git Version Control",
      description: "Using Git for version control and collaboration",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "Git")?._id,
      duration: 100, // 1.67 hours
      points: 80,
    },
    {
      name: "HTML5 Semantic Elements",
      description: "Modern HTML5 features and semantic markup",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "HTML")?._id,
      duration: 90, // 1.5 hours
      points: 70,
    },
    {
      name: "CSS3 Advanced Styling",
      description: "Advanced CSS3 features and responsive design",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "CSS")?._id,
      duration: 160, // 2.67 hours
      points: 130,
    },
    {
      name: "Data Structures Implementation",
      description: "Implementing common data structures",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Data Structures")?._id,
      duration: 280, // 4.67 hours
      points: 220,
    },
    {
      name: "Algorithm Design Patterns",
      description: "Common algorithm design patterns and techniques",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Algorithms")?._id,
      duration: 320, // 5.33 hours
      points: 260,
    },
    {
      name: "Machine Learning Basics",
      description: "Introduction to machine learning concepts",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Machine Learning")?._id,
      duration: 360, // 6 hours
      points: 300,
    },
    {
      name: "AI Applications",
      description: "Real-world applications of artificial intelligence",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Artificial Intelligence")?._id,
      duration: 240, // 4 hours
      points: 200,
    },
    {
      name: "Blockchain Development",
      description: "Building decentralized applications",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Blockchain")?._id,
      duration: 400, // 6.67 hours
      points: 350,
    },
    // JavaScript modules
    {
      name: "JavaScript Intermediate",
      description:
        "Intermediate JavaScript concepts including closures, prototypes, async/await, and ES6+ features",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "JavaScript")?._id,
      duration: 240, // 4 hours
      points: 200,
      lessonsCount: 16,
      icon: "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
    },
    {
      name: "JavaScript Advanced",
      description:
        "Advanced JavaScript patterns, performance optimization, and complex application architecture",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "JavaScript")?._id,
      duration: 300, // 5 hours
      points: 250,
      lessonsCount: 20,
      icon: "https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc",
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
    },
    // TypeScript modules
    {
      name: "TypeScript Beginner",
      description:
        "Introduction to TypeScript, type annotations, interfaces, and basic type system",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "TypeScript")?._id,
      duration: 180, // 3 hours
      points: 150,
      lessonsCount: 12,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    },
    {
      name: "TypeScript Intermediate",
      description:
        "Intermediate TypeScript features including generics, utility types, and advanced type manipulation",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "TypeScript")?._id,
      duration: 220, // 3.67 hours
      points: 180,
      lessonsCount: 15,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    },
    // HTML modules
    {
      name: "HTML Intermediate",
      description:
        "Intermediate HTML concepts including forms, media elements, accessibility, and best practices",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "HTML")?._id,
      duration: 150, // 2.5 hours
      points: 125,
      lessonsCount: 10,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop",
    },
    {
      name: "HTML Advanced",
      description:
        "Advanced HTML techniques, web components, progressive web apps, and modern HTML APIs",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "HTML")?._id,
      duration: 200, // 3.33 hours
      points: 175,
      lessonsCount: 13,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop",
    },
    // CSS modules
    {
      name: "CSS Beginner",
      description:
        "Introduction to CSS, selectors, properties, layout basics, and styling fundamentals",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "CSS")?._id,
      duration: 120, // 2 hours
      points: 100,
      lessonsCount: 8,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    },
    {
      name: "CSS Advanced",
      description:
        "Advanced CSS techniques including animations, transforms, Grid, Flexbox mastery, and CSS architecture",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "CSS")?._id,
      duration: 240, // 4 hours
      points: 200,
      lessonsCount: 16,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    },
    // React modules
    {
      name: "React Intermediate",
      description:
        "Intermediate React concepts including hooks, context API, performance optimization, and testing",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "React")?._id,
      duration: 250, // 4.17 hours
      points: 210,
      lessonsCount: 17,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    },
    {
      name: "React Advanced",
      description:
        "Advanced React patterns, custom hooks, render optimization, concurrent features, and architecture",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "React")?._id,
      duration: 320, // 5.33 hours
      points: 270,
      lessonsCount: 21,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    },
    // Angular modules
    {
      name: "Angular Beginner",
      description:
        "Introduction to Angular framework, components, templates, data binding, and basic concepts",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "Angular")?._id,
      duration: 200, // 3.33 hours
      points: 170,
      lessonsCount: 13,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
    },
    {
      name: "Angular Intermediate",
      description:
        "Intermediate Angular concepts including services, dependency injection, routing, and forms",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Angular")?._id,
      duration: 280, // 4.67 hours
      points: 230,
      lessonsCount: 19,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
    },
    {
      name: "Angular Advanced",
      description:
        "Advanced Angular patterns, RxJS, state management, performance optimization, and enterprise architecture",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Angular")?._id,
      duration: 360, // 6 hours
      points: 300,
      lessonsCount: 24,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
    },
    // Node.js modules
    {
      name: "Node.js Beginner",
      description:
        "Introduction to Node.js, npm, modules, file system operations, and basic server creation",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "Node.js")?._id,
      duration: 180, // 3 hours
      points: 150,
      lessonsCount: 12,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    {
      name: "Node.js Advanced",
      description:
        "Advanced Node.js concepts including streams, clusters, performance optimization, and microservices",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Node.js")?._id,
      duration: 320, // 5.33 hours
      points: 270,
      lessonsCount: 21,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    // MongoDB modules
    {
      name: "MongoDB Beginner",
      description:
        "Introduction to MongoDB, CRUD operations, queries, indexes, and basic database concepts",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "MongoDB")?._id,
      duration: 150, // 2.5 hours
      points: 125,
      lessonsCount: 10,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    {
      name: "MongoDB Advanced",
      description:
        "Advanced MongoDB concepts including aggregation pipelines, sharding, replication, and optimization",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "MongoDB")?._id,
      duration: 280, // 4.67 hours
      points: 230,
      lessonsCount: 19,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    // Express modules
    {
      name: "Express Beginner",
      description:
        "Introduction to Express.js, routing, middleware, request/response handling, and basic API creation",
      level: "Beginner",
      skillId: skills.find((s) => s.name === "Express")?._id,
      duration: 160, // 2.67 hours
      points: 130,
      lessonsCount: 11,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    {
      name: "Express Intermediate",
      description:
        "Intermediate Express concepts including advanced routing, error handling, authentication, and REST APIs",
      level: "Intermediate",
      skillId: skills.find((s) => s.name === "Express")?._id,
      duration: 240, // 4 hours
      points: 200,
      lessonsCount: 16,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
    {
      name: "Express Advanced",
      description:
        "Advanced Express patterns, security best practices, performance optimization, microservices, and deployment",
      level: "Advanced",
      skillId: skills.find((s) => s.name === "Express")?._id,
      duration: 300, // 5 hours
      points: 250,
      lessonsCount: 20,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    },
  ];

  const modules = await Module.insertMany(modulesData);
  console.log(`✅ Seeded ${modules.length} modules`);

  return modules;
};
