"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  IconButton,
  Switch,
  CloseIcon,
  DoneIcon,
  PendingIcon,
  EditIcon,
  SearchIcon,
} from "../../../packages/ui";
import {} from "../../../packages/ui/assets";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { getAuthHeader } from "@/lib/token-storage";

interface MentorUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  title?: string;
  yoe?: number;
  currentCompany?: string;
}

interface Mentor {
  _id: string;
  userId: MentorUser;
  isMentor: boolean;
  isApproved: boolean;
  level: "L1" | "L2" | "L3";
  customPointRate: number | null;
  effectiveRate: number;
  levelDescription: string;
  headline?: string;
  expertise?: string[];
  currentRole?: string;
  currentCompany?: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

type LevelFilter = "all" | "L1" | "L2" | "L3" | "none";
type ApprovalFilter = "all" | "approved" | "pending";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  // Edit modal state
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [editLevel, setEditLevel] = useState<"L1" | "L2" | "L3">("L3");
  const [editCustomRate, setEditCustomRate] = useState<string>("");
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch mentors
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    startLoading();
    try {
      const headers: HeadersInit = {};
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      let url = "/api/admin/mentors";
      const params = new URLSearchParams();

      if (levelFilter !== "all") {
        params.append("level", levelFilter);
      }

      if (approvalFilter === "approved") {
        params.append("approved", "true");
      } else if (approvalFilter === "pending") {
        params.append("approved", "false");
      }

      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim());
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await fetch(url, {
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setMentors(data.data);
      } else {
        setError(data.error || "Failed to fetch mentors");
      }
    } catch {
      setError("Failed to fetch mentors");
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [
    levelFilter,
    approvalFilter,
    debouncedSearchQuery,
    startLoading,
    stopLoading,
  ]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const headers: HeadersInit = {};
        const authHeader = getAuthHeader();
        if (authHeader) {
          headers["Authorization"] = authHeader;
        }

        const response = await fetch("/api/admin/check", {
          headers,
          credentials: "include",
        });

        const data = await response.json();

        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setError("You do not have admin access");
        }
      } catch {
        setError("Failed to check admin status");
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refetch when filters change
  useEffect(() => {
    if (isAdmin) {
      fetchMentors();
    }
  }, [isAdmin, fetchMentors]);

  const openEditModal = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setEditLevel(mentor.level);
    setUseCustomRate(mentor.customPointRate !== null);
    setEditCustomRate(mentor.customPointRate?.toString() || "");
  };

  const closeEditModal = () => {
    setEditingMentor(null);
    setEditLevel("L3");
    setEditCustomRate("");
    setUseCustomRate(false);
  };

  const handleSave = async () => {
    if (!editingMentor) return;

    setSaving(true);
    startLoading();
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const body: Record<string, unknown> = {
        level: editLevel,
      };

      if (useCustomRate && editCustomRate) {
        body.customPointRate = parseInt(editCustomRate);
      } else {
        body.customPointRate = null;
      }

      const response = await fetch(`/api/admin/mentors/${editingMentor._id}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        closeEditModal();
        // Refetch mentors to get updated data
        await fetchMentors();
      } else {
        setError(data.error || "Failed to update mentor");
      }
    } catch {
      setError("Failed to update mentor");
    } finally {
      setSaving(false);
      stopLoading();
    }
  };

  const handleQuickLevelChange = async (
    mentorId: string,
    newLevel: "L1" | "L2" | "L3"
  ) => {
    startLoading();
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ level: newLevel }),
      });

      const data = await response.json();

      if (data.success) {
        // Refetch mentors to get updated data
        await fetchMentors();
      } else {
        setError(data.error || "Failed to update mentor level");
      }
    } catch {
      setError("Failed to update mentor level");
    } finally {
      stopLoading();
    }
  };

  const toggleApproval = async (mentorId: string, currentStatus: boolean) => {
    startLoading();
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Refetch mentors to get updated data
        await fetchMentors();
      } else {
        setError(data.error || "Failed to update approval status");
      }
    } catch {
      setError("Failed to update approval status");
    } finally {
      stopLoading();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "L1":
        return "bg-gradient-to-r from-amber-500 to-yellow-400 text-black";
      case "L2":
        return "bg-gradient-to-r from-violet-600 to-purple-500 text-white";
      case "L3":
        return "bg-gradient-to-r from-slate-600 to-slate-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "L1":
        return "👑 Elite";
      case "L2":
        return "⭐ Top Tier";
      case "L3":
        return "📘 Standard";
      default:
        return "Unknown";
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-lg">Verifying access...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-slate-400">
              You do not have permission to access the admin dashboard.
            </p>
            <Button
              variant="contained"
              onClick={() => router.push("/dashboard")}
              className="!mt-6 !px-6 !py-3 !bg-black !text-white !rounded-lg !transition-colors"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🛡️</span>
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Manage mentor tiers and approval status
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-medium">
              Admin Access Active
            </span>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <IconButton
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <CloseIcon />
            </IconButton>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Mentors</p>
                <p className="text-2xl font-bold text-white">
                  {mentors.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">L1 Elite</p>
                <p className="text-2xl font-bold text-amber-400">
                  {mentors.filter((m) => m.level === "L1").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">L2 Top Tier</p>
                <p className="text-2xl font-bold text-violet-400">
                  {mentors.filter((m) => m.level === "L2").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {mentors.filter((m) => m.isApproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <label className="block text-sm text-slate-400 mb-2">
            Search Mentors
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, company, or role..."
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery && (
              <IconButton
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <SearchIcon />
              </IconButton>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">
                Filter by Level
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "L1", "L2", "L3", "none"] as LevelFilter[]).map(
                  (level) => (
                    <Button
                      variant="text"
                      key={level}
                      onClick={() => setLevelFilter(level)}
                      className={`!px-4 !py-2 !rounded-lg !text-sm !font-medium !transition-all ${
                        levelFilter === level
                          ? "!bg-indigo-600 !text-white"
                          : "!bg-slate-700/50 !text-slate-300 !hover:bg-slate-700"
                      }`}
                    >
                      {level === "all"
                        ? "All Levels"
                        : level === "none"
                        ? "No Level"
                        : `${getLevelBadge(level)}`}
                    </Button>
                  )
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "approved", "pending"] as ApprovalFilter[]).map(
                  (status) => (
                    <Button
                      variant="text"
                      key={status}
                      onClick={() => setApprovalFilter(status)}
                      className={`!px-4 !py-2 !rounded-lg !text-sm !font-medium !transition-all ${
                        approvalFilter === status
                          ? "!bg-indigo-600 !text-white"
                          : "!bg-slate-700/50 !text-slate-300 !hover:bg-slate-700"
                      }`}
                    >
                      {status === "all"
                        ? "All Status"
                        : status === "approved"
                        ? "✓ Approved"
                        : "⏳ Pending"}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mentors List */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white">
              Mentor Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Click on a mentor to edit their details
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading mentors...</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-400">
                No mentors found matching your filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {mentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="p-5 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {mentor.userId?.firstName?.[0] || "?"}
                        {mentor.userId?.lastName?.[0] || ""}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {mentor.userId?.firstName} {mentor.userId?.lastName}
                        </h3>
                        <p className="text-slate-400 text-sm truncate">
                          {mentor.userId?.email}
                        </p>
                        <p className="text-slate-500 text-xs mt-1 truncate">
                          {mentor.currentRole ||
                            mentor.userId?.title ||
                            "No role set"}
                          {(mentor.currentCompany ||
                            mentor.userId?.currentCompany) &&
                            ` @ ${
                              mentor.currentCompany ||
                              mentor.userId?.currentCompany
                            }`}
                        </p>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getLevelColor(
                          mentor.level
                        )}`}
                      >
                        {getLevelBadge(mentor.level)}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          mentor.isApproved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {mentor.isApproved ? "✓ Approved" : "⏳ Pending"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-slate-400">Rate</p>
                        <p className="text-white font-semibold">
                          {mentor.customPointRate ? (
                            <span className="text-amber-400">
                              {mentor.effectiveRate}★
                            </span>
                          ) : (
                            <span>{mentor.effectiveRate} pts</span>
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400">Sessions</p>
                        <p className="text-white font-semibold">
                          {mentor.completedSessions}/{mentor.totalSessions}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400">Rating</p>
                        <p className="text-white font-semibold">
                          {mentor.averageRating > 0
                            ? `${mentor.averageRating.toFixed(1)} ⭐`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                        {(["L1", "L2", "L3"] as const).map((level) => (
                          <Button
                            variant="text"
                            key={level}
                            onClick={() =>
                              handleQuickLevelChange(mentor._id, level)
                            }
                            className={`!px-3 !py-1.5 !rounded !text-xs !text-white !hover:b-gray-600 !font-medium !transition-all ${
                              mentor.level === level
                                ? getLevelColor(level)
                                : "!text-slate-400 !hover:text-white !hover:bg-slate-600"
                            }`}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                      <IconButton
                        onClick={() =>
                          toggleApproval(mentor._id, mentor.isApproved)
                        }
                        className={` !rounded-lg !transition-colors ${
                          mentor.isApproved
                            ? "!bg-emerald-500/20 !text-emerald-400 !hover:bg-emerald-500/30"
                            : "!bg-amber-500/20 !text-amber-400 !hover:bg-amber-500/30"
                        }`}
                        aria-label={
                          mentor.isApproved
                            ? "Revoke approval"
                            : "Approve mentor"
                        }
                      >
                        {mentor.isApproved ? <DoneIcon /> : <PendingIcon />}
                      </IconButton>
                      <IconButton
                        onClick={() => openEditModal(mentor)}
                        className="!p-2 !rounded-lg !bg-indigo-500/20 !text-indigo-400 !hover:bg-indigo-500/30 !transition-colors"
                        aria-label="Edit mentor details"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level Guide */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">
            📖 Mentor Tier Guide
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(
                    "L1"
                  )}`}
                >
                  L1
                </span>
                <span className="text-white font-semibold">
                  Elite/Consultants
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                High-net-worth individuals, investors, founders, or consultants
                with &gt;1 Cr packages. Primarily for high-level
                networking/advice.
              </p>
              <p className="text-amber-400 text-sm mt-2 font-medium">
                Default: 500 pts/hour
              </p>
            </div>
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(
                    "L2"
                  )}`}
                >
                  L2
                </span>
                <span className="text-white font-semibold">Top Tier Tech</span>
              </div>
              <p className="text-slate-400 text-sm">
                High earners working at top product companies (FAANG, Apple,
                Google, Microsoft, etc.). Technical expertise with industry
                credibility.
              </p>
              <p className="text-violet-400 text-sm mt-2 font-medium">
                Default: 300 pts/hour
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(
                    "L3"
                  )}`}
                >
                  L3
                </span>
                <span className="text-white font-semibold">Standard</span>
              </div>
              <p className="text-slate-400 text-sm">
                Regular employees, largely from the startup ecosystem. New
                mentors default to this tier until reviewed.
              </p>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Default: 100 pts/hour
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Edit Mentor</h3>
              <p className="text-white text-base mt-1">
                {editingMentor.userId?.firstName}{" "}
                {editingMentor.userId?.lastName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Mentor Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["L1", "L2", "L3"] as const).map((level) => (
                    <Button
                      key={level}
                      onClick={() => setEditLevel(level)}
                      className={`!p-4 !rounded-xl !border-2 !transition-all !flex !gap-2 ${
                        editLevel === level
                          ? `${getLevelColor(level)} !border-transparent`
                          : "!border-slate-600 !bg-slate-700/50 !text-slate-300 !hover:border-slate-500"
                      }`}
                    >
                      <div className="text-lg font-bold">{level}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {level === "L1"
                          ? "Elite"
                          : level === "L2"
                          ? "Top Tier"
                          : "Standard"}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Rate */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">
                    Custom Point Rate
                  </label>
                  <Switch
                    checked={useCustomRate}
                    onChange={() => setUseCustomRate(!useCustomRate)}
                  />
                </div>
                {useCustomRate && (
                  <div className="relative">
                    <input
                      type="number"
                      value={editCustomRate}
                      onChange={(e) => setEditCustomRate(e.target.value)}
                      placeholder="Enter custom rate"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      pts/hour
                    </span>
                  </div>
                )}
                {!useCustomRate && (
                  <p className="text-slate-400 text-sm">
                    Using default rate for {editLevel}:{" "}
                    {editLevel === "L1"
                      ? "500"
                      : editLevel === "L2"
                      ? "300"
                      : "100"}{" "}
                    pts/hour
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={closeEditModal}
                className="!px-5 !py-2.5 !rounded-lg !bg-slate-700 !text-slate-300 !hover:bg-slate-600 !transition-colors"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                className="!px-5 !py-2.5 !rounded-lg !bg-indigo-600 !text-white !hover:bg-indigo-700 !transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
