"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FaStar, FaTimes, FaClock, FaCalendarAlt, FaLinkedin, FaGithub, FaGlobe, FaFilter, FaSort, FaUser } from "react-icons/fa";
import { HiSparkles, HiBadgeCheck, HiLightningBolt } from "react-icons/hi";
import Image from "next/image";
import { Calendar } from "@/components/ui/Calendar";
import { CompleteProfileModal, useProfileGating } from "@/components/CompleteProfileModal";
import MentorCard, { MentorProfile as MentorProfileType } from "@/components/MentorCard";
import { CompanyBadge, SkillBadge } from "@/components/MentorCard";

type MentorProfile = MentorProfileType;

interface Schedule {
  _id: string;
  professionalId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
  price: number;
  sessionType: string;
  isActive: boolean;
}


export default function MentorsPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "sessions" | "experience">("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  
  // Profile gating for booking mentors
  const { showModal, setShowModal, blockedAction, checkAndGate } = useProfileGating();

  // Check if user is a mentor
  const isMentor = useMemo(() => {
    return user?.userType?.includes("professional") || user?.role === "mentor";
  }, [user]);

  // Get user's skills for relevance sorting
  const userSkills = useMemo(() => {
    if (!user?.skills) return [];
    return user.skills.map((s: { name?: string } | string) => 
      typeof s === 'object' && s?.name ? s.name.toLowerCase() : (typeof s === 'string' ? s.toLowerCase() : '')
    ).filter(Boolean);
  }, [user?.skills]);

  // Get all unique expertise areas
  const allExpertise = useMemo(() => {
    const expertise = new Set<string>();
    mentors.forEach(m => m.expertise?.forEach(e => expertise.add(e)));
    return Array.from(expertise).sort();
  }, [mentors]);

  // Calculate relevance score for a mentor
  const calculateRelevanceScore = useCallback((mentor: MentorProfile): number => {
    if (!mentor.expertise || userSkills.length === 0) return 0;
    const mentorSkills = mentor.expertise.map(e => e.toLowerCase());
    const matchingSkills = mentorSkills.filter(skill => 
      userSkills.some((userSkill: string) => 
        skill.includes(userSkill) || userSkill.includes(skill)
      )
    );
    return matchingSkills.length;
  }, [userSkills]);

  // Check if a skill matches user's skills
  const isMatchingSkill = (skill: string): boolean => {
    const normalizedSkill = skill.toLowerCase();
    return userSkills.some((userSkill: string) => 
      normalizedSkill.includes(userSkill) || userSkill.includes(normalizedSkill)
    );
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadMentors();
  }, [user, router, authLoading]);

  const loadMentors = async () => {
    try {
      setIsLoading(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/mentor-profile?approved=true", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success && result.data) {
        const validMentors = (result.data as MentorProfile[])
          .filter((mentor) => mentor.userId && mentor.isMentor && mentor.isApproved);
        setMentors(validMentors);
      } else {
        setMentors([]);
      }
    } catch (error) {
      console.error("Failed to load mentors:", error);
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMentorSchedules = async (mentorId: string, date?: string) => {
    try {
      setLoadingSlots(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const targetDate = date || new Date().toISOString().split("T")[0];

      const response = await fetch(
        `/api/schedules/open-slots?professionalId=${mentorId}&date=${targetDate}`,
        {
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
      const result = await response.json();

      if (result.availableSlots) {
        const availableSchedules = result.availableSlots.map((slot: {
          scheduleId: string;
          professionalId: string;
          title: string;
          description?: string;
          date: string;
          startTime: string;
          endTime: string;
          duration: number;
          totalSpots: number;
          currentBookings: number;
          price: number;
          sessionType: string;
        }) => ({
          _id: slot.scheduleId,
          professionalId: slot.professionalId,
          title: slot.title,
          description: slot.description,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          maxBookings: slot.totalSpots,
          currentBookings: slot.currentBookings,
          price: slot.price,
          sessionType: slot.sessionType,
          isActive: true,
        }));
        setSchedules(availableSchedules);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Failed to load schedules:", error);
      setSchedules([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const viewMentorDetails = async (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setSelectedDate("");
    if (mentor.userId?._id) {
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
      await loadMentorSchedules(mentor.userId._id, today);
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (selectedMentor?.userId?._id) {
      await loadMentorSchedules(selectedMentor.userId._id, date);
    }
  };

  const selectSchedule = (schedule: Schedule) => {
    // Gate booking action - require complete profile
    if (!checkAndGate("book a mentor session")) {
      return;
    }
    setSelectedSchedule(schedule);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!user || !selectedSchedule || !selectedMentor || !selectedMentor.userId?._id || isBooking) return;

    try {
      setIsBooking(true);

      if ((user.points || 0) < selectedSchedule.price) {
        alert("Insufficient balance! Please add more points.");
        setIsBooking(false);
        return;
      }

      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          studentId: user._id,
          professionalId: selectedMentor.userId._id,
          scheduleId: selectedSchedule._id,
          sessionDate: selectedSchedule.date,
          sessionTime: selectedSchedule.startTime,
          duration: selectedSchedule.duration,
          price: selectedSchedule.price,
          studentNotes: bookingNotes,
          sessionType: selectedSchedule.sessionType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Booking request sent! You'll receive an email once approved.");
        const mentorId = selectedMentor?.userId?._id;
        setShowBookingModal(false);
        setSelectedMentor(null);
        setBookingNotes("");
        setSelectedSchedule(null);
        if (refreshUser) await refreshUser();
        if (mentorId) await loadMentorSchedules(mentorId);
      } else {
        alert(result.error || "Failed to book session");
      }
    } catch (error) {
      console.error("Failed to book session:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Filter and sort mentors
  const filteredAndSortedMentors = useMemo(() => {
    const filtered = mentors.filter((mentor) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          mentor.headline?.toLowerCase().includes(q) ||
          mentor.expertise?.some((exp) => exp.toLowerCase().includes(q)) ||
          mentor.userId?.firstName?.toLowerCase().includes(q) ||
          mentor.userId?.lastName?.toLowerCase().includes(q) ||
          mentor.currentRole?.toLowerCase().includes(q) ||
          mentor.currentCompany?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      
      if (selectedExpertise.length > 0) {
        const hasExpertise = selectedExpertise.some(exp => 
          mentor.expertise?.includes(exp)
        );
        if (!hasExpertise) return false;
      }
      
      return true;
    });

    // Sort based on selected criteria
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          const scoreA = calculateRelevanceScore(a);
          const scoreB = calculateRelevanceScore(b);
          if (scoreB !== scoreA) return scoreB - scoreA;
          // Fall back to rating if relevance is equal
          return b.averageRating - a.averageRating;
        case "rating":
          return b.averageRating - a.averageRating;
        case "sessions":
          return b.completedSessions - a.completedSessions;
        case "experience":
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
        default:
          return 0;
      }
    });
  }, [mentors, searchQuery, selectedExpertise, sortBy, calculateRelevanceScore]);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        blockedAction={blockedAction}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Find Your Mentor</h1>
              <p className="text-slate-400">Connect with experienced professionals who match your skills</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, expertise, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3.5 pl-12 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none px-4 py-3.5 pl-10 pr-10 bg-slate-900/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 cursor-pointer"
              >
                <option value="relevance">Most Relevant</option>
                <option value="rating">Highest Rated</option>
                <option value="sessions">Most Sessions</option>
                <option value="experience">Most Experience</option>
              </select>
              <FaSort className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3.5 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters || selectedExpertise.length > 0
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <FaFilter className="w-4 h-4" />
              <span>Filters</span>
              {selectedExpertise.length > 0 && (
                <span className="px-1.5 py-0.5 bg-violet-500 text-white text-xs rounded-full">
                  {selectedExpertise.length}
                </span>
              )}
            </button>
          </div>

          {/* Expertise Filters */}
          {showFilters && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-300">Filter by Expertise</span>
                {selectedExpertise.length > 0 && (
                  <button
                    onClick={() => setSelectedExpertise([])}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allExpertise.slice(0, 20).map((exp) => (
                  <button
                    key={exp}
                    onClick={() => {
                      setSelectedExpertise(prev =>
                        prev.includes(exp)
                          ? prev.filter(e => e !== exp)
                          : [...prev, exp]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedExpertise.includes(exp)
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/50"
                        : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{mentors.length}</div>
            <div className="text-sm text-slate-400">Active Mentors</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5">
            <div className="text-2xl font-bold text-emerald-400">{mentors.filter((m) => m.zoomConnected).length}</div>
            <div className="text-sm text-slate-400">Available Now</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5">
            <div className="text-2xl font-bold text-violet-400">{new Set(mentors.flatMap((m) => m.expertise || [])).size}</div>
            <div className="text-sm text-slate-400">Expertise Areas</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5">
            <div className="text-2xl font-bold text-amber-400">{mentors.reduce((sum, m) => sum + (m.completedSessions || 0), 0)}</div>
            <div className="text-sm text-slate-400">Sessions Completed</div>
          </div>
        </div>

        {/* View indicator */}
        {isMentor ? (
          <div className="mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center gap-3">
            <HiLightningBolt className="w-5 h-5 text-violet-400" />
            <p className="text-sm text-violet-300">
              <span className="font-medium">Mentor View:</span> Showing expert mentors for networking and growth opportunities.
            </p>
          </div>
        ) : (
          <div className="mb-6 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
            <HiLightningBolt className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-300">
              <span className="font-medium">Student View:</span> Showing all available mentors for booking.
            </p>
          </div>
        )}

        {/* Relevance indicator */}
        {userSkills.length > 0 && sortBy === "relevance" && (
          <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <HiLightningBolt className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              Mentors are sorted by skills matching your profile. Skills highlighted in <span className="text-emerald-400 font-medium">green</span> match yours.
            </p>
          </div>
        )}

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-800 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-7 bg-slate-800 rounded-lg w-20" />
                  <div className="h-7 bg-slate-800 rounded-lg w-16" />
                </div>
                <div className="h-4 bg-slate-800 rounded w-full mb-2" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedMentors.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {mentors.length === 0 ? "No mentors available" : "No mentors found"}
            </h3>
            <p className="text-slate-400">
              {mentors.length === 0 ? "Check back soon!" : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedMentors.map((mentor) => {
              const relevanceScore = calculateRelevanceScore(mentor);
              
              return (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  onClick={() => viewMentorDetails(mentor)}
                  relevanceScore={relevanceScore}
                  isMatchingSkill={isMatchingSkill}
                  showRelevanceBadge={sortBy === "relevance"}
                />
              );
            })}
          </div>
        )}

        {/* Mentor Details Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-slate-900 p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={selectedMentor.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedMentor.userId?.firstName || "") + " " + (selectedMentor.userId?.lastName || ""))}&background=6366f1&color=fff&bold=true`}
                        alt=""
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-xl ring-2 ring-slate-700 object-cover"
                      />
                      {selectedMentor.zoomConnected && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">
                          {selectedMentor.userId?.firstName} {selectedMentor.userId?.lastName}
                        </h2>
                        {selectedMentor.averageRating >= 4.5 && (
                          <HiBadgeCheck className="w-5 h-5 text-violet-400" />
                        )}
                      </div>
                      <p className="text-slate-400">{selectedMentor.headline || selectedMentor.currentRole}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <FaStar className="text-amber-400 w-4 h-4" />
                          <span className="text-white font-medium">{selectedMentor.averageRating.toFixed(1)}</span>
                          <span className="text-slate-500 text-sm">({selectedMentor.totalReviews})</span>
                        </div>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{selectedMentor.completedSessions} sessions</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{selectedMentor.yearsOfExperience}+ yrs</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-slate-400 w-5 h-5" />
                  </button>
                </div>

                {/* Company & Social Links */}
                <div className="flex items-center gap-4 mt-4">
                  {selectedMentor.currentCompany && (
                    <CompanyBadge company={selectedMentor.currentCompany} />
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => {
                        if (selectedMentor._id) {
                          router.push(`/mentor/${selectedMentor._id}`);
                        }
                      }}
                      className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <FaUser className="w-4 h-4" />
                      View Full Profile
                    </button>
                    {selectedMentor.linkedIn && (
                      <a href={selectedMentor.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                        <FaLinkedin className="w-4 h-4 text-slate-400" />
                      </a>
                    )}
                    {selectedMentor.github && (
                      <a href={selectedMentor.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                        <FaGithub className="w-4 h-4 text-slate-400" />
                      </a>
                    )}
                    {selectedMentor.website && (
                      <a href={selectedMentor.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                        <FaGlobe className="w-4 h-4 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Bio */}
                {selectedMentor.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">About</h3>
                    <p className="text-slate-300 leading-relaxed">{selectedMentor.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((skill, idx) => (
                        <SkillBadge 
                          key={idx} 
                          skill={skill} 
                          isMatching={isMatchingSkill(skill)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Session */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Book a Session</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <label className="block text-sm font-medium text-slate-300 mb-3">Select Date</label>
                      <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateChange}
                        minDate={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {/* Slots */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <label className="block text-sm font-medium text-slate-300 mb-3">Available Slots</label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
                        </div>
                      ) : !selectedDate ? (
                        <div className="text-center py-12">
                          <FaCalendarAlt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500">Select a date to view slots</p>
                        </div>
                      ) : schedules.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-slate-500">No slots available</p>
                          <p className="text-slate-600 text-sm mt-1">Try another date</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {schedules.map((schedule) => (
                            <button
                              key={schedule._id}
                              onClick={() => selectSchedule(schedule)}
                              className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-all border border-slate-700/50 hover:border-violet-500/50 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FaClock className="text-slate-500 group-hover:text-violet-400 w-3 h-3 transition-colors" />
                                  <span className="text-white font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <span className="text-violet-400 font-bold">{schedule.price} pts</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {schedule.duration} min · {schedule.maxBookings - schedule.currentBookings} spot{schedule.maxBookings - schedule.currentBookings !== 1 ? "s" : ""} left
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showBookingModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Booking</h2>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-4 space-y-3 text-sm border border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white font-medium">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time</span>
                  <span className="text-white font-medium">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-medium">{selectedSchedule.duration} min</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-700">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedSchedule.price} points
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none transition-all"
                  rows={3}
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (selectedMentor?._id) {
                      router.push(`/mentor/${selectedMentor._id}`);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium flex items-center justify-center gap-2 border border-slate-700"
                >
                  <FaUser className="w-4 h-4" />
                  View Profile
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSchedule(null);
                      setBookingNotes("");
                    }}
                    disabled={isBooking}
                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
