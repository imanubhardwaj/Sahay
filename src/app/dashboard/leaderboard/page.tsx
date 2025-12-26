"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Loader from "@/components/Loader";
import { Button } from "../../../../packages/ui";
// Removed mock API - using real API calls

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  points?: number;
  completionRate?: number;
}

interface LeaderboardUser extends User {
  rank: number;
  achievement_level: string;
  badges: string[];
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");

  const getAchievementLevel = useCallback((points: number) => {
    if (points >= 1000) return "Master";
    if (points >= 500) return "Expert";
    if (points >= 200) return "Advanced";
    if (points >= 100) return "Intermediate";
    return "Beginner";
  }, []);

  const getBadges = useCallback((user: User) => {
    const badges = [];
    const points = user.points || 0;
    const completionRate = user.completionRate || 0;
    if (points >= 1000) badges.push("🏆");
    if (completionRate >= 80) badges.push("📚");
    if (points >= 500) badges.push("⭐");
    if (completionRate >= 50) badges.push("🎯");
    return badges;
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/leaderboard");
      const users = await response.json();

      // Add rank and achievement data
      const leaderboardWithRank: LeaderboardUser[] = users.map(
        (user: User, index: number) => ({
          ...user,
          rank: index + 1,
          achievement_level: getAchievementLevel(user.points || 0),
          badges: getBadges(user),
        })
      );

      setLeaderboard(leaderboardWithRank);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAchievementLevel, getBadges]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadLeaderboard();
  }, [user, router, timeframe, loadLeaderboard]);

  const getRankColor = useCallback((rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-blue-500 to-purple-500";
  }, []);

  const getRankIcon = useCallback((rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }, []);

  const getAchievementColor = useCallback((level: string) => {
    switch (level) {
      case "Master":
        return "from-purple-500 to-pink-500";
      case "Expert":
        return "from-blue-500 to-indigo-500";
      case "Advanced":
        return "from-green-500 to-teal-500";
      case "Intermediate":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-400 to-gray-600";
    }
  }, []);

  const currentUserRank = leaderboard.find((u) => u._id === user?._id);
  const topThree = leaderboard.slice(0, 3);

  if (!user) {
    return <Loader message="Loading leaderboard data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard 🏆</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how you rank among fellow learners and celebrate achievements!
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Timeframe:
            </span>
            {[
              { key: "all", label: "All Time" },
              { key: "month", label: "This Month" },
              { key: "week", label: "This Week" },
            ].map(({ key, label }) => (
              <Button
                variant="text"
                key={key}
                onClick={() => setTimeframe(key as "all" | "month" | "week")}
                className={`!px-6 !py-2 !rounded-2xl !font-medium !transition-all !duration-200 ${
                  timeframe === key
                    ? "!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !shadow-lg"
                    : "!bg-gray-100 !text-gray-700 !hover:!bg-gray-200"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="bg-gradient-to-r from-yellow-50 via-gray-50 to-orange-50 rounded-3xl p-8 border border-yellow-200/50 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🏆 Top Performers
            </h2>
            <div className="flex items-end justify-center space-x-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {topThree[1].name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">
                    {topThree[1].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {topThree[1].points} points
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {topThree[1].badges.map((badge, i) => (
                      <span key={i} className="text-lg">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                      {topThree[0].name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {topThree[0].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {topThree[0].points} points
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {topThree[0].badges.map((badge, i) => (
                      <span key={i} className="text-xl">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {topThree[2].name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">
                    {topThree[2].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {topThree[2].points} points
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {topThree[2].badges.map((badge, i) => (
                      <span key={i} className="text-lg">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Your Rank */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-200/50 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Your Ranking
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {currentUserRank.rank}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {currentUserRank.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {currentUserRank.points} points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getAchievementColor(
                    currentUserRank.achievement_level
                  )}`}
                >
                  {currentUserRank.achievement_level}
                </div>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {currentUserRank.badges.map((badge, i) => (
                    <span key={i} className="text-lg">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Full Leaderboard
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((user) => (
                <div
                  key={user._id}
                  className={`p-6 hover:bg-gray-50 transition-all duration-200 ${
                    user._id === currentUserRank?._id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${getRankColor(
                            user.rank
                          )}`}
                        >
                          {getRankIcon(user.rank)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{user.name}</span>
                            {user._id === currentUserRank?._id && (
                              <span className="text-blue-600 text-sm">
                                (You)
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.points}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-700">
                          {user.completionRate}%
                        </div>
                        <div className="text-xs text-gray-500">completion</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getAchievementColor(
                            user.achievement_level
                          )}`}
                        >
                          {user.achievement_level}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {user.badges.map((badge, i) => (
                          <span key={i} className="text-lg">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Levels */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🎖️ Achievement Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                level: "Beginner",
                points: 0,
                color: "from-gray-400 to-gray-600",
                icon: "🌱",
              },
              {
                level: "Intermediate",
                points: 100,
                color: "from-yellow-500 to-orange-500",
                icon: "📈",
              },
              {
                level: "Advanced",
                points: 200,
                color: "from-green-500 to-teal-500",
                icon: "🚀",
              },
              {
                level: "Expert",
                points: 500,
                color: "from-blue-500 to-indigo-500",
                icon: "🎯",
              },
              {
                level: "Master",
                points: 1000,
                color: "from-purple-500 to-pink-500",
                icon: "👑",
              },
            ].map(({ level, points, color, icon }) => (
              <div
                key={level}
                className="text-center bg-white/60 rounded-2xl p-4 backdrop-blur-sm"
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${color} mb-2`}
                >
                  {level}
                </div>
                <div className="text-xs text-gray-600">{points}+ points</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
