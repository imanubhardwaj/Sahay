"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FaStar, FaLinkedin, FaTwitter, FaGithub, FaGlobe, FaClock, FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";

export default function MentorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("All");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showMentorDetails, setShowMentorDetails] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");

  // Type definitions
  interface MentorProfile {
    _id: string;
    userId?: {
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
    expertise?: string[];
    languages?: string[];
    yearsOfExperience?: number;
    currentRole?: string;
    currentCompany?: string;
    averageRating: number;
    totalReviews: number;
    completedSessions: number;
    zoomConnected: boolean;
    sessionTypes?: Array<{
      name: string;
      duration: number;
      price: number;
      description?: string;
    }>;
    linkedIn?: string;
    twitter?: string;
    github?: string;
    website?: string;
  }

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

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const loadMentors = async () => {
    try {
      setIsLoading(true);
      // Fetch all approved mentors
      const response = await fetch("/api/mentor-profile?approved=true");
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter out mentors without user data and sort by rating
        const validMentors = (result.data as MentorProfile[])
          .filter((mentor) => mentor.userId && mentor.isMentor && mentor.isApproved)
          .sort((a, b) => {
            // Sort by rating first, then by completed sessions
            if (b.averageRating !== a.averageRating) {
              return b.averageRating - a.averageRating;
            }
            return b.completedSessions - a.completedSessions;
          });
        
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

  const loadMentorSchedules = async (mentorId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `/api/schedules?professionalId=${mentorId}&startDate=${today}&isActive=true`
      );
      const result = await response.json();
      
      if (result.success) {
        setSchedules(result.data as Schedule[]);
      }
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  };

  const viewMentorDetails = async (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setShowMentorDetails(true);
    if (mentor.userId?._id) {
      await loadMentorSchedules(mentor.userId._id);
    }
  };

  const selectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!user || !selectedSchedule || !selectedMentor || !selectedMentor.userId?._id) return;

    try {
      // Check balance
      if ((user.points || 0) < selectedSchedule.price) {
        alert("Insufficient balance! Please add more points.");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        alert("✅ Booking request sent! The mentor will review your request and you'll receive an email once it's approved.");
        setShowBookingModal(false);
        setShowMentorDetails(false);
        setBookingNotes("");
        setSelectedSchedule(null);
        setSelectedMentor(null);
        // Refresh user data
        window.location.reload();
      } else {
        alert(result.error || "Failed to book session");
      }
    } catch (error) {
      console.error("Failed to book session:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Get all unique expertise areas
  const allExpertise = ["All", ...new Set(mentors.flatMap((m) => m.expertise || []))];

  const filteredMentors = mentors.filter((mentor) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      mentor.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.some((exp: string) => exp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentor.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.currentRole?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Expertise filter
    const matchesExpertise = selectedExpertise === "All" || 
      mentor.expertise?.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎓 Find Your Perfect Mentor
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with experienced professionals and accelerate your learning journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-4">
            {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                placeholder="Search by name, expertise, role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                🔍
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Expertise Filter */}
            {allExpertise.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Filter by Expertise</p>
            <div className="flex flex-wrap gap-2">
                  {allExpertise.slice(0, 10).map((expertise) => (
                <button
                      key={expertise}
                      onClick={() => setSelectedExpertise(expertise)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedExpertise === expertise
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                      {expertise}
                </button>
              ))}
                  {allExpertise.length > 10 && (
                    <span className="px-4 py-2 text-sm text-gray-500">
                      +{allExpertise.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{mentors.length}</div>
            <div className="text-blue-100 text-sm">Total Mentors</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">
              {mentors.filter(m => m.zoomConnected).length}
            </div>
            <div className="text-green-100 text-sm">Zoom Connected</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">
              {new Set(mentors.flatMap(m => m.expertise || [])).size}
            </div>
            <div className="text-purple-100 text-sm">Expertise Areas</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">
              {mentors.reduce((sum, m) => sum + (m.completedSessions || 0), 0)}
            </div>
            <div className="text-yellow-100 text-sm">Sessions Completed</div>
          </div>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">
              {mentors.length === 0 ? "👨‍🏫" : "🔍"}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {mentors.length === 0 ? "No mentors available yet" : "No mentors found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {mentors.length === 0 
                ? "Check back soon! Mentors are setting up their profiles."
                : "Try adjusting your search or filter criteria"}
            </p>
            {(searchQuery || selectedExpertise !== "All") && (
              <div className="flex gap-3 justify-center">
                <button onClick={() => setSearchQuery("")} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">Clear Search</button>
                <button 
                  onClick={() => setSelectedExpertise("All")}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => viewMentorDetails(mentor)}
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  <Image
                    src={mentor.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((mentor.userId?.firstName || '') + ' ' + (mentor.userId?.lastName || ''))}`}
                    alt={`${mentor.userId?.firstName} ${mentor.userId?.lastName}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all"
                  />
                  {mentor.zoomConnected && (
                    <div className="absolute bottom-0 right-1/2 transform translate-x-10 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {mentor.userId?.firstName} {mentor.userId?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {mentor.headline || mentor.currentRole || "Mentor"}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaStar className="text-yellow-400" />
                    <span className="text-sm font-semibold">
                      {mentor.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({mentor.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {mentor.completedSessions} sessions completed
                  </div>
                </div>

                {/* Expertise */}
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {mentor.expertise.slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience & Company */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-700 text-center space-y-1">
                    {(mentor.yearsOfExperience ?? 0) > 0 && (
                      <div>
                        <span className="font-semibold">{mentor.yearsOfExperience}+ years</span> experience
                      </div>
                    )}
                    {mentor.currentCompany && (
                      <div className="text-gray-600">
                        @ {mentor.currentCompany}
                      </div>
                    )}
                    {!(mentor.yearsOfExperience ?? 0) && !mentor.currentCompany && (
                      <div>Professional Mentor</div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                {mentor.sessionTypes && mentor.sessionTypes.length > 0 && (
                  <div className="mb-3 text-center">
                    <div className="text-xs text-gray-600">Starting from</div>
                    <div className="text-lg font-bold text-purple-600">
                      {Math.min(...mentor.sessionTypes.map((s) => s.price))} points
                    </div>
                  </div>
                )}

                {/* Action */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {mentor.zoomConnected ? "View Profile & Book" : "View Profile"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mentor Details Modal */}
        {showMentorDetails && selectedMentor && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
                <div className="flex items-center gap-6">
                  <Image
                    src={selectedMentor.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedMentor.userId?.firstName || '') + ' ' + (selectedMentor.userId?.lastName || ''))}`}
                    alt={`${selectedMentor.userId?.firstName} ${selectedMentor.userId?.lastName}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full ring-4 ring-white"
                  />
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedMentor.userId?.firstName} {selectedMentor.userId?.lastName}
                    </h2>
                    <p className="text-purple-100 mb-2">
                      {selectedMentor.headline || selectedMentor.currentRole}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-300" />
                        <span className="font-semibold">
                          {selectedMentor.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        {selectedMentor.completedSessions} sessions
                      </div>
                      <div>
                        {selectedMentor.yearsOfExperience}+ years exp
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Bio */}
                {selectedMentor.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedMentor.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedMentor.languages && selectedMentor.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.languages.map((lang: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                        >
                          {lang}
                    </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(selectedMentor.linkedIn || selectedMentor.twitter || selectedMentor.github || selectedMentor.website) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Connect
                    </h3>
                    <div className="flex gap-3">
                      {selectedMentor.linkedIn && (
                        <a
                          href={selectedMentor.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FaLinkedin size={20} />
                        </a>
                      )}
                      {selectedMentor.twitter && (
                        <a
                          href={selectedMentor.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-100 text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FaTwitter size={20} />
                        </a>
                      )}
                      {selectedMentor.github && (
                        <a
                          href={selectedMentor.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FaGithub size={20} />
                        </a>
                      )}
                      {selectedMentor.website && (
                        <a
                          href={selectedMentor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <FaGlobe size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Slots */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📅 Available Time Slots
                  </h3>
                  {schedules.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                      No available slots at the moment. Check back later!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule._id}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => selectSchedule(schedule)}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {schedule.title}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-purple-600" />
                              {new Date(schedule.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClock className="text-green-600" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-600">
                                {schedule.duration} min
                              </span>
                              <span className="text-lg font-bold text-purple-600">
                                {schedule.price} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowMentorDetails(false);
                    setSelectedMentor(null);
                  }}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
          </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Booking
              </h2>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session:</span>
                    <span className="font-semibold">{selectedSchedule.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(selectedSchedule.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {selectedSchedule.startTime} - {selectedSchedule.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{selectedSchedule.duration} min</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-200">
                    <span className="text-gray-900 font-semibold">Price:</span>
                    <span className="text-lg font-bold text-purple-600">
                      {selectedSchedule.price} points
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What would you like to discuss? (Optional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your goals, questions, or topics you'd like to cover..."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-blue-900">
                <p className="font-semibold mb-1">✨ What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Points will be deducted from your wallet</li>
                  <li>Mentor receives an approval request via email</li>
                  <li>Once approved, Zoom link will be sent to both parties</li>
                  <li>If declined, your points will be refunded</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSchedule(null);
                    setBookingNotes("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

