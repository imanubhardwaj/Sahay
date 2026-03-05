"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getAllModulesForUserType,
  getUserTypeDisplayName,
} from "@/lib/modules";
import Image from "next/image";
import Loader from "@/components/Loader";
import { DEFAULT_MODULE_ICON } from "@/app/dashboard/utils/constants";
import { Button } from "../../../packages/ui";

// Helper function to get time ago string
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface DashboardStats {
  totalModules: number;
  completedModules: number;
  totalPoints: number;
  currentRank: number;
  overallCompletionPercentage: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  points: number;
  time: string;
  icon: string;
}

interface ApiModule {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  description: string;
  icon?: string;
  image?: string;
  lessonsCount?: number;
  lessons?: unknown[];
  points?: number;
  level?: string;
  duration?: number;
  skillId?: {
    _id: string;
    name: string;
  };
  totalPoints?: number;
}

interface ModuleProgress {
  module: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    image?: string;
    lessons?: number;
    points?: number;
    level?: string;
    progress?: number;
  };
  status: "not_started" | "in_progress" | "completed";
  progress: number;
}

interface UserModule {
  moduleId?: string;
  status?: string;
  progress?: number;
}

interface LessonProgress {
  progress?: {
    status?: string;
    completedAt?: string;
  };
  lesson?: {
    name?: string;
    points?: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalModules: 0,
    completedModules: 0,
    totalPoints: 0,
    currentRank: 0,
    overallCompletionPercentage: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    let completedModules = 0;
    let inProgressModules = 0;

    try {
      setIsLoading(true);

      if (!user?.userType) {
        console.error("User type not found");
        return;
      }

      // Fetch modules from API
      let allModules: ApiModule[] = [];
      try {
        // Use authenticated fetch to include token
        const { authenticatedFetch } = await import("@/lib/api-client");
        const modulesResponse = await authenticatedFetch("/api/modules");
        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          allModules = modulesData.modules || [];
        } else {
          // Fallback to local modules if API fails - convert to ApiModule format
          const localModules = getAllModulesForUserType(user.userType);
          allModules = localModules.map((m) => ({
            _id: m.id,
            id: m.id,
            name: m.title,
            title: m.title,
            description: m.description,
            icon: "📚",
            lessonsCount: 0,
            points: 0,
            level: "Beginner",
          }));
        }
      } catch (error) {
        console.error(
          "Failed to fetch modules from API, using fallback:",
          error
        );
        // Fallback to local modules
        const localModules = getAllModulesForUserType(user.userType);
        allModules = localModules.map((m) => ({
          _id: m.id,
          id: m.id,
          name: m.title,
          title: m.title,
          description: m.description,
          icon: "📚",
          lessonsCount: 0,
          points: 0,
          level: "Beginner",
        }));
      }

      const totalModules = allModules.length;

      // Fetch user's module progress from API
      const moduleProgress: ModuleProgress[] = [];

      try {
        // Use authenticated fetch to automatically include token
        const { authenticatedFetch } = await import("@/lib/api-client");
        const progressResponse = await authenticatedFetch(
          `/api/module-progress?userId=${user._id}`
        );
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const userProgress = progressData.progress || [];

          // Create a map of module progress
          const progressMap = userProgress.reduce(
            (
              map: Record<
                string,
                { status?: string; completionPercentage?: number }
              >,
              p: {
                moduleId?: { _id?: string } | string;
                status?: string;
                completionPercentage?: number;
              }
            ) => {
              // Handle null moduleId (module might have been deleted)
              if (p.moduleId) {
                const moduleId =
                  typeof p.moduleId === "object" && p.moduleId._id
                    ? p.moduleId._id
                    : typeof p.moduleId === "string"
                    ? p.moduleId
                    : null;
                if (moduleId) {
                  map[moduleId] = p;
                }
              }
              return map;
            },
            {}
          );

          // Calculate stats
          completedModules = userProgress.filter(
            (p: { status?: string }) => p.status === "completed"
          ).length;
          inProgressModules = userProgress.filter(
            (p: { status?: string }) => p.status === "in_progress"
          ).length;

          // Map modules with progress
          allModules.forEach((module: ApiModule) => {
            const moduleId = module._id || module.id || "";
            const progress = progressMap[moduleId];
            moduleProgress.push({
              module: {
                id: moduleId,
                title: module.name || module.title || "",
                description: module.description || "",
                icon: module.icon || DEFAULT_MODULE_ICON,
                image: module.image,
                progress: progress?.completionPercentage || 0,
                lessons: module.lessonsCount || module.lessons?.length || 0,
                points: module.points || 0,
                level: module.level || "Beginner",
              },
              status:
                (progress?.status as
                  | "not_started"
                  | "in_progress"
                  | "completed") || "not_started",
              progress: progress?.completionPercentage || 0,
            });
          });
        } else {
          // Fallback: use user's selectedModules if progress API fails
          completedModules =
            user.selectedModules?.filter(
              (module: { status?: string }) => module.status === "completed"
            ).length || 0;
          inProgressModules =
            user.selectedModules?.filter(
              (module: { status?: string }) => module.status === "in_progress"
            ).length || 0;

          allModules.forEach((module: ApiModule) => {
            const moduleId = module._id || module.id || "";
            const userModule = user.selectedModules?.find(
              (um: { moduleId?: string }) => um.moduleId === moduleId
            );
            moduleProgress.push({
              module: {
                id: moduleId,
                title: module.name || module.title || "",
                description: module.description || "",
                icon: module.icon || DEFAULT_MODULE_ICON,
                image: module.image,
                progress: (userModule as { progress?: number })?.progress || 0,
                lessons: module.lessonsCount || module.lessons?.length || 0,
                points: module.points || 0,
                level: module.level || "Beginner",
              },
              status:
                ((userModule as { status?: string })?.status as
                  | "not_started"
                  | "in_progress"
                  | "completed") || "not_started",
              progress: (userModule as { progress?: number })?.progress || 0,
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch module progress:", error);
        // Use fallback data
        completedModules =
          user.selectedModules?.filter(
            (module: UserModule) => module.status === "completed"
          ).length || 0;
        inProgressModules =
          user.selectedModules?.filter(
            (module: UserModule) => module.status === "in_progress"
          ).length || 0;
      }

      setModules(moduleProgress);

      const overallCompletionPercentage =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      // Fetch user's real rank
      let currentRank = 0;
      try {
        const { getAuthHeaders } = await import("@/lib/token-storage");
        const rankResponse = await fetch(`/api/user/rank?userId=${user._id}`, {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          currentRank = rankData.rank || 1;
        }
      } catch (error) {
        console.error("Failed to fetch user rank:", error);
        currentRank = 1; // Default to rank 1 if fetch fails
      }

      setStats({
        totalModules,
        completedModules,
        totalPoints: user.points || 0,
        currentRank,
        overallCompletionPercentage,
      });

      // Fetch recent activity from actual lesson completions
      const recentActivityData: RecentActivity[] = [];

      try {
        // Fetch recent lesson completions
        const recentLessonsResponse = await fetch(
          `/api/lesson-progress?userId=${user._id}&recent=true`
        );
        if (recentLessonsResponse.ok) {
          const recentData = await recentLessonsResponse.json();
          const recentCompletions =
            recentData.lessonsWithProgress
              ?.filter(
                (lp: LessonProgress) =>
                  lp.progress?.status === "completed" &&
                  lp.progress?.completedAt
              )
              .slice(0, 3) || [];

          recentCompletions.forEach(
            (completion: LessonProgress, index: number) => {
              const completedAt = new Date(
                completion.progress?.completedAt || ""
              );
              const timeAgo = getTimeAgo(completedAt);

              recentActivityData.push({
                id: index + 1,
                type: "lesson_completed",
                title: `Completed: ${completion.lesson?.name || ""}`,
                points: completion.lesson?.points || 0,
                time: timeAgo,
                icon: "✅",
              });
            }
          );
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      }

      // Add module-level activities if no recent lessons
      if (recentActivityData.length === 0) {
        if (completedModules > 0) {
          recentActivityData.push({
            id: 1,
            type: "module_completed",
            title: `Completed ${completedModules} module${
              completedModules > 1 ? "s" : ""
            }`,
            points: completedModules * 50,
            time: "Recently",
            icon: "📚",
          });
        }

        if (inProgressModules > 0) {
          recentActivityData.push({
            id: 2,
            type: "module_started",
            title: `Started ${inProgressModules} module${
              inProgressModules > 1 ? "s" : ""
            }`,
            points: inProgressModules * 10,
            time: "Recently",
            icon: "🚀",
          });
        }

        if (user.skills && user.skills.length > 0) {
          recentActivityData.push({
            id: 3,
            type: "skills_updated",
            title: `Added ${user.skills.length} skill${
              user.skills.length > 1 ? "s" : ""
            } to profile`,
            points: user.skills.length * 5,
            time: "Recently",
            icon: "🎯",
          });
        }
      }

      setRecentActivity(recentActivityData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // NON-INTRUSIVE: Allow users to view dashboard without completing onboarding
    // They can explore freely - action gating will restrict critical actions
    loadDashboardData();
  }, [user, router, loadDashboardData]);

  if (!user) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-blue-100 text-sm">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📚</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.completedModules}/{stats.totalModules}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Modules Completed
            </h3>
            <p className="text-xs text-gray-500">
              {stats.overallCompletionPercentage}% completion rate
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⭐</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {stats.totalPoints}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Total Points
            </h3>
            <p className="text-xs text-gray-500">Earned through learning</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏆</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                #{stats.currentRank || "N/A"}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Current Rank
            </h3>
            <p className="text-xs text-gray-500">Among all learners</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {stats.overallCompletionPercentage}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Progress</h3>
            <p className="text-xs text-gray-500">Overall completion</p>
          </div>
        </div>

        {/* Learning Path Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Your Learning Path
              </h2>
              <p className="text-sm text-gray-600">
                {getUserTypeDisplayName(user.userType)} - {user.domain}
              </p>
            </div>
            <Link href="/dashboard/explore">
              <Button
                variant="outlined"
                className=" !bg-white !text-black !rounded-lg !hover:scale-105 !transition-all !duration-300 !cursor-pointer"
              >
                View All Modules
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-lg p-4 h-32"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.slice(0, 6).map((moduleProgress) => (
                <Link
                  href={`/dashboard/modules/${moduleProgress.module.id}`}
                  key={moduleProgress.module.id}
                >
                  <div
                    key={moduleProgress.module.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {moduleProgress.module.icon && (
                            <Image
                              width={32}
                              height={32}
                              src={moduleProgress.module.icon}
                              alt={moduleProgress.module.title}
                              className="object-contain flex-shrink-0 rounded-lg"
                            />
                          )}
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {moduleProgress.module.title}
                          </h3>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                            moduleProgress.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : moduleProgress.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {moduleProgress.status === "completed"
                            ? "✓"
                            : moduleProgress.status === "in_progress"
                            ? "⏳"
                            : "○"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {moduleProgress.module.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>
                            📚 {moduleProgress.module.lessons} lessons
                          </span>
                          <span>⭐ {moduleProgress.module.points} pts</span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${
                              moduleProgress.module.level === "Beginner"
                                ? "bg-green-100 text-green-700"
                                : moduleProgress.module.level === "Intermediate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {moduleProgress.module.level}
                          </span>
                        </div>
                        {moduleProgress.status === "in_progress" && (
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${moduleProgress.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {modules.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">📚</span>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No modules available
              </h3>
              <p className="text-xs text-gray-500">
                Complete your onboarding to see your personalized learning path.
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>

              {isLoading ? (
                <div className="space-y-3 h-full">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-sm">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-green-600">
                          +{activity.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentActivity.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">📈</span>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No activity yet
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Start learning to see your progress here!
                  </p>
                  <Link href="/dashboard/explore">
                    <Button
                      variant="contained"
                      className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white"
                    >
                      Explore Modules
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Continue Learning */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 h-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Continue Learning
            </h3>
            <div className="space-y-3">
              {(() => {
                const inProgressModule = modules.find(
                  (m) => m.status === "in_progress"
                );
                const completedModule = modules.find(
                  (m) => m.status === "completed"
                );
                const nextModule = modules.find(
                  (m) => m.status === "not_started"
                );

                const displayModule =
                  inProgressModule || completedModule || nextModule;

                if (!displayModule) {
                  return (
                    <div className="text-center py-4">
                      <span className="text-2xl mb-2 block">📚</span>
                      <p className="text-xs text-gray-500 mb-3">
                        No modules available
                      </p>
                      <Link href="/dashboard/explore">
                        <Button
                          variant="contained"
                          className="!w-full !bg-gradient-to-r !from-indigo-500 !to-blue-500 !text-white"
                        >
                          Explore Modules
                        </Button>
                      </Link>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {displayModule.module.title}
                      </h4>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${displayModule.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {displayModule.progress}% complete •{" "}
                        {displayModule.module.lessons} lessons
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/modules/${displayModule.module.id}`}
                    >
                      <Button
                        variant="outlined"
                        className="!w-full !text-black !px-4 !py-2 !rounded-lg !hover:scale-105 !transition-all !duration-300"
                      >
                        {displayModule.status === "in_progress"
                          ? "Continue"
                          : displayModule.status === "completed"
                          ? "Review"
                          : "Start"}
                      </Button>
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/community">
                <Button
                  variant="outlined"
                  className="!w-full !text-black !justify-start !text-left !border-gray-200 !hover:bg-gray-50 !cursor-pointer"
                >
                  <span className="mr-2 text-xs">💬</span>
                  Ask a Question
                </Button>
              </Link>
              <Link href="/dashboard/portfolio">
                <Button
                  variant="outlined"
                  className="!w-full !text-black !justify-start !text-left !border-gray-200 !hover:bg-gray-50 !cursor-pointer"
                >
                  <span className="mr-2 text-xs">🎨</span>
                  Add Project
                </Button>
              </Link>
              <Link href="/dashboard/mentors">
                <Button
                  variant="outlined"
                  className="!w-full !text-black !justify-start !text-left !border-gray-200 !hover:bg-gray-50 !cursor-pointer"
                >
                  <span className="mr-2 text-xs">👨‍🏫</span>
                  Book Mentor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Learning Progress
            </h3>
            <div className="space-y-3">
              {modules.slice(0, 3).map((moduleProgress, index) => {
                const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500"];
                const color = colors[index] || "bg-gray-500";

                return (
                  <div key={moduleProgress.module.id}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">
                        {moduleProgress.module.title}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {moduleProgress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`${color} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${moduleProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {modules.length === 0 && !isLoading && (
                <div className="text-center py-4">
                  <span className="text-2xl mb-2 block">📊</span>
                  <p className="text-xs text-gray-500">
                    Start learning to see progress
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📚</span>
                  <span className="text-xs font-medium text-gray-900">
                    Total Lessons
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600">
                  {modules.reduce((sum, m) => sum + (m.module.lessons || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">✅</span>
                  <span className="text-xs font-medium text-gray-900">
                    Completed
                  </span>
                </div>
                <span className="text-xs font-bold text-green-600">
                  {stats.completedModules}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-medium text-gray-900">
                    Total Points
                  </span>
                </div>
                <span className="text-xs font-bold text-yellow-600">
                  {user.points || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs font-medium text-gray-900">
                    In Progress
                  </span>
                </div>
                <span className="text-xs font-bold text-purple-600">
                  {modules.filter((m) => m.status === "in_progress").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
