// This file contains comprehensive lesson data for all modules
// Each module has at least 15 lessons with real educational content

export const comprehensiveLessonsData = (modules: any[], skills: any[]) => {
  const findModule = (name: string) => modules.find(m => m.name === name)?._id;
  const findSkill = (name: string) => skills.find(s => s.name === name)?._id;

  return {
    // Additional modules lessons (to complement the ones already created)
    reactHooks: [
      { name: 'Introduction to Hooks', content: 'Understand React Hooks and why they were introduced', duration: 20, order: 1 },
      { name: 'useState Deep Dive', content: 'Master state management with useState hook', duration: 30, order: 2 },
      { name: 'useEffect Fundamentals', content: 'Learn side effects with useEffect', duration: 35, order: 3 },
      { name: 'useEffect Dependencies', content: 'Master dependency arrays and effect optimization', duration: 30, order: 4 },
      { name: 'useContext Hook', content: 'Share data across components with useContext', duration: 35, order: 5 },
      { name: 'useReducer for Complex State', content: 'Manage complex state logic with useReducer', duration: 40, order: 6 },
      { name: 'useCallback Hook', content: 'Optimize callbacks with useCallback', duration: 30, order: 7 },
      { name: 'useMemo Hook', content: 'Memoize expensive calculations with useMemo', duration: 30, order: 8 },
      { name: 'useRef Hook', content: 'Access DOM elements and persist values with useRef', duration: 30, order: 9 },
      { name: 'Custom Hooks', content: 'Create reusable custom hooks', duration: 40, order: 10 },
      { name: 'useLayoutEffect', content: 'Understand useLayoutEffect for DOM mutations', duration: 25, order: 11 },
      { name: 'useImperativeHandle', content: 'Customize ref exposure with useImperativeHandle', duration: 30, order: 12 },
      { name: 'useDebugValue', content: 'Debug custom hooks with useDebugValue', duration: 20, order: 13 },
      { name: 'Hooks Rules and Best Practices', content: 'Follow hooks rules and learn best practices', duration: 25, order: 14 },
      { name: 'Hooks Performance Optimization', content: 'Optimize React applications with hooks', duration: 35, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('React Hooks Deep Dive'),
      skillId: findSkill('React Hooks'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    redux: [
      { name: 'Introduction to Redux', content: 'Learn Redux for predictable state management', duration: 25, order: 1 },
      { name: 'Redux Core Concepts', content: 'Understand store, actions, and reducers', duration: 30, order: 2 },
      { name: 'Setting Up Redux', content: 'Install and configure Redux in your app', duration: 25, order: 3 },
      { name: 'Creating Actions', content: 'Define action types and action creators', duration: 30, order: 4 },
      { name: 'Writing Reducers', content: 'Create pure reducers to update state', duration: 35, order: 5 },
      { name: 'Redux Store', content: 'Configure and use the Redux store', duration: 30, order: 6 },
      { name: 'React-Redux Integration', content: 'Connect Redux with React using react-redux', duration: 35, order: 7 },
      { name: 'useSelector Hook', content: 'Select data from Redux store with useSelector', duration: 25, order: 8 },
      { name: 'useDispatch Hook', content: 'Dispatch actions with useDispatch hook', duration: 25, order: 9 },
      { name: 'Redux Middleware', content: 'Extend Redux with middleware', duration: 35, order: 10 },
      { name: 'Redux Thunk', content: 'Handle async actions with Redux Thunk', duration: 40, order: 11 },
      { name: 'Redux Toolkit', content: 'Simplify Redux development with Redux Toolkit', duration: 45, order: 12 },
      { name: 'createSlice API', content: 'Create reducers and actions with createSlice', duration: 35, order: 13 },
      { name: 'Redux DevTools', content: 'Debug Redux apps with DevTools', duration: 25, order: 14 },
      { name: 'Redux Best Practices', content: 'Follow Redux patterns and best practices', duration: 30, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Redux State Management'),
      skillId: findSkill('Redux'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    typescript: [
      { name: 'TypeScript Introduction', content: 'Learn TypeScript and its benefits', duration: 20, order: 1 },
      { name: 'TypeScript Setup', content: 'Configure TypeScript in your project', duration: 25, order: 2 },
      { name: 'Basic Types', content: 'Master string, number, boolean, and more', duration: 30, order: 3 },
      { name: 'Arrays and Tuples', content: 'Work with typed arrays and tuples', duration: 25, order: 4 },
      { name: 'Interfaces', content: 'Define object shapes with interfaces', duration: 35, order: 5 },
      { name: 'Type Aliases', content: 'Create custom types with type aliases', duration: 25, order: 6 },
      { name: 'Union and Intersection Types', content: 'Combine types with unions and intersections', duration: 30, order: 7 },
      { name: 'Enums', content: 'Define named constants with enums', duration: 25, order: 8 },
      { name: 'Generics', content: 'Create reusable components with generics', duration: 40, order: 9 },
      { name: 'Classes in TypeScript', content: 'Use TypeScript classes with type safety', duration: 35, order: 10 },
      { name: 'Advanced Types', content: 'Explore mapped types, conditional types', duration: 40, order: 11 },
      { name: 'Type Guards', content: 'Narrow types with type guards', duration: 30, order: 12 },
      { name: 'Decorators', content: 'Use experimental decorators', duration: 30, order: 13 },
      { name: 'Modules and Namespaces', content: 'Organize code with modules', duration: 25, order: 14 },
      { name: 'TypeScript Best Practices', content: 'Write clean, type-safe TypeScript code', duration: 30, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('TypeScript Advanced'),
      skillId: findSkill('TypeScript'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    mongodb: [
      { name: 'Introduction to MongoDB', content: 'Learn NoSQL databases and MongoDB', duration: 25, order: 1 },
      { name: 'MongoDB Installation', content: 'Install and setup MongoDB', duration: 20, order: 2 },
      { name: 'MongoDB Basics', content: 'Understand databases, collections, documents', duration: 30, order: 3 },
      { name: 'CRUD Operations', content: 'Create, read, update, delete documents', duration: 35, order: 4 },
      { name: 'Query Operators', content: 'Use comparison and logical operators', duration: 30, order: 5 },
      { name: 'Projection and Sorting', content: 'Control query results with projection', duration: 25, order: 6 },
      { name: 'Indexes in MongoDB', content: 'Optimize queries with indexes', duration: 35, order: 7 },
      { name: 'Aggregation Framework', content: 'Process data with aggregation pipelines', duration: 45, order: 8 },
      { name: 'Data Modeling', content: 'Design effective MongoDB schemas', duration: 40, order: 9 },
      { name: 'Relationships', content: 'Model one-to-one, one-to-many relationships', duration: 35, order: 10 },
      { name: 'Mongoose ODM', content: 'Use Mongoose for schema validation', duration: 35, order: 11 },
      { name: 'Mongoose Middleware', content: 'Add pre/post hooks to models', duration: 30, order: 12 },
      { name: 'MongoDB Transactions', content: 'Ensure data consistency with transactions', duration: 30, order: 13 },
      { name: 'Performance Optimization', content: 'Optimize MongoDB performance', duration: 35, order: 14 },
      { name: 'MongoDB Security', content: 'Secure your MongoDB deployment', duration: 30, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('MongoDB Database Design'),
      skillId: findSkill('MongoDB'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    postgresql: [
      { name: 'Introduction to PostgreSQL', content: 'Learn the powerful open-source database', duration: 20, order: 1 },
      { name: 'PostgreSQL Installation', content: 'Install and setup PostgreSQL', duration: 25, order: 2 },
      { name: 'SQL Basics', content: 'Learn SELECT, FROM, WHERE clauses', duration: 30, order: 3 },
      { name: 'Data Types', content: 'Understand PostgreSQL data types', duration: 25, order: 4 },
      { name: 'Creating Tables', content: 'Design and create database tables', duration: 30, order: 5 },
      { name: 'Constraints', content: 'Apply PRIMARY KEY, FOREIGN KEY, UNIQUE', duration: 30, order: 6 },
      { name: 'INSERT, UPDATE, DELETE', content: 'Modify data in tables', duration: 30, order: 7 },
      { name: 'Joins', content: 'Combine data from multiple tables', duration: 40, order: 8 },
      { name: 'Aggregate Functions', content: 'Use COUNT, SUM, AVG, MAX, MIN', duration: 30, order: 9 },
      { name: 'GROUP BY and HAVING', content: 'Group and filter aggregated data', duration: 35, order: 10 },
      { name: 'Subqueries', content: 'Write nested queries for complex logic', duration: 35, order: 11 },
      { name: 'Indexes', content: 'Speed up queries with indexes', duration: 30, order: 12 },
      { name: 'Views', content: 'Create virtual tables with views', duration: 25, order: 13 },
      { name: 'Transactions', content: 'Ensure data integrity with transactions', duration: 30, order: 14 },
      { name: 'Advanced SQL', content: 'Window functions, CTEs, and more', duration: 45, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('PostgreSQL Queries'),
      skillId: findSkill('PostgreSQL'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    aws: [
      { name: 'Introduction to AWS', content: 'Learn Amazon Web Services fundamentals', duration: 25, order: 1 },
      { name: 'AWS Account Setup', content: 'Create and configure your AWS account', duration: 20, order: 2 },
      { name: 'AWS Management Console', content: 'Navigate the AWS console interface', duration: 20, order: 3 },
      { name: 'IAM Users and Roles', content: 'Manage identity and access', duration: 35, order: 4 },
      { name: 'EC2 Basics', content: 'Launch and manage virtual servers', duration: 40, order: 5 },
      { name: 'S3 Storage', content: 'Store and retrieve data with S3', duration: 35, order: 6 },
      { name: 'RDS Databases', content: 'Manage relational databases in AWS', duration: 40, order: 7 },
      { name: 'Lambda Functions', content: 'Run serverless functions', duration: 45, order: 8 },
      { name: 'API Gateway', content: 'Create and manage APIs', duration: 40, order: 9 },
      { name: 'CloudFront CDN', content: 'Deliver content globally', duration: 30, order: 10 },
      { name: 'Route 53', content: 'Manage DNS and domain names', duration: 30, order: 11 },
      { name: 'VPC Networking', content: 'Create isolated cloud networks', duration: 40, order: 12 },
      { name: 'CloudWatch Monitoring', content: 'Monitor AWS resources and applications', duration: 35, order: 13 },
      { name: 'AWS Security Best Practices', content: 'Secure your AWS infrastructure', duration: 35, order: 14 },
      { name: 'Cost Optimization', content: 'Optimize AWS costs effectively', duration: 30, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('AWS Cloud Services'),
      skillId: findSkill('AWS'),
      contentArray: [l.content],
      type: 'Text' as const,
      points: l.duration
    })),

    docker: [
      { name: 'Introduction to Docker', content: 'Learn containerization with Docker', duration: 25, order: 1 },
      { name: 'Docker Installation', content: 'Install Docker on your system', duration: 20, order: 2 },
      { name: 'Docker Images', content: 'Understand and work with Docker images', duration: 25, order: 3 },
      { name: 'Docker Containers', content: 'Run and manage containers', duration: 30, order: 4 },
      { name: 'Dockerfile Basics', content: 'Create custom Docker images', duration: 35, order: 5 },
      { name: 'Docker Commands', content: 'Master essential Docker CLI commands', duration: 30, order: 6 },
      { name: 'Container Networking', content: 'Connect containers together', duration: 35, order: 7 },
      { name: 'Docker Volumes', content: 'Persist data with volumes', duration: 30, order: 8 },
      { name: 'Docker Compose', content: 'Define multi-container applications', duration: 40, order: 9 },
      { name: 'Environment Variables', content: 'Configure containers with env vars', duration: 25, order: 10 },
      { name: 'Docker Registry', content: 'Push and pull images from registries', duration: 30, order: 11 },
      { name: 'Multi-stage Builds', content: 'Optimize images with multi-stage builds', duration: 35, order: 12 },
      { name: 'Docker Security', content: 'Secure your Docker containers', duration: 30, order: 13 },
      { name: 'Container Orchestration', content: 'Introduction to Kubernetes', duration: 35, order: 14 },
      { name: 'Docker Best Practices', content: 'Follow Docker best practices', duration: 25, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Docker Containerization'),
      skillId: findSkill('Docker'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    git: [
      { name: 'Introduction to Git', content: 'Learn version control with Git', duration: 20, order: 1 },
      { name: 'Git Installation', content: 'Install and configure Git', duration: 15, order: 2 },
      { name: 'Git Repositories', content: 'Initialize and clone repositories', duration: 20, order: 3 },
      { name: 'Basic Git Commands', content: 'Master add, commit, push, pull', duration: 30, order: 4 },
      { name: 'Git Branches', content: 'Create and manage branches', duration: 30, order: 5 },
      { name: 'Merging Branches', content: 'Merge branches and resolve conflicts', duration: 35, order: 6 },
      { name: 'Git Stash', content: 'Temporarily save changes with stash', duration: 20, order: 7 },
      { name: 'Git Tags', content: 'Mark important points in history', duration: 20, order: 8 },
      { name: 'Git Remote', content: 'Work with remote repositories', duration: 25, order: 9 },
      { name: 'Git Rebase', content: 'Rewrite commit history cleanly', duration: 30, order: 10 },
      { name: 'Git Reset and Revert', content: 'Undo changes safely', duration: 25, order: 11 },
      { name: 'GitHub Basics', content: 'Use GitHub for collaboration', duration: 25, order: 12 },
      { name: 'Pull Requests', content: 'Create and review pull requests', duration: 30, order: 13 },
      { name: 'Git Workflows', content: 'Learn GitFlow and other workflows', duration: 30, order: 14 },
      { name: 'Git Best Practices', content: 'Write good commits and maintain history', duration: 25, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Git Version Control'),
      skillId: findSkill('Git'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    html: [
      { name: 'Introduction to HTML5', content: 'Learn modern HTML5 fundamentals', duration: 20, order: 1 },
      { name: 'HTML Document Structure', content: 'Understand HTML document anatomy', duration: 20, order: 2 },
      { name: 'Text Elements', content: 'Use headings, paragraphs, and formatting', duration: 25, order: 3 },
      { name: 'Links and Navigation', content: 'Create hyperlinks and navigation', duration: 25, order: 4 },
      { name: 'Images and Media', content: 'Embed images, audio, and video', duration: 30, order: 5 },
      { name: 'Lists', content: 'Create ordered and unordered lists', duration: 20, order: 6 },
      { name: 'Tables', content: 'Structure tabular data', duration: 25, order: 7 },
      { name: 'Forms and Inputs', content: 'Create interactive forms', duration: 35, order: 8 },
      { name: 'Semantic Elements', content: 'Use header, nav, article, section, footer', duration: 30, order: 9 },
      { name: 'HTML5 APIs', content: 'Explore Geolocation, Canvas, and more', duration: 35, order: 10 },
      { name: 'Meta Tags', content: 'Optimize with meta tags', duration: 20, order: 11 },
      { name: 'Accessibility', content: 'Create accessible HTML', duration: 30, order: 12 },
      { name: 'HTML Validation', content: 'Validate and debug HTML', duration: 20, order: 13 },
      { name: 'Responsive Images', content: 'Use picture and srcset', duration: 25, order: 14 },
      { name: 'HTML Best Practices', content: 'Write clean, semantic HTML', duration: 25, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('HTML5 Semantic Elements'),
      skillId: findSkill('HTML'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    css: [
      { name: 'CSS Introduction', content: 'Learn Cascading Style Sheets', duration: 20, order: 1 },
      { name: 'CSS Selectors', content: 'Target elements with selectors', duration: 30, order: 2 },
      { name: 'Box Model', content: 'Understand margin, padding, border', duration: 30, order: 3 },
      { name: 'Colors and Backgrounds', content: 'Style with colors and backgrounds', duration: 25, order: 4 },
      { name: 'Typography', content: 'Style text and fonts', duration: 25, order: 5 },
      { name: 'CSS Layout: Display', content: 'Control element display', duration: 30, order: 6 },
      { name: 'Flexbox', content: 'Create flexible layouts with Flexbox', duration: 40, order: 7 },
      { name: 'CSS Grid', content: 'Build complex layouts with Grid', duration: 45, order: 8 },
      { name: 'Positioning', content: 'Position elements precisely', duration: 30, order: 9 },
      { name: 'Responsive Design', content: 'Create mobile-friendly layouts', duration: 40, order: 10 },
      { name: 'Media Queries', content: 'Adapt styles to screen sizes', duration: 30, order: 11 },
      { name: 'Transitions and Animations', content: 'Add motion to your designs', duration: 35, order: 12 },
      { name: 'CSS Variables', content: 'Use custom properties', duration: 25, order: 13 },
      { name: 'CSS Preprocessors', content: 'Introduction to Sass/Less', duration: 30, order: 14 },
      { name: 'CSS Best Practices', content: 'Write maintainable CSS', duration: 30, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('CSS3 Advanced Styling'),
      skillId: findSkill('CSS'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    dataStructures: [
      { name: 'Introduction to Data Structures', content: 'Understand data structures importance', duration: 25, order: 1 },
      { name: 'Arrays', content: 'Master array operations and complexity', duration: 30, order: 2 },
      { name: 'Linked Lists', content: 'Implement singly and doubly linked lists', duration: 40, order: 3 },
      { name: 'Stacks', content: 'Understand LIFO data structure', duration: 30, order: 4 },
      { name: 'Queues', content: 'Implement FIFO data structure', duration: 30, order: 5 },
      { name: 'Hash Tables', content: 'Learn hashing and hash tables', duration: 40, order: 6 },
      { name: 'Trees Basics', content: 'Understand tree terminology', duration: 35, order: 7 },
      { name: 'Binary Trees', content: 'Implement binary tree operations', duration: 40, order: 8 },
      { name: 'Binary Search Trees', content: 'Learn BST properties and operations', duration: 45, order: 9 },
      { name: 'Tree Traversals', content: 'Master inorder, preorder, postorder', duration: 35, order: 10 },
      { name: 'Heaps', content: 'Implement min and max heaps', duration: 40, order: 11 },
      { name: 'Graphs', content: 'Understand graph representation', duration: 45, order: 12 },
      { name: 'Graph Traversals', content: 'Implement BFS and DFS', duration: 45, order: 13 },
      { name: 'Tries', content: 'Implement prefix trees', duration: 35, order: 14 },
      { name: 'Advanced Data Structures', content: 'Explore AVL trees, B-trees, and more', duration: 50, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Data Structures Implementation'),
      skillId: findSkill('Data Structures'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    algorithms: [
      { name: 'Algorithm Analysis', content: 'Learn Big O notation and complexity', duration: 30, order: 1 },
      { name: 'Searching Algorithms', content: 'Implement linear and binary search', duration: 35, order: 2 },
      { name: 'Bubble Sort', content: 'Understand and implement bubble sort', duration: 25, order: 3 },
      { name: 'Selection Sort', content: 'Learn selection sort algorithm', duration: 25, order: 4 },
      { name: 'Insertion Sort', content: 'Master insertion sort', duration: 25, order: 5 },
      { name: 'Merge Sort', content: 'Implement divide-and-conquer merge sort', duration: 40, order: 6 },
      { name: 'Quick Sort', content: 'Learn efficient quick sort algorithm', duration: 40, order: 7 },
      { name: 'Recursion', content: 'Master recursive problem solving', duration: 45, order: 8 },
      { name: 'Dynamic Programming', content: 'Learn memoization and tabulation', duration: 50, order: 9 },
      { name: 'Greedy Algorithms', content: 'Solve problems with greedy approach', duration: 45, order: 10 },
      { name: 'Backtracking', content: 'Implement backtracking solutions', duration: 45, order: 11 },
      { name: 'Graph Algorithms', content: 'Dijkstra, Bellman-Ford, Floyd-Warshall', duration: 50, order: 12 },
      { name: 'String Algorithms', content: 'Pattern matching and string manipulation', duration: 40, order: 13 },
      { name: 'Bit Manipulation', content: 'Solve problems with bit operations', duration: 35, order: 14 },
      { name: 'Algorithm Design Patterns', content: 'Master common algorithmic patterns', duration: 45, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Algorithm Design Patterns'),
      skillId: findSkill('Algorithms'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    machineLearning: [
      { name: 'Introduction to ML', content: 'Learn machine learning fundamentals', duration: 30, order: 1 },
      { name: 'Python for ML', content: 'Setup Python ML environment', duration: 25, order: 2 },
      { name: 'NumPy Basics', content: 'Master NumPy for numerical computing', duration: 35, order: 3 },
      { name: 'Pandas for Data', content: 'Learn data manipulation with Pandas', duration: 40, order: 4 },
      { name: 'Data Preprocessing', content: 'Clean and prepare data for ML', duration: 35, order: 5 },
      { name: 'Supervised Learning', content: 'Understand classification and regression', duration: 40, order: 6 },
      { name: 'Linear Regression', content: 'Implement linear regression models', duration: 40, order: 7 },
      { name: 'Logistic Regression', content: 'Build classification models', duration: 40, order: 8 },
      { name: 'Decision Trees', content: 'Learn tree-based models', duration: 45, order: 9 },
      { name: 'Random Forests', content: 'Master ensemble learning', duration: 45, order: 10 },
      { name: 'SVM', content: 'Support Vector Machines for classification', duration: 45, order: 11 },
      { name: 'K-Means Clustering', content: 'Unsupervised learning with clustering', duration: 40, order: 12 },
      { name: 'Neural Networks', content: 'Introduction to deep learning', duration: 50, order: 13 },
      { name: 'Model Evaluation', content: 'Assess model performance', duration: 35, order: 14 },
      { name: 'ML Project Workflow', content: 'End-to-end machine learning project', duration: 45, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Machine Learning Basics'),
      skillId: findSkill('Machine Learning'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    })),

    ai: [
      { name: 'Introduction to AI', content: 'Learn artificial intelligence concepts', duration: 25, order: 1 },
      { name: 'AI vs ML vs DL', content: 'Understand the differences', duration: 20, order: 2 },
      { name: 'Search Algorithms', content: 'Implement AI search strategies', duration: 35, order: 3 },
      { name: 'Knowledge Representation', content: 'Represent knowledge in AI systems', duration: 30, order: 4 },
      { name: 'Expert Systems', content: 'Build rule-based expert systems', duration: 35, order: 5 },
      { name: 'Natural Language Processing', content: 'Introduction to NLP', duration: 40, order: 6 },
      { name: 'Computer Vision Basics', content: 'Learn image processing fundamentals', duration: 40, order: 7 },
      { name: 'Neural Networks Deep Dive', content: 'Understand deep neural networks', duration: 45, order: 8 },
      { name: 'CNNs', content: 'Convolutional Neural Networks', duration: 50, order: 9 },
      { name: 'RNNs and LSTMs', content: 'Recurrent networks for sequences', duration: 50, order: 10 },
      { name: 'Transformers', content: 'Modern attention-based architectures', duration: 50, order: 11 },
      { name: 'Reinforcement Learning', content: 'Learn RL fundamentals', duration: 45, order: 12 },
      { name: 'GANs', content: 'Generative Adversarial Networks', duration: 45, order: 13 },
      { name: 'AI Ethics', content: 'Ethical considerations in AI', duration: 30, order: 14 },
      { name: 'AI Applications', content: 'Real-world AI use cases', duration: 35, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('AI Applications'),
      skillId: findSkill('Artificial Intelligence'),
      contentArray: [l.content],
      type: 'Text' as const,
      points: l.duration
    })),

    blockchain: [
      { name: 'Introduction to Blockchain', content: 'Learn distributed ledger technology', duration: 30, order: 1 },
      { name: 'Cryptography Basics', content: 'Understand hashing and encryption', duration: 35, order: 2 },
      { name: 'Bitcoin Fundamentals', content: 'Learn how Bitcoin works', duration: 40, order: 3 },
      { name: 'Blockchain Structure', content: 'Understand blocks and chains', duration: 35, order: 4 },
      { name: 'Consensus Mechanisms', content: 'PoW, PoS, and other algorithms', duration: 40, order: 5 },
      { name: 'Smart Contracts', content: 'Introduction to programmable contracts', duration: 45, order: 6 },
      { name: 'Ethereum Basics', content: 'Learn Ethereum platform', duration: 40, order: 7 },
      { name: 'Solidity Programming', content: 'Write smart contracts in Solidity', duration: 50, order: 8 },
      { name: 'Web3.js', content: 'Interact with blockchain from web', duration: 45, order: 9 },
      { name: 'DApp Development', content: 'Build decentralized applications', duration: 55, order: 10 },
      { name: 'Token Standards', content: 'ERC-20, ERC-721, and more', duration: 40, order: 11 },
      { name: 'NFTs', content: 'Non-fungible tokens explained', duration: 35, order: 12 },
      { name: 'DeFi Basics', content: 'Decentralized finance concepts', duration: 40, order: 13 },
      { name: 'Blockchain Security', content: 'Secure smart contracts and DApps', duration: 45, order: 14 },
      { name: 'Blockchain Use Cases', content: 'Real-world blockchain applications', duration: 35, order: 15 }
    ].map(l => ({
      ...l,
      moduleId: findModule('Blockchain Development'),
      skillId: findSkill('Blockchain'),
      contentArray: [l.content],
      type: 'Code' as const,
      points: l.duration
    }))
  };
};


