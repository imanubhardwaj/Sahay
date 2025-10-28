"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
// Removed mock API - using real API calls

interface Module {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  points: number;
  lessons: unknown[];
  quizzes: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface UserProgress {
  completed: boolean;
  progress: number;
}

interface ModuleWithProgress extends Module {
  userProgress?: UserProgress;
}

interface ApiModule {
  _id: string;
  name: string;
  description: string;
  difficulty?: string;
  category?: string;
  duration?: number;
  points?: number;
  skillId?: {
    _id: string;
    name: string;
  };
}

export default function ModulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadModules();
  }, [user, router]);

  const loadModules = async () => {
    try {
      setIsLoading(true);
      
      // Fetch modules from real API
      const response = await fetch('/api/modules');
      
      if (response.ok) {
        const data = await response.json();
        
        // Fetch user progress for all modules
        const progressResponse = await fetch(`/api/module-progress?userId=${user!._id}`);
        let userProgressMap: any = {};
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          userProgressMap = progressData.progress?.reduce((map: any, p: any) => {
            map[p.moduleId._id || p.moduleId] = p;
            return map;
          }, {}) || {};
        }
        
        const apiModules: ModuleWithProgress[] = data.modules.map((module: ApiModule) => {
          const progress = userProgressMap[module._id];
          return {
            _id: module._id,
            title: module.name,
            description: module.description,
            difficulty: module.difficulty || 'Beginner',
            category: module.category || 'Programming',
            estimatedDuration: module.duration || 30,
            points: module.points || 100,
            lessons: [],
            quizzes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userProgress: progress ? {
              completed: progress.status === 'completed',
              progress: progress.completionPercentage || 0
            } : {
              completed: false,
              progress: 0
            }
          };
        });
        setModules(apiModules);
        setIsLoading(false);
        return;
      }
      
      // Fallback to mock data if API fails
      const mockModules: ModuleWithProgress[] = [
        {
          _id: '1',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming language',
          category: 'Programming',
          difficulty: 'beginner',
          estimatedDuration: 120,
          points: 100,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: false,
            progress: 65
          }
        },
        {
          _id: '2',
          title: 'React Components',
          description: 'Understanding React components and their lifecycle',
          category: 'Frontend',
          difficulty: 'intermediate',
          estimatedDuration: 180,
          points: 150,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: true,
            progress: 100
          }
        },
        {
          _id: '3',
          title: 'Node.js Backend Development',
          description: 'Building server-side applications with Node.js',
          category: 'Backend',
          difficulty: 'intermediate',
          estimatedDuration: 240,
          points: 200,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: false,
            progress: 30
          }
        },
        {
          _id: '4',
          title: 'Python Basics',
          description: 'Introduction to Python programming',
          category: 'Programming',
          difficulty: 'beginner',
          estimatedDuration: 150,
          points: 125,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: false,
            progress: 0
          }
        },
        {
          _id: '5',
          title: 'Java Object-Oriented Programming',
          description: 'Learn OOP concepts in Java',
          category: 'Programming',
          difficulty: 'advanced',
          estimatedDuration: 200,
          points: 175,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: false,
            progress: 0
          }
        },
        {
          _id: '6',
          title: 'React Hooks Deep Dive',
          description: 'Master React Hooks for state management',
          category: 'Frontend',
          difficulty: 'advanced',
          estimatedDuration: 160,
          points: 140,
          lessons: [],
          quizzes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userProgress: {
            completed: false,
            progress: 0
          }
        }
      ];

      setModules(mockModules);
    } catch (error) {
      console.error("Failed to load modules:", error);
      // Set empty array as fallback
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartModule = async (moduleId: string) => {
    try {
      // Navigate directly to module page - no need to call API
      router.push(`/dashboard/modules/${moduleId}`);
    } catch (error) {
      console.error("Failed to start module:", error);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set((modules || []).map((m) => m.category))),
  ];
  const filteredModules = (modules || []).filter((module) => {
    const matchesCategory =
      selectedCategory === "All" || (module.category || 'Programming') === selectedCategory;
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "from-green-500 to-emerald-500";
      case "intermediate":
        return "from-yellow-500 to-orange-500";
      case "advanced":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "from-green-50 to-emerald-50 border-green-200";
      case "intermediate":
        return "from-yellow-50 to-orange-50 border-yellow-200";
      case "advanced":
        return "from-red-50 to-pink-50 border-red-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Explore Learning Modules 🚀
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master new skills with our interactive learning modules. Track your
            progress and earn points!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div
                key={module._id}
                className={`bg-gradient-to-br ${getDifficultyBg(
                  module.difficulty || 'Beginner'
                )} rounded-3xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
              >
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {module.description}
                    </p>
                  </div>
                  {module.userProgress?.completed && (
                    <div className="ml-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Module Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {module.category || 'Programming'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Difficulty</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyColor(
                        module.difficulty
                      )}`}
                    >
                      {(module.difficulty || 'Beginner').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reward</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-bold text-yellow-600">
                        +{module.points || 100}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {module.userProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-gray-900">
                        {module.userProgress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${module.userProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {module.userProgress?.completed ? (
                    <button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      disabled
                    >
                      <span className="mr-2">✅</span>
                      Completed
                    </button>
                  ) : module.userProgress ? (
                    <Link href={`/dashboard/modules/${module._id}`}>
                      <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-500 hover:text-white cursor-pointer px-4 py-2 rounded-lg">
                        Continue Learning
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleStartModule(module._id)}
                      className="w-full border border-green-600 text-green-600 hover:bg-green-500 hover:text-white cursor-pointer px-4 py-2 rounded-lg"
                    >
                      Start Module
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredModules.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No modules found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-200/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Your Learning Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-green-600 mb-2">
                {(modules || []).filter((m) => m.userProgress?.completed).length}
              </div>
              <div className="text-gray-700 font-medium">Completed Modules</div>
            </div>
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-yellow-600 mb-2">
                {
                  (modules || []).filter(
                    (m) => m.userProgress && !m.userProgress.completed
                  ).length
                }
              </div>
              <div className="text-gray-700 font-medium">In Progress</div>
            </div>
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-blue-600 mb-2">
                {(modules || []).reduce(
                  (sum, m) => sum + (m.userProgress?.completed ? m.points : 0),
                  0
                )}
              </div>
              <div className="text-gray-700 font-medium">Points Earned</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
