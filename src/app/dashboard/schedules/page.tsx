"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Schedule {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  sessionType: string;
  location: string;
  meetingLink?: string;
  address?: string;
  requirements: string[];
  skills: string[];
  maxBookings: number;
  currentBookings: number;
  isActive: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  professionalId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    company?: string;
    experience?: number;
    domain: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SchedulesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 30,
    price: 0,
    sessionType: "one-on-one",
    location: "online",
    meetingLink: "",
    address: "",
    requirements: [] as string[],
    skills: [] as string[],
    maxBookings: 1,
    isRecurring: false,
    recurringPattern: "weekly",
    recurringEndDate: "",
  });

  const sessionTypes = useMemo(() => [
    { value: "one-on-one", label: "One-on-One" },
    { value: "group", label: "Group" },
    { value: "workshop", label: "Workshop" },
    { value: "consultation", label: "Consultation" },
  ], []);

  const locations = useMemo(() => [
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-Person" },
  ], []);

  const commonSkills = useMemo(() => [
    "JavaScript", "Python", "React", "Node.js", "TypeScript", "Java",
    "Data Structures", "Algorithms", "System Design", "AWS", "Docker",
    "Machine Learning", "Web Development", "DevOps"
  ], []);

  const loadSchedules = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("professionalId", user._id);

      if (filterDate) {
        params.append("date", filterDate);
      }

      if (filterStatus !== "all") {
        params.append("isActive", (filterStatus === "active").toString());
      }

      const response = await fetch(`/api/schedules?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filterDate, filterStatus]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== "mentor") {
      router.push("/dashboard");
      return;
    }
    loadSchedules();
  }, [user, authLoading, router, loadSchedules]);

  const handleCreateSchedule = useCallback(async () => {
    if (
      !user ||
      !newSchedule.title.trim() ||
      !newSchedule.date ||
      !newSchedule.startTime ||
      !newSchedule.endTime
    )
      return;

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSchedule,
          professionalId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create schedule");
      }

      setNewSchedule({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        duration: 30,
        price: 0,
        sessionType: "one-on-one",
        location: "online",
        meetingLink: "",
        address: "",
        requirements: [],
        skills: [],
        maxBookings: 1,
        isRecurring: false,
        recurringPattern: "weekly",
        recurringEndDate: "",
      });
      setShowCreateForm(false);
      loadSchedules();
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create schedule"
      );
    }
  }, [user, loadSchedules, newSchedule]);

  const handleDeleteSchedule = useCallback(
    async (scheduleId: string) => {
      if (!user || !confirm("Delete this schedule?"))
        return;

      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ professionalId: user._id }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete schedule");
        }

        loadSchedules();
      } catch (error) {
        console.error("Failed to delete schedule:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete schedule"
        );
      }
    },
    [user, loadSchedules]
  );

  const toggleScheduleStatus = useCallback(
    async (scheduleId: string, isActive: boolean) => {
      if (!user) return;

      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professionalId: user._id,
            isActive: !isActive,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update schedule");
        }

        loadSchedules();
      } catch (error) {
        console.error("Failed to update schedule:", error);
        alert(
          error instanceof Error ? error.message : "Failed to update schedule"
        );
      }
    },
    [user, loadSchedules]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (authLoading || !user || user.role !== "mentor") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Schedules</h1>
            <p className="text-sm text-gray-500">Manage your availability</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showCreateForm
                ? "bg-gray-800 text-gray-400 border border-gray-700"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {showCreateForm ? "Cancel" : "+ New Schedule"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 focus:outline-none focus:border-gray-700"
          />
          <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="px-3 py-2 text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Create Schedule Form */}
        {showCreateForm && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
            <h2 className="text-lg font-semibold text-white mb-5">New Schedule</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Title *</label>
                <input
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., JavaScript Fundamentals"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Session Type</label>
                <select
                  value={newSchedule.sessionType}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, sessionType: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Date *</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Start *</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">End *</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={newSchedule.duration}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Price (pts)</label>
                  <input
                    type="number"
                    value={newSchedule.price}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Location</label>
                <select
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-600"
                >
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              {newSchedule.location === "online" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Meeting Link</label>
                  <input
                    value={newSchedule.meetingLink}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Description</label>
              <textarea
                value={newSchedule.description}
                onChange={(e) => setNewSchedule((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none"
                placeholder="What will you cover..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      const skills = newSchedule.skills.includes(skill)
                        ? newSchedule.skills.filter((s) => s !== skill)
                        : [...newSchedule.skills, skill];
                      setNewSchedule((prev) => ({ ...prev, skills }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      newSchedule.skills.includes(skill)
                        ? "bg-white text-black"
                        : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={!newSchedule.title.trim() || !newSchedule.date || !newSchedule.startTime || !newSchedule.endTime}
                className="px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Schedules List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-white mb-2">No Schedules</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first schedule</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-white">{schedule.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          !schedule.isActive
                            ? "bg-gray-800 text-gray-500 border-gray-700"
                            : schedule.currentBookings >= schedule.maxBookings
                            ? "bg-white text-black border-white"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {!schedule.isActive ? "Inactive" : schedule.currentBookings >= schedule.maxBookings ? "Full" : "Available"}
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="text-xs text-gray-500 mb-3">{schedule.description}</p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Date</span>
                          <p className="text-white mt-0.5">{formatDate(schedule.date)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time</span>
                          <p className="text-white mt-0.5">{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price</span>
                          <p className="text-amber-400 mt-0.5">{schedule.price} pts</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Bookings</span>
                          <p className="text-white mt-0.5">{schedule.currentBookings}/{schedule.maxBookings}</p>
                        </div>
                      </div>

                      {schedule.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {schedule.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] border border-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleScheduleStatus(schedule._id, schedule.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          schedule.isActive
                            ? "bg-gray-800 text-gray-400 hover:text-rose-400 border border-gray-700"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        }`}
                      >
                        {schedule.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
