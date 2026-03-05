"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  LuPencil as Edit,
  LuMapPin as MapPin,
  LuCalendar as Calendar,
  LuDollarSign as DollarSign,
  LuStar as Star,
  LuUsers as Users,
  LuAward as Award,
  LuExternalLink as ExternalLink,
  LuCircleCheck as CheckCircle,
  LuCircleX as XCircle,
  LuClock as Clock,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuBriefcase as Briefcase,
} from "react-icons/lu";
import { Button, IconButton } from "../../../../packages/ui";

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
  pastCompanies?: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
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
  googleConnected?: boolean;
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
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSocialLinks, setEditingSocialLinks] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedIn: "",
    twitter: "",
    github: "",
    website: "",
  });
  const [newExperience, setNewExperience] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

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
        // Initialize social links state
        setSocialLinks({
          linkedIn: result.data.linkedIn || "",
          twitter: result.data.twitter || "",
          github: result.data.github || "",
          website: result.data.website || "",
        });
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

  const handleAddExperience = async () => {
    if (!newExperience.company || !newExperience.role) {
      alert("Please fill in company and role");
      return;
    }

    try {
      setSaving(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const currentPastCompanies = profile?.pastCompanies || [];
      const updatedPastCompanies = [
        ...currentPastCompanies,
        { ...newExperience },
      ];

      const response = await fetch("/api/mentor-profile", {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user?._id,
          pastCompanies: updatedPastCompanies,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) =>
          prev ? { ...prev, pastCompanies: updatedPastCompanies } : null,
        );
        setNewExperience({
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: "",
        });
        setShowAddExperience(false);
        alert("Experience added successfully!");
      } else {
        alert(result.error || "Failed to add experience");
      }
    } catch (error) {
      console.error("Error adding experience:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExperience = async (index: number) => {
    if (!confirm("Are you sure you want to remove this experience?")) {
      return;
    }

    try {
      setSaving(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const currentPastCompanies = profile?.pastCompanies || [];
      const updatedPastCompanies = currentPastCompanies.filter(
        (_, i) => i !== index,
      );

      const response = await fetch("/api/mentor-profile", {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user?._id,
          pastCompanies: updatedPastCompanies,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) =>
          prev ? { ...prev, pastCompanies: updatedPastCompanies } : null,
        );
        alert("Experience removed successfully!");
      } else {
        alert(result.error || "Failed to remove experience");
      }
    } catch (error) {
      console.error("Error removing experience:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Present";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSaveSocialLinks = async () => {
    try {
      setSaving(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");

      const response = await fetch("/api/mentor-profile", {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user?._id,
          linkedIn: socialLinks.linkedIn || undefined,
          twitter: socialLinks.twitter || undefined,
          github: socialLinks.github || undefined,
          website: socialLinks.website || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                linkedIn: socialLinks.linkedIn || undefined,
                twitter: socialLinks.twitter || undefined,
                github: socialLinks.github || undefined,
                website: socialLinks.website || undefined,
              }
            : null,
        );
        setEditingSocialLinks(false);
        alert("Social links updated successfully!");
      } else {
        alert(result.error || "Failed to update social links");
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
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
                You haven&apos;t created a mentor profile yet. Start by setting
                up your profile to begin mentoring students.
              </p>
            </div>
            <Button
              variant="contained"
              onClick={() => (window.location.href = "/dashboard/mentor-setup")}
              className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !hover:!from-purple-700 !hover:!to-pink-700 !px-6 !py-3 !rounded-lg !text-white !font-medium !transition-all !duration-200"
            >
              Create Mentor Profile
            </Button>
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
          <Button
            onClick={handleEdit}
            className="flex items-center !gap-2 !px-4 !py-2 !bg-gray-800 !border !border-gray-700 !rounded-lg !hover:!bg-gray-700 !text-white !transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
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
                    <h3 className="font-semibold text-white mb-3">About Me</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Expertise</h3>
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
                    <h3 className="font-semibold text-white mb-3">Languages</h3>
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

                {/* Experience Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience
                    </h3>
                    <Button
                      variant="text"
                      onClick={() => setShowAddExperience(!showAddExperience)}
                      className="flex items-center !gap-2 !px-3 !py-1.5 !bg-purple-600 !hover:!bg-purple-700 !text-white !rounded-lg !text-sm !transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>

                  {/* Add Experience Form */}
                  {showAddExperience && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newExperience.company}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              company: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Role/Position"
                          value={newExperience.role}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              role: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="month"
                          placeholder="Start Date (YYYY-MM)"
                          value={newExperience.startDate}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              startDate: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="month"
                          placeholder="End Date (YYYY-MM)"
                          value={newExperience.endDate}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              endDate: e.target.value,
                            })
                          }
                          disabled={newExperience.isCurrent}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isCurrent"
                          checked={newExperience.isCurrent}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              isCurrent: e.target.checked,
                              endDate: e.target.checked
                                ? ""
                                : newExperience.endDate,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="isCurrent"
                          className="text-sm text-gray-300"
                        >
                          Current Position
                        </label>
                      </div>
                      <textarea
                        placeholder="Description (optional)"
                        value={newExperience.description}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddExperience}
                          disabled={saving}
                          className="flex-1 !px-4 !py-2 !bg-purple-600 !hover:!bg-purple-700 !text-white !rounded-lg !transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Saving..." : "Add Experience"}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAddExperience(false);
                            setNewExperience({
                              company: "",
                              role: "",
                              startDate: "",
                              endDate: "",
                              isCurrent: false,
                              description: "",
                            });
                          }}
                          className="!px-4 !py-2 !bg-gray-700 !hover:!bg-gray-600 !text-white !rounded-lg !transition-colors"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Current Company */}
                  {profile.currentCompany && profile.currentRole && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {profile.currentRole}
                          </h4>
                          <p className="text-gray-400 text-sm mt-1">
                            {profile.currentCompany}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {profile.yearsOfExperience
                              ? `${profile.yearsOfExperience} years`
                              : "Present"}{" "}
                            · Full-time
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                          Current
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Past Companies */}
                  {profile.pastCompanies && profile.pastCompanies.length > 0 ? (
                    <div className="space-y-3">
                      {profile.pastCompanies.map((exp, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {exp.role}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">
                              {exp.company}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {exp.startDate
                                ? formatDate(exp.startDate)
                                : "Unknown"}{" "}
                              -{" "}
                              {exp.isCurrent || !exp.endDate
                                ? "Present"
                                : formatDate(exp.endDate)}
                            </p>
                            {exp.description && (
                              <p className="text-gray-300 text-sm mt-2">
                                {exp.description}
                              </p>
                            )}
                          </div>
                          <IconButton
                            onClick={() => handleRemoveExperience(index)}
                            disabled={saving}
                            className="!ml-4 !p-2 !text-red-400 !hover:!text-red-300 !hover:!bg-red-500/10 !rounded-lg !transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !profile.currentCompany && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No work experience added yet. Click &quot;Add
                        Experience&quot; to get started.
                      </div>
                    )
                  )}
                </div>

                {/* Session Types */}
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Session Types
                  </h3>
                  <div className="space-y-3">
                    {profile.sessionTypes.map((session, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                      >
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Social Links</h3>
                    {!editingSocialLinks && (
                      <button
                        onClick={() => setEditingSocialLinks(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        {profile.linkedIn ||
                        profile.twitter ||
                        profile.github ||
                        profile.website
                          ? "Edit"
                          : "Add"}{" "}
                        Links
                      </button>
                    )}
                  </div>

                  {editingSocialLinks ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={socialLinks.linkedIn}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              linkedIn: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://twitter.com/yourhandle"
                          value={socialLinks.twitter}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              twitter: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/yourusername"
                          value={socialLinks.github}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              github: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">
                          Website URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={socialLinks.website}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              website: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveSocialLinks}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Saving..." : "Save Links"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSocialLinks(false);
                            // Reset to current profile values
                            setSocialLinks({
                              linkedIn: profile.linkedIn || "",
                              twitter: profile.twitter || "",
                              github: profile.github || "",
                              website: profile.website || "",
                            });
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {profile.linkedIn ? (
                        <a
                          href={profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          LinkedIn
                        </a>
                      ) : null}
                      {profile.twitter ? (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Twitter
                        </a>
                      ) : null}
                      {profile.github ? (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          GitHub
                        </a>
                      ) : null}
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </a>
                      ) : null}
                      {!profile.linkedIn &&
                        !profile.twitter &&
                        !profile.github &&
                        !profile.website && (
                          <div className="text-gray-500 text-sm">
                            No social links added yet. Click &quot;Add
                            Links&quot; to add your social profiles.
                          </div>
                        )}
                    </div>
                  )}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.isMentor
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {profile.isMentor ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Approval Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {profile.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Google Meet Connected
                    </span>
                    <div className="flex items-center gap-1">
                      {profile.googleConnected ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">
                        {profile.googleConnected ? "Connected" : "Not Connected"}
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
