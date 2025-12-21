"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Users,
  Award,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface MentorProfile {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  isMentor: boolean;
  isApproved: boolean;
  bio?: string;
  headline?: string;
  expertise: string[];
  languages: string[];
  yearsOfExperience: number;
  currentRole?: string;
  currentCompany?: string;
  hourlyRate: number;
  sessionTypes: Array<{
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>;
  linkedIn?: string;
  twitter?: string;
  github?: string;
  website?: string;
  zoomConnected: boolean;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export default function MentorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setIsEditing] = useState(false);

  const fetchMentorProfile = useCallback(async () => {
    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch(`/api/mentor-profile?userId=${user?._id}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        console.log("No mentor profile found");
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchMentorProfile();
    }
  }, [user?._id, fetchMentorProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    // Redirect to mentor setup page for editing
    window.location.href = "/dashboard/mentor-setup";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading mentor profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
            <div className="mb-6">
              <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No Mentor Profile Found
              </h2>
              <p className="text-gray-400 mb-6">
                You haven&apos;t created a mentor profile yet. Start by
                setting up your profile to begin mentoring students.
              </p>
            </div>
            <button
              onClick={() =>
                (window.location.href = "/dashboard/mentor-setup")
              }
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200"
            >
              Create Mentor Profile
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              My Mentor Profile
            </h1>
            <p className="text-gray-400">
              Manage your mentor profile and showcase your expertise
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.userId.firstName?.[0]}
                    {profile.userId.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">
                      {profile.userId.firstName} {profile.userId.lastName}
                    </h2>
                    <p className="text-gray-400 mb-2">{profile.headline}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.currentCompany}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {profile.yearsOfExperience} years experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      About Me
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {profile.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Types */}
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Session Types
                  </h3>
                  <div className="space-y-3">
                    {profile.sessionTypes.map((session, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">
                            {session.name}
                          </h4>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-purple-400">
                              {session.price} points
                            </span>
                            <p className="text-sm text-gray-500">
                              {session.duration} minutes
                            </p>
                          </div>
                        </div>
                        {session.description && (
                          <p className="text-gray-400 text-sm">
                            {session.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {profile.linkedIn && (
                      <a
                        href={profile.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={profile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Mentor Status
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Mentor Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.isMentor 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}>
                      {profile.isMentor ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Approval Status
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.isApproved 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {profile.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Zoom Connected
                    </span>
                    <div className="flex items-center gap-1">
                      {profile.zoomConnected ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">
                        {profile.zoomConnected ? "Connected" : "Not Connected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance Stats
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Average Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-white">
                        {profile.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Reviews</span>
                    <span className="font-semibold text-white">
                      {profile.totalReviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Completed Sessions
                    </span>
                    <span className="font-semibold text-white">
                      {profile.completedSessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Total Earnings
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {profile.totalEarnings} points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white transition-colors text-sm"
                  onClick={() =>
                    (window.location.href = "/dashboard/mentor-schedule")
                  }
                >
                  <Calendar className="h-4 w-4" />
                  Manage Schedule
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white transition-colors text-sm"
                  onClick={() => (window.location.href = "/dashboard/sessions")}
                >
                  <Clock className="h-4 w-4" />
                  View Sessions
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white transition-colors text-sm"
                  onClick={() => (window.location.href = "/dashboard/earnings")}
                >
                  <DollarSign className="h-4 w-4" />
                  View Earnings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
