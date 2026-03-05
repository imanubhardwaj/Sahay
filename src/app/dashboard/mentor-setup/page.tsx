"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaGlobe,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";

interface MentorProfile {
  _id: string;
  userId: string;
  bio: string;
  headline: string;
  expertise: string[];
  languages: string[];
  yearsOfExperience: number;
  currentRole: string;
  currentCompany: string;
  hourlyRate: number;
  sessionTypes: {
    name: string;
    duration: number;
    price: number;
    description: string;
  }[];
  linkedIn: string;
  twitter: string;
  github: string;
  website: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
  googleConnected?: boolean;
}

const DEFAULT_SESSION_TYPES = [
  {
    name: "30 Min Session",
    duration: 30,
    price: 50,
    description: "Quick consultation",
  },
  {
    name: "1 Hour Session",
    duration: 60,
    price: 100,
    description: "In-depth discussion",
  },
];

export default function MentorSetupPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(
    null,
  );
  const [formData, setFormData] = useState({
    bio: "",
    headline: "",
    expertise: [] as string[],
    languages: [] as string[],
    yearsOfExperience: 0,
    currentRole: "",
    currentCompany: "",
    pastCompanies: [] as Array<{
      company: string;
      role: string;
      startDate?: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
    }>,
    hourlyRate: 100,
    sessionTypes: [...DEFAULT_SESSION_TYPES],
    linkedIn: "",
    twitter: "",
    github: "",
    website: "",
  });
  const [newExpertise, setNewExpertise] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newPastCompany, setNewPastCompany] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  const hasFetchedForUser = useRef<string | null>(null);

  const fetchMentorProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/mentor-profile?userId=${user?._id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setMentorProfile(result.data);
        setFormData({
          bio: result.data.bio || "",
          headline: result.data.headline || "",
          expertise: result.data.expertise || [],
          languages: result.data.languages || [],
          yearsOfExperience: result.data.yearsOfExperience || 0,
          currentRole: result.data.currentRole || "",
          currentCompany: result.data.currentCompany || "",
          pastCompanies: result.data.pastCompanies || [],
          hourlyRate: result.data.hourlyRate || 100,
          sessionTypes:
            result.data.sessionTypes?.length > 0
              ? result.data.sessionTypes
              : DEFAULT_SESSION_TYPES,
          linkedIn: result.data.linkedIn || "",
          twitter: result.data.twitter || "",
          github: result.data.github || "",
          website: result.data.website || "",
        });
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    }
  }, [user?._id]);

  // Fetch once per user; ref prevents re-running when deps (e.g. user object ref) change
  useEffect(() => {
    const userId = user?._id ?? null;
    if (!userId) {
      hasFetchedForUser.current = null;
      return;
    }
    if (hasFetchedForUser.current === userId) return;
    hasFetchedForUser.current = userId;
    fetchMentorProfile();
  }, [user?._id, fetchMentorProfile]);

  // Handle Google OAuth callback once (success/error from redirect)
  const handledGoogleCallback = useRef(false);
  useEffect(() => {
    const googleConnected = searchParams.get("google_connected");
    const googleError = searchParams.get("google_error");
    if (googleConnected === "true" && !handledGoogleCallback.current) {
      handledGoogleCallback.current = true;
      fetchMentorProfile();
      window.history.replaceState({}, "", "/dashboard/mentor-setup");
    }
    if (googleError) {
      console.error("Google OAuth error:", googleError);
      window.history.replaceState({}, "", "/dashboard/mentor-setup");
    }
  }, [searchParams, fetchMentorProfile]);

  const handleConnectGoogle = async () => {
    try {
      const response = await fetch(
        `/api/mentor-profile/google?userId=${user?._id}`,
      );
      const result = await response.json();
      if (result.success && result.data?.authUrl) {
        window.location.href = result.data.authUrl;
      } else {
        alert(result.error || "Failed to connect Google. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting Google:", error);
      alert("Failed to connect Google. Please try again.");
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const response = await fetch(
        `/api/mentor-profile/google?userId=${user?._id}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (result.success) {
        fetchMentorProfile();
      } else {
        alert(result.error || "Failed to disconnect Google.");
      }
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      alert("Failed to disconnect Google.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()],
      }));
      setNewExpertise("");
    }
  };

  const removeExpertise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const updateSessionType = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sessionTypes: prev.sessionTypes.map((session, i) =>
        i === index ? { ...session, [field]: value } : session,
      ),
    }));
  };

  const addSessionType = () => {
    setFormData((prev) => ({
      ...prev,
      sessionTypes: [
        ...prev.sessionTypes,
        { name: "", duration: 30, price: 50, description: "" },
      ],
    }));
  };

  const removeSessionType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sessionTypes: prev.sessionTypes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/mentor-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Profile saved successfully!");
        fetchMentorProfile();
      } else {
        console.error("API Error:", result);
        alert(result.error || "Failed to save profile");
        if (result.details) {
          console.error("Error details:", result.details);
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🎓 Become a Mentor
            </h1>
            <p className="text-gray-400">
              Share your knowledge and earn points by mentoring students
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Calendar / Meet Integration */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <SiGooglemeet className="text-emerald-400" size={24} />
                Google Meet Integration
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Connect your Google account to automatically create Google Meet
                links when students book sessions. Students can join without a
                Google account.
              </p>
              {mentorProfile?.googleConnected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">
                      Google Connected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="px-4 py-2 cursor-pointer bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <SiGooglemeet size={20} />
                  Connect Google Account
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Professional Headline
              </label>
              <Input
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer at Google"
                maxLength={200}
                className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500"
                rows={5}
                placeholder="Tell students about yourself, your experience, and how you can help them..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/1000 characters
              </p>
            </div>

            {/* Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Current Role
                </label>
                <Input
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Current Company
                </label>
                <Input
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  placeholder="e.g., Google"
                  className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
              />
            </div>

            {/* Past Companies */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Past Companies (Work Experience)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add your previous work experience to showcase your expertise
              </p>

              {/* Add Past Company Form */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Company Name"
                    value={newPastCompany.company}
                    onChange={(e) =>
                      setNewPastCompany({
                        ...newPastCompany,
                        company: e.target.value,
                      })
                    }
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                  <Input
                    placeholder="Role/Position"
                    value={newPastCompany.role}
                    onChange={(e) =>
                      setNewPastCompany({
                        ...newPastCompany,
                        role: e.target.value,
                      })
                    }
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="month"
                    placeholder="Start Date (YYYY-MM)"
                    value={newPastCompany.startDate}
                    onChange={(e) =>
                      setNewPastCompany({
                        ...newPastCompany,
                        startDate: e.target.value,
                      })
                    }
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                  <Input
                    type="month"
                    placeholder="End Date (YYYY-MM) or leave empty if current"
                    value={newPastCompany.endDate}
                    onChange={(e) =>
                      setNewPastCompany({
                        ...newPastCompany,
                        endDate: e.target.value,
                      })
                    }
                    disabled={newPastCompany.isCurrent}
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={newPastCompany.isCurrent}
                    onChange={(e) =>
                      setNewPastCompany({
                        ...newPastCompany,
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? "" : newPastCompany.endDate,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="isCurrent" className="text-sm text-gray-400">
                    Current Position
                  </label>
                </div>
                <textarea
                  placeholder="Description (optional)"
                  value={newPastCompany.description}
                  onChange={(e) =>
                    setNewPastCompany({
                      ...newPastCompany,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPastCompany.company && newPastCompany.role) {
                      setFormData((prev) => ({
                        ...prev,
                        pastCompanies: [
                          ...prev.pastCompanies,
                          { ...newPastCompany },
                        ],
                      }));
                      setNewPastCompany({
                        company: "",
                        role: "",
                        startDate: "",
                        endDate: "",
                        isCurrent: false,
                        description: "",
                      });
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Add Experience
                </button>
              </div>

              {/* List of Past Companies */}
              {formData.pastCompanies.length > 0 && (
                <div className="space-y-2">
                  {formData.pastCompanies.map((exp, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{exp.role}</div>
                        <div className="text-sm text-gray-400">
                          {exp.company}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exp.startDate || "Unknown"} -{" "}
                          {exp.isCurrent || !exp.endDate
                            ? "Present"
                            : exp.endDate}
                        </div>
                        {exp.description && (
                          <div className="text-sm text-gray-400 mt-1">
                            {exp.description}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            pastCompanies: prev.pastCompanies.filter(
                              (_, i) => i !== index,
                            ),
                          }));
                        }}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Areas of Expertise
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="e.g., React, Node.js, System Design"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addExpertise())
                  }
                  className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                />
                <button type="button" onClick={addExpertise}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeExpertise(index)}
                      className="hover:text-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Languages
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g., English, Hindi, Spanish"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addLanguage())
                  }
                  className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                />
                <button type="button" onClick={addLanguage}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="hover:text-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Session Types & Pricing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Session Types & Pricing
                </label>
                <button
                  type="button"
                  onClick={addSessionType}
                  className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  + Add Session Type
                </button>
              </div>
              <div className="space-y-4">
                {formData.sessionTypes.map((session, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Session Name
                        </label>
                        <Input
                          placeholder="Session Name"
                          value={session.name}
                          onChange={(e) =>
                            updateSessionType(index, "name", e.target.value)
                          }
                          className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Duration (min)
                        </label>
                        <Input
                          type="number"
                          placeholder="Duration (min)"
                          value={session.duration}
                          onChange={(e) =>
                            updateSessionType(
                              index,
                              "duration",
                              Number(e.target.value),
                            )
                          }
                          className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="Price (points)"
                          value={session.price}
                          onChange={(e) =>
                            updateSessionType(
                              index,
                              "price",
                              Number(e.target.value),
                            )
                          }
                          className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSessionType(index)}
                        className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-medium py-2 px-4 rounded-lg border border-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <Input
                      placeholder="Description"
                      value={session.description}
                      onChange={(e) =>
                        updateSessionType(index, "description", e.target.value)
                      }
                      className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Social Links
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaLinkedin className="text-blue-700" size={20} />
                  <Input
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    placeholder="LinkedIn URL"
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaTwitter className="text-blue-400" size={20} />
                  <Input
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="Twitter URL"
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaGithub className="text-gray-800" size={20} />
                  <Input
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="GitHub URL"
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-purple-600" size={20} />
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Personal Website"
                    className="!bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            {mentorProfile && (
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📊 Your Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {mentorProfile.totalSessions}
                    </div>
                    <div className="text-sm text-gray-400">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {mentorProfile.completedSessions}
                    </div>
                    <div className="text-sm text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {mentorProfile.averageRating.toFixed(1)} ⭐
                    </div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {mentorProfile.totalEarnings}
                    </div>
                    <div className="text-sm text-gray-400">Points Earned</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
