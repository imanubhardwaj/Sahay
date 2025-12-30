"use client";

import { Button } from "../../packages/ui/components/Button/Button";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Trophy,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Code,
  MessageSquare,
  Briefcase,
  ChevronRight,
  Sparkles,
  Rocket,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// Top tech companies for mentor showcase
const topCompanies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "Uber",
  "Airbnb",
  "Stripe",
  "Adobe",
  "Salesforce",
  "Oracle",
  "IBM",
  "Intel",
  "Nvidia",
  "Tesla",
];

const getCompanyLogo = (companyName: string): string => {
  const normalizedName = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "");
  const domain = normalizedName.includes(".")
    ? normalizedName
    : `${normalizedName}.com`;
  return `https://cdn.brandfetch.io/${domain}/w/400/h/400/theme/dark/fallback/lettermark/type/icon`;
};

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto bg-white/95 backdrop-blur-xl shadow-sm z-50 border-b border-gray-200 mt-2 sm:mt-4 rounded-full shadow-xl border border-gray-200">
        <div className="w-full px-4 sm:px-6 flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Sahay
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#mentors"
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Mentors
            </a>
            <a
              href="#courses"
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Courses
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex gap-2 sm:gap-3">
            <Button
              variant="outlined"
              className="!px-3 sm:!px-5 !py-2 sm:!py-2.5 !text-gray-700 !font-semibold !text-xs sm:!text-sm !rounded-lg !border-gray-300 !hover:bg-gray-50 !hover:border-gray-400 !transition-all !duration-300"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              className="!px-4 sm:!px-6 !py-2 sm:!py-2.5 !bg-black !font-semibold !text-xs sm:!text-sm !text-white !rounded-lg !hover:bg-gray-800 !hover:shadow-lg !hover:scale-105 !transition-all !duration-300 !border-0"
              onClick={() => router.push("/login")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 rounded-b-2xl shadow-xl">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-gray-700 hover:text-black font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#mentors"
                className="block text-gray-700 hover:text-black font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mentors
              </a>
              <a
                href="#courses"
                className="block text-gray-700 hover:text-black font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </a>
              <a
                href="#how-it-works"
                className="block text-gray-700 hover:text-black font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outlined"
                  className="!w-full !px-4 !py-3 !text-gray-700 !font-semibold !text-sm !rounded-lg !border-gray-300 !hover:bg-gray-50 !hover:border-gray-400 !transition-all !duration-300"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  className="!w-full !px-4 !py-3 !bg-black !font-semibold !text-sm !text-white !rounded-lg !hover:bg-gray-800 !hover:shadow-lg !transition-all !duration-300 !border-0"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative w-full flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-16 sm:pb-32 bg-gradient-to-b from-white via-gray-50 to-white mt-6 sm:mt-10">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-200 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-300 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white border-2 border-gray-200 mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 mr-2" />
              <span className="text-gray-900 font-bold text-xs sm:text-sm">
                Join 5,000+ learners worldwide
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6">
              Learn from{" "}
              <span className="relative inline-block">
                <span className="text-black">Industry Experts</span>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-2 bg-gray-900/20 blur-sm" />
              </span>
              <br />
              Build Your <span className="text-gray-800">Dream Career</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed font-medium max-w-4xl mx-auto mb-3 sm:mb-4">
              Connect with mentors from{" "}
              <span className="font-black text-black">FAANG</span> and top tech
              companies.
              <br className="hidden sm:block" />
              Master skills, earn points, and accelerate your growth.
            </p>

            <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-base sm:text-lg">
                <div className="group flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        📚
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">
                      Interactive courses
                    </span>
                  </div>
                </div>
                <div className="group flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        👨‍🏫
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">
                      1-on-1 mentorship
                    </span>
                  </div>
                </div>
                <div className="group flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        💻
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">
                      Coding practice
                    </span>
                  </div>
                </div>
                <div className="group flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        🎨
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">
                      Portfolio building
                    </span>
                  </div>
                </div>
                <div className="group flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        🎮
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">
                      Gamified learning
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 w-full max-w-md sm:max-w-none">
              <Button
                variant="contained"
                className="!group !relative !w-full sm:!w-auto !px-6 sm:!px-8 !py-3 sm:!py-4 !bg-black !text-white !text-base sm:!text-lg !font-bold !rounded-xl !overflow-hidden !transition-all !duration-300 !hover:scale-105 !hover:shadow-2xl !border-0 !hover:bg-gray-800"
                onClick={() => router.push("/login")}
                startIcon={<Rocket className="w-4 h-4 sm:w-5 sm:h-5" />}
              >
                Start Learning Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outlined"
                className="!w-full sm:!w-auto !px-6 sm:!px-8 !py-3 sm:!py-4 !text-gray-900 !text-base sm:!text-lg !font-bold !rounded-xl !border-2 !border-gray-900 !hover:bg-gray-900 !hover:text-white !hover:border-gray-900 !transition-all !duration-300 !hover:scale-105"
                onClick={() => router.push("/login")}
                startIcon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
              >
                Become a Mentor
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto w-full">
              {[
                { value: "5K+", label: "Active Learners", icon: Users },
                { value: "1K+", label: "Expert Mentors", icon: Award },
                { value: "10K+", label: "Sessions", icon: MessageSquare },
                { value: "90%", label: "Success Rate", icon: TrendingUp },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col items-center p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-gray-900" />
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-semibold text-xs sm:text-sm text-center">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section
        id="mentors"
        className="py-12 sm:py-20 bg-white border-t border-gray-200"
      >
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Learn from Mentors at{" "}
              <span className="text-black">Top Companies</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Our mentors come from the world&apos;s leading technology
              companies
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 sm:gap-6 md:gap-8">
            {topCompanies.map((company, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-center hover:scale-105 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCompanyLogo(company)}
                  alt={company}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain transition-all duration-300 rounded-full"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="text-gray-400 font-bold text-xs sm:text-sm">${company.charAt(
                        0
                      )}</div>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Everything You Need to <span className="text-black">Succeed</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              A complete learning ecosystem designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Users,
                title: "Expert Mentorship",
                description:
                  "Connect with industry professionals from FAANG companies. Get personalized 1-on-1 guidance, career advice, and technical mentorship sessions.",
                features: [
                  "FAANG mentors",
                  "1-on-1 sessions",
                  "Career guidance",
                ],
              },
              {
                icon: Zap,
                title: "Points & Rewards",
                description:
                  "Earn points by completing courses, helping peers, and contributing to the community. Redeem points for mentorship sessions and premium features.",
                features: [
                  "Gamified learning",
                  "Reward system",
                  "Leaderboards",
                ],
              },
              {
                icon: BookOpen,
                title: "Quality Courses",
                description:
                  "Interactive modules with quizzes, coding challenges, and real-world projects. Learn at your own pace with structured, comprehensive content.",
                features: [
                  "Interactive content",
                  "Quizzes & challenges",
                  "Progress tracking",
                ],
              },
              {
                icon: Code,
                title: "Coding Practice",
                description:
                  "Solve coding problems with our integrated Monaco editor. Test your solutions, get instant feedback, and improve your programming skills.",
                features: ["Code editor", "Test cases", "Instant feedback"],
              },
              {
                icon: Briefcase,
                title: "Portfolio Builder",
                description:
                  "Showcase your projects, achievements, and skills with our professional portfolio builder. Stand out to employers and land your dream job.",
                features: [
                  "Project showcase",
                  "Skills display",
                  "Professional profiles",
                ],
              },
              {
                icon: Trophy,
                title: "Leaderboard",
                description:
                  "Compete with peers on global and time-based leaderboards. Track your progress, earn badges, and climb the ranks.",
                features: ["Global rankings", "Achievements", "Badges"],
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-6 sm:p-8 bg-white rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center text-xs sm:text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              How <span className="text-black">Sahay Works</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and start your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Sign Up",
                description:
                  "Create your free account and complete your profile",
                icon: Users,
              },
              {
                step: "02",
                title: "Explore Courses",
                description:
                  "Browse interactive modules and choose your learning path",
                icon: BookOpen,
              },
              {
                step: "03",
                title: "Learn & Practice",
                description:
                  "Complete lessons, solve coding problems, and earn points",
                icon: Code,
              },
              {
                step: "04",
                title: "Get Mentored",
                description:
                  "Book sessions with expert mentors and accelerate your growth",
                icon: Rocket,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative h-full">
                <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl text-center h-full">
                  <div className="text-4xl sm:text-5xl lg:text-6xl text-black mb-3 sm:mb-4">
                    {item.step}
                  </div>
                  <item.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-900 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 xl:-right-8 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 xl:w-8 xl:h-8 text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points System Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Zap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
              Earn Points, Unlock Opportunities
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Gamify your learning journey and redeem points for exclusive
              benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                title: "Earn Points",
                items: [
                  "Complete lessons: 10-50 pts",
                  "Pass quizzes: 10-100 pts",
                  "Solve coding problems: 10-30 pts",
                  "Help peers: 5-20 pts",
                ],
              },
              {
                title: "Redeem Points",
                items: [
                  "Mentor sessions: 1000-3000 pts",
                  "Premium courses: 500 pts",
                  "Mock interviews: 4000 pts",
                  "Exclusive content: 200 pts",
                ],
              },
              {
                title: "Level Up",
                items: [
                  "Beginner: 0 pts",
                  "Intermediate: 100 pts",
                  "Advanced: 200 pts",
                  "Expert: 500 pts",
                  "Master: 1000 pts",
                ],
              },
            ].map((section, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-white" />
                      <span className="text-gray-200 text-sm sm:text-base">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="contained"
              className="!w-full sm:!w-auto !px-6 sm:!px-8 !py-3 sm:!py-4 !bg-white !text-black !text-base sm:!text-lg !font-bold !rounded-xl !hover:bg-gray-100 !hover:scale-105 !transition-all !duration-300"
              onClick={() => router.push("/login")}
            >
              Start Earning Points Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Loved by <span className="text-black">Students</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                content:
                  "Sahay helped me land my dream job at Google. The mentorship sessions were invaluable, and the coding practice platform is amazing!",
                rating: 5,
              },
              {
                name: "Raj Patel",
                role: "Full Stack Developer",
                content:
                  "The points system kept me motivated, and I loved competing on the leaderboard. The courses are comprehensive and well-structured.",
                rating: 5,
              },
              {
                name: "Emily Johnson",
                role: "Product Manager",
                content:
                  "As a mentor, I've helped dozens of students. The platform makes it easy to share knowledge and give back to the community.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 fill-gray-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  &quot;{testimonial.content}&quot;
                </p>
                <div>
                  <div className="font-bold text-gray-900 text-sm sm:text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-800 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-800 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="relative w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto text-center">
          <Rocket className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 text-white" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto">
            Join thousands of ambitious students and professionals already
            accelerating their growth with Sahay
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Button
              variant="contained"
              className="!w-full sm:!w-auto !px-8 sm:!px-10 !py-4 sm:!py-5 !bg-white !text-black !text-lg sm:!text-xl !font-bold !rounded-xl !hover:bg-gray-100 !hover:shadow-2xl !hover:scale-105 !transition-all !duration-300 !border-0"
              onClick={() => router.push("/login")}
              startIcon={<Rocket className="w-5 h-5 sm:w-6 sm:h-6" />}
            >
              Join Sahay Today
            </Button>
            <Button
              variant="outlined"
              className="!w-full sm:!w-auto !px-8 sm:!px-10 !py-4 sm:!py-5 !text-white !text-lg sm:!text-xl !font-bold !rounded-xl !border-2 !border-white !hover:bg-white !hover:text-black !transition-all !duration-300"
              onClick={() => router.push("/login")}
              startIcon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 sm:py-12 border-t border-gray-800">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 md:mb-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Sahay
              </h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Sahay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
