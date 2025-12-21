"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FaStar, FaTimes, FaClock, FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";
import { Calendar } from "@/components/ui/Calendar";

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
          .filter((mentor) => mentor.userId && mentor.isMentor && mentor.isApproved)
          .sort((a, b) => b.averageRating - a.averageRating || b.completedSessions - a.completedSessions);
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

  const filteredMentors = mentors.filter((mentor) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      mentor.headline?.toLowerCase().includes(q) ||
      mentor.expertise?.some((exp) => exp.toLowerCase().includes(q)) ||
      mentor.userId?.firstName?.toLowerCase().includes(q) ||
      mentor.userId?.lastName?.toLowerCase().includes(q) ||
      mentor.currentRole?.toLowerCase().includes(q) ||
      mentor.currentCompany?.toLowerCase().includes(q)
    );
  });

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Mentors</h1>
          <p className="text-gray-400">Connect with experienced professionals</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, expertise, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{mentors.length}</div>
            <div className="text-sm text-gray-400">Mentors</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-green-500">{mentors.filter((m) => m.zoomConnected).length}</div>
            <div className="text-sm text-gray-400">Available Now</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{new Set(mentors.flatMap((m) => m.expertise || [])).size}</div>
            <div className="text-sm text-gray-400">Expertise Areas</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{mentors.reduce((sum, m) => sum + (m.completedSessions || 0), 0)}</div>
            <div className="text-sm text-gray-400">Sessions Done</div>
          </div>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4" />
                <div className="h-4 bg-gray-800 rounded mb-2 w-3/4 mx-auto" />
                <div className="h-3 bg-gray-800 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {mentors.length === 0 ? "No mentors available" : "No mentors found"}
            </h3>
            <p className="text-gray-400">
              {mentors.length === 0 ? "Check back soon!" : "Try adjusting your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                onClick={() => viewMentorDetails(mentor)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all cursor-pointer group"
              >
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src={mentor.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((mentor.userId?.firstName || "") + " " + (mentor.userId?.lastName || ""))}&background=333&color=fff`}
                      alt=""
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full ring-2 ring-gray-800 group-hover:ring-gray-700"
                    />
                    {mentor.zoomConnected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {mentor.userId?.firstName} {mentor.userId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {mentor.headline || mentor.currentRole || "Mentor"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <FaStar className="text-yellow-500 w-3 h-3" />
                      <span className="text-sm text-white">{mentor.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({mentor.totalReviews})</span>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">+{mentor.expertise.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                  <span>{mentor.yearsOfExperience || 0}+ yrs exp</span>
                  <span>{mentor.completedSessions} sessions</span>
                </div>

                {/* Price */}
                {mentor.sessionTypes && mentor.sessionTypes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">From</span>
                    <span className="text-white font-semibold">
                      {Math.min(...mentor.sessionTypes.map((s) => s.price))} pts
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mentor Details Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-black p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={selectedMentor.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedMentor.userId?.firstName || "") + " " + (selectedMentor.userId?.lastName || ""))}&background=333&color=fff`}
                      alt=""
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full ring-2 ring-gray-700"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedMentor.userId?.firstName} {selectedMentor.userId?.lastName}
                      </h2>
                      <p className="text-gray-400">{selectedMentor.headline || selectedMentor.currentRole}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500 w-3 h-3" />
                          <span className="text-white">{selectedMentor.averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-400">{selectedMentor.completedSessions} sessions</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-400">{selectedMentor.yearsOfExperience}+ yrs</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-400 w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Bio */}
                {selectedMentor.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedMentor.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Session */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Book a Session</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Select Date</label>
                      <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateChange}
                        minDate={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {/* Slots */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Available Slots</label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        </div>
                      ) : !selectedDate ? (
                        <div className="text-center py-12">
                          <FaCalendarAlt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500">Select a date to view slots</p>
                        </div>
                      ) : schedules.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No slots available</p>
                          <p className="text-gray-600 text-sm mt-1">Try another date</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {schedules.map((schedule) => (
                            <button
                              key={schedule._id}
                              onClick={() => selectSchedule(schedule)}
                              className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FaClock className="text-gray-500 w-3 h-3" />
                                  <span className="text-white font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <span className="text-white font-semibold">{schedule.price} pts</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Booking</h2>

              <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{selectedSchedule.duration} min</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">{selectedSchedule.price} points</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                  rows={3}
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSchedule(null);
                    setBookingNotes("");
                  }}
                  disabled={isBooking}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                      Booking...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
