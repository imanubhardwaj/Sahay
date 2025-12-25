"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, IconButton, CloseIcon } from "../../packages/ui";
import { calculateProfileCompletionPercentage } from "@/lib/points-economy";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  blockedAction?: string; // e.g., "book a mentor", "post a question"
}

interface Skill {
  _id: string;
  name: string;
}

const USER_TYPES = [
  {
    id: "student_fresher",
    title: "Student / Fresher",
    description: "Just starting your tech journey or recently graduated",
    icon: "🎓",
  },
  {
    id: "working_professional",
    title: "Working Professional",
    description: "Currently working and looking to upskill",
    icon: "💼",
  },
];

export function CompleteProfileModal({
  isOpen,
  onClose,
  onComplete,
  blockedAction = "access this feature",
}: CompleteProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userType: "",
    bio: "",
    title: "",
    location: "",
    college: "",
    company: "",
    yoe: 0,
    skills: [] as string[],
  });

  // Load user data and skills on mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        userType: user.userType || "",
        bio: user.bio || "",
        title: user.title || "",
        location: user.location || "",
        college: user.college || "",
        company: user.company || "",
        yoe: user.yoe || 0,
        skills: user.skills || [],
      });
    }

    // Fetch available skills
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/skills");
        if (response.ok) {
          const data = await response.json();
          setAvailableSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };

    fetchSkills();
  }, [user]);

  // Calculate completion percentage
  const completionPercentage = calculateProfileCompletionPercentage({
    firstName: formData.firstName,
    lastName: formData.lastName,
    bio: formData.bio,
    title: formData.title,
    location: formData.location,
    skills: formData.skills,
    userType: formData.userType,
  });

  const steps = [
    {
      id: "userType",
      title: "Who are you?",
      description: "Select your current status",
    },
    {
      id: "personal",
      title: "Personal Info",
      description: "Tell us about yourself",
    },
    {
      id: "professional",
      title: "Professional Details",
      description: "Your role and experience",
    },
    {
      id: "skills",
      title: "Your Skills",
      description: "Select specific skills you have",
    },
  ];

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.userType !== "";
      case 1:
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 2:
        return formData.title.trim() !== "" && formData.bio.trim() !== "";
      case 3:
        return formData.skills.length >= 1;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType as "student_fresher" | "working_professional",
        bio: formData.bio,
        title: formData.title,
        location: formData.location,
        yoe: formData.yoe,
        skills: formData.skills,
        isOnboardingComplete: true,
      };

      const result = await updateUser(updateData);

      if (result) {
        onComplete?.();
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <IconButton
            onClick={onClose}
            className="!absolute !top-4 !right-4 !text-white/80 !hover:text-white"
          >
            <CloseIcon />
          </IconButton>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔒</span>
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
          </div>
          <p className="text-blue-100 text-sm">
            To {blockedAction}, you need to complete your profile first.
          </p>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Profile Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 py-4 bg-gray-50 border-b">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "400px" }}>
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{steps[currentStep].title}</h3>
            <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
          </div>

          {/* Step 0: User Type */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInputChange("userType", type.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    formData.userType === type.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow"
                  }`}
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{type.title}</h4>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              {formData.userType === "student_fresher" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College/University
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your institution"
                  />
                </div>
              )}
              {formData.userType === "working_professional" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <select
                      value={formData.yoe}
                      onChange={(e) => handleInputChange("yoe", parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>0-1 years</option>
                      <option value={2}>2-3 years</option>
                      <option value={4}>4-5 years</option>
                      <option value={6}>6-8 years</option>
                      <option value={9}>9+ years</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Title/Role *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer, Data Scientist, Student"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself, your goals, and what you're looking to learn..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select at least 1 skill that you have or want to learn:
              </p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {availableSkills.length > 0 ? (
                  availableSkills.map((skill) => (
                    <button
                      key={skill._id}
                      onClick={() => toggleSkill(skill._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.skills.includes(skill._id)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))
                ) : (
                  // Fallback skills if API fails
                  [
                    "JavaScript", "Python", "React", "Node.js", "TypeScript",
                    "Java", "SQL", "MongoDB", "AWS", "Docker", "Git",
                    "HTML/CSS", "Vue.js", "Angular", "Machine Learning",
                    "Data Science", "DevOps", "System Design"
                  ].map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.skills.includes(skill)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500">
                Selected: {formData.skills.length} skill(s)
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="!px-6 !py-2 !rounded-lg !text-gray-700 !border-gray-300 disabled:!opacity-50"
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              className="!px-6 !py-2 !rounded-lg !bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white disabled:!opacity-50"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading || completionPercentage < 100}
              className="!px-6 !py-2 !rounded-lg !bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white disabled:!opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile ✓
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to check if user can perform actions
export function useProfileGating() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [blockedAction, setBlockedAction] = useState("");

  const isProfileComplete = user?.isOnboardingComplete && 
    user?.profileCompletionPercentage >= 100;

  const checkAndGate = (action: string): boolean => {
    if (!isProfileComplete) {
      setBlockedAction(action);
      setShowModal(true);
      return false;
    }
    return true;
  };

  return {
    isProfileComplete,
    showModal,
    setShowModal,
    blockedAction,
    checkAndGate,
  };
}

export default CompleteProfileModal;

