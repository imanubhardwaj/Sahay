"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/Input";

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
}

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "name", label: "Name (A-Z)" },
  { value: "duration", label: "Duration" },
  { value: "points", label: "Points" },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSort, setSelectedSort] = useState("relevance");
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("All");

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
      const response = await fetch("/api/modules");

      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);

        // Extract unique skills
        const uniqueSkills = Array.from(
          new Set(
            data.modules
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

  useEffect(() => {
    filterAndSortModules();
  }, [modules, searchQuery, selectedLevel, selectedSort, selectedSkill]);

  const filterAndSortModules = () => {
    let filtered = [...modules];

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

    // Sort
    switch (selectedSort) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case "points":
        filtered.sort((a, b) => b.points - a.points);
        break;
      case "relevance":
      default:
        // If user has a domain, prioritize modules related to it
        if (user?.domain) {
          filtered.sort((a, b) => {
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

    setFilteredModules(filtered);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Explore Modules</h1>
          <p className="text-blue-100">
            Discover and learn from our comprehensive collection of courses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Input
                type="text"
                placeholder="Search modules by name, description, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-lg"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4">
              {/* Level Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill/Technology
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Skills</option>
                  {skills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                Showing {filteredModules.length} of {modules.length} modules
              </span>
              {(searchQuery ||
                selectedLevel !== "All" ||
                selectedSkill !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLevel("All");
                    setSelectedSkill("All");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-xl h-64"
              ></div>
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No modules found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("All");
                setSelectedSkill("All");
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Link key={module._id} href={`/dashboard/modules/${module._id}`}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {module.name}
                      </h3>
                      {module.skillId && (
                        <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {module.skillId.name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getLevelColor(
                        module.level
                      )}`}
                    >
                      {module.level}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                    {module.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        📚 {module.lessonsCount || 0} lessons
                      </span>
                      <span className="flex items-center">
                        ⏱️ {module.duration} min
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-600 font-medium text-sm">
                      ⭐ {module.points} pts
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
