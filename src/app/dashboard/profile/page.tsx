"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/Input";
import { NotificationsTab } from "@/components/NotificationsTab";
import Loader from "@/components/Loader";
import { Button } from "../../../../packages/ui";

function ProfileContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const { user, updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "",
    location: "",
    title: "",
    college: "",
    year: "",
    company: "",
    domain: "",
    currentRole: "",
    experience: "",
    careerGoals: "",
    currentSkills: [] as string[],
    interestAreas: [] as string[],
    challenges: [] as string[],
    learningGoals: [] as string[],
    timeCommitment: "",
    preferredLearningStyle: "",
    projectExperience: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        title: user.title || "",
        college: user.college || "",
        year: user.year?.toString() || "",
        company: user.company || "",
        domain: user.domain || "",
        currentRole: user.title || "",
        experience: user.experience?.toString() || "",
        careerGoals: user.progress?.currentGoal || "",
        currentSkills: [],
        interestAreas: [],
        challenges: [],
        learningGoals: [],
        timeCommitment: "",
        preferredLearningStyle: "",
        projectExperience: "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers: HeadersInit = {};
      const authHeader = await import("@/lib/token-storage").then((m) =>
        m.getAuthHeader()
      );
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh user data to show new avatar
        if (refreshUser) {
          await refreshUser();
        }
        alert("Profile picture updated successfully!");
      } else {
        alert(data.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        title: formData.title || formData.currentRole,
        year: formData.year ? parseInt(formData.year) : undefined,
        domain: formData.domain,
        yoe: formData.experience ? parseInt(formData.experience) : 0,
        progress: {
          currentGoal: formData.careerGoals,
          completionRate: user?.progress?.completionRate || 0,
        },
        completionRate: user?.completionRate || 0,
      };

      await updateUser(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <Loader message="Loading profile data..." />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
          <a
            href="/dashboard/profile?tab=profile"
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-center ${
              activeTab === "profile"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Profile
          </a>
          <a
            href="/dashboard/profile?tab=notifications"
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-center ${
              activeTab === "notifications"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Notifications
          </a>
        </div>

        {/* Tab Content */}
        {activeTab === "notifications" ? (
          <NotificationsTab />
        ) : (
          <>
            {/* Points Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
                  <p className="text-blue-100 text-sm">
                    Track your learning journey
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-300 text-2xl">⭐</span>
                    <span className="text-3xl font-bold">
                      {user.points || 0}
                    </span>
                    <span className="text-blue-100 text-sm">points</span>
                  </div>
                  <p className="text-blue-100 text-xs">
                    Earned from completed lessons
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Profile Settings
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Manage your account information
                  </p>
                </div>
                {!isEditing ? (
                  <Button
                    variant="text"
                    onClick={() => setIsEditing(true)}
                    className="!bg-blue-600 !text-white !hover:!bg-blue-700"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        if (user) {
                          setFormData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                            username: user.username || "",
                            bio: user.bio || "",
                            location: user.location || "",
                            title: user.title || "",
                            college: user.college || "",
                            year: user.year?.toString() || "",
                            company: user.company || "",
                            domain: user.domain || "",
                            currentRole: user.title || "",
                            experience: user.experience?.toString() || "",
                            careerGoals: user.progress?.currentGoal || "",
                            currentSkills: [],
                            interestAreas: [],
                            challenges: [],
                            learningGoals: [],
                            timeCommitment: "",
                            preferredLearningStyle: "",
                            projectExperience: "",
                          });
                        }
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="!bg-green-600 !text-white !hover:!bg-green-700"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Profile Picture
                </h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`
                      }
                      alt={user?.name || "Profile"}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {isEditing
                        ? "Click the camera icon to upload a new profile picture"
                        : "Enable edit mode to change your profile picture"}
                    </p>
                    {isUploading && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      value={formData.email}
                      disabled={true}
                      className="w-full bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <Input
                      value={user.userType
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      disabled={true}
                      className="w-full bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Student-specific fields */}
              {user.userType === "student_fresher" && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Academic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        College/University
                      </label>
                      <Input
                        value={formData.college}
                        onChange={(e) =>
                          handleInputChange("college", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Your institution name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional fields */}
              {(user.userType?.includes("professional") ||
                user.userType?.includes("expert")) && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Professional Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <Input
                        value={formData.company}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Your company name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Role
                      </label>
                      <Input
                        value={formData.currentRole}
                        onChange={(e) =>
                          handleInputChange("currentRole", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Software Engineer, Product Manager, etc."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <Input
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      disabled={!isEditing}
                      type="number"
                      placeholder="5"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Learning Preferences */}
              <div className="space-y-4 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Learning Preferences
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Domain
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) =>
                      handleInputChange("domain", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select Domain</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">
                      Mobile Development
                    </option>
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Goals
                  </label>
                  <textarea
                    value={formData.careerGoals}
                    onChange={(e) =>
                      handleInputChange("careerGoals", e.target.value)
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="What are your career aspirations?"
                  />
                </div>
              </div>

              {/* Account Stats */}
              <div className="space-y-4 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Account Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.points || 0}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {user.completionRate || 0}%
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-2xl font-bold text-purple-600 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Account Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <Loader message="Loading profile..." />
        </DashboardLayout>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
