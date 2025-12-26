"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Image from "next/image";
import Loader from "@/components/Loader";
import {
  CompleteProfileModal,
  useProfileGating,
} from "@/components/CompleteProfileModal";
import { Button } from "../../../../packages/ui";

interface Module {
  _id: string;
  name: string;
  description: string;
  level: string;
  skillId?: {
    _id: string;
    name: string;
  };
  duration: number;
  points: number;
  lessonsCount: number;
  icon?: string;
  progress?: {
    status: string;
    completionPercentage: number;
    completedLessonCount: number;
  };
}

interface ModuleProgress {
  moduleId: {
    _id: string;
    name: string;
  };
  status: string;
  completionPercentage: number;
  completedLessonCount: number;
}

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];
const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "relevance", label: "Relevant" },
  { value: "duration", label: "Duration" },
  { value: "points", label: "Points" },
];

const MODULES_PER_PAGE = 12;

export default function ExplorePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<
    Record<string, ModuleProgress>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSort, setSelectedSort] = useState("name");
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Profile gating for starting courses
  const {
    isProfileComplete,
    showModal,
    setShowModal,
    blockedAction,
    checkAndGate,
  } = useProfileGating();
  const [profileJustCompleted, setProfileJustCompleted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/dashboard/explore")}`
      );
      return;
    }
    loadModules();
    loadUserProgress();
  }, [user, router, authLoading]);

  // Refresh user data only once when profile is completed
  useEffect(() => {
    if (profileJustCompleted && refreshUser) {
      setProfileJustCompleted(false);
      // Single refresh after profile completion
      refreshUser().catch(console.error);
    }
  }, [profileJustCompleted, refreshUser]);

  const loadModules = async () => {
    try {
      setIsLoading(true);
      const { authenticatedFetch } = await import("@/lib/api-client");
      const response = await authenticatedFetch(
        `/api/modules?limit=100&page=1`
      );

      if (response.ok) {
        const data = await response.json();
        const modulesList = data.modules || [];
        setAllModules(modulesList);

        const uniqueSkills = Array.from(
          new Set(
            modulesList
              .filter((m: Module) => m.skillId?.name)
              .map((m: Module) => m.skillId!.name)
          )
        ) as string[];
        setSkills(uniqueSkills);
      }
    } catch (error) {
      console.error("Failed to load modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      if (!user?._id) return;
      const { authenticatedFetch } = await import("@/lib/api-client");
      const response = await authenticatedFetch("/api/module-progress");

      if (response.ok) {
        const data = await response.json();
        const progressMap: Record<string, ModuleProgress> = {};
        (data.progress || []).forEach(
          (p: ModuleProgress & { moduleId?: { _id: string } }) => {
            if (p.moduleId?._id) {
              progressMap[p.moduleId._id] = {
                moduleId: p.moduleId,
                status: p.status,
                completionPercentage: p.completionPercentage || 0,
                completedLessonCount: p.completedLessonCount || 0,
              };
            }
          }
        );
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error("Failed to load user progress:", error);
    }
  };

  // Memoized filtering and sorting
  const filteredModules = useMemo(() => {
    let filtered = allModules.map((module) => ({
      ...module,
      progress: userProgress[module._id],
    }));

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (module) =>
          module.name.toLowerCase().includes(query) ||
          module.description.toLowerCase().includes(query) ||
          module.skillId?.name.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (selectedLevel !== "All") {
      filtered = filtered.filter((module) => module.level === selectedLevel);
    }

    // Skill filter
    if (selectedSkill !== "All") {
      filtered = filtered.filter(
        (module) => module.skillId?.name === selectedSkill
      );
    }

    // Separate in-progress and others
    const inProgressModules = filtered.filter(
      (m) => m.progress?.status === "in_progress"
    );
    const otherModules = filtered.filter(
      (m) => !m.progress || m.progress.status !== "in_progress"
    );

    // Sort function
    const sortModules = (modules: Module[]) => {
      const sorted = [...modules];
      switch (selectedSort) {
        case "name":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "duration":
          sorted.sort((a, b) => a.duration - b.duration);
          break;
        case "points":
          sorted.sort((a, b) => b.points - a.points);
          break;
        case "relevance":
          if (user?.domain) {
            sorted.sort((a, b) => {
              const aDomainMatch = a.skillId?.name
                .toLowerCase()
                .includes(user.domain.toLowerCase())
                ? 1
                : 0;
              const bDomainMatch = b.skillId?.name
                .toLowerCase()
                .includes(user.domain.toLowerCase())
                ? 1
                : 0;
              return bDomainMatch - aDomainMatch;
            });
          }
          break;
      }
      return sorted;
    };

    return [...sortModules(inProgressModules), ...sortModules(otherModules)];
  }, [
    allModules,
    searchQuery,
    selectedLevel,
    selectedSort,
    selectedSkill,
    userProgress,
    user?.domain,
  ]);

  // Paginated modules
  const displayedModules = useMemo(() => {
    return filteredModules.slice(0, currentPage * MODULES_PER_PAGE);
  }, [filteredModules, currentPage]);

  const hasMore = displayedModules.length < filteredModules.length;

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedLevel("All");
    setSelectedSkill("All");
    setCurrentPage(1);
  }, []);

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-white border-gray-500/20";
    }
  };

  // Module Card Component - Clean, minimal design
  const ModuleCard = useCallback(
    ({ module }: { module: Module }) => {
      const progress = module.progress;
      const isInProgress = progress?.status === "in_progress";
      const isCompleted = progress?.status === "completed";

      const handleCardClick = (e: React.MouseEvent) => {
        // If profile is incomplete, show modal instead of navigating
        if (!isProfileComplete) {
          e.preventDefault();
          checkAndGate("start this course");
        }
      };

      return (
        <Link
          href={`/dashboard/modules/${module._id}`}
          onClick={handleCardClick}
        >
          <div
            className={`group relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] h-full flex flex-col ${
              isInProgress
                ? "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                : isCompleted
                ? "border-emerald-500/20"
                : "border-gray-800 hover:border-gray-700"
            }`}
          >
            {/* Top accent line */}
            <div
              className={`h-0.5 ${
                isInProgress
                  ? "bg-white"
                  : isCompleted
                  ? "bg-emerald-500"
                  : "bg-gray-800 group-hover:bg-gray-700"
              } transition-colors`}
            />

            <div className="p-5 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-700/50">
                  <Image
                    src={
                      module.icon ||
                      "https://imgs.search.brave.com/0amGyAiF3uFKKjlFLdALYRLoeTeTOygh1JCd-4MlrA8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZy/ZWVwaWsuY29tLzI1/Ni83ODM3Lzc4Mzcx/NTcucG5nP3NlbXQ9/YWlzX3doaXRlX2xh/YmVs"
                    }
                    className="w-7 h-7 object-contain"
                    alt={module.name}
                    width={28}
                    height={28}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-gray-100 transition-colors leading-tight">
                    {module.name}
                  </h3>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getLevelStyles(
                    module.level
                  )}`}
                >
                  {module.level}
                </span>
                {module.skillId && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-white rounded-full border border-gray-700/50 font-medium">
                    {module.skillId.name}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-white mb-4 line-clamp-2 flex-1 leading-relaxed">
                {module.description}
              </p>

              {/* Progress Bar */}
              {isInProgress && progress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] text-white mb-1.5">
                    <span>
                      {progress.completedLessonCount}/{module.lessonsCount}{" "}
                      lessons
                    </span>
                    <span className="font-semibold text-white">
                      {progress.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ width: `${progress.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div className="flex items-center gap-3 text-[10px] text-white">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {module.lessonsCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {Math.ceil(module.duration / 60)}h
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {module.points}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            {(isInProgress || isCompleted) && (
              <div
                className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                  isInProgress ? "bg-white animate-pulse" : "bg-emerald-500"
                }`}
              />
            )}
          </div>
        </Link>
      );
    },
    [isProfileComplete, checkAndGate]
  );

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white" />
            <Loader message="Loading modules data..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        onComplete={() => {
          // Mark that profile was just completed - useEffect will handle refresh
          setProfileJustCompleted(true);
        }}
        blockedAction={blockedAction}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Explore</h1>
          <p className="text-sm text-white">
            {filteredModules.length} courses available
          </p>
        </div>

        {/* Search and Filters - Compact, minimal design */}
        <div className="mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Level Filter Pills */}
            <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
              {LEVELS.map((level) => (
                <Button
                  variant="text"
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`!px-3 !py-1.5 !rounded-md !text-xs !font-medium !transition-all ${
                    selectedLevel === level
                      ? "!bg-white !text-black"
                      : "!text-gray-400 !hover:!text-white"
                  }`}
                >
                  {level}
                </Button>
              ))}
            </div>

            {/* Skill Dropdown */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-gray-700 cursor-pointer"
            >
              <option value="All">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-gray-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchQuery ||
              selectedLevel !== "All" ||
              selectedSkill !== "All") && (
              <Button
                variant="text"
                onClick={clearFilters}
                className="!px-3 !py-2 !text-xs !text-white !hover:!text-white !transition-colors"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Modules Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-2xl h-64 animate-pulse border border-gray-800"
              >
                <div className="h-0.5 bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-800 rounded-full w-16" />
                    <div className="h-5 bg-gray-800 rounded-full w-12" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-800 rounded w-full" />
                    <div className="h-2 bg-gray-800 rounded w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedModules.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <svg
                className="w-7 h-7 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No courses found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your filters
            </p>
            <Button
              variant="text"
              onClick={clearFilters}
              className="!px-5 !py-2 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:!bg-gray-100 !transition-colors"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* In Progress Section */}
            {displayedModules.some(
              (m) => m.progress?.status === "in_progress"
            ) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <h2 className="text-sm font-medium text-white">
                    Continue Learning
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedModules
                    .filter((m) => m.progress?.status === "in_progress")
                    .map((module) => (
                      <ModuleCard key={module._id} module={module} />
                    ))}
                </div>
              </div>
            )}

            {/* All Courses Section */}
            <div>
              {displayedModules.some(
                (m) => m.progress?.status === "in_progress"
              ) && (
                <h2 className="text-sm font-medium text-gray-400 mb-4">
                  All Courses
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedModules
                  .filter((m) => m.progress?.status !== "in_progress")
                  .map((module) => (
                    <ModuleCard key={module._id} module={module} />
                  ))}
              </div>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="text"
                  onClick={loadMore}
                  className="!px-6 !py-2.5 !bg-gray-900 !text-white !rounded-lg !text-sm !font-medium !border !border-gray-800 !hover:!border-gray-700 !transition-colors"
                >
                  Load More ({filteredModules.length - displayedModules.length}{" "}
                  more)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
