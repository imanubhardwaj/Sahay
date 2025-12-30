"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaGlobe,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { SiZoom } from "react-icons/si";

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
  zoomConnected: boolean;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
}

export default function MentorSetupPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(
    null
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
    sessionTypes: [
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
    ],
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
              : formData.sessionTypes,
          linkedIn: result.data.linkedIn || "",
          twitter: result.data.twitter || "",
          github: result.data.github || "",
          website: result.data.website || "",
        });
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    }
  }, [formData.sessionTypes, user?._id]);

  useEffect(() => {
    if (user) {
      fetchMentorProfile();
    }
  }, [fetchMentorProfile, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      sessionTypes: prev.sessionTypes.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
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

  const handleConnectZoom = async () => {
    try {
      const response = await fetch(
        `/api/mentor-profile/zoom?userId=${user?._id}`
      );
      const result = await response.json();

      if (result.success && result.data.authUrl) {
        window.location.href = result.data.authUrl;
      }
    } catch (error) {
      console.error("Error connecting Zoom:", error);
      alert("Failed to connect Zoom. Please try again.");
    }
  };

  const handleDisconnectZoom = async () => {
    try {
      const response = await fetch(
        `/api/mentor-profile/zoom?userId=${user?._id}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (result.success) {
        alert("Zoom disconnected successfully");
        fetchMentorProfile();
      }
    } catch (error) {
      console.error("Error disconnecting Zoom:", error);
      alert("Failed to disconnect Zoom. Please try again.");
    }
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
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎓 Become a Mentor
            </h1>
            <p className="text-gray-600">
              Share your knowledge and earn points by mentoring students
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zoom Integration */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <SiZoom className="text-blue-600" size={24} />
                Zoom Integration
              </h3>
              {mentorProfile?.zoomConnected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span className="text-green-700 font-medium">
                      Zoom Connected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectZoom}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg border border-gray-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 mb-3">
                    Connect your Zoom account to automatically create meeting
                    links for your sessions
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectZoom}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Connect Zoom
                  </button>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Headline
              </label>
              <Input
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer at Google"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Role
                </label>
                <Input
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Company
                </label>
                <Input
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  placeholder="e.g., Google"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
              />
            </div>

            {/* Past Companies */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Past Companies (Work Experience)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add your previous work experience to showcase your expertise
              </p>

              {/* Add Past Company Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
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
                  <label htmlFor="isCurrent" className="text-sm text-gray-700">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
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
                      className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {exp.role}
                        </div>
                        <div className="text-sm text-gray-600">
                          {exp.company}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exp.startDate || "Unknown"} -{" "}
                          {exp.isCurrent || !exp.endDate
                            ? "Present"
                            : exp.endDate}
                        </div>
                        {exp.description && (
                          <div className="text-sm text-gray-600 mt-1">
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
                              (_, i) => i !== index
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                />
                <button type="button" onClick={addExpertise}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                />
                <button type="button" onClick={addLanguage}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                <label className="block text-sm font-semibold text-gray-700">
                  Session Types & Pricing
                </label>
                <button
                  type="button"
                  onClick={addSessionType}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  + Add Session Type
                </button>
              </div>
              <div className="space-y-4">
                {formData.sessionTypes.map((session, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Session Name
                        </label>
                        <Input
                          placeholder="Session Name"
                          value={session.name}
                          onChange={(e) =>
                            updateSessionType(index, "name", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                              Number(e.target.value)
                            )
                          }
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
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaTwitter className="text-blue-400" size={20} />
                  <Input
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="Twitter URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaGithub className="text-gray-800" size={20} />
                  <Input
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="GitHub URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-purple-600" size={20} />
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Personal Website"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            {mentorProfile && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Your Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {mentorProfile.totalSessions}
                    </div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mentorProfile.completedSessions}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {mentorProfile.averageRating.toFixed(1)} ⭐
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mentorProfile.totalEarnings}
                    </div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
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
