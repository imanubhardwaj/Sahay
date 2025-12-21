"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex">
      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
        {/* Navigation */}
        <nav className="w-full bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-40">
          <div className="w-full px-8 md:px-16 lg:px-24 xl:px-32 flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black gradient-text tracking-tight">
                Sahay
              </h1>
            </div>

            <div className="flex space-x-3">
              <button
                className="px-5 py-2 font-semibold text-sm cursor-pointer border-2 border-gray-300 rounded-md hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  router.push("/login");
                }}
              >
                Sign In
              </button>
              <button
                className="px-5 py-2 bg-black font-semibold text-sm cursor-pointer text-white rounded-md hover:bg-gray-800 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  router.push("/login");
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="w-full min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-20">
          <div className="w-full px-8 md:px-16 lg:px-24">
            <div className="flex flex-col items-center text-center">
              {/* Floating Badge */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center mr-2">
                  <span className="text-black text-xs">🎯</span>
                </div>
                <span className="text-primary font-bold text-sm">
                  Join 50,000+ learners worldwide
                </span>
              </div>

              {/* Main Heading with Enhanced Typography */}
              <div className="relative mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-neutral-800 leading-none tracking-tight">
                  Connect, Learn,{" "}
                  <span className="relative inline-block">
                    <span className="text-primary font-bold">Grow</span>
                  </span>
                </h1>
              </div>

              {/* Enhanced Subheading */}
              <div className="relative max-w-4xl mx-auto mb-12">
                <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 leading-relaxed font-medium">
                  The ultimate platform where ambitious students and industry
                  professionals unite for
                  <span className="relative mx-2">
                    <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
                      {" "}
                      mentorship
                    </span>
                  </span>
                  ,
                  <span className="relative mx-2">
                    <span className="text-secondary font-bold bg-secondary/10 px-2 py-1 rounded-lg">
                      {" "}
                      peer learning
                    </span>
                  </span>
                  , and
                  <span className="relative mx-2">
                    <span className="text-accent font-bold bg-accent/10 px-2 py-1 rounded-lg">
                      {" "}
                      accelerated career growth
                    </span>
                  </span>
                  .
                </p>
                <p className="text-base text-neutral-500 mt-3 font-medium">
                  Earn points, showcase your work, and unlock exclusive
                  opportunities!
                  <span className="inline-block ml-2">🚀</span>
                </p>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  size="lg"
                  className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    router.push("/login");
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">🎓</span>
                    <span className="text-base font-semibold text-black">
                      Start Learning Journey
                    </span>
                  </div>
                </button>

                <button
                  variant="outline"
                  size="lg"
                  className=" transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    router.push("/login");
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">👨‍🏫</span>
                    <span className="text-base font-semibold text-black">
                      Become a Mentor
                    </span>
                  </div>
                </button>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="group flex flex-col items-center p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-primary/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-3xl font-black gradient-text mb-1">
                    50K+
                  </div>
                  <div className="text-neutral-600 font-semibold text-sm text-center">
                    Active Learners
                  </div>
                </div>

                <div className="group flex flex-col items-center p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-secondary/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-3xl font-black gradient-text mb-1">
                    2K+
                  </div>
                  <div className="text-neutral-600 font-semibold text-sm text-center">
                    Expert Mentors
                  </div>
                </div>

                <div className="group flex flex-col items-center p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-accent/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-3xl font-black gradient-text mb-1">
                    100K+
                  </div>
                  <div className="text-neutral-600 font-semibold text-sm text-center">
                    Sessions Completed
                  </div>
                </div>

                <div className="group flex flex-col items-center p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-green-500/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-3xl font-black gradient-text mb-1">
                    95%
                  </div>
                  <div className="text-neutral-600 font-semibold text-sm text-center">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="w-full px-8 md:px-16 lg:px-24 xl:px-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 mb-4">
                Why Choose <span className="gradient-text">Sahay?</span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                Everything you need to accelerate your learning journey and
                unlock your career potential
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 hover:border-primary-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Expert Mentorship
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Connect with industry professionals from top companies like
                  Google, Microsoft, and Amazon. Get personalized guidance and
                  accelerate your career growth! 🚀
                </p>
              </div>

              <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl border border-accent-200 hover:border-accent-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Points & Rewards
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Earn points by completing modules, helping peers, and
                  contributing to the community. Redeem points for exclusive
                  mentorship sessions and premium features! 💎
                </p>
              </div>

              <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl border border-secondary-200 hover:border-secondary-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-secondary-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Portfolio Builder
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Showcase your projects, achievements, and skills with our
                  stunning portfolio builder. Stand out to employers and land
                  your dream job! 🎯
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative my-20 overflow-hidden">
          <div className="relative w-full px-8 md:px-16 lg:px-24 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-4">
              Ready to Transform Your Career? 🚀
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-black mb-10 max-w-2xl mx-auto">
              Join thousands of ambitious students and professionals already
              accelerating their growth with Sahay
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                size="lg"
                variant="secondary"
                className="bg-black text-white hover:bg-neutral-100"
                onClick={() => {
                  router.push("/login");
                }}
                icon={<span className="text-xl">🎯</span>}
              >
                Join Sahay Today
              </button>
              <button
                size="lg"
                variant="outline"
                className="border-2 border-white text-black hover:bg-white hover:text-primary"
                onClick={() => {
                  router.push("/login");
                }}
                icon={<span className="text-xl">💼</span>}
              >
                Become a Mentor
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-neutral-800 py-8 mt-12">
            <div className="w-full px-8 text-center">
              <p className="text-neutral-400 text-sm">
                &copy; 2024 Sahay. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
