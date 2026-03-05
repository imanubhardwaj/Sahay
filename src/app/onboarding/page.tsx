"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "../../../packages/ui";
import Loader from "@/components/Loader";
// import { getUserTypeDisplayName } from '@/lib/modules';

interface OnboardingData {
  // User Type Selection
  userType: string;

  // Personal Info (for students)
  name: string;
  college?: string;
  year?: number;
  major?: string;
  location?: string;

  // Professional Info (for working professionals)
  company?: string;
  experience?: number;
  currentRole?: string;

  // Learning Goals
  domain: string;
  experience_level: string;
  learning_goals: string[];
  time_commitment: string;
  preferred_learning_style: string;

  // Skills & Interests
  current_skills: string[];
  interest_areas: string[];
  project_experience: string;
  career_goals: string;
  challenges: string[];
}

const USER_TYPES = [
  {
    id: "student_fresher",
    title: "Student / Fresher",
    description: "Just starting your tech journey or recently graduated",
    icon: "🎓",
    color: "blue",
  },
  {
    id: "working_professional",
    title: "Working Professional",
    description: "Currently working and looking to upskill",
    icon: "💼",
    color: "green",
  },
];

interface Question {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}

const getSectionsForUserType = (userType: string): Section[] => {
  const baseSections: Section[] = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Tell us about yourself",
      icon: "👤",
      questions: [
        {
          id: "name",
          label: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true,
        },
        {
          id: "location",
          label: "Location",
          type: "text",
          placeholder: "City, Country",
          required: false,
        },
      ],
    },
  ];

  // Add user-specific questions
  if (userType === "student_fresher") {
    baseSections[0].questions.push(
      {
        id: "college",
        label: "College/University",
        type: "text",
        placeholder: "Your institution name",
        required: true,
      },
      {
        id: "year",
        label: "Current Year",
        type: "select",
        options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"],
        required: true,
      },
      {
        id: "major",
        label: "Major/Field of Study",
        type: "text",
        placeholder: "Computer Science, Engineering, etc.",
        required: true,
      },
    );
  } else if (userType === "working_professional") {
    baseSections[0].questions.push(
      {
        id: "company",
        label: "Current Company",
        type: "text",
        placeholder: "Your company name",
        required: true,
      },
      {
        id: "currentRole",
        label: "Current Role",
        type: "text",
        placeholder: "Software Engineer, Product Manager, etc.",
        required: true,
      },
      {
        id: "experience",
        label: "Years of Experience",
        type: "select",
        options: [
          "1-2 years",
          "3-4 years",
          "5-6 years",
          "7-8 years",
          "9+ years",
        ],
        required: true,
      },
    );
  }

  // Add common sections
  baseSections.push(
    {
      id: "goals",
      title: "Learning Goals",
      description: "What do you want to achieve?",
      icon: "🎯",
      questions: [
        {
          id: "domain",
          label: "Primary Interest",
          type: "select",
          options: [
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Machine Learning",
            "DevOps",
            "Cybersecurity",
          ],
          required: true,
        },
        {
          id: "experience_level",
          label: "Experience Level",
          type: "select",
          options: [
            "Complete Beginner",
            "Some Experience",
            "Intermediate",
            "Advanced",
          ],
          required: true,
        },
        {
          id: "learning_goals",
          label: "Learning Goals",
          type: "multiselect",
          options: [
            "Get a Job",
            "Build Projects",
            "Learn New Skills",
            "Career Change",
            "Academic Excellence",
            "Lead Teams",
            "Start a Company",
          ],
          required: true,
        },
        {
          id: "time_commitment",
          label: "Time Commitment",
          type: "select",
          options: [
            "1-2 hours/week",
            "3-5 hours/week",
            "6-10 hours/week",
            "10+ hours/week",
          ],
          required: true,
        },
        {
          id: "preferred_learning_style",
          label: "Learning Style",
          type: "select",
          options: [
            "Visual (Videos, Diagrams)",
            "Reading (Articles, Docs)",
            "Hands-on (Projects)",
            "Interactive (Quizzes)",
            "Mixed Approach",
          ],
          required: true,
        },
      ],
    },
    {
      id: "skills",
      title: "Skills & Interests",
      description: "Your current expertise and interests",
      icon: "🚀",
      questions: [
        {
          id: "current_skills",
          label: "Current Skills",
          type: "multiselect",
          options: [
            "JavaScript",
            "Python",
            "Java",
            "React",
            "Node.js",
            "SQL",
            "Git",
            "HTML/CSS",
            "TypeScript",
            "AWS",
            "Docker",
            "Kubernetes",
          ],
          required: true,
        },
        {
          id: "interest_areas",
          label: "Areas of Interest",
          type: "multiselect",
          options: [
            "Frontend",
            "Backend",
            "Full Stack",
            "Mobile Apps",
            "AI/ML",
            "Cloud Computing",
            "Blockchain",
            "Game Development",
            "DevOps",
            "Architecture",
          ],
          required: true,
        },
        {
          id: "project_experience",
          label: "Project Experience",
          type: "select",
          options: [
            "No projects yet",
            "1-2 small projects",
            "3-5 projects",
            "5+ projects",
            "Professional experience",
          ],
          required: true,
        },
        {
          id: "career_goals",
          label: "Career Goals",
          type: "text",
          placeholder:
            "Software Engineer, Data Scientist, Tech Lead, CTO, etc.",
          required: true,
        },
        {
          id: "challenges",
          label: "Main Challenges",
          type: "multiselect",
          options: [
            "Time Management",
            "Staying Motivated",
            "Finding Resources",
            "Understanding Concepts",
            "Building Projects",
            "Leading Teams",
            "Technical Strategy",
          ],
          required: true,
        },
      ],
    },
  );

  return baseSections;
};

export default function OnboardingPage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"userType" | "onboarding">("userType");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const sections = selectedUserType
    ? getSectionsForUserType(selectedUserType)
    : [];
  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];
  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );
  const currentQuestionIndex =
    sections
      .slice(0, currentSection)
      .reduce((sum, section) => sum + section.questions.length, 0) +
    currentQuestion +
    1;

  const handleUserTypeSelect = (userType: string) => {
    setSelectedUserType(userType);
    setFormData((prev) => ({ ...prev, userType }));
    setStep("onboarding");
  };

  const handleInputChange = (value: string | string[]) => {
    if (!currentQuestionData) return;

    setFormData((prev) => ({
      ...prev,
      [currentQuestionData.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.name || !selectedUserType || !formData.domain) {
      console.error("Missing required fields:", {
        name: formData.name,
        userType: selectedUserType,
        domain: formData.domain,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update user profile with onboarding data
      const nameParts = (formData.name || user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const updateData = {
        firstName: firstName,
        lastName: lastName,
        userType: selectedUserType as
          | "student_fresher"
          | "working_professional",
        // Skip college field for now since it expects ObjectId but we have string
        // college: formData.college,
        year: formData.year
          ? parseInt(formData.year.toString().split(" ")[0])
          : undefined,
        company: formData.company,
        experience: formData.experience
          ? parseInt(formData.experience.toString().split(" ")[0])
          : undefined,
        domain: formData.domain || "Web Development",
        // Skip skills field for now since it expects ObjectId array but we have string array
        // skills: formData.current_skills || [],
        isOnboardingComplete: true,
        progress: {
          currentGoal: formData.career_goals || "Start learning journey",
          completionRate: 0,
        },
        // Add missing fields that are required by the User model
        username: user.email.split("@")[0], // Generate username from email
        bio: formData.career_goals || "",
        location: formData.location || "",
        yoe: formData.experience
          ? parseInt(formData.experience.toString().split(" ")[0])
          : 0,
        title: formData.currentRole || "",
        completionRate: 0,
      };

      const result = await updateUser(updateData);

      if (result) {
        router.push("/dashboard");
      } else {
        throw new Error("Failed to update user data");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // You could add a toast notification here to show the error to the user
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isLastQuestion =
    currentSection === sections.length - 1 &&
    currentQuestion === currentSectionData.questions.length - 1;
  const canProceed =
    formData[currentQuestionData?.id as keyof OnboardingData] !== undefined;

  if (authLoading || !user) {
    return <Loader message={authLoading ? "Checking authentication..." : "Loading onboarding data..."} />;
  }

  // User Type Selection Step
  if (step === "userType") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Sahay! 🚀
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Let&apos;s personalize your learning experience. First, tell us
              who you are:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USER_TYPES.map((userType) => (
              <button
                key={userType.id}
                onClick={() => handleUserTypeSelect(userType.id)}
                className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedUserType === userType.id
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{userType.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {userType.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {userType.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50 mb-6">
            <span className="text-2xl">{currentSectionData.icon}</span>
            <span className="font-semibold text-gray-900">
              {currentSectionData.title}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentSection
                    ? "bg-green-500"
                    : index === currentSection
                      ? "bg-blue-500"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-gray-600">
            Question {currentQuestionIndex} of {totalQuestions}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestionData?.label}
            </h2>
            <p className="text-gray-600">{currentSectionData.description}</p>
          </div>

          {/* Question Input */}
          <div className="mb-8">
            {currentQuestionData?.type === "text" && (
              <Input
                value={
                  (formData[
                    currentQuestionData.id as keyof OnboardingData
                  ] as string) || ""
                }
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestionData.placeholder}
                className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500"
              />
            )}

            {currentQuestionData?.type === "select" && (
              <div className="space-y-3">
                {currentQuestionData.options?.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange(option)}
                    className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                      formData[
                        currentQuestionData.id as keyof OnboardingData
                      ] === option
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestionData?.type === "multiselect" && (
              <div className="space-y-3">
                {currentQuestionData.options?.map((option: string) => {
                  const selected = (
                    (formData[
                      currentQuestionData.id as keyof OnboardingData
                    ] as string[]) || []
                  ).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        const current =
                          (formData[
                            currentQuestionData.id as keyof OnboardingData
                          ] as string[]) || [];
                        const updated = selected
                          ? current.filter((item) => item !== option)
                          : [...current, option];
                        handleInputChange(updated);
                      }}
                      className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selected && <span className="text-blue-500">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="px-8 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-300"
            >
              Previous
            </Button>

            <div className="text-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQuestionIndex / totalQuestions) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round((currentQuestionIndex / totalQuestions) * 100)}%
                Complete
              </span>
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isLastQuestion ? "Complete" : "Next"}
            </Button>
          </div>
        </div>

        {/* Section Preview */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                  index === currentSection
                    ? "bg-blue-100 text-blue-700"
                    : index < currentSection
                      ? "bg-green-100 text-green-700"
                      : "text-gray-500"
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium hidden sm:block">
                  {section.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
