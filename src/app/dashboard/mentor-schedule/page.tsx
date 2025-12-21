"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePolling } from "@/hooks/usePolling";
import { Booking } from "@/hooks/useBookings";
import { Schedule } from "@/hooks/useSchedules";
import { Calendar } from "@/components/ui/Calendar";

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
];

// Constants for scheduling limits
const MAX_SLOTS_PER_DAY = 12;
const MAX_SLOTS_PER_WEEK = 84;
const SESSION_DURATION = 30; // Fixed 30 minutes

export default function MentorSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"availability" | "slots" | "bookings">("availability");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [price, setPrice] = useState(100);

  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, { start: string; end: string }[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const fetchAvailability = useCallback(async () => {
    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/mentor-availability", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success && result.data) {
        setWeeklyAvailability((prev) => result.data.defaultAvailability || prev);
        setTimezone(result.data.timezone || "Asia/Kolkata");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch(`/api/schedules?professionalId=${user?._id}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setSchedules(result.data);
        if (selectedDate) {
          const filtered = result.data.filter((schedule: Schedule) => {
            const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
            return scheduleDate === selectedDate;
          });
          setFilteredSchedules(filtered);
        } else {
          setFilteredSchedules(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id, selectedDate]);

  const fetchBookings = useCallback(async () => {
    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch(`/api/bookings?professionalId=${user?._id}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [user?._id]);

  const refetchAll = useCallback(async () => {
    await Promise.all([fetchSchedules(), fetchBookings()]);
  }, [fetchSchedules, fetchBookings]);

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchBookings();
      fetchAvailability();
    }
  }, [user, fetchSchedules, fetchBookings, fetchAvailability]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
        return scheduleDate === selectedDate;
      });
      setFilteredSchedules(filtered);
    } else {
      setFilteredSchedules(schedules);
    }
  }, [selectedDate, schedules]);

  usePolling(refetchAll, {
    enabled: !!user,
    interval: 30000,
  });

  const toggleDayAvailability = (day: string, enabled: boolean) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: enabled ? [{ start: "09:00", end: "17:00" }] : [],
    }));
  };

  const updateTimeSlot = (day: string, field: "start" | "end", value: string) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: prev[day].length > 0 ? [{ ...prev[day][0], [field]: value }] : [{ start: "09:00", end: "17:00", [field]: value }],
    }));
  };

  const handleGenerateSlots = async () => {
    // Calculate how many slots would be generated
    let totalSlots = 0;
    Object.entries(weeklyAvailability).forEach(([, slots]) => {
      slots.forEach((slot) => {
        const [startHour, startMin] = slot.start.split(":").map(Number);
        const [endHour, endMin] = slot.end.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const slotsInRange = Math.floor((endMinutes - startMinutes) / SESSION_DURATION);
        totalSlots += slotsInRange;
      });
    });

    if (totalSlots > MAX_SLOTS_PER_WEEK) {
      alert(`Warning: Your availability would generate ${totalSlots} slots, but the weekly limit is ${MAX_SLOTS_PER_WEEK}. Only the first ${MAX_SLOTS_PER_WEEK} slots will be created.`);
    }

    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/mentor-availability", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          defaultAvailability: weeklyAvailability,
          timezone,
          duration: SESSION_DURATION,
          price,
          maxBookings: 1,
          daysToGenerate: 7,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.message}\n\nWeekly slots: ${result.data.weeklyTotal}/${MAX_SLOTS_PER_WEEK}`);
        fetchSchedules();
      } else {
        alert(result.error || "Failed to generate slots");
      }
    } catch (error) {
      console.error("Error generating slots:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Delete this slot?")) return;

    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch(`/api/schedules?scheduleId=${scheduleId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        fetchSchedules();
      } else {
        alert(result.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const toggleActive = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const { getAuthHeaders } = await import("@/lib/token-storage");
      const response = await fetch("/api/schedules", {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          scheduleId,
          isActive: !currentStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchSchedules();
      } else {
        alert(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  // Stats
  const activeSlots = filteredSchedules.filter((s) => s.isActive).length;
  const bookedSlots = filteredSchedules.reduce((sum, s) => sum + s.currentBookings, 0);
  const availableSlots = filteredSchedules.filter((s) => s.currentBookings < s.maxBookings && s.isActive).length;

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Schedule</h1>
          <p className="text-gray-400">Manage your availability and sessions</p>
        </div>

        {/* Limits Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Session limits:</span>
            <span className="text-white font-medium">{SESSION_DURATION} min/session</span>
            <span className="text-gray-600">·</span>
            <span className="text-white font-medium">Max {MAX_SLOTS_PER_DAY}/day</span>
            <span className="text-gray-600">·</span>
            <span className="text-white font-medium">Max {MAX_SLOTS_PER_WEEK}/week</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl mb-6 border border-gray-800">
          {[
            { key: "availability", label: "Set Hours" },
            { key: "slots", label: "My Slots" },
            { key: "bookings", label: "Bookings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="space-y-6">
            {/* Weekly Schedule */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Weekly Availability</h2>
              <p className="text-sm text-gray-400 mb-6">
                Set your available hours. Sessions will be auto-divided into {SESSION_DURATION}-minute slots.
              </p>

              <div className="space-y-4">
                {DAYS.map((day) => {
                  const daySlots = weeklyAvailability[day.key] || [];
                  const isEnabled = daySlots.length > 0;

                  return (
                    <div key={day.key} className="flex items-center gap-4">
                      {/* Day Toggle */}
                      <button
                        onClick={() => toggleDayAvailability(day.key, !isEnabled)}
                        className={`w-12 h-12 rounded-full font-semibold text-sm transition-all ${
                          isEnabled
                            ? "bg-white text-black"
                            : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                        }`}
                      >
                        {day.label}
                      </button>

                      {/* Time Range */}
                      {isEnabled ? (
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="time"
                            value={daySlots[0]?.start || "09:00"}
                            onChange={(e) => updateTimeSlot(day.key, "start", e.target.value)}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={daySlots[0]?.end || "17:00"}
                            onChange={(e) => updateTimeSlot(day.key, "end", e.target.value)}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                          />
                          <span className="text-xs text-gray-500 ml-2">
                            {(() => {
                              const [sh, sm] = (daySlots[0]?.start || "09:00").split(":").map(Number);
                              const [eh, em] = (daySlots[0]?.end || "17:00").split(":").map(Number);
                              const slots = Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / SESSION_DURATION);
                              return `${slots} slots`;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Settings */}
              <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price per session (points)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerateSlots}
                  className="w-full px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Generate Slots for This Week
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  This will create {SESSION_DURATION}-min slots based on your availability (max {MAX_SLOTS_PER_WEEK}/week)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === "slots" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-white">{activeSlots}</div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-white">{bookedSlots}</div>
                <div className="text-sm text-gray-400">Booked</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-green-500">{availableSlots}</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
            </div>

            {/* Calendar & Slots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-300 mb-4">Filter by Date</label>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                  minDate={new Date().toISOString().split("T")[0]}
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Slots List */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No slots found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
                    {filteredSchedules.map((schedule) => (
                      <div key={schedule._id} className="p-4 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(schedule.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              !schedule.isActive
                                ? "bg-gray-800 text-gray-500"
                                : schedule.currentBookings >= schedule.maxBookings
                                ? "bg-red-500/10 text-red-500"
                                : "bg-green-500/10 text-green-500"
                            }`}>
                              {!schedule.isActive ? "Off" : schedule.currentBookings >= schedule.maxBookings ? "Full" : "Open"}
                            </span>
                            <button
                              onClick={() => toggleActive(schedule._id, schedule.isActive)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={schedule.isActive ? "Deactivate" : "Activate"}
                            >
                              <svg className={`w-4 h-4 ${schedule.isActive ? "text-green-500" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(schedule._id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-yellow-500">{pendingBookings}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-white">{confirmedBookings}</div>
                <div className="text-sm text-gray-400">Confirmed</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl font-bold text-green-500">{completedBookings}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-2">No bookings yet</p>
                  <p className="text-gray-600 text-sm">Create slots and share with students</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold">
                            {typeof booking.studentId === "object" ? booking.studentId?.firstName?.charAt(0) || "S" : "S"}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {typeof booking.studentId === "object"
                                ? `${booking.studentId?.firstName || ""} ${booking.studentId?.lastName || ""}`
                                : "Student"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-white/10 text-white"
                            : booking.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : booking.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.meetingLink && booking.status === "confirmed" && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
