"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaStar,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaTwitter,
  FaCalendarAlt,
  FaBriefcase,
  FaShareAlt,
} from "react-icons/fa";
import { HiBadgeCheck, HiLightningBolt } from "react-icons/hi";
import { CompanyBadge, SkillBadge } from "@/components/MentorCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

interface MentorProfile {
  _id: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  bio?: string;
  headline?: string;
  expertise?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  currentRole?: string;
  currentCompany?: string;
  pastCompanies?: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  googleConnected?: boolean;
  linkedIn?: string;
  twitter?: string;
  github?: string;
  website?: string;
  sessionTypes?: Array<{
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>;
}

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMentorProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch(`/api/mentor-profile?mentorId=${mentorId}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success && result.data) {
        setMentor(result.data);
      } else {
        setError(result.error || "Mentor not found");
      }
    } catch (err) {
      console.error("Failed to load mentor profile:", err);
      setError("Failed to load mentor profile");
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    loadMentorProfile();
  }, [mentorId, loadMentorProfile]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mentor?.userId?.firstName} ${mentor?.userId?.lastName} - Mentor Profile`,
          text: `Check out ${mentor?.userId?.firstName}'s mentor profile on Sahay`,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.error("Share cancelled:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Profile link copied to clipboard!");
    }
  }, [mentor]);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !mentor) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Mentor Not Found
            </h2>
            <p className="text-slate-400 mb-6">
              {error || "The mentor profile you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => router.push("/dashboard/mentors")}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors"
            >
              Browse Mentors
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isOwnProfile = user?._id === mentor.userId?._id;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-6">
          {/* Cover Image Placeholder */}
          <div className="h-48 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20" />

          {/* Profile Header */}
          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="relative">
                  <Image
                    src={
                      mentor.userId?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (mentor.userId?.firstName || "") +
                          " " +
                          (mentor.userId?.lastName || "")
                      )}&background=6366f1&color=fff&bold=true&size=200`
                    }
                    alt=""
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-2xl ring-4 ring-slate-900 object-cover"
                  />
                  {mentor.googleConnected && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {mentor.userId?.firstName} {mentor.userId?.lastName}
                    </h1>
                    {mentor.averageRating >= 4.5 && (
                      <HiBadgeCheck className="w-6 h-6 text-violet-400" />
                    )}
                  </div>
                  <p className="text-xl text-slate-300 mb-3">
                    {mentor.headline || mentor.currentRole || "Mentor"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    {mentor.currentCompany && (
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="w-4 h-4" />
                        <span>{mentor.currentCompany}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>
                        {mentor.yearsOfExperience || 0}+ years experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-amber-400 w-4 h-4" />
                      <span className="text-white font-medium">
                        {mentor.averageRating.toFixed(1)}
                      </span>
                      <span>({mentor.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiLightningBolt className="text-emerald-400 w-4 h-4" />
                      <span>{mentor.completedSessions} sessions completed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pb-4">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <FaShareAlt className="w-4 h-4" />
                  Share
                </button>
                {!isOwnProfile && (
                  <button
                    onClick={() =>
                      router.push(`/dashboard/mentors?mentorId=${mentor._id}`)
                    }
                    className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/25"
                  >
                    Book Session
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => router.push("/dashboard/mentor-profile")}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {mentor.bio && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">About</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>
              </div>
            )}

            {/* Experience */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Experience</h2>
              <div className="space-y-6">
                {/* Current Company */}
                {mentor.currentCompany && mentor.currentRole && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <CompanyBadge
                        company={mentor.currentCompany}
                        showName={false}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {mentor.currentRole}
                      </h3>
                      <p className="text-slate-400 mb-1">
                        {mentor.currentCompany}
                      </p>
                      <p className="text-sm text-slate-500">
                        {mentor.yearsOfExperience
                          ? `${mentor.yearsOfExperience} years`
                          : "Present"}{" "}
                        · Full-time
                      </p>
                    </div>
                  </div>
                )}

                {/* Past Companies */}
                {mentor.pastCompanies &&
                  mentor.pastCompanies.length > 0 &&
                  mentor.pastCompanies.map((exp, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <CompanyBadge company={exp.company} showName={false} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {exp.role}
                        </h3>
                        <p className="text-slate-400 mb-1">{exp.company}</p>
                        <p className="text-sm text-slate-500">
                          {exp.startDate
                            ? formatDate(exp.startDate)
                            : "Unknown"}{" "}
                          -{" "}
                          {exp.isCurrent || !exp.endDate
                            ? "Present"
                            : formatDate(exp.endDate)}
                        </p>
                        {exp.description && (
                          <p className="text-slate-300 mt-2 text-sm">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Expertise */}
            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Types */}
            {mentor.sessionTypes && mentor.sessionTypes.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Session Types
                </h3>
                <div className="space-y-3">
                  {mentor.sessionTypes.map((session, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">
                          {session.name}
                        </h4>
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                          {session.price} pts
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-1">
                        {session.duration} minutes
                      </p>
                      {session.description && (
                        <p className="text-sm text-slate-500">
                          {session.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(mentor.linkedIn ||
              mentor.github ||
              mentor.twitter ||
              mentor.website) && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Connect</h3>
                <div className="space-y-2">
                  {mentor.linkedIn && (
                    <a
                      href={mentor.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
                    >
                      <FaLinkedin className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300">LinkedIn</span>
                    </a>
                  )}
                  {mentor.github && (
                    <a
                      href={mentor.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
                    >
                      <FaGithub className="w-5 h-5 text-slate-300" />
                      <span className="text-slate-300">GitHub</span>
                    </a>
                  )}
                  {mentor.twitter && (
                    <a
                      href={mentor.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
                    >
                      <FaTwitter className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300">Twitter</span>
                    </a>
                  )}
                  {mentor.website && (
                    <a
                      href={mentor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
                    >
                      <FaGlobe className="w-5 h-5 text-violet-400" />
                      <span className="text-slate-300">Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-amber-400 w-4 h-4" />
                    <span className="text-white font-medium">
                      {mentor.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reviews</span>
                  <span className="text-white font-medium">
                    {mentor.totalReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sessions</span>
                  <span className="text-white font-medium">
                    {mentor.completedSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience</span>
                  <span className="text-white font-medium">
                    {mentor.yearsOfExperience || 0} years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
